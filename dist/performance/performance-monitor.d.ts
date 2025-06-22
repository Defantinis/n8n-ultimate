/**
 * Performance Monitor and Profiling System
 * Comprehensive monitoring of CPU usage, memory allocation, response times,
 * and async processing performance for Node.js applications
 */
import { EventEmitter } from 'events';
export interface PerformanceMetrics {
    timestamp: number;
    cpu: CPUMetrics;
    memory: MemoryMetrics;
    eventLoop: EventLoopMetrics;
    gc: GCMetrics;
    http: HTTPMetrics;
    async: AsyncMetrics;
    custom: CustomMetrics;
}
export interface CPUMetrics {
    usage: number;
    loadAverage: number[];
    userTime: number;
    systemTime: number;
    processes: number;
}
export interface MemoryMetrics {
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
    rss: number;
    systemMemory: {
        total: number;
        free: number;
        used: number;
        percentage: number;
    };
}
export interface EventLoopMetrics {
    delay: number;
    utilization: number;
    lag: number;
}
export interface GCMetrics {
    totalDuration: number;
    totalCount: number;
    majorCount: number;
    minorCount: number;
    averageDuration: number;
    lastGCTime: number;
}
export interface HTTPMetrics {
    requestCount: number;
    responseCount: number;
    averageResponseTime: number;
    slowRequests: number;
    errorCount: number;
    activeConnections: number;
}
export interface AsyncMetrics {
    pendingOperations: number;
    completedOperations: number;
    averageOperationTime: number;
    queuedOperations: number;
    workerThreads: number;
}
export interface CustomMetrics {
    [key: string]: number | string | boolean | object;
}
export interface PerformanceAlert {
    type: 'warning' | 'critical';
    metric: string;
    value: number;
    threshold: number;
    timestamp: number;
    message: string;
}
export interface PerformanceProfile {
    name: string;
    startTime: number;
    endTime?: number;
    duration?: number;
    metrics: PerformanceMetrics[];
    summary: PerformanceSummary;
}
export interface PerformanceSummary {
    totalDuration: number;
    averageCPU: number;
    peakMemory: number;
    gcCount: number;
    slowOperations: number;
    errorCount: number;
}
export interface MonitoringConfiguration {
    enabled: boolean;
    interval: number;
    retentionPeriod: number;
    alerts: {
        enabled: boolean;
        thresholds: {
            cpuUsage: number;
            memoryUsage: number;
            eventLoopDelay: number;
            responseTime: number;
            errorRate: number;
        };
    };
    profiling: {
        enabled: boolean;
        sampleInterval: number;
        maxProfiles: number;
    };
    persistence: {
        enabled: boolean;
        directory: string;
        format: 'json' | 'csv';
    };
}
/**
 * Comprehensive Performance Monitor
 */
export declare class PerformanceMonitor extends EventEmitter {
    private config;
    private isRunning;
    private monitoringInterval?;
    private metrics;
    private profiles;
    private alerts;
    private performanceObserver?;
    private gcMetrics;
    private httpMetrics;
    private asyncMetrics;
    private customMetrics;
    private startTime;
    private lastCPUUsage;
    private eventLoopUtilization;
    constructor(config?: Partial<MonitoringConfiguration>);
    /**
     * Start performance monitoring
     */
    start(): Promise<void>;
    /**
     * Stop performance monitoring
     */
    stop(): Promise<void>;
    /**
     * Start a performance profile
     */
    startProfile(name: string): void;
    /**
     * End a performance profile
     */
    endProfile(name: string): PerformanceProfile | null;
    /**
     * Get current performance metrics
     */
    getCurrentMetrics(): PerformanceMetrics;
    /**
     * Get historical metrics
     */
    getHistoricalMetrics(timeRange?: {
        start: number;
        end: number;
    }): PerformanceMetrics[];
    /**
     * Get performance profile
     */
    getProfile(name: string): PerformanceProfile | null;
    /**
     * Get all profiles
     */
    getAllProfiles(): PerformanceProfile[];
    /**
     * Get performance alerts
     */
    getAlerts(): PerformanceAlert[];
    /**
     * Add custom metric
     */
    addCustomMetric(key: string, value: number | string | boolean | object): void;
    /**
     * Track HTTP request
     */
    trackHTTPRequest(responseTime: number, statusCode: number): void;
    /**
     * Track async operation
     */
    trackAsyncOperation(operationTime: number, success?: boolean): void;
    /**
     * Get performance summary
     */
    getPerformanceSummary(): PerformanceSummary;
    /**
     * Generate performance report
     */
    generateReport(): object;
    /**
     * Clear historical data
     */
    clearHistory(): void;
    /**
     * Private method to merge configuration
     */
    private mergeConfig;
    /**
     * Setup performance observer
     */
    private setupPerformanceObserver;
    /**
     * Setup garbage collection observer
     */
    private setupGCObserver;
    /**
     * Collect current performance metrics
     */
    private collectMetrics;
    /**
     * Check for performance alerts
     */
    private checkAlerts;
    /**
     * Clean up old metrics based on retention period
     */
    private cleanupOldMetrics;
    /**
     * Calculate profile summary
     */
    private calculateProfileSummary;
    /**
     * Save metrics to disk
     */
    private saveMetrics;
    /**
     * Convert metrics to CSV format
     */
    private convertToCSV;
}
/**
 * Get or create global performance monitor
 */
export declare function getPerformanceMonitor(config?: Partial<MonitoringConfiguration>): PerformanceMonitor;
/**
 * Performance monitoring utilities
 */
export declare class PerformanceUtils {
    /**
     * Measure function execution time
     */
    static measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T>;
    /**
     * Measure synchronous function execution time
     */
    static measure<T>(name: string, fn: () => T): T;
    /**
     * Create a performance decorator
     */
    static createDecorator(name?: string): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
}
/**
 * Export default monitor instance
 */
declare const _default: PerformanceMonitor;
export default _default;
//# sourceMappingURL=performance-monitor.d.ts.map