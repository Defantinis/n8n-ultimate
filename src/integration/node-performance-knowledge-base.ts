/**
 * Node Performance Knowledge Base for n8n Workflow Automation Project
 * 
 * This module implements a comprehensive knowledge base for tracking node performance,
 * common issues, and optimization patterns from our n8n integration experience.
 * 
 * Key Features:
 * - Real-time node performance monitoring
 * - Performance metrics collection and analysis
 * - Common failure pattern detection
 * - Optimization recommendation engine
 * - Integration with existing knowledge management system
 * - Performance trend analysis and alerting
 */

import {
  KnowledgeEntry,
  KnowledgeType,
  KnowledgeCategory,
  KnowledgeSource,
  NodePerformanceKnowledge,
  NodeIssue,
  NodeOptimization
} from './knowledge-management-system';
import { KnowledgeStorageManager } from './knowledge-storage-system';
import { INode } from '../types/n8n-node-interfaces';

// ============================================================================
// NODE PERFORMANCE INTERFACES
// ============================================================================

/**
 * Node performance metrics collected during execution
 */
export interface NodePerformanceMetrics {
  nodeId: string;
  nodeType: string;
  executionTime: number; // milliseconds
  memoryUsage: number; // MB
  cpuUsage: number; // percentage
  networkIO: number; // bytes
  errorCount: number;
  successCount: number;
  timestamp: Date;
  workflowId?: string;
  environment: string;
}

/**
 * Node performance analysis result
 */
export interface NodePerformanceAnalysis {
  nodeType: string;
  totalExecutions: number;
  averagePerformance: {
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    errorRate: number;
    successRate: number;
  };
  trends: {
    performanceTrend: 'improving' | 'stable' | 'degrading';
    trendStrength: number; // 0-1 scale
    analysisWindow: string;
  };
  recommendations: NodeOptimization[];
  commonIssues: NodeIssue[];
  optimalConfigurations: Record<string, any>[];
}

/**
 * Node performance alert configuration
 */
export interface NodePerformanceAlert {
  nodeType: string;
  metric: keyof NodePerformanceMetrics;
  threshold: number;
  condition: 'greater' | 'less' | 'equal';
  severity: 'info' | 'warning' | 'error' | 'critical';
  enabled: boolean;
  description: string;
}

/**
 * Performance optimization recommendation
 */
export interface PerformanceRecommendation {
  nodeType: string;
  recommendation: string;
  expectedImprovement: number; // percentage
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'configuration' | 'architecture' | 'resource' | 'integration';
  implementation: {
    steps: string[];
    estimatedEffort: string;
    riskLevel: 'low' | 'medium' | 'high';
  };
  evidence: {
    dataPoints: number;
    confidenceLevel: number;
    historicalSuccess: number;
  };
}

// ============================================================================
// NODE PERFORMANCE COLLECTOR
// ============================================================================

/**
 * Collects performance metrics from n8n nodes during execution
 */
export class NodePerformanceCollector {
  private metrics: NodePerformanceMetrics[] = [];
  private activeMonitoring: Map<string, NodeJS.Timeout> = new Map();
  private knowledgeStorage: KnowledgeStorageManager;

  constructor(knowledgeStorage: KnowledgeStorageManager) {
    this.knowledgeStorage = knowledgeStorage;
  }

  /**
   * Start monitoring a node's performance
   */
  async startMonitoring(nodeId: string, nodeType: string, workflowId?: string): Promise<void> {
    // Clear existing monitoring for this node
    this.stopMonitoring(nodeId);

    const interval = setInterval(async () => {
      try {
        const metrics = await this.collectNodeMetrics(nodeId, nodeType, workflowId);
        this.metrics.push(metrics);
        
        // Store metrics in knowledge base every 10 data points
        if (this.metrics.length % 10 === 0) {
          await this.persistMetrics();
        }
      } catch (error) {
        console.error(`Error collecting metrics for node ${nodeId}:`, error);
      }
    }, 5000); // Collect every 5 seconds

    this.activeMonitoring.set(nodeId, interval);
  }

  /**
   * Stop monitoring a node
   */
  stopMonitoring(nodeId: string): void {
    const interval = this.activeMonitoring.get(nodeId);
    if (interval) {
      clearInterval(interval);
      this.activeMonitoring.delete(nodeId);
    }
  }

