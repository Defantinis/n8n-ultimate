/**
 * Connection Configuration Validator
 * Validates n8n workflow connections, data flow, and connection mapping
 */
import { NodeCompatibilityValidator, NodeCompatibilityUtils } from './node-compatibility-validator.js';
/**
 * Connection Configuration Validator Class
 */
export class ConnectionValidator {
    nodeCompatibilityValidator;
    validationRules;
    constructor(nodeCompatibilityValidator) {
        this.nodeCompatibilityValidator = nodeCompatibilityValidator || new NodeCompatibilityValidator();
        this.validationRules = this.initializeValidationRules();
    }
    /**
     * Validate all connections in a workflow
     */
    validateWorkflowConnections(workflow) {
        const allErrors = [];
        const allWarnings = [];
        // Run all validation rules
        for (const rule of this.validationRules) {
            try {
                const ruleResults = rule.validate(workflow);
                allErrors.push(...ruleResults.errors);
                allWarnings.push(...ruleResults.warnings);
            }
            catch (error) {
                allErrors.push({
                    type: 'structure',
                    message: `Validation rule '${rule.name}' failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    severity: 'error'
                });
            }
        }
        return {
            isValid: allErrors.length === 0,
            errors: allErrors,
            warnings: allWarnings
        };
    }
    /**
     * Analyze data flow in the workflow
     */
    analyzeDataFlow(workflow) {
        // Find entry points (nodes with no input connections)
        const entryPoints = this.findEntryPoints(workflow);
        // Find exit points (nodes with no output connections)
        const exitPoints = this.findExitPoints(workflow);
        // Find isolated nodes (nodes with no connections)
        const isolatedNodes = this.findIsolatedNodes(workflow);
        // Detect cycles
        const cycles = this.detectCycles(workflow);
        // Find unreachable nodes
        const unreachableNodes = this.findUnreachableNodes(workflow, entryPoints);
        // Calculate maximum depth
        const maxDepth = this.calculateMaxDepth(workflow, entryPoints);
        // Generate connection paths
        const connectionPaths = this.generateConnectionPaths(workflow, entryPoints);
        return {
            entryPoints,
            exitPoints,
            isolatedNodes,
            cycles,
            unreachableNodes,
            maxDepth,
            connectionPaths
        };
    }
    /**
     * Generate connection statistics
     */
    generateConnectionStatistics(workflow) {
        const connections = workflow.connections;
        let totalConnections = 0;
        const connectionsByType = {};
        const nodeConnectionCounts = {};
        // Initialize node connection counts
        for (const node of workflow.nodes) {
            nodeConnectionCounts[node.id] = { inputs: 0, outputs: 0 };
        }
        // Count connections
        for (const [sourceNodeId, outputs] of Object.entries(connections)) {
            for (const [outputType, connectionList] of Object.entries(outputs)) {
                for (const connection of connectionList) {
                    totalConnections++;
                    // Count by type
                    connectionsByType[outputType] = (connectionsByType[outputType] || 0) + 1;
                    // Count outputs for source node
                    if (nodeConnectionCounts[sourceNodeId]) {
                        nodeConnectionCounts[sourceNodeId].outputs++;
                    }
                    // Count inputs for target node
                    if (nodeConnectionCounts[connection.node]) {
                        nodeConnectionCounts[connection.node].inputs++;
                    }
                }
            }
        }
        // Calculate statistics
        const connectionCounts = Object.values(nodeConnectionCounts).map(c => c.inputs + c.outputs);
        const averageConnectionsPerNode = connectionCounts.length > 0
            ? connectionCounts.reduce((a, b) => a + b, 0) / connectionCounts.length
            : 0;
        const maxConnectionsPerNode = connectionCounts.length > 0 ? Math.max(...connectionCounts) : 0;
        const minConnectionsPerNode = connectionCounts.length > 0 ? Math.min(...connectionCounts) : 0;
        return {
            totalConnections,
            connectionsByType,
            nodeConnectionCounts,
            averageConnectionsPerNode,
            maxConnectionsPerNode,
            minConnectionsPerNode
        };
    }
    /**
     * Initialize validation rules
     */
    initializeValidationRules() {
        return [
            {
                name: 'connection_integrity',
                description: 'Validate that all connections reference valid nodes',
                validate: (workflow) => this.validateConnectionIntegrity(workflow)
            },
            {
                name: 'connection_mapping',
                description: 'Validate connection mapping consistency',
                validate: (workflow) => this.validateConnectionMapping(workflow)
            },
            {
                name: 'data_flow_continuity',
                description: 'Validate data flow continuity and reachability',
                validate: (workflow) => this.validateDataFlowContinuity(workflow)
            },
            {
                name: 'connection_types',
                description: 'Validate connection type compatibility',
                validate: (workflow) => this.validateConnectionTypes(workflow)
            },
            {
                name: 'circular_dependencies',
                description: 'Detect and validate circular dependencies',
                validate: (workflow) => this.validateCircularDependencies(workflow)
            },
            {
                name: 'connection_counts',
                description: 'Validate connection count limits',
                validate: (workflow) => this.validateConnectionCounts(workflow)
            },
            {
                name: 'orphaned_nodes',
                description: 'Detect orphaned and isolated nodes',
                validate: (workflow) => this.validateOrphanedNodes(workflow)
            }
        ];
    }
    /**
     * Validate connection integrity
     */
    validateConnectionIntegrity(workflow) {
        const errors = [];
        const warnings = [];
        const nodeIds = new Set(workflow.nodes.map(n => n.id));
        for (const [sourceNodeId, outputs] of Object.entries(workflow.connections)) {
            // Check if source node exists
            if (!nodeIds.has(sourceNodeId)) {
                errors.push({
                    type: 'connection',
                    message: `Connection references non-existent source node: ${sourceNodeId}`,
                    nodeId: sourceNodeId,
                    severity: 'error'
                });
                continue;
            }
            for (const output of Object.values(outputs)) {
                for (const connection of output) {
                    if (!nodeIds.has(connection.node)) {
                        errors.push({
                            type: 'connection',
                            message: `Connection references non-existent target node: ${connection.node}`,
                            nodeId: sourceNodeId,
                            severity: 'error'
                        });
                    }
                }
            }
        }
        return { errors, warnings };
    }
    /**
     * Validate connection mapping consistency
     */
    validateConnectionMapping(workflow) {
        const errors = [];
        const warnings = [];
        // Check for duplicate connections
        const connectionMap = new Map();
        for (const [sourceNodeId, outputs] of Object.entries(workflow.connections)) {
            for (const [outputType, connectionList] of Object.entries(outputs)) {
                for (const connection of connectionList) {
                    const connectionKey = `${sourceNodeId}->${connection.node}:${outputType}->${connection.type}:${connection.index}`;
                    if (connectionMap.has(connectionKey)) {
                        connectionMap.set(connectionKey, connectionMap.get(connectionKey) + 1);
                    }
                    else {
                        connectionMap.set(connectionKey, 1);
                    }
                }
            }
        }
        // Report duplicate connections
        for (const [connectionKey, count] of Array.from(connectionMap.entries())) {
            if (count > 1) {
                const [source, target] = connectionKey.split('->');
                warnings.push({
                    type: 'connection',
                    message: `Duplicate connection detected: ${connectionKey} (${count} instances)`,
                    nodeId: source,
                });
            }
        }
        return { errors, warnings };
    }
    /**
     * Validate data flow continuity
     */
    validateDataFlowContinuity(workflow) {
        const errors = [];
        const warnings = [];
        const analysis = this.analyzeDataFlow(workflow);
        // Check for unreachable nodes
        if (analysis.unreachableNodes.length > 0) {
            for (const nodeId of analysis.unreachableNodes) {
                warnings.push({
                    type: 'node',
                    message: `Node ${nodeId} is unreachable from entry points`,
                    nodeId: nodeId,
                });
            }
        }
        // Check for isolated nodes
        if (analysis.isolatedNodes.length > 0) {
            for (const nodeId of analysis.isolatedNodes) {
                warnings.push({
                    type: 'node',
                    message: `Node ${nodeId} is isolated (no connections)`,
                    nodeId: nodeId,
                });
            }
        }
        // Check for missing entry points
        if (analysis.entryPoints.length === 0 && workflow.nodes.length > 0) {
            errors.push({
                type: 'workflow',
                message: 'Workflow has no entry points (trigger nodes)',
                severity: 'error'
            });
        }
        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
    /**
     * Validate connection types
     */
    validateConnectionTypes(workflow) {
        const errors = [];
        const warnings = [];
        for (const [sourceNodeId, outputs] of Object.entries(workflow.connections)) {
            const sourceNode = workflow.nodes.find(n => n.id === sourceNodeId);
            if (!sourceNode)
                continue;
            for (const [outputType, connectionList] of Object.entries(outputs)) {
                for (const connection of connectionList) {
                    const targetNode = workflow.nodes.find(n => n.id === connection.node);
                    if (!targetNode)
                        continue;
                    const canConnect = NodeCompatibilityUtils.canConnect(sourceNode.type, targetNode.type, outputType, connection.type);
                    if (!canConnect) {
                        errors.push({
                            type: 'connection',
                            message: `Incompatible connection from ${sourceNode.type} (${sourceNodeId}) to ${targetNode.type} (${connection.node}): ${outputType} -> ${connection.type}`,
                            nodeId: sourceNodeId,
                            severity: 'error'
                        });
                    }
                }
            }
        }
        return { errors, warnings };
    }
    /**
     * Validate circular dependencies
     */
    validateCircularDependencies(workflow) {
        const errors = [];
        const warnings = [];
        const cycles = this.detectCycles(workflow);
        for (const cycle of cycles) {
            errors.push({
                type: 'cycle',
                message: `Circular dependency detected: ${cycle.join(' -> ')} -> ${cycle[0]}`,
                severity: 'error'
            });
        }
        return { errors, warnings };
    }
    /**
     * Validate connection counts
     */
    validateConnectionCounts(workflow) {
        const errors = [];
        const warnings = [];
        // Use node compatibility validator
        const nodeValidator = new NodeCompatibilityValidator();
        const nodeResults = nodeValidator.validateWorkflowNodeCompatibility(workflow);
        const nodeErrors = nodeResults.errors.filter(e => e.type === 'connection');
        errors.push(...nodeErrors);
        return { errors, warnings };
    }
    /**
     * Validate orphaned nodes
     */
    validateOrphanedNodes(workflow) {
        const errors = [];
        const warnings = [];
        const analysis = this.analyzeDataFlow(workflow);
        // Report isolated nodes as validation issues
        for (const nodeId of analysis.isolatedNodes) {
            warnings.push({
                type: 'node',
                message: `Node ${nodeId} is orphaned (no input or output connections)`,
                nodeId: nodeId,
            });
        }
        return { errors, warnings };
    }
    /**
     * Find entry points (nodes with no input connections)
     */
    findEntryPoints(workflow) {
        const nodeIds = new Set(workflow.nodes.map(n => n.id));
        const nodesWithInputs = new Set();
        // Find all nodes that have input connections
        for (const outputs of Object.values(workflow.connections)) {
            for (const connectionList of Object.values(outputs)) {
                for (const connection of connectionList) {
                    nodesWithInputs.add(connection.node);
                }
            }
        }
        // Return nodes without input connections
        return Array.from(nodeIds).filter(id => !nodesWithInputs.has(id));
    }
    /**
     * Find exit points (nodes with no output connections)
     */
    findExitPoints(workflow) {
        const nodeIds = new Set(workflow.nodes.map(n => n.id));
        const nodesWithOutputs = new Set(Object.keys(workflow.connections));
        // Return nodes without output connections
        return Array.from(nodeIds).filter(id => !nodesWithOutputs.has(id));
    }
    /**
     * Find isolated nodes (nodes with no connections at all)
     */
    findIsolatedNodes(workflow) {
        const entryPoints = this.findEntryPoints(workflow);
        const exitPoints = this.findExitPoints(workflow);
        // Isolated nodes are both entry and exit points
        return entryPoints.filter(id => exitPoints.includes(id));
    }
    /**
     * Detect cycles using DFS
     */
    detectCycles(workflow) {
        const visited = new Set();
        const recursionStack = new Set();
        const cycles = [];
        const dfs = (nodeId, path) => {
            if (recursionStack.has(nodeId)) {
                // Found a cycle
                const cycleStart = path.indexOf(nodeId);
                if (cycleStart !== -1) {
                    cycles.push(path.slice(cycleStart));
                }
                return;
            }
            if (visited.has(nodeId)) {
                return;
            }
            visited.add(nodeId);
            recursionStack.add(nodeId);
            // Visit connected nodes
            if (workflow.connections[nodeId]) {
                for (const outputs of Object.values(workflow.connections[nodeId])) {
                    for (const connection of outputs) {
                        dfs(connection.node, [...path, nodeId]);
                    }
                }
            }
            recursionStack.delete(nodeId);
        };
        // Start DFS from all nodes
        for (const node of workflow.nodes) {
            if (!visited.has(node.id)) {
                dfs(node.id, []);
            }
        }
        return cycles;
    }
    /**
     * Find unreachable nodes from entry points
     */
    findUnreachableNodes(workflow, entryPoints) {
        const reachable = new Set();
        const visited = new Set();
        const dfs = (nodeId) => {
            if (visited.has(nodeId))
                return;
            visited.add(nodeId);
            reachable.add(nodeId);
            if (workflow.connections[nodeId]) {
                for (const outputs of Object.values(workflow.connections[nodeId])) {
                    for (const connection of outputs) {
                        dfs(connection.node);
                    }
                }
            }
        };
        // Start from all entry points
        for (const entryPoint of entryPoints) {
            dfs(entryPoint);
        }
        // Return nodes not reachable from entry points
        return workflow.nodes
            .map(n => n.id)
            .filter(id => !reachable.has(id));
    }
    /**
     * Calculate maximum depth from entry points
     */
    calculateMaxDepth(workflow, entryPoints) {
        const depths = new Map();
        let maxDepth = 0;
        const dfs = (nodeId, depth) => {
            if (depths.has(nodeId) && depths.get(nodeId) >= depth) {
                return; // Already visited with greater or equal depth
            }
            depths.set(nodeId, depth);
            maxDepth = Math.max(maxDepth, depth);
            if (workflow.connections[nodeId]) {
                for (const outputs of Object.values(workflow.connections[nodeId])) {
                    for (const connection of outputs) {
                        dfs(connection.node, depth + 1);
                    }
                }
            }
        };
        // Start from all entry points
        for (const entryPoint of entryPoints) {
            dfs(entryPoint, 0);
        }
        return maxDepth;
    }
    /**
     * Generate connection paths from entry points
     */
    generateConnectionPaths(workflow, entryPoints) {
        const paths = [];
        const dfs = (nodeId, currentPath) => {
            const newPath = [...currentPath, nodeId];
            // Check if this is an end point (no outputs)
            if (!workflow.connections[nodeId] || Object.keys(workflow.connections[nodeId]).length === 0) {
                paths.push({
                    path: newPath,
                    length: newPath.length,
                    hasErrors: false,
                    errorMessages: []
                });
                return;
            }
            // Continue to connected nodes
            if (workflow.connections[nodeId]) {
                for (const outputs of Object.values(workflow.connections[nodeId])) {
                    for (const connection of outputs) {
                        // Avoid infinite loops
                        if (!currentPath.includes(connection.node)) {
                            dfs(connection.node, newPath);
                        }
                    }
                }
            }
        };
        // Generate paths from all entry points
        for (const entryPoint of entryPoints) {
            dfs(entryPoint, []);
        }
        return paths;
    }
    /**
     * Add custom validation rule
     */
    addValidationRule(rule) {
        this.validationRules.push(rule);
    }
    /**
     * Remove validation rule by name
     */
    removeValidationRule(ruleName) {
        const index = this.validationRules.findIndex(rule => rule.name === ruleName);
        if (index !== -1) {
            this.validationRules.splice(index, 1);
            return true;
        }
        return false;
    }
    /**
     * Get available validation rules
     */
    getValidationRules() {
        return [...this.validationRules];
    }
}
/**
 * Utility functions for connection validation
 */
export const ConnectionValidatorUtils = {
    /**
     * Check if two nodes are connected
     */
    areNodesConnected(workflow, sourceId, targetId) {
        if (!workflow.connections[sourceId])
            return false;
        for (const outputs of Object.values(workflow.connections[sourceId])) {
            for (const connection of outputs) {
                if (connection.node === targetId)
                    return true;
            }
        }
        return false;
    },
    /**
     * Get all connections for a node
     */
    getNodeConnections(workflow, nodeId) {
        const inputs = [];
        const outputs = [];
        // Find inputs (connections TO this node)
        for (const [sourceNodeId, nodeOutputs] of Object.entries(workflow.connections)) {
            for (const [outputType, connectionList] of Object.entries(nodeOutputs)) {
                for (const connection of connectionList) {
                    if (connection.node === nodeId) {
                        inputs.push({
                            sourceNode: sourceNodeId,
                            outputType: outputType,
                            inputType: connection.type,
                            index: connection.index
                        });
                    }
                }
            }
        }
        // Find outputs (connections FROM this node)
        if (workflow.connections[nodeId]) {
            for (const [outputType, connectionList] of Object.entries(workflow.connections[nodeId])) {
                for (const connection of connectionList) {
                    outputs.push({
                        targetNode: connection.node,
                        outputType: outputType,
                        inputType: connection.type,
                        index: connection.index
                    });
                }
            }
        }
        return { inputs, outputs };
    },
    /**
     * Check if workflow has cycles
     */
    hasCycles(workflow) {
        const validator = new ConnectionValidator();
        const cycles = validator.detectCycles(workflow);
        return cycles.length > 0;
    },
    /**
     * Get shortest path between two nodes
     */
    getShortestPath(workflow, sourceId, targetId) {
        const visited = new Set();
        const queue = [{ nodeId: sourceId, path: [sourceId] }];
        while (queue.length > 0) {
            const { nodeId, path } = queue.shift();
            if (nodeId === targetId) {
                return path;
            }
            if (visited.has(nodeId))
                continue;
            visited.add(nodeId);
            if (workflow.connections[nodeId]) {
                for (const outputs of Object.values(workflow.connections[nodeId])) {
                    for (const connection of outputs) {
                        if (!visited.has(connection.node)) {
                            queue.push({
                                nodeId: connection.node,
                                path: [...path, connection.node]
                            });
                        }
                    }
                }
            }
        }
        return null; // No path found
    }
};
//# sourceMappingURL=connection-validator.js.map