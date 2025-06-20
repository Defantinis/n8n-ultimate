/**
 * n8n Integration Patterns and Best Practices
 *
 * This module implements proven patterns for integrating with n8n workflows,
 * based on community best practices and official recommendations.
 */
import { createHmac, timingSafeEqual } from 'crypto';
/**
 * Default integration configuration following best practices
 */
export const DEFAULT_INTEGRATION_CONFIG = {
    n8nBaseUrl: 'http://localhost:5678',
    timeout: 30000, // 30 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
    enableCaching: true,
    enableMetrics: true,
    logLevel: 'info'
};
/**
 * Authentication Patterns
 * Implements secure authentication patterns for n8n API integration
 */
export class N8nAuthManager {
    config;
    tokenCache = new Map();
    constructor(config) {
        this.config = config;
    }
    /**
     * JWT-based authentication pattern
     */
    async authenticate(credentials) {
        try {
            const response = await fetch(`${this.config.n8nBaseUrl}/rest/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });
            if (!response.ok) {
                throw new Error(`Authentication failed: ${response.statusText}`);
            }
            const data = await response.json();
            const token = data.data?.token;
            if (!token) {
                throw new Error('No token received from authentication');
            }
            // Cache token with expiration
            const expires = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
            this.tokenCache.set('default', { token, expires });
            return token;
        }
        catch (error) {
            throw new Error(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Get cached or fresh authentication token
     */
    async getValidToken(credentials) {
        const cached = this.tokenCache.get('default');
        if (cached && cached.expires > new Date()) {
            return cached.token;
        }
        if (!credentials) {
            throw new Error('No valid token cached and no credentials provided');
        }
        return this.authenticate(credentials);
    }
    /**
     * API Key authentication pattern
     */
    getAuthHeaders(token) {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.config.apiKey) {
            headers['X-N8N-API-KEY'] = this.config.apiKey;
        }
        else if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }
}
/**
 * Error Handling Patterns
 * Implements robust error handling with retry mechanisms
 */
export class N8nErrorHandler {
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    /**
     * Retry mechanism with exponential backoff
     */
    async withRetry(operation, context = 'operation') {
        let lastError;
        for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                this.logger.warn(`${context} failed (attempt ${attempt}/${this.config.retryAttempts}): ${lastError.message}`);
                if (attempt === this.config.retryAttempts) {
                    break;
                }
                // Exponential backoff
                const delay = this.config.retryDelay * Math.pow(2, attempt - 1);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        this.logger.error(`${context} failed after ${this.config.retryAttempts} attempts: ${lastError.message}`);
        throw lastError;
    }
    /**
     * Categorize and handle different types of errors
     */
    categorizeError(error) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            return {
                type: 'network',
                recoverable: true,
                message: 'Network connection failed'
            };
        }
        if (error.status === 401 || error.status === 403) {
            return {
                type: 'authentication',
                recoverable: true,
                message: 'Authentication failed'
            };
        }
        if (error.status === 400 || error.status === 422) {
            return {
                type: 'validation',
                recoverable: false,
                message: 'Request validation failed'
            };
        }
        if (error.status >= 500) {
            return {
                type: 'execution',
                recoverable: true,
                message: 'Server execution error'
            };
        }
        return {
            type: 'unknown',
            recoverable: false,
            message: error.message || 'Unknown error occurred'
        };
    }
}
/**
 * Performance Optimization Patterns
 * Implements caching, batching, and parallel processing
 */
export class N8nPerformanceOptimizer {
    cache = new Map();
    config;
    constructor(config) {
        this.config = config;
    }
    /**
     * Caching mechanism for frequently accessed data
     */
    async withCache(key, operation, ttlMinutes = 5) {
        if (!this.config.enableCaching) {
            return operation();
        }
        const cached = this.cache.get(key);
        if (cached && cached.expires > new Date()) {
            return cached.data;
        }
        const data = await operation();
        const expires = new Date(Date.now() + (ttlMinutes * 60 * 1000));
        this.cache.set(key, { data, expires });
        return data;
    }
    /**
     * Batch processing for multiple operations
     */
    async batchProcess(items, processor, batchSize = 10) {
        const results = [];
        for (let i = 0; i < items.length; i += batchSize) {
            const batch = items.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(item => processor(item)));
            results.push(...batchResults);
        }
        return results;
    }
    /**
     * Parallel processing with concurrency control
     */
    async parallelProcess(items, processor, maxConcurrency = 5) {
        const results = new Array(items.length);
        const executing = [];
        for (let i = 0; i < items.length; i++) {
            const promise = processor(items[i]).then(result => {
                results[i] = result;
            });
            executing.push(promise);
            if (executing.length >= maxConcurrency) {
                await Promise.race(executing);
                executing.splice(executing.findIndex(p => p === promise), 1);
            }
        }
        await Promise.all(executing);
        return results;
    }
    /**
     * Clear cache (useful for testing or memory management)
     */
    clearCache() {
        this.cache.clear();
    }
}
/**
 * Monitoring and Metrics Patterns
 * Implements comprehensive monitoring for n8n integrations
 */
export class N8nMonitor {
    metrics = new Map();
    config;
    logger;
    constructor(config, logger) {
        this.config = config;
        this.logger = logger;
    }
    /**
     * Track execution metrics
     */
    trackExecution(workflowId, duration, success) {
        if (!this.config.enableMetrics)
            return;
        const key = `workflow_${workflowId}`;
        this.metrics.set(`${key}_executions`, (this.metrics.get(`${key}_executions`) || 0) + 1);
        this.metrics.set(`${key}_total_duration`, (this.metrics.get(`${key}_total_duration`) || 0) + duration);
        if (success) {
            this.metrics.set(`${key}_successes`, (this.metrics.get(`${key}_successes`) || 0) + 1);
        }
        else {
            this.metrics.set(`${key}_failures`, (this.metrics.get(`${key}_failures`) || 0) + 1);
        }
    }
    /**
     * Get performance metrics for a workflow
     */
    getWorkflowMetrics(workflowId) {
        const key = `workflow_${workflowId}`;
        const executions = this.metrics.get(`${key}_executions`) || 0;
        const successes = this.metrics.get(`${key}_successes`) || 0;
        const failures = this.metrics.get(`${key}_failures`) || 0;
        const totalDuration = this.metrics.get(`${key}_total_duration`) || 0;
        return {
            executions,
            successes,
            failures,
            successRate: executions > 0 ? (successes / executions) * 100 : 0,
            averageDuration: executions > 0 ? totalDuration / executions : 0
        };
    }
    /**
     * Monitor workflow execution with detailed logging
     */
    async monitorExecution(workflowId, operation) {
        const startTime = Date.now();
        this.logger.info(`Starting execution for workflow ${workflowId}`);
        try {
            const result = await operation();
            const duration = Date.now() - startTime;
            this.trackExecution(workflowId, duration, true);
            this.logger.info(`Workflow ${workflowId} completed successfully in ${duration}ms`);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            this.trackExecution(workflowId, duration, false);
            this.logger.error(`Workflow ${workflowId} failed after ${duration}ms: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    }
}
/**
 * Webhook and Trigger Best Practices
 * Implements secure and efficient webhook handling
 */
export class N8nWebhookHandler {
    config;
    logger;
    cache;
    constructor(config, logger, cache) {
        this.config = config;
        this.logger = logger;
        this.cache = cache;
    }
    /**
     * Validate webhook signature for security
     */
    validateWebhookSignature(payload, signature, secret) {
        const expectedSignature = createHmac('sha256', secret)
            .update(payload)
            .digest('hex');
        return timingSafeEqual(Buffer.from(signature), Buffer.from(`sha256=${expectedSignature}`));
    }
    /**
     * Process webhook with rate limiting and validation
     */
    async processWebhook(request, handler) {
        try {
            // Validate content type
            if (!request.headers['content-type']?.includes('application/json')) {
                throw new Error('Invalid content type');
            }
            // Process with caching to prevent duplicate processing
            const cacheKey = `webhook_${request.headers['x-webhook-id'] || Date.now()}`;
            const result = await this.cache.withCache(cacheKey, () => handler(request.body), 1 // 1 minute cache to prevent duplicates
            );
            this.logger.info(`Webhook processed successfully: ${cacheKey}`);
            return { success: true, data: result };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            this.logger.error(`Webhook processing failed: ${errorMessage}`);
            return { success: false, error: errorMessage };
        }
    }
    /**
     * Create webhook endpoint configuration
     */
    createWebhookConfig(workflowId, path, method = 'POST') {
        return {
            url: `${this.config.n8nBaseUrl}/webhook/${path}`,
            method,
            headers: {
                'Content-Type': 'application/json',
                'X-Workflow-ID': workflowId
            }
        };
    }
}
/**
 * Simple console logger implementation
 */
export class ConsoleLogger {
    logLevel;
    constructor(logLevel = 'info') {
        this.logLevel = logLevel;
    }
    shouldLog(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.indexOf(level) >= levels.indexOf(this.logLevel);
    }
    debug(message, meta) {
        if (this.shouldLog('debug')) {
            console.debug(`[DEBUG] ${message}`, meta || '');
        }
    }
    info(message, meta) {
        if (this.shouldLog('info')) {
            console.info(`[INFO] ${message}`, meta || '');
        }
    }
    warn(message, meta) {
        if (this.shouldLog('warn')) {
            console.warn(`[WARN] ${message}`, meta || '');
        }
    }
    error(message, meta) {
        if (this.shouldLog('error')) {
            console.error(`[ERROR] ${message}`, meta || '');
        }
    }
}
/**
 * Integration Manager
 * Main class that orchestrates all integration patterns
 */
export class N8nIntegrationManager {
    config;
    auth;
    errorHandler;
    optimizer;
    monitor;
    webhookHandler;
    logger;
    constructor(config = {}) {
        this.config = { ...DEFAULT_INTEGRATION_CONFIG, ...config };
        this.logger = new ConsoleLogger(this.config.logLevel);
        this.auth = new N8nAuthManager(this.config);
        this.errorHandler = new N8nErrorHandler(this.config, this.logger);
        this.optimizer = new N8nPerformanceOptimizer(this.config);
        this.monitor = new N8nMonitor(this.config, this.logger);
        this.webhookHandler = new N8nWebhookHandler(this.config, this.logger, this.optimizer);
    }
    /**
     * Get authentication manager
     */
    getAuth() {
        return this.auth;
    }
    /**
     * Get error handler
     */
    getErrorHandler() {
        return this.errorHandler;
    }
    /**
     * Get performance optimizer
     */
    getOptimizer() {
        return this.optimizer;
    }
    /**
     * Get monitor
     */
    getMonitor() {
        return this.monitor;
    }
    /**
     * Get webhook handler
     */
    getWebhookHandler() {
        return this.webhookHandler;
    }
    /**
     * Get logger
     */
    getLogger() {
        return this.logger;
    }
    /**
     * Execute workflow with full integration pattern support
     */
    async executeWorkflow(workflowId, inputData, credentials) {
        return this.monitor.monitorExecution(workflowId, async () => {
            return this.errorHandler.withRetry(async () => {
                const token = await this.auth.getValidToken(credentials);
                const headers = this.auth.getAuthHeaders(token);
                const response = await fetch(`${this.config.n8nBaseUrl}/rest/workflows/${workflowId}/execute`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ data: inputData }),
                    signal: AbortSignal.timeout(this.config.timeout)
                });
                if (!response.ok) {
                    throw new Error(`Workflow execution failed: ${response.statusText}`);
                }
                return response.json();
            }, `workflow execution ${workflowId}`);
        });
    }
    /**
     * Validate workflow with comprehensive checks
     */
    async validateWorkflow(workflow) {
        const errors = [];
        const warnings = [];
        let compatibilityScore = 100;
        try {
            // Basic structure validation
            if (!workflow.nodes || workflow.nodes.length === 0) {
                errors.push('Workflow must contain at least one node');
                compatibilityScore -= 20;
            }
            if (!workflow.connections) {
                warnings.push('Workflow has no connections defined');
                compatibilityScore -= 5;
            }
            // Node validation
            for (const node of workflow.nodes || []) {
                if (!node.type) {
                    errors.push(`Node ${node.name} is missing type`);
                    compatibilityScore -= 10;
                }
                if (!node.position) {
                    warnings.push(`Node ${node.name} is missing position`);
                    compatibilityScore -= 2;
                }
            }
            // Connection validation
            if (workflow.connections) {
                for (const nodeId of Object.keys(workflow.connections)) {
                    if (!workflow.nodes?.find(n => n.name === nodeId)) {
                        errors.push(`Connection references non-existent node: ${nodeId}`);
                        compatibilityScore -= 15;
                    }
                }
            }
            return {
                valid: errors.length === 0,
                errors,
                warnings,
                compatibilityScore: Math.max(0, compatibilityScore)
            };
        }
        catch (error) {
            errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return {
                valid: false,
                errors,
                warnings,
                compatibilityScore: 0
            };
        }
    }
}
/**
 * Testing Utilities
 * Provides utilities for testing n8n integrations
 */
