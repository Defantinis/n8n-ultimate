import { N8nNode } from '../types/n8n-workflow.js';
import { NodeSpecification } from '../types/n8n-workflow.js';
/**
 * Factory class for creating n8n nodes based on specifications
 */
export declare class NodeFactory {
    private nodeTemplates;
    constructor();
    /**
     * Create a node based on the specification
     */
    createNode(spec: NodeSpecification): Promise<N8nNode>;
    /**
     * Get available node types
     */
    getAvailableNodeTypes(): string[];
    /**
     * Get node template information
     */
    getNodeTemplate(nodeType: string): NodeTemplate | undefined;
    /**
     * Initialize default node templates
     */
    private initializeNodeTemplates;
    /**
     * Merge template parameters with specification parameters
     */
    private mergeParameters;
    /**
     * Create a custom node template
     */
    addNodeTemplate(nodeType: string, template: NodeTemplate): void;
    /**
     * Get node categories
     */
    getNodeCategories(): string[];
    /**
     * Get nodes by category
     */
    getNodesByCategory(category: string): string[];
}
/**
 * Node template interface
 */
export interface NodeTemplate {
    category: 'trigger' | 'communication' | 'logic' | 'data-processing' | 'storage' | 'notification' | 'control-flow' | 'utility';
    defaultVersion: number;
    defaultParameters: Record<string, any>;
    description: string;
    requiresCredentials?: boolean;
    defaultCredentials?: Record<string, any>;
    webhookId?: boolean;
}
//# sourceMappingURL=node-factory.d.ts.map