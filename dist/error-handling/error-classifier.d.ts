/**
 * Advanced Error Classification and Categorization System
 * Provides comprehensive error handling for n8n-ultimate project
 */
import { EventEmitter } from 'events';
/**
 * Error severity levels
 */
export declare enum ErrorSeverity {
    CRITICAL = "critical",// System-breaking errors
    HIGH = "high",// Feature-breaking errors
    MEDIUM = "medium",// Degraded functionality
    LOW = "low",// Minor issues
    INFO = "info"
}
/**
 * Error categories based on system components
 */
export declare enum ErrorCategory {
    WORKFLOW_GENERATION = "workflow_generation",
    WORKFLOW_VALIDATION = "workflow_validation",
    COMMUNITY_NODE = "community_node",
    AI_AGENT = "ai_agent",
    KNOWLEDGE_MANAGEMENT = "knowledge_management",
    SYSTEM = "system",
    NETWORK = "network",
    AUTHENTICATION = "authentication",
    CONFIGURATION = "configuration",
    PERFORMANCE = "performance"
}
/**
 * Error types for more specific classification
 */
export declare enum ErrorType {
    INVALID_WORKFLOW_STRUCTURE = "invalid_workflow_structure",
    NODE_CONNECTION_ERROR = "node_connection_error",
    DATA_FLOW_ERROR = "data_flow_error",
    WORKFLOW_EXECUTION_ERROR = "workflow_execution_error",
    NODE_NOT_FOUND = "node_not_found",
    NODE_INSTALLATION_FAILED = "node_installation_failed",
    NODE_COMPATIBILITY_ERROR = "node_compatibility_error",
    NODE_VALIDATION_ERROR = "node_validation_error",
    AI_MODEL_ERROR = "ai_model_error",
    AI_RESPONSE_ERROR = "ai_response_error",
    AI_TIMEOUT_ERROR = "ai_timeout_error",
    AI_RATE_LIMIT_ERROR = "ai_rate_limit_error",
    FILE_SYSTEM_ERROR = "file_system_error",
    DATABASE_ERROR = "database_error",
    MEMORY_ERROR = "memory_error",
    TIMEOUT_ERROR = "timeout_error",
    CONNECTION_ERROR = "connection_error",
    API_ERROR = "api_error",
    AUTHENTICATION_ERROR = "authentication_error",
    MISSING_CONFIG = "missing_config",
    INVALID_CONFIG = "invalid_config",
    PERFORMANCE_DEGRADATION = "performance_degradation",
    RESOURCE_EXHAUSTION = "resource_exhaustion"
}
/**
 * Recovery strategies for different error types
 */
export declare enum RecoveryStrategy {
    RETRY = "retry",
    FALLBACK = "fallback",
    GRACEFUL_DEGRADATION = "graceful_degradation",
    USER_INTERVENTION = "user_intervention",
    SYSTEM_RESTART = "system_restart",
    NO_RECOVERY = "no_recovery"
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
    topErrors: Array<{
        type: ErrorType;
        count: number;
        percentage: number;
    }>;
    timeRange: {
        start: Date;
        end: Date;
    };
}
/**
 * Main error classifier class
 */
export declare class ErrorClassifier extends EventEmitter {
    private classificationRules;
    private errorHistory;
    private errorStats;
    private maxHistorySize;
    constructor();
    /**
     * Classify an error with context
     */
    classifyError(error: Error, context: ErrorContext): ClassifiedError;
    /**
     * Add custom classification rule
     */
    addClassificationRule(rule: ClassificationRule): void;
    /**
     * Remove classification rule
     */
    removeClassificationRule(ruleId: string): boolean;
    /**
     * Get error by ID
     */
    getError(errorId: string): ClassifiedError | undefined;
    /**
     * Get errors by criteria
     */
    getErrors(criteria: {
        severity?: ErrorSeverity;
        category?: ErrorCategory;
        type?: ErrorType;
        timeRange?: {
            start: Date;
            end: Date;
        };
        limit?: number;
    }): ClassifiedError[];
    /**
     * Get error statistics
     */
    getStatistics(): ErrorStatistics;
    /**
     * Clear error history
     */
    clearHistory(): void;
    /**
     * Export error data for analysis
     */
    exportErrors(format?: 'json' | 'csv'): string;
    /**
     * Initialize default classification rules
     */
    private initializeDefaultRules;
    /**
     * Find matching classification rule
     */
    private findMatchingRule;
    /**
     * Generate unique error ID
     */
    private generateErrorId;
    /**
     * Generate technical error message
     */
    private generateTechnicalMessage;
    /**
     * Generate user-friendly error message
     */
    private generateUserFriendlyMessage;
    /**
     * Find related errors
     */
    private findRelatedErrors;
    /**
     * Check if errors are related
     */
    private areErrorsRelated;
    /**
     * Extract metadata from error and context
     */
    private extractMetadata;
    /**
     * Generate tags for error
     */
    private generateTags;
    /**
     * Add error to history
     */
    private addToHistory;
    /**
     * Update error statistics
     */
    private updateStatistics;
    /**
     * Initialize statistics
     */
    private initializeStats;
    /**
     * Convert errors to CSV format
     */
    private convertToCsv;
}
export declare const errorClassifier: ErrorClassifier;
export default ErrorClassifier;
//# sourceMappingURL=error-classifier.d.ts.map