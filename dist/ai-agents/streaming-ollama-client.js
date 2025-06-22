import { EventEmitter } from 'events';
import { Agent as HttpAgent } from 'http';
import { Agent as HttpsAgent } from 'https';
/**
 * High-performance streaming Ollama client with connection pooling and request optimization
 */
export class StreamingOllamaClient extends EventEmitter {
    config;
    httpAgent;
    requestQueue = [];
    batchQueue = [];
    activeRequests = new Map();
    batchTimer = null;
    connectionPool = new Set();
    metrics = {
        totalRequests: 0,
        streamingRequests: 0,
        batchedRequests: 0,
        avgResponseTime: 0,
        connectionPoolSize: 0,
        queueLength: 0,
        errorRate: 0
    };
    constructor(config) {
        super();
        this.config = {
            maxConnections: 10,
            keepAliveTimeout: 30000,
            requestTimeout: 30000,
            enableBatching: true,
            batchSize: 5,
            batchTimeout: 100,
            enableCompression: true,
            ...config
        };
        this.initializeConnectionPool();
        this.startBatchProcessor();
    }
    /**
     * Stream a single AI request with real-time response chunks
     */
    async streamRequest(request) {
        const controller = new AbortController();
        this.activeRequests.set(request.id, controller);
        const startTime = Date.now();
        this.metrics.totalRequests++;
        this.metrics.streamingRequests++;
        try {
            const response = await fetch(`${this.config.baseUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/x-ndjson',
                    ...(this.config.enableCompression && { 'Accept-Encoding': 'gzip, deflate' })
                },
                body: JSON.stringify({
                    model: this.config.model,
                    prompt: request.prompt,
                    stream: true,
                    options: request.options || {}
                }),
                signal: controller.signal,
                // @ts-ignore - agent property exists
                agent: this.httpAgent
            });
            if (!response.ok) {
                throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
            }
            return this.processStreamingResponse(request.id, response, startTime);
        }
        catch (error) {
            this.metrics.errorRate = (this.metrics.errorRate + 1) / this.metrics.totalRequests;
            this.activeRequests.delete(request.id);
            throw error;
        }
    }
    /**
     * Add request to batch queue for efficient processing
     */
    async batchRequest(request) {
        return new Promise((resolve, reject) => {
            const enhancedRequest = {
                ...request,
                resolve,
                reject,
                timestamp: Date.now()
            };
            this.requestQueue.push(enhancedRequest);
            this.metrics.queueLength = this.requestQueue.length;
            // Trigger immediate batch processing if queue is full
            if (this.requestQueue.length >= (this.config.batchSize || 5)) {
                this.processBatch();
            }
        });
    }
    /**
     * Execute multiple requests concurrently with throttling
     */
    async executeConcurrent(requests, maxConcurrency = 3) {
        const results = new Map();
        const semaphore = new Array(maxConcurrency).fill(null);
        let index = 0;
        const processRequest = async (request) => {
            try {
                let fullResponse = '';
                const generator = await this.streamRequest(request);
                for await (const chunk of generator) {
                    fullResponse += chunk.content;
                    if (chunk.done)
                        break;
                }
                results.set(request.id, fullResponse);
            }
            catch (error) {
                results.set(request.id, `Error: ${error}`);
            }
        };
        const workers = semaphore.map(async () => {
            while (index < requests.length) {
                const currentIndex = index++;
                if (currentIndex < requests.length) {
                    await processRequest(requests[currentIndex]);
                }
            }
        });
        await Promise.all(workers);
        return results;
    }
    /**
     * Get optimized prompt template from cache or create new one
     */
    getOptimizedPrompt(template, variables) {
        // Simple template replacement with optimization
        let optimized = template;
        for (const [key, value] of Object.entries(variables)) {
            const placeholder = `{{${key}}}`;
            optimized = optimized.replace(new RegExp(placeholder, 'g'), String(value));
        }
        // Remove excessive whitespace and optimize structure
        optimized = optimized
            .replace(/\n\s*\n\s*\n/g, '\n\n')
            .replace(/\s+/g, ' ')
            .trim();
        return optimized;
    }
    /**
     * Cancel a specific request
     */
    cancelRequest(requestId) {
        const controller = this.activeRequests.get(requestId);
        if (controller) {
            controller.abort();
            this.activeRequests.delete(requestId);
            return true;
        }
        return false;
    }
    /**
     * Get current performance metrics
     */
    getMetrics() {
        return {
            ...this.metrics,
            connectionPoolSize: this.connectionPool.size,
            activeRequests: this.activeRequests.size,
            queueLength: this.requestQueue.length
        };
    }
    /**
     * Shutdown client and cleanup resources
     */
    async shutdown() {
        // Cancel all active requests
        for (const [id, controller] of this.activeRequests) {
            controller.abort();
        }
        this.activeRequests.clear();
        // Clear batch timer
        if (this.batchTimer) {
            clearTimeout(this.batchTimer);
        }
        // Destroy HTTP agent
        if (this.httpAgent) {
            this.httpAgent.destroy();
        }
        this.emit('shutdown');
    }
    /**
     * Initialize HTTP connection pool for optimal performance
     */
    initializeConnectionPool() {
        const isHttps = this.config.baseUrl.startsWith('https');
        const agentOptions = {
            keepAlive: true,
            keepAliveMsecs: this.config.keepAliveTimeout,
            maxSockets: this.config.maxConnections,
            maxFreeSockets: Math.floor((this.config.maxConnections || 10) / 2),
            timeout: this.config.requestTimeout,
            scheduling: 'fifo'
        };
        this.httpAgent = isHttps
            ? new HttpsAgent(agentOptions)
            : new HttpAgent(agentOptions);
        this.metrics.connectionPoolSize = this.config.maxConnections || 10;
    }
    /**
     * Process streaming response chunks as they arrive
     */
    async *processStreamingResponse(requestId, response, startTime) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        if (!reader) {
            throw new Error('No response body reader available');
        }
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done)
                    break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';
                for (const line of lines) {
                    if (line.trim()) {
                        try {
                            const chunk = JSON.parse(line);
                            yield {
                                id: requestId,
                                content: chunk.response || '',
                                done: chunk.done || false,
                                tokens: chunk.eval_count,
                                duration: Date.now() - startTime
                            };
                            if (chunk.done) {
                                this.updateMetrics(Date.now() - startTime);
                                this.activeRequests.delete(requestId);
                                return;
                            }
                        }
                        catch (parseError) {
                            // Skip invalid JSON lines
                            continue;
                        }
                    }
                }
            }
        }
        finally {
            reader.releaseLock();
            this.activeRequests.delete(requestId);
        }
    }
    /**
     * Start batch processing timer
     */
    startBatchProcessor() {
        if (!this.config.enableBatching)
            return;
        const processBatches = () => {
            if (this.requestQueue.length > 0) {
                this.processBatch();
            }
            this.batchTimer = setTimeout(processBatches, this.config.batchTimeout || 100);
        };
        processBatches();
    }
    /**
     * Process queued requests in batches
     */
    async processBatch() {
        if (this.requestQueue.length === 0)
            return;
        const batchSize = Math.min(this.requestQueue.length, this.config.batchSize || 5);
        const batch = this.requestQueue.splice(0, batchSize);
        this.metrics.batchedRequests += batch.length;
        this.metrics.queueLength = this.requestQueue.length;
        // Process batch concurrently
        const promises = batch.map(async (request) => {
            try {
                let fullResponse = '';
                const generator = await this.streamRequest(request);
                for await (const chunk of generator) {
                    fullResponse += chunk.content;
                    if (chunk.done)
                        break;
                }
                request.resolve(fullResponse);
            }
            catch (error) {
                request.reject(error);
            }
        });
        await Promise.allSettled(promises);
    }
    /**
     * Update performance metrics
     */
    updateMetrics(responseTime) {
        const currentAvg = this.metrics.avgResponseTime;
        const totalRequests = this.metrics.totalRequests;
        this.metrics.avgResponseTime = (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;
    }
}
//# sourceMappingURL=streaming-ollama-client.js.map