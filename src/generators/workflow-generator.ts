import { randomUUID } from 'crypto';
import { N8nWorkflow, N8nNode, N8nConnections, ParsedWorkflow } from '../types/n8n-workflow.js';
import { WorkflowParser } from '../parsers/workflow-parser.js';
import { NodeFactory } from './node-factory.js';
import { ConnectionBuilder } from './connection-builder.js';
import { PositionCalculator } from '../utils/position-calculator.js';
import { AIAgent } from '../ai-agents/ai-agent.js';
import { memoryManager } from '../performance/memory-manager.js';

/**
 * Main workflow generator that creates n8n workflows from user requirements
 */
export class WorkflowGenerator {
  private parser: WorkflowParser;
  private nodeFactory: NodeFactory;
  private connectionBuilder: ConnectionBuilder;
  private positionCalculator: PositionCalculator;
  private aiAgent: AIAgent;

  constructor() {
    this.parser = new WorkflowParser();
    this.nodeFactory = new NodeFactory();
    this.connectionBuilder = new ConnectionBuilder();
    this.positionCalculator = new PositionCalculator();
    this.aiAgent = new AIAgent();
  }

  /**
   * Generate a complete n8n workflow from user requirements
   */
  async generateWorkflow(requirements: WorkflowRequirements): Promise<GeneratedWorkflow> {
    const workflowId = randomUUID();
    
    try {
      // Create memory context for this workflow generation
      const memoryContext = memoryManager.createWorkflowContext(workflowId);
      
      // Step 1: Analyze requirements using AI
      const analysis = await this.aiAgent.analyzeRequirements(requirements);
      memoryManager.registerObject(workflowId, 'analysis', analysis);
      memoryManager.updateWorkflowContext(workflowId);
      
      // Step 2: Plan the workflow structure
      const plan = await this.aiAgent.planWorkflow(analysis);
      memoryManager.registerObject(workflowId, 'plan', plan);
      memoryManager.updateWorkflowContext(workflowId);
      
      // Step 3: Generate nodes based on the plan
      const nodes = await this.generateNodes(plan, workflowId);
      memoryManager.registerObject(workflowId, 'nodes', nodes);
      memoryManager.updateWorkflowContext(workflowId);
      
      // Step 4: Create connections between nodes
      const connections = this.connectionBuilder.buildConnections(nodes, plan.flow);
      memoryManager.registerObject(workflowId, 'connections', connections);
      memoryManager.updateWorkflowContext(workflowId);
      
      // Step 5: Calculate positions for visual layout
      const positionedNodes = this.positionCalculator.calculatePositions(nodes, connections);
      memoryManager.registerObject(workflowId, 'positionedNodes', positionedNodes);
      memoryManager.updateWorkflowContext(workflowId);
      
      // Step 6: Create the complete workflow
      const workflow = this.createWorkflow(requirements, positionedNodes, connections);
      memoryManager.registerObject(workflowId, 'workflow', workflow);
      memoryManager.updateWorkflowContext(workflowId);
      
      // Step 7: Validate the generated workflow
      const parsedWorkflow = await this.parser.parseWorkflow(workflow);
      memoryManager.registerObject(workflowId, 'parsedWorkflow', parsedWorkflow);
      memoryManager.updateWorkflowContext(workflowId);
      
      // Step 8: Optimize if needed
      const optimizedWorkflow = await this.optimizeWorkflow(parsedWorkflow, requirements);
      memoryManager.registerObject(workflowId, 'optimizedWorkflow', optimizedWorkflow);
      memoryManager.updateWorkflowContext(workflowId);

      const result = {
        workflow: optimizedWorkflow.workflow,
        metadata: optimizedWorkflow.metadata,
        validation: optimizedWorkflow.validation,
        generationDetails: {
          requirements,
          analysis,
          plan,
          nodeCount: nodes.length,
          connectionCount: Object.keys(connections).length,
          complexity: optimizedWorkflow.metadata.estimatedComplexity,
          generatedAt: new Date().toISOString(),
          memoryUsage: memoryContext.currentMemory.heapUsed - memoryContext.startMemory.heapUsed
        }
      };

      // Clean up memory context
      await memoryManager.cleanupWorkflowContext(workflowId);

      return result;

    } catch (error) {
      // Ensure cleanup on error
      await memoryManager.cleanupWorkflowContext(workflowId);
      throw new Error(`Failed to generate workflow: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generate workflow nodes based on the AI plan
   */
  private async generateNodes(plan: WorkflowPlan, workflowId?: string): Promise<N8nNode[]> {
    const nodes: N8nNode[] = [];

    for (const nodeSpec of plan.nodes) {
      const node = await this.nodeFactory.createNode(nodeSpec);
      
      // Use memory pool for node objects if workflowId provided
      if (workflowId) {
        const pooledNode = memoryManager.getFromPool('nodes', workflowId) as N8nNode;
        if (pooledNode) {
          // Copy node properties to pooled object
          Object.assign(pooledNode, node);
          nodes.push(pooledNode);
        } else {
          nodes.push(node);
        }
      } else {
        nodes.push(node);
      }
    }

    return nodes;
  }

  /**
   * Create the complete workflow structure
   */
  private createWorkflow(
    requirements: WorkflowRequirements,
    nodes: N8nNode[],
    connections: N8nConnections
  ): N8nWorkflow {
    return {
      name: requirements.name || 'Generated Workflow',
      nodes,
      connections,
      active: false,
      settings: {
        executionOrder: 'v1',
        saveManualExecutions: true,
        saveDataErrorExecution: 'all',
        saveDataSuccessExecution: 'all'
      },
      id: randomUUID(),
      meta: {
        templateCredsSetupCompleted: false
      },
      tags: requirements.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Optimize the generated workflow
   */
  private async optimizeWorkflow(
    parsedWorkflow: ParsedWorkflow,
    requirements: WorkflowRequirements
  ): Promise<ParsedWorkflow> {
    // Check if optimization is needed
    if (parsedWorkflow.metadata.estimatedComplexity <= 7 && parsedWorkflow.validation.isValid) {
      return parsedWorkflow;
    }

    // Apply optimizations based on validation results
    let optimizedWorkflow = parsedWorkflow.workflow;

    // Fix validation errors
    if (!parsedWorkflow.validation.isValid) {
      optimizedWorkflow = await this.fixValidationErrors(optimizedWorkflow, parsedWorkflow.validation.errors);
    }

    // Reduce complexity if too high
    if (parsedWorkflow.metadata.estimatedComplexity > 8) {
      optimizedWorkflow = await this.reduceComplexity(optimizedWorkflow, requirements);
    }

    // Re-parse the optimized workflow
    return await this.parser.parseWorkflow(optimizedWorkflow);
  }

  /**
   * Fix validation errors in the workflow
   */
  private async fixValidationErrors(workflow: N8nWorkflow, errors: any[]): Promise<N8nWorkflow> {
    const fixedWorkflow = { ...workflow };

    for (const error of errors) {
      switch (error.type) {
        case 'node':
          // Placeholder for fixing node errors
          break;
        case 'connection':
          // Placeholder for fixing connection errors
          break;
        case 'structure':
          // Placeholder for fixing structure errors
          break;
      }
    }

    return fixedWorkflow;
  }

  /**
   * Reduce workflow complexity
   */
  private async reduceComplexity(workflow: N8nWorkflow, requirements: WorkflowRequirements): Promise<N8nWorkflow> {
    // Identify complex nodes and suggest simplifications
    const complexNodes = workflow.nodes.filter(node => {
      // Simple complexity check - can be enhanced
      return Object.keys(node.parameters).length > 5 || 
             node.type.includes('code') ||
             node.type.includes('function');
    });

    // Use AI to suggest simplifications
    if (complexNodes.length > 0) {
      const simplificationSuggestions = await this.aiAgent.suggestSimplifications(workflow, complexNodes, requirements);
      return await this.applySimplifications(workflow, simplificationSuggestions);
    }

    return workflow;
  }

  /**
   * Apply simplification suggestions to the workflow
   */
  private async applySimplifications(workflow: N8nWorkflow, suggestions: SimplificationSuggestion[]): Promise<N8nWorkflow> {
    let simplifiedWorkflow = { ...workflow };

    for (const suggestion of suggestions) {
      switch (suggestion.type) {
        case 'split-node':
          simplifiedWorkflow = await this.splitComplexNode(simplifiedWorkflow, suggestion);
          break;
        case 'merge-nodes':
          simplifiedWorkflow = await this.mergeSimpleNodes(simplifiedWorkflow, suggestion);
          break;
        case 'simplify-parameters':
          simplifiedWorkflow = await this.simplifyNodeParameters(simplifiedWorkflow, suggestion);
          break;
      }
    }

    return simplifiedWorkflow;
  }

  /**
   * Generate workflow from a template
   */
  async generateFromTemplate(templateName: string, parameters: Record<string, any>): Promise<GeneratedWorkflow> {
    const template = await this.loadTemplate(templateName);
    const populatedWorkflow = await this.populateTemplate(template, parameters);
    const parsedWorkflow = await this.parser.parseWorkflow(populatedWorkflow);

    return {
      workflow: parsedWorkflow.workflow,
      metadata: parsedWorkflow.metadata,
      validation: parsedWorkflow.validation,
      generationDetails: {
        requirements: { name: templateName, description: 'Generated from template', type: 'template' },
        analysis: { templateUsed: templateName },
        plan: { nodes: [], flow: [], estimatedComplexity: 0, rationale: 'Template-based generation' },
        nodeCount: parsedWorkflow.workflow.nodes.length,
        connectionCount: Object.keys(parsedWorkflow.workflow.connections).length,
        complexity: parsedWorkflow.metadata.estimatedComplexity,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * Enhance an existing workflow with new requirements
   */
  async enhanceWorkflow(existingWorkflow: N8nWorkflow, enhancements: WorkflowEnhancement[]): Promise<GeneratedWorkflow> {
    let workflow = { ...existingWorkflow };

    for (const enhancement of enhancements) {
      const targetNode = workflow.nodes.find(n => n.id === enhancement.parameters.targetNodeId);
      if (!targetNode && enhancement.type !== 'add-node') {
        console.warn(`Target node for enhancement not found: ${enhancement.parameters.targetNodeId}`);
        continue;
      }

      switch (enhancement.type) {
        case 'add-error-handling':
          workflow = await this.addErrorHandling(workflow, targetNode as N8nNode);
          break;
        // Other enhancement types can be added here
      }
    }

    // Recalculate positions for the entire workflow
    workflow.nodes = this.positionCalculator.calculatePositions(workflow.nodes, workflow.connections);
    
    const parsedWorkflow = await this.parser.parseWorkflow(workflow);
    return {
      workflow,
      metadata: parsedWorkflow.metadata,
      validation: parsedWorkflow.validation,
      generationDetails: {
        requirements: { description: 'Enhanced workflow', type: 'enhancement' },
        analysis: {},
        plan: { nodes: [], flow: [], estimatedComplexity: parsedWorkflow.metadata.estimatedComplexity, rationale: 'Applied enhancements' },
        nodeCount: workflow.nodes.length,
        connectionCount: Object.keys(workflow.connections).length,
        complexity: parsedWorkflow.metadata.estimatedComplexity,
        generatedAt: new Date().toISOString()
      }
    };
  }

  // Placeholder methods for error fixing and workflow modification
  // TODO: Implement when needed
  // private async fixConnectionError(workflow: N8nWorkflow, _error: any): Promise<N8nWorkflow> {
  //   return workflow;
  // }

  // private async fixStructureError(workflow: N8nWorkflow, _error: any): Promise<N8nWorkflow> {
  //   return workflow;
  // }

  private async splitComplexNode(workflow: N8nWorkflow, _suggestion: SimplificationSuggestion): Promise<N8nWorkflow> {
    // Implementation for splitting complex nodes
    return workflow;
  }

  private async mergeSimpleNodes(workflow: N8nWorkflow, _suggestion: SimplificationSuggestion): Promise<N8nWorkflow> {
    // Implementation for merging simple nodes
    return workflow;
  }

  private async simplifyNodeParameters(workflow: N8nWorkflow, _suggestion: SimplificationSuggestion): Promise<N8nWorkflow> {
    // Implementation for simplifying node parameters
    return workflow;
  }

  private async loadTemplate(_templateName: string): Promise<N8nWorkflow> {
    // Implementation for loading workflow templates
    throw new Error('Template loading not implemented yet');
  }

  private async populateTemplate(template: N8nWorkflow, _parameters: Record<string, any>): Promise<N8nWorkflow> {
    // Placeholder for populating template with parameters
    return template;
  }

  // TODO: Implement enhancement methods when needed
  // private async addNodeToWorkflow(workflow: N8nWorkflow, enhancement: WorkflowEnhancement): Promise<N8nWorkflow> {
  //   const { targetNodeId, newNode } = enhancement.parameters;
  //   const node = await this.nodeFactory.createNode(newNode);
  //   const newNodes = [...workflow.nodes, node];
  //   return { ...workflow, nodes: newNodes };
  // }

  // private async modifyWorkflowNode(workflow: N8nWorkflow, _enhancement: WorkflowEnhancement): Promise<N8nWorkflow> {
  //   return workflow;
  // }

  // private async addConnectionToWorkflow(workflow: N8nWorkflow, _enhancement: WorkflowEnhancement): Promise<N8nWorkflow> {
  //   return workflow;
  // }

  private async addErrorHandling(workflow: N8nWorkflow, targetNode: N8nNode): Promise<N8nWorkflow> {
    // 1. Create an 'IF' node for error checking
    const ifNode = await this.nodeFactory.createNode({
      id: `if-error-${targetNode.id}`,
      name: `Check ${targetNode.name} Success`,
      type: 'n8n-nodes-base.if',
      description: 'Checks if the previous node ran successfully.',
      parameters: {
        conditions: { conditions: [{ id: 'error-check', leftValue: '={{ $json.error }}', operator: { type: 'string', operation: 'isEmpty' } }] }
      }
    });

    // 2. Create an error notification node
    const errorNode = await this.nodeFactory.createNode({
      id: `error-node-${targetNode.id}`,
      name: `Error in ${targetNode.name}`,
      type: 'n8n-nodes-base.noOp',
      description: 'Stops workflow on error.',
      parameters: { message: `ERROR: ${targetNode.name} failed. Error: {{ $json.error }}` }
    });
    
    let newNodes = [...workflow.nodes, ifNode, errorNode];
    
    // 3. Reroute connections
    const { connections: reroutedConnections, originalSuccessorName } = this.connectionBuilder.rerouteThroughNode(
      workflow.connections,
      targetNode.name,
      ifNode.name
    );
    let newConnections = reroutedConnections;
    
    // 4. Connect IF node outputs
    if (originalSuccessorName) {
      newConnections = this.connectionBuilder.addConnectionByIds(newConnections, ifNode.name, originalSuccessorName, 'main', 0);
    }
    newConnections = this.connectionBuilder.addConnectionByIds(newConnections, ifNode.name, errorNode.name, 'main', 1);

    return { ...workflow, nodes: newNodes, connections: newConnections };
  }
}

// Type definitions for generation
export interface WorkflowRequirements {
  name?: string;
  description: string;
  type: 'automation' | 'data-processing' | 'api-integration' | 'notification' | 'monitoring' | 'template' | 'enhancement';
  inputs?: Array<{
    name: string;
    type: 'webhook' | 'schedule' | 'manual' | 'file' | 'api';
    description: string;
  }>;
  outputs?: Array<{
    name: string;
    type: 'file' | 'api' | 'email' | 'webhook' | 'database';
    description: string;
  }>;
  steps?: string[];
  constraints?: {
    maxNodes?: number;
    maxComplexity?: number;
    requiredNodeTypes?: string[];
    forbiddenNodeTypes?: string[];
  };
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
}

export interface WorkflowPlan {
  nodes: NodeSpecification[];
  flow: FlowConnection[];
  estimatedComplexity: number;
  rationale: string;
}

export interface NodeSpecification {
  id: string;
  name: string;
  type: string;
  parameters: Record<string, any>;
  description: string;
  position?: [number, number];
}

export interface FlowConnection {
  from: string;
  to: string;
  type: string;
  condition?: string;
}

export interface GeneratedWorkflow {
  workflow: N8nWorkflow;
  metadata: any;
  validation: any;
  generationDetails: {
    requirements: WorkflowRequirements;
    analysis: any;
    plan: WorkflowPlan;
    nodeCount: number;
    connectionCount: number;
    complexity: number;
    generatedAt: string;
  };
}

export interface SimplificationSuggestion {
  type: 'split-node' | 'merge-nodes' | 'simplify-parameters';
  nodeId: string;
  description: string;
  parameters?: Record<string, any>;
}

export interface WorkflowEnhancement {
  type: 'add-node' | 'modify-node' | 'add-connection' | 'add-error-handling';
  description: string;
  parameters: Record<string, any>;
} 