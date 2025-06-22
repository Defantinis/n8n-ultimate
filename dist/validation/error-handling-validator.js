/**
 * Error Handling Validator
 * Validates workflow error handling patterns and recovery strategies
 */
import { ConnectionValidator } from './connection-validator';
/**
 * Error types in workflows
 */
export var ErrorType;
(function (ErrorType) {
    ErrorType["NODE_EXECUTION"] = "node_execution";
    ErrorType["DATA_FLOW"] = "data_flow";
    ErrorType["NETWORK_CONNECTIVITY"] = "network_connectivity";
    ErrorType["AUTHENTICATION"] = "authentication";
    ErrorType["RATE_LIMITING"] = "rate_limiting";
    ErrorType["CONFIGURATION"] = "configuration";
    ErrorType["DATA_VALIDATION"] = "data_validation";
})(ErrorType || (ErrorType = {}));
/**
 * Recovery strategies
 */
export var RecoveryStrategy;
(function (RecoveryStrategy) {
    RecoveryStrategy["RETRY_WITH_BACKOFF"] = "retry_with_backoff";
    RecoveryStrategy["CIRCUIT_BREAKER"] = "circuit_breaker";
    RecoveryStrategy["FALLBACK_VALUE"] = "fallback_value";
    RecoveryStrategy["SKIP_NODE"] = "skip_node";
    RecoveryStrategy["GRACEFUL_DEGRADATION"] = "graceful_degradation";
})(RecoveryStrategy || (RecoveryStrategy = {}));
/**
 * Error handling patterns database
 */
const ERROR_PATTERNS = {
    'n8n-nodes-base.httpRequest': {
        commonErrors: [ErrorType.NETWORK_CONNECTIVITY, ErrorType.AUTHENTICATION],
        strategies: [RecoveryStrategy.RETRY_WITH_BACKOFF, RecoveryStrategy.CIRCUIT_BREAKER],
        hasBuiltInRetry: true,
        hasErrorOutput: true,
        networkDependent: true
    },
    'n8n-nodes-base.set': {
        commonErrors: [ErrorType.DATA_VALIDATION],
        strategies: [RecoveryStrategy.FALLBACK_VALUE],
        hasBuiltInRetry: false,
        hasErrorOutput: false,
        networkDependent: false
    },
    'n8n-nodes-base.code': {
        commonErrors: [ErrorType.NODE_EXECUTION, ErrorType.DATA_VALIDATION],
        strategies: [RecoveryStrategy.RETRY_WITH_BACKOFF, RecoveryStrategy.FALLBACK_VALUE],
        hasBuiltInRetry: false,
        hasErrorOutput: true,
        networkDependent: false
    },
    '@n8n/n8n-nodes-langchain.openAi': {
        commonErrors: [ErrorType.NETWORK_CONNECTIVITY, ErrorType.RATE_LIMITING],
        strategies: [RecoveryStrategy.RETRY_WITH_BACKOFF, RecoveryStrategy.CIRCUIT_BREAKER],
        hasBuiltInRetry: true,
        hasErrorOutput: true,
        networkDependent: true
    }
};
/**
 * Error Handling Validator Class
 */
