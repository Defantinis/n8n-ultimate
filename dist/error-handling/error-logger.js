import { EventEmitter } from 'events';
import { appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ErrorSeverity, ErrorCategory, ErrorType } from './error-classifier';
import fetch from 'node-fetch';
import * as Sentry from '@sentry/node';
import tracer from 'dd-trace';
/**
 * Log levels for different types of information
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["TRACE"] = "trace";
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (LogLevel = {}));
/**
 * Advanced error logger with monitoring and telemetry
 */
export class AdvancedErrorLogger extends EventEmitter {
    logEntries = new Map();
    outputs = [];
    alertRules = new Map();
    activeAlerts = new Map();
    sessionId;
    logDirectory;
    maxHistorySize = 50000;
    metricsInterval = null;
    batchQueue = [];
    flushTimer = null;
    isSentryInitialized = false;
    constructor(options = {}) {
        super();
        this.logDirectory = options.logDirectory || './logs';
        this.maxHistorySize = options.maxHistorySize || 50000;
        this.sessionId = options.sessionId || this.generateSessionId();
        this.ensureLogDirectory();
        this.initializeDefaultOutputs();
        this.initializeDefaultAlertRules();
        this.startMetricsCollection();
        this.outputs.forEach(output => {
            if (output.type === 'sentry' && output.enabled && !this.isSentryInitialized) {
                const sentryOutput = output;
                Sentry.init({ dsn: sentryOutput.dsn });
                this.isSentryInitialized = true;
            }
            if (output.type === 'datadog' && output.enabled) {
                tracer.init(); // initializes DD tracer
            }
        });
    }
    /**
     * Log a classified error with full telemetry
     */
    async logError(error, telemetry, context = {}) {
        const logId = this.generateLogId();
        const fullTelemetry = await this.collectTelemetry(error, telemetry);
        const logEntry = {
            id: logId,
            timestamp: new Date(),
            level: this.mapSeverityToLogLevel(error.severity),
            message: error.message,
            category: error.category,
            source: 'error-logger',
            error,
            stackTrace: error.stackTrace,
            telemetry: fullTelemetry,
            context: {
                userId: error.context.userId,
                sessionId: this.sessionId,
                workflowId: error.context.workflowId,
                nodeId: error.context.nodeId,
                ...context
            },
            metadata: {
                tags: error.tags,
                severity: error.severity,
                category: error.category,
                type: error.type,
                correlationId: this.generateCorrelationId()
            }
        };
        // Store in memory
        this.logEntries.set(logId, logEntry);
        this.cleanupOldEntries();
        // Process through outputs
        await this.processLogEntry(logEntry);
        // Check alert rules
        await this.checkAlertRules(logEntry);
        // Emit events
        this.emit('error_logged', logEntry);
        this.emit(`error_${error.severity}`, logEntry);
        this.emit(`category_${error.category}`, logEntry);
        return logId;
    }
    /**
     * Log a general message with telemetry
     */
    async log(level, message, category = 'general', telemetry, context = {}) {
        const logId = this.generateLogId();
        const fullTelemetry = telemetry ? await this.collectTelemetry(null, telemetry) : undefined;
        const logEntry = {
            id: logId,
            timestamp: new Date(),
            level,
            message,
            category,
            source: 'error-logger',
            telemetry: fullTelemetry,
            context: {
                sessionId: this.sessionId,
                ...context
            },
            metadata: {
                tags: [],
                correlationId: this.generateCorrelationId()
            }
        };
        // Store in memory
        this.logEntries.set(logId, logEntry);
        this.cleanupOldEntries();
        // Process through outputs
        await this.processLogEntry(logEntry);
        // Emit events
        this.emit('log_entry', logEntry);
        this.emit(`log_${level}`, logEntry);
        return logId;
    }
    /**
     * Add a log output destination
     */
    addOutput(output) {
        this.outputs.push(output);
        this.emit('output_added', output);
    }
    /**
     * Remove a log output destination
     */
    removeOutput(outputType) {
        const index = this.outputs.findIndex(o => o.type === outputType);
        if (index >= 0) {
            const removed = this.outputs.splice(index, 1)[0];
            this.emit('output_removed', removed);
            return true;
        }
        return false;
    }
    /**
     * Add an alert rule
     */
    addAlertRule(rule) {
        this.alertRules.set(rule.id, rule);
        this.emit('alert_rule_added', rule);
    }
    /**
     * Remove an alert rule
     */
    removeAlertRule(ruleId) {
        const removed = this.alertRules.delete(ruleId);
        if (removed) {
            this.emit('alert_rule_removed', ruleId);
        }
        return removed;
    }
    /**
     * Get monitoring metrics for a time window
     */
    getMetrics(timeWindowMinutes = 60) {
        const now = new Date();
        const startTime = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);
        const recentEntries = Array.from(this.logEntries.values())
            .filter(entry => entry.timestamp >= startTime);
        const errorEntries = recentEntries.filter(entry => entry.error);
        // Calculate error metrics
        const errorMetrics = {
            totalErrors: errorEntries.length,
            errorRate: errorEntries.length / timeWindowMinutes,
            errorsBySeverity: this.countBySeverity(errorEntries),
            errorsByCategory: this.countByCategory(errorEntries),
            errorsByType: this.countByType(errorEntries),
            uniqueErrors: new Set(errorEntries.map(e => e.error?.type)).size,
            repeatErrors: errorEntries.length - new Set(errorEntries.map(e => e.error?.type)).size
        };
        // Calculate performance metrics
        const performanceMetrics = this.calculatePerformanceMetrics(recentEntries);
        // Calculate user metrics
        const userMetrics = this.calculateUserMetrics(recentEntries);
        // Calculate system health
        const systemHealth = this.calculateSystemHealth(errorMetrics, performanceMetrics);
        return {
            timestamp: now,
            timeWindow: timeWindowMinutes,
            errorMetrics,
            performanceMetrics,
            userMetrics,
            systemHealth
        };
    }
    /**
     * Get log entries with filtering
     */
    getLogEntries(criteria = {}) {
        let entries = Array.from(this.logEntries.values());
        // Apply filters
        if (criteria.level) {
            entries = entries.filter(e => e.level === criteria.level);
        }
        if (criteria.category) {
            entries = entries.filter(e => e.category === criteria.category);
        }
        if (criteria.severity) {
            entries = entries.filter(e => e.metadata.severity === criteria.severity);
        }
        if (criteria.timeRange) {
            entries = entries.filter(e => e.timestamp >= criteria.timeRange.start &&
                e.timestamp <= criteria.timeRange.end);
        }
        if (criteria.userId) {
            entries = entries.filter(e => e.context.userId === criteria.userId);
        }
        if (criteria.workflowId) {
            entries = entries.filter(e => e.context.workflowId === criteria.workflowId);
        }
        // Sort by timestamp (newest first)
        entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        // Apply limit
        if (criteria.limit) {
            entries = entries.slice(0, criteria.limit);
        }
        return entries;
    }
    /**
     * Export logs in various formats
     */
    exportLogs(format, criteria = {}) {
        const entries = this.getLogEntries(criteria);
        switch (format) {
            case 'json':
                return JSON.stringify(entries, null, 2);
            case 'csv':
                return this.convertToCsv(entries);
            case 'text':
                return this.convertToText(entries);
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }
    }
    /**
     * Clear all log entries
     */
    clearLogs() {
        this.logEntries.clear();
        this.emit('logs_cleared');
    }
    /**
     * Shutdown the logger gracefully
     */
    async shutdown() {
        // Stop metrics collection
        if (this.metricsInterval) {
            clearInterval(this.metricsInterval);
        }
        // Flush any pending batches
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
        }
        await this.flushBatch();
        // Close all outputs
        for (const output of this.outputs) {
            if (output.customHandler) {
                // Allow custom handlers to cleanup
                try {
                    await output.customHandler({});
                }
                catch (error) {
                    // Ignore cleanup errors
                }
            }
        }
        if (this.isSentryInitialized) {
            await Sentry.close(2000);
        }
        this.emit('shutdown');
    }
    /**
     * Collect comprehensive telemetry data
     */
    async collectTelemetry(error, partial) {
        const memoryUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        return {
            timestamp: new Date(),
            sessionId: this.sessionId,
            userId: error?.context.userId || partial?.userId,
            errorId: error?.id || 'N/A',
            systemInfo: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                memoryUsage,
                cpuUsage: cpuUsage.user + cpuUsage.system,
                uptime: process.uptime(),
                loadAverage: process.platform !== 'win32' ? process.loadavg() : undefined,
                ...partial?.systemInfo
            },
            applicationInfo: {
                version: '1.0.0', // Should come from package.json
                environment: process.env.NODE_ENV || 'development',
                buildNumber: process.env.BUILD_NUMBER,
                commitHash: process.env.COMMIT_HASH,
                deploymentId: process.env.DEPLOYMENT_ID,
                ...partial?.applicationInfo
            },
            performanceMetrics: {
                executionTime: error?.context.performanceMetrics?.executionTime || 0,
                memoryDelta: memoryUsage.heapUsed,
                cpuDelta: cpuUsage.user + cpuUsage.system,
                networkLatency: partial?.performanceMetrics?.networkLatency,
                dbQueryTime: partial?.performanceMetrics?.dbQueryTime,
                cacheHitRate: partial?.performanceMetrics?.cacheHitRate,
                ...partial?.performanceMetrics
            },
            userInteraction: {
                userAgent: error?.context.requestInfo?.headers?.['user-agent'],
                ipAddress: 'unknown', // Should be provided by request context
                sessionDuration: Date.now() - new Date(this.sessionId).getTime(),
                actionsPerformed: 0, // Should be tracked separately
                lastAction: partial?.userInteraction?.lastAction,
                errorContext: error?.context.operationId,
                ...partial?.userInteraction
            },
            workflowTelemetry: error?.context.workflowId ? {
                workflowId: error.context.workflowId,
                nodeCount: 0, // Should be provided by workflow context
                connectionCount: 0,
                executionCount: 0,
                avgExecutionTime: 0,
                failureRate: 0,
                ...partial?.workflowTelemetry
            } : partial?.workflowTelemetry,
            customData: partial?.customData || {}
        };
    }
    /**
     * Process a log entry through all outputs
     */
    async processLogEntry(entry) {
        const promises = this.outputs
            .filter(output => output.enabled && this.shouldProcessEntry(entry, output))
            .map(output => this.processOutput(entry, output));
        await Promise.allSettled(promises);
    }
    /**
     * Check if entry should be processed by output based on level
     */
    shouldProcessEntry(entry, output) {
        const levels = [LogLevel.TRACE, LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
        const entryLevelIndex = levels.indexOf(entry.level);
        const outputLevelIndex = levels.indexOf(output.level);
        return entryLevelIndex >= outputLevelIndex;
    }
    /**
     * Process entry through specific output
     */
    async processOutput(entry, output) {
        try {
            if (!this.shouldProcessEntry(entry, output)) {
                return;
            }
            switch (output.type) {
                case 'console':
                    this.processConsoleOutput(entry, output);
                    break;
                case 'file':
                    await this.processFileOutput(entry, output);
                    break;
                case 'remote':
                    await this.processRemoteOutput(entry, output);
                    break;
                case 'sentry':
                    this.processSentryOutput(entry, output);
                    break;
                case 'datadog':
                    this.processDatadogOutput(entry, output);
                    break;
                case 'custom':
                    if (output.customHandler) {
                        await output.customHandler(entry);
                    }
                    break;
            }
        }
        catch (err) {
            console.error(`Failed to process log output: ${err.message}`);
        }
    }
    /**
     * Process console output
     */
    processConsoleOutput(entry, output) {
        const message = this.formatLogEntry(entry, output.format);
        switch (entry.level) {
            case LogLevel.FATAL:
            case LogLevel.ERROR:
                console.error(message);
                break;
            case LogLevel.WARN:
                console.warn(message);
                break;
            case LogLevel.INFO:
                console.info(message);
                break;
            case LogLevel.DEBUG:
            case LogLevel.TRACE:
                console.debug(message);
                break;
        }
    }
    /**
     * Process file output
     */
    async processFileOutput(entry, output) {
        if (!output.filePath)
            return;
        const message = this.formatLogEntry(entry, output.format) + '\n';
        try {
            // Check file size and rotate if necessary
            if (output.maxFileSize) {
                await this.rotateLogFile(output);
            }
            appendFileSync(output.filePath, message, 'utf8');
        }
        catch (error) {
            throw new Error(`Failed to write to log file: ${error.message}`);
        }
    }
    /**
     * Process remote output (batch)
     */
    async processRemoteOutput(entry, output) {
        if (output.batchSize && output.batchSize > 1) {
            return;
        }
        const { endpoint, apiKey } = output;
        if (!endpoint) {
            console.error("Remote output is missing endpoint URL.");
            return;
        }
        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }
        try {
            await fetch(endpoint, {
                method: 'POST',
                headers,
                body: JSON.stringify(entry),
            });
        }
        catch (error) {
            console.error(`Failed to send log to remote endpoint: ${error.message}`);
        }
    }
    /**
     * Process sentry output
     */
    processSentryOutput(entry, output) {
        if (entry.error) {
            Sentry.captureException(entry.error, {
                extra: { ...entry },
                tags: {
                    category: entry.category,
                    source: entry.source,
                    tags: entry.metadata.tags.join(', '),
                },
                user: { id: entry.context.userId, ip_address: entry.telemetry?.userInteraction.ipAddress },
                level: this.mapLogLevelToSentry(entry.level),
            });
        }
        else {
            Sentry.captureMessage(entry.message, {
                extra: { ...entry },
                tags: {
                    category: entry.category,
                    source: entry.source,
                    tags: entry.metadata.tags.join(', '),
                },
                user: { id: entry.context.userId, ip_address: entry.telemetry?.userInteraction.ipAddress },
                level: this.mapLogLevelToSentry(entry.level),
            });
        }
    }
    /**
     * Process datadog output
     */
    processDatadogOutput(entry, output) {
        const span = tracer.scope().active();
        if (span) {
            if (entry.error) {
                span.setTag('error', true);
                span.setTag('error.msg', entry.error.message);
                span.setTag('error.stack', entry.error.stackTrace);
                span.setTag('error.type', entry.error.originalError.name);
            }
            span.log({
                message: entry.message,
                level: entry.level,
                ...entry.context,
                ...entry.metadata,
            });
        }
    }
    /**
     * Flush batch queue to remote endpoint
     */
    async flushBatch(output) {
        if (this.batchQueue.length === 0)
            return;
        const batch = this.batchQueue.splice(0);
        if (this.flushTimer) {
            clearTimeout(this.flushTimer);
            this.flushTimer = null;
        }
        const outputsToFlush = output ? [output] : this.outputs.filter(o => o.type === 'remote');
        for (const output of outputsToFlush) {
            try {
                // In a real implementation, this would use fetch or axios
                // For now, we'll just emit an event
                this.emit('batch_flushed', { output, batch });
            }
            catch (error) {
                // Re-queue failed entries
                this.batchQueue.unshift(...batch);
                throw error;
            }
        }
    }
    /**
     * Check alert rules against log entry
     */
    async checkAlertRules(entry) {
        for (const rule of Array.from(this.alertRules.values())) {
            if (!rule.enabled)
                continue;
            const shouldTrigger = await this.evaluateAlertRule(rule, entry);
            if (shouldTrigger) {
                await this.triggerAlert(rule, entry);
            }
        }
    }
    /**
     * Evaluate if alert rule should trigger
     */
    async evaluateAlertRule(rule, entry) {
        const timeWindow = rule.conditions.timeWindow || 60; // minutes
        const startTime = new Date(Date.now() - timeWindow * 60 * 1000);
        const recentEntries = Array.from(this.logEntries.values())
            .filter(e => e.timestamp >= startTime);
        const errorEntries = recentEntries.filter(e => e.error);
        // Check error rate
        if (rule.conditions.errorRate) {
            const currentRate = errorEntries.length / timeWindow;
            if (currentRate >= rule.conditions.errorRate) {
                return true;
            }
        }
        // Check error count
        if (rule.conditions.errorCount) {
            if (errorEntries.length >= rule.conditions.errorCount) {
                return true;
            }
        }
        // Check severity filter
        if (rule.conditions.severity) {
            const matchingSeverity = errorEntries.filter(e => rule.conditions.severity.includes(e.metadata.severity));
            if (matchingSeverity.length > 0) {
                return true;
            }
        }
        // Check category filter
        if (rule.conditions.categories) {
            const matchingCategory = errorEntries.filter(e => rule.conditions.categories.includes(e.metadata.category));
            if (matchingCategory.length > 0) {
                return true;
            }
        }
        return false;
    }
    /**
     * Trigger an alert
     */
    async triggerAlert(rule, triggerEntry) {
        // Check throttling
        const existingAlert = this.activeAlerts.get(rule.id);
        if (existingAlert && this.isThrottled(rule, existingAlert)) {
            return;
        }
        const alertId = this.generateAlertId();
        const timeWindow = rule.conditions.timeWindow || 60;
        const startTime = new Date(Date.now() - timeWindow * 60 * 1000);
        const recentErrors = Array.from(this.logEntries.values())
            .filter(e => e.error && e.timestamp >= startTime);
        const alert = {
            id: alertId,
            ruleId: rule.id,
            ruleName: rule.name,
            timestamp: new Date(),
            severity: this.mapRuleSeverity(rule),
            triggerCondition: this.describeTriggerCondition(rule),
            affectedCount: recentErrors.length,
            timeWindow,
            relatedErrors: recentErrors.map(e => e.id),
            errorSummary: {
                totalErrors: recentErrors.length,
                bySeverity: this.countBySeverity(recentErrors),
                byCategory: this.countByCategory(recentErrors),
                topErrors: this.getTopErrors(recentErrors)
            },
            suggestedActions: this.generateSuggestedActions(rule, recentErrors),
            metadata: {
                environment: process.env.NODE_ENV || 'development',
                systemLoad: process.cpuUsage().user + process.cpuUsage().system,
                affectedUsers: new Set(recentErrors.map(e => e.context.userId).filter(Boolean)).size,
                correlationId: this.generateCorrelationId()
            }
        };
        // Store active alert
        this.activeAlerts.set(rule.id, alert);
        // Execute alert actions
        await this.executeAlertActions(rule, alert);
        // Emit event
        this.emit('alert_triggered', alert);
    }
    /**
     * Initialize default outputs
     */
    initializeDefaultOutputs() {
        this.outputs = [
            {
                type: 'console',
                enabled: true,
                level: LogLevel.INFO,
                format: 'text'
            },
            {
                type: 'file',
                enabled: true,
                level: LogLevel.DEBUG,
                format: 'json',
                filePath: join(this.logDirectory, 'activity.log'),
                maxFileSize: 10, // 10 MB
                maxFiles: 5,
            },
            {
                type: 'sentry',
                enabled: false,
                level: LogLevel.WARN,
                format: 'structured',
                dsn: process.env.SENTRY_DSN || '',
            },
            {
                type: 'datadog',
                enabled: false,
                level: LogLevel.INFO,
                format: 'structured',
                remoteType: 'datadog',
                service: 'n8n-ultimate',
            },
        ];
    }
    /**
     * Initialize default alert rules
     */
    initializeDefaultAlertRules() {
        // High error rate alert
        this.addAlertRule({
            id: 'high_error_rate',
            name: 'High Error Rate',
            description: 'Triggers when error rate exceeds threshold',
            enabled: true,
            conditions: {
                errorRate: 10, // 10 errors per minute
                timeWindow: 5
            },
            actions: {
                email: [],
                webhook: undefined
            },
            throttle: {
                maxAlertsPerHour: 2,
                cooldownPeriod: 30
            }
        });
        // Critical error alert
        this.addAlertRule({
            id: 'critical_errors',
            name: 'Critical Errors',
            description: 'Triggers on any critical error',
            enabled: true,
            conditions: {
                severity: [ErrorSeverity.CRITICAL],
                errorCount: 1,
                timeWindow: 1
            },
            actions: {
                email: [],
                webhook: undefined
            },
            throttle: {
                maxAlertsPerHour: 10,
                cooldownPeriod: 5
            }
        });
    }
    /**
     * Utility methods
     */
    generateSessionId() {
        return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateLogId() {
        return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    generateCorrelationId() {
        return `corr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }
    generateAlertId() {
        return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    mapSeverityToLogLevel(severity) {
        switch (severity) {
            case ErrorSeverity.CRITICAL: return LogLevel.FATAL;
            case ErrorSeverity.HIGH: return LogLevel.ERROR;
            case ErrorSeverity.MEDIUM: return LogLevel.WARN;
            case ErrorSeverity.LOW: return LogLevel.INFO;
            case ErrorSeverity.INFO: return LogLevel.DEBUG;
            default: return LogLevel.INFO;
        }
    }
    formatLogEntry(entry, format) {
        switch (format) {
            case 'json':
                return JSON.stringify(entry);
            case 'structured':
                return `[${entry.timestamp.toISOString()}] ${entry.level.toUpperCase()} [${entry.category}] ${entry.message}`;
            case 'text':
            default:
                return `${entry.timestamp.toISOString()} [${entry.level.toUpperCase()}] ${entry.message}`;
        }
    }
    ensureLogDirectory() {
        if (!existsSync(this.logDirectory)) {
            mkdirSync(this.logDirectory, { recursive: true });
        }
    }
    async rotateLogFile(output) {
        // Simplified rotation logic - in production, use a proper log rotation library
        if (output.filePath && existsSync(output.filePath)) {
            const stats = require('fs').statSync(output.filePath);
            const maxSize = (output.maxFileSize || 10) * 1024 * 1024; // Convert MB to bytes
            if (stats.size >= maxSize) {
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const rotatedPath = `${output.filePath}.${timestamp}`;
                require('fs').renameSync(output.filePath, rotatedPath);
            }
        }
    }
    cleanupOldEntries() {
        if (this.logEntries.size > this.maxHistorySize) {
            const entries = Array.from(this.logEntries.entries())
                .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
            const toRemove = entries.slice(0, entries.length - this.maxHistorySize);
            toRemove.forEach(([id]) => this.logEntries.delete(id));
        }
    }
    startMetricsCollection() {
        this.metricsInterval = setInterval(() => {
            const metrics = this.getMetrics(5); // 5-minute window
            this.emit('metrics_collected', metrics);
        }, 60000); // Every minute
    }
    countBySeverity(entries) {
        const counts = {};
        for (const severity of Object.values(ErrorSeverity)) {
            counts[severity] = entries.filter(e => e.metadata.severity === severity).length;
        }
        return counts;
    }
    countByCategory(entries) {
        const counts = {};
        for (const category of Object.values(ErrorCategory)) {
            counts[category] = entries.filter(e => e.metadata.category === category).length;
        }
        return counts;
    }
    countByType(entries) {
        const counts = {};
        for (const type of Object.values(ErrorType)) {
            counts[type] = entries.filter(e => e.metadata.type === type).length;
        }
        return counts;
    }
    calculatePerformanceMetrics(entries) {
        const responseTimes = entries
            .map(e => e.telemetry?.performanceMetrics.executionTime)
            .filter(Boolean);
        const avgResponseTime = responseTimes.length > 0
            ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length
            : 0;
        const sortedTimes = responseTimes.sort((a, b) => a - b);
        const p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
        const p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;
        return {
            avgResponseTime,
            p95ResponseTime,
            p99ResponseTime,
            throughput: entries.length / 60, // per minute
            memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100,
            cpuUsage: 0, // Would need more sophisticated CPU monitoring
            diskUsage: 0 // Would need disk usage monitoring
        };
    }
    calculateUserMetrics(entries) {
        const uniqueUsers = new Set(entries.map(e => e.context.userId).filter(Boolean));
        const errorUsers = new Set(entries.filter(e => e.error).map(e => e.context.userId).filter(Boolean));
        return {
            activeUsers: uniqueUsers.size,
            affectedUsers: errorUsers.size,
            userSatisfactionScore: 0.8, // Would need user feedback data
            avgSessionDuration: 0 // Would need session tracking
        };
    }
    calculateSystemHealth(errorMetrics, performanceMetrics) {
        // Simplified health scoring
        let score = 100;
        // Reduce score based on error rate
        if (errorMetrics.errorRate > 5)
            score -= 20;
        if (errorMetrics.errorRate > 10)
            score -= 30;
        // Reduce score based on performance
        if (performanceMetrics.avgResponseTime > 1000)
            score -= 15;
        if (performanceMetrics.avgResponseTime > 5000)
            score -= 25;
        return {
            overallScore: Math.max(0, score),
            availability: 99.9, // Would need uptime monitoring
            reliability: 99.5, // Would need failure rate calculation
            errorRecoveryRate: 85, // Would need recovery tracking
            alertsTriggered: this.activeAlerts.size
        };
    }
    convertToCsv(entries) {
        const headers = ['timestamp', 'level', 'category', 'message', 'severity', 'userId', 'workflowId'];
        const rows = entries.map(entry => [
            entry.timestamp.toISOString(),
            entry.level,
            entry.category,
            entry.message.replace(/"/g, '""'),
            entry.metadata.severity || '',
            entry.context.userId || '',
            entry.context.workflowId || ''
        ]);
        return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    }
    convertToText(entries) {
        return entries.map(entry => `${entry.timestamp.toISOString()} [${entry.level.toUpperCase()}] [${entry.category}] ${entry.message}`).join('\n');
    }
    isThrottled(rule, existingAlert) {
        const now = Date.now();
        const cooldownMs = (rule.throttle.cooldownPeriod || 60) * 60 * 1000;
        return (now - existingAlert.timestamp.getTime()) < cooldownMs;
    }
    mapRuleSeverity(rule) {
        if (rule.conditions.severity?.includes(ErrorSeverity.CRITICAL))
            return 'critical';
        if (rule.conditions.severity?.includes(ErrorSeverity.HIGH))
            return 'high';
        if (rule.conditions.severity?.includes(ErrorSeverity.MEDIUM))
            return 'medium';
        return 'low';
    }
    describeTriggerCondition(rule) {
        const conditions = [];
        if (rule.conditions.errorRate)
            conditions.push(`Error rate: ${rule.conditions.errorRate}/min`);
        if (rule.conditions.errorCount)
            conditions.push(`Error count: ${rule.conditions.errorCount}`);
        if (rule.conditions.severity)
            conditions.push(`Severity: ${rule.conditions.severity.join(', ')}`);
        return conditions.join(', ');
    }
    generateSuggestedActions(rule, errors) {
        const actions = ['Check system logs for details'];
        if (errors.some(e => e.metadata.category === ErrorCategory.NETWORK)) {
            actions.push('Verify network connectivity');
        }
        if (errors.some(e => e.metadata.category === ErrorCategory.SYSTEM)) {
            actions.push('Check system resources (CPU, memory, disk)');
        }
        if (errors.some(e => e.metadata.category === ErrorCategory.WORKFLOW_GENERATION)) {
            actions.push('Review workflow configurations');
        }
        return actions;
    }
    getTopErrors(entries) {
        const typeCounts = new Map();
        entries.forEach(entry => {
            if (entry.metadata.type) {
                typeCounts.set(entry.metadata.type, (typeCounts.get(entry.metadata.type) || 0) + 1);
            }
        });
        return Array.from(typeCounts.entries())
            .map(([type, count]) => ({ type, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }
    async executeAlertActions(rule, alert) {
        // In a real implementation, this would send emails, webhooks, etc.
        // For now, just emit events
        this.emit('alert_action_executed', { rule, alert });
    }
    mapLogLevelToSentry(level) {
        switch (level) {
            case LogLevel.TRACE:
                return 'debug';
            case LogLevel.DEBUG:
                return 'debug';
            case LogLevel.INFO:
                return 'info';
            case LogLevel.WARN:
                return 'warning';
            case LogLevel.ERROR:
                return 'error';
            case LogLevel.FATAL:
                return 'fatal';
            default:
                return 'info';
        }
    }
}
export default AdvancedErrorLogger;
//# sourceMappingURL=error-logger.js.map