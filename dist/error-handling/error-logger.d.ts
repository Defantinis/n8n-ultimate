import { EventEmitter } from 'events';
import { ClassifiedError, ErrorSeverity, ErrorCategory, ErrorType } from './error-classifier';
/**
 * Log levels for different types of information
 */
export declare enum LogLevel {
    TRACE = "trace",
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    FATAL = "fatal"
}
/**
 * Telemetry data structure for detailed error tracking
 */
export interface TelemetryData {
    timestamp: Date;
    sessionId: string;
    userId?: string;
    errorId: string;
    systemInfo: {
        platform: string;
        arch: string;
        nodeVersion: string;
        memoryUsage: NodeJS.MemoryUsage;
        cpuUsage: number;
        uptime: number;
        loadAverage?: number[];
    };
    applicationInfo: {
        version: string;
        environment: 'development' | 'staging' | 'production';
        buildNumber?: string;
        commitHash?: string;
        deploymentId?: string;
    };
    performanceMetrics: {
        executionTime: number;
        memoryDelta: number;
        cpuDelta: number;
        networkLatency?: number;
        dbQueryTime?: number;
        cacheHitRate?: number;
    };
    userInteraction: {
        userAgent?: string;
        ipAddress?: string;
        sessionDuration: number;
        actionsPerformed: number;
        lastAction?: string;
        errorContext?: string;
    };
    workflowTelemetry?: {
        workflowId: string;
        nodeCount: number;
        connectionCount: number;
        executionCount: number;
        avgExecutionTime: number;
        failureRate: number;
    };
    customData?: Record<string, any>;
}
/**
 * Log entry structure
 */
export interface LogEntry {
    id: string;
    timestamp: Date;
    level: LogLevel;
    message: string;
    category: string;
    source: string;
    error?: ClassifiedError;
    stackTrace?: string;
    telemetry?: TelemetryData;
    context: {
        userId?: string;
        sessionId?: string;
        workflowId?: string;
        nodeId?: string;
        requestId?: string;
    };
    metadata: {
        tags: string[];
        correlationId?: string;
        parentLogId?: string;
        childLogIds?: string[];
        severity?: ErrorSeverity;
        category?: ErrorCategory;
        type?: ErrorType;
    };
}
/**
 * Log output destination configuration
 */
export interface LogOutput {
    type: 'console' | 'file' | 'database' | 'remote' | 'custom' | 'sentry' | 'datadog';
    enabled: boolean;
    level: LogLevel;
    format: 'json' | 'text' | 'structured';
    filePath?: string;
    maxFileSize?: number;
    maxFiles?: number;
    endpoint?: string;
    apiKey?: string;
    batchSize?: number;
    flushInterval?: number;
    customHandler?: (entry: LogEntry) => Promise<void>;
    remoteType?: 'datadog' | 'custom';
    ddsource?: string;
    ddtags?: string;
    hostname?: string;
    service?: string;
}
export interface SentryLogOutput extends LogOutput {
    type: 'sentry';
    dsn: string;
}
export interface DatadogLogOutput extends LogOutput {
    type: 'datadog';
    remoteType: 'datadog';
    ddsource?: string;
    ddtags?: string;
    hostname?: string;
    service?: string;
}
/**
 * Monitoring alert configuration
 */
export interface AlertRule {
    id: string;
    name: string;
    description: string;
    enabled: boolean;
    conditions: {
        errorRate?: number;
        errorCount?: number;
        severity?: ErrorSeverity[];
        categories?: ErrorCategory[];
        types?: ErrorType[];
        timeWindow?: number;
    };
    actions: {
        email?: string[];
        webhook?: string;
        slack?: string;
        pagerDuty?: string;
        customHandler?: (alert: AlertNotification) => Promise<void>;
    };
    throttle: {
        maxAlertsPerHour?: number;
        cooldownPeriod?: number;
    };
}
/**
 * Alert notification structure
 */
export interface AlertNotification {
    id: string;
    ruleId: string;
    ruleName: string;
    timestamp: Date;
    severity: 'low' | 'medium' | 'high' | 'critical';
    triggerCondition: string;
    affectedCount: number;
    timeWindow: number;
    relatedErrors: string[];
    errorSummary: {
        totalErrors: number;
        bySeverity: Record<ErrorSeverity, number>;
        byCategory: Record<ErrorCategory, number>;
        topErrors: Array<{
            type: ErrorType;
            count: number;
        }>;
    };
    suggestedActions: string[];
    metadata: {
        environment: string;
        systemLoad: number;
        affectedUsers: number;
        correlationId: string;
    };
}
/**
 * Monitoring metrics for system health
 */