export class ErrorHandlingValidator {
    connectionValidator;
    constructor(connectionValidator) {
        this.connectionValidator = connectionValidator || new ConnectionValidator();
    }
    /**
     * Validate workflow error handling
     */
    validateErrorHandling(workflow) {
        const allErrors = [];
        const allWarnings = [];
        // Validate node-level error handling
        const nodeResults = this.validateNodeErrorHandling(workflow);
        allErrors.push(...nodeResults.errors);
        allWarnings.push(...nodeResults.warnings);
        // Validate workflow-level error handling
        const workflowResults = this.validateWorkflowErrorHandling(workflow);
        allErrors.push(...workflowResults.errors);
        allWarnings.push(...workflowResults.warnings);
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings
        };
    }
    /**
     * Analyze node error handling
     */
    analyzeNodeErrorHandling(workflow) {
        return workflow.nodes.map(node => {
            const pattern = ERROR_PATTERNS[node.type] || this.getDefaultPattern();
            const hasRetryLogic = this.hasRetryConfiguration(node) || pattern.hasBuiltInRetry;
            const hasErrorOutput = this.hasErrorOutputConfiguration(node) || pattern.hasErrorOutput;
            const resilience = this.calculateNodeResilience(pattern, hasRetryLogic, hasErrorOutput);
            return {
                nodeId: node.id,
                nodeType: node.type,
                errorTypes: pattern.commonErrors,
                recoveryStrategies: pattern.strategies,
                hasRetryLogic,
                hasErrorOutput,
                resilience
            };
        });
    }
    /**
     * Analyze workflow error handling
     */
    analyzeWorkflowErrorHandling(workflow) {
        const nodeAnalysis = this.analyzeNodeErrorHandling(workflow);
        const totalNodes = workflow.nodes.length;
        const nodesWithErrorHandling = nodeAnalysis.filter(n => n.hasRetryLogic || n.hasErrorOutput).length;
        const errorHandlingCoverage = totalNodes > 0 ? (nodesWithErrorHandling / totalNodes) * 100 : 0;
        const cascadingFailureRisk = this.calculateCascadingFailureRisk(workflow, nodeAnalysis);
        const resilience = this.calculateWorkflowResilience(errorHandlingCoverage, cascadingFailureRisk);
        return {
            totalNodes,
            nodesWithErrorHandling,
            errorHandlingCoverage,
            cascadingFailureRisk,
            resilience
        };
    }
    /**
     * Private helper methods
     */
    validateNodeErrorHandling(workflow) {
        const errors = [];
        const warnings = [];
        const nodeAnalysis = this.analyzeNodeErrorHandling(workflow);
        for (const analysis of nodeAnalysis) {
            // Check for critical nodes without error handling
            if (analysis.errorTypes.includes(ErrorType.NETWORK_CONNECTIVITY) && !analysis.hasRetryLogic) {
                warnings.push({
                    type: 'best-practice',
                    message: `Network-dependent node ${analysis.nodeId} lacks retry logic`,
                    nodeId: analysis.nodeId,
                });
            }
            // Check for nodes with low resilience
            if (analysis.resilience < 0.5) {
                warnings.push({
                    type: 'best-practice',
                    message: `Node ${analysis.nodeId} has low error resilience: ${(analysis.resilience * 100).toFixed(1)}%`,
                    nodeId: analysis.nodeId,
                });
            }
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    validateWorkflowErrorHandling(workflow) {
        const errors = [];
        const warnings = [];
        const workflowAnalysis = this.analyzeWorkflowErrorHandling(workflow);
        // Check overall error handling coverage
        if (workflowAnalysis.errorHandlingCoverage < 50) {
            warnings.push({
                type: 'best-practice',
                message: `Low error handling coverage: ${workflowAnalysis.errorHandlingCoverage.toFixed(1)}%`,
            });
        }
        // Check cascading failure risk
        if (workflowAnalysis.cascadingFailureRisk > 0.7) {
            errors.push({
                type: 'structure',
                message: `High cascading failure risk: ${(workflowAnalysis.cascadingFailureRisk * 100).toFixed(1)}%`,
                severity: 'error'
            });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
    getDefaultPattern() {
        return {
            commonErrors: [ErrorType.NODE_EXECUTION],
            strategies: [RecoveryStrategy.SKIP_NODE],
            hasBuiltInRetry: false,
            hasErrorOutput: false,
            networkDependent: false
        };
    }
    hasRetryConfiguration(node) {
        return !!(node.parameters?.retryOnFail || node.parameters?.retries || node.parameters?.maxTries);
    }
    hasErrorOutputConfiguration(node) {
        return !!(node.parameters?.continueOnFail || node.parameters?.alwaysOutputData);
    }
    calculateNodeResilience(pattern, hasRetryLogic, hasErrorOutput) {
        let score = 0.3; // Base score
        if (hasRetryLogic)
            score += 0.3;
        if (hasErrorOutput)
            score += 0.2;
        if (pattern.hasBuiltInRetry)
            score += 0.1;
        if (!pattern.networkDependent)
            score += 0.1;
        return Math.min(score, 1.0);
    }
    calculateCascadingFailureRisk(workflow, nodeAnalysis) {
        const dataFlow = this.connectionValidator.analyzeDataFlow(workflow);
        const criticalNodes = nodeAnalysis.filter(n => n.resilience < 0.5).length;
        const totalNodes = workflow.nodes.length;
        const nodeRisk = totalNodes > 0 ? criticalNodes / totalNodes : 0;
        const pathRisk = dataFlow.connectionPaths.length > 0 ?
            dataFlow.connectionPaths.filter(p => p.hasErrors).length / dataFlow.connectionPaths.length : 0;
        return (nodeRisk + pathRisk) / 2;
    }
    calculateWorkflowResilience(coverage, cascadingRisk) {
        const coverageScore = coverage / 100;
        const riskScore = 1 - cascadingRisk;
        return (coverageScore + riskScore) / 2;
    }
}
//# sourceMappingURL=error-handling-validator.js.map