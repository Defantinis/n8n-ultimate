/**
 * n8n Workflow JSON Schema - Based on Official n8n Repository Research
 *
 * This schema defines the exact structure and validation rules for n8n workflows
 * based on our analysis of the official n8n repository and documentation.
 */
// Validation rules and constraints
export const N8N_VALIDATION_RULES = {
    // Required fields validation
    REQUIRED_WORKFLOW_FIELDS: ['id', 'name', 'nodes', 'connections'],
    REQUIRED_NODE_FIELDS: ['id', 'name', 'type', 'typeVersion', 'position', 'parameters'],
    // Field constraints
    CONSTRAINTS: {
        // Workflow constraints
        WORKFLOW_NAME_MAX_LENGTH: 255,
        WORKFLOW_ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
        // Node constraints
        NODE_NAME_MAX_LENGTH: 100,
        NODE_ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
        NODE_TYPE_PATTERN: /^[a-zA-Z0-9.-]+$/,
        NODE_POSITION_BOUNDS: {
            MIN_X: -10000,
            MAX_X: 10000,
            MIN_Y: -10000,
            MAX_Y: 10000
        },
        // Connection constraints
        CONNECTION_TYPES: ['main', 'error'],
        MAX_CONNECTIONS_PER_OUTPUT: 100,
        // Settings constraints
        EXECUTION_TIMEOUT_MAX: 3600000, // 1 hour in milliseconds
        MAX_TRIES_RANGE: { MIN: 1, MAX: 10 }
    },
    // Common node types (based on our research)
    COMMON_NODE_TYPES: [
        'n8n-nodes-base.start',
        'n8n-nodes-base.httpRequest',
        'n8n-nodes-base.code',
        'n8n-nodes-base.if',
        'n8n-nodes-base.switch',
        'n8n-nodes-base.set',
        'n8n-nodes-base.merge',
        'n8n-nodes-base.noOp',
        'n8n-nodes-base.function',
        'n8n-nodes-base.webhook',
        'n8n-nodes-base.emailSend',
        'n8n-nodes-base.writeBinaryFile',
        'n8n-nodes-base.htmlExtract',
        'n8n-nodes-base.json',
        'n8n-nodes-base.dateTime',
        'n8n-nodes-base.itemLists'
    ],
    // Error handling options
    ERROR_HANDLING_OPTIONS: [
        'stopWorkflow',
        'continueRegularOutput',
        'continueErrorOutput'
    ]
};
// Schema validation functions
export class N8nWorkflowSchemaValidator {
    /**
     * Validate a complete workflow against n8n schema
     */
    static validateWorkflow(workflow) {
        const errors = [];
        const warnings = [];
        const suggestions = [];
        // Validate required fields
        N8nWorkflowSchemaValidator.validateRequiredFields(workflow, errors);
        // Validate workflow structure
        N8nWorkflowSchemaValidator.validateWorkflowStructure(workflow, errors, warnings);
        // Validate nodes
        N8nWorkflowSchemaValidator.validateNodes(workflow.nodes || [], errors, warnings);
        // Validate connections
        N8nWorkflowSchemaValidator.validateConnections(workflow.connections || {}, workflow.nodes || [], errors, warnings);
        // Generate suggestions
        N8nWorkflowSchemaValidator.generateSuggestions(workflow, suggestions);
        // Calculate compatibility score
        const compatibilityScore = N8nWorkflowSchemaValidator.calculateCompatibilityScore(errors, warnings);
        return {
            isValid: errors.length === 0,
            errors,
            warnings,
            suggestions,
            compatibilityScore
        };
    }
    /**
     * Validate required fields
     */
    static validateRequiredFields(workflow, errors) {
        N8N_VALIDATION_RULES.REQUIRED_WORKFLOW_FIELDS.forEach(field => {
            if (!workflow[field]) {
                errors.push({
                    field,
                    message: `Required field '${field}' is missing`,
                    code: 'REQUIRED_FIELD_MISSING',
                    severity: 'error'
                });
            }
        });
    }
    /**
     * Validate workflow structure
     */
    static validateWorkflowStructure(workflow, errors, warnings) {
        // Validate workflow name
        if (workflow.name && workflow.name.length > N8N_VALIDATION_RULES.CONSTRAINTS.WORKFLOW_NAME_MAX_LENGTH) {
            warnings.push({
                field: 'name',
                message: `Workflow name exceeds maximum length of ${N8N_VALIDATION_RULES.CONSTRAINTS.WORKFLOW_NAME_MAX_LENGTH} characters`,
                code: 'NAME_TOO_LONG',
                severity: 'warning'
            });
        }
        // Validate workflow ID pattern
        if (workflow.id && !N8N_VALIDATION_RULES.CONSTRAINTS.WORKFLOW_ID_PATTERN.test(workflow.id)) {
            errors.push({
                field: 'id',
                message: 'Workflow ID contains invalid characters',
                code: 'INVALID_ID_PATTERN',
                severity: 'error'
            });
        }
        // Validate nodes array
        if (workflow.nodes && !Array.isArray(workflow.nodes)) {
            errors.push({
                field: 'nodes',
                message: 'Nodes must be an array',
                code: 'INVALID_NODES_TYPE',
                severity: 'error'
            });
        }
        // Validate minimum nodes
        if (workflow.nodes && workflow.nodes.length === 0) {
            errors.push({
                field: 'nodes',
                message: 'Workflow must have at least one node',
                code: 'NO_NODES',
                severity: 'error'
            });
        }
    }
    /**
     * Validate individual nodes
     */
    static validateNodes(nodes, errors, warnings) {
        const nodeIds = new Set();
        nodes.forEach((node, index) => {
            const nodePrefix = `nodes[${index}]`;
            // Validate required node fields
            N8N_VALIDATION_RULES.REQUIRED_NODE_FIELDS.forEach(field => {
                if (!node[field]) {
                    errors.push({
                        field: `${nodePrefix}.${field}`,
                        message: `Required node field '${field}' is missing`,
                        code: 'REQUIRED_NODE_FIELD_MISSING',
                        severity: 'error',
                        nodeId: node.id
                    });
                }
            });
            // Validate node ID uniqueness
            if (node.id) {
                if (nodeIds.has(node.id)) {
                    errors.push({
                        field: `${nodePrefix}.id`,
                        message: `Duplicate node ID: ${node.id}`,
                        code: 'DUPLICATE_NODE_ID',
                        severity: 'error',
                        nodeId: node.id
                    });
                }
                else {
                    nodeIds.add(node.id);
                }
                // Validate node ID pattern
                if (!N8N_VALIDATION_RULES.CONSTRAINTS.NODE_ID_PATTERN.test(node.id)) {
                    errors.push({
                        field: `${nodePrefix}.id`,
                        message: `Node ID '${node.id}' contains invalid characters`,
                        code: 'INVALID_NODE_ID_PATTERN',
                        severity: 'error',
                        nodeId: node.id
                    });
                }
            }
            // Validate node type
            if (node.type && !N8N_VALIDATION_RULES.CONSTRAINTS.NODE_TYPE_PATTERN.test(node.type)) {
                errors.push({
                    field: `${nodePrefix}.type`,
                    message: `Invalid node type format: ${node.type}`,
                    code: 'INVALID_NODE_TYPE_FORMAT',
                    severity: 'error',
                    nodeId: node.id
                });
            }
            // Validate position
            if (node.position && Array.isArray(node.position)) {
                const [x, y] = node.position;
                const bounds = N8N_VALIDATION_RULES.CONSTRAINTS.NODE_POSITION_BOUNDS;
                if (x < bounds.MIN_X || x > bounds.MAX_X || y < bounds.MIN_Y || y > bounds.MAX_Y) {
                    warnings.push({
                        field: `${nodePrefix}.position`,
                        message: `Node position is outside recommended bounds`,
                        code: 'POSITION_OUT_OF_BOUNDS',
                        severity: 'warning',
                        nodeId: node.id
                    });
                }
            }
            // Validate retry settings
            if (node.maxTries !== undefined) {
                const { MIN, MAX } = N8N_VALIDATION_RULES.CONSTRAINTS.MAX_TRIES_RANGE;
                if (node.maxTries < MIN || node.maxTries > MAX) {
                    warnings.push({
                        field: `${nodePrefix}.maxTries`,
                        message: `maxTries should be between ${MIN} and ${MAX}`,
                        code: 'INVALID_MAX_TRIES',
                        severity: 'warning',
                        nodeId: node.id
                    });
                }
            }
            // Validate error handling
            if (node.onError && !N8N_VALIDATION_RULES.ERROR_HANDLING_OPTIONS.includes(node.onError)) {
                errors.push({
                    field: `${nodePrefix}.onError`,
                    message: `Invalid error handling option: ${node.onError}`,
                    code: 'INVALID_ERROR_HANDLING',
                    severity: 'error',
                    nodeId: node.id
                });
            }
        });
    }
    /**
     * Validate connections
     */
    static validateConnections(connections, nodes, errors, warnings) {
        const nodeIds = new Set(nodes.map(node => node.id));
        const nodeNames = new Set(nodes.map(node => node.name));
        Object.entries(connections).forEach(([sourceNodeId, nodeConnections]) => {
            // Validate source node exists (can be either ID or name)
            if (!nodeIds.has(sourceNodeId) && !nodeNames.has(sourceNodeId)) {
                errors.push({
                    field: `connections.${sourceNodeId}`,
                    message: `Connection references non-existent source node: ${sourceNodeId}`,
                    code: 'INVALID_SOURCE_NODE',
                    severity: 'error'
                });
                return;
            }
            // Warn if using node names instead of IDs (less reliable)
            if (nodeNames.has(sourceNodeId) && !nodeIds.has(sourceNodeId)) {
                warnings.push({
                    field: `connections.${sourceNodeId}`,
                    message: `Connection uses node name instead of ID. Consider using node IDs for better reliability.`,
                    code: 'CONNECTION_USES_NAME',
                    severity: 'warning'
                });
            }
            Object.entries(nodeConnections).forEach(([connectionType, connectionList]) => {
                // Validate connection type
                if (!N8N_VALIDATION_RULES.CONSTRAINTS.CONNECTION_TYPES.includes(connectionType)) {
                    warnings.push({
                        field: `connections.${sourceNodeId}.${connectionType}`,
                        message: `Unusual connection type: ${connectionType}`,
                        code: 'UNUSUAL_CONNECTION_TYPE',
                        severity: 'warning'
                    });
                }
                // Validate connection targets (n8n uses nested arrays)
                connectionList.forEach((connectionGroup, groupIndex) => {
                    if (!Array.isArray(connectionGroup)) {
                        errors.push({
                            field: `connections.${sourceNodeId}.${connectionType}[${groupIndex}]`,
                            message: 'Connection group must be an array',
                            code: 'INVALID_CONNECTION_GROUP',
                            severity: 'error'
                        });
                        return;
                    }
                    connectionGroup.forEach((connection, connectionIndex) => {
                        const connectionPrefix = `connections.${sourceNodeId}.${connectionType}[${groupIndex}][${connectionIndex}]`;
                        if (!connection.node || (!nodeIds.has(connection.node) && !nodeNames.has(connection.node))) {
                            errors.push({
                                field: `${connectionPrefix}.node`,
                                message: `Connection references non-existent target node: ${connection.node}`,
                                code: 'INVALID_TARGET_NODE',
                                severity: 'error'
                            });
                        }
                        // Warn if using node names instead of IDs for targets
                        if (connection.node && nodeNames.has(connection.node) && !nodeIds.has(connection.node)) {
                            warnings.push({
                                field: `${connectionPrefix}.node`,
                                message: `Connection target uses node name instead of ID. Consider using node IDs for better reliability.`,
                                code: 'TARGET_USES_NAME',
                                severity: 'warning'
                            });
                        }
                        // Validate connection structure
                        if (typeof connection.index !== 'number' || connection.index < 0) {
                            errors.push({
                                field: `${connectionPrefix}.index`,
                                message: 'Connection index must be a non-negative number',
                                code: 'INVALID_CONNECTION_INDEX',
                                severity: 'error'
                            });
                        }
                        // Validate connection type
                        if (!connection.type || typeof connection.type !== 'string') {
                            errors.push({
                                field: `${connectionPrefix}.type`,
                                message: 'Connection must have a valid type',
                                code: 'INVALID_CONNECTION_TYPE',
                                severity: 'error'
                            });
                        }
                    });
                });
                // Check for too many connection groups
                if (connectionList.length > N8N_VALIDATION_RULES.CONSTRAINTS.MAX_CONNECTIONS_PER_OUTPUT) {
                    warnings.push({
                        field: `connections.${sourceNodeId}.${connectionType}`,
                        message: `High number of connection groups (${connectionList.length}) may impact performance`,
                        code: 'TOO_MANY_CONNECTIONS',
                        severity: 'warning'
                    });
                }
            });
        });
    }
    /**
     * Generate suggestions for workflow improvement
     */
    static generateSuggestions(workflow, suggestions) {
        // Suggest adding error handling
        const nodesWithoutErrorHandling = (workflow.nodes || []).filter((node) => !node.onError && node.type !== 'n8n-nodes-base.start');
        if (nodesWithoutErrorHandling.length > 0) {
            suggestions.push('Consider adding error handling to nodes that might fail');
        }
        // Suggest adding workflow description
        if (!workflow.meta?.description) {
            suggestions.push('Consider adding a workflow description for better documentation');
        }
        // Suggest using tags for organization
        if (!workflow.tags || workflow.tags.length === 0) {
            suggestions.push('Consider adding tags to organize your workflows');
        }
        // Suggest timeout settings for long-running workflows
        if ((workflow.nodes || []).length > 10 && !workflow.settings?.executionTimeout) {
            suggestions.push('Consider setting an execution timeout for complex workflows');
        }
    }
    /**
     * Calculate compatibility score (0-100)
     */
    static calculateCompatibilityScore(errors, warnings) {
        if (errors.length > 0)
            return 0;
        const warningPenalty = warnings.length * 5;
        return Math.max(0, 100 - warningPenalty);
    }
}
// Export validation utilities
export const validateN8nWorkflow = N8nWorkflowSchemaValidator.validateWorkflow;
export const N8N_SCHEMA_VERSION = '1.0.0';
//# sourceMappingURL=n8n-workflow-schema.js.map