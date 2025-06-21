/**
 * Adaptive Error Collector
 * Dynamically adjusts error detail collection based on system performance
 */

import { EventEmitter } from 'events';
import { 
  ClassifiedError, 
  ErrorSeverity, 
  ErrorCategory, 
  ErrorType, 
  ErrorContext 
} from './error-classifier';
import { 
  TelemetryData,
  LogEntry 
} from './error-logger';
import { 
  PerformanceErrorMonitor,
  ErrorHandlingMetrics 
} from './performance-error-monitor';

/**
 * Collection modes with different detail levels
 */
export enum CollectionMode {
  FULL = 'full',           // Complete error collection with all details
  REDUCED = 'reduced',     // Essential details only, reduced telemetry
  MINIMAL = 'minimal',     // Critical errors only, basic details
  EMERGENCY = 'emergency'  // System preservation mode, errors to memory only
}

/**
 * Error collection configuration for each mode
 */
export interface CollectionConfig {
  mode: CollectionMode;
  
  // What to collect
  collectTelemetry: boolean;
  collectStackTrace: boolean;
  collectContext: boolean;
  collectMetadata: boolean;
  collectRelatedErrors: boolean;
  
  // Detail levels
  telemetryDetail: 'minimal' | 'standard' | 'full';
  contextDetail: 'minimal' | 'standard' | 'full';
  
  // Processing limits
  maxErrorsPerSecond: number;
  maxQueueSize: number;
  batchSize: number;
  processingDelay: number; // ms between batches
  
  // Filtering
  severityThreshold: ErrorSeverity;
  categoryFilter: ErrorCategory[];
  typeFilter: ErrorType[];
  
  // Storage
  storageMode: 'memory' | 'file' | 'database' | 'none';
  maxStorageSize: number; // entries
  compressionEnabled: boolean;
}

/**
 * Error processing result
 */
export interface ProcessingResult {
  processed: boolean;
  reason?: string;
  mode: CollectionMode;
  overhead: number; // ms
  reducedDetails?: string[];
}

/**
 * Collection statistics
 */
export interface CollectionStats {
  timestamp: Date;
  mode: CollectionMode;
  
  // Processing stats
  errorsProcessed: number;
  errorsSkipped: number;
  errorsQueued: number;
  averageProcessingTime: number;
  
  // Performance impact
  totalOverhead: number;
  memoryUsage: number;
  queueUtilization: number;
  
  // Mode transitions
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
export class AdaptiveErrorCollector extends EventEmitter {
  private performanceMonitor: PerformanceErrorMonitor;
  private currentMode: CollectionMode = CollectionMode.FULL;
  private configs: Map<CollectionMode, CollectionConfig> = new Map();
  private errorQueue: Array<{ error: ClassifiedError; timestamp: Date }> = [];
  private processingTimer: NodeJS.Timeout | null = null;
  private stats: CollectionStats;
  private isProcessing: boolean = false;
  private modeTransitionHistory: CollectionStats['modeTransitions'] = [];
  
