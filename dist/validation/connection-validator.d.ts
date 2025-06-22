/**
 * Connection Configuration Validator
 * Validates n8n workflow connections, data flow, and connection mapping
 */
import { N8nWorkflow, ValidationResult, ValidationError, ValidationWarning } from '../types/n8n-workflow.js';
import { NodeCompatibilityValidator } from './node-compatibility-validator.js';
/**
 * Connection validation types
 */
export interface ConnectionValidationRule {
    name: string;
    description: string;
    validate: (workflow: N8nWorkflow) => {
        errors: ValidationError[];
        warnings: ValidationWarning[];
    };
}
/**
 * Data flow analysis result
 */
export interface DataFlowAnalysis {
    entryPoints: string[];
    exitPoints: string[];
    isolatedNodes: string[];
    cycles: string[][];
    unreachableNodes: string[];
    maxDepth: number;
    connectionPaths: ConnectionPath[];
}
/**
 * Connection path representation
 */
export interface ConnectionPath {
    path: string[];
    length: number;
    hasErrors: boolean;
    errorMessages: string[];
}
/**
 * Connection statistics
 */
export interface ConnectionStatistics {
    totalConnections: number;
    connectionsByType: Record<string, number>;
    nodeConnectionCounts: Record<string, {
        inputs: number;
        outputs: number;
    }>;
    averageConnectionsPerNode: number;
    maxConnectionsPerNode: number;
    minConnectionsPerNode: number;
}
/**
 * Connection Configuration Validator Class
 */
export declare class ConnectionValidator {
    private nodeCompatibilityValidator;
    private validationRules;
    constructor(nodeCompatibilityValidator?: NodeCompatibilityValidator);
    /**
     * Validate all connections in a workflow
     */
    validateWorkflowConnections(workflow: N8nWorkflow): ValidationResult;
    /**
     * Analyze data flow in the workflow
     */
    analyzeDataFlow(workflow: N8nWorkflow): DataFlowAnalysis;
    /**
     * Generate connection statistics
     */
    generateConnectionStatistics(workflow: N8nWorkflow): ConnectionStatistics;
    /**
     * Initialize validation rules
     */
    private initializeValidationRules;
    /**
     * Validate connection integrity
     */
    private validateConnectionIntegrity;
    /**
     * Validate connection mapping consistency
     */
    private validateConnectionMapping;
    /**
     * Validate data flow continuity
     */
    private validateDataFlowContinuity;
    /**
     * Validate connection types
     */
    private validateConnectionTypes;
    /**
     * Validate circular dependencies
     */
    private validateCircularDependencies;
    /**
     * Validate connection counts
     */
    private validateConnectionCounts;
    /**
     * Validate orphaned nodes
     */
    private validateOrphanedNodes;
    /**
     * Find entry points (nodes with no input connections)
     */
    private findEntryPoints;
    /**
     * Find exit points (nodes with no output connections)
     */
    private findExitPoints;
    /**
     * Find isolated nodes (nodes with no connections at all)
     */
    private findIsolatedNodes;
    /**
     * Detect cycles using DFS
     */
    private detectCycles;
    /**
     * Find unreachable nodes from entry points
     */
    private findUnreachableNodes;
    /**
     * Calculate maximum depth from entry points
     */
    private calculateMaxDepth;
    /**
     * Generate connection paths from entry points
     */
    private generateConnectionPaths;
    /**
     * Add custom validation rule
     */
    addValidationRule(rule: ConnectionValidationRule): void;
    /**
     * Remove validation rule by name
     */
    removeValidationRule(ruleName: string): boolean;
    /**
     * Get available validation rules
     */
    getValidationRules(): ConnectionValidationRule[];
}
/**
 * Utility functions for connection validation
 */
export declare const ConnectionValidatorUtils: {
    /**
     * Check if two nodes are connected
     */
    areNodesConnected(workflow: N8nWorkflow, sourceId: string, targetId: string): boolean;
    /**
     * Get all connections for a node
     */
    getNodeConnections(workflow: N8nWorkflow, nodeId: string): {
        inputs: Array<{
            sourceNode: string;
            outputType: string;
            inputType: string;
            index: number;
        }>;
        outputs: Array<{
            targetNode: string;
            outputType: string;
            inputType: string;
            index: number;
        }>;
    };
    /**
     * Check if workflow has cycles
     */
    hasCycles(workflow: N8nWorkflow): boolean;
    /**
     * Get shortest path between two nodes
     */
    getShortestPath(workflow: N8nWorkflow, sourceId: string, targetId: string): string[] | null;
};
//# sourceMappingURL=connection-validator.d.ts.map