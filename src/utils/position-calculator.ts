import { N8nNode, N8nConnections } from '../types/n8n-workflow.js';

/**
 * Utility class for calculating visual positions of nodes in n8n workflows
 */
export class PositionCalculator {
  private readonly HORIZONTAL_SPACING = 300;
  private readonly VERTICAL_SPACING = 150;
  private readonly START_X = 100;
  private readonly START_Y = 300;

  /**
   * Calculate positions for all nodes based on their connections
   */
  calculatePositions(nodes: N8nNode[], connections: N8nConnections): N8nNode[] {
    const positionedNodes = [...nodes];
    
    // Find the workflow structure
    const structure = this.analyzeWorkflowStructure(nodes, connections);
    
    // Apply positioning based on structure type
    switch (structure.type) {
      case 'linear':
        this.positionLinearWorkflow(positionedNodes, structure);
        break;
      case 'parallel':
        this.positionParallelWorkflow(positionedNodes, structure, connections);
        break;
      case 'conditional':
        this.positionConditionalWorkflow(positionedNodes, structure, connections);
        break;
      case 'complex':
        this.positionComplexWorkflow(positionedNodes, connections);
        break;
      default:
        this.positionDefaultLayout(positionedNodes);
        break;
    }

    return positionedNodes;
  }

  /**
   * Analyze the structure of the workflow
   */
  private analyzeWorkflowStructure(nodes: N8nNode[], connections: N8nConnections): WorkflowStructure {
    const startNodes = this.findStartNodes(nodes, connections);
    const endNodes = this.findEndNodes(nodes, connections);
    
    // Check for linear structure (each node connects to at most one other)
    if (this.isLinearStructure(connections)) {
      return {
        type: 'linear',
        startNodes,
        endNodes,
        layers: this.createLinearLayers(nodes, connections)
      };
    }
    
    // Check for parallel structure (fan-out/fan-in)
    if (this.isParallelStructure(connections)) {
      return {
        type: 'parallel',
        startNodes,
        endNodes,
        layers: this.createParallelLayers(nodes, connections)
      };
    }
    
    // Check for conditional structure (if-then-else)
    if (this.isConditionalStructure(nodes, connections)) {
      return {
        type: 'conditional',
        startNodes,
        endNodes,
        layers: this.createConditionalLayers(nodes, connections)
      };
    }
    
    // Default to complex structure
    return {
      type: 'complex',
      startNodes,
      endNodes,
      layers: this.createComplexLayers(nodes, connections)
    };
  }

  /**
   * Position nodes in a linear workflow
   */
  private positionLinearWorkflow(nodes: N8nNode[], structure: WorkflowStructure): void {
    let currentX = this.START_X;
    const y = this.START_Y;
    
    for (const layer of structure.layers) {
      for (const node of layer) {
        const nodeIndex = nodes.findIndex(n => n.id === node.id);
        if (nodeIndex !== -1) {
          nodes[nodeIndex].position = [currentX, y];
        }
      }
      currentX += this.HORIZONTAL_SPACING;
    }
  }

  /**
   * Position nodes in a parallel workflow
   */
  private positionParallelWorkflow(nodes: N8nNode[], structure: WorkflowStructure, _connections: N8nConnections): void {
    let currentX = this.START_X;
    
    for (let layerIndex = 0; layerIndex < structure.layers.length; layerIndex++) {
      const layer = structure.layers[layerIndex];
      const layerHeight = layer.length * this.VERTICAL_SPACING;
      const startY = this.START_Y - (layerHeight / 2);
      
      for (let nodeIndex = 0; nodeIndex < layer.length; nodeIndex++) {
        const node = layer[nodeIndex];
        const targetNodeIndex = nodes.findIndex(n => n.id === node.id);
        
        if (targetNodeIndex !== -1) {
          const y = startY + (nodeIndex * this.VERTICAL_SPACING);
          nodes[targetNodeIndex].position = [currentX, Math.max(y, 50)]; // Ensure minimum Y position
        }
      }
      
      currentX += this.HORIZONTAL_SPACING;
    }
  }

  /**
   * Position nodes in a conditional workflow
   */
  private positionConditionalWorkflow(nodes: N8nNode[], structure: WorkflowStructure, _connections: N8nConnections): void {
    let currentX = this.START_X;
    
    for (let layerIndex = 0; layerIndex < structure.layers.length; layerIndex++) {
      const layer = structure.layers[layerIndex];
      
      if (layerIndex === 0) {
        // Position condition node
        const conditionNode = layer[0];
        const nodeIndex = nodes.findIndex(n => n.id === conditionNode.id);
        if (nodeIndex !== -1) {
          nodes[nodeIndex].position = [currentX, this.START_Y];
        }
      } else {
        // Position conditional branches
        const truePathY = this.START_Y - 100;
        const falsePathY = this.START_Y + 100;
        
        for (let nodeIndex = 0; nodeIndex < layer.length; nodeIndex++) {
          const node = layer[nodeIndex];
          const targetNodeIndex = nodes.findIndex(n => n.id === node.id);
          
          if (targetNodeIndex !== -1) {
            // Determine if this is true or false branch based on connections
            const y = nodeIndex < layer.length / 2 ? truePathY : falsePathY;
            nodes[targetNodeIndex].position = [currentX, y];
          }
        }
      }
      
      currentX += this.HORIZONTAL_SPACING;
    }
  }

