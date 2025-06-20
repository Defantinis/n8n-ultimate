import { readFileSync, existsSync } from 'fs';
import { N8nWorkflow, N8nNode, ParsedWorkflow } from '../types/n8n-workflow.js';
import { WorkflowValidator } from '../validators/workflow-validator.js';

/**
 * Main workflow parser for n8n JSON files
 */
export class WorkflowParser {
  private validator: WorkflowValidator;

  constructor() {
    this.validator = new WorkflowValidator();
  }

  /**
   * Parse a workflow from a JSON file
   */
  async parseFromFile(filePath: string): Promise<ParsedWorkflow> {
    if (!existsSync(filePath)) {
      throw new Error(`Workflow file not found: ${filePath}`);
    }

    try {
      const content = readFileSync(filePath, 'utf-8');
      return this.parseFromString(content);
    } catch (error) {
      throw new Error(`Failed to read workflow file: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse a workflow from a JSON string
   */
  async parseFromString(jsonContent: string): Promise<ParsedWorkflow> {
    try {
      const workflow = JSON.parse(jsonContent) as N8nWorkflow;
      return this.parseWorkflow(workflow);
    } catch (error) {
      throw new Error(`Failed to parse workflow JSON: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Parse a workflow object
   */
  async parseWorkflow(workflow: N8nWorkflow): Promise<ParsedWorkflow> {
    // Validate the workflow structure
    const validation = await this.validator.validate(workflow);

    // Analyze the workflow metadata
    const metadata = this.analyzeWorkflowMetadata(workflow);

    return {
      workflow,
      metadata,
      validation
    };
  }

  /**
   * Analyze workflow metadata and complexity
   */
  private analyzeWorkflowMetadata(workflow: N8nWorkflow) {
    const nodeCount = workflow.nodes.length;
    const nodeTypes = [...new Set(workflow.nodes.map(node => node.type))];
    
    // Count connections
    let connectionCount = 0;
    Object.values(workflow.connections).forEach(nodeConnections => {
      Object.values(nodeConnections).forEach(outputConnections => {
        outputConnections.forEach(connectionArray => {
          connectionCount += connectionArray.length;
        });
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
  private detectLoops(workflow: N8nWorkflow): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasLoop = (nodeName: string): boolean => {
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
          for (const connectionArray of connections[outputType]) {
            for (const connection of connectionArray) {
              if (hasLoop(connection.node)) {
                return true;
              }
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
  private calculateMaxDepth(workflow: N8nWorkflow): number {
    const nodeMap = new Map<string, N8nNode>();
    workflow.nodes.forEach(node => nodeMap.set(node.name, node));

    const calculateDepth = (nodeName: string, visited: Set<string> = new Set()): number => {
      if (visited.has(nodeName)) {
        return 0; // Avoid infinite loops
      }

      visited.add(nodeName);
      let maxChildDepth = 0;

      const connections = workflow.connections[nodeName];
      if (connections) {
        for (const outputType of Object.keys(connections)) {
          for (const connectionArray of connections[outputType]) {
            for (const connection of connectionArray) {
              const childDepth = calculateDepth(connection.node, new Set(visited));
              maxChildDepth = Math.max(maxChildDepth, childDepth);
            }
          }
        }
      }

      return maxChildDepth + 1;
    };

    // Find start nodes (nodes with no incoming connections)
    const hasIncomingConnection = new Set<string>();
    Object.values(workflow.connections).forEach(nodeConnections => {
      Object.values(nodeConnections).forEach(outputConnections => {
        outputConnections.forEach(connectionArray => {
          connectionArray.forEach(connection => {
            hasIncomingConnection.add(connection.node);
          });
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
  private estimateComplexity(
    workflow: N8nWorkflow,
    nodeCount: number,
    connectionCount: number,
    hasLoops: boolean,
    maxDepth: number
  ): number {
    let complexity = 1;

    // Base complexity from node count
    if (nodeCount <= 5) complexity += 1;
    else if (nodeCount <= 10) complexity += 2;
    else if (nodeCount <= 20) complexity += 3;
    else complexity += 4;

    // Connection complexity
    const avgConnectionsPerNode = connectionCount / nodeCount;
    if (avgConnectionsPerNode > 2) complexity += 1;
    if (avgConnectionsPerNode > 3) complexity += 1;

    // Loop complexity
    if (hasLoops) complexity += 2;

    // Depth complexity
    if (maxDepth > 5) complexity += 1;
    if (maxDepth > 10) complexity += 1;

    // Node type complexity
    const complexNodeTypes = ['n8n-nodes-base.code', 'n8n-nodes-base.function', 'n8n-nodes-base.httpRequest'];
    const complexNodes = workflow.nodes.filter(node => complexNodeTypes.includes(node.type));
    if (complexNodes.length > 0) complexity += Math.min(2, complexNodes.length);

    return Math.min(10, complexity);
  }

  /**
   * Extract specific node by name
   */
  getNodeByName(workflow: N8nWorkflow, nodeName: string): N8nNode | undefined {
    return workflow.nodes.find(node => node.name === nodeName);
  }

  /**
   * Extract nodes by type
   */
  getNodesByType(workflow: N8nWorkflow, nodeType: string): N8nNode[] {
    return workflow.nodes.filter(node => node.type === nodeType);
  }

  /**
   * Get all connections for a specific node
   */
  getNodeConnections(workflow: N8nWorkflow, nodeName: string) {
    return workflow.connections[nodeName] || {};
  }

  /**
   * Get nodes that connect to a specific node
   */
  getIncomingConnections(workflow: N8nWorkflow, targetNodeName: string): Array<{
    sourceNode: string;
    outputType: string;
    outputIndex: number;
    inputIndex: number;
  }> {
    const incomingConnections: Array<{
      sourceNode: string;
      outputType: string;
      outputIndex: number;
      inputIndex: number;
    }> = [];

    Object.entries(workflow.connections).forEach(([sourceNodeName, nodeConnections]) => {
      Object.entries(nodeConnections).forEach(([outputType, outputConnections]) => {
        outputConnections.forEach((connectionArray, outputIndex) => {
          connectionArray.forEach(connection => {
            if (connection.node === targetNodeName) {
              incomingConnections.push({
                sourceNode: sourceNodeName,
                outputType,
                outputIndex,
                inputIndex: connection.index
              });
            }
          });
        });
      });
    });

    return incomingConnections;
  }

  /**
   * Generate a workflow summary
   */
  generateSummary(parsedWorkflow: ParsedWorkflow): string {
    const { workflow, metadata, validation } = parsedWorkflow;
    
    const summary = [
      `Workflow: ${workflow.name}`,
      `Nodes: ${metadata.nodeCount}`,
      `Connections: ${metadata.connectionCount}`,
      `Node Types: ${metadata.nodeTypes.join(', ')}`,
      `Max Depth: ${metadata.maxDepth}`,
      `Has Loops: ${metadata.hasLoops ? 'Yes' : 'No'}`,
      `Complexity: ${metadata.estimatedComplexity}/10`,
      `Valid: ${validation.isValid ? 'Yes' : 'No'}`,
    ];

    if (!validation.isValid) {
      summary.push(`Errors: ${validation.errors.length}`);
      summary.push(`Warnings: ${validation.warnings.length}`);
    }

    return summary.join('\n');
  }
} 