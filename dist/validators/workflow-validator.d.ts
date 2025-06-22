import { N8nWorkflow, ValidationResult } from '../types/n8n-workflow.js';
/**
 * Validates n8n workflow structure and identifies issues
 */
export declare class WorkflowValidator {
    /**
     * Validate a complete workflow
     */
    validate(workflow: N8nWorkflow): Promise<ValidationResult>;
    /**
     * Validate basic workflow structure
     */
    private validateBasicStructure;
    /**
     * Validate individual nodes
     */
    private validateNodes;
    /**
     * Validate a single node
     */
    private validateNode;
    /**
     * Validate node based on its type
     */
    private validateNodeByType;
    /**
     * Validate HTTP Request node
     */
    private validateHttpRequestNode;
    /**
     * Validate Code node
     */
    private validateCodeNode;
    /**
     * Validate Start node
     */
    private validateStartNode;
    /**
     * Validate connections between nodes
     */
    private validateConnections;
    /**
     * Check for nodes with no incoming or outgoing connections
     */
    private checkForIsolatedNodes;
    /**
     * Validate workflow settings
     */
    private validateSettings;
}
//# sourceMappingURL=workflow-validator.d.ts.map