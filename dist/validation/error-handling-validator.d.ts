/**
 * Error Handling Validator
 * Validates workflow error handling patterns and recovery strategies
 */
import { N8nWorkflow, ValidationResult } from '../types/n8n-workflow.js';
import { ConnectionValidator } from './connection-validator';
/**
 * Error types in workflows
 */
export declare enum ErrorType {
    NODE_EXECUTION = "node_execution",
    DATA_FLOW = "data_flow",
    NETWORK_CONNECTIVITY = "network_connectivity",
    AUTHENTICATION = "authentication",
    RATE_LIMITING = "rate_limiting",
    CONFIGURATION = "configuration",
    DATA_VALIDATION = "data_validation"
}
/**
 * Recovery strategies
 */
export declare enum RecoveryStrategy {
    RETRY_WITH_BACKOFF = "retry_with_backoff",
    CIRCUIT_BREAKER = "circuit_breaker",
    FALLBACK_VALUE = "fallback_value",
    SKIP_NODE = "skip_node",
    GRACEFUL_DEGRADATION = "graceful_degradation"
}
/**
 * Node error handling analysis
 */
export interface NodeErrorHandling {
    nodeId: string;
    nodeType: string;
    errorTypes: ErrorType[];
    recoveryStrategies: RecoveryStrategy[];
    hasRetryLogic: boolean;
    hasErrorOutput: boolean;
    resilience: number;
}
/**
 * Workflow error handling analysis
 */
export interface WorkflowErrorHandling {
    totalNodes: number;
    nodesWithErrorHandling: number;
    errorHandlingCoverage: number;
    cascadingFailureRisk: number;
    resilience: number;
}
/**
 * Error Handling Validator Class
 */
export declare class ErrorHandlingValidator {
    private connectionValidator;
    constructor(connectionValidator?: ConnectionValidator);
    /**
     * Validate workflow error handling
     */
    validateErrorHandling(workflow: N8nWorkflow): ValidationResult;
    /**
     * Analyze node error handling
     */
    analyzeNodeErrorHandling(workflow: N8nWorkflow): NodeErrorHandling[];
    /**
     * Analyze workflow error handling
     */
    analyzeWorkflowErrorHandling(workflow: N8nWorkflow): WorkflowErrorHandling;
    /**
     * Private helper methods
     */
    private validateNodeErrorHandling;
    private validateWorkflowErrorHandling;
    private getDefaultPattern;
    private hasRetryConfiguration;
    private hasErrorOutputConfiguration;
    private calculateNodeResilience;
    private calculateCascadingFailureRisk;
    private calculateWorkflowResilience;
}
//# sourceMappingURL=error-handling-validator.d.ts.map