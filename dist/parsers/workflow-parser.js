import { readFileSync, existsSync } from 'fs';
/**
 * Main workflow parser for n8n JSON files
 */
export class WorkflowParser {
    constructor() {
        // No validator needed in the parser
    }
    /**
     * Parse a workflow from a JSON file
     */
    async parseFromFile(filePath) {
        if (!existsSync(filePath)) {
            throw new Error(`Workflow file not found: ${filePath}`);
        }
        try {
            const content = readFileSync(filePath, 'utf-8');
            return this.parseFromString(content);
        }
        catch (error) {
            throw new Error(`Failed to read workflow file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Parse a workflow from a JSON string
     */
    async parseFromString(jsonContent) {
        try {
            const workflow = JSON.parse(jsonContent);
            return this.parseWorkflow(workflow);
        }
        catch (error) {
            throw new Error(`Failed to parse workflow JSON: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Parse a workflow object
     */
    async parseWorkflow(workflow) {
        // Analyze the workflow metadata
        const metadata = this.analyzeWorkflowMetadata(workflow);
        return {
            workflow,
            metadata,
        };
    }
    /**
     * Analyze workflow metadata and complexity
     */
    analyzeWorkflowMetadata(workflow) {
        const nodeCount = workflow.nodes.length;
        const nodeTypes = [...new Set(workflow.nodes.map(node => node.type))];
        // Count connections
        let connectionCount = 0;
        Object.values(workflow.connections).forEach(nodeConnections => {
            Object.values(nodeConnections).forEach(outputConnections => {
                connectionCount += outputConnections.length;
            });
        });
        // Detect loops in the workflow
        const hasLoops = this.detectLoops(workflow);
        // Calculate maximum depth
        const maxDepth = this.calculateMaxDepth(workflow);
        // Estimate complexity
        const estimatedComplexity = this.estimateComplexity(workflow, nodeCount, connectionCount, hasLoops, maxDepth);
        return {
            nodeCount,
            connectionCount,
            nodeTypes,
            hasLoops,
            maxDepth,
            estimatedComplexity
        };
    }
    /**
     * Detect if the workflow has loops
     */
    detectLoops(workflow) {
        const visited = new Set();
        const recursionStack = new Set();
        const hasLoop = (nodeName) => {
            if (recursionStack.has(nodeName)) {
                return true;
            }
            if (visited.has(nodeName)) {
                return false;
            }
            visited.add(nodeName);
            recursionStack.add(nodeName);
            const connections = workflow.connections[nodeName];
            if (connections) {
                for (const outputType of Object.keys(connections)) {
                    const outputConnections = connections[outputType];
                    for (const connection of outputConnections) {
                        if (hasLoop(connection.node)) {
                            return true;
                        }
                    }
                }
            }
            recursionStack.delete(nodeName);
            return false;
        };
        // Check each node as a potential starting point
        for (const node of workflow.nodes) {
            if (!visited.has(node.name) && hasLoop(node.name)) {
                return true;
            }
        }
        return false;
    }
    /**
     * Calculate the maximum depth of the workflow
     */
    calculateMaxDepth(workflow) {
        const nodeMap = new Map();
        workflow.nodes.forEach(node => nodeMap.set(node.name, node));
        const calculateDepth = (nodeName, visited = new Set()) => {
            if (visited.has(nodeName)) {
                return 0; // Avoid infinite loops
            }
            visited.add(nodeName);
            let maxChildDepth = 0;
            const connections = workflow.connections[nodeName];
            if (connections) {
                for (const outputType of Object.keys(connections)) {
                    const outputConnections = connections[outputType];
                    for (const connection of outputConnections) {
                        const childDepth = calculateDepth(connection.node, new Set(visited));
                        maxChildDepth = Math.max(maxChildDepth, childDepth);
                    }
                }
            }
            return maxChildDepth + 1;
        };
        // Find start nodes (nodes with no incoming connections)
        const hasIncomingConnection = new Set();
        Object.values(workflow.connections).forEach(nodeConnections => {
            Object.values(nodeConnections).forEach(outputConnections => {
                outputConnections.forEach(connection => {
                    hasIncomingConnection.add(connection.node);
                });
            });
        });
        const startNodes = workflow.nodes.filter(node => !hasIncomingConnection.has(node.name));
        if (startNodes.length === 0) {
            // If no clear start nodes, use the first node
            return workflow.nodes.length > 0 ? calculateDepth(workflow.nodes[0].name) : 0;
        }
        // Calculate depth from each start node and return the maximum
        return Math.max(...startNodes.map(node => calculateDepth(node.name)));
    }
    /**
     * Estimate workflow complexity on a scale of 1-10
     */
    estimateComplexity(workflow, nodeCount, connectionCount, hasLoops, maxDepth) {
        let complexity = 1;
        // Base complexity from node count
        if (nodeCount <= 5)
            complexity += 1;
        else if (nodeCount <= 10)
            complexity += 2;
        else if (nodeCount <= 20)
            complexity += 3;
        else
            complexity += 4;
        // Connection complexity
        const avgConnectionsPerNode = nodeCount > 0 ? connectionCount / nodeCount : 0;
        if (avgConnectionsPerNode > 2)
            complexity += 1;
        if (avgConnectionsPerNode > 3)
            complexity += 1;
        // Loop complexity
        if (hasLoops)
            complexity += 2;
        // Depth complexity
        if (maxDepth > 5)
            complexity += 1;
        if (maxDepth > 10)
            complexity += 1;
        // Node type complexity
        const complexNodeTypes = ['n8n-nodes-base.code', 'n8n-nodes-base.function', 'n8n-nodes-base.httpRequest'];
        const complexNodes = workflow.nodes.filter(node => complexNodeTypes.includes(node.type));
        if (complexNodes.length > 0)
            complexity += Math.min(2, complexNodes.length);
        return Math.min(10, complexity);
    }
    /**
     * Extract specific node by name
     */
    getNodeByName(workflow, nodeName) {
        return workflow.nodes.find(node => node.name === nodeName);
    }
    /**
     * Extract nodes by type
     */
    getNodesByType(workflow, nodeType) {
        return workflow.nodes.filter(node => node.type === nodeType);
    }
    /**
     * Get all connections for a specific node
     */
    getNodeConnections(workflow, nodeName) {
        return workflow.connections[nodeName] || {};
    }
    /**
     * Get all nodes that connect to a specific node's input
     */
    getIncomingConnections(workflow, targetNodeName) {
        const incoming = [];
        Object.entries(workflow.connections).forEach(([sourceNode, nodeConnections]) => {
            Object.entries(nodeConnections).forEach(([outputType, outputConnections]) => {
                outputConnections.forEach((connection, outputIndex) => {
                    if (connection.node === targetNodeName) {
                        incoming.push({
                            sourceNode,
                            outputType,
                            outputIndex, // This is the index in the array, might not match n8n's internal index
                            inputIndex: connection.index
                        });
                    }
                });
            });
        });
        return incoming;
    }
    /**
     * Generate a human-readable summary of the workflow
     */
    generateSummary(parsedWorkflow) {
        const { workflow, metadata } = parsedWorkflow;
        let summary = `Workflow Summary: "${workflow.name}" (ID: ${workflow.id})\n`;
        summary += ` - Status: ${workflow.active ? 'Active' : 'Inactive'}\n`;
        summary += ` - Nodes: ${metadata.nodeCount}\n`;
        summary += ` - Connections: ${metadata.connectionCount}\n`;
        summary += ` - Node Types: ${metadata.nodeTypes.join(', ')}\n`;
        summary += ` - Complexity: ${metadata.estimatedComplexity}/10\n`;
        summary += ` - Max Depth: ${metadata.maxDepth}\n`;
        summary += ` - Contains Loops: ${metadata.hasLoops ? 'Yes' : 'No'}\n`;
        return summary;
    }
}
//# sourceMappingURL=workflow-parser.js.map