import { N8nNode, N8nConnections } from '../types/n8n-workflow.js';
import { FlowConnection } from './workflow-generator.js';

/**
 * Builder class for creating connections between n8n nodes
 */
export class ConnectionBuilder {
  
  /**
   * Build connections between nodes based on the flow specification
   */
  buildConnections(nodes: N8nNode[], flow: FlowConnection[]): N8nConnections {
    const connections: N8nConnections = {};
    
    // Initialize connections object for all nodes
    for (const node of nodes) {
      connections[node.name] = {};
    }

    // CRITICAL FIX: Ensure trigger node is connected if we have one
    const triggerNode = nodes.find(node => this.isTriggerNode(node.type));
    if (triggerNode && flow.length === 0) {
      // If no flow specified but we have a trigger, create a linear flow
      return this.buildLinearConnections(nodes);
    }

    // Build connections based on flow specification
    for (const connection of flow) {
      const fromNode = nodes.find(n => n.id === connection.from || n.name === connection.from);
      const toNode = nodes.find(n => n.id === connection.to || n.name === connection.to);
      
      if (!fromNode || !toNode) {
        console.warn(`Connection skipped: Node not found for connection ${connection.from} -> ${connection.to}`);
        continue;
      }

      this.addConnection(connections, fromNode, toNode, connection);
    }

    // CRITICAL FIX: Auto-connect trigger node if it's not connected
    if (triggerNode && !connections[triggerNode.name]['main']) {
      const nextNode = nodes.find(node => node !== triggerNode && !this.isTriggerNode(node.type));
      if (nextNode) {
        connections[triggerNode.name]['main'] = [[{
          node: nextNode.name,
          type: 'main',
          index: 0
        }]];
      }
    }

    return connections;
  }

  /**
   * Check if a node is a trigger node
   */
  private isTriggerNode(nodeType: string): boolean {
    const triggerTypes = [
      'n8n-nodes-base.manualTrigger',
      'n8n-nodes-base.webhook',
      'n8n-nodes-base.schedule',
      'n8n-nodes-base.httpRequestTrigger',
      'n8n-nodes-base.emailTrigger',
      'n8n-nodes-base.fileTrigger'
    ];
    return triggerTypes.includes(nodeType);
  }

  /**
   * Add a single connection between two nodes
   */
  private addConnection(
    connections: N8nConnections, 
    fromNode: N8nNode, 
    toNode: N8nNode, 
    flowConnection: FlowConnection
  ): void {
    const connectionType = this.determineConnectionType(flowConnection);
    const outputIndex = this.determineOutputIndex(fromNode, flowConnection);
    const inputIndex = this.determineInputIndex(toNode, flowConnection);

    // Initialize connection structure if it doesn't exist
    if (!connections[fromNode.name][connectionType]) {
      connections[fromNode.name][connectionType] = [];
    }

    // Ensure the output index array exists
    while (connections[fromNode.name][connectionType].length <= outputIndex) {
      connections[fromNode.name][connectionType].push([]);
    }

    // Add the connection
    connections[fromNode.name][connectionType][outputIndex].push({
      node: toNode.name,
      type: connectionType,
      index: inputIndex
    });
  }

  /**
   * Determine the connection type based on flow specification
   */
  private determineConnectionType(flowConnection: FlowConnection): string {
    // Map flow connection types to n8n connection types
    switch (flowConnection.type) {
      case 'success':
      case 'main':
      case 'data':
        return 'main';
      case 'error':
        return 'main'; // n8n handles errors through the main connection with conditions
      case 'ai_tool':
        return 'ai_tool';
      case 'ai_document':
        return 'ai_document';
      case 'ai_memory':
        return 'ai_memory';
      default:
        return 'main';
    }
  }

