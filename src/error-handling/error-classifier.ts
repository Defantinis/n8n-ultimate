/**
 * Advanced Error Classification and Categorization System
 * Provides comprehensive error handling for n8n-ultimate project
 */

import { EventEmitter } from 'events';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  CRITICAL = 'critical',    // System-breaking errors
  HIGH = 'high',           // Feature-breaking errors
  MEDIUM = 'medium',       // Degraded functionality
  LOW = 'low',            // Minor issues
  INFO = 'info'           // Informational messages
}

/**
 * Error categories based on system components
 */
export enum ErrorCategory {
  WORKFLOW_GENERATION = 'workflow_generation',
  WORKFLOW_VALIDATION = 'workflow_validation',
  COMMUNITY_NODE = 'community_node',
  AI_AGENT = 'ai_agent',
  KNOWLEDGE_MANAGEMENT = 'knowledge_management',
  SYSTEM = 'system',
  NETWORK = 'network',
  AUTHENTICATION = 'authentication',
  CONFIGURATION = 'configuration',
  PERFORMANCE = 'performance'
}

/**
 * Error types for more specific classification
 */
export enum ErrorType {
  // Workflow errors
  INVALID_WORKFLOW_STRUCTURE = 'invalid_workflow_structure',
  NODE_CONNECTION_ERROR = 'node_connection_error',
  DATA_FLOW_ERROR = 'data_flow_error',
  WORKFLOW_EXECUTION_ERROR = 'workflow_execution_error',
  
  // Community node errors
  NODE_NOT_FOUND = 'node_not_found',
  NODE_INSTALLATION_FAILED = 'node_installation_failed',
  NODE_COMPATIBILITY_ERROR = 'node_compatibility_error',
  NODE_VALIDATION_ERROR = 'node_validation_error',
  
  // AI agent errors
  AI_MODEL_ERROR = 'ai_model_error',
  AI_RESPONSE_ERROR = 'ai_response_error',
  AI_TIMEOUT_ERROR = 'ai_timeout_error',
  AI_RATE_LIMIT_ERROR = 'ai_rate_limit_error',
  
  // System errors
  FILE_SYSTEM_ERROR = 'file_system_error',
  DATABASE_ERROR = 'database_error',
  MEMORY_ERROR = 'memory_error',
  TIMEOUT_ERROR = 'timeout_error',
  
  // Network errors
  CONNECTION_ERROR = 'connection_error',
  API_ERROR = 'api_error',
  AUTHENTICATION_ERROR = 'authentication_error',
  
  // Configuration errors
  MISSING_CONFIG = 'missing_config',
  INVALID_CONFIG = 'invalid_config',
  
  // Performance errors
  PERFORMANCE_DEGRADATION = 'performance_degradation',
  RESOURCE_EXHAUSTION = 'resource_exhaustion'
}

/**
 * Recovery strategies for different error types
 */
export enum RecoveryStrategy {
  RETRY = 'retry',
  FALLBACK = 'fallback',
  GRACEFUL_DEGRADATION = 'graceful_degradation',
  USER_INTERVENTION = 'user_intervention',
  SYSTEM_RESTART = 'system_restart',
  NO_RECOVERY = 'no_recovery'
}

/**
 * Context information for error classification
 */
export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  workflowId?: string;
  nodeId?: string;
  operationId?: string;
  timestamp: Date;
  userAgent?: string;
  ipAddress?: string;
  systemInfo?: {
    platform: string;
    nodeVersion: string;
    memoryUsage: NodeJS.MemoryUsage;
    uptime: number;
  };
  requestInfo?: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
  };
  performanceMetrics?: {
    executionTime: number;
    memoryDelta: number;
    cpuUsage: number;
  };
}

/**
 * Classified error structure
 */