  constructor(performanceMonitor: PerformanceErrorMonitor) {
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
  public async processError(
    error: ClassifiedError,
    originalContext?: ErrorContext
  ): Promise<ProcessingResult> {
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
      const config = this.configs.get(this.currentMode)!;
      
      // Adapt error details based on current mode
      const adaptedError = await this.adaptErrorDetails(error, config, originalContext);
      
      // Queue for processing if needed
      if (this.shouldQueue(config)) {
        this.errorQueue.push({ error: adaptedError, timestamp: new Date() });
        this.stats.errorsQueued++;
        
        // Check queue limits
        this.enforceQueueLimits(config);
      } else {
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
      
    } catch (processingError) {
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
  public setMode(mode: CollectionMode, reason: string = 'manual'): void {
    if (mode === this.currentMode) return;
    
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
  public getStats(): CollectionStats {
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
  public getCurrentConfig(): { mode: CollectionMode; config: CollectionConfig } {
    return {
      mode: this.currentMode,
      config: this.configs.get(this.currentMode)!
    };
  }
  
  /**
   * Update configuration for a specific mode
   */
  public updateConfig(mode: CollectionMode, updates: Partial<CollectionConfig>): void {
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
  public async flushQueue(): Promise<number> {
    if (this.isProcessing) return 0;
    
    const processed = await this.processQueuedErrors(true);
    this.emit('queue-flushed', { processed, remaining: this.errorQueue.length });
    return processed;
  }
  
  /**
   * Get queue status
   */
  public getQueueStatus(): {
    size: number;
    oldestError: Date | null;
    averageAge: number;
    isProcessing: boolean;
  } {
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
  public async shutdown(): Promise<void> {
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
  private canProcessError(error: ClassifiedError): { allowed: boolean; reason?: string } {
    const config = this.configs.get(this.currentMode)!;
    
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
    const canProcessByPerformance = this.performanceMonitor.canProcessError(
      this.mapSeverityToPerformanceLevel(error.severity)
    );
    
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
  private async adaptErrorDetails(
    error: ClassifiedError,
    config: CollectionConfig,
    originalContext?: ErrorContext
  ): Promise<ClassifiedError> {
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
    } else if (config.telemetryDetail === 'minimal') {
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
  private shouldQueue(config: CollectionConfig): boolean {
    return config.batchSize > 1 || config.processingDelay > 0;
  }
  
  /**
   * Process error immediately
   */
  private async processErrorImmediate(
    error: ClassifiedError,
    config: CollectionConfig
  ): Promise<void> {
    // This would integrate with the actual error processing system
    // For now, we'll emit an event
    this.emit('error-processed', { error, config, immediate: true });
  }
  
  /**
   * Enforce queue size limits
   */
  private enforceQueueLimits(config: CollectionConfig): void {
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
  private startProcessing(): void {
    this.updateProcessingTimer();
  }
  
  /**
   * Update processing timer based on current config
   */
  private updateProcessingTimer(): void {
    if (this.processingTimer) {
      clearInterval(this.processingTimer);
      this.processingTimer = null;
    }
    
    const config = this.configs.get(this.currentMode)!;
    if (config.processingDelay > 0) {
      this.processingTimer = setInterval(() => {
        this.processQueuedErrors(false);
      }, config.processingDelay);
    }
  }
  
  /**
   * Process queued errors
   */
  private async processQueuedErrors(forceAll: boolean = false): Promise<number> {
    if (this.isProcessing || this.errorQueue.length === 0) {
      return 0;
    }
    
    this.isProcessing = true;
    const config = this.configs.get(this.currentMode)!;
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
      
    } catch (error) {
      this.emit('batch-error', error);
    } finally {
      this.isProcessing = false;
    }
    
    return processed;
  }
  
  /**
   * Setup performance monitoring for adaptive behavior
   */
  private setupPerformanceMonitoring(): void {
    this.performanceMonitor.on('metrics-collected', (metrics: ErrorHandlingMetrics) => {
      this.adaptToPerformance(metrics);
    });
    
    this.performanceMonitor.on('performance-alert', (alert) => {
      this.handlePerformanceAlert(alert);
    });
  }
  
  /**
   * Adapt collection mode based on performance metrics
   */
  private adaptToPerformance(metrics: ErrorHandlingMetrics): void {
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
  private handlePerformanceAlert(alert: any): void {
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
  private initializeConfigs(): void {
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
      severityThreshold: 'info' as ErrorSeverity,
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
      severityThreshold: 'low' as ErrorSeverity,
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
      severityThreshold: 'high' as ErrorSeverity,
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
      severityThreshold: 'critical' as ErrorSeverity,
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
  private initializeStats(): void {
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
  private updateStats(overhead: number): void {
    this.stats.totalOverhead += overhead;
    this.stats.averageProcessingTime = this.stats.errorsProcessed > 0 
      ? this.stats.totalOverhead / this.stats.errorsProcessed 
      : 0;
    
    const config = this.configs.get(this.currentMode)!;
    this.stats.queueUtilization = this.errorQueue.length / config.maxQueueSize;
    this.stats.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
  }
  
  /**
   * Map error severity to performance level
   */
  private mapSeverityToPerformanceLevel(severity: ErrorSeverity): 'low' | 'medium' | 'high' | 'critical' {
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
  private getReducedDetails(config: CollectionConfig): string[] {
    const reduced: string[] = [];
    
    if (!config.collectTelemetry) reduced.push('telemetry');
    if (!config.collectStackTrace) reduced.push('stackTrace');
    if (!config.collectContext) reduced.push('context');
    if (!config.collectMetadata) reduced.push('metadata');
    if (!config.collectRelatedErrors) reduced.push('relatedErrors');
    
    return reduced;
  }
} 