export class N8nTestUtils {
    integrationManager;
    constructor(integrationManager) {
        this.integrationManager = integrationManager;
    }
    /**
     * Create mock workflow for testing
     */
    createMockWorkflow(nodeCount = 3) {
        const nodes = [];
        const connections = {};
        for (let i = 0; i < nodeCount; i++) {
            const nodeName = `Node${i}`;
            nodes.push({
                id: `node-${i}`,
                name: nodeName,
                type: i === 0 ? 'n8n-nodes-base.start' : 'n8n-nodes-base.set',
                typeVersion: 1,
                position: [100 + (i * 200), 100],
                parameters: {}
            });
            if (i > 0) {
                connections[`Node${i - 1}`] = {
                    main: [[{ node: nodeName, type: 'main', index: 0 }]]
                };
            }
        }
        return {
            id: 'test-workflow',
            name: 'Test Workflow',
            nodes,
            connections,
            active: false,
            settings: {},
            meta: {},
            tags: [],
            versionId: '1'
        };
    }
    /**
     * Mock HTTP responses for testing
     */
    createMockResponse(data, status = 200) {
        return new Response(JSON.stringify(data), {
            status,
            headers: { 'Content-Type': 'application/json' }
        });
    }
    /**
     * Test workflow validation
     */
    async testWorkflowValidation(workflow) {
        const result = await this.integrationManager.validateWorkflow(workflow);
        return result.valid && result.compatibilityScore > 80;
    }
}
//# sourceMappingURL=integration-patterns.js.map