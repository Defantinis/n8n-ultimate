import { WorkflowPlan, NodeSpecification } from '../types/n8n-workflow.js';
import { N8nWorkflow, N8nNode } from '../types/n8n-workflow.js';
export interface WorkflowRequirements {
    description: string;
    type: 'automation' | 'data-processing' | 'integration' | 'custom' | 'api-integration';
    inputs?: Array<{
        name: string;
        type: string;
        description: string;
    }>;
    outputs?: Array<{
        name: string;
        type: string;
        description: string;
    }>;
    steps?: string[];
    constraints?: Record<string, any>;
    tags?: string[];
}
export interface SimplificationSuggestion {
    type: 'split-node' | 'merge-nodes' | 'simplify-parameters' | 'replace-node';
    nodeId: string;
    description: string;
    parameters?: Record<string, any>;
    newNode?: NodeSpecification;
}
/**
 * AI Agent that uses Ollama to analyze requirements and plan workflows
 */
export declare class AIAgent {
    private readonly ollamaBaseUrl;
    private readonly modelName;
    private readonly enableCaching;
    constructor(ollamaBaseUrl?: string, modelName?: string, enableCaching?: boolean);
    /**
     * Analyze user requirements to understand what kind of workflow is needed
     */
    analyzeRequirements(requirements: WorkflowRequirements): Promise<RequirementAnalysis>;
    /**
     * Plan the workflow structure based on the analysis
     */
    planWorkflow(analysis: RequirementAnalysis): Promise<WorkflowPlan>;
    /**
     * Suggest simplifications for complex workflows
     */
    suggestSimplifications(workflow: N8nWorkflow, complexNodes: N8nNode[], requirements: WorkflowRequirements): Promise<SimplificationSuggestion[]>;
    /**
     * Get cache statistics for performance monitoring
     */
    getCacheStats(): import("../performance/ollama-cache-manager.js").CacheStats;
    /**
     * Clear cache (useful for testing or manual cache management)
     */
    clearCache(): void;
    /**
     * Preload common workflow generation prompts into cache
     */
    preloadCommonPrompts(): Promise<void>;
    /**
     * Build the analysis prompt for Ollama
     */
    private buildAnalysisPrompt;
    /**
     * Build the planning prompt for Ollama
     */
    private buildPlanningPrompt;
    /**
     * Build the simplification prompt for Ollama
     */
    private buildSimplificationPrompt;
    /**
     * Call Ollama API with caching support
     */
    private callOllama;
    /**
     * Parse the analysis response from Ollama
     */
    private parseAnalysisResponse;
    /**
     * Parse the planning response from Ollama
     */
    private parsePlanningResponse;
    /**
     * Parse the simplification response from Ollama
     */
    private parseSimplificationResponse;
    /**
     * Create fallback analysis when AI fails
     */
    private createFallbackAnalysis;
    /**
     * Create fallback plan when AI fails
     */
    private createFallbackPlan;
    /**
     * Create fallback simplifications when AI fails
     */
    private createFallbackSimplifications;
    private determineWorkflowType;
    private estimateComplexity;
    private extractKeyComponents;
    private suggestNodeTypes;
}
/**
 * Requirement analysis result
 */
export interface RequirementAnalysis {
    workflowType: 'linear' | 'parallel' | 'conditional' | 'complex';
    estimatedComplexity: number;
    keyComponents: string[];
    suggestedNodeTypes: string[];
    dataFlow: string;
    potentialChallenges: string[];
    recommendations: string[];
}
//# sourceMappingURL=ai-agent.d.ts.map