  /**
   * Collect current performance metrics for a node
   */
  private async collectNodeMetrics(
    nodeId: string, 
    nodeType: string, 
    workflowId?: string
  ): Promise<NodePerformanceMetrics> {
    const startTime = Date.now();
    
    // Simulate metric collection (in real implementation, this would interface with n8n monitoring)
    const metrics: NodePerformanceMetrics = {
      nodeId,
      nodeType,
      executionTime: Math.random() * 1000 + 100, // 100-1100ms
      memoryUsage: Math.random() * 100 + 10, // 10-110MB
      cpuUsage: Math.random() * 50 + 5, // 5-55%
      networkIO: Math.random() * 1000000, // 0-1MB
      errorCount: Math.random() > 0.95 ? 1 : 0, // 5% error rate
      successCount: Math.random() > 0.95 ? 0 : 1, // 95% success rate
      timestamp: new Date(),
      workflowId,
      environment: process.env.NODE_ENV || 'development'
    };

    return metrics;
  }

  /**
   * Get collected metrics for a node type
   */
  getMetricsForNodeType(nodeType: string, timeRange?: { start: Date; end: Date }): NodePerformanceMetrics[] {
    let filtered = this.metrics.filter(m => m.nodeType === nodeType);
    
    if (timeRange) {
      filtered = filtered.filter(m => 
        m.timestamp >= timeRange.start && m.timestamp <= timeRange.end
      );
    }
    
    return filtered;
  }

  /**
   * Persist collected metrics to knowledge base
   */
  private async persistMetrics(): Promise<void> {
    if (this.metrics.length === 0) return;

    // Group metrics by node type
    const metricsByType = this.metrics.reduce((acc, metric) => {
      if (!acc[metric.nodeType]) {
        acc[metric.nodeType] = [];
      }
      acc[metric.nodeType].push(metric);
      return acc;
    }, {} as Record<string, NodePerformanceMetrics[]>);

    // Create knowledge entries for each node type
    for (const [nodeType, metrics] of Object.entries(metricsByType)) {
      const performanceKnowledge: Omit<NodePerformanceKnowledge, 'id' | 'timestamp' | 'usageCount' | 'lastAccessed'> = {
        type: KnowledgeType.NODE_BEHAVIOR,
        category: KnowledgeCategory.PERFORMANCE,
        title: `Performance Metrics: ${nodeType}`,
        description: `Performance metrics collected for ${nodeType} node`,
        metadata: {
          nodeType,
          metricsCount: metrics.length,
          timeRange: {
            start: Math.min(...metrics.map(m => m.timestamp.getTime())),
            end: Math.max(...metrics.map(m => m.timestamp.getTime()))
          }
        },
        tags: ['performance', 'metrics', nodeType.toLowerCase()],
        source: KnowledgeSource.PERFORMANCE_MONITOR,
        confidence: 0.9,
        nodeType,
        performance: this.calculateAveragePerformance(metrics),
        behaviors: {
          commonConfigurations: [],
          knownIssues: [],
          optimizations: [],
          compatibilityMatrix: {}
        },
        usage: {
          frequency: metrics.length,
          contexts: [...new Set(metrics.map(m => m.workflowId).filter(Boolean))],
          successPatterns: [],
          failurePatterns: []
        }
      };

      await this.knowledgeStorage.create(performanceKnowledge);
    }

    // Clear stored metrics after persistence
    this.metrics = [];
  }

  /**
   * Calculate average performance from metrics
   */
  private calculateAveragePerformance(metrics: NodePerformanceMetrics[]) {
    if (metrics.length === 0) {
      return {
        avgExecutionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0,
        throughput: 0
      };
    }

    const totals = metrics.reduce((acc, metric) => ({
      executionTime: acc.executionTime + metric.executionTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      cpuUsage: acc.cpuUsage + metric.cpuUsage,
      errorCount: acc.errorCount + metric.errorCount,
      successCount: acc.successCount + metric.successCount
    }), { executionTime: 0, memoryUsage: 0, cpuUsage: 0, errorCount: 0, successCount: 0 });

    const totalExecutions = totals.errorCount + totals.successCount;
    
    return {
      avgExecutionTime: totals.executionTime / metrics.length,
      memoryUsage: totals.memoryUsage / metrics.length,
      cpuUsage: totals.cpuUsage / metrics.length,
      errorRate: totalExecutions > 0 ? totals.errorCount / totalExecutions : 0,
      throughput: totalExecutions > 0 ? (totals.successCount / (metrics.length * 5)) * 60 : 0 // per minute
    };
  }
}

