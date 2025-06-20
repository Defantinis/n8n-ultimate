import { N8nNode, N8nConnections } from '../types/n8n-workflow.js';
import { FlowConnection } from './workflow-generator.js';
/**
 * Builder class for creating connections between n8n nodes
 */
export declare class ConnectionBuilder {
    /**
     * Build connections between nodes based on the flow specification
     */
    buildConnections(nodes: N8nNode[], flow: FlowConnection[]): N8nConnections;
    /**
     * Add a single connection between two nodes
     */
    private addConnection;
    /**
     * Determine the connection type based on flow specification
     */
    private determineConnectionType;
    /**
     * Determine the output index for the connection
     */
    private determineOutputIndex;
    /**
     * Determine the input index for the connection
     */
    private determineInputIndex;
    /**
     * Build connections for a linear workflow (simple chain)
     */
    buildLinearConnections(nodes: N8nNode[]): N8nConnections;
    /**
     * Build connections for a parallel workflow (fan-out/fan-in pattern)
     */
    buildParallelConnections(triggerNode: N8nNode, parallelNodes: N8nNode[], mergeNode?: N8nNode): N8nConnections;
    /**
     * Build connections for a conditional workflow (if-then-else pattern)
     */
    buildConditionalConnections(conditionNode: N8nNode, truePathNodes: N8nNode[], falsePathNodes: N8nNode[], mergeNode?: N8nNode): N8nConnections;
    /**
     * Validate connections for consistency
     */
    validateConnections(connections: N8nConnections, nodes: N8nNode[]): ValidationResult;
    /**
     * Check if a node is a start/trigger node
     */
    private isStartNode;
    /**
     * Adds a new connection by node names.
     */
    addConnectionByIds(connections: N8nConnections, fromNodeName: string, toNodeName: string, type?: 'main' | 'error', outputIndex?: number, inputIndex?: number): N8nConnections;
    /**
     * Reroutes an existing connection to go through a new node.
     */
    rerouteThroughNode(connections: N8nConnections, targetNodeName: string, intermediateNodeName: string): {
        connections: N8nConnections;
        originalSuccessorName: string | null;
    };
}
/**
 * Connection validation result
 */
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
//# sourceMappingURL=connection-builder.d.ts.map