export interface ClassifiedError {
  id: string;
  originalError: Error;
  severity: ErrorSeverity;
  category: ErrorCategory;
  type: ErrorType;
  message: string;
  technicalMessage: string;
  userFriendlyMessage: string;
  context: ErrorContext;
  stackTrace: string;
  recoveryStrategy: RecoveryStrategy;
  suggestedActions: string[];
  relatedErrors: string[];
  metadata: Record<string, any>;
  tags: string[];
  isRetryable: boolean;
  maxRetries: number;
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Error classification rules
 */
export interface ClassificationRule {
  id: string;
  name: string;
  description: string;
  condition: (error: Error, context: ErrorContext) => boolean;
  severity: ErrorSeverity;
  category: ErrorCategory;
  type: ErrorType;
  recoveryStrategy: RecoveryStrategy;
  suggestedActions: string[];
  isRetryable: boolean;
  maxRetries: number;
  priority: number;
}

/**
 * Error statistics for analytics
 */
export interface ErrorStatistics {
  totalErrors: number;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorsByCategory: Record<ErrorCategory, number>;
  errorsByType: Record<ErrorType, number>;
  errorsByRecoveryStrategy: Record<RecoveryStrategy, number>;
  averageResolutionTime: number;
  retrySuccessRate: number;
  topErrors: Array<{ type: ErrorType; count: number; percentage: number }>;
  timeRange: {
    start: Date;
    end: Date;
  };
}

/**
 * Main error classifier class
 */
export class ErrorClassifier extends EventEmitter {
  private classificationRules: ClassificationRule[] = [];
  private errorHistory: Map<string, ClassifiedError> = new Map();
  private errorStats: ErrorStatistics;
  private maxHistorySize: number = 10000;

  constructor() {
    super();
    this.initializeDefaultRules();
    this.initializeStats();
  }

