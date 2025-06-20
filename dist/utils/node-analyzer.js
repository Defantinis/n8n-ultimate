/**
 * Utility class for analyzing n8n nodes and their relationships
 */
export class NodeAnalyzer {
    /**
     * Analyze a node and extract key information
     */
    analyzeNode(node) {
        return {
            id: node.id,
            name: node.name,
            type: node.type,
            category: this.getNodeCategory(node.type),
            complexity: this.calculateNodeComplexity(node),
            hasCustomCode: this.hasCustomCode(node),
            isAsync: this.isAsyncNode(node),
            canFail: this.canNodeFail(node),
            parameterCount: Object.keys(node.parameters).length,
            description: this.generateNodeDescription(node)
        };
    }
    /**
     * Get the category of a node based on its type
     */
    getNodeCategory(nodeType) {
        if (nodeType.includes('start') || nodeType.includes('trigger')) {
            return 'trigger';
        }
        if (nodeType.includes('http') || nodeType.includes('webhook') || nodeType.includes('api')) {
            return 'communication';
        }
        if (nodeType.includes('code') || nodeType.includes('function') || nodeType.includes('javascript')) {
            return 'logic';
        }
        if (nodeType.includes('extract') || nodeType.includes('parse') || nodeType.includes('transform')) {
            return 'data-processing';
        }
        if (nodeType.includes('file') || nodeType.includes('storage') || nodeType.includes('database')) {
            return 'storage';
        }
        if (nodeType.includes('email') || nodeType.includes('slack') || nodeType.includes('notification')) {
            return 'notification';
        }
        if (nodeType.includes('condition') || nodeType.includes('if') || nodeType.includes('switch')) {
            return 'control-flow';
        }
        return 'utility';
    }
    /**
     * Calculate the complexity of a node (1-10 scale)
     */
    calculateNodeComplexity(node) {
        let complexity = 1;
        // Base complexity by type
        const typeComplexity = {
            'n8n-nodes-base.start': 1,
            'n8n-nodes-base.httpRequest': 3,
            'n8n-nodes-base.code': 5,
            'n8n-nodes-base.function': 5,
            'n8n-nodes-base.htmlExtract': 2,
            'n8n-nodes-base.writeBinaryFile': 2,
            'n8n-nodes-base.if': 3,
            'n8n-nodes-base.switch': 4,
            'n8n-nodes-base.merge': 3,
            'n8n-nodes-base.set': 2
        };
        complexity = typeComplexity[node.type] || 2;
        // Add complexity based on parameters
        const paramCount = Object.keys(node.parameters).length;
        if (paramCount > 5)
            complexity += 1;
        if (paramCount > 10)
            complexity += 1;
        // Add complexity for custom code
        if (this.hasCustomCode(node)) {
            const codeLength = this.getCodeLength(node);
            if (codeLength > 100)
                complexity += 1;
            if (codeLength > 500)
                complexity += 1;
        }
        // Add complexity for expressions
        const expressionCount = this.countExpressions(node);
        if (expressionCount > 2)
            complexity += 1;
        if (expressionCount > 5)
            complexity += 1;
        return Math.min(10, complexity);
    }
    /**
     * Check if a node contains custom code
     */
    hasCustomCode(node) {
        if (node.type.includes('code') || node.type.includes('function')) {
            return true;
        }
        // Check for code in parameters
        const codeFields = ['jsCode', 'code', 'script', 'expression'];
        return codeFields.some(field => node.parameters[field]);
    }
    /**
     * Check if a node is asynchronous
     */
    isAsyncNode(node) {
        const asyncTypes = [
            'n8n-nodes-base.httpRequest',
            'n8n-nodes-base.webhook',
            'n8n-nodes-base.wait',
            'n8n-nodes-base.delay'
        ];
        return asyncTypes.includes(node.type) || node.type.includes('api');
    }
    /**
     * Check if a node can fail during execution
     */
    canNodeFail(node) {
        const failableTypes = [
            'n8n-nodes-base.httpRequest',
            'n8n-nodes-base.code',
            'n8n-nodes-base.function',
            'n8n-nodes-base.webhook'
        ];
        return failableTypes.includes(node.type) ||
            node.continueOnFail === true ||
            node.retryOnFail === true;
    }
    /**
     * Get the length of custom code in a node
     */
    getCodeLength(node) {
        const codeFields = ['jsCode', 'code', 'script'];
        let totalLength = 0;
        for (const field of codeFields) {
            if (node.parameters[field] && typeof node.parameters[field] === 'string') {
                totalLength += node.parameters[field].length;
            }
        }
        return totalLength;
    }
    /**
     * Count the number of expressions in a node
     */
    countExpressions(node) {
        let count = 0;
        const params = JSON.stringify(node.parameters);
        // Count n8n expressions ({{ ... }})
        const expressionMatches = params.match(/\{\{[^}]+\}\}/g);
        if (expressionMatches) {
            count += expressionMatches.length;
        }
        return count;
    }
    /**
     * Generate a human-readable description of what the node does
     */
    generateNodeDescription(node) {
        switch (node.type) {
            case 'n8n-nodes-base.start':
                return 'Triggers the workflow execution';
            case 'n8n-nodes-base.httpRequest':
                const method = node.parameters.method || 'GET';
                const url = node.parameters.url || 'unknown URL';
                return `Makes ${method} request to ${url}`;
            case 'n8n-nodes-base.code':
                const mode = node.parameters.mode || 'runOnceForAllItems';
                return `Executes JavaScript code (${mode})`;
            case 'n8n-nodes-base.htmlExtract':
                const extractCount = node.parameters.extractionValues?.length || 0;
                return `Extracts ${extractCount} value(s) from HTML`;
            case 'n8n-nodes-base.writeBinaryFile':
                const fileName = node.parameters.fileName || 'file';
                return `Writes binary data to ${fileName}`;
            case 'n8n-nodes-base.if':
                return 'Conditional branching based on data';
            case 'n8n-nodes-base.set':
                return 'Sets or modifies data values';
            default:
                return `${node.type.split('.').pop()} node`;
        }
    }
    /**
     * Analyze relationships between nodes in a workflow
     */
    analyzeNodeRelationships(workflow) {
        const relationships = [];
        const nodeInfluence = new Map();
        // Initialize influence scores
        workflow.nodes.forEach(node => nodeInfluence.set(node.name, 0));
        // Analyze connections
        Object.entries(workflow.connections).forEach(([sourceNode, connections]) => {
            Object.entries(connections).forEach(([_outputType, outputConnections]) => {
                outputConnections.forEach((connectionArray, outputIndex) => {
                    connectionArray.forEach(connection => {
                        relationships.push({
                            source: sourceNode,
                            target: connection.node,
                            type: connection.type,
                            outputIndex,
                            inputIndex: connection.index,
                            strength: this.calculateConnectionStrength(workflow, sourceNode, connection.node)
                        });
                        // Increase influence score for target node
                        const currentInfluence = nodeInfluence.get(connection.node) || 0;
                        nodeInfluence.set(connection.node, currentInfluence + 1);
                    });
                });
            });
        });
        // Find critical nodes (high influence)
        const criticalNodes = Array.from(nodeInfluence.entries())
            .filter(([_, influence]) => influence > 2)
            .map(([nodeName, influence]) => ({ nodeName, influence }))
            .sort((a, b) => b.influence - a.influence);
        return {
            relationships,
            criticalNodes,
            totalConnections: relationships.length,
            averageInfluence: Array.from(nodeInfluence.values()).reduce((a, b) => a + b, 0) / nodeInfluence.size
        };
    }
    /**
     * Calculate the strength of a connection between two nodes
     */
    calculateConnectionStrength(workflow, sourceNode, targetNode) {
        // Base strength
        let strength = 1;
        // Find the actual nodes
        const source = workflow.nodes.find(n => n.name === sourceNode);
        const target = workflow.nodes.find(n => n.name === targetNode);
        if (!source || !target)
            return strength;
        // Increase strength for critical node types
        if (source.type.includes('start') || source.type.includes('trigger')) {
            strength += 2;
        }
        if (target.type.includes('code') || target.type.includes('function')) {
            strength += 1;
        }
        // Increase strength for nodes that can fail
        if (this.canNodeFail(source) || this.canNodeFail(target)) {
            strength += 1;
        }
        return Math.min(5, strength);
    }
    /**
     * Find potential bottlenecks in the workflow
     */
    findBottlenecks(workflow) {
        const bottlenecks = [];
        const relationships = this.analyzeNodeRelationships(workflow);
        // Find nodes with many incoming connections
        const incomingCounts = new Map();
        relationships.relationships.forEach(rel => {
            const count = incomingCounts.get(rel.target) || 0;
            incomingCounts.set(rel.target, count + 1);
        });
        incomingCounts.forEach((count, nodeName) => {
            if (count > 3) {
                const node = workflow.nodes.find(n => n.name === nodeName);
                if (node) {
                    bottlenecks.push({
                        nodeId: node.id,
                        nodeName: node.name,
                        type: 'convergence',
                        severity: count > 5 ? 'high' : 'medium',
                        description: `Node receives data from ${count} sources`,
                        suggestion: 'Consider using a merge node or simplifying the workflow'
                    });
                }
            }
        });
        // Find complex nodes that might slow down execution
        workflow.nodes.forEach(node => {
            const complexity = this.calculateNodeComplexity(node);
            if (complexity > 7) {
                bottlenecks.push({
                    nodeId: node.id,
                    nodeName: node.name,
                    type: 'complexity',
                    severity: complexity > 8 ? 'high' : 'medium',
                    description: `Node has high complexity (${complexity}/10)`,
                    suggestion: 'Consider breaking down into simpler nodes'
                });
            }
        });
        return bottlenecks;
    }
}
//# sourceMappingURL=node-analyzer.js.map