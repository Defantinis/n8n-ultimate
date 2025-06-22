/**
 * n8n AI/LangChain Integration Patterns
 *
 * This module implements AI and LangChain integration patterns for n8n workflows,
 * providing comprehensive AI capabilities including OpenAI, LangChain, Vector Stores,
 * and AI Agents integration patterns.
 */
import { N8nWorkflow, N8nNode } from '../types/n8n-workflow.js';
import { IntegrationConfig, N8nLogger } from './integration-patterns.js';
/**
 * AI Integration Configuration
 */
export interface AIIntegrationConfig extends IntegrationConfig {
    openaiApiKey?: string;
    openaiModel?: string;
    openaiTemperature?: number;
    openaiMaxTokens?: number;
    anthropicApiKey?: string;
    anthropicModel?: string;
    huggingfaceApiKey?: string;
    huggingfaceModel?: string;
    langchainApiKey?: string;
    langchainCallbacks?: boolean;
    vectorStoreType?: 'pinecone' | 'chroma' | 'weaviate' | 'qdrant';
    vectorStoreConfig?: Record<string, any>;
    aiTimeout?: number;
    aiRetryAttempts?: number;
    enableAIMetrics?: boolean;
    enableAILogging?: boolean;
    ollamaBaseUrl?: string;
    ollamaModel?: string;
}
/**
 * Default AI integration configuration
 */
export declare const defaultAIIntegrationConfig: AIIntegrationConfig;
/**
 * AI Node Templates
 * Pre-built node templates for common AI operations
 */
export declare class AINodeTemplatesClass {
    private config;
    private logger;
    constructor(config: AIIntegrationConfig, logger?: N8nLogger);
    /**
     * Create OpenAI Chat node
     */
    createOpenAIChatNode(position?: [number, number]): N8nNode;
    /**
     * Create LangChain node
     */
    createLangChainNode(position?: [number, number]): N8nNode;
    /**
     * Create Vector Store node
     */
    createVectorStoreNode(position?: [number, number]): N8nNode;
    /**
     * Create AI Agent node
     */
    createAIAgentNode(position?: [number, number]): N8nNode;
    /**
     * Create Ollama node for local AI
     */
    createOllamaNode(position?: [number, number]): N8nNode;
}
/**
 * AI Workflow Patterns
 * Pre-built workflow patterns for common AI use cases
 */
export declare class AIWorkflowPatternsClass {
    private nodeTemplates;
    private config;
    private logger;
    constructor(config: AIIntegrationConfig, logger?: N8nLogger);
    /**
     * Create RAG (Retrieval-Augmented Generation) workflow
     */
    createRAGWorkflow(name?: string): N8nWorkflow;
    /**
     * Create Conversational Agent workflow
     */
    createConversationalAgentWorkflow(name?: string): N8nWorkflow;
}
/**
 * AI Performance Monitor
 * Tracks AI-specific metrics and performance
 */
export declare class AIPerformanceMonitorClass {
    private metrics;
    private config;
    private logger;
    constructor(config: AIIntegrationConfig, logger?: N8nLogger);
    /**
     * Track AI operation metrics
     */
    trackAIOperation(provider: string, model: string, tokens: number, cost: number, latency: number, success: boolean): void;
    /**
     * Get AI metrics for a specific provider/model
     */
    getAIMetrics(provider: string, model: string): {
        calls: number;
        totalTokens: number;
        totalCost: number;
        averageLatency: number;
        errorRate: number;
        tokensPerCall: number;
        costPerCall: number;
    };
    /**
     * Get cost optimization recommendations
     */
    getCostOptimizationRecommendations(): {
        recommendation: string;
        potentialSavings: number;
        priority: 'high' | 'medium' | 'low';
    }[];
    /**
     * Reset metrics
     */
    resetMetrics(): void;
}
/**
 * AI Integration Manager
 * Main orchestration class for AI integrations
 */
export declare class AIIntegrationManagerClass {
    private config;
    private nodeTemplates;
    private workflowPatterns;
    private performanceMonitor;
    private logger;
    constructor(config?: Partial<AIIntegrationConfig>);
    /**
     * Get AI node templates
     */
    getNodeTemplates(): AINodeTemplatesClass;
    /**
     * Get workflow patterns
     */
    getWorkflowPatterns(): AIWorkflowPatternsClass;
    /**
     * Get performance monitor
     */
    getPerformanceMonitor(): AIPerformanceMonitorClass;
    /**
     * Validate AI workflow configuration
     */
    validateAIWorkflow(workflow: N8nWorkflow): Promise<{
        valid: boolean;
        errors: string[];
        warnings: string[];
        aiCompatibilityScore: number;
        recommendations: string[];
    }>;
    /**
     * Create optimized AI workflow
     */
    createOptimizedAIWorkflow(type: 'rag' | 'agent' | 'custom', name: string, options?: {
        includeErrorHandling?: boolean;
        includeMetrics?: boolean;
        includeRateLimiting?: boolean;
    }): Promise<N8nWorkflow>;
    /**
     * Add error handling to workflow
     */
    private addErrorHandlingToWorkflow;
    /**
     * Add metrics collection to workflow
     */
    private addMetricsToWorkflow;
    /**
     * Add rate limiting to workflow
     */
    private addRateLimitingToWorkflow;
}
/**
 * Utility functions for AI integration
 */
export declare const AIUtils: {
    /**
     * Calculate estimated cost for AI operation
     */
    calculateEstimatedCost(provider: "openai" | "anthropic" | "huggingface", model: string, inputTokens: number, outputTokens: number): number;
    /**
     * Estimate tokens in text
     */
    estimateTokens(text: string): number;
    /**
     * Create quick RAG workflow
     */
    createQuickRAGWorkflow: (manager: AIIntegrationManagerClass, name: string) => Promise<N8nWorkflow>;
    /**
     * Create quick agent workflow
     */
    createQuickAgentWorkflow: (manager: AIIntegrationManagerClass, name: string) => Promise<N8nWorkflow>;
};
//# sourceMappingURL=ai-integration-patterns.d.ts.map