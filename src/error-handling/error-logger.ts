import { EventEmitter } from 'events';
import { writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { ClassifiedError, ErrorSeverity, ErrorCategory, ErrorType } from './error-classifier';

/**
 * Log levels for different types of information
 */
export enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

/**
 * Telemetry data structure for detailed error tracking
 */
export interface TelemetryData {
  // Basic telemetry
  timestamp: Date;
  sessionId: string;
  userId?: string;
  errorId: string;
  
  // System telemetry
  systemInfo: {
    platform: string;
    arch: string;
    nodeVersion: string;
    memoryUsage: NodeJS.MemoryUsage;
    cpuUsage: number;
    uptime: number;
    loadAverage?: number[];
  };
  
  // Application telemetry
  applicationInfo: {
    version: string;
    environment: 'development' | 'staging' | 'production';
    buildNumber?: string;
    commitHash?: string;
    deploymentId?: string;
  };
  
  // Performance telemetry
  performanceMetrics: {
    executionTime: number;
    memoryDelta: number;
    cpuDelta: number;
    networkLatency?: number;
    dbQueryTime?: number;
    cacheHitRate?: number;
  };
  
  // User interaction telemetry
  userInteraction: {
    userAgent?: string;
    ipAddress?: string;
    sessionDuration: number;
    actionsPerformed: number;
    lastAction?: string;
    errorContext?: string;
  };
  
  // Workflow telemetry
  workflowTelemetry?: {
    workflowId: string;
    nodeCount: number;
    connectionCount: number;
    executionCount: number;
    avgExecutionTime: number;
    failureRate: number;
  };
  
  // Custom telemetry
  customData?: Record<string, any>;
}

/**
 * Log entry structure
 */
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  category: string;
  source: string;
  
  // Error-specific data
  error?: ClassifiedError;
  stackTrace?: string;
  
  // Telemetry data
  telemetry?: TelemetryData;
  
  // Context data
  context: {
    userId?: string;
    sessionId?: string;
    workflowId?: string;
    nodeId?: string;
    requestId?: string;
  };
  
  // Metadata
  metadata: {
    tags: string[];
    correlationId?: string;
    parentLogId?: string;
    childLogIds?: string[];
    severity?: ErrorSeverity;
    category?: ErrorCategory;
    type?: ErrorType;
  };
}

/**
 * Log output destination configuration
 */
export interface LogOutput {
  type: 'console' | 'file' | 'database' | 'remote' | 'custom';
  enabled: boolean;
  level: LogLevel;
  format: 'json' | 'text' | 'structured';
  
  // File output specific
  filePath?: string;
  maxFileSize?: number; // in MB
  maxFiles?: number;
  
  // Remote output specific
  endpoint?: string;
  apiKey?: string;
  batchSize?: number;
  flushInterval?: number; // in ms
  
  // Custom output
  customHandler?: (entry: LogEntry) => Promise<void>;
}

/**
 * Monitoring alert configuration
 */
export interface AlertRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  
  // Trigger conditions
  conditions: {
    errorRate?: number; // errors per minute
    errorCount?: number; // total errors in time window
    severity?: ErrorSeverity[];
    categories?: ErrorCategory[];
    types?: ErrorType[];
    timeWindow?: number; // in minutes
  };
  
  // Alert actions
  actions: {
    email?: string[];
    webhook?: string;
    slack?: string;
    pagerDuty?: string;
    customHandler?: (alert: AlertNotification) => Promise<void>;
  };
  
  // Throttling
  throttle: {
    maxAlertsPerHour?: number;
    cooldownPeriod?: number; // in minutes
  };
}

/**
 * Alert notification structure
 */
export interface AlertNotification {
  id: string;
  ruleId: string;
  ruleName: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  
  // Trigger details
  triggerCondition: string;
  affectedCount: number;
  timeWindow: number;
  
  // Related errors
  relatedErrors: string[]; // error IDs
  errorSummary: {
    totalErrors: number;
    bySeverity: Record<ErrorSeverity, number>;
    byCategory: Record<ErrorCategory, number>;
    topErrors: Array<{ type: ErrorType; count: number }>;
  };
  
