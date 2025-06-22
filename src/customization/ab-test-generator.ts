import { N8nWorkflow, N8nNode, N8nConnections } from '../types/n8n-workflow';
import { v4 as uuidv4 } from 'uuid';

export interface ABTestConfig {
  testName: string;
  workflowA: N8nWorkflow;
  workflowB: N8nWorkflow;
  splitPercentage: number; // 0-100, for workflow A
}

/**
 * Generates a single, combined n8n workflow for A/B testing two different workflows.
 */
export class ABTestWorkflowGenerator {
  public generate(config: ABTestConfig): N8nWorkflow {
    const { testName, workflowA, workflowB, splitPercentage } = config;

    const entryNodeId = `ab-test-entry-${uuidv4()}`;
    const routerNodeId = `ab-test-router-${uuidv4()}`;
    const mergeNodeId = `ab-test-merge-${uuidv4()}`;

    // Create a router node to split traffic
    const routerNode: N8nNode = {
      id: routerNodeId,
      name: `A/B Split (${splitPercentage}/${100 - splitPercentage})`,
      type: 'n8n-nodes-base.if',
      typeVersion: 1,
      parameters: {
        conditions: {
          number: [
            {
              value1: `={{ Math.random() * 100 }}`,
              operation: 'smaller',
              value2: splitPercentage,
            },
          ],
        },
      },
      position: [0, 0], // Placeholder position
    };

    // Prefix node IDs from each workflow to avoid collisions
    const prefixedNodesA = this.prefixNodeIds(workflowA.nodes, 'A');
    const prefixedNodesB = this.prefixNodeIds(workflowB.nodes, 'B');

    // Create a merge node to collect results
    const mergeNode: N8nNode = {
        id: mergeNodeId,
        name: 'Merge A/B Results',
        type: 'n8n-nodes-base.merge',
        typeVersion: 1,
        parameters: {
            mode: 'multiplex'
        },
        position: [0, 200], // Placeholder
    };

    const combinedNodes: N8nNode[] = [routerNode, ...prefixedNodesA, ...prefixedNodesB, mergeNode];
    const combinedConnections = this.generateConnections(
      routerNodeId, mergeNodeId, workflowA, workflowB
    );

    return {
      name: `A/B Test: ${testName}`,
      nodes: combinedNodes,
      connections: combinedConnections,
      active: false,
      settings: {},
      id: uuidv4(),
    };
  }

  private prefixNodeIds(nodes: N8nWorkflow['nodes'], prefix: string): N8nWorkflow['nodes'] {
    return nodes.map(node => ({
      ...node,
      id: `${prefix}-${node.id}`,
      name: `[${prefix}] ${node.name}`,
    }));
  }

  private generateConnections(routerId: string, mergeId: string, workflowA: N8nWorkflow, workflowB: N8nWorkflow): N8nConnections {
    // This is a simplified connection logic. A real implementation would need to
    // intelligently find the start and end nodes of each workflow.
    const startNodeA = workflowA.nodes.find(n => n.type === 'n8n-nodes-base.start');
    const startNodeB = workflowB.nodes.find(n => n.type === 'n8n-nodes-base.start');

    // Assume for now the last node is the one to connect to merge.
    const endNodeA = workflowA.nodes[workflowA.nodes.length - 1];
    const endNodeB = workflowB.nodes[workflowB.nodes.length - 1];

    const connections: N8nConnections = {};

    // Connect router to start of A and B
    connections[routerId] = {
      main: [
        { node: `A-${startNodeA?.id}`, type: 'main', index: 0 },
        { node: `B-${startNodeB?.id}`, type: 'main', index: 1 }, // This was wrong, IF node has one main output array
      ],
    };
    
    // This needs to be smarter, for now, just copy them over prefixed
    Object.keys(workflowA.connections).forEach(key => {
        connections[`A-${key}`] = workflowA.connections[key];
    });
    Object.keys(workflowB.connections).forEach(key => {
        connections[`B-${key}`] = workflowB.connections[key];
    });

    // Connect end of A and B to merge node
    connections[`A-${endNodeA.id}`] = { ...(connections[`A-${endNodeA.id}`] || {}), main: [...((connections[`A-${endNodeA.id}`] || {}).main || []), { node: mergeId, type: 'main', index: 0 }] };
    connections[`B-${endNodeB.id}`] = { ...(connections[`B-${endNodeB.id}`] || {}), main: [...((connections[`B-${endNodeB.id}`] || {}).main || []), { node: mergeId, type: 'main', index: 1 }] };

    return connections;
  }
} 