  /**
   * Position nodes in a complex workflow using force-directed layout
   */
  private positionComplexWorkflow(nodes: N8nNode[], connections: N8nConnections): void {
    // Use a simplified force-directed algorithm
    const positions = new Map<string, [number, number]>();
    
    // Initialize positions
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const radius = Math.max(200, nodes.length * 30);
      const x = this.START_X + radius * Math.cos(angle);
      const y = this.START_Y + radius * Math.sin(angle);
      positions.set(node.id, [x, y]);
    });

    // Apply force-directed positioning (simplified)
    for (let iteration = 0; iteration < 50; iteration++) {
      const forces = new Map<string, [number, number]>();
      
      // Initialize forces
      nodes.forEach(node => {
        forces.set(node.id, [0, 0]);
      });

      // Repulsive forces between all nodes
      for (const nodeA of nodes) {
        for (const nodeB of nodes) {
          if (nodeA.id === nodeB.id) continue;
          
          const posA = positions.get(nodeA.id)!;
          const posB = positions.get(nodeB.id)!;
          const dx = posA[0] - posB[0];
          const dy = posA[1] - posB[1];
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const repulsiveForce = 5000 / (distance * distance);
            const forceA = forces.get(nodeA.id)!;
            forceA[0] += (dx / distance) * repulsiveForce;
            forceA[1] += (dy / distance) * repulsiveForce;
          }
        }
      }

      // Attractive forces for connected nodes
      for (const [fromNodeName, nodeConnections] of Object.entries(connections)) {
        const fromNode = nodes.find(n => n.name === fromNodeName);
        if (!fromNode) continue;
        
        for (const outputs of Object.values(nodeConnections)) {
          for (const outputConnections of outputs) {
            for (const connection of outputConnections) {
              const toNode = nodes.find(n => n.name === connection.node);
              if (!toNode) continue;
              
              const posFrom = positions.get(fromNode.id)!;
              const posTo = positions.get(toNode.id)!;
              const dx = posTo[0] - posFrom[0];
              const dy = posTo[1] - posFrom[1];
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance > 0) {
                const attractiveForce = distance * 0.01;
                const forceFrom = forces.get(fromNode.id)!;
                const forceTo = forces.get(toNode.id)!;
                
                forceFrom[0] += (dx / distance) * attractiveForce;
                forceFrom[1] += (dy / distance) * attractiveForce;
                forceTo[0] -= (dx / distance) * attractiveForce;
                forceTo[1] -= (dy / distance) * attractiveForce;
              }
            }
          }
        }
      }

      // Apply forces
      for (const node of nodes) {
        const force = forces.get(node.id)!;
        const position = positions.get(node.id)!;
        position[0] += force[0] * 0.1;
        position[1] += force[1] * 0.1;
        
        // Keep nodes within reasonable bounds
        position[0] = Math.max(50, Math.min(2000, position[0]));
        position[1] = Math.max(50, Math.min(1500, position[1]));
      }
    }

    // Apply final positions
    nodes.forEach(node => {
      const position = positions.get(node.id)!;
      node.position = [Math.round(position[0]), Math.round(position[1])];
    });
  }

  /**
   * Apply default grid layout
   */
  private positionDefaultLayout(nodes: N8nNode[]): void {
    const nodesPerRow = Math.ceil(Math.sqrt(nodes.length));
    
    nodes.forEach((node, index) => {
      const row = Math.floor(index / nodesPerRow);
      const col = index % nodesPerRow;
      
      node.position = [
        this.START_X + col * this.HORIZONTAL_SPACING,
        this.START_Y + row * this.VERTICAL_SPACING
      ];
    });
  }

  // Helper methods for structure analysis
  private findStartNodes(nodes: N8nNode[], connections: N8nConnections): N8nNode[] {
    const connectedNodes = new Set<string>();
    
    // Find all nodes that are targets of connections
    for (const nodeConnections of Object.values(connections)) {
      for (const outputs of Object.values(nodeConnections)) {
        for (const outputConnections of outputs) {
          for (const connection of outputConnections) {
            connectedNodes.add(connection.node);
          }
        }
      }
    }
    
    // Start nodes are those not targeted by any connection
    return nodes.filter(node => !connectedNodes.has(node.name));
  }

  private findEndNodes(nodes: N8nNode[], connections: N8nConnections): N8nNode[] {
    // End nodes are those that don't have any outgoing connections
    return nodes.filter(node => {
      const nodeConnections = connections[node.name];
      if (!nodeConnections) return true;
      
      return Object.values(nodeConnections).every(outputs => 
        outputs.every(outputConnections => outputConnections.length === 0)
      );
    });
  }

  private isLinearStructure(connections: N8nConnections): boolean {
    // Check if each node connects to at most one other node
    for (const nodeConnections of Object.values(connections)) {
      let totalConnections = 0;
      for (const outputs of Object.values(nodeConnections)) {
        for (const outputConnections of outputs) {
          totalConnections += outputConnections.length;
        }
      }
      if (totalConnections > 1) return false;
    }
    return true;
  }

  private isParallelStructure(connections: N8nConnections): boolean {
    // Check for fan-out pattern (one node connecting to multiple)
    let hasFanOut = false;
    for (const nodeConnections of Object.values(connections)) {
      let totalConnections = 0;
      for (const outputs of Object.values(nodeConnections)) {
        for (const outputConnections of outputs) {
          totalConnections += outputConnections.length;
        }
      }
      if (totalConnections > 1) {
        hasFanOut = true;
        break;
      }
    }
    return hasFanOut;
  }

  private isConditionalStructure(nodes: N8nNode[], _connections: N8nConnections): boolean {
    // Check for IF nodes or similar conditional nodes
    return nodes.some(node => 
      node.type === 'n8n-nodes-base.if' || 
      node.type === 'n8n-nodes-base.switch'
    );
  }

  private createLinearLayers(nodes: N8nNode[], connections: N8nConnections): N8nNode[][] {
    const layers: N8nNode[][] = [];
    const visited = new Set<string>();
    const startNodes = this.findStartNodes(nodes, connections);
    
    let currentLayer = [...startNodes];
    
    while (currentLayer.length > 0) {
      layers.push([...currentLayer]);
      currentLayer.forEach(node => visited.add(node.id));
      
      const nextLayer: N8nNode[] = [];
      for (const node of currentLayer) {
        const nodeConnections = connections[node.name];
        if (nodeConnections) {
          for (const outputs of Object.values(nodeConnections)) {
            for (const outputConnections of outputs) {
              for (const connection of outputConnections) {
                const targetNode = nodes.find(n => n.name === connection.node);
                if (targetNode && !visited.has(targetNode.id)) {
                  nextLayer.push(targetNode);
                }
              }
            }
          }
        }
      }
      currentLayer = nextLayer;
    }
    
    return layers;
  }

  private createParallelLayers(nodes: N8nNode[], connections: N8nConnections): N8nNode[][] {
    // Similar to linear but handles parallel branches
    return this.createLinearLayers(nodes, connections);
  }

  private createConditionalLayers(nodes: N8nNode[], connections: N8nConnections): N8nNode[][] {
    // Handle conditional branching
    return this.createLinearLayers(nodes, connections);
  }

  private createComplexLayers(nodes: N8nNode[], connections: N8nConnections): N8nNode[][] {
    // For complex structures, create layers based on dependency depth
    const layers: N8nNode[][] = [];
    const nodeDepths = new Map<string, number>();
    const visited = new Set<string>();
    
    // Calculate depth for each node
    const calculateDepth = (node: N8nNode, depth: number): void => {
      if (visited.has(node.id)) return;
      visited.add(node.id);
      
      const currentDepth = nodeDepths.get(node.id) || 0;
      nodeDepths.set(node.id, Math.max(currentDepth, depth));
      
      const nodeConnections = connections[node.name];
      if (nodeConnections) {
        for (const outputs of Object.values(nodeConnections)) {
          for (const outputConnections of outputs) {
            for (const connection of outputConnections) {
              const targetNode = nodes.find(n => n.name === connection.node);
              if (targetNode) {
                calculateDepth(targetNode, depth + 1);
              }
            }
          }
        }
      }
    };
    
    // Start from nodes with no incoming connections
    const startNodes = this.findStartNodes(nodes, connections);
    startNodes.forEach(node => calculateDepth(node, 0));
    
    // Group nodes by depth
    const maxDepth = Math.max(...Array.from(nodeDepths.values()));
    for (let depth = 0; depth <= maxDepth; depth++) {
      const layerNodes = nodes.filter(node => nodeDepths.get(node.id) === depth);
      if (layerNodes.length > 0) {
        layers.push(layerNodes);
      }
    }
    
    return layers;
  }
}

/**
 * Workflow structure analysis result
 */
interface WorkflowStructure {
  type: 'linear' | 'parallel' | 'conditional' | 'complex';
  startNodes: N8nNode[];
  endNodes: N8nNode[];
  layers: N8nNode[][];
} 