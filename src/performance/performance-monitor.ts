/**
 * Performance Monitor and Profiling System
 * Comprehensive monitoring of CPU usage, memory allocation, response times,
 * and async processing performance for Node.js applications
 */

import { EventEmitter } from 'events';
import * as os from 'os';
import * as fs from 'fs/promises';
import * as path from 'path';
import { performance, PerformanceObserver } from 'perf_hooks';

// Core interfaces for performance monitoring
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
  usage: number; // Percentage
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
  interval: number; // Monitoring interval in milliseconds
  retentionPeriod: number; // How long to keep metrics (in milliseconds)
  alerts: {
    enabled: boolean;
    thresholds: {
      cpuUsage: number; // Percentage
      memoryUsage: number; // Percentage
      eventLoopDelay: number; // Milliseconds
      responseTime: number; // Milliseconds
      errorRate: number; // Percentage
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
export class PerformanceMonitor extends EventEmitter {
  private config: MonitoringConfiguration;
  private isRunning: boolean = false;
  private monitoringInterval?: NodeJS.Timeout;
  private metrics: PerformanceMetrics[] = [];
  private profiles: Map<string, PerformanceProfile> = new Map();
  private alerts: PerformanceAlert[] = [];
  private performanceObserver?: PerformanceObserver;
  private gcMetrics: GCMetrics = {
    totalDuration: 0,
    totalCount: 0,
    majorCount: 0,
    minorCount: 0,
    averageDuration: 0,
    lastGCTime: 0
  };
  private httpMetrics: HTTPMetrics = {
    requestCount: 0,
    responseCount: 0,
    averageResponseTime: 0,
    slowRequests: 0,
    errorCount: 0,
    activeConnections: 0
  };
  private asyncMetrics: AsyncMetrics = {
    pendingOperations: 0,
    completedOperations: 0,
    averageOperationTime: 0,
    queuedOperations: 0,
    workerThreads: 0
  };
  private customMetrics: CustomMetrics = {};
  private startTime: number = Date.now();
  private lastCPUUsage = process.cpuUsage();
  private eventLoopUtilization = performance.eventLoopUtilization();

  constructor(config: Partial<MonitoringConfiguration> = {}) {
    super();
    this.config = this.mergeConfig(config);
    this.setupPerformanceObserver();
    this.setupGCObserver();
  }

  /**
   * Start performance monitoring
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.startTime = Date.now();

    // Start periodic monitoring
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.interval);

    // Start performance observer
    if (this.performanceObserver && this.config.profiling.enabled) {
      this.performanceObserver.observe({ entryTypes: ['measure', 'mark'] });
    }

    this.emit('started', { timestamp: this.startTime });
    console.log('🚀 Performance monitoring started');
  }

  /**
   * Stop performance monitoring
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }

    // Save final metrics if persistence is enabled
    if (this.config.persistence.enabled) {
      await this.saveMetrics();
    }

    this.emit('stopped', { timestamp: Date.now(), duration: Date.now() - this.startTime });
    console.log('⏹️ Performance monitoring stopped');
  }

  /**
   * Start a performance profile
   */
  startProfile(name: string): void {
    if (this.profiles.has(name)) {
      this.endProfile(name); // End existing profile
    }

    const profile: PerformanceProfile = {
      name,
      startTime: Date.now(),
      metrics: [],
      summary: {
        totalDuration: 0,
        averageCPU: 0,
        peakMemory: 0,
        gcCount: 0,
        slowOperations: 0,
        errorCount: 0
      }
    };

    this.profiles.set(name, profile);
    performance.mark(`${name}-start`);
    this.emit('profileStarted', { name, timestamp: profile.startTime });
  }

  /**
   * End a performance profile
   */
  endProfile(name: string): PerformanceProfile | null {
    const profile = this.profiles.get(name);
    if (!profile) {
      return null;
    }

    profile.endTime = Date.now();
    profile.duration = profile.endTime - profile.startTime;

    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);

    // Calculate summary
    profile.summary = this.calculateProfileSummary(profile);

    this.emit('profileEnded', { name, profile });
    return profile;
  }

  /**
   * Get current performance metrics
   */
  getCurrentMetrics(): PerformanceMetrics {
    return this.collectMetrics();
  }

  /**
   * Get historical metrics
   */
  getHistoricalMetrics(timeRange?: { start: number; end: number }): PerformanceMetrics[] {
    if (!timeRange) {
      return [...this.metrics];
    }

    return this.metrics.filter(metric => 
      metric.timestamp >= timeRange.start && metric.timestamp <= timeRange.end
    );
  }

  /**
   * Get performance profile
   */
  getProfile(name: string): PerformanceProfile | null {
    return this.profiles.get(name) || null;
  }

  /**
   * Get all profiles
   */
  getAllProfiles(): PerformanceProfile[] {
    return Array.from(this.profiles.values());
  }

  /**
   * Get performance alerts
   */
  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  /**
   * Add custom metric
   */
  addCustomMetric(key: string, value: number | string | boolean | object): void {
    this.customMetrics[key] = value;
    this.emit('customMetric', { key, value, timestamp: Date.now() });
  }

  /**
   * Track HTTP request
   */
  trackHTTPRequest(responseTime: number, statusCode: number): void {
    this.httpMetrics.requestCount++;
    this.httpMetrics.responseCount++;
    
    // Update average response time
    const totalTime = this.httpMetrics.averageResponseTime * (this.httpMetrics.responseCount - 1) + responseTime;
    this.httpMetrics.averageResponseTime = totalTime / this.httpMetrics.responseCount;

    // Track slow requests
    if (responseTime > this.config.alerts.thresholds.responseTime) {
      this.httpMetrics.slowRequests++;
    }

    // Track errors
    if (statusCode >= 400) {
      this.httpMetrics.errorCount++;
    }
  }

  /**
   * Track async operation
   */
  trackAsyncOperation(operationTime: number, success: boolean = true): void {
    if (success) {
      this.asyncMetrics.completedOperations++;
      
      // Update average operation time
      const totalTime = this.asyncMetrics.averageOperationTime * (this.asyncMetrics.completedOperations - 1) + operationTime;
      this.asyncMetrics.averageOperationTime = totalTime / this.asyncMetrics.completedOperations;
    }
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): PerformanceSummary {
    const recentMetrics = this.metrics.slice(-100); // Last 100 metrics
    
    if (recentMetrics.length === 0) {
      return {
        totalDuration: Date.now() - this.startTime,
        averageCPU: 0,
        peakMemory: 0,
        gcCount: this.gcMetrics.totalCount,
        slowOperations: this.httpMetrics.slowRequests,
        errorCount: this.httpMetrics.errorCount
      };
    }

    const averageCPU = recentMetrics.reduce((sum, metric) => sum + metric.cpu.usage, 0) / recentMetrics.length;
    const peakMemory = Math.max(...recentMetrics.map(metric => metric.memory.heapUsed));

    return {
      totalDuration: Date.now() - this.startTime,
      averageCPU,
      peakMemory,
      gcCount: this.gcMetrics.totalCount,
      slowOperations: this.httpMetrics.slowRequests,
      errorCount: this.httpMetrics.errorCount
    };
  }

  /**
   * Generate performance report
   */
  generateReport(): object {
    const summary = this.getPerformanceSummary();
    const currentMetrics = this.getCurrentMetrics();
    const profiles = this.getAllProfiles();
    const alerts = this.getAlerts();

    return {
      timestamp: Date.now(),
      uptime: Date.now() - this.startTime,
      summary,
      currentMetrics,
      profiles: profiles.map(profile => ({
        name: profile.name,
        duration: profile.duration,
        summary: profile.summary
      })),
      alerts: alerts.slice(-10), // Last 10 alerts
      systemInfo: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        cpuCount: os.cpus().length,
        totalMemory: os.totalmem(),
        freeMemory: os.freemem()
      }
    };
  }

  /**
   * Clear historical data
   */
  clearHistory(): void {
    this.metrics = [];
    this.profiles.clear();
    this.alerts = [];
    this.emit('historyCleared', { timestamp: Date.now() });
  }

  /**
   * Private method to merge configuration
   */
  private mergeConfig(config: Partial<MonitoringConfiguration>): MonitoringConfiguration {
    return {
      enabled: config.enabled ?? true,
      interval: config.interval ?? 5000, // 5 seconds
      retentionPeriod: config.retentionPeriod ?? 24 * 60 * 60 * 1000, // 24 hours
      alerts: {
        enabled: config.alerts?.enabled ?? true,
        thresholds: {
          cpuUsage: config.alerts?.thresholds?.cpuUsage ?? 80,
          memoryUsage: config.alerts?.thresholds?.memoryUsage ?? 85,
          eventLoopDelay: config.alerts?.thresholds?.eventLoopDelay ?? 100,
          responseTime: config.alerts?.thresholds?.responseTime ?? 1000,
          errorRate: config.alerts?.thresholds?.errorRate ?? 5
        }
      },
      profiling: {
        enabled: config.profiling?.enabled ?? true,
        sampleInterval: config.profiling?.sampleInterval ?? 1000,
        maxProfiles: config.profiling?.maxProfiles ?? 50
      },
      persistence: {
        enabled: config.persistence?.enabled ?? false,
        directory: config.persistence?.directory ?? './performance-logs',
        format: config.persistence?.format ?? 'json'
      }
    };
  }

  /**
   * Setup performance observer
   */
  private setupPerformanceObserver(): void {
    this.performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      
      for (const entry of entries) {
        if (entry.entryType === 'measure') {
          this.emit('performanceMeasure', {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            timestamp: Date.now()
          });
        }
      }
    });
  }

  /**
   * Setup garbage collection observer
   */
  private setupGCObserver(): void {
    if (typeof (global as any).gc === 'function') {
      const originalGC = (global as any).gc;
      (global as any).gc = (...args: any[]) => {
        const start = performance.now();
        const result = originalGC.apply(this, args);
        const duration = performance.now() - start;
        
        this.gcMetrics.totalCount++;
        this.gcMetrics.totalDuration += duration;
        this.gcMetrics.averageDuration = this.gcMetrics.totalDuration / this.gcMetrics.totalCount;
        this.gcMetrics.lastGCTime = Date.now();
        
        return result;
      };
    }
  }

  /**
   * Collect current performance metrics
   */
  private collectMetrics(): PerformanceMetrics {
    const now = Date.now();
    const cpuUsage = process.cpuUsage(this.lastCPUUsage);
    const memUsage = process.memoryUsage();
    const eventLoopUtil = performance.eventLoopUtilization(this.eventLoopUtilization);

    // Calculate CPU usage percentage
    const totalCPUTime = (cpuUsage.user + cpuUsage.system) / 1000; // Convert to milliseconds
    const cpuUsagePercent = (totalCPUTime / this.config.interval) * 100;

    // Calculate memory usage
    const systemMem = {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
      percentage: ((os.totalmem() - os.freemem()) / os.totalmem()) * 100
    };

    const metrics: PerformanceMetrics = {
      timestamp: now,
      cpu: {
        usage: cpuUsagePercent,
        loadAverage: os.loadavg(),
        userTime: cpuUsage.user,
        systemTime: cpuUsage.system,
        processes: 0 // Would need system call
      },
      memory: {
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        external: memUsage.external,
        arrayBuffers: memUsage.arrayBuffers,
        rss: memUsage.rss,
        systemMemory: systemMem
      },
      eventLoop: {
        delay: 0, // Would need event loop delay measurement
        utilization: eventLoopUtil.utilization,
        lag: 0 // Would need lag measurement
      },
      gc: { ...this.gcMetrics },
      http: { ...this.httpMetrics },
      async: { ...this.asyncMetrics },
      custom: { ...this.customMetrics }
    };

    // Store metrics
    this.metrics.push(metrics);
    
    // Clean up old metrics
    this.cleanupOldMetrics();
    
    // Check for alerts
    this.checkAlerts(metrics);
    
    // Update last values
    this.lastCPUUsage = process.cpuUsage();
    this.eventLoopUtilization = performance.eventLoopUtilization();

    this.emit('metricsCollected', metrics);
    
    return metrics;
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(metrics: PerformanceMetrics): void {
    if (!this.config.alerts.enabled) {
      return;
    }

    const alerts: PerformanceAlert[] = [];

    // CPU usage alert
    if (metrics.cpu.usage > this.config.alerts.thresholds.cpuUsage) {
      alerts.push({
        type: metrics.cpu.usage > this.config.alerts.thresholds.cpuUsage * 1.2 ? 'critical' : 'warning',
        metric: 'cpu.usage',
        value: metrics.cpu.usage,
        threshold: this.config.alerts.thresholds.cpuUsage,
        timestamp: metrics.timestamp,
        message: `CPU usage is ${metrics.cpu.usage.toFixed(1)}% (threshold: ${this.config.alerts.thresholds.cpuUsage}%)`
      });
    }

    // Memory usage alert
    if (metrics.memory.systemMemory.percentage > this.config.alerts.thresholds.memoryUsage) {
      alerts.push({
        type: metrics.memory.systemMemory.percentage > this.config.alerts.thresholds.memoryUsage * 1.2 ? 'critical' : 'warning',
        metric: 'memory.systemMemory.percentage',
        value: metrics.memory.systemMemory.percentage,
        threshold: this.config.alerts.thresholds.memoryUsage,
        timestamp: metrics.timestamp,
        message: `Memory usage is ${metrics.memory.systemMemory.percentage.toFixed(1)}% (threshold: ${this.config.alerts.thresholds.memoryUsage}%)`
      });
    }

    // Event loop delay alert
    if (metrics.eventLoop.delay > this.config.alerts.thresholds.eventLoopDelay) {
      alerts.push({
        type: metrics.eventLoop.delay > this.config.alerts.thresholds.eventLoopDelay * 2 ? 'critical' : 'warning',
        metric: 'eventLoop.delay',
        value: metrics.eventLoop.delay,
        threshold: this.config.alerts.thresholds.eventLoopDelay,
        timestamp: metrics.timestamp,
        message: `Event loop delay is ${metrics.eventLoop.delay}ms (threshold: ${this.config.alerts.thresholds.eventLoopDelay}ms)`
      });
    }

    // Add alerts
    this.alerts.push(...alerts);
    
    // Emit alert events
    alerts.forEach(alert => {
      this.emit('alert', alert);
    });
  }

  /**
   * Clean up old metrics based on retention period
   */
  private cleanupOldMetrics(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;
    this.metrics = this.metrics.filter(metric => metric.timestamp > cutoffTime);
    this.alerts = this.alerts.filter(alert => alert.timestamp > cutoffTime);
  }

  /**
   * Calculate profile summary
   */
  private calculateProfileSummary(profile: PerformanceProfile): PerformanceSummary {
    if (profile.metrics.length === 0) {
      return {
        totalDuration: profile.duration || 0,
        averageCPU: 0,
        peakMemory: 0,
        gcCount: 0,
        slowOperations: 0,
        errorCount: 0
      };
    }

    const averageCPU = profile.metrics.reduce((sum, metric) => sum + metric.cpu.usage, 0) / profile.metrics.length;
    const peakMemory = Math.max(...profile.metrics.map(metric => metric.memory.heapUsed));
    const gcCount = profile.metrics[profile.metrics.length - 1].gc.totalCount - profile.metrics[0].gc.totalCount;

    return {
      totalDuration: profile.duration || 0,
      averageCPU,
      peakMemory,
      gcCount,
      slowOperations: 0, // Would need to track during profile
      errorCount: 0 // Would need to track during profile
    };
  }

  /**
   * Save metrics to disk
   */
  private async saveMetrics(): Promise<void> {
    if (!this.config.persistence.enabled) {
      return;
    }

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `performance-metrics-${timestamp}.${this.config.persistence.format}`;
      const filepath = path.join(this.config.persistence.directory, filename);

      // Ensure directory exists
      await fs.mkdir(this.config.persistence.directory, { recursive: true });

      const data = {
        timestamp: Date.now(),
        metrics: this.metrics,
        profiles: Array.from(this.profiles.values()),
        alerts: this.alerts,
        summary: this.getPerformanceSummary()
      };

      if (this.config.persistence.format === 'json') {
        await fs.writeFile(filepath, JSON.stringify(data, null, 2));
      } else {
        // CSV format - simplified version
        const csvData = this.convertToCSV(this.metrics);
        await fs.writeFile(filepath, csvData);
      }

      this.emit('metricsSaved', { filepath, timestamp: Date.now() });
    } catch (error) {
      this.emit('error', { type: 'save', error, timestamp: Date.now() });
    }
  }

  /**
   * Convert metrics to CSV format
   */
  private convertToCSV(metrics: PerformanceMetrics[]): string {
    const headers = [
      'timestamp',
      'cpu_usage',
      'memory_heap_used',
      'memory_heap_total',
      'memory_rss',
      'event_loop_utilization',
      'gc_count',
      'http_requests',
      'http_avg_response_time'
    ];

    const rows = metrics.map(metric => [
      metric.timestamp,
      metric.cpu.usage,
      metric.memory.heapUsed,
      metric.memory.heapTotal,
      metric.memory.rss,
      metric.eventLoop.utilization,
      metric.gc.totalCount,
      metric.http.requestCount,
      metric.http.averageResponseTime
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  }
}

/**
 * Global performance monitor instance
 */
let globalMonitor: PerformanceMonitor | null = null;

/**
 * Get or create global performance monitor
 */
export function getPerformanceMonitor(config?: Partial<MonitoringConfiguration>): PerformanceMonitor {
  if (!globalMonitor) {
    globalMonitor = new PerformanceMonitor(config);
  }
  return globalMonitor;
}

/**
 * Performance monitoring utilities
 */
export class PerformanceUtils {
  /**
   * Measure function execution time
   */
  static async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const monitor = getPerformanceMonitor();
    monitor.startProfile(name);
    
    try {
      const result = await fn();
      return result;
    } finally {
      monitor.endProfile(name);
    }
  }

  /**
   * Measure synchronous function execution time
   */
  static measure<T>(name: string, fn: () => T): T {
    const monitor = getPerformanceMonitor();
    monitor.startProfile(name);
    
    try {
      const result = fn();
      return result;
    } finally {
      monitor.endProfile(name);
    }
  }

  /**
   * Create a performance decorator
   */
  static createDecorator(name?: string) {
    return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;
      const profileName = name || `${target.constructor.name}.${propertyKey}`;

      descriptor.value = async function(...args: any[]) {
        return PerformanceUtils.measureAsync(profileName, () => originalMethod.apply(this, args));
      };

      return descriptor;
    };
  }
}

/**
 * Export default monitor instance
 */
export default getPerformanceMonitor(); 