  // Suggested actions
  suggestedActions: string[];
  
  // Metadata
  metadata: {
    environment: string;
    systemLoad: number;
    affectedUsers: number;
    correlationId: string;
  };
}

/**
 * Monitoring metrics for system health
 */
export interface MonitoringMetrics {
  timestamp: Date;
  timeWindow: number; // in minutes
  
  // Error metrics
  errorMetrics: {
    totalErrors: number;
    errorRate: number; // errors per minute
    errorsBySeverity: Record<ErrorSeverity, number>;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsByType: Record<ErrorType, number>;
    uniqueErrors: number;
    repeatErrors: number;
  };
  
  // Performance metrics
  performanceMetrics: {
    avgResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    throughput: number; // requests per minute
    memoryUsage: number; // percentage
    cpuUsage: number; // percentage
    diskUsage: number; // percentage
  };
  
  // User metrics
  userMetrics: {
    activeUsers: number;
    affectedUsers: number;
    userSatisfactionScore: number;
    avgSessionDuration: number;
  };
  
  // System health
  systemHealth: {
    overallScore: number; // 0-100
    availability: number; // percentage
    reliability: number; // percentage
    errorRecoveryRate: number; // percentage
    alertsTriggered: number;
  };
}

/**
 * Advanced error logger with monitoring and telemetry
 */
export class AdvancedErrorLogger extends EventEmitter {
  private logEntries: Map<string, LogEntry> = new Map();
  private outputs: LogOutput[] = [];
  private alertRules: Map<string, AlertRule> = new Map();
  private activeAlerts: Map<string, AlertNotification> = new Map();
  private sessionId: string;
  private logDirectory: string;
  private maxHistorySize: number = 50000;
  private metricsInterval: NodeJS.Timeout | null = null;
  private batchQueue: LogEntry[] = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor(options: {
    logDirectory?: string;
    maxHistorySize?: number;
    sessionId?: string;
  } = {}) {
    super();
    
    this.logDirectory = options.logDirectory || './logs';
    this.maxHistorySize = options.maxHistorySize || 50000;
    this.sessionId = options.sessionId || this.generateSessionId();
    
    this.ensureLogDirectory();
    this.initializeDefaultOutputs();
    this.initializeDefaultAlertRules();
    this.startMetricsCollection();
  }

  /**
   * Log a classified error with full telemetry
   */
  async logError(
    error: ClassifiedError,
    telemetry?: Partial<TelemetryData>,
    context: Partial<LogEntry['context']> = {}
  ): Promise<string> {
    const logId = this.generateLogId();
    
    const fullTelemetry = await this.collectTelemetry(error, telemetry);
    
    const logEntry: LogEntry = {
      id: logId,
      timestamp: new Date(),
      level: this.mapSeverityToLogLevel(error.severity),
      message: error.message,
      category: error.category,
      source: 'error-logger',
      error,
      stackTrace: error.stackTrace,
      telemetry: fullTelemetry,
      context: {
        userId: error.context.userId,
        sessionId: this.sessionId,
        workflowId: error.context.workflowId,
        nodeId: error.context.nodeId,
        ...context
      },
      metadata: {
        tags: error.tags,
        severity: error.severity,
        category: error.category,
        type: error.type,
        correlationId: this.generateCorrelationId()
      }
    };

    // Store in memory
    this.logEntries.set(logId, logEntry);
    this.cleanupOldEntries();

    // Process through outputs
    await this.processLogEntry(logEntry);

    // Check alert rules
    await this.checkAlertRules(logEntry);

    // Emit events
    this.emit('error_logged', logEntry);
    this.emit(`error_${error.severity}`, logEntry);
    this.emit(`category_${error.category}`, logEntry);

    return logId;
  }

