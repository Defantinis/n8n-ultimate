/**
 * Performance Error Monitor
 * Tracks performance impact of error handling operations and system load
 */

import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import * as os from 'os';

/**
 * Performance metrics for error handling operations
 */
export interface ErrorHandlingMetrics {
  timestamp: Date;
  
  // Error handling overhead
  errorHandlingOverhead: {
    avgClassificationTime: number; // ms
    avgLoggingTime: number; // ms
    avgTelemetryTime: number; // ms
    totalOverhead: number; // ms per error
    errorProcessingRate: number; // errors per second
  };
  
  // System performance
  systemLoad: {
    cpuUsage: number; // percentage
    memoryUsage: number; // percentage
    heapUsage: number; // MB
    eventLoopLag: number; // ms
    activeHandles: number;
    gcPressure: number; // percentage
  };
  
  // Error processing impact
  processingImpact: {
    queueSize: number;
    processingDelay: number; // ms
    dropRate: number; // percentage
    throttleRate: number; // percentage
  };
  
  // Performance thresholds
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
    optimal: number; // ms per error
    degraded: number;
    critical: number;
  };
}

/**
 * Performance monitoring configuration
 */
export interface MonitorConfig {
  sampleInterval: number; // ms
  metricsWindow: number; // ms
  alertThreshold: number; // percentage
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
export class PerformanceErrorMonitor extends EventEmitter {
  private metrics: ErrorHandlingMetrics[] = [];
  private thresholds: PerformanceThresholds;
  private config: MonitorConfig;
  private isMonitoring: boolean = false;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private startTimes: Map<string, number> = new Map();
  private operationCounts: Map<string, number> = new Map();
  private operationTimes: Map<string, number[]> = new Map();
  private lastGcTime: number = 0;
  private gcObserver: any = null;
  
  constructor(
    thresholds?: Partial<PerformanceThresholds>,
    config?: Partial<MonitorConfig>
  ) {
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
  public startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.sampleInterval);
    
    this.emit('monitoring-started');
  }
  
