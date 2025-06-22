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
import { NodeIssue, NodeOptimization } from './knowledge-management-system';
import { KnowledgeStorageManager } from './knowledge-storage-system';
import { INode } from '../types/n8n-node-interfaces';
/**
 * Node performance metrics collected during execution
 */
export interface NodePerformanceMetrics {
    nodeId: string;
    nodeType: string;
    executionTime: number;
    memoryUsage: number;
    cpuUsage: number;
    networkIO: number;
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
        trendStrength: number;
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
    expectedImprovement: number;
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
/**
 * Collects performance metrics from n8n nodes during execution
 */
export declare class NodePerformanceCollector {
    private metrics;
    private activeMonitoring;
    private knowledgeStorage;
    constructor(knowledgeStorage: KnowledgeStorageManager);
    /**
     * Start monitoring a node's performance
     */
    startMonitoring(nodeId: string, nodeType: string, workflowId?: string): Promise<void>;
    /**
     * Stop monitoring a node
     */
    stopMonitoring(nodeId: string): void;
    /**
     * Collect current performance metrics for a node
     */
    private collectNodeMetrics;
    /**
     * Get collected metrics for a node type
     */
    getMetricsForNodeType(nodeType: string, timeRange?: {
        start: Date;
        end: Date;
    }): NodePerformanceMetrics[];
    /**
     * Persist collected metrics to knowledge base
     */
    private persistMetrics;
    /**
     * Calculate average performance from metrics
     */
    private calculateAveragePerformance;
}
/**
 * Analyzes node performance data to identify trends, issues, and optimizations
 */
export declare class NodePerformanceAnalyzer {
    private knowledgeStorage;
    constructor(knowledgeStorage: KnowledgeStorageManager);
    /**
     * Analyze performance for a specific node type
     */
    analyzeNodePerformance(nodeType: string, timeWindow?: number): Promise<NodePerformanceAnalysis>;
    /**
     * Create empty analysis for nodes with no data
     */
    private createEmptyAnalysis;
    /**
     * Aggregate performance metrics from multiple entries
     */
    private aggregatePerformanceMetrics;
    /**
     * Analyze performance trends over time
     */
    private analyzeTrends;
    /**
     * Calculate trend strength using linear regression
     */
    private calculateTrendStrength;
    /**
     * Generate optimization recommendations based on performance analysis
     */
    private generateRecommendations;
    /**
     * Identify common issues from performance data
     */
    private identifyCommonIssues;
    /**
     * Find optimal configurations based on performance data
     */
    private findOptimalConfigurations;
}
/**
 * Main Node Performance Knowledge Base system
 */
export declare class NodePerformanceKnowledgeBase {
    private knowledgeStorage;
    private performanceCollector;
    private performanceAnalyzer;
    private alerts;
    private initialized;
    constructor(knowledgeStorage?: KnowledgeStorageManager);
    /**
     * Initialize the knowledge base system
     */
    initialize(): Promise<void>;
    /**
     * Start monitoring performance for a node
     */
    startMonitoring(nodeId: string, nodeType: string, workflowId?: string): Promise<void>;
    /**
     * Stop monitoring performance for a node
     */
    stopMonitoring(nodeId: string): void;
    /**
     * Get performance analysis for a node type
     */
    getPerformanceAnalysis(nodeType: string, timeWindow?: number): Promise<NodePerformanceAnalysis>;
    /**
     * Get performance recommendations for optimization
     */
    getOptimizationRecommendations(nodeType?: string): Promise<PerformanceRecommendation[]>;
    /**
     * Get all monitored node types
     */
    private getAllMonitoredNodeTypes;
    /**
     * Setup default performance alerts
     */
    private setupDefaultAlerts;
    /**
     * Helper methods for recommendation processing
     */
    private calculatePriority;
    private categorizeOptimization;
    private estimateEffort;
    private assessRisk;
    /**
     * Ensure system is initialized
     */
    private ensureInitialized;
}
/**
 * Create a new Node Performance Knowledge Base instance
 */
export declare function createNodePerformanceKnowledgeBase(knowledgeStorage?: KnowledgeStorageManager): NodePerformanceKnowledgeBase;
/**
 * Node Performance Knowledge Base Manager for easy access
 */
export declare class NodePerformanceManager {
    private knowledgeBase;
    private monitoringActive;
    constructor(knowledgeBase?: NodePerformanceKnowledgeBase);
    /**
     * Initialize the manager
     */
    initialize(): Promise<void>;
    /**
     * Start monitoring all nodes in a workflow
     */
    startWorkflowMonitoring(workflowId: string, nodes: INode[]): Promise<void>;
    /**
     * Stop all monitoring
     */
    stopAllMonitoring(nodes: INode[]): void;
    /**
     * Get comprehensive performance report
     */
    getPerformanceReport(): Promise<{
        summary: Record<string, NodePerformanceAnalysis>;
        recommendations: PerformanceRecommendation[];
        monitoringStatus: boolean;
    }>;
    /**
     * Get all monitored node types
     */
    private getAllNodeTypes;
}
export { NodePerformanceManager as NodePerformanceKnowledgeBaseManager };
//# sourceMappingURL=node-performance-knowledge-base.d.ts.map