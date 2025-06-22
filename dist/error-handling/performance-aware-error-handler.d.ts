/**
 * Performance-Aware Error Handler
 * Main interface that integrates performance monitoring with error handling
 */
import { EventEmitter } from 'events';
import { ErrorContext } from './error-classifier';
import { ErrorHandlingMetrics } from './performance-error-monitor';
import { CollectionMode, ProcessingResult, CollectionStats } from './adaptive-error-collector';
/**
 * Performance-aware error handling configuration
 */
export interface PerformanceAwareConfig {
    performanceMonitoring: {
        enabled: boolean;
        sampleInterval: number;
        metricsWindow: number;
        adaptiveMode: boolean;
    };
    adaptiveCollection: {
        enabled: boolean;
        initialMode: CollectionMode;
        autoModeTransition: boolean;
    };
    performanceThresholds: {
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
    };
    integration: {
        logPerformanceMetrics: boolean;
        alertOnDegradation: boolean;
        fallbackToBasicHandling: boolean;
    };
}
/**
 * Performance-aware error handling result
 */
export interface PerformanceAwareResult {
    success: boolean;
    errorId?: string;
    processingResult: ProcessingResult;
    performanceMetrics: {
        totalTime: number;
        classificationTime: number;
        collectionTime: number;
        loggingTime: number;
    };
    systemStatus: 'optimal' | 'degraded' | 'critical';
    recommendedActions?: string[];
}
/**
 * System health report
 */
export interface SystemHealthReport {
    timestamp: Date;
    overallStatus: 'healthy' | 'degraded' | 'critical';
    performance: ErrorHandlingMetrics;
    collection: CollectionStats;
    errorHandling: {
        totalErrors: number;
        errorsPerMinute: number;
        avgProcessingTime: number;
        successRate: number;
    };
    recommendations: {
        immediate: string[];
        shortTerm: string[];
        longTerm: string[];
    };
    activeAlerts: Array<{
        type: string;
        severity: 'warning' | 'critical';
        message: string;
        timestamp: Date;
    }>;
}
/**
 * Main Performance-Aware Error Handler class
 */
export declare class PerformanceAwareErrorHandler extends EventEmitter {
    private errorClassifier;
    private errorLogger;
    private performanceMonitor;
    private adaptiveCollector;
    private config;
    private isInitialized;
    private errorStats;
    constructor(config?: Partial<PerformanceAwareConfig>);
    /**
     * Main error handling method with performance awareness
     */
    handleError(error: Error, context?: ErrorContext): Promise<PerformanceAwareResult>;
    /**
     * Get current system health report
     */
    getHealthReport(): SystemHealthReport;
    /**
     * Force performance optimization
     */
    optimizePerformance(): Promise<{
        actionsTaken: string[];
        newMode: CollectionMode;
        expectedImprovement: string;
    }>;
    /**
     * Get performance statistics
     */
    getPerformanceStats(): {
        current: ErrorHandlingMetrics;
        trends: {
            cpuTrend: 'improving' | 'stable' | 'degrading';
            memoryTrend: 'improving' | 'stable' | 'degrading';
            overheadTrend: 'improving' | 'stable' | 'degrading';
        };
        recommendations: string[];
    };
    /**
     * Shutdown the performance-aware error handler
     */
    shutdown(): Promise<void>;
    /**
     * Initialize all components
     */
    private initialize;
    /**
     * Setup event listeners for monitoring
     */
    private setupEventListeners;
    /**
     * Calculate memory delta
     */
    private calculateMemoryDelta;
    /**
     * Calculate CPU delta
     */
    private calculateCpuDelta;
    /**
     * Update error handling statistics
     */
    private updateErrorStats;
    /**
     * Calculate error rate (errors per minute)
     */
    private calculateErrorRate;
    /**
     * Generate recommendations based on current state
     */
    private generateRecommendations;
    /**
     * Determine overall system health
     */
    private determineOverallHealth;
    /**
     * Generate health recommendations
     */
    private generateHealthRecommendations;
    /**
     * Get active performance alerts
     */
    private getActiveAlerts;
    /**
     * Calculate performance trends
     */
    private calculatePerformanceTrends;
    /**
     * Calculate expected improvement from optimization
     */
    private calculateExpectedImprovement;
    /**
     * Fallback error handling for when main system fails
     */
    private fallbackErrorHandling;
}
//# sourceMappingURL=performance-aware-error-handler.d.ts.map