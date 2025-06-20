/**
 * n8n Integration Patterns and Best Practices
 *
 * This module implements proven patterns for integrating with n8n workflows,
 * based on community best practices and official recommendations.
 */
import { N8nWorkflow } from '../types/n8n-workflow';
/**
 * Integration Configuration
 */
export interface IntegrationConfig {
    n8nBaseUrl: string;
    apiKey?: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
    enableCaching: boolean;
    enableMetrics: boolean;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
/**
 * Default integration configuration following best practices
 */
export declare const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig;
/**
 * Authentication Patterns
 * Implements secure authentication patterns for n8n API integration
 */
export declare class N8nAuthManager {
    private config;
    private tokenCache;
    constructor(config: IntegrationConfig);
    /**
     * JWT-based authentication pattern
     */
    authenticate(credentials: {
        email: string;
        password: string;
    }): Promise<string>;
    /**
     * Get cached or fresh authentication token
     */
    getValidToken(credentials?: {
        email: string;
        password: string;
    }): Promise<string>;
    /**
     * API Key authentication pattern
     */
    getAuthHeaders(token?: string): Record<string, string>;
}
/**
 * Error Handling Patterns
 * Implements robust error handling with retry mechanisms
 */
export declare class N8nErrorHandler {
    private config;
    private logger;
    constructor(config: IntegrationConfig, logger: N8nLogger);
    /**
     * Retry mechanism with exponential backoff
     */
    withRetry<T>(operation: () => Promise<T>, context?: string): Promise<T>;
    /**
     * Categorize and handle different types of errors
     */
    categorizeError(error: any): {
        type: 'network' | 'authentication' | 'validation' | 'execution' | 'unknown';
        recoverable: boolean;
        message: string;
    };
}
/**
 * Performance Optimization Patterns
 * Implements caching, batching, and parallel processing
 */
export declare class N8nPerformanceOptimizer {
    private cache;
    private config;
    constructor(config: IntegrationConfig);
    /**
     * Caching mechanism for frequently accessed data
     */
    withCache<T>(key: string, operation: () => Promise<T>, ttlMinutes?: number): Promise<T>;
    /**
     * Batch processing for multiple operations
     */
    batchProcess<T, R>(items: T[], processor: (item: T) => Promise<R>, batchSize?: number): Promise<R[]>;
    /**
     * Parallel processing with concurrency control
     */
    parallelProcess<T, R>(items: T[], processor: (item: T) => Promise<R>, maxConcurrency?: number): Promise<R[]>;
    /**
     * Clear cache (useful for testing or memory management)
     */
    clearCache(): void;
}
/**
 * Monitoring and Metrics Patterns
 * Implements comprehensive monitoring for n8n integrations
 */
export declare class N8nMonitor {
    private metrics;
    private config;
    private logger;
    constructor(config: IntegrationConfig, logger: N8nLogger);
    /**
     * Track execution metrics
     */
    trackExecution(workflowId: string, duration: number, success: boolean): void;
    /**
     * Get performance metrics for a workflow
     */
    getWorkflowMetrics(workflowId: string): {
        executions: number;
        successes: number;
        failures: number;
        successRate: number;
        averageDuration: number;
    };
    /**
     * Monitor workflow execution with detailed logging
     */
    monitorExecution<T>(workflowId: string, operation: () => Promise<T>): Promise<T>;
}
/**
 * Webhook and Trigger Best Practices
 * Implements secure and efficient webhook handling
 */
export declare class N8nWebhookHandler {
    private config;
    private logger;
    private cache;
    constructor(config: IntegrationConfig, logger: N8nLogger, cache: N8nPerformanceOptimizer);
    /**
     * Validate webhook signature for security
     */
    validateWebhookSignature(payload: string, signature: string, secret: string): boolean;
    /**
     * Process webhook with rate limiting and validation
     */
    processWebhook(request: {
        headers: Record<string, string>;
        body: any;
    }, handler: (data: any) => Promise<any>): Promise<{
        success: boolean;
        data?: any;
        error?: string;
    }>;
    /**
     * Create webhook endpoint configuration
     */
    createWebhookConfig(workflowId: string, path: string, method?: 'GET' | 'POST' | 'PUT' | 'DELETE'): {
        url: string;
        method: string;
        headers: Record<string, string>;
    };
}
/**
 * Logging Interface
 */
export interface N8nLogger {
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
/**
 * Simple console logger implementation
 */
export declare class ConsoleLogger implements N8nLogger {
    private logLevel;
    constructor(logLevel?: string);
    private shouldLog;
    debug(message: string, meta?: any): void;
    info(message: string, meta?: any): void;
    warn(message: string, meta?: any): void;
    error(message: string, meta?: any): void;
}
/**
 * Integration Manager
 * Main class that orchestrates all integration patterns
 */
export declare class N8nIntegrationManager {
    private config;
    private auth;
    private errorHandler;
    private optimizer;
    private monitor;
    private webhookHandler;
    private logger;
    constructor(config?: Partial<IntegrationConfig>);
    /**
     * Get authentication manager
     */
    getAuth(): N8nAuthManager;
    /**
     * Get error handler
     */
    getErrorHandler(): N8nErrorHandler;
    /**
     * Get performance optimizer
     */
    getOptimizer(): N8nPerformanceOptimizer;
    /**
     * Get monitor
     */
    getMonitor(): N8nMonitor;
    /**
     * Get webhook handler
     */
    getWebhookHandler(): N8nWebhookHandler;
    /**
     * Get logger
     */
    getLogger(): N8nLogger;
    /**
     * Execute workflow with full integration pattern support
     */
    executeWorkflow(workflowId: string, inputData?: any, credentials?: {
        email: string;
        password: string;
    }): Promise<any>;
    /**
     * Validate workflow with comprehensive checks
     */
    validateWorkflow(workflow: N8nWorkflow): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
        compatibilityScore: number;
    }>;
}
/**
 * Testing Utilities
 * Provides utilities for testing n8n integrations
 */
export declare class N8nTestUtils {
    private integrationManager;
    constructor(integrationManager: N8nIntegrationManager);
    /**
     * Create mock workflow for testing
     */
    createMockWorkflow(nodeCount?: number): N8nWorkflow;
    /**
     * Mock HTTP responses for testing
     */
    createMockResponse(data: any, status?: number): Response;
    /**
     * Test workflow validation
     */
    testWorkflowValidation(workflow: N8nWorkflow): Promise<boolean>;
}
//# sourceMappingURL=integration-patterns.d.ts.map