  /**
   * Log a general message with telemetry
   */
  async log(
    level: LogLevel,
    message: string,
    category: string = 'general',
    telemetry?: Partial<TelemetryData>,
    context: Partial<LogEntry['context']> = {}
  ): Promise<string> {
    const logId = this.generateLogId();
    
    const fullTelemetry = telemetry ? await this.collectTelemetry(null, telemetry) : undefined;
    
    const logEntry: LogEntry = {
      id: logId,
      timestamp: new Date(),
      level,
      message,
      category,
      source: 'error-logger',
      telemetry: fullTelemetry,
      context: {
        sessionId: this.sessionId,
        ...context
      },
      metadata: {
        tags: [],
        correlationId: this.generateCorrelationId()
      }
    };

    // Store in memory
    this.logEntries.set(logId, logEntry);
    this.cleanupOldEntries();

    // Process through outputs
    await this.processLogEntry(logEntry);

    // Emit events
    this.emit('log_entry', logEntry);
    this.emit(`log_${level}`, logEntry);

    return logId;
  }

  /**
   * Add a log output destination
   */
  addOutput(output: LogOutput): void {
    this.outputs.push(output);
    this.emit('output_added', output);
  }

  /**
   * Remove a log output destination
   */
  removeOutput(outputType: string): boolean {
    const index = this.outputs.findIndex(o => o.type === outputType);
    if (index >= 0) {
      const removed = this.outputs.splice(index, 1)[0];
      this.emit('output_removed', removed);
      return true;
    }
    return false;
  }

  /**
   * Add an alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.set(rule.id, rule);
    this.emit('alert_rule_added', rule);
  }

  /**
   * Remove an alert rule
   */
  removeAlertRule(ruleId: string): boolean {
    const removed = this.alertRules.delete(ruleId);
    if (removed) {
      this.emit('alert_rule_removed', ruleId);
    }
    return removed;
  }

  /**
   * Get monitoring metrics for a time window
   */
  getMetrics(timeWindowMinutes: number = 60): MonitoringMetrics {
    const now = new Date();
    const startTime = new Date(now.getTime() - timeWindowMinutes * 60 * 1000);
    
    const recentEntries = Array.from(this.logEntries.values())
      .filter(entry => entry.timestamp >= startTime);
    
    const errorEntries = recentEntries.filter(entry => entry.error);
    
    // Calculate error metrics
    const errorMetrics = {
      totalErrors: errorEntries.length,
      errorRate: errorEntries.length / timeWindowMinutes,
      errorsBySeverity: this.countBySeverity(errorEntries),
      errorsByCategory: this.countByCategory(errorEntries),
      errorsByType: this.countByType(errorEntries),
      uniqueErrors: new Set(errorEntries.map(e => e.error?.type)).size,
      repeatErrors: errorEntries.length - new Set(errorEntries.map(e => e.error?.type)).size
    };

    // Calculate performance metrics
    const performanceMetrics = this.calculatePerformanceMetrics(recentEntries);
    
    // Calculate user metrics
    const userMetrics = this.calculateUserMetrics(recentEntries);
    
    // Calculate system health
    const systemHealth = this.calculateSystemHealth(errorMetrics, performanceMetrics);

    return {
      timestamp: now,
      timeWindow: timeWindowMinutes,
      errorMetrics,
      performanceMetrics,
      userMetrics,
      systemHealth
    };
  }

  /**
   * Get log entries with filtering
   */
  getLogEntries(criteria: {
    level?: LogLevel;
    category?: string;
    severity?: ErrorSeverity;
    timeRange?: { start: Date; end: Date };
    userId?: string;
    workflowId?: string;
    limit?: number;
  } = {}): LogEntry[] {
    let entries = Array.from(this.logEntries.values());

    // Apply filters
    if (criteria.level) {
      entries = entries.filter(e => e.level === criteria.level);
    }
    if (criteria.category) {
      entries = entries.filter(e => e.category === criteria.category);
    }
    if (criteria.severity) {
      entries = entries.filter(e => e.metadata.severity === criteria.severity);
    }
    if (criteria.timeRange) {
      entries = entries.filter(e => 
        e.timestamp >= criteria.timeRange!.start && 
        e.timestamp <= criteria.timeRange!.end
      );
    }
    if (criteria.userId) {
      entries = entries.filter(e => e.context.userId === criteria.userId);
    }
    if (criteria.workflowId) {
      entries = entries.filter(e => e.context.workflowId === criteria.workflowId);
    }

    // Sort by timestamp (newest first)
    entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    if (criteria.limit) {
      entries = entries.slice(0, criteria.limit);
    }

    return entries;
  }

