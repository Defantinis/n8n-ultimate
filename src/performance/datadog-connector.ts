import { EventEmitter } from 'events';
import { StatsD } from 'hot-shots';
import { PerformanceMonitor, PerformanceMetrics, PerformanceAlert } from './performance-monitor';

export interface DatadogConnectorConfig {
  host?: string;
  port?: number;
  prefix?: string;
  globalTags?: string[];
}

export class DatadogPerformanceConnector {
  private performanceMonitor: PerformanceMonitor;
  private statsdClient: StatsD;
  private config: DatadogConnectorConfig;

  constructor(performanceMonitor: PerformanceMonitor, config: DatadogConnectorConfig = {}) {
    this.performanceMonitor = performanceMonitor;
    this.config = config;
    
    this.statsdClient = new StatsD({
      host: this.config.host || 'localhost',
      port: this.config.port || 8125,
      prefix: this.config.prefix || 'n8n_ultimate.',
      globalTags: this.config.globalTags || [],
      errorHandler: (error) => {
        console.error('StatsD error:', error);
      }
    });

    this.bindEvents();
  }

  private bindEvents(): void {
    this.performanceMonitor.on('metrics', (metrics: PerformanceMetrics) => {
      this.sendMetrics(metrics);
    });

    this.performanceMonitor.on('alert', (alert: PerformanceAlert) => {
      this.sendAlert(alert);
    });
  }

  private sendMetrics(metrics: PerformanceMetrics): void {
    // CPU Metrics
    this.statsdClient.gauge('cpu.usage', metrics.cpu.usage);
    this.statsdClient.gauge('cpu.load_average.1m', metrics.cpu.loadAverage[0]);
    this.statsdClient.gauge('cpu.load_average.5m', metrics.cpu.loadAverage[1]);
    this.statsdClient.gauge('cpu.load_average.15m', metrics.cpu.loadAverage[2]);

    // Memory Metrics
    this.statsdClient.gauge('memory.heap_used', metrics.memory.heapUsed);
    this.statsdClient.gauge('memory.heap_total', metrics.memory.heapTotal);
    this.statsdClient.gauge('memory.rss', metrics.memory.rss);
    this.statsdClient.gauge('memory.system.used_percentage', metrics.memory.systemMemory.percentage);

    // Event Loop Metrics
    this.statsdClient.histogram('event_loop.delay', metrics.eventLoop.delay);
    this.statsdClient.gauge('event_loop.utilization', metrics.eventLoop.utilization);
    this.statsdClient.histogram('event_loop.lag', metrics.eventLoop.lag);

    // GC Metrics
    this.statsdClient.histogram('gc.duration', metrics.gc.totalDuration);
    this.statsdClient.increment('gc.count.total', metrics.gc.totalCount);
    this.statsdClient.increment('gc.count.major', metrics.gc.majorCount);
    this.statsdClient.increment('gc.count.minor', metrics.gc.minorCount);

    // HTTP Metrics
    this.statsdClient.increment('http.requests.count', metrics.http.requestCount);
    this.statsdClient.increment('http.responses.count', metrics.http.responseCount);
    this.statsdClient.histogram('http.response_time.average', metrics.http.averageResponseTime);
    this.statsdClient.increment('http.requests.slow', metrics.http.slowRequests);
    this.statsdClient.increment('http.errors.count', metrics.http.errorCount);
    this.statsdClient.gauge('http.connections.active', metrics.http.activeConnections);

    // Async Metrics
    this.statsdClient.gauge('async.operations.pending', metrics.async.pendingOperations);
    this.statsdClient.increment('async.operations.completed', metrics.async.completedOperations);
    this.statsdClient.histogram('async.operation_time.average', metrics.async.averageOperationTime);

    // Custom Metrics
    for (const [key, value] of Object.entries(metrics.custom)) {
        if (typeof value === 'number') {
            this.statsdClient.gauge(`custom.${key}`, value);
        }
    }
  }

  private sendAlert(alert: PerformanceAlert): void {
    const title = `Performance Alert: ${alert.metric} threshold exceeded`;
    const text = `${alert.message}\nValue: ${alert.value}, Threshold: ${alert.threshold}`;
    const priority = alert.type === 'critical' ? 'error' : 'warning';

    this.statsdClient.event(title, text, {
      alert_type: priority,
      priority: 'normal',
    }, [`metric:${alert.metric}`, `type:${alert.type}`]);
  }

  public close(): void {
    this.statsdClient.close((error) => {
      if (error) {
        console.error('Error closing StatsD client:', error);
      }
    });
  }
} 