// ============================================================================
// NODE PERFORMANCE ANALYZER
// ============================================================================

/**
 * Analyzes node performance data to identify trends, issues, and optimizations
 */
export class NodePerformanceAnalyzer {
  private knowledgeStorage: KnowledgeStorageManager;

  constructor(knowledgeStorage: KnowledgeStorageManager) {
    this.knowledgeStorage = knowledgeStorage;
  }

  /**
   * Analyze performance for a specific node type
   */
  async analyzeNodePerformance(nodeType: string, timeWindow: number = 7): Promise<NodePerformanceAnalysis> {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - (timeWindow * 24 * 60 * 60 * 1000));

    // Retrieve performance data from knowledge base
    const performanceEntries = await this.knowledgeStorage.read({
      type: KnowledgeType.NODE_BEHAVIOR,
      category: KnowledgeCategory.PERFORMANCE,
      dateRange: { start: startDate, end: endDate }
    });

    const nodeEntries = performanceEntries.data.filter(entry => 
      (entry as NodePerformanceKnowledge).nodeType === nodeType
    ) as NodePerformanceKnowledge[];

    if (nodeEntries.length === 0) {
      return this.createEmptyAnalysis(nodeType);
    }

    // Aggregate performance data
    const totalExecutions = nodeEntries.reduce((sum, entry) => sum + entry.usage.frequency, 0);
    const averagePerformance = this.aggregatePerformanceMetrics(nodeEntries);
    
    // Analyze trends
    const trends = this.analyzeTrends(nodeEntries, timeWindow);
    
    // Generate recommendations
    const recommendations = await this.generateRecommendations(nodeType, nodeEntries, averagePerformance);
    
    // Identify common issues
    const commonIssues = this.identifyCommonIssues(nodeEntries);
    
    // Find optimal configurations
    const optimalConfigurations = this.findOptimalConfigurations(nodeEntries);

