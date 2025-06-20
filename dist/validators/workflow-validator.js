import { validateN8nWorkflow } from './n8n-workflow-schema.js';
/**
 * Validates n8n workflow structure and identifies issues
 */
export class WorkflowValidator {
    /**
     * Validate a complete workflow (legacy method)
     */
    async validate(workflow) {
        const errors = [];
        const warnings = [];
        // Validate basic structure
        this.validateBasicStructure(workflow, errors);
        // Validate nodes
        this.validateNodes(workflow, errors, warnings);
        // Validate connections
        this.validateConnections(workflow, errors, warnings);
        // Validate workflow settings
        this.validateSettings(workflow, errors, warnings);
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Enhanced validation using official n8n schema patterns
     */
    async validateWithN8nSchema(workflow) {
        // Run both validations
        const n8nValidation = validateN8nWorkflow(workflow);
        const legacyValidation = await this.validate(workflow);
        return {
            ...n8nValidation,
            legacyValidation
        };
    }
    /**
     * Quick validation check using n8n official patterns
     */
    static validateQuick(workflow) {
        return validateN8nWorkflow(workflow);
    }
    /**
     * Validate basic workflow structure
     */
    validateBasicStructure(workflow, errors) {
        if (!workflow.name || typeof workflow.name !== 'string') {
            errors.push({
                type: 'structure',
                message: 'Workflow must have a valid name',
                severity: 'error'
            });
        }
        if (!Array.isArray(workflow.nodes)) {
            errors.push({
                type: 'structure',
                message: 'Workflow must have a nodes array',
                severity: 'error'
            });
        }
        if (!workflow.connections || typeof workflow.connections !== 'object') {
            errors.push({
                type: 'structure',
                message: 'Workflow must have a connections object',
                severity: 'error'
            });
        }
        if (typeof workflow.active !== 'boolean') {
            errors.push({
                type: 'structure',
                message: 'Workflow active status must be a boolean',
                severity: 'error'
            });
        }
        if (!workflow.id || typeof workflow.id !== 'string') {
            errors.push({
                type: 'structure',
                message: 'Workflow must have a valid ID',
                severity: 'error'
            });
        }
    }
    /**
     * Validate individual nodes
     */
    validateNodes(workflow, errors, warnings) {
        if (!Array.isArray(workflow.nodes)) {
            return; // Already handled in basic structure validation
        }
        const nodeNames = new Set();
        const nodeIds = new Set();
        for (const node of workflow.nodes) {
            // Check for duplicate names
            if (nodeNames.has(node.name)) {
                errors.push({
                    type: 'node',
                    message: `Duplicate node name: ${node.name}`,
                    nodeId: node.id,
                    severity: 'error'
                });
            }
            nodeNames.add(node.name);
            // Check for duplicate IDs
            if (nodeIds.has(node.id)) {
                errors.push({
                    type: 'node',
                    message: `Duplicate node ID: ${node.id}`,
                    nodeId: node.id,
                    severity: 'error'
                });
            }
            nodeIds.add(node.id);
            // Validate individual node
            this.validateNode(node, errors, warnings);
        }
        // Check for isolated nodes (no connections)
        this.checkForIsolatedNodes(workflow, warnings);
    }
    /**
     * Validate a single node
     */
    validateNode(node, errors, warnings) {
        // Required fields
        if (!node.name || typeof node.name !== 'string') {
            errors.push({
                type: 'node',
                message: 'Node must have a valid name',
                nodeId: node.id,
                severity: 'error'
            });
        }
        if (!node.type || typeof node.type !== 'string') {
            errors.push({
                type: 'node',
                message: 'Node must have a valid type',
                nodeId: node.id,
                severity: 'error'
            });
        }
        if (!node.id || typeof node.id !== 'string') {
            errors.push({
                type: 'node',
                message: 'Node must have a valid ID',
                nodeId: node.id,
                severity: 'error'
            });
        }
        // Validate UUID format for ID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (node.id && !uuidRegex.test(node.id)) {
            warnings.push({
                type: 'compatibility',
                message: 'Node ID should be a valid UUID',
                nodeId: node.id,
                suggestion: 'Use a proper UUID generator for node IDs'
            });
        }
        // Validate position
        if (!Array.isArray(node.position) || node.position.length !== 2) {
            errors.push({
                type: 'node',
                message: 'Node position must be an array of two numbers [x, y]',
                nodeId: node.id,
                severity: 'error'
            });
        }
        else {
            if (typeof node.position[0] !== 'number' || typeof node.position[1] !== 'number') {
                errors.push({
                    type: 'node',
                    message: 'Node position coordinates must be numbers',
                    nodeId: node.id,
                    severity: 'error'
                });
            }
        }
        // Validate type version
        if (typeof node.typeVersion !== 'number' || node.typeVersion < 1) {
            errors.push({
                type: 'node',
                message: 'Node typeVersion must be a positive number',
                nodeId: node.id,
                severity: 'error'
            });
        }
        // Validate parameters
        if (node.parameters && typeof node.parameters !== 'object') {
            errors.push({
                type: 'node',
                message: 'Node parameters must be an object',
                nodeId: node.id,
                severity: 'error'
            });
        }
        // Type-specific validations
        this.validateNodeByType(node, errors, warnings);
    }
    /**
     * Validate node based on its type
     */
    validateNodeByType(node, errors, warnings) {
        switch (node.type) {
            case 'n8n-nodes-base.httpRequest':
                this.validateHttpRequestNode(node, errors, warnings);
                break;
            case 'n8n-nodes-base.code':
                this.validateCodeNode(node, errors, warnings);
                break;
            case 'n8n-nodes-base.start':
                this.validateStartNode(node, errors, warnings);
                break;
            // Add more node type validations as needed
            default:
                // Generic validation for unknown node types
                if (!node.type.includes('.')) {
                    warnings.push({
                        type: 'compatibility',
                        message: 'Node type should follow the format "package.nodeName"',
                        nodeId: node.id,
                        suggestion: 'Use proper node type naming convention'
                    });
                }
        }
    }
    /**
     * Validate HTTP Request node
     */
    validateHttpRequestNode(node, errors, _warnings) {
        const params = node.parameters;
        if (!params.url) {
            errors.push({
                type: 'parameter',
                message: 'HTTP Request node must have a URL parameter',
                nodeId: node.id,
                field: 'url',
                severity: 'error'
            });
        }
        if (params.method && !['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'].includes(params.method)) {
            errors.push({
                type: 'parameter',
                message: 'Invalid HTTP method',
                nodeId: node.id,
                field: 'method',
                severity: 'error'
            });
        }
    }
    /**
     * Validate Code node
     */
    validateCodeNode(node, errors, _warnings) {
        const params = node.parameters;
        if (!params.jsCode) {
            errors.push({
                type: 'parameter',
                message: 'Code node must have JavaScript code',
                nodeId: node.id,
                field: 'jsCode',
                severity: 'error'
            });
        }
        if (params.mode && !['runOnceForAllItems', 'runOnceForEachItem'].includes(params.mode)) {
            errors.push({
                type: 'parameter',
                message: 'Invalid code execution mode',
                nodeId: node.id,
                field: 'mode',
                severity: 'error'
            });
        }
    }
    /**
     * Validate Start node
     */
    validateStartNode(node, _errors, warnings) {
        // Start nodes typically don't need parameters, but check for common issues
        if (Object.keys(node.parameters).length > 0) {
            warnings.push({
                type: 'best-practice',
                message: 'Start node typically should not have parameters',
                nodeId: node.id,
                suggestion: 'Consider if parameters are necessary for the start node'
            });
        }
    }
    /**
     * Validate workflow connections
     */
    validateConnections(workflow, errors, _warnings) {
        const nodeNames = new Set(workflow.nodes.map(node => node.name));
        for (const [sourceNodeName, nodeConnections] of Object.entries(workflow.connections)) {
            // Check if source node exists
            if (!nodeNames.has(sourceNodeName)) {
                errors.push({
                    type: 'connection',
                    message: `Connection references non-existent source node: ${sourceNodeName}`,
                    severity: 'error'
                });
                continue;
            }
            for (const [_outputType, outputConnections] of Object.entries(nodeConnections)) {
                for (const connectionArray of outputConnections) {
                    for (const connection of connectionArray) {
                        // Check if target node exists
                        if (!nodeNames.has(connection.node)) {
                            errors.push({
                                type: 'connection',
                                message: `Connection references non-existent target node: ${connection.node}`,
                                severity: 'error'
                            });
                        }
                        // Validate connection structure
                        if (typeof connection.type !== 'string') {
                            errors.push({
                                type: 'connection',
                                message: 'Connection must have a valid type',
                                severity: 'error'
                            });
                        }
                        if (typeof connection.index !== 'number' || connection.index < 0) {
                            errors.push({
                                type: 'connection',
                                message: 'Connection index must be a non-negative number',
                                severity: 'error'
                            });
                        }
                    }
                }
            }
        }
    }
    /**
     * Check for nodes with no connections (isolated nodes)
     */
    checkForIsolatedNodes(workflow, warnings) {
        const connectedNodes = new Set();
        // Collect all connected nodes
        Object.entries(workflow.connections).forEach(([sourceNode, connections]) => {
            connectedNodes.add(sourceNode);
            Object.values(connections).forEach(outputConnections => {
                outputConnections.forEach(connectionArray => {
                    connectionArray.forEach(connection => {
                        connectedNodes.add(connection.node);
                    });
                });
            });
        });
        // Find isolated nodes
        workflow.nodes.forEach(node => {
            if (!connectedNodes.has(node.name) && node.type !== 'n8n-nodes-base.start') {
                warnings.push({
                    type: 'best-practice',
                    message: 'Node is not connected to any other nodes',
                    nodeId: node.id,
                    suggestion: 'Consider connecting this node or removing it if not needed'
                });
            }
        });
    }
    /**
     * Validate workflow settings
     */
    validateSettings(workflow, errors, warnings) {
        if (!workflow.settings) {
            warnings.push({
                type: 'best-practice',
                message: 'Workflow should have settings defined',
                suggestion: 'Add workflow settings for better control'
            });
            return;
        }
        const settings = workflow.settings;
        if (settings.executionOrder && !['v0', 'v1'].includes(settings.executionOrder)) {
            errors.push({
                type: 'structure',
                message: 'Invalid execution order setting',
                severity: 'error'
            });
        }
        if (settings.executionTimeout && (typeof settings.executionTimeout !== 'number' || settings.executionTimeout < 0)) {
            errors.push({
                type: 'structure',
                message: 'Execution timeout must be a positive number',
                severity: 'error'
            });
        }
    }
}
//# sourceMappingURL=workflow-validator.js.map