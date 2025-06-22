/**
 * Performance Error Monitor
 * Tracks performance impact of error handling operations and system load
 */
import { EventEmitter } from 'events';
/**
 * Performance metrics for error handling operations
 */
export interface ErrorHandlingMetrics {
    timestamp: Date;
    errorHandlingOverhead: {
        avgClassificationTime: number;
        avgLoggingTime: number;
        avgTelemetryTime: number;
        totalOverhead: number;
        errorProcessingRate: number;
    };
    systemLoad: {
        cpuUsage: number;
        memoryUsage: number;
        heapUsage: number;
        eventLoopLag: number;
        activeHandles: number;
        gcPressure: number;
    };
    processingImpact: {
        queueSize: number;
        processingDelay: number;
        dropRate: number;
        throttleRate: number;
    };
    performanceStatus: 'optimal' | 'degraded' | 'critical';
    recommendedMode: 'full' | 'reduced' | 'minimal';
}
/**
 * Performance thresholds configuration
 */
export interface PerformanceThresholds {
    cpu: {
        optimal: number;
        degraded: number;
        critical: number;
    };
    memory: {
        optimal: number;
        degraded: number;
        critical: number;
    };
    eventLoopLag: {
        optimal: number;
        degraded: number;
        critical: number;
    };
    errorHandlingOverhead: {
        optimal: number;
        degraded: number;
        critical: number;
    };
}
/**
 * Performance monitoring configuration
 */
export interface MonitorConfig {
    sampleInterval: number;
    metricsWindow: number;
    alertThreshold: number;
    adaptiveMode: boolean;
    performanceLogging: boolean;
}
/**
 * Performance alert
 */
export interface PerformanceAlert {
    id: string;
    timestamp: Date;
    type: 'cpu' | 'memory' | 'eventloop' | 'overhead' | 'queue';
    severity: 'warning' | 'critical';
    currentValue: number;
    threshold: number;
    impact: string;
    recommendation: string;
    metrics: ErrorHandlingMetrics;
}
/**
 * Main performance monitor class
 */
export declare class PerformanceErrorMonitor extends EventEmitter {
    private metrics;
    private thresholds;
    private config;
    private isMonitoring;
    private monitoringInterval;
    private startTimes;
    private operationCounts;
    private operationTimes;
    private lastGcTime;
    private gcObserver;
    constructor(thresholds?: Partial<PerformanceThresholds>, config?: Partial<MonitorConfig>);
    /**
     * Start performance monitoring
     */
    startMonitoring(): void;
    /**
     * Stop performance monitoring
     */
    stopMonitoring(): void;
    /**
     * Start timing an operation
     */
    startOperation(operationType: string, operationId?: string): string;
    /**
     * End timing an operation
     */
    endOperation(operationId: string): number;
    /**
     * Get current performance metrics
     */
    getCurrentMetrics(): ErrorHandlingMetrics;
    /**
     * Get metrics history
     */
    getMetricsHistory(windowMs?: number): ErrorHandlingMetrics[];
    /**
     * Get performance recommendations
     */
    getRecommendations(): {
        mode: 'full' | 'reduced' | 'minimal';
        actions: string[];
        reasoning: string;
    };
    /**
     * Check if system can handle additional error processing
     */
    canProcessError(errorSeverity: 'low' | 'medium' | 'high' | 'critical'): boolean;
    /**
     * Collect current performance metrics
     */
    private collectMetrics;
    /**
     * Calculate error handling overhead
     */
    private calculateErrorHandlingOverhead;
    /**
     * Get current CPU usage
     */
    private getCpuUsage;
    /**
     * Measure event loop lag
     */
    private measureEventLoopLag;
    /**
     * Calculate GC pressure
     */
    private calculateGcPressure;
    /**
     * Calculate processing delay
     */
    private calculateProcessingDelay;
    /**
     * Determine performance status
     */
    private determinePerformanceStatus;
    /**
     * Determine recommended mode
     */
    private determineRecommendedMode;
    /**
     * Initialize GC tracking
     */
    private initializeGcTracking;
    /**
     * Clean old metrics
     */
    private cleanOldMetrics;
    /**
     * Check for performance alerts
     */
    private checkForAlerts;
}
//# sourceMappingURL=performance-error-monitor.d.ts.map