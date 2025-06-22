import { EventEmitter } from 'events';
export interface StreamingConfig {
    baseUrl: string;
    model: string;
    maxConnections?: number;
    keepAliveTimeout?: number;
    requestTimeout?: number;
    enableBatching?: boolean;
    batchSize?: number;
    batchTimeout?: number;
    enableCompression?: boolean;
}
export interface StreamingRequest {
    id: string;
    prompt: string;
    options?: {
        temperature?: number;
        top_p?: number;
        num_predict?: number;
        stop?: string[];
    };
    priority?: number;
    timeout?: number;
}
export interface StreamingResponse {
    id: string;
    content: string;
    done: boolean;
    tokens?: number;
    duration?: number;
    error?: string;
}
export interface BatchRequest {
    requests: StreamingRequest[];
    batchId: string;
    createdAt: number;
}
/**
 * High-performance streaming Ollama client with connection pooling and request optimization
 */
export declare class StreamingOllamaClient extends EventEmitter {
    private config;
    private httpAgent;
    private requestQueue;
    private batchQueue;
    private activeRequests;
    private batchTimer;
    private connectionPool;
    private metrics;
    constructor(config: StreamingConfig);
    /**
     * Stream a single AI request with real-time response chunks
     */
    streamRequest(request: StreamingRequest): Promise<AsyncGenerator<StreamingResponse, void, unknown>>;
    /**
     * Add request to batch queue for efficient processing
     */
    batchRequest(request: StreamingRequest): Promise<Promise<string>>;
    /**
     * Execute multiple requests concurrently with throttling
     */
    executeConcurrent(requests: StreamingRequest[], maxConcurrency?: number): Promise<Map<string, string>>;
    /**
     * Get optimized prompt template from cache or create new one
     */
    getOptimizedPrompt(template: string, variables: Record<string, any>): string;
    /**
     * Cancel a specific request
     */
    cancelRequest(requestId: string): boolean;
    /**
     * Get current performance metrics
     */
    getMetrics(): {
        connectionPoolSize: number;
        activeRequests: number;
        queueLength: number;
        totalRequests: number;
        streamingRequests: number;
        batchedRequests: number;
        avgResponseTime: number;
        errorRate: number;
    };
    /**
     * Shutdown client and cleanup resources
     */
    shutdown(): Promise<void>;
    /**
     * Initialize HTTP connection pool for optimal performance
     */
    private initializeConnectionPool;
    /**
     * Process streaming response chunks as they arrive
     */
    private processStreamingResponse;
    /**
     * Start batch processing timer
     */
    private startBatchProcessor;
    /**
     * Process queued requests in batches
     */
    private processBatch;
    /**
     * Update performance metrics
     */
    private updateMetrics;
}
//# sourceMappingURL=streaming-ollama-client.d.ts.map