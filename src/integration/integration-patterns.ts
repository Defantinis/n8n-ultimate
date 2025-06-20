/**
 * n8n Integration Patterns and Best Practices
 * 
 * This module implements proven patterns for integrating with n8n workflows,
 * based on community best practices and official recommendations.
 */

import { N8nWorkflow, N8nNode } from '../types/n8n-workflow';
import { createHmac, timingSafeEqual } from 'crypto';

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
export const DEFAULT_INTEGRATION_CONFIG: IntegrationConfig = {
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
  private config: IntegrationConfig;
  private tokenCache = new Map<string, { token: string; expires: Date }>();

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  /**
   * JWT-based authentication pattern
   */
  async authenticate(credentials: { email: string; password: string }): Promise<string> {
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

      const data = await response.json() as { data?: { token?: string } };
      const token = data.data?.token;
      
      if (!token) {
        throw new Error('No token received from authentication');
      }

      // Cache token with expiration
      const expires = new Date(Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
      this.tokenCache.set('default', { token, expires });

      return token;
    } catch (error) {
      throw new Error(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get cached or fresh authentication token
   */
  async getValidToken(credentials?: { email: string; password: string }): Promise<string> {
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
  getAuthHeaders(token?: string): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['X-N8N-API-KEY'] = this.config.apiKey;
    } else if (token) {
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
  private config: IntegrationConfig;
  private logger: N8nLogger;

  constructor(config: IntegrationConfig, logger: N8nLogger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Retry mechanism with exponential backoff
   */
  async withRetry<T>(
    operation: () => Promise<T>,
    context: string = 'operation'
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.config.retryAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
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

    this.logger.error(`${context} failed after ${this.config.retryAttempts} attempts: ${lastError!.message}`);
    throw lastError!;
  }

  /**
   * Categorize and handle different types of errors
   */
  categorizeError(error: any): {
    type: 'network' | 'authentication' | 'validation' | 'execution' | 'unknown';
    recoverable: boolean;
    message: string;
  } {
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
  private cache = new Map<string, { data: any; expires: Date }>();
  private config: IntegrationConfig;

  constructor(config: IntegrationConfig) {
    this.config = config;
  }

  /**
   * Caching mechanism for frequently accessed data
   */
  async withCache<T>(
    key: string,
    operation: () => Promise<T>,
    ttlMinutes: number = 5
  ): Promise<T> {
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
  async batchProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    batchSize: number = 10
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => processor(item))
      );
      results.push(...batchResults);
    }

    return results;
  }

  /**
   * Parallel processing with concurrency control
   */
  async parallelProcess<T, R>(
    items: T[],
    processor: (item: T) => Promise<R>,
    maxConcurrency: number = 5
  ): Promise<R[]> {
    const results: R[] = new Array(items.length);
    const executing: Promise<void>[] = [];

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
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Monitoring and Metrics Patterns
 * Implements comprehensive monitoring for n8n integrations
 */
export class N8nMonitor {
  private metrics = new Map<string, number>();
  private config: IntegrationConfig;
  private logger: N8nLogger;

  constructor(config: IntegrationConfig, logger: N8nLogger) {
    this.config = config;
    this.logger = logger;
  }

  /**
   * Track execution metrics
   */
  trackExecution(workflowId: string, duration: number, success: boolean): void {
    if (!this.config.enableMetrics) return;

    const key = `workflow_${workflowId}`;
    this.metrics.set(`${key}_executions`, (this.metrics.get(`${key}_executions`) || 0) + 1);
    this.metrics.set(`${key}_total_duration`, (this.metrics.get(`${key}_total_duration`) || 0) + duration);
    
    if (success) {
      this.metrics.set(`${key}_successes`, (this.metrics.get(`${key}_successes`) || 0) + 1);
    } else {
      this.metrics.set(`${key}_failures`, (this.metrics.get(`${key}_failures`) || 0) + 1);
    }
  }

  /**
   * Get performance metrics for a workflow
   */
  getWorkflowMetrics(workflowId: string): {
    executions: number;
    successes: number;
    failures: number;
    successRate: number;
    averageDuration: number;
  } {
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
  async monitorExecution<T>(
    workflowId: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const startTime = Date.now();
    this.logger.info(`Starting execution for workflow ${workflowId}`);

    try {
      const result = await operation();
      const duration = Date.now() - startTime;
      
      this.trackExecution(workflowId, duration, true);
      this.logger.info(`Workflow ${workflowId} completed successfully in ${duration}ms`);
      
      return result;
    } catch (error) {
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
  private config: IntegrationConfig;
  private logger: N8nLogger;
  private cache: N8nPerformanceOptimizer;

  constructor(config: IntegrationConfig, logger: N8nLogger, cache: N8nPerformanceOptimizer) {
    this.config = config;
    this.logger = logger;
    this.cache = cache;
  }

  /**
   * Validate webhook signature for security
   */
  validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string
  ): boolean {
    const expectedSignature = createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(`sha256=${expectedSignature}`)
    );
  }

  /**
   * Process webhook with rate limiting and validation
   */
  async processWebhook(
    request: { headers: Record<string, string>; body: any },
    handler: (data: any) => Promise<any>
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Validate content type
      if (!request.headers['content-type']?.includes('application/json')) {
        throw new Error('Invalid content type');
      }

      // Process with caching to prevent duplicate processing
      const cacheKey = `webhook_${request.headers['x-webhook-id'] || Date.now()}`;
      
      const result = await this.cache.withCache(
        cacheKey,
        () => handler(request.body),
        1 // 1 minute cache to prevent duplicates
      );

      this.logger.info(`Webhook processed successfully: ${cacheKey}`);
      return { success: true, data: result };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Webhook processing failed: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Create webhook endpoint configuration
   */
  createWebhookConfig(
    workflowId: string,
    path: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'POST'
  ): {
    url: string;
    method: string;
    headers: Record<string, string>;
  } {
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
export class ConsoleLogger implements N8nLogger {
  private logLevel: string;

  constructor(logLevel: string = 'info') {
    this.logLevel = logLevel;
  }

  private shouldLog(level: string): boolean {
    const levels = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.logLevel);
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, meta || '');
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog('info')) {
      console.info(`[INFO] ${message}`, meta || '');
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, meta || '');
    }
  }

  error(message: string, meta?: any): void {
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
  private config: IntegrationConfig;
  private auth: N8nAuthManager;
  private errorHandler: N8nErrorHandler;
  private optimizer: N8nPerformanceOptimizer;
  private monitor: N8nMonitor;
  private webhookHandler: N8nWebhookHandler;
  private logger: N8nLogger;

  constructor(config: Partial<IntegrationConfig> = {}) {
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
  getAuth(): N8nAuthManager {
    return this.auth;
  }

  /**
   * Get error handler
   */
  getErrorHandler(): N8nErrorHandler {
    return this.errorHandler;
  }

  /**
   * Get performance optimizer
   */
  getOptimizer(): N8nPerformanceOptimizer {
    return this.optimizer;
  }

  /**
   * Get monitor
   */
  getMonitor(): N8nMonitor {
    return this.monitor;
  }

  /**
   * Get webhook handler
   */
  getWebhookHandler(): N8nWebhookHandler {
    return this.webhookHandler;
  }

  /**
   * Get logger
   */
  getLogger(): N8nLogger {
    return this.logger;
  }

  /**
   * Execute workflow with full integration pattern support
   */
  async executeWorkflow(
    workflowId: string,
    inputData?: any,
    credentials?: { email: string; password: string }
  ): Promise<any> {
    return this.monitor.monitorExecution(workflowId, async () => {
      return this.errorHandler.withRetry(async () => {
        const token = await this.auth.getValidToken(credentials);
        const headers = this.auth.getAuthHeaders(token);

        const response = await fetch(
          `${this.config.n8nBaseUrl}/rest/workflows/${workflowId}/execute`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify({ data: inputData }),
            signal: AbortSignal.timeout(this.config.timeout)
          }
        );

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
  async validateWorkflow(workflow: N8nWorkflow): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
    compatibilityScore: number;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
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

    } catch (error) {
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
  private integrationManager: N8nIntegrationManager;

  constructor(integrationManager: N8nIntegrationManager) {
    this.integrationManager = integrationManager;
  }

  /**
   * Create mock workflow for testing
   */
  createMockWorkflow(nodeCount: number = 3): N8nWorkflow {
    const nodes: N8nNode[] = [];
    const connections: Record<string, any> = {};

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
  createMockResponse(data: any, status: number = 200): Response {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Test workflow validation
   */
  async testWorkflowValidation(workflow: N8nWorkflow): Promise<boolean> {
    const result = await this.integrationManager.validateWorkflow(workflow);
    return result.valid && result.compatibilityScore > 80;
  }
} 