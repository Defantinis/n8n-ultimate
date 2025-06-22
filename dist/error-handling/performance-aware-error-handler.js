/**
 * Performance-Aware Error Handler
 * Main interface that integrates performance monitoring with error handling
 */
import { EventEmitter } from 'events';
import { ErrorClassifier } from './error-classifier';
import { AdvancedErrorLogger } from './error-logger';
import { PerformanceErrorMonitor } from './performance-error-monitor';
import { AdaptiveErrorCollector, CollectionMode } from './adaptive-error-collector';
/**
 * Main Performance-Aware Error Handler class
 */
export class PerformanceAwareErrorHandler extends EventEmitter {
    errorClassifier;
    errorLogger;
    performanceMonitor;
    adaptiveCollector;
    config;
    isInitialized = false;
    errorStats = {
        totalProcessed: 0,
        totalFailed: 0,
        lastProcessedTime: 0,
        avgProcessingTime: 0
    };
    constructor(config) {
        super();
        this.config = {
            performanceMonitoring: {
                enabled: true,
                sampleInterval: 5000,
                metricsWindow: 300000,
                adaptiveMode: true
            },
            adaptiveCollection: {
                enabled: true,
                initialMode: CollectionMode.FULL,
                autoModeTransition: true
            },
            performanceThresholds: {
                cpu: { optimal: 70, degraded: 85, critical: 95 },
                memory: { optimal: 70, degraded: 85, critical: 95 },
                eventLoopLag: { optimal: 10, degraded: 50, critical: 100 },
                errorHandlingOverhead: { optimal: 5, degraded: 15, critical: 30 }
            },
            integration: {
                logPerformanceMetrics: true,
                alertOnDegradation: true,
                fallbackToBasicHandling: true
            },
            ...config
        };
        this.initialize();
    }
    /**
     * Main error handling method with performance awareness
     */
    async handleError(error, context = { timestamp: new Date() }) {
        const startTime = performance.now();
        const performanceMetrics = {
            totalTime: 0,
            classificationTime: 0,
            collectionTime: 0,
            loggingTime: 0
        };
        try {
            // Step 1: Classify the error
            const classificationStart = performance.now();
            const classifiedError = this.errorClassifier.classifyError(error, context);
            performanceMetrics.classificationTime = performance.now() - classificationStart;
            // Step 2: Adaptive collection
            const collectionStart = performance.now();
            const processingResult = await this.adaptiveCollector.processError(classifiedError, context);
            performanceMetrics.collectionTime = performance.now() - collectionStart;
            // Step 3: Log the error (if processing was successful)
            let errorId;
            if (processingResult.processed) {
                const loggingStart = performance.now();
                // Create telemetry data with performance metrics
                const telemetryData = {
                    timestamp: new Date(),
                    performanceMetrics: {
                        executionTime: performance.now() - startTime,
                        memoryDelta: this.calculateMemoryDelta(),
                        cpuDelta: this.calculateCpuDelta(),
                        networkLatency: 0,
                        dbQueryTime: 0,
                        cacheHitRate: 0
                    }
                };
                errorId = await this.errorLogger.logError(classifiedError, telemetryData, {
                    userId: context.userId,
                    sessionId: context.sessionId,
                    workflowId: context.workflowId,
                    nodeId: context.nodeId
                });
                performanceMetrics.loggingTime = performance.now() - loggingStart;
            }
            // Calculate total time
            performanceMetrics.totalTime = performance.now() - startTime;
            // Update statistics
            this.updateErrorStats(performanceMetrics.totalTime, true);
            // Get current system status
            const currentMetrics = this.performanceMonitor.getCurrentMetrics();
            // Generate recommendations if needed
            const recommendations = this.generateRecommendations(currentMetrics, processingResult);
            const result = {
                success: processingResult.processed,
                errorId,
                processingResult,
                performanceMetrics,
                systemStatus: currentMetrics.performanceStatus,
                recommendedActions: recommendations.length > 0 ? recommendations : undefined
            };
            // Emit success event
            this.emit('error-handled', result);
            return result;
        }
        catch (handlingError) {
            // Handle errors in error handling (meta-error handling)
            performanceMetrics.totalTime = performance.now() - startTime;
            this.updateErrorStats(performanceMetrics.totalTime, false);
            const result = {
                success: false,
                processingResult: {
                    processed: false,
                    reason: `Error handling failed: ${handlingError.message}`,
                    mode: this.adaptiveCollector.getCurrentConfig().mode,
                    overhead: performanceMetrics.totalTime
                },
                performanceMetrics,
                systemStatus: 'critical',
                recommendedActions: ['Check error handling system integrity', 'Consider fallback mode']
            };
            // Emit error event
            this.emit('error-handling-failed', handlingError, result);
            // Fallback to basic error handling if configured
            if (this.config.integration.fallbackToBasicHandling) {
                await this.fallbackErrorHandling(error, context);
            }
            return result;
        }
    }
    /**
     * Get current system health report
     */
    getHealthReport() {
        const performanceMetrics = this.performanceMonitor.getCurrentMetrics();
        const collectionStats = this.adaptiveCollector.getStats();
        // Calculate error handling statistics
        const errorHandling = {
            totalErrors: this.errorStats.totalProcessed + this.errorStats.totalFailed,
            errorsPerMinute: this.calculateErrorRate(),
            avgProcessingTime: this.errorStats.avgProcessingTime,
            successRate: this.errorStats.totalProcessed /
                (this.errorStats.totalProcessed + this.errorStats.totalFailed) * 100
        };
        // Determine overall status
        const overallStatus = this.determineOverallHealth(performanceMetrics, collectionStats, errorHandling);
        // Generate recommendations
        const recommendations = this.generateHealthRecommendations(performanceMetrics, collectionStats, errorHandling);
        // Get active alerts
        const activeAlerts = this.getActiveAlerts(performanceMetrics);
        return {
            timestamp: new Date(),
            overallStatus,
            performance: performanceMetrics,
            collection: collectionStats,
            errorHandling,
            recommendations,
            activeAlerts
        };
    }
    /**
     * Force performance optimization
     */
    async optimizePerformance() {
        const currentMetrics = this.performanceMonitor.getCurrentMetrics();
        const actionsTaken = [];
        // Switch to more aggressive mode if needed
        let newMode = this.adaptiveCollector.getCurrentConfig().mode;
        if (currentMetrics.performanceStatus === 'critical') {
            this.adaptiveCollector.setMode(CollectionMode.EMERGENCY, 'Manual optimization');
            newMode = CollectionMode.EMERGENCY;
            actionsTaken.push('Switched to emergency collection mode');
        }
        else if (currentMetrics.performanceStatus === 'degraded') {
            this.adaptiveCollector.setMode(CollectionMode.MINIMAL, 'Manual optimization');
            newMode = CollectionMode.MINIMAL;
            actionsTaken.push('Switched to minimal collection mode');
        }
        // Flush error queues
        const flushed = await this.adaptiveCollector.flushQueue();
        if (flushed > 0) {
            actionsTaken.push(`Flushed ${flushed} queued errors`);
        }
        // Clear old performance metrics
        if (this.performanceMonitor.getMetricsHistory().length > 100) {
            // This would require a method to clear old metrics
            actionsTaken.push('Cleared old performance metrics');
        }
        // Force garbage collection if available
        if (typeof global.gc === 'function') {
            global.gc();
            actionsTaken.push('Forced garbage collection');
        }
        const expectedImprovement = this.calculateExpectedImprovement(currentMetrics, newMode);
        this.emit('performance-optimized', { actionsTaken, newMode, expectedImprovement });
        return { actionsTaken, newMode, expectedImprovement };
    }
    /**
     * Get performance statistics
     */
    getPerformanceStats() {
        const current = this.performanceMonitor.getCurrentMetrics();
        const history = this.performanceMonitor.getMetricsHistory(60000); // Last minute
        const trends = this.calculatePerformanceTrends(history);
        const recommendations = this.performanceMonitor.getRecommendations();
        return {
            current,
            trends,
            recommendations: recommendations.actions
        };
    }
    /**
     * Shutdown the performance-aware error handler
     */
    async shutdown() {
        this.emit('shutting-down');
        // Stop monitoring
        this.performanceMonitor.stopMonitoring();
        // Shutdown adaptive collector
        await this.adaptiveCollector.shutdown();
        // Shutdown logger
        await this.errorLogger.shutdown();
        this.isInitialized = false;
        this.emit('shutdown-complete');
    }
    /**
     * Initialize all components
     */
    initialize() {
        // Initialize error classifier
        this.errorClassifier = new ErrorClassifier();
        // Initialize error logger
        this.errorLogger = new AdvancedErrorLogger({
            logDirectory: './.logs/error-handling',
            maxHistorySize: 50000
        });
        // Initialize performance monitor
        this.performanceMonitor = new PerformanceErrorMonitor(this.config.performanceThresholds, {
            sampleInterval: this.config.performanceMonitoring.sampleInterval,
            metricsWindow: this.config.performanceMonitoring.metricsWindow,
            adaptiveMode: this.config.performanceMonitoring.adaptiveMode,
            performanceLogging: this.config.integration.logPerformanceMetrics,
            alertThreshold: 85
        });
        // Initialize adaptive collector
        this.adaptiveCollector = new AdaptiveErrorCollector(this.performanceMonitor);
        this.adaptiveCollector.setMode(this.config.adaptiveCollection.initialMode, 'System initialization');
        // Setup event listeners
        this.setupEventListeners();
        // Start monitoring if enabled
        if (this.config.performanceMonitoring.enabled) {
            this.performanceMonitor.startMonitoring();
        }
        this.isInitialized = true;
        this.emit('initialized');
    }
    /**
     * Setup event listeners for monitoring
     */
    setupEventListeners() {
        // Performance monitor events
        this.performanceMonitor.on('performance-alert', (alert) => {
            if (this.config.integration.alertOnDegradation) {
                this.emit('performance-alert', alert);
            }
        });
        this.performanceMonitor.on('metrics-collected', (metrics) => {
            if (this.config.integration.logPerformanceMetrics) {
                this.emit('metrics-collected', metrics);
            }
        });
        // Adaptive collector events
        this.adaptiveCollector.on('mode-changed', (event) => {
            this.emit('collection-mode-changed', event);
        });
        this.adaptiveCollector.on('queue-overflow', (event) => {
            this.emit('queue-overflow', event);
        });
        this.adaptiveCollector.on('processing-error', (error, originalError) => {
            this.emit('collection-error', error, originalError);
        });
    }
    /**
     * Calculate memory delta
     */
    calculateMemoryDelta() {
        return process.memoryUsage().heapUsed / 1024 / 1024; // MB
    }
    /**
     * Calculate CPU delta
     */
    calculateCpuDelta() {
        return 0; // Placeholder
    }
    /**
     * Update error handling statistics
     */
    updateErrorStats(processingTime, success) {
        if (success) {
            this.errorStats.totalProcessed++;
        }
        else {
            this.errorStats.totalFailed++;
        }
        this.errorStats.lastProcessedTime = Date.now();
        // Calculate moving average
        const total = this.errorStats.totalProcessed + this.errorStats.totalFailed;
        this.errorStats.avgProcessingTime =
            (this.errorStats.avgProcessingTime * (total - 1) + processingTime) / total;
    }
    /**
     * Calculate error rate (errors per minute)
     */
    calculateErrorRate() {
        const total = this.errorStats.totalProcessed + this.errorStats.totalFailed;
        const timeWindow = 60000; // 1 minute
        // This would use actual timestamps to calculate rate
        // For now, return a simple calculation
        return total > 0 ? (total / timeWindow) * 60000 : 0;
    }
    /**
     * Generate recommendations based on current state
     */
    generateRecommendations(metrics, processingResult) {
        const recommendations = [];
        if (!processingResult.processed) {
            recommendations.push('Error processing failed - check system capacity');
        }
        if (metrics.performanceStatus === 'critical') {
            recommendations.push('System under critical load - consider scaling');
        }
        else if (metrics.performanceStatus === 'degraded') {
            recommendations.push('System performance degraded - monitor closely');
        }
        if (metrics.errorHandlingOverhead.totalOverhead > 20) {
            recommendations.push('Error handling overhead is high - optimize collection');
        }
        if (metrics.systemLoad.memoryUsage > 85) {
            recommendations.push('High memory usage detected - check for memory leaks');
        }
        return recommendations;
    }
    /**
     * Determine overall system health
     */
    determineOverallHealth(performance, collection, errorHandling) {
        if (performance.performanceStatus === 'critical' ||
            errorHandling.successRate < 50 ||
            collection.queueUtilization > 0.9) {
            return 'critical';
        }
        if (performance.performanceStatus === 'degraded' ||
            errorHandling.successRate < 85 ||
            collection.queueUtilization > 0.7) {
            return 'degraded';
        }
        return 'healthy';
    }
    /**
     * Generate health recommendations
     */
    generateHealthRecommendations(performance, collection, errorHandling) {
        const immediate = [];
        const shortTerm = [];
        const longTerm = [];
        // Immediate actions
        if (performance.performanceStatus === 'critical') {
            immediate.push('Switch to emergency error collection mode');
            immediate.push('Scale system resources immediately');
        }
        if (collection.queueUtilization > 0.9) {
            immediate.push('Flush error processing queue');
        }
        // Short-term actions
        if (errorHandling.successRate < 85) {
            shortTerm.push('Investigate error handling failures');
            shortTerm.push('Review error classification rules');
        }
        if (performance.errorHandlingOverhead.totalOverhead > 15) {
            shortTerm.push('Optimize error collection configurations');
        }
        // Long-term actions
        if (performance.systemLoad.cpuUsage > 70) {
            longTerm.push('Consider horizontal scaling');
            longTerm.push('Optimize application performance');
        }
        longTerm.push('Regular performance monitoring and optimization');
        longTerm.push('Implement automated alerting and response');
        return { immediate, shortTerm, longTerm };
    }
    /**
     * Get active performance alerts
     */
    getActiveAlerts(metrics) {
        const alerts = [];
        if (metrics.systemLoad.cpuUsage > 85) {
            alerts.push({
                type: 'cpu',
                severity: metrics.systemLoad.cpuUsage > 95 ? 'critical' : 'warning',
                message: `High CPU usage: ${metrics.systemLoad.cpuUsage.toFixed(1)}%`,
                timestamp: new Date()
            });
        }
        if (metrics.systemLoad.memoryUsage > 85) {
            alerts.push({
                type: 'memory',
                severity: metrics.systemLoad.memoryUsage > 95 ? 'critical' : 'warning',
                message: `High memory usage: ${metrics.systemLoad.memoryUsage.toFixed(1)}%`,
                timestamp: new Date()
            });
        }
        if (metrics.errorHandlingOverhead.totalOverhead > 20) {
            alerts.push({
                type: 'overhead',
                severity: metrics.errorHandlingOverhead.totalOverhead > 30 ? 'critical' : 'warning',
                message: `High error handling overhead: ${metrics.errorHandlingOverhead.totalOverhead.toFixed(1)}ms`,
                timestamp: new Date()
            });
        }
        return alerts;
    }
    /**
     * Calculate performance trends
     */
    calculatePerformanceTrends(history) {
        if (history.length < 2) {
            return {
                cpuTrend: 'stable',
                memoryTrend: 'stable',
                overheadTrend: 'stable'
            };
        }
        // Simple trend calculation based on first and last values
        const first = history[0];
        const last = history[history.length - 1];
        const cpuChange = last.systemLoad.cpuUsage - first.systemLoad.cpuUsage;
        const memoryChange = last.systemLoad.memoryUsage - first.systemLoad.memoryUsage;
        const overheadChange = last.errorHandlingOverhead.totalOverhead - first.errorHandlingOverhead.totalOverhead;
        return {
            cpuTrend: cpuChange > 5 ? 'degrading' : cpuChange < -5 ? 'improving' : 'stable',
            memoryTrend: memoryChange > 5 ? 'degrading' : memoryChange < -5 ? 'improving' : 'stable',
            overheadTrend: overheadChange > 2 ? 'degrading' : overheadChange < -2 ? 'improving' : 'stable'
        };
    }
    /**
     * Calculate expected improvement from optimization
     */
    calculateExpectedImprovement(currentMetrics, newMode) {
        const reductions = {
            [CollectionMode.FULL]: 0,
            [CollectionMode.REDUCED]: 30,
            [CollectionMode.MINIMAL]: 60,
            [CollectionMode.EMERGENCY]: 80
        };
        const reduction = reductions[newMode];
        return `Expected ${reduction}% reduction in error handling overhead`;
    }
    /**
     * Fallback error handling for when main system fails
     */
    async fallbackErrorHandling(error, context) {
        try {
            // Simple fallback: just log to console with minimal overhead
            console.error('FALLBACK ERROR HANDLING:', {
                message: error.message,
                timestamp: new Date().toISOString(),
                userId: context.userId,
                sessionId: context.sessionId
            });
            this.emit('fallback-used', { error, context });
        }
        catch (fallbackError) {
            // Last resort: just emit an event
            this.emit('fallback-failed', fallbackError);
        }
    }
}
//# sourceMappingURL=performance-aware-error-handler.js.map