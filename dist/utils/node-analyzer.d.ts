import { N8nNode, N8nWorkflow } from '../types/n8n-workflow.js';
/**
 * Utility class for analyzing n8n nodes and their relationships
 */
export declare class NodeAnalyzer {
    /**
     * Analyze a node and extract key information
     */
    analyzeNode(node: N8nNode): NodeAnalysis;
    /**
     * Get the category of a node based on its type
     */
    getNodeCategory(nodeType: string): NodeCategory;
    /**
     * Calculate the complexity of a node (1-10 scale)
     */
    calculateNodeComplexity(node: N8nNode): number;
    /**
     * Check if a node contains custom code
     */
    hasCustomCode(node: N8nNode): boolean;
    /**
     * Check if a node is asynchronous
     */
    isAsyncNode(node: N8nNode): boolean;
    /**
     * Check if a node can fail during execution
     */
    canNodeFail(node: N8nNode): boolean;
    /**
     * Get the length of custom code in a node
     */
    private getCodeLength;
    /**
     * Count the number of expressions in a node
     */
    private countExpressions;
    /**
     * Generate a human-readable description of what the node does
     */
    generateNodeDescription(node: N8nNode): string;
    /**
     * Analyze relationships between nodes in a workflow
     */
    analyzeNodeRelationships(workflow: N8nWorkflow): NodeRelationshipAnalysis;
    /**
     * Calculate the strength of a connection between two nodes
     */
    private calculateConnectionStrength;
    /**
     * Find potential bottlenecks in the workflow
     */
    findBottlenecks(workflow: N8nWorkflow): BottleneckAnalysis[];
}
export interface NodeAnalysis {
    id: string;
    name: string;
    type: string;
    category: NodeCategory;
    complexity: number;
    hasCustomCode: boolean;
    isAsync: boolean;
    canFail: boolean;
    parameterCount: number;
    description: string;
}
export type NodeCategory = 'trigger' | 'communication' | 'logic' | 'data-processing' | 'storage' | 'notification' | 'control-flow' | 'utility';
export interface NodeRelationship {
    source: string;
    target: string;
    type: string;
    outputIndex: number;
    inputIndex: number;
    strength: number;
}
export interface NodeRelationshipAnalysis {
    relationships: NodeRelationship[];
    criticalNodes: Array<{
        nodeName: string;
        influence: number;
    }>;
    totalConnections: number;
    averageInfluence: number;
}
export interface BottleneckAnalysis {
    nodeId: string;
    nodeName: string;
    type: 'convergence' | 'complexity' | 'async' | 'failure-prone';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
}
//# sourceMappingURL=node-analyzer.d.ts.map