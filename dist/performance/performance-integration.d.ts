/**
 * Performance Integration Layer
 * Connects performance monitoring with the workflow generation system
 */
import { EventEmitter } from 'events';
import { MemoryManager } from './memory-manager';
import { OllamaCacheManager } from './ollama-cache-manager';
import { AsyncWorkflowPipeline } from './async-workflow-pipeline';
export interface WorkflowPerformanceMetrics {
    workflowId: string;
    timestamp: number;
    generation: {
        totalTime: number;
        analysisTime: number;
        planningTime: number;
        nodeGenerationTime: number;
        connectionTime: number;
        validationTime: number;
        optimizationTime: number;
    };
    resources: {
        peakMemoryUsage: number;
        cpuUsage: number;
        cacheHitRate: number;
        parallelEfficiency: number;
    };
    quality: {
        nodeCount: number;
        connectionCount: number;
        validationScore: number;
        complexityScore: number;
    };
    ai: {
        totalTokens: number;
        totalCost: number;
        apiCalls: number;
        averageResponseTime: number;
    };
}
export interface PerformanceIntegrationConfig {
    enableWorkflowTracking: boolean;
    enableResourceMonitoring: boolean;
    enableAIMetrics: boolean;
    enableQualityMetrics: boolean;
    trackingInterval: number;
    alertThresholds: {
        maxGenerationTime: number;
        maxMemoryUsage: number;
        minCacheHitRate: number;
        maxCPUUsage: number;
    };
    persistence: {
        enabled: boolean;
        saveInterval: number;
        maxHistory: number;
    };
}
/**
 * Performance Integration Manager
 */
export declare class PerformanceIntegrationManager extends EventEmitter {
    private config;
    private monitor;
    private memoryManager?;
    private cacheManager?;
    private pipeline?;
    private workflowMetrics;
    private activeWorkflows;
    private isIntegrated;
    constructor(config?: Partial<PerformanceIntegrationConfig>);
    /**
     * Initialize performance integration
     */
    initialize(components?: {
        memoryManager?: MemoryManager;
        cacheManager?: OllamaCacheManager;
        pipeline?: AsyncWorkflowPipeline;
    }): Promise<void>;
    /**
     * Start tracking workflow generation performance
     */
    startWorkflowTracking(workflowId: string, metadata?: any): void;
    /**
     * Track workflow generation stage
     */
    trackWorkflowStage(workflowId: string, stage: string, duration?: number): void;
    /**
     * End workflow tracking and calculate metrics
     */
    endWorkflowTracking(workflowId: string, result?: any): WorkflowPerformanceMetrics | null;
    /**
     * Get workflow performance metrics
     */
    getWorkflowMetrics(workflowId?: string): WorkflowPerformanceMetrics | WorkflowPerformanceMetrics[];
    /**
     * Get performance summary for all workflows
     */
    getPerformanceSummary(): any;
    /**
     * Generate comprehensive performance report
     */
    generatePerformanceReport(): any;
    /**
     * Clear performance history
     */
    clearHistory(): void;
    /**
     * Stop performance integration
     */
    stop(): Promise<void>;
    /**
     * Private methods
     */
    private mergeConfig;
    private setupEventListeners;
    private integrateMemoryManager;
    private integrateCacheManager;
    private integratePipeline;
    private getStageTime;
    private getCacheHitRate;
    private getParallelEfficiency;
    private getAITokens;
    private getAICost;
    private getAPICalls;
    private getAverageResponseTime;
    private checkWorkflowAlerts;
    private generateRecommendations;
    private persistMetrics;
}
/**
 * Performance integration utilities
 */
export declare class PerformanceIntegrationUtils {
    /**
     * Create a workflow performance decorator
     */
    static createWorkflowDecorator(integrationManager: PerformanceIntegrationManager): (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;
    /**
     * Measure workflow stage performance
     */
    static measureStage<T>(integrationManager: PerformanceIntegrationManager, workflowId: string, stage: string, fn: () => Promise<T>): Promise<T>;
}
/**
 * Get or create global performance integration
 */
export declare function getPerformanceIntegration(config?: Partial<PerformanceIntegrationConfig>): PerformanceIntegrationManager;
declare const _default: PerformanceIntegrationManager;
export default _default;
//# sourceMappingURL=performance-integration.d.ts.map