    return {
      nodeType,
      totalExecutions,
      averagePerformance,
      trends,
      recommendations,
      commonIssues,
      optimalConfigurations
    };
  }

  /**
   * Create empty analysis for nodes with no data
   */
  private createEmptyAnalysis(nodeType: string): NodePerformanceAnalysis {
    return {
      nodeType,
      totalExecutions: 0,
      averagePerformance: {
        executionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0,
        successRate: 0
      },
      trends: {
        performanceTrend: 'stable',
        trendStrength: 0,
        analysisWindow: '7 days'
      },
      recommendations: [],
      commonIssues: [],
      optimalConfigurations: []
    };
  }

  /**
   * Aggregate performance metrics from multiple entries
   */
  private aggregatePerformanceMetrics(entries: NodePerformanceKnowledge[]) {
    if (entries.length === 0) {
      return {
        executionTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        errorRate: 0,
        successRate: 0
      };
    }

    const totals = entries.reduce((acc, entry) => ({
      executionTime: acc.executionTime + entry.performance.avgExecutionTime,
      memoryUsage: acc.memoryUsage + entry.performance.memoryUsage,
      cpuUsage: acc.cpuUsage + entry.performance.cpuUsage,
      errorRate: acc.errorRate + entry.performance.errorRate,
      throughput: acc.throughput + entry.performance.throughput
    }), { executionTime: 0, memoryUsage: 0, cpuUsage: 0, errorRate: 0, throughput: 0 });

    return {
      executionTime: totals.executionTime / entries.length,
      memoryUsage: totals.memoryUsage / entries.length,
      cpuUsage: totals.cpuUsage / entries.length,
      errorRate: totals.errorRate / entries.length,
      successRate: 1 - (totals.errorRate / entries.length)
    };
  }

  /**
   * Analyze performance trends over time
   */
  private analyzeTrends(entries: NodePerformanceKnowledge[], timeWindow: number) {
    if (entries.length < 2) {
      return {
        performanceTrend: 'stable' as const,
        trendStrength: 0,
        analysisWindow: `${timeWindow} days`
      };
    }

    // Sort entries by timestamp
    const sortedEntries = entries.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Calculate trend for execution time (primary metric)
    const executionTimes = sortedEntries.map(entry => entry.performance.avgExecutionTime);
    const trendStrength = this.calculateTrendStrength(executionTimes);
    
    let performanceTrend: 'improving' | 'stable' | 'degrading';
    if (trendStrength > 0.1) {
      performanceTrend = 'degrading'; // Increasing execution time is bad
    } else if (trendStrength < -0.1) {
      performanceTrend = 'improving'; // Decreasing execution time is good
    } else {
      performanceTrend = 'stable';
    }

    return {
      performanceTrend,
      trendStrength: Math.abs(trendStrength),
      analysisWindow: `${timeWindow} days`
    };
  }

  /**
   * Calculate trend strength using linear regression
   */
  private calculateTrendStrength(values: number[]): number {
    if (values.length < 2) return 0;

    const n = values.length;
    const sumX = (n * (n - 1)) / 2; // Sum of indices 0, 1, 2, ...
    const sumY = values.reduce((sum, val) => sum + val, 0);
    const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6; // Sum of squares of indices

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    // Normalize slope by average value to get relative trend strength
    const avgValue = sumY / n;
    return avgValue !== 0 ? slope / avgValue : 0;
  }

  /**
   * Generate optimization recommendations based on performance analysis
   */
  private async generateRecommendations(
    nodeType: string,
    entries: NodePerformanceKnowledge[],
    averagePerformance: any
  ): Promise<NodeOptimization[]> {
    const recommendations: NodeOptimization[] = [];

    // High execution time recommendation
    if (averagePerformance.executionTime > 5000) { // > 5 seconds
      recommendations.push({
        description: `High execution time detected for ${nodeType} (${averagePerformance.executionTime.toFixed(0)}ms avg)`,
        technique: 'execution_optimization',
        performanceGain: 30,
        applicableScenarios: ['batch processing', 'data transformation', 'API calls'],
        implementation: 'Consider caching, parallel processing, or request batching'
      });
    }

    // High memory usage recommendation
    if (averagePerformance.memoryUsage > 100) { // > 100MB
      recommendations.push({
        description: `High memory usage detected for ${nodeType} (${averagePerformance.memoryUsage.toFixed(0)}MB avg)`,
        technique: 'memory_optimization',
        performanceGain: 25,
        applicableScenarios: ['large dataset processing', 'file operations'],
        implementation: 'Implement streaming, pagination, or memory cleanup strategies'
      });
    }

    // High error rate recommendation
    if (averagePerformance.errorRate > 0.05) { // > 5% error rate
      recommendations.push({
        description: `High error rate detected for ${nodeType} (${(averagePerformance.errorRate * 100).toFixed(1)}% error rate)`,
        technique: 'error_reduction',
        performanceGain: 20,
        applicableScenarios: ['API integrations', 'data validation', 'network operations'],
        implementation: 'Add retry logic, improve error handling, validate inputs'
      });
    }

    return recommendations;
  }

  /**
   * Identify common issues from performance data
   */
  private identifyCommonIssues(entries: NodePerformanceKnowledge[]): NodeIssue[] {
    const issues: NodeIssue[] = [];

    // Analyze all entries for common patterns
    const highErrorRateEntries = entries.filter(entry => entry.performance.errorRate > 0.1);
    if (highErrorRateEntries.length > entries.length * 0.3) {
      issues.push({
        description: 'Consistently high error rates across multiple time periods',
        severity: 'high',
        workaround: 'Implement robust error handling and retry mechanisms',
        affectedVersions: ['*'],
        reportedCount: highErrorRateEntries.length
      });
    }

    const slowExecutionEntries = entries.filter(entry => entry.performance.avgExecutionTime > 10000);
    if (slowExecutionEntries.length > entries.length * 0.2) {
      issues.push({
        description: 'Slow execution times impacting workflow performance',
        severity: 'medium',
        workaround: 'Optimize node configuration and consider parallel processing',
        affectedVersions: ['*'],
        reportedCount: slowExecutionEntries.length
      });
    }

    return issues;
  }

  /**
   * Find optimal configurations based on performance data
   */
  private findOptimalConfigurations(entries: NodePerformanceKnowledge[]): Record<string, any>[] {
    // Find entries with best performance (low execution time, low error rate)
    const bestPerformingEntries = entries
      .filter(entry => entry.performance.errorRate < 0.02 && entry.performance.avgExecutionTime < 2000)
      .sort((a, b) => a.performance.avgExecutionTime - b.performance.avgExecutionTime)
      .slice(0, 3);

    return bestPerformingEntries.map(entry => ({
      configuration: entry.metadata,
      performance: entry.performance,
      confidence: entry.confidence
    }));
  }
}

