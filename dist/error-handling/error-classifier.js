/**
 * Advanced Error Classification and Categorization System
 * Provides comprehensive error handling for n8n-ultimate project
 */
import { EventEmitter } from 'events';
/**
 * Error severity levels
 */
export var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["CRITICAL"] = "critical";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["INFO"] = "info"; // Informational messages
})(ErrorSeverity || (ErrorSeverity = {}));
/**
 * Error categories based on system components
 */
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["WORKFLOW_GENERATION"] = "workflow_generation";
    ErrorCategory["WORKFLOW_VALIDATION"] = "workflow_validation";
    ErrorCategory["COMMUNITY_NODE"] = "community_node";
    ErrorCategory["AI_AGENT"] = "ai_agent";
    ErrorCategory["KNOWLEDGE_MANAGEMENT"] = "knowledge_management";
    ErrorCategory["SYSTEM"] = "system";
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["AUTHENTICATION"] = "authentication";
    ErrorCategory["CONFIGURATION"] = "configuration";
    ErrorCategory["PERFORMANCE"] = "performance";
})(ErrorCategory || (ErrorCategory = {}));
/**
 * Error types for more specific classification
 */
export var ErrorType;
(function (ErrorType) {
    // Workflow errors
    ErrorType["INVALID_WORKFLOW_STRUCTURE"] = "invalid_workflow_structure";
    ErrorType["NODE_CONNECTION_ERROR"] = "node_connection_error";
    ErrorType["DATA_FLOW_ERROR"] = "data_flow_error";
    ErrorType["WORKFLOW_EXECUTION_ERROR"] = "workflow_execution_error";
    // Community node errors
    ErrorType["NODE_NOT_FOUND"] = "node_not_found";
    ErrorType["NODE_INSTALLATION_FAILED"] = "node_installation_failed";
    ErrorType["NODE_COMPATIBILITY_ERROR"] = "node_compatibility_error";
    ErrorType["NODE_VALIDATION_ERROR"] = "node_validation_error";
    // AI agent errors
    ErrorType["AI_MODEL_ERROR"] = "ai_model_error";
    ErrorType["AI_RESPONSE_ERROR"] = "ai_response_error";
    ErrorType["AI_TIMEOUT_ERROR"] = "ai_timeout_error";
    ErrorType["AI_RATE_LIMIT_ERROR"] = "ai_rate_limit_error";
    // System errors
    ErrorType["FILE_SYSTEM_ERROR"] = "file_system_error";
    ErrorType["DATABASE_ERROR"] = "database_error";
    ErrorType["MEMORY_ERROR"] = "memory_error";
    ErrorType["TIMEOUT_ERROR"] = "timeout_error";
    // Network errors
    ErrorType["CONNECTION_ERROR"] = "connection_error";
    ErrorType["API_ERROR"] = "api_error";
    ErrorType["AUTHENTICATION_ERROR"] = "authentication_error";
    // Configuration errors
    ErrorType["MISSING_CONFIG"] = "missing_config";
    ErrorType["INVALID_CONFIG"] = "invalid_config";
    // Performance errors
    ErrorType["PERFORMANCE_DEGRADATION"] = "performance_degradation";
    ErrorType["RESOURCE_EXHAUSTION"] = "resource_exhaustion";
})(ErrorType || (ErrorType = {}));
/**
 * Recovery strategies for different error types
 */
export var RecoveryStrategy;
(function (RecoveryStrategy) {
    RecoveryStrategy["RETRY"] = "retry";
    RecoveryStrategy["FALLBACK"] = "fallback";
    RecoveryStrategy["GRACEFUL_DEGRADATION"] = "graceful_degradation";
    RecoveryStrategy["USER_INTERVENTION"] = "user_intervention";
    RecoveryStrategy["SYSTEM_RESTART"] = "system_restart";
    RecoveryStrategy["NO_RECOVERY"] = "no_recovery";
})(RecoveryStrategy || (RecoveryStrategy = {}));
/**
 * Main error classifier class
 */
