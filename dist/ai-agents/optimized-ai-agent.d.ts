import { RequirementAnalysis, WorkflowRequirements } from './ai-agent.js';
import { StreamingConfig } from './streaming-ollama-client.js';
import { WorkflowPlan } from '../types/n8n-workflow.js';
import { EventEmitter } from 'events';
export interface OptimizedAIConfig {
    ollamaBaseUrl?: string;
    modelName?: string;
    enableCaching?: boolean;
    enableStreaming?: boolean;
    enableBatching?: boolean;
    maxConcurrentRequests?: number;
    streamingConfig?: Partial<StreamingConfig>;
    promptOptimization?: boolean;
    enableMetrics?: boolean;
}
export interface ConcurrentAnalysisRequest {
    id: string;
    requirements: WorkflowRequirements;
    priority?: number;
}
export interface ConcurrentPlanningRequest {
    id: string;
    analysis: RequirementAnalysis;
    priority?: number;
}
export interface OptimizedMetrics {
    totalRequests: number;
    streamingRequests: number;
    batchedRequests: number;
    concurrentRequests: number;
    avgResponseTime: number;
    cacheHitRate: number;
    promptOptimizations: number;
    errorRate: number;
}
/**
 * Optimized AI Agent with streaming, batching, and concurrent processing capabilities
 */
export declare class OptimizedAIAgent extends EventEmitter {
    private baseAgent;
    private streamingClient;
    private config;
    private promptTemplates;
    private metrics;
    constructor(config?: OptimizedAIConfig);
    /**
     * Analyze requirements with streaming response
     */
    analyzeRequirementsStreaming(requirements: WorkflowRequirements): Promise<AsyncGenerator<Partial<RequirementAnalysis>, RequirementAnalysis, unknown>>;
    /**
     * Plan workflow with streaming response
     */
    planWorkflowStreaming(analysis: RequirementAnalysis): Promise<AsyncGenerator<Partial<WorkflowPlan>, WorkflowPlan, unknown>>;
    /**
     * Process multiple analysis requests concurrently
     */
    analyzeConcurrent(requests: ConcurrentAnalysisRequest[]): Promise<Map<string, RequirementAnalysis>>;
    /**
     * Process multiple planning requests concurrently
     */
    planConcurrent(requests: ConcurrentPlanningRequest[]): Promise<Map<string, WorkflowPlan>>;
    /**
     * Batch multiple requests for efficient processing
     */
    batchRequests(requests: {
        type: 'analysis' | 'planning';
        data: any;
        id: string;
    }[]): Promise<Map<string, any>>;
    /**
     * Get comprehensive performance metrics
     */
    getOptimizedMetrics(): OptimizedMetrics & {
        streamingClient: any;
        baseAgent: any;
    };
    /**
     * Preload optimized prompts for better performance
     */
    preloadOptimizedPrompts(): Promise<void>;
    /**
     * Shutdown and cleanup resources
     */
    shutdown(): Promise<void>;
    /**
     * Initialize optimized prompt templates
     */
    private initializePromptTemplates;
    /**
     * Get optimized prompt with variable substitution
     */
    private getOptimizedPrompt;
    /**
     * Flatten nested variables for template substitution
     */
    private flattenVariables;
    /**
     * Process streaming analysis response
     */
    private processAnalysisStream;
    /**
     * Process streaming planning response
     */
    private processPlanningStream;
    /**
     * Create a single-yield generator for fallback scenarios
     */
    private createSingleYieldGenerator;
    /**
     * Parse analysis response (reuse base agent logic)
     */
    private parseAnalysisResponse;
    /**
     * Parse planning response (reuse base agent logic)
     */
    private parsePlanningResponse;
    /**
     * Setup event handlers for monitoring
     */
    private setupEventHandlers;
}
//# sourceMappingURL=optimized-ai-agent.d.ts.map