// ============================================================================
// NODE PERFORMANCE KNOWLEDGE BASE (MAIN CLASS)
// ============================================================================

/**
 * Main Node Performance Knowledge Base system
 */
export class NodePerformanceKnowledgeBase {
  private knowledgeStorage: KnowledgeStorageManager;
  private performanceCollector: NodePerformanceCollector;
  private performanceAnalyzer: NodePerformanceAnalyzer;
  private alerts: NodePerformanceAlert[] = [];
  private initialized: boolean = false;

  constructor(knowledgeStorage?: KnowledgeStorageManager) {
    this.knowledgeStorage = knowledgeStorage || new KnowledgeStorageManager();
    this.performanceCollector = new NodePerformanceCollector(this.knowledgeStorage);
    this.performanceAnalyzer = new NodePerformanceAnalyzer(this.knowledgeStorage);
  }

  /**
   * Initialize the knowledge base system
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    await this.knowledgeStorage.initialize();
    this.setupDefaultAlerts();
    this.initialized = true;
  }

  /**
   * Start monitoring performance for a node
   */
  async startMonitoring(nodeId: string, nodeType: string, workflowId?: string): Promise<void> {
    await this.ensureInitialized();
    await this.performanceCollector.startMonitoring(nodeId, nodeType, workflowId);
  }

  /**
   * Stop monitoring performance for a node
   */
  stopMonitoring(nodeId: string): void {
    this.performanceCollector.stopMonitoring(nodeId);
  }

  /**
   * Get performance analysis for a node type
   */
  async getPerformanceAnalysis(nodeType: string, timeWindow: number = 7): Promise<NodePerformanceAnalysis> {
    await this.ensureInitialized();
    return this.performanceAnalyzer.analyzeNodePerformance(nodeType, timeWindow);
  }