  /**
   * Stop performance monitoring
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) return;
    
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
  public startOperation(operationType: string, operationId: string = ''): string {
    const id = `${operationType}_${operationId || Date.now()}`;
    this.startTimes.set(id, performance.now());
    return id;
  }
  
  /**
   * End timing an operation
   */
  public endOperation(operationId: string): number {
    const startTime = this.startTimes.get(operationId);
    if (!startTime) return 0;
    
    const duration = performance.now() - startTime;
    this.startTimes.delete(operationId);
    
    // Record operation statistics
    const operationType = operationId.split('_')[0];
    if (!this.operationCounts.has(operationType)) {
      this.operationCounts.set(operationType, 0);
      this.operationTimes.set(operationType, []);
    }
    
    this.operationCounts.set(operationType, this.operationCounts.get(operationType)! + 1);
    const times = this.operationTimes.get(operationType)!;
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
  public getCurrentMetrics(): ErrorHandlingMetrics {
    return this.collectMetrics();
  }
  
  /**
   * Get metrics history
   */
  public getMetricsHistory(windowMs?: number): ErrorHandlingMetrics[] {
    const now = Date.now();
    const window = windowMs || this.config.metricsWindow;
    
    return this.metrics.filter(metric => 
      now - metric.timestamp.getTime() <= window
    );
  }
  
  /**
   * Get performance recommendations
   */
  public getRecommendations(): {
    mode: 'full' | 'reduced' | 'minimal';
    actions: string[];
    reasoning: string;
  } {
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
  public canProcessError(errorSeverity: 'low' | 'medium' | 'high' | 'critical'): boolean {
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
  private collectMetrics(): ErrorHandlingMetrics {
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
      activeHandles: (process as any)._getActiveHandles?.()?.length || 0,
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
    
    const metrics: ErrorHandlingMetrics = {
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
  private calculateErrorHandlingOverhead() {
    const classificationTimes = this.operationTimes.get('classification') || [];
    const loggingTimes = this.operationTimes.get('logging') || [];
    const telemetryTimes = this.operationTimes.get('telemetry') || [];
    
    const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
    
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
  private getCpuUsage(): number {
    const cpus = os.cpus();
    let totalIdle = 0;
    let totalTick = 0;
    
    for (const cpu of cpus) {
      for (const type in cpu.times) {
        totalTick += cpu.times[type as keyof typeof cpu.times];
      }
      totalIdle += cpu.times.idle;
    }
    
    return 100 - (totalIdle / totalTick * 100);
  }
  
  /**
   * Measure event loop lag
   */
  private measureEventLoopLag(): number {
    const start = performance.now();
    return new Promise<number>(resolve => {
      setImmediate(() => {
        resolve(performance.now() - start);
      });
    }) as any; // Simplified for synchronous use
  }
  
  /**
   * Calculate GC pressure
   */
  private calculateGcPressure(): number {
    // Simplified GC pressure calculation
    // In a real implementation, this would track GC frequency and duration
    const now = performance.now();
    const timeSinceLastGc = now - this.lastGcTime;
    
    if (timeSinceLastGc < 1000) return 100; // Recent GC = high pressure
    if (timeSinceLastGc < 5000) return 50;  // Moderate pressure
    return 10; // Low pressure
  }
  
  /**
   * Calculate processing delay
   */
  private calculateProcessingDelay(): number {
    // Calculate average time items spend in processing
    const queueSize = this.startTimes.size;
    if (queueSize === 0) return 0;
    
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
  private determinePerformanceStatus(
    systemLoad: ErrorHandlingMetrics['systemLoad'],
    errorHandlingOverhead: ErrorHandlingMetrics['errorHandlingOverhead']
  ): 'optimal' | 'degraded' | 'critical' {
    // Check critical thresholds
    if (
      systemLoad.cpuUsage >= this.thresholds.cpu.critical ||
      systemLoad.memoryUsage >= this.thresholds.memory.critical ||
      systemLoad.eventLoopLag >= this.thresholds.eventLoopLag.critical ||
      errorHandlingOverhead.totalOverhead >= this.thresholds.errorHandlingOverhead.critical
    ) {
      return 'critical';
    }
    
    // Check degraded thresholds
    if (
      systemLoad.cpuUsage >= this.thresholds.cpu.degraded ||
      systemLoad.memoryUsage >= this.thresholds.memory.degraded ||
      systemLoad.eventLoopLag >= this.thresholds.eventLoopLag.degraded ||
      errorHandlingOverhead.totalOverhead >= this.thresholds.errorHandlingOverhead.degraded
    ) {
      return 'degraded';
    }
    
    return 'optimal';
  }
  
  /**
   * Determine recommended mode
   */
  private determineRecommendedMode(status: 'optimal' | 'degraded' | 'critical'): 'full' | 'reduced' | 'minimal' {
    switch (status) {
      case 'critical': return 'minimal';
      case 'degraded': return 'reduced';
      default: return 'full';
    }
  }
  
  /**
   * Initialize GC tracking
   */
  private initializeGcTracking(): void {
    try {
      // Try to set up GC tracking if available
      if (typeof global.gc === 'function') {
        this.gcObserver = setInterval(() => {
          this.lastGcTime = performance.now();
        }, 1000);
      }
    } catch (error) {
      // GC tracking not available, continue without it
    }
  }
  
  /**
   * Clean old metrics
   */
  private cleanOldMetrics(): void {
    const now = Date.now();
    const cutoffTime = now - (this.config.metricsWindow * 2); // Keep extra history
    
    this.metrics = this.metrics.filter(metric => 
      metric.timestamp.getTime() > cutoffTime
    );
  }
  
  /**
   * Check for performance alerts
   */
  private checkForAlerts(metrics: ErrorHandlingMetrics): void {
    const alerts: PerformanceAlert[] = [];
    
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