  /**
   * Classify an error with context
   */
  public classifyError(error: Error, context: ErrorContext): ClassifiedError {
    const errorId = this.generateErrorId();
    const stackTrace = error.stack || new Error().stack || '';
    
    // Find matching classification rule
    const rule = this.findMatchingRule(error, context);
    
    // Create classified error
    const classifiedError: ClassifiedError = {
      id: errorId,
      originalError: error,
      severity: rule.severity,
      category: rule.category,
      type: rule.type,
      message: error.message,
      technicalMessage: this.generateTechnicalMessage(error, context),
      userFriendlyMessage: this.generateUserFriendlyMessage(error, rule),
      context,
      stackTrace,
      recoveryStrategy: rule.recoveryStrategy,
      suggestedActions: [...rule.suggestedActions],
      relatedErrors: this.findRelatedErrors(error, context),
      metadata: this.extractMetadata(error, context),
      tags: this.generateTags(error, context, rule),
      isRetryable: rule.isRetryable,
      maxRetries: rule.maxRetries,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in history
    this.addToHistory(classifiedError);
    
    // Update statistics
    this.updateStatistics(classifiedError);
    
    // Emit events
    this.emit('errorClassified', classifiedError);
    this.emit(`error:${rule.category}`, classifiedError);
    this.emit(`error:${rule.severity}`, classifiedError);

    return classifiedError;
  }

  /**
   * Add custom classification rule
   */
  public addClassificationRule(rule: ClassificationRule): void {
    // Validate rule
    if (!rule.id || !rule.name || !rule.condition) {
      throw new Error('Invalid classification rule: missing required fields');
    }

    // Check for duplicate IDs
    if (this.classificationRules.some(r => r.id === rule.id)) {
      throw new Error(`Classification rule with ID ${rule.id} already exists`);
    }

    this.classificationRules.push(rule);
    this.classificationRules.sort((a, b) => b.priority - a.priority);
    
    this.emit('ruleAdded', rule);
  }

  /**
   * Remove classification rule
   */
  public removeClassificationRule(ruleId: string): boolean {
    const index = this.classificationRules.findIndex(r => r.id === ruleId);
    if (index !== -1) {
      const removedRule = this.classificationRules.splice(index, 1)[0];
      this.emit('ruleRemoved', removedRule);
      return true;
    }
    return false;
  }

  /**
   * Get error by ID
   */
  public getError(errorId: string): ClassifiedError | undefined {
    return this.errorHistory.get(errorId);
  }

  /**
   * Get errors by criteria
   */
  public getErrors(criteria: {
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    type?: ErrorType;
    timeRange?: { start: Date; end: Date };
    limit?: number;
  }): ClassifiedError[] {
    let errors = Array.from(this.errorHistory.values());

    if (criteria.severity) {
      errors = errors.filter(e => e.severity === criteria.severity);
    }

    if (criteria.category) {
      errors = errors.filter(e => e.category === criteria.category);
    }

    if (criteria.type) {
      errors = errors.filter(e => e.type === criteria.type);
    }

    if (criteria.timeRange) {
      errors = errors.filter(e => 
        e.createdAt >= criteria.timeRange!.start && 
        e.createdAt <= criteria.timeRange!.end
      );
    }

    // Sort by creation time (newest first)
    errors.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (criteria.limit) {
      errors = errors.slice(0, criteria.limit);
    }

    return errors;
  }

  /**
   * Get error statistics
   */
  public getStatistics(): ErrorStatistics {
    return { ...this.errorStats };
  }

  /**
   * Clear error history
   */
  public clearHistory(): void {
    this.errorHistory.clear();
    this.initializeStats();
    this.emit('historyCleared');
  }

  /**
   * Export error data for analysis
   */
  public exportErrors(format: 'json' | 'csv' = 'json'): string {
    const errors = Array.from(this.errorHistory.values());
    
    if (format === 'csv') {
      return this.convertToCsv(errors);
    }
    
    return JSON.stringify(errors, null, 2);
  }

  /**
   * Initialize default classification rules
   */
  private initializeDefaultRules(): void {
    const defaultRules: ClassificationRule[] = [
      // Workflow generation errors
      {
        id: 'workflow-invalid-structure',
        name: 'Invalid Workflow Structure',
        description: 'Workflow has invalid structure or missing required components',
        condition: (error, context) => 
          error.message.toLowerCase().includes('workflow') && 
          (error.message.toLowerCase().includes('invalid') || error.message.toLowerCase().includes('structure')),
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.WORKFLOW_GENERATION,
        type: ErrorType.INVALID_WORKFLOW_STRUCTURE,
        recoveryStrategy: RecoveryStrategy.USER_INTERVENTION,
        suggestedActions: [
          'Check workflow structure against n8n schema',
          'Verify all required nodes are present',
          'Ensure proper node connections'
        ],
        isRetryable: false,
        maxRetries: 0,
        priority: 100
      },

      // Community node errors
      {
        id: 'community-node-not-found',
        name: 'Community Node Not Found',
        description: 'Requested community node could not be found or installed',
        condition: (error, context) =>
          error.message.toLowerCase().includes('node') &&
          (error.message.toLowerCase().includes('not found') || error.message.toLowerCase().includes('missing')),
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.COMMUNITY_NODE,
        type: ErrorType.NODE_NOT_FOUND,
        recoveryStrategy: RecoveryStrategy.FALLBACK,
        suggestedActions: [
          'Check if node package exists in npm registry',
          'Verify node name spelling',
          'Try alternative community nodes',
          'Use built-in n8n nodes as fallback'
        ],
        isRetryable: true,
        maxRetries: 2,
        priority: 90
      },

      // AI agent errors
      {
        id: 'ai-timeout',
        name: 'AI Agent Timeout',
        description: 'AI agent request timed out',
        condition: (error, context) =>
          error.message.toLowerCase().includes('timeout') ||
          error.name.toLowerCase().includes('timeout'),
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.AI_AGENT,
        type: ErrorType.AI_TIMEOUT_ERROR,
        recoveryStrategy: RecoveryStrategy.RETRY,
        suggestedActions: [
          'Retry the request with increased timeout',
          'Check network connectivity',
          'Verify AI service availability',
          'Consider using fallback AI model'
        ],
        isRetryable: true,
        maxRetries: 3,
        priority: 85
      },

      // Network errors
      {
        id: 'network-connection',
        name: 'Network Connection Error',
        description: 'Network connection failed',
        condition: (error, context) =>
          error.message.toLowerCase().includes('network') ||
          error.message.toLowerCase().includes('connection') ||
          (error as any).code === 'ECONNREFUSED' ||
          (error as any).code === 'ENOTFOUND',
        severity: ErrorSeverity.HIGH,
        category: ErrorCategory.NETWORK,
        type: ErrorType.CONNECTION_ERROR,
        recoveryStrategy: RecoveryStrategy.RETRY,
        suggestedActions: [
          'Check internet connectivity',
          'Verify service endpoints',
          'Check firewall settings',
          'Try again in a few moments'
        ],
        isRetryable: true,
        maxRetries: 5,
        priority: 80
      },

      // Generic fallback rule
      {
        id: 'generic-error',
        name: 'Generic Error',
        description: 'Unclassified error',
        condition: () => true, // Always matches as fallback
        severity: ErrorSeverity.MEDIUM,
        category: ErrorCategory.SYSTEM,
        type: ErrorType.TIMEOUT_ERROR,
        recoveryStrategy: RecoveryStrategy.USER_INTERVENTION,
        suggestedActions: [
          'Check system logs for more details',
          'Contact support if the issue persists',
          'Try restarting the operation'
        ],
        isRetryable: false,
        maxRetries: 0,
        priority: 0 // Lowest priority (fallback)
      }
    ];

    defaultRules.forEach(rule => this.addClassificationRule(rule));
  }

  /**
   * Find matching classification rule
   */
  private findMatchingRule(error: Error, context: ErrorContext): ClassificationRule {
    for (const rule of this.classificationRules) {
      try {
        if (rule.condition(error, context)) {
          return rule;
        }
      } catch (conditionError) {
        console.warn(`Error in classification rule condition ${rule.id}:`, conditionError);
      }
    }
    
    // Should never reach here due to generic fallback rule
    throw new Error('No matching classification rule found');
  }

  /**
   * Generate unique error ID
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate technical error message
   */
  private generateTechnicalMessage(error: Error, context: ErrorContext): string {
    const parts = [
      `Error: ${error.message}`,
      `Type: ${error.constructor.name}`,
      `Context: ${context.operationId || 'unknown'}`
    ];

    if ((error as any).cause) {
      parts.push(`Cause: ${(error as any).cause}`);
    }

    return parts.join(' | ');
  }

  /**
   * Generate user-friendly error message
   */
  private generateUserFriendlyMessage(error: Error, rule: ClassificationRule): string {
    const templates: Record<ErrorType, string> = {
      [ErrorType.INVALID_WORKFLOW_STRUCTURE]: 'The workflow structure is invalid. Please check your workflow configuration.',
      [ErrorType.NODE_NOT_FOUND]: 'The requested node could not be found. Please verify the node name and try again.',
      [ErrorType.AI_TIMEOUT_ERROR]: 'The AI service is taking longer than expected. Please try again.',
      [ErrorType.CONNECTION_ERROR]: 'Unable to connect to the service. Please check your internet connection.',
      [ErrorType.NODE_CONNECTION_ERROR]: 'There was an issue connecting workflow nodes. Please check your node configurations.',
      [ErrorType.DATA_FLOW_ERROR]: 'Data flow validation failed. Please check your data transformations.',
      [ErrorType.WORKFLOW_EXECUTION_ERROR]: 'Workflow execution failed. Please review your workflow logic.',
      [ErrorType.NODE_INSTALLATION_FAILED]: 'Node installation failed. Please check your network connection and try again.',
      [ErrorType.NODE_COMPATIBILITY_ERROR]: 'The node is not compatible with your current n8n version.',
      [ErrorType.NODE_VALIDATION_ERROR]: 'Node validation failed. Please check the node configuration.',
      [ErrorType.AI_MODEL_ERROR]: 'AI model encountered an error. Please try again or contact support.',
      [ErrorType.AI_RESPONSE_ERROR]: 'AI service returned an invalid response. Please try again.',
      [ErrorType.AI_RATE_LIMIT_ERROR]: 'AI service rate limit exceeded. Please wait before trying again.',
      [ErrorType.FILE_SYSTEM_ERROR]: 'File system error occurred. Please check file permissions.',
      [ErrorType.DATABASE_ERROR]: 'Database error occurred. Please try again later.',
      [ErrorType.MEMORY_ERROR]: 'System is running low on memory. Please close other applications.',
      [ErrorType.TIMEOUT_ERROR]: 'Operation timed out. Please try again.',
      [ErrorType.API_ERROR]: 'API request failed. Please check the service status.',
      [ErrorType.AUTHENTICATION_ERROR]: 'Authentication failed. Please check your credentials.',
      [ErrorType.MISSING_CONFIG]: 'Configuration is missing. Please check your settings.',
      [ErrorType.INVALID_CONFIG]: 'Configuration is invalid. Please verify your settings.',
      [ErrorType.PERFORMANCE_DEGRADATION]: 'System performance is degraded. Please try again later.',
      [ErrorType.RESOURCE_EXHAUSTION]: 'System resources are exhausted. Please try again later.'
    };

    return templates[rule.type] || 'An unexpected error occurred. Please try again or contact support.';
  }

  /**
   * Find related errors
   */
  private findRelatedErrors(error: Error, context: ErrorContext): string[] {
    const relatedErrors: string[] = [];
    const recentErrors = this.getErrors({ 
      timeRange: { 
        start: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        end: new Date() 
      },
      limit: 50 
    });

    for (const recentError of recentErrors) {
      if (this.areErrorsRelated(error, context, recentError)) {
        relatedErrors.push(recentError.id);
      }
    }

    return relatedErrors;
  }

  /**
   * Check if errors are related
   */
  private areErrorsRelated(error: Error, context: ErrorContext, classifiedError: ClassifiedError): boolean {
    // Same user and similar time
    if (context.userId === classifiedError.context.userId &&
        Math.abs(Date.now() - classifiedError.createdAt.getTime()) < 60000) {
      return true;
    }

    // Same workflow
    if (context.workflowId === classifiedError.context.workflowId) {
      return true;
    }

    // Similar error messages
    if (error.message === classifiedError.originalError.message) {
      return true;
    }

    return false;
  }

  /**
   * Extract metadata from error and context
   */
  private extractMetadata(error: Error, context: ErrorContext): Record<string, any> {
    const metadata: Record<string, any> = {};

    // Add error properties
    if (error.name) metadata.errorName = error.name;
    if ((error as any).code) metadata.errorCode = (error as any).code;
    if ((error as any).errno) metadata.errno = (error as any).errno;
    if ((error as any).syscall) metadata.syscall = (error as any).syscall;

    // Add context information
    if (context.systemInfo) metadata.systemInfo = context.systemInfo;
    if (context.performanceMetrics) metadata.performanceMetrics = context.performanceMetrics;
    if (context.requestInfo) metadata.requestInfo = context.requestInfo;

    return metadata;
  }

  /**
   * Generate tags for error
   */
  private generateTags(error: Error, context: ErrorContext, rule: ClassificationRule): string[] {
    const tags: string[] = [
      rule.category,
      rule.severity,
      rule.type
    ];

    // Add context-based tags
    if (context.userId) tags.push(`user:${context.userId}`);
    if (context.workflowId) tags.push(`workflow:${context.workflowId}`);
    if (context.nodeId) tags.push(`node:${context.nodeId}`);

    // Add error-based tags
    if (error.name) tags.push(`error-name:${error.name.toLowerCase()}`);
    if ((error as any).code) tags.push(`error-code:${(error as any).code}`);

    return tags;
  }

  /**
   * Add error to history
   */
  private addToHistory(classifiedError: ClassifiedError): void {
    this.errorHistory.set(classifiedError.id, classifiedError);

    // Maintain history size limit
    if (this.errorHistory.size > this.maxHistorySize) {
      const oldestKey = this.errorHistory.keys().next().value;
      this.errorHistory.delete(oldestKey);
    }
  }

  /**
   * Update error statistics
   */
  private updateStatistics(classifiedError: ClassifiedError): void {
    this.errorStats.totalErrors++;
    this.errorStats.errorsBySeverity[classifiedError.severity]++;
    this.errorStats.errorsByCategory[classifiedError.category]++;
    this.errorStats.errorsByType[classifiedError.type]++;
    this.errorStats.errorsByRecoveryStrategy[classifiedError.recoveryStrategy]++;

    // Update time range
    if (classifiedError.createdAt > this.errorStats.timeRange.end) {
      this.errorStats.timeRange.end = classifiedError.createdAt;
    }
  }

  /**
   * Initialize statistics
   */
  private initializeStats(): void {
    this.errorStats = {
      totalErrors: 0,
      errorsBySeverity: Object.values(ErrorSeverity).reduce((acc, severity) => {
        acc[severity] = 0;
        return acc;
      }, {} as Record<ErrorSeverity, number>),
      errorsByCategory: Object.values(ErrorCategory).reduce((acc, category) => {
        acc[category] = 0;
        return acc;
      }, {} as Record<ErrorCategory, number>),
      errorsByType: Object.values(ErrorType).reduce((acc, type) => {
        acc[type] = 0;
        return acc;
      }, {} as Record<ErrorType, number>),
      errorsByRecoveryStrategy: Object.values(RecoveryStrategy).reduce((acc, strategy) => {
        acc[strategy] = 0;
        return acc;
      }, {} as Record<RecoveryStrategy, number>),
      averageResolutionTime: 0,
      retrySuccessRate: 0,
      topErrors: [],
      timeRange: {
        start: new Date(),
        end: new Date()
      }
    };
  }

  /**
   * Convert errors to CSV format
   */
  private convertToCsv(errors: ClassifiedError[]): string {
    const headers = [
      'ID', 'Severity', 'Category', 'Type', 'Message', 'Recovery Strategy',
      'Is Retryable', 'Retry Count', 'Created At', 'User ID', 'Workflow ID'
    ];

    const rows = errors.map(error => [
      error.id,
      error.severity,
      error.category,
      error.type,
      `"${error.message.replace(/"/g, '""')}"`,
      error.recoveryStrategy,
      error.isRetryable,
      error.retryCount,
      error.createdAt.toISOString(),
      error.context.userId || '',
      error.context.workflowId || ''
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

// Export singleton instance
export const errorClassifier = new ErrorClassifier();
export default ErrorClassifier;
