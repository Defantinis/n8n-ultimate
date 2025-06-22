/**
 * Performance Error Monitor
 * Tracks performance impact of error handling operations and system load
 */
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import * as os from 'os';
/**
 * Main performance monitor class
 */
export class PerformanceErrorMonitor extends EventEmitter {
    metrics = [];
    thresholds;
    config;
    isMonitoring = false;
    monitoringInterval = null;
    startTimes = new Map();
    operationCounts = new Map();
    operationTimes = new Map();
    lastGcTime = 0;
    gcObserver = null;
    constructor(thresholds, config) {
        super();
        this.thresholds = {
            cpu: { optimal: 70, degraded: 85, critical: 95 },
            memory: { optimal: 70, degraded: 85, critical: 95 },
            eventLoopLag: { optimal: 10, degraded: 50, critical: 100 },
            errorHandlingOverhead: { optimal: 5, degraded: 15, critical: 30 },
            ...thresholds
        };
        this.config = {
            sampleInterval: 5000, // 5 seconds
            metricsWindow: 300000, // 5 minutes
            alertThreshold: 80,
            adaptiveMode: true,
            performanceLogging: true,
            ...config
        };
        this.initializeGcTracking();
    }
    /**
     * Start performance monitoring
     */
    startMonitoring() {
        if (this.isMonitoring)
            return;
        this.isMonitoring = true;
        this.monitoringInterval = setInterval(() => {
            this.collectMetrics();
        }, this.config.sampleInterval);
        this.emit('monitoring-started');
    }
    /**
     * Stop performance monitoring
     */
    stopMonitoring() {
        if (!this.isMonitoring)
            return;
        this.isMonitoring = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.emit('monitoring-stopped');
    }
    /**
     * Start timing an operation
     */
    startOperation(operationType, operationId = '') {
        const id = `${operationType}_${operationId || Date.now()}`;
        this.startTimes.set(id, performance.now());
        return id;
    }
    /**
     * End timing an operation
     */
    endOperation(operationId) {
        const startTime = this.startTimes.get(operationId);
        if (!startTime)
            return 0;
        const duration = performance.now() - startTime;
        this.startTimes.delete(operationId);
        // Record operation statistics
        const operationType = operationId.split('_')[0];
        if (!this.operationCounts.has(operationType)) {
            this.operationCounts.set(operationType, 0);
            this.operationTimes.set(operationType, []);
        }
        this.operationCounts.set(operationType, this.operationCounts.get(operationType) + 1);
        const times = this.operationTimes.get(operationType);
        times.push(duration);
        // Keep only recent measurements
        if (times.length > 1000) {
            times.splice(0, times.length - 1000);
        }
        return duration;
    }
    /**
     * Get current performance metrics
     */
    getCurrentMetrics() {
        return this.collectMetrics();
    }
    /**
     * Get metrics history
     */
    getMetricsHistory(windowMs) {
        const now = Date.now();
        const window = windowMs || this.config.metricsWindow;
        return this.metrics.filter(metric => now - metric.timestamp.getTime() <= window);
    }
    /**
     * Get performance recommendations
     */
    getRecommendations() {
        const current = this.getCurrentMetrics();
        switch (current.performanceStatus) {
            case 'critical':
                return {
                    mode: 'minimal',
                    actions: [
                        'Switch to minimal error collection',
                        'Disable non-critical telemetry',
                        'Increase error processing throttling',
                        'Consider system scaling'
                    ],
                    reasoning: 'System is under critical load - preserving core functionality'
                };
            case 'degraded':
                return {
                    mode: 'reduced',
                    actions: [
                        'Reduce error detail collection',
                        'Throttle non-essential logging',
                        'Batch error processing',
                        'Monitor for improvement'
                    ],
                    reasoning: 'System load is elevated - reducing overhead while maintaining core error handling'
                };
            default:
                return {
                    mode: 'full',
                    actions: [
                        'Continue full error collection',
                        'Monitor performance trends',
                        'Optimize based on patterns'
                    ],
                    reasoning: 'System performance is optimal - maintaining comprehensive error handling'
                };
        }
    }
    /**
     * Check if system can handle additional error processing
     */
    canProcessError(errorSeverity) {
        const current = this.getCurrentMetrics();
        // Check system status and determine what errors to process
        switch (current.performanceStatus) {
            case 'critical':
                return errorSeverity === 'critical';
            case 'degraded':
                return ['critical', 'high'].includes(errorSeverity);
            default:
                return true; // Process all errors when system is optimal
        }
    }
    /**
     * Collect current performance metrics
     */
    collectMetrics() {
        const now = new Date();
        const memUsage = process.memoryUsage();
        const cpuUsage = this.getCpuUsage();
        const eventLoopLag = this.measureEventLoopLag();
        // Calculate error handling overhead
        const errorHandlingOverhead = this.calculateErrorHandlingOverhead();
        // Calculate system load
        const systemLoad = {
            cpuUsage,
            memoryUsage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
            heapUsage: memUsage.heapUsed / 1024 / 1024, // MB
            eventLoopLag,
            activeHandles: process._getActiveHandles?.()?.length || 0,
            gcPressure: this.calculateGcPressure()
        };
        // Calculate processing impact
        const processingImpact = {
            queueSize: this.startTimes.size,
            processingDelay: this.calculateProcessingDelay(),
            dropRate: 0, // TODO: Implement drop rate calculation
            throttleRate: 0 // TODO: Implement throttle rate calculation
        };
        // Determine performance status and recommended mode
        const performanceStatus = this.determinePerformanceStatus(systemLoad, errorHandlingOverhead);
        const recommendedMode = this.determineRecommendedMode(performanceStatus);
        const metrics = {
            timestamp: now,
            errorHandlingOverhead,
            systemLoad,
            processingImpact,
            performanceStatus,
            recommendedMode
        };
        // Store metrics
        this.metrics.push(metrics);
        // Clean old metrics
        this.cleanOldMetrics();
        // Check for alerts
        this.checkForAlerts(metrics);
        // Emit metrics event
        this.emit('metrics-collected', metrics);
        return metrics;
    }
    /**
     * Calculate error handling overhead
     */
    calculateErrorHandlingOverhead() {
        const classificationTimes = this.operationTimes.get('classification') || [];
        const loggingTimes = this.operationTimes.get('logging') || [];
        const telemetryTimes = this.operationTimes.get('telemetry') || [];
        const avg = (arr) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
        const avgClassificationTime = avg(classificationTimes);
        const avgLoggingTime = avg(loggingTimes);
        const avgTelemetryTime = avg(telemetryTimes);
        const totalOverhead = avgClassificationTime + avgLoggingTime + avgTelemetryTime;
        // Calculate error processing rate
        const totalErrors = Array.from(this.operationCounts.values()).reduce((a, b) => a + b, 0);
        const timeWindow = this.config.sampleInterval / 1000; // seconds
        const errorProcessingRate = totalErrors > 0 ? totalErrors / timeWindow : 0;
        return {
            avgClassificationTime,
            avgLoggingTime,
            avgTelemetryTime,
            totalOverhead,
            errorProcessingRate
        };
    }
    /**
     * Get current CPU usage
     */
    getCpuUsage() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;
        for (const cpu of cpus) {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        }
        return 100 - (totalIdle / totalTick * 100);
    }
    /**
     * Measure event loop lag
     */
    measureEventLoopLag() {
        const start = performance.now();
        return new Promise(resolve => {
            setImmediate(() => {
                resolve(performance.now() - start);
            });
        }); // Simplified for synchronous use
    }
    /**
     * Calculate GC pressure
     */
    calculateGcPressure() {
        // Simplified GC pressure calculation
        // In a real implementation, this would track GC frequency and duration
        const now = performance.now();
        const timeSinceLastGc = now - this.lastGcTime;
        if (timeSinceLastGc < 1000)
            return 100; // Recent GC = high pressure
        if (timeSinceLastGc < 5000)
            return 50; // Moderate pressure
        return 10; // Low pressure
    }
    /**
     * Calculate processing delay
     */
    calculateProcessingDelay() {
        // Calculate average time items spend in processing
        const queueSize = this.startTimes.size;
        if (queueSize === 0)
            return 0;
        const now = performance.now();
        let totalDelay = 0;
        for (const startTime of this.startTimes.values()) {
            totalDelay += now - startTime;
        }
        return totalDelay / queueSize;
    }
    /**
     * Determine performance status
     */
    determinePerformanceStatus(systemLoad, errorHandlingOverhead) {
        // Check critical thresholds
        if (systemLoad.cpuUsage >= this.thresholds.cpu.critical ||
            systemLoad.memoryUsage >= this.thresholds.memory.critical ||
            systemLoad.eventLoopLag >= this.thresholds.eventLoopLag.critical ||
            errorHandlingOverhead.totalOverhead >= this.thresholds.errorHandlingOverhead.critical) {
            return 'critical';
        }
        // Check degraded thresholds
        if (systemLoad.cpuUsage >= this.thresholds.cpu.degraded ||
            systemLoad.memoryUsage >= this.thresholds.memory.degraded ||
            systemLoad.eventLoopLag >= this.thresholds.eventLoopLag.degraded ||
            errorHandlingOverhead.totalOverhead >= this.thresholds.errorHandlingOverhead.degraded) {
            return 'degraded';
        }
        return 'optimal';
    }
    /**
     * Determine recommended mode
     */
    determineRecommendedMode(status) {
        switch (status) {
            case 'critical': return 'minimal';
            case 'degraded': return 'reduced';
            default: return 'full';
        }
    }
    /**
     * Initialize GC tracking
     */
    initializeGcTracking() {
        try {
            // Try to set up GC tracking if available
            if (typeof global.gc === 'function') {
                this.gcObserver = setInterval(() => {
                    this.lastGcTime = performance.now();
                }, 1000);
            }
        }
        catch (error) {
            // GC tracking not available, continue without it
        }
    }
    /**
     * Clean old metrics
     */
    cleanOldMetrics() {
        const now = Date.now();
        const cutoffTime = now - (this.config.metricsWindow * 2); // Keep extra history
        this.metrics = this.metrics.filter(metric => metric.timestamp.getTime() > cutoffTime);
    }
    /**
     * Check for performance alerts
     */
    checkForAlerts(metrics) {
        const alerts = [];
        // CPU alert
        if (metrics.systemLoad.cpuUsage >= this.thresholds.cpu.degraded) {
            alerts.push({
                id: `cpu-${Date.now()}`,
                timestamp: new Date(),
                type: 'cpu',
                severity: metrics.systemLoad.cpuUsage >= this.thresholds.cpu.critical ? 'critical' : 'warning',
                currentValue: metrics.systemLoad.cpuUsage,
                threshold: this.thresholds.cpu.degraded,
                impact: 'High CPU usage may slow error processing',
                recommendation: 'Consider reducing error detail collection',
                metrics
            });
        }
        // Memory alert  
        if (metrics.systemLoad.memoryUsage >= this.thresholds.memory.degraded) {
            alerts.push({
                id: `memory-${Date.now()}`,
                timestamp: new Date(),
                type: 'memory',
                severity: metrics.systemLoad.memoryUsage >= this.thresholds.memory.critical ? 'critical' : 'warning',
                currentValue: metrics.systemLoad.memoryUsage,
                threshold: this.thresholds.memory.degraded,
                impact: 'High memory usage may cause system instability',
                recommendation: 'Reduce error history size and batch processing',
                metrics
            });
        }
        // Event loop lag alert
        if (metrics.systemLoad.eventLoopLag >= this.thresholds.eventLoopLag.degraded) {
            alerts.push({
                id: `eventloop-${Date.now()}`,
                timestamp: new Date(),
                type: 'eventloop',
                severity: metrics.systemLoad.eventLoopLag >= this.thresholds.eventLoopLag.critical ? 'critical' : 'warning',
                currentValue: metrics.systemLoad.eventLoopLag,
                threshold: this.thresholds.eventLoopLag.degraded,
                impact: 'Event loop lag may cause response delays',
                recommendation: 'Switch to minimal error handling mode',
                metrics
            });
        }
        // Error handling overhead alert
        if (metrics.errorHandlingOverhead.totalOverhead >= this.thresholds.errorHandlingOverhead.degraded) {
            alerts.push({
                id: `overhead-${Date.now()}`,
                timestamp: new Date(),
                type: 'overhead',
                severity: metrics.errorHandlingOverhead.totalOverhead >= this.thresholds.errorHandlingOverhead.critical ? 'critical' : 'warning',
                currentValue: metrics.errorHandlingOverhead.totalOverhead,
                threshold: this.thresholds.errorHandlingOverhead.degraded,
                impact: 'Error handling is consuming too much processing time',
                recommendation: 'Optimize error collection and reduce telemetry',
                metrics
            });
        }
        // Emit alerts
        for (const alert of alerts) {
            this.emit('performance-alert', alert);
        }
    }
}
//# sourceMappingURL=performance-error-monitor.js.map