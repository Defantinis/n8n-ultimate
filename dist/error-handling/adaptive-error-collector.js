/**
 * Adaptive Error Collector
 * Dynamically adjusts error detail collection based on system performance
 */
import { EventEmitter } from 'events';
/**
 * Collection modes with different detail levels
 */
export var CollectionMode;
(function (CollectionMode) {
    CollectionMode["FULL"] = "full";
    CollectionMode["REDUCED"] = "reduced";
    CollectionMode["MINIMAL"] = "minimal";
    CollectionMode["EMERGENCY"] = "emergency"; // System preservation mode, errors to memory only
})(CollectionMode || (CollectionMode = {}));
/**
 * Adaptive Error Collector class
 */
export class AdaptiveErrorCollector extends EventEmitter {
    performanceMonitor;
    currentMode = CollectionMode.FULL;
    configs = new Map();
    errorQueue = [];
    processingTimer = null;
    stats;
    isProcessing = false;
    modeTransitionHistory = [];
    constructor(performanceMonitor) {
        super();
        this.performanceMonitor = performanceMonitor;
        this.initializeConfigs();
        this.initializeStats();
        this.setupPerformanceMonitoring();
        this.startProcessing();
    }
    /**
     * Process an error with adaptive collection
     */
    async processError(error, originalContext) {
        const startTime = performance.now();
        const opId = this.performanceMonitor.startOperation('adaptive-collection');
        try {
            // Check if we can process this error based on current performance
            const canProcess = this.canProcessError(error);
            if (!canProcess.allowed) {
                this.stats.errorsSkipped++;
                return {
                    processed: false,
                    reason: canProcess.reason,
                    mode: this.currentMode,
                    overhead: this.performanceMonitor.endOperation(opId)
                };
            }
            // Get current collection config
            const config = this.configs.get(this.currentMode);
            // Adapt error details based on current mode
            const adaptedError = await this.adaptErrorDetails(error, config, originalContext);
            // Queue for processing if needed
            if (this.shouldQueue(config)) {
                this.errorQueue.push({ error: adaptedError, timestamp: new Date() });
                this.stats.errorsQueued++;
                // Check queue limits
                this.enforceQueueLimits(config);
            }
            else {
                // Process immediately
                await this.processErrorImmediate(adaptedError, config);
                this.stats.errorsProcessed++;
            }
            const overhead = this.performanceMonitor.endOperation(opId);
            this.updateStats(overhead);
            return {
                processed: true,
                mode: this.currentMode,
                overhead,
                reducedDetails: this.getReducedDetails(config)
            };
        }
        catch (processingError) {
            this.performanceMonitor.endOperation(opId);
            this.emit('processing-error', processingError, error);
            return {
                processed: false,
                reason: `Processing failed: ${processingError.message}`,
                mode: this.currentMode,
                overhead: performance.now() - startTime
            };
        }
    }
    /**
     * Set collection mode manually
     */
    setMode(mode, reason = 'manual') {
        if (mode === this.currentMode)
            return;
        const previousMode = this.currentMode;
        this.currentMode = mode;
        // Record transition
        this.modeTransitionHistory.push({
            from: previousMode,
            to: mode,
            timestamp: new Date(),
            reason
        });
        // Emit mode change event
        this.emit('mode-changed', {
            from: previousMode,
            to: mode,
            reason,
            config: this.configs.get(mode)
        });
        this.updateProcessingTimer();
    }
    /**
     * Get current collection statistics
     */
    getStats() {
        return {
            ...this.stats,
            timestamp: new Date(),
            mode: this.currentMode,
            modeTransitions: [...this.modeTransitionHistory.slice(-10)] // Last 10 transitions
        };
    }
    /**
     * Get current mode and configuration
     */
    getCurrentConfig() {
        return {
            mode: this.currentMode,
            config: this.configs.get(this.currentMode)
        };
    }
    /**
     * Update configuration for a specific mode
     */
    updateConfig(mode, updates) {
        const current = this.configs.get(mode);
        if (current) {
            this.configs.set(mode, { ...current, ...updates });
            if (mode === this.currentMode) {
                this.updateProcessingTimer();
            }
            this.emit('config-updated', { mode, config: this.configs.get(mode) });
        }
    }
    /**
     * Force process queued errors
     */
    async flushQueue() {
        if (this.isProcessing)
            return 0;
        const processed = await this.processQueuedErrors(true);
        this.emit('queue-flushed', { processed, remaining: this.errorQueue.length });
        return processed;
    }
    /**
     * Get queue status
     */
    getQueueStatus() {
        const now = Date.now();
        const ages = this.errorQueue.map(item => now - item.timestamp.getTime());
        return {
            size: this.errorQueue.length,
            oldestError: this.errorQueue.length > 0 ? this.errorQueue[0].timestamp : null,
            averageAge: ages.length > 0 ? ages.reduce((a, b) => a + b, 0) / ages.length : 0,
            isProcessing: this.isProcessing
        };
    }
    /**
     * Shutdown the collector
     */
    async shutdown() {
        // Stop processing timer
        if (this.processingTimer) {
            clearInterval(this.processingTimer);
            this.processingTimer = null;
        }
        // Process remaining errors
        await this.flushQueue();
        this.emit('shutdown');
    }
    /**
     * Check if error can be processed based on current performance
     */
    canProcessError(error) {
        const config = this.configs.get(this.currentMode);
        // Check severity threshold
        const severityOrder = ['info', 'low', 'medium', 'high', 'critical'];
        const errorSeverityIndex = severityOrder.indexOf(error.severity);
        const thresholdIndex = severityOrder.indexOf(config.severityThreshold);
        if (errorSeverityIndex < thresholdIndex) {
            return { allowed: false, reason: 'Below severity threshold' };
        }
        // Check category filter
        if (config.categoryFilter.length > 0 && !config.categoryFilter.includes(error.category)) {
            return { allowed: false, reason: 'Category filtered out' };
        }
        // Check type filter
        if (config.typeFilter.length > 0 && !config.typeFilter.includes(error.type)) {
            return { allowed: false, reason: 'Type filtered out' };
        }
        // Check performance constraints
        const canProcessByPerformance = this.performanceMonitor.canProcessError(this.mapSeverityToPerformanceLevel(error.severity));
        if (!canProcessByPerformance) {
            return { allowed: false, reason: 'System performance constraints' };
        }
        // Check rate limits
        if (this.stats.errorsProcessed > config.maxErrorsPerSecond) {
            return { allowed: false, reason: 'Rate limit exceeded' };
        }
        return { allowed: true };
    }
    /**
     * Adapt error details based on collection mode
     */
    async adaptErrorDetails(error, config, originalContext) {
        const adapted = { ...error };
        // Adapt telemetry
        if (!config.collectTelemetry) {
            // Remove telemetry data
            if (adapted.context) {
                adapted.context = {
                    ...adapted.context,
                    performanceMetrics: undefined,
                    systemInfo: undefined,
                    requestInfo: undefined
                };
            }
        }
        else if (config.telemetryDetail === 'minimal') {
            // Keep only essential telemetry
            if (adapted.context?.performanceMetrics) {
                adapted.context.performanceMetrics = {
                    executionTime: adapted.context.performanceMetrics.executionTime,
                    memoryDelta: 0,
                    cpuUsage: 0
                };
            }
        }
        // Adapt stack trace
        if (!config.collectStackTrace) {
            adapted.stackTrace = 'Stack trace collection disabled for performance';
        }
        // Adapt context
        if (!config.collectContext && adapted.context) {
            adapted.context = {
                timestamp: adapted.context.timestamp,
                userId: adapted.context.userId,
                sessionId: adapted.context.sessionId
            };
        }
        // Adapt metadata
        if (!config.collectMetadata) {
            adapted.metadata = {};
        }
        // Adapt related errors
        if (!config.collectRelatedErrors) {
            adapted.relatedErrors = [];
        }
        return adapted;
    }
    /**
     * Determine if error should be queued
     */
    shouldQueue(config) {
        return config.batchSize > 1 || config.processingDelay > 0;
    }
    /**
     * Process error immediately
     */
    async processErrorImmediate(error, config) {
        // This would integrate with the actual error processing system
        // For now, we'll emit an event
        this.emit('error-processed', { error, config, immediate: true });
    }
    /**
     * Enforce queue size limits
     */
    enforceQueueLimits(config) {
        if (this.errorQueue.length > config.maxQueueSize) {
            // Remove oldest errors, keeping the most recent ones
            const excess = this.errorQueue.length - config.maxQueueSize;
            this.errorQueue.splice(0, excess);
            this.emit('queue-overflow', {
                removed: excess,
                remaining: this.errorQueue.length
            });
        }
    }
    /**
     * Start processing timer
     */
    startProcessing() {
        this.updateProcessingTimer();
    }
    /**
     * Update processing timer based on current config
     */
    updateProcessingTimer() {
        if (this.processingTimer) {
            clearInterval(this.processingTimer);
            this.processingTimer = null;
        }
        const config = this.configs.get(this.currentMode);
        if (config.processingDelay > 0) {
            this.processingTimer = setInterval(() => {
                this.processQueuedErrors(false);
            }, config.processingDelay);
        }
    }
    /**
     * Process queued errors
     */
    async processQueuedErrors(forceAll = false) {
        if (this.isProcessing || this.errorQueue.length === 0) {
            return 0;
        }
        this.isProcessing = true;
        const config = this.configs.get(this.currentMode);
        const batchSize = forceAll ? this.errorQueue.length : Math.min(config.batchSize, this.errorQueue.length);
        const batch = this.errorQueue.splice(0, batchSize);
        let processed = 0;
        try {
            for (const item of batch) {
                await this.processErrorImmediate(item.error, config);
                processed++;
                this.stats.errorsProcessed++;
            }
            this.emit('batch-processed', { processed, remaining: this.errorQueue.length });
        }
        catch (error) {
            this.emit('batch-error', error);
        }
        finally {
            this.isProcessing = false;
        }
        return processed;
    }
    /**
     * Setup performance monitoring for adaptive behavior
     */
    setupPerformanceMonitoring() {
        this.performanceMonitor.on('metrics-collected', (metrics) => {
            this.adaptToPerformance(metrics);
        });
        this.performanceMonitor.on('performance-alert', (alert) => {
            this.handlePerformanceAlert(alert);
        });
    }
    /**
     * Adapt collection mode based on performance metrics
     */
    adaptToPerformance(metrics) {
        const currentMode = this.currentMode;
        let targetMode = currentMode;
        switch (metrics.recommendedMode) {
            case 'minimal':
                targetMode = CollectionMode.MINIMAL;
                break;
            case 'reduced':
                targetMode = CollectionMode.REDUCED;
                break;
            case 'full':
                targetMode = CollectionMode.FULL;
                break;
        }
        if (targetMode !== currentMode) {
            this.setMode(targetMode, `Performance-based adaptation: ${metrics.performanceStatus}`);
        }
    }
    /**
     * Handle performance alerts
     */
    handlePerformanceAlert(alert) {
        if (alert.severity === 'critical') {
            // Switch to emergency mode if not already there
            if (this.currentMode !== CollectionMode.EMERGENCY) {
                this.setMode(CollectionMode.EMERGENCY, `Critical performance alert: ${alert.type}`);
            }
        }
    }
    /**
     * Initialize default configurations for each mode
     */
    initializeConfigs() {
        // Full mode - comprehensive error collection
        this.configs.set(CollectionMode.FULL, {
            mode: CollectionMode.FULL,
            collectTelemetry: true,
            collectStackTrace: true,
            collectContext: true,
            collectMetadata: true,
            collectRelatedErrors: true,
            telemetryDetail: 'full',
            contextDetail: 'full',
            maxErrorsPerSecond: 100,
            maxQueueSize: 1000,
            batchSize: 10,
            processingDelay: 100,
            severityThreshold: 'info',
            categoryFilter: [],
            typeFilter: [],
            storageMode: 'file',
            maxStorageSize: 10000,
            compressionEnabled: false
        });
        // Reduced mode - essential details only
        this.configs.set(CollectionMode.REDUCED, {
            mode: CollectionMode.REDUCED,
            collectTelemetry: true,
            collectStackTrace: true,
            collectContext: true,
            collectMetadata: false,
            collectRelatedErrors: false,
            telemetryDetail: 'standard',
            contextDetail: 'standard',
            maxErrorsPerSecond: 50,
            maxQueueSize: 500,
            batchSize: 20,
            processingDelay: 200,
            severityThreshold: 'low',
            categoryFilter: [],
            typeFilter: [],
            storageMode: 'file',
            maxStorageSize: 5000,
            compressionEnabled: true
        });
        // Minimal mode - critical errors only
        this.configs.set(CollectionMode.MINIMAL, {
            mode: CollectionMode.MINIMAL,
            collectTelemetry: false,
            collectStackTrace: true,
            collectContext: false,
            collectMetadata: false,
            collectRelatedErrors: false,
            telemetryDetail: 'minimal',
            contextDetail: 'minimal',
            maxErrorsPerSecond: 20,
            maxQueueSize: 100,
            batchSize: 50,
            processingDelay: 500,
            severityThreshold: 'high',
            categoryFilter: [],
            typeFilter: [],
            storageMode: 'memory',
            maxStorageSize: 1000,
            compressionEnabled: true
        });
        // Emergency mode - system preservation
        this.configs.set(CollectionMode.EMERGENCY, {
            mode: CollectionMode.EMERGENCY,
            collectTelemetry: false,
            collectStackTrace: false,
            collectContext: false,
            collectMetadata: false,
            collectRelatedErrors: false,
            telemetryDetail: 'minimal',
            contextDetail: 'minimal',
            maxErrorsPerSecond: 5,
            maxQueueSize: 50,
            batchSize: 100,
            processingDelay: 1000,
            severityThreshold: 'critical',
            categoryFilter: [],
            typeFilter: [],
            storageMode: 'memory',
            maxStorageSize: 100,
            compressionEnabled: true
        });
    }
    /**
     * Initialize statistics tracking
     */
    initializeStats() {
        this.stats = {
            timestamp: new Date(),
            mode: this.currentMode,
            errorsProcessed: 0,
            errorsSkipped: 0,
            errorsQueued: 0,
            averageProcessingTime: 0,
            totalOverhead: 0,
            memoryUsage: 0,
            queueUtilization: 0,
            modeTransitions: []
        };
    }
    /**
     * Update processing statistics
     */
    updateStats(overhead) {
        this.stats.totalOverhead += overhead;
        this.stats.averageProcessingTime = this.stats.errorsProcessed > 0
            ? this.stats.totalOverhead / this.stats.errorsProcessed
            : 0;
        const config = this.configs.get(this.currentMode);
        this.stats.queueUtilization = this.errorQueue.length / config.maxQueueSize;
        this.stats.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    }
    /**
     * Map error severity to performance level
     */
    mapSeverityToPerformanceLevel(severity) {
        switch (severity) {
            case 'critical': return 'critical';
            case 'high': return 'high';
            case 'medium': return 'medium';
            default: return 'low';
        }
    }
    /**
     * Get list of details reduced in current mode
     */
    getReducedDetails(config) {
        const reduced = [];
        if (!config.collectTelemetry)
            reduced.push('telemetry');
        if (!config.collectStackTrace)
            reduced.push('stackTrace');
        if (!config.collectContext)
            reduced.push('context');
        if (!config.collectMetadata)
            reduced.push('metadata');
        if (!config.collectRelatedErrors)
            reduced.push('relatedErrors');
        return reduced;
    }
}
//# sourceMappingURL=adaptive-error-collector.js.map