export class ErrorClassifier extends EventEmitter {
    classificationRules = [];
    errorHistory = new Map();
    errorStats;
    maxHistorySize = 10000;
    constructor() {
        super();
        this.initializeDefaultRules();
        this.initializeStats();
    }
    /**
     * Classify an error with context
     */
    classifyError(error, context) {
        const errorId = this.generateErrorId();
        const stackTrace = error.stack || new Error().stack || '';
        // Find matching classification rule
        const rule = this.findMatchingRule(error, context);
        // Create classified error
        const classifiedError = {
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
    addClassificationRule(rule) {
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
    removeClassificationRule(ruleId) {
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
    getError(errorId) {
        return this.errorHistory.get(errorId);
    }
    /**
     * Get errors by criteria
     */
    getErrors(criteria) {
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
            errors = errors.filter(e => e.createdAt >= criteria.timeRange.start &&
                e.createdAt <= criteria.timeRange.end);
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
    getStatistics() {
        return { ...this.errorStats };
    }
    /**
     * Clear error history
     */
    clearHistory() {
        this.errorHistory.clear();
        this.initializeStats();
        this.emit('historyCleared');
    }
    /**
     * Export error data for analysis
     */
    exportErrors(format = 'json') {
        const errors = Array.from(this.errorHistory.values());
        if (format === 'csv') {
            return this.convertToCsv(errors);
        }
        return JSON.stringify(errors, null, 2);
    }
    /**
     * Initialize default classification rules
     */
    initializeDefaultRules() {
        const defaultRules = [
            // Workflow generation errors
            {
                id: 'workflow-invalid-structure',
                name: 'Invalid Workflow Structure',
                description: 'Workflow has invalid structure or missing required components',
                condition: (error, context) => error.message.toLowerCase().includes('workflow') &&
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
                condition: (error, context) => error.message.toLowerCase().includes('node') &&
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
                condition: (error, context) => error.message.toLowerCase().includes('timeout') ||
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
                condition: (error, context) => error.message.toLowerCase().includes('network') ||
                    error.message.toLowerCase().includes('connection') ||
                    error.code === 'ECONNREFUSED' ||
                    error.code === 'ENOTFOUND',
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
    findMatchingRule(error, context) {
        for (const rule of this.classificationRules) {
            try {
                if (rule.condition(error, context)) {
                    return rule;
                }
            }
            catch (conditionError) {
                console.warn(`Error in classification rule condition ${rule.id}:`, conditionError);
            }
        }
        // Should never reach here due to generic fallback rule
        throw new Error('No matching classification rule found');
    }
    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    /**
     * Generate technical error message
     */
    generateTechnicalMessage(error, context) {
        const parts = [
            `Error: ${error.message}`,
            `Type: ${error.constructor.name}`,
            `Context: ${context.operationId || 'unknown'}`
        ];
        if (error.cause) {
            parts.push(`Cause: ${error.cause}`);
        }
        return parts.join(' | ');
    }
    /**
     * Generate user-friendly error message
     */
    generateUserFriendlyMessage(error, rule) {
        const templates = {
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
    findRelatedErrors(error, context) {
        const relatedErrors = [];
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
    areErrorsRelated(error, context, classifiedError) {
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
    extractMetadata(error, context) {
        const metadata = {};
        // Add error properties
        if (error.name)
            metadata.errorName = error.name;
        if (error.code)
            metadata.errorCode = error.code;
        if (error.errno)
            metadata.errno = error.errno;
        if (error.syscall)
            metadata.syscall = error.syscall;
        // Add context information
        if (context.systemInfo)
            metadata.systemInfo = context.systemInfo;
        if (context.performanceMetrics)
            metadata.performanceMetrics = context.performanceMetrics;
        if (context.requestInfo)
            metadata.requestInfo = context.requestInfo;
        return metadata;
    }
    /**
     * Generate tags for error
     */
    generateTags(error, context, rule) {
        const tags = [
            rule.category,
            rule.severity,
            rule.type
        ];
        // Add context-based tags
        if (context.userId)
            tags.push(`user:${context.userId}`);
        if (context.workflowId)
            tags.push(`workflow:${context.workflowId}`);
        if (context.nodeId)
            tags.push(`node:${context.nodeId}`);
        // Add error-based tags
        if (error.name)
            tags.push(`error-name:${error.name.toLowerCase()}`);
        if (error.code)
            tags.push(`error-code:${error.code}`);
        return tags;
    }
    /**
     * Add error to history
     */
    addToHistory(classifiedError) {
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
    updateStatistics(classifiedError) {
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
    initializeStats() {
        this.errorStats = {
            totalErrors: 0,
            errorsBySeverity: Object.values(ErrorSeverity).reduce((acc, severity) => {
                acc[severity] = 0;
                return acc;
            }, {}),
            errorsByCategory: Object.values(ErrorCategory).reduce((acc, category) => {
                acc[category] = 0;
                return acc;
            }, {}),
            errorsByType: Object.values(ErrorType).reduce((acc, type) => {
                acc[type] = 0;
                return acc;
            }, {}),
            errorsByRecoveryStrategy: Object.values(RecoveryStrategy).reduce((acc, strategy) => {
                acc[strategy] = 0;
                return acc;
            }, {}),
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
    convertToCsv(errors) {
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
//# sourceMappingURL=error-classifier.js.map