  /**
   * Export logs in various formats
   */
  exportLogs(
    format: 'json' | 'csv' | 'text',
    criteria: Parameters<typeof this.getLogEntries>[0] = {}
  ): string {
    const entries = this.getLogEntries(criteria);

    switch (format) {
      case 'json':
        return JSON.stringify(entries, null, 2);
      case 'csv':
        return this.convertToCsv(entries);
      case 'text':
        return this.convertToText(entries);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Clear all log entries
   */
  clearLogs(): void {
    this.logEntries.clear();
    this.emit('logs_cleared');
  }

  /**
   * Shutdown the logger gracefully
   */
  async shutdown(): Promise<void> {
    // Stop metrics collection
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    // Flush any pending batches
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
    }
    await this.flushBatch();

    // Close all outputs
    for (const output of this.outputs) {
      if (output.customHandler) {
        // Allow custom handlers to cleanup
        try {
          await output.customHandler({} as LogEntry);
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    }

    this.emit('shutdown');
  }

  /**
   * Collect comprehensive telemetry data
   */
  private async collectTelemetry(
    error: ClassifiedError | null,
    partial?: Partial<TelemetryData>
  ): Promise<TelemetryData> {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    return {
      timestamp: new Date(),
      sessionId: this.sessionId,
      userId: error?.context.userId || partial?.userId,
      errorId: error?.id || 'N/A',
      
      systemInfo: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        memoryUsage,
        cpuUsage: cpuUsage.user + cpuUsage.system,
        uptime: process.uptime(),
        loadAverage: process.platform !== 'win32' ? (process as any).loadavg() : undefined,
        ...partial?.systemInfo
      },
      
      applicationInfo: {
        version: '1.0.0', // Should come from package.json
        environment: (process.env.NODE_ENV as any) || 'development',
        buildNumber: process.env.BUILD_NUMBER,
        commitHash: process.env.COMMIT_HASH,
        deploymentId: process.env.DEPLOYMENT_ID,
        ...partial?.applicationInfo
      },
      
      performanceMetrics: {
        executionTime: error?.context.performanceMetrics?.executionTime || 0,
        memoryDelta: memoryUsage.heapUsed,
        cpuDelta: cpuUsage.user + cpuUsage.system,
        networkLatency: partial?.performanceMetrics?.networkLatency,
        dbQueryTime: partial?.performanceMetrics?.dbQueryTime,
        cacheHitRate: partial?.performanceMetrics?.cacheHitRate,
        ...partial?.performanceMetrics
      },
      
      userInteraction: {
        userAgent: error?.context.requestInfo?.headers?.['user-agent'],
        ipAddress: 'unknown', // Should be provided by request context
        sessionDuration: Date.now() - new Date(this.sessionId).getTime(),
        actionsPerformed: 0, // Should be tracked separately
        lastAction: partial?.userInteraction?.lastAction,
        errorContext: error?.context.operationId,
        ...partial?.userInteraction
      },
      
      workflowTelemetry: error?.context.workflowId ? {
        workflowId: error.context.workflowId,
        nodeCount: 0, // Should be provided by workflow context
        connectionCount: 0,
        executionCount: 0,
        avgExecutionTime: 0,
        failureRate: 0,
        ...partial?.workflowTelemetry
      } : partial?.workflowTelemetry,
      
      customData: partial?.customData || {}
    };
  }

  /**
   * Process a log entry through all outputs
   */
  private async processLogEntry(entry: LogEntry): Promise<void> {
    const promises = this.outputs
      .filter(output => output.enabled && this.shouldProcessEntry(entry, output))
      .map(output => this.processOutput(entry, output));

    await Promise.allSettled(promises);
  }

  /**
   * Check if entry should be processed by output based on level
   */
  private shouldProcessEntry(entry: LogEntry, output: LogOutput): boolean {
    const levels = [LogLevel.TRACE, LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const entryLevelIndex = levels.indexOf(entry.level);
    const outputLevelIndex = levels.indexOf(output.level);
    
    return entryLevelIndex >= outputLevelIndex;
  }

  /**
   * Process entry through specific output
   */
  private async processOutput(entry: LogEntry, output: LogOutput): Promise<void> {
    try {
      switch (output.type) {
        case 'console':
          this.processConsoleOutput(entry, output);
          break;
        case 'file':
          await this.processFileOutput(entry, output);
          break;
        case 'remote':
          await this.processRemoteOutput(entry, output);
          break;
        case 'custom':
          if (output.customHandler) {
            await output.customHandler(entry);
          }
          break;
      }
    } catch (error) {
      // Emit error but don't throw to avoid infinite loops
      this.emit('output_error', { output, error, entry });
    }
  }

  /**
   * Process console output
   */
  private processConsoleOutput(entry: LogEntry, output: LogOutput): void {
    const message = this.formatLogEntry(entry, output.format);
    
    switch (entry.level) {
      case LogLevel.FATAL:
      case LogLevel.ERROR:
        console.error(message);
        break;
      case LogLevel.WARN:
        console.warn(message);
        break;
      case LogLevel.INFO:
        console.info(message);
        break;
      case LogLevel.DEBUG:
      case LogLevel.TRACE:
        console.debug(message);
        break;
    }
  }

  /**
   * Process file output
   */
  private async processFileOutput(entry: LogEntry, output: LogOutput): Promise<void> {
    if (!output.filePath) return;

    const message = this.formatLogEntry(entry, output.format) + '\n';
    
    try {
      // Check file size and rotate if necessary
      if (output.maxFileSize) {
        await this.rotateLogFile(output);
      }
      
      appendFileSync(output.filePath, message, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write to log file: ${error.message}`);
    }
  }

  /**
   * Process remote output (batch)
   */
  private async processRemoteOutput(entry: LogEntry, output: LogOutput): Promise<void> {
    if (!output.endpoint) return;

    // Add to batch queue
    this.batchQueue.push(entry);
    
    // Flush if batch is full
    if (this.batchQueue.length >= (output.batchSize || 100)) {
      await this.flushBatch(output);
    }
    
    // Set flush timer if not already set
    if (!this.flushTimer && output.flushInterval) {
      this.flushTimer = setTimeout(() => {
        this.flushBatch(output);
      }, output.flushInterval);
    }
  }

  /**
   * Flush batch queue to remote endpoint
   */
  private async flushBatch(output?: LogOutput): Promise<void> {
    if (this.batchQueue.length === 0) return;

    const batch = this.batchQueue.splice(0);
    
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (output?.endpoint) {
      try {
        // In a real implementation, this would use fetch or axios
        // For now, we'll just emit an event
        this.emit('batch_flushed', { output, batch });
      } catch (error) {
        // Re-queue failed entries
        this.batchQueue.unshift(...batch);
        throw error;
      }
    }
  }

  /**
   * Check alert rules against log entry
   */
  private async checkAlertRules(entry: LogEntry): Promise<void> {
    for (const rule of Array.from(this.alertRules.values())) {
      if (!rule.enabled) continue;

      const shouldTrigger = await this.evaluateAlertRule(rule, entry);
      if (shouldTrigger) {
        await this.triggerAlert(rule, entry);
      }
    }
  }

  /**
   * Evaluate if alert rule should trigger
   */
  private async evaluateAlertRule(rule: AlertRule, entry: LogEntry): Promise<boolean> {
    const timeWindow = rule.conditions.timeWindow || 60; // minutes
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000);
    
    const recentEntries = Array.from(this.logEntries.values())
      .filter(e => e.timestamp >= startTime);
    
    const errorEntries = recentEntries.filter(e => e.error);

    // Check error rate
    if (rule.conditions.errorRate) {
      const currentRate = errorEntries.length / timeWindow;
      if (currentRate >= rule.conditions.errorRate) {
        return true;
      }
    }

    // Check error count
    if (rule.conditions.errorCount) {
      if (errorEntries.length >= rule.conditions.errorCount) {
        return true;
      }
    }

    // Check severity filter
    if (rule.conditions.severity) {
      const matchingSeverity = errorEntries.filter(e => 
        rule.conditions.severity!.includes(e.metadata.severity!)
      );
      if (matchingSeverity.length > 0) {
        return true;
      }
    }

    // Check category filter
    if (rule.conditions.categories) {
      const matchingCategory = errorEntries.filter(e => 
        rule.conditions.categories!.includes(e.metadata.category!)
      );
      if (matchingCategory.length > 0) {
        return true;
      }
    }

    return false;
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(rule: AlertRule, triggerEntry: LogEntry): Promise<void> {
    // Check throttling
    const existingAlert = this.activeAlerts.get(rule.id);
    if (existingAlert && this.isThrottled(rule, existingAlert)) {
      return;
    }

    const alertId = this.generateAlertId();
    const timeWindow = rule.conditions.timeWindow || 60;
    const startTime = new Date(Date.now() - timeWindow * 60 * 1000);
    
    const recentErrors = Array.from(this.logEntries.values())
      .filter(e => e.error && e.timestamp >= startTime);

    const alert: AlertNotification = {
      id: alertId,
      ruleId: rule.id,
      ruleName: rule.name,
      timestamp: new Date(),
      severity: this.mapRuleSeverity(rule),
      triggerCondition: this.describeTriggerCondition(rule),
      affectedCount: recentErrors.length,
      timeWindow,
      relatedErrors: recentErrors.map(e => e.id),
      errorSummary: {
        totalErrors: recentErrors.length,
        bySeverity: this.countBySeverity(recentErrors),
        byCategory: this.countByCategory(recentErrors),
        topErrors: this.getTopErrors(recentErrors)
      },
      suggestedActions: this.generateSuggestedActions(rule, recentErrors),
      metadata: {
        environment: process.env.NODE_ENV || 'development',
        systemLoad: process.cpuUsage().user + process.cpuUsage().system,
        affectedUsers: new Set(recentErrors.map(e => e.context.userId).filter(Boolean)).size,
        correlationId: this.generateCorrelationId()
      }
    };

    // Store active alert
    this.activeAlerts.set(rule.id, alert);

    // Execute alert actions
    await this.executeAlertActions(rule, alert);

    // Emit event
    this.emit('alert_triggered', alert);
  }

  /**
   * Initialize default outputs
   */
  private initializeDefaultOutputs(): void {
    // Console output
    this.addOutput({
      type: 'console',
      enabled: true,
      level: LogLevel.INFO,
      format: 'text'
    });

    // File output
    this.addOutput({
      type: 'file',
      enabled: true,
      level: LogLevel.DEBUG,
      format: 'json',
      filePath: join(this.logDirectory, 'error.log'),
      maxFileSize: 10, // 10MB
      maxFiles: 5
    });
  }

  /**
   * Initialize default alert rules
   */
  private initializeDefaultAlertRules(): void {
    // High error rate alert
    this.addAlertRule({
      id: 'high_error_rate',
      name: 'High Error Rate',
      description: 'Triggers when error rate exceeds threshold',
      enabled: true,
      conditions: {
        errorRate: 10, // 10 errors per minute
        timeWindow: 5
      },
      actions: {
        email: [],
        webhook: undefined
      },
      throttle: {
        maxAlertsPerHour: 2,
        cooldownPeriod: 30
      }
    });

    // Critical error alert
    this.addAlertRule({
      id: 'critical_errors',
      name: 'Critical Errors',
      description: 'Triggers on any critical error',
      enabled: true,
      conditions: {
        severity: [ErrorSeverity.CRITICAL],
        errorCount: 1,
        timeWindow: 1
      },
      actions: {
        email: [],
        webhook: undefined
      },
      throttle: {
        maxAlertsPerHour: 10,
        cooldownPeriod: 5
      }
    });
  }

  /**
   * Utility methods
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateLogId(): string {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateCorrelationId(): string {
    return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapSeverityToLogLevel(severity: ErrorSeverity): LogLevel {
    switch (severity) {
      case ErrorSeverity.CRITICAL: return LogLevel.FATAL;
      case ErrorSeverity.HIGH: return LogLevel.ERROR;
      case ErrorSeverity.MEDIUM: return LogLevel.WARN;
      case ErrorSeverity.LOW: return LogLevel.INFO;
      case ErrorSeverity.INFO: return LogLevel.DEBUG;
      default: return LogLevel.INFO;
    }
  }

  private formatLogEntry(entry: LogEntry, format: string): string {
    switch (format) {
      case 'json':
        return JSON.stringify(entry);
      case 'structured':
        return `[${entry.timestamp.toISOString()}] ${entry.level.toUpperCase()} [${entry.category}] ${entry.message}`;
      case 'text':
      default:
        return `${entry.timestamp.toISOString()} [${entry.level.toUpperCase()}] ${entry.message}`;
    }
  }

  private ensureLogDirectory(): void {
    if (!existsSync(this.logDirectory)) {
      mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  private async rotateLogFile(output: LogOutput): Promise<void> {
    // Simplified rotation logic - in production, use a proper log rotation library
    if (output.filePath && existsSync(output.filePath)) {
      const stats = require('fs').statSync(output.filePath);
      const maxSize = (output.maxFileSize || 10) * 1024 * 1024; // Convert MB to bytes
      
      if (stats.size >= maxSize) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const rotatedPath = `${output.filePath}.${timestamp}`;
        require('fs').renameSync(output.filePath, rotatedPath);
      }
    }
  }

  private cleanupOldEntries(): void {
    if (this.logEntries.size > this.maxHistorySize) {
      const entries = Array.from(this.logEntries.entries())
        .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
      
      const toRemove = entries.slice(0, entries.length - this.maxHistorySize);
      toRemove.forEach(([id]) => this.logEntries.delete(id));
    }
  }

  private startMetricsCollection(): void {
    this.metricsInterval = setInterval(() => {
      const metrics = this.getMetrics(5); // 5-minute window
      this.emit('metrics_collected', metrics);
    }, 60000); // Every minute
  }

  private countBySeverity(entries: LogEntry[]): Record<ErrorSeverity, number> {
    const counts = {} as Record<ErrorSeverity, number>;
    for (const severity of Object.values(ErrorSeverity)) {
      counts[severity] = entries.filter(e => e.metadata.severity === severity).length;
    }
    return counts;
  }

  private countByCategory(entries: LogEntry[]): Record<ErrorCategory, number> {
    const counts = {} as Record<ErrorCategory, number>;
    for (const category of Object.values(ErrorCategory)) {
      counts[category] = entries.filter(e => e.metadata.category === category).length;
    }
    return counts;
  }

  private countByType(entries: LogEntry[]): Record<ErrorType, number> {
    const counts = {} as Record<ErrorType, number>;
    for (const type of Object.values(ErrorType)) {
      counts[type] = entries.filter(e => e.metadata.type === type).length;
    }
    return counts;
  }

  private calculatePerformanceMetrics(entries: LogEntry[]): MonitoringMetrics['performanceMetrics'] {
    const responseTimes = entries
      .map(e => e.telemetry?.performanceMetrics.executionTime)
      .filter(Boolean) as number[];

    const avgResponseTime = responseTimes.length > 0 
      ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
      : 0;

    const sortedTimes = responseTimes.sort((a, b) => a - b);
    const p95ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.95)] || 0;
    const p99ResponseTime = sortedTimes[Math.floor(sortedTimes.length * 0.99)] || 0;

    return {
      avgResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      throughput: entries.length / 60, // per minute
      memoryUsage: process.memoryUsage().heapUsed / process.memoryUsage().heapTotal * 100,
      cpuUsage: 0, // Would need more sophisticated CPU monitoring
      diskUsage: 0  // Would need disk usage monitoring
    };
  }

  private calculateUserMetrics(entries: LogEntry[]): MonitoringMetrics['userMetrics'] {
    const uniqueUsers = new Set(entries.map(e => e.context.userId).filter(Boolean));
    const errorUsers = new Set(entries.filter(e => e.error).map(e => e.context.userId).filter(Boolean));

    return {
      activeUsers: uniqueUsers.size,
      affectedUsers: errorUsers.size,
      userSatisfactionScore: 0.8, // Would need user feedback data
      avgSessionDuration: 0 // Would need session tracking
    };
  }

  private calculateSystemHealth(
    errorMetrics: MonitoringMetrics['errorMetrics'],
    performanceMetrics: MonitoringMetrics['performanceMetrics']
  ): MonitoringMetrics['systemHealth'] {
    // Simplified health scoring
    let score = 100;
    
    // Reduce score based on error rate
    if (errorMetrics.errorRate > 5) score -= 20;
    if (errorMetrics.errorRate > 10) score -= 30;
    
    // Reduce score based on performance
    if (performanceMetrics.avgResponseTime > 1000) score -= 15;
    if (performanceMetrics.avgResponseTime > 5000) score -= 25;

    return {
      overallScore: Math.max(0, score),
      availability: 99.9, // Would need uptime monitoring
      reliability: 99.5, // Would need failure rate calculation
      errorRecoveryRate: 85, // Would need recovery tracking
      alertsTriggered: this.activeAlerts.size
    };
  }

  private convertToCsv(entries: LogEntry[]): string {
    const headers = ['timestamp', 'level', 'category', 'message', 'severity', 'userId', 'workflowId'];
    const rows = entries.map(entry => [
      entry.timestamp.toISOString(),
      entry.level,
      entry.category,
      entry.message.replace(/"/g, '""'),
      entry.metadata.severity || '',
      entry.context.userId || '',
      entry.context.workflowId || ''
    ]);

    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  }

  private convertToText(entries: LogEntry[]): string {
    return entries.map(entry => 
      `${entry.timestamp.toISOString()} [${entry.level.toUpperCase()}] [${entry.category}] ${entry.message}`
    ).join('\n');
  }

  private isThrottled(rule: AlertRule, existingAlert: AlertNotification): boolean {
    const now = Date.now();
    const cooldownMs = (rule.throttle.cooldownPeriod || 60) * 60 * 1000;
    
    return (now - existingAlert.timestamp.getTime()) < cooldownMs;
  }

  private mapRuleSeverity(rule: AlertRule): AlertNotification['severity'] {
    if (rule.conditions.severity?.includes(ErrorSeverity.CRITICAL)) return 'critical';
    if (rule.conditions.severity?.includes(ErrorSeverity.HIGH)) return 'high';
    if (rule.conditions.severity?.includes(ErrorSeverity.MEDIUM)) return 'medium';
    return 'low';
  }

  private describeTriggerCondition(rule: AlertRule): string {
    const conditions = [];
    if (rule.conditions.errorRate) conditions.push(`Error rate: ${rule.conditions.errorRate}/min`);
    if (rule.conditions.errorCount) conditions.push(`Error count: ${rule.conditions.errorCount}`);
    if (rule.conditions.severity) conditions.push(`Severity: ${rule.conditions.severity.join(', ')}`);
    return conditions.join(', ');
  }

  private generateSuggestedActions(rule: AlertRule, errors: LogEntry[]): string[] {
    const actions = ['Check system logs for details'];
    
    if (errors.some(e => e.metadata.category === ErrorCategory.NETWORK)) {
      actions.push('Verify network connectivity');
    }
    if (errors.some(e => e.metadata.category === ErrorCategory.SYSTEM)) {
      actions.push('Check system resources (CPU, memory, disk)');
    }
    if (errors.some(e => e.metadata.category === ErrorCategory.WORKFLOW_GENERATION)) {
      actions.push('Review workflow configurations');
    }
    
    return actions;
  }

  private getTopErrors(entries: LogEntry[]): Array<{ type: ErrorType; count: number }> {
    const typeCounts = new Map<ErrorType, number>();
    
    entries.forEach(entry => {
      if (entry.metadata.type) {
        typeCounts.set(entry.metadata.type, (typeCounts.get(entry.metadata.type) || 0) + 1);
      }
    });

    return Array.from(typeCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private async executeAlertActions(rule: AlertRule, alert: AlertNotification): Promise<void> {
    // In a real implementation, this would send emails, webhooks, etc.
    // For now, just emit events
    this.emit('alert_action_executed', { rule, alert });
  }
}

export default AdvancedErrorLogger;