export interface MonitoringMetrics {
    timestamp: Date;
    timeWindow: number;
    errorMetrics: {
        totalErrors: number;
        errorRate: number;
        errorsBySeverity: Record<ErrorSeverity, number>;
        errorsByCategory: Record<ErrorCategory, number>;
        errorsByType: Record<ErrorType, number>;
        uniqueErrors: number;
        repeatErrors: number;
    };
    performanceMetrics: {
        avgResponseTime: number;
        p95ResponseTime: number;
        p99ResponseTime: number;
        throughput: number;
        memoryUsage: number;
        cpuUsage: number;
        diskUsage: number;
    };
    userMetrics: {
        activeUsers: number;
        affectedUsers: number;
        userSatisfactionScore: number;
        avgSessionDuration: number;
    };
    systemHealth: {
        overallScore: number;
        availability: number;
        reliability: number;
        errorRecoveryRate: number;
        alertsTriggered: number;
    };
}
/**
 * Advanced error logger with monitoring and telemetry
 */
export declare class AdvancedErrorLogger extends EventEmitter {
    private logEntries;
    private outputs;
    private alertRules;
    private activeAlerts;
    private sessionId;
    private logDirectory;
    private maxHistorySize;
    private metricsInterval;
    private batchQueue;
    private flushTimer;
    private isSentryInitialized;
    constructor(options?: {
        logDirectory?: string;
        maxHistorySize?: number;
        sessionId?: string;
    });
    /**
     * Log a classified error with full telemetry
     */
    logError(error: ClassifiedError, telemetry?: Partial<TelemetryData>, context?: Partial<LogEntry['context']>): Promise<string>;
    /**
     * Log a general message with telemetry
     */
    log(level: LogLevel, message: string, category?: string, telemetry?: Partial<TelemetryData>, context?: Partial<LogEntry['context']>): Promise<string>;
    /**
     * Add a log output destination
     */
    addOutput(output: LogOutput): void;
    /**
     * Remove a log output destination
     */
    removeOutput(outputType: string): boolean;
    /**
     * Add an alert rule
     */
    addAlertRule(rule: AlertRule): void;
    /**
     * Remove an alert rule
     */
    removeAlertRule(ruleId: string): boolean;
    /**
     * Get monitoring metrics for a time window
     */
    getMetrics(timeWindowMinutes?: number): MonitoringMetrics;
    /**
     * Get log entries with filtering
     */
    getLogEntries(criteria?: {
        level?: LogLevel;
        category?: string;
        severity?: ErrorSeverity;
        timeRange?: {
            start: Date;
            end: Date;
        };
        userId?: string;
        workflowId?: string;
        limit?: number;
    }): LogEntry[];
    /**
     * Export logs in various formats
     */
    exportLogs(format: 'json' | 'csv' | 'text', criteria?: Parameters<typeof this.getLogEntries>[0]): string;
    /**
     * Clear all log entries
     */
    clearLogs(): void;
    /**
     * Shutdown the logger gracefully
     */
    shutdown(): Promise<void>;
    /**
     * Collect comprehensive telemetry data
     */
    private collectTelemetry;
    /**
     * Process a log entry through all outputs
     */
    private processLogEntry;
    /**
     * Check if entry should be processed by output based on level
     */
    private shouldProcessEntry;
    /**
     * Process entry through specific output
     */
    private processOutput;
    /**
     * Process console output
     */
    private processConsoleOutput;
    /**
     * Process file output
     */
    private processFileOutput;
    /**
     * Process remote output (batch)
     */
    private processRemoteOutput;
    /**
     * Process sentry output
     */
    private processSentryOutput;
    /**
     * Process datadog output
     */
    private processDatadogOutput;
    /**
     * Flush batch queue to remote endpoint
     */
    private flushBatch;
    /**
     * Check alert rules against log entry
     */
    private checkAlertRules;
    /**
     * Evaluate if alert rule should trigger
     */
    private evaluateAlertRule;
    /**
     * Trigger an alert
     */
    private triggerAlert;
    /**
     * Initialize default outputs
     */
    private initializeDefaultOutputs;
    /**
     * Initialize default alert rules
     */
    private initializeDefaultAlertRules;
    /**
     * Utility methods
     */
    private generateSessionId;
    private generateLogId;
    private generateCorrelationId;
    private generateAlertId;
    private mapSeverityToLogLevel;
    private formatLogEntry;
    private ensureLogDirectory;
    private rotateLogFile;
    private cleanupOldEntries;
    private startMetricsCollection;
    private countBySeverity;
    private countByCategory;
    private countByType;
    private calculatePerformanceMetrics;
    private calculateUserMetrics;
    private calculateSystemHealth;
    private convertToCsv;
    private convertToText;
    private isThrottled;
    private mapRuleSeverity;
    private describeTriggerCondition;
    private generateSuggestedActions;
    private getTopErrors;
    private executeAlertActions;
    private mapLogLevelToSentry;
}
export default AdvancedErrorLogger;
//# sourceMappingURL=error-logger.d.ts.map