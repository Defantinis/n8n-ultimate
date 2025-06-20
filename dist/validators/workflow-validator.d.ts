import { N8nWorkflow, ValidationResult } from '../types/n8n-workflow.js';
import { WorkflowValidationResult } from './n8n-workflow-schema.js';
/**
 * Validates n8n workflow structure and identifies issues
 */
export declare class WorkflowValidator {
    /**
     * Validate a complete workflow (legacy method)
     */
    validate(workflow: N8nWorkflow): Promise<ValidationResult>;
    /**
     * Enhanced validation using official n8n schema patterns
     */
    validateWithN8nSchema(workflow: N8nWorkflow): Promise<WorkflowValidationResult & {
        legacyValidation: ValidationResult;
    }>;
    /**
     * Quick validation check using n8n official patterns
     */
    static validateQuick(workflow: N8nWorkflow): WorkflowValidationResult;
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
     * Validate workflow connections
     */
    private validateConnections;
    /**
     * Check for nodes with no connections (isolated nodes)
     */
    private checkForIsolatedNodes;
    /**
     * Validate workflow settings
     */
    private validateSettings;
}
//# sourceMappingURL=workflow-validator.d.ts.map