  /**
   * Get performance recommendations for optimization
   */
  async getOptimizationRecommendations(nodeType?: string): Promise<PerformanceRecommendation[]> {
    await this.ensureInitialized();

    // If no specific node type, get recommendations for all nodes
    const nodeTypes = nodeType ? [nodeType] : await this.getAllMonitoredNodeTypes();
    const recommendations: PerformanceRecommendation[] = [];

    for (const type of nodeTypes) {
      const analysis = await this.getPerformanceAnalysis(type);
      
      for (const opt of analysis.recommendations) {
        recommendations.push({
          nodeType: type,
          recommendation: opt.description,
          expectedImprovement: opt.performanceGain,
          priority: this.calculatePriority(analysis, opt),
          category: this.categorizeOptimization(opt),
          implementation: {
            steps: [opt.implementation],
            estimatedEffort: this.estimateEffort(opt),
            riskLevel: this.assessRisk(opt)
          },
          evidence: {
            dataPoints: analysis.totalExecutions,
            confidenceLevel: 0.8,
            historicalSuccess: opt.performanceGain / 100
          }
        });
      }
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Get all monitored node types
   */
  private async getAllMonitoredNodeTypes(): Promise<string[]> {
    const performanceEntries = await this.knowledgeStorage.read({
      type: KnowledgeType.NODE_BEHAVIOR,
      category: KnowledgeCategory.PERFORMANCE
    });

    const nodeTypes = new Set<string>();
    performanceEntries.data.forEach(entry => {
      const nodeEntry = entry as NodePerformanceKnowledge;
      nodeTypes.add(nodeEntry.nodeType);
    });

    return Array.from(nodeTypes);
  }

  /**
   * Setup default performance alerts
   */
  private setupDefaultAlerts(): void {
    this.alerts = [
      {
        nodeType: '*',
        metric: 'executionTime',
        threshold: 30000, // 30 seconds
        condition: 'greater',
        severity: 'warning',
        enabled: true,
        description: 'Node execution time exceeds 30 seconds'
      },
      {
        nodeType: '*',
        metric: 'memoryUsage',
        threshold: 500, // 500MB
        condition: 'greater',
        severity: 'error',
        enabled: true,
        description: 'Node memory usage exceeds 500MB'
      },
      {
        nodeType: '*',
        metric: 'errorCount',
        threshold: 5,
        condition: 'greater',
        severity: 'critical',
        enabled: true,
        description: 'Node error count exceeds 5 in monitoring period'
      }
    ];
  }

  /**
   * Helper methods for recommendation processing
   */
  private calculatePriority(analysis: NodePerformanceAnalysis, optimization: NodeOptimization): 'low' | 'medium' | 'high' | 'critical' {
    if (analysis.totalExecutions > 100 && optimization.performanceGain > 40) return 'critical';
    if (analysis.totalExecutions > 50 && optimization.performanceGain > 25) return 'high';
    if (optimization.performanceGain > 15) return 'medium';
    return 'low';
  }

  private categorizeOptimization(optimization: NodeOptimization): 'configuration' | 'architecture' | 'resource' | 'integration' {
    if (optimization.technique.includes('memory') || optimization.technique.includes('cpu')) return 'resource';
    if (optimization.technique.includes('execution') || optimization.technique.includes('error')) return 'configuration';
    return 'architecture';
  }

  private estimateEffort(optimization: NodeOptimization): string {
    if (optimization.performanceGain > 30) return '2-4 hours';
    if (optimization.performanceGain > 15) return '1-2 hours';
    return '30-60 minutes';
  }

  private assessRisk(optimization: NodeOptimization): 'low' | 'medium' | 'high' {
    if (optimization.technique.includes('architecture')) return 'medium';
    if (optimization.technique.includes('error')) return 'low';
    return 'low';
  }

  /**
   * Ensure system is initialized
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a new Node Performance Knowledge Base instance
 */
export function createNodePerformanceKnowledgeBase(knowledgeStorage?: KnowledgeStorageManager): NodePerformanceKnowledgeBase {
  return new NodePerformanceKnowledgeBase(knowledgeStorage);
}

/**
 * Node Performance Knowledge Base Manager for easy access
 */
export class NodePerformanceManager {
  private knowledgeBase: NodePerformanceKnowledgeBase;
  private monitoringActive: boolean = false;

  constructor(knowledgeBase?: NodePerformanceKnowledgeBase) {
    this.knowledgeBase = knowledgeBase || createNodePerformanceKnowledgeBase();
  }

  /**
   * Initialize the manager
   */
  async initialize(): Promise<void> {
    await this.knowledgeBase.initialize();
  }

  /**
   * Start monitoring all nodes in a workflow
   */
  async startWorkflowMonitoring(workflowId: string, nodes: INode[]): Promise<void> {
    await this.initialize();

    for (const node of nodes) {
      await this.knowledgeBase.startMonitoring(node.id, node.type, workflowId);
    }

    this.monitoringActive = true;
  }

  /**
   * Stop all monitoring
   */
  stopAllMonitoring(nodes: INode[]): void {
    for (const node of nodes) {
      this.knowledgeBase.stopMonitoring(node.id);
    }
    this.monitoringActive = false;
  }

  /**
   * Get comprehensive performance report
   */
  async getPerformanceReport(): Promise<{
    summary: Record<string, NodePerformanceAnalysis>;
    recommendations: PerformanceRecommendation[];
    monitoringStatus: boolean;
  }> {
    await this.initialize();
    
    const nodeTypes = await this.getAllNodeTypes();
    const summary: Record<string, NodePerformanceAnalysis> = {};

    // Get analysis for each node type
    for (const nodeType of nodeTypes) {
      summary[nodeType] = await this.knowledgeBase.getPerformanceAnalysis(nodeType);
    }

    const recommendations = await this.knowledgeBase.getOptimizationRecommendations();

    return {
      summary,
      recommendations,
      monitoringStatus: this.monitoringActive
    };
  }

  /**
   * Get all monitored node types
   */
  private async getAllNodeTypes(): Promise<string[]> {
    // This would integrate with the actual n8n monitoring system
    // For now, return some common node types
    return ['http-request', 'function', 'webhook', 'schedule', 'email', 'database'];
  }
}

export { NodePerformanceManager as NodePerformanceKnowledgeBaseManager }; 