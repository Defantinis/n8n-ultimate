import { N8nWorkflow } from '../types/n8n-workflow.js';
/**
 * Main workflow generator that creates n8n workflows from user requirements
 */
export declare class WorkflowGenerator {
    private parser;
    private nodeFactory;
    private connectionBuilder;
    private positionCalculator;
    private aiAgent;
    constructor();
    /**
     * Generate a complete n8n workflow from user requirements
     */
    generateWorkflow(requirements: WorkflowRequirements): Promise<GeneratedWorkflow>;
    /**
     * Generate workflow nodes based on the AI plan
     */
    private generateNodes;
    /**
     * Create the complete workflow structure
     */
    private createWorkflow;
    /**
     * Optimize the generated workflow
     */
    private optimizeWorkflow;
    /**
     * Fix validation errors in the workflow
     */
    private fixValidationErrors;
    /**
     * Reduce workflow complexity
     */
    private reduceComplexity;
    /**
     * Apply simplification suggestions to the workflow
     */
    private applySimplifications;
    /**
     * Generate workflow from a template
     */
    generateFromTemplate(templateName: string, parameters: Record<string, any>): Promise<GeneratedWorkflow>;
    /**
     * Enhance an existing workflow with new requirements
     */
    enhanceWorkflow(existingWorkflow: N8nWorkflow, enhancements: WorkflowEnhancement[]): Promise<GeneratedWorkflow>;
    private splitComplexNode;
    private mergeSimpleNodes;
    private simplifyNodeParameters;
    private loadTemplate;
    private populateTemplate;
    private addErrorHandling;
}
export interface WorkflowRequirements {
    name?: string;
    description: string;
    type: 'automation' | 'data-processing' | 'api-integration' | 'notification' | 'monitoring' | 'template' | 'enhancement';
    inputs?: Array<{
        name: string;
        type: 'webhook' | 'schedule' | 'manual' | 'file' | 'api';
        description: string;
    }>;
    outputs?: Array<{
        name: string;
        type: 'file' | 'api' | 'email' | 'webhook' | 'database';
        description: string;
    }>;
    steps?: string[];
    constraints?: {
        maxNodes?: number;
        maxComplexity?: number;
        requiredNodeTypes?: string[];
        forbiddenNodeTypes?: string[];
    };
    tags?: string[];
    priority?: 'low' | 'medium' | 'high';
}
export interface WorkflowPlan {
    nodes: NodeSpecification[];
    flow: FlowConnection[];
    estimatedComplexity: number;
    rationale: string;
}
export interface NodeSpecification {
    id: string;
    name: string;
    type: string;
    parameters: Record<string, any>;
    description: string;
    position?: [number, number];
}
export interface FlowConnection {
    from: string;
    to: string;
    type: string;
    condition?: string;
}
export interface GeneratedWorkflow {
    workflow: N8nWorkflow;
    metadata: any;
    validation: any;
    generationDetails: {
        requirements: WorkflowRequirements;
        analysis: any;
        plan: WorkflowPlan;
        nodeCount: number;
        connectionCount: number;
        complexity: number;
        generatedAt: string;
    };
}
export interface SimplificationSuggestion {
    type: 'split-node' | 'merge-nodes' | 'simplify-parameters';
    nodeId: string;
    description: string;
    parameters?: Record<string, any>;
}
export interface WorkflowEnhancement {
    type: 'add-node' | 'modify-node' | 'add-connection' | 'add-error-handling';
    description: string;
    parameters: Record<string, any>;
}
//# sourceMappingURL=workflow-generator.d.ts.map