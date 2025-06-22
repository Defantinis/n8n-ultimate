/**
 * Adaptive Error Collector
 * Dynamically adjusts error detail collection based on system performance
 */
import { EventEmitter } from 'events';
import { ClassifiedError, ErrorSeverity, ErrorCategory, ErrorType, ErrorContext } from './error-classifier';
import { PerformanceErrorMonitor } from './performance-error-monitor';
/**
 * Collection modes with different detail levels
 */
export declare enum CollectionMode {
    FULL = "full",// Complete error collection with all details
    REDUCED = "reduced",// Essential details only, reduced telemetry
    MINIMAL = "minimal",// Critical errors only, basic details
    EMERGENCY = "emergency"
}
/**
 * Error collection configuration for each mode
 */
export interface CollectionConfig {
    mode: CollectionMode;
    collectTelemetry: boolean;
    collectStackTrace: boolean;
    collectContext: boolean;
    collectMetadata: boolean;
    collectRelatedErrors: boolean;
    telemetryDetail: 'minimal' | 'standard' | 'full';
    contextDetail: 'minimal' | 'standard' | 'full';
    maxErrorsPerSecond: number;
    maxQueueSize: number;
    batchSize: number;
    processingDelay: number;
    severityThreshold: ErrorSeverity;
    categoryFilter: ErrorCategory[];
    typeFilter: ErrorType[];
    storageMode: 'memory' | 'file' | 'database' | 'none';
    maxStorageSize: number;
    compressionEnabled: boolean;
}
/**
 * Error processing result
 */
export interface ProcessingResult {
    processed: boolean;
    reason?: string;
    mode: CollectionMode;
    overhead: number;
    reducedDetails?: string[];
}
/**
 * Collection statistics
 */
export interface CollectionStats {
    timestamp: Date;
    mode: CollectionMode;
    errorsProcessed: number;
    errorsSkipped: number;
    errorsQueued: number;
    averageProcessingTime: number;
    totalOverhead: number;
    memoryUsage: number;
    queueUtilization: number;
    modeTransitions: Array<{
        from: CollectionMode;
        to: CollectionMode;
        timestamp: Date;
        reason: string;
    }>;
}
/**
 * Adaptive Error Collector class
 */
export declare class AdaptiveErrorCollector extends EventEmitter {
    private performanceMonitor;
    private currentMode;
    private configs;
    private errorQueue;
    private processingTimer;
    private stats;
    private isProcessing;
    private modeTransitionHistory;
    constructor(performanceMonitor: PerformanceErrorMonitor);
    /**
     * Process an error with adaptive collection
     */
    processError(error: ClassifiedError, originalContext?: ErrorContext): Promise<ProcessingResult>;
    /**
     * Set collection mode manually
     */
    setMode(mode: CollectionMode, reason?: string): void;
    /**
     * Get current collection statistics
     */
    getStats(): CollectionStats;
    /**
     * Get current mode and configuration
     */
    getCurrentConfig(): {
        mode: CollectionMode;
        config: CollectionConfig;
    };
    /**
     * Update configuration for a specific mode
     */
    updateConfig(mode: CollectionMode, updates: Partial<CollectionConfig>): void;
    /**
     * Force process queued errors
     */
    flushQueue(): Promise<number>;
    /**
     * Get queue status
     */
    getQueueStatus(): {
        size: number;
        oldestError: Date | null;
        averageAge: number;
        isProcessing: boolean;
    };
    /**
     * Shutdown the collector
     */
    shutdown(): Promise<void>;
    /**
     * Check if error can be processed based on current performance
     */
    private canProcessError;
    /**
     * Adapt error details based on collection mode
     */
    private adaptErrorDetails;
    /**
     * Determine if error should be queued
     */
    private shouldQueue;
    /**
     * Process error immediately
     */
    private processErrorImmediate;
    /**
     * Enforce queue size limits
     */
    private enforceQueueLimits;
    /**
     * Start processing timer
     */
    private startProcessing;
    /**
     * Update processing timer based on current config
     */
    private updateProcessingTimer;
    /**
     * Process queued errors
     */
    private processQueuedErrors;
    /**
     * Setup performance monitoring for adaptive behavior
     */
    private setupPerformanceMonitoring;
    /**
     * Adapt collection mode based on performance metrics
     */
    private adaptToPerformance;
    /**
     * Handle performance alerts
     */
    private handlePerformanceAlert;
    /**
     * Initialize default configurations for each mode
     */
    private initializeConfigs;
    /**
     * Initialize statistics tracking
     */
    private initializeStats;
    /**
     * Update processing statistics
     */
    private updateStats;
    /**
     * Map error severity to performance level
     */
    private mapSeverityToPerformanceLevel;
    /**
     * Get list of details reduced in current mode
     */
    private getReducedDetails;
}
//# sourceMappingURL=adaptive-error-collector.d.ts.map