  /**
   * Determine the output index for the connection
   */
  private determineOutputIndex(fromNode: N8nNode, flowConnection: FlowConnection): number {
    // For conditional nodes like IF, determine which output to use
    if (fromNode.type === 'n8n-nodes-base.if') {
      return flowConnection.condition === 'false' ? 1 : 0; // true=0, false=1
    }
    
    // For merge nodes or other multi-output nodes
    if (fromNode.type === 'n8n-nodes-base.merge' || fromNode.type === 'n8n-nodes-base.switch') {
      // Could be enhanced to handle specific output indices
      return 0;
    }

    // Default to first output
    return 0;
  }

  /**
   * Determine the input index for the connection
   */
  private determineInputIndex(toNode: N8nNode, _flowConnection: FlowConnection): number {
    // For merge nodes, different inputs might be used
    if (toNode.type === 'n8n-nodes-base.merge') {
      // Could be enhanced to handle specific input indices
      return 0;
    }

    // Default to first input
    return 0;
  }

  /**
   * Build connections for a linear workflow (simple chain)
   */
  buildLinearConnections(nodes: N8nNode[]): N8nConnections {
    const connections: N8nConnections = {};
    
    // Initialize connections for all nodes
    for (const node of nodes) {
      connections[node.name] = {};
    }

    // Connect each node to the next one
    for (let i = 0; i < nodes.length - 1; i++) {
      const currentNode = nodes[i];
      const nextNode = nodes[i + 1];
      
      connections[currentNode.name]['main'] = [[{
        node: nextNode.name,
        type: 'main',
        index: 0
      }]];
    }

    return connections;
  }

  /**
   * Build connections for a parallel workflow (fan-out/fan-in pattern)
   */
  buildParallelConnections(
    triggerNode: N8nNode,
    parallelNodes: N8nNode[],
    mergeNode?: N8nNode
  ): N8nConnections {
    const connections: N8nConnections = {};
    
    // Initialize connections
    const allNodes = [triggerNode, ...parallelNodes];
    if (mergeNode) allNodes.push(mergeNode);
    
    for (const node of allNodes) {
      connections[node.name] = {};
    }

    // Connect trigger to all parallel nodes
    connections[triggerNode.name]['main'] = parallelNodes.map(node => [{
      node: node.name,
      type: 'main',
      index: 0
    }]);

    // Connect all parallel nodes to merge node if provided
    if (mergeNode) {
      for (const parallelNode of parallelNodes) {
        connections[parallelNode.name]['main'] = [[{
          node: mergeNode.name,
          type: 'main',
          index: 0
        }]];
      }
    }

    return connections;
  }

  /**
   * Build connections for a conditional workflow (if-then-else pattern)
   */
  buildConditionalConnections(
    conditionNode: N8nNode,
    truePathNodes: N8nNode[],
    falsePathNodes: N8nNode[],
    mergeNode?: N8nNode
  ): N8nConnections {
    const connections: N8nConnections = {};
    
    // Initialize connections
    const allNodes = [conditionNode, ...truePathNodes, ...falsePathNodes];
    if (mergeNode) allNodes.push(mergeNode);
    
    for (const node of allNodes) {
      connections[node.name] = {};
    }

    // Connect condition node to first nodes of each path
    connections[conditionNode.name]['main'] = [];
    
    if (truePathNodes.length > 0) {
      connections[conditionNode.name]['main'][0] = [{
        node: truePathNodes[0].name,
        type: 'main',
        index: 0
      }];
    }
    
    if (falsePathNodes.length > 0) {
      connections[conditionNode.name]['main'][1] = [{
        node: falsePathNodes[0].name,
        type: 'main',
        index: 0
      }];
    }

    // Connect nodes within true path
    for (let i = 0; i < truePathNodes.length - 1; i++) {
      connections[truePathNodes[i].name]['main'] = [[{
        node: truePathNodes[i + 1].name,
        type: 'main',
        index: 0
      }]];
    }

    // Connect nodes within false path
    for (let i = 0; i < falsePathNodes.length - 1; i++) {
      connections[falsePathNodes[i].name]['main'] = [[{
        node: falsePathNodes[i + 1].name,
        type: 'main',
        index: 0
      }]];
    }

    // Connect last nodes of each path to merge node
    if (mergeNode) {
      if (truePathNodes.length > 0) {
        const lastTrueNode = truePathNodes[truePathNodes.length - 1];
        connections[lastTrueNode.name]['main'] = [[{
          node: mergeNode.name,
          type: 'main',
          index: 0
        }]];
      }
      
      if (falsePathNodes.length > 0) {
        const lastFalseNode = falsePathNodes[falsePathNodes.length - 1];
        connections[lastFalseNode.name]['main'] = [[{
          node: mergeNode.name,
          type: 'main',
          index: 0
        }]];
      }
    }

    return connections;
  }

  /**
   * Validate connections for consistency
   */
  validateConnections(connections: N8nConnections, nodes: N8nNode[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Check that all referenced nodes exist
    const nodeNames = new Set(nodes.map(n => n.name));
    
    for (const [fromNodeName, nodeConnections] of Object.entries(connections)) {
      if (!nodeNames.has(fromNodeName)) {
        errors.push(`Connection references non-existent source node: ${fromNodeName}`);
        continue;
      }

      for (const [_connectionType, outputs] of Object.entries(nodeConnections)) {
        for (const outputConnections of outputs) {
          for (const connection of outputConnections) {
            if (!nodeNames.has(connection.node)) {
              errors.push(`Connection references non-existent target node: ${connection.node}`);
            }
          }
        }
      }
    }

    // Check for disconnected nodes (except start nodes)
    const connectedNodes = new Set<string>();
    for (const nodeConnections of Object.values(connections)) {
      for (const outputs of Object.values(nodeConnections)) {
        for (const outputConnections of outputs) {
          for (const connection of outputConnections) {
            connectedNodes.add(connection.node);
          }
        }
      }
    }

    for (const node of nodes) {
      if (!connectedNodes.has(node.name) && !this.isStartNode(node)) {
        warnings.push(`Node ${node.name} is not connected to any other nodes`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Check if a node is a start/trigger node
   */
  private isStartNode(node: N8nNode): boolean {
    // A start node has no incoming connections
    // This is a simplified check. A more robust one would analyze the connections object.
    return node.type === 'n8n-nodes-base.start';
  }

  /**
   * Adds a new connection by node names.
   */
  public addConnectionByIds(
    connections: N8nConnections,
    fromNodeName: string,
    toNodeName: string,
    type: 'main' | 'error' = 'main',
    outputIndex = 0,
    inputIndex = 0
  ): N8nConnections {
    const newConnections = JSON.parse(JSON.stringify(connections));
    if (!newConnections[fromNodeName]) {
      newConnections[fromNodeName] = { [type]: [] };
    }
    if (!newConnections[fromNodeName][type]) {
      newConnections[fromNodeName][type] = [];
    }
    while (newConnections[fromNodeName][type].length <= outputIndex) {
      newConnections[fromNodeName][type].push([]);
    }
    newConnections[fromNodeName][type][outputIndex].push({
      node: toNodeName,
      type: 'main', // n8n internal detail
      index: inputIndex,
    });
    return newConnections;
  }

  /**
   * Reroutes an existing connection to go through a new node.
   */
  public rerouteThroughNode(
    connections: N8nConnections,
    targetNodeName: string,
    intermediateNodeName: string
  ): { connections: N8nConnections, originalSuccessorName: string | null } {
    let newConnections = JSON.parse(JSON.stringify(connections));
    let originalSuccessorName: string | null = null;

    if (newConnections[targetNodeName]?.main?.[0]?.[0]) {
      originalSuccessorName = newConnections[targetNodeName].main[0][0].node;
      // Remove old connection by replacing it with the new intermediate one
      newConnections[targetNodeName].main[0][0].node = intermediateNodeName;
    } else {
      // If there was no outgoing connection, just add one
      newConnections = this.addConnectionByIds(
        newConnections,
        targetNodeName,
        intermediateNodeName
      );
    }
    
    return { connections: newConnections, originalSuccessorName };
  }
}

/**
 * Connection validation result
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} 