import { randomUUID } from 'crypto';
import { WorkflowParser } from '../parsers/workflow-parser.js';
import { NodeFactory } from './node-factory.js';
import { ConnectionBuilder } from './connection-builder.js';
import { PositionCalculator } from '../utils/position-calculator.js';
import { AIAgent } from '../ai-agents/ai-agent.js';
/**
 * Main workflow generator that creates n8n workflows from user requirements
 */
export class WorkflowGenerator {
    parser;
    nodeFactory;
    connectionBuilder;
    positionCalculator;
    aiAgent;
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
    async generateWorkflow(requirements) {
        try {
            // Step 1: Analyze requirements using AI
            const analysis = await this.aiAgent.analyzeRequirements(requirements);
            // Step 2: Plan the workflow structure
            const plan = await this.aiAgent.planWorkflow(analysis);
            // Step 3: Generate nodes based on the plan
            const nodes = await this.generateNodes(plan);
            // Step 4: Create connections between nodes
            const connections = this.connectionBuilder.buildConnections(nodes, plan.flow);
            // Step 5: Calculate positions for visual layout
            const positionedNodes = this.positionCalculator.calculatePositions(nodes, connections);
            // Step 6: Create the complete workflow
            const workflow = this.createWorkflow(requirements, positionedNodes, connections);
            // Step 7: Validate the generated workflow
            const parsedWorkflow = await this.parser.parseWorkflow(workflow);
            // Step 8: Optimize if needed
            const optimizedWorkflow = await this.optimizeWorkflow(parsedWorkflow, requirements);
            return {
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
                    generatedAt: new Date().toISOString()
                }
            };
        }
        catch (error) {
            throw new Error(`Failed to generate workflow: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generate workflow nodes based on the AI plan
     */
    async generateNodes(plan) {
        const nodes = [];
        for (const nodeSpec of plan.nodes) {
            const node = await this.nodeFactory.createNode(nodeSpec);
            nodes.push(node);
        }
        return nodes;
    }
    /**
     * Create the complete workflow structure
     */
    createWorkflow(requirements, nodes, connections) {
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
    async optimizeWorkflow(parsedWorkflow, requirements) {
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
    async fixValidationErrors(workflow, errors) {
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
    async reduceComplexity(workflow, requirements) {
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
    async applySimplifications(workflow, suggestions) {
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
    async generateFromTemplate(templateName, parameters) {
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
    async enhanceWorkflow(existingWorkflow, enhancements) {
        let workflow = { ...existingWorkflow };
        for (const enhancement of enhancements) {
            const targetNode = workflow.nodes.find(n => n.id === enhancement.parameters.targetNodeId);
            if (!targetNode && enhancement.type !== 'add-node') {
                console.warn(`Target node for enhancement not found: ${enhancement.parameters.targetNodeId}`);
                continue;
            }
            switch (enhancement.type) {
                case 'add-error-handling':
                    workflow = await this.addErrorHandling(workflow, targetNode);
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
    async splitComplexNode(workflow, _suggestion) {
        // Implementation for splitting complex nodes
        return workflow;
    }
    async mergeSimpleNodes(workflow, _suggestion) {
        // Implementation for merging simple nodes
        return workflow;
    }
    async simplifyNodeParameters(workflow, _suggestion) {
        // Implementation for simplifying node parameters
        return workflow;
    }
    async loadTemplate(_templateName) {
        // Implementation for loading workflow templates
        throw new Error('Template loading not implemented yet');
    }
    async populateTemplate(template, _parameters) {
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
    async addErrorHandling(workflow, targetNode) {
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
        const { connections: reroutedConnections, originalSuccessorName } = this.connectionBuilder.rerouteThroughNode(workflow.connections, targetNode.name, ifNode.name);
        let newConnections = reroutedConnections;
        // 4. Connect IF node outputs
        if (originalSuccessorName) {
            newConnections = this.connectionBuilder.addConnectionByIds(newConnections, ifNode.name, originalSuccessorName, 'main', 0);
        }
        newConnections = this.connectionBuilder.addConnectionByIds(newConnections, ifNode.name, errorNode.name, 'main', 1);
        return { ...workflow, nodes: newNodes, connections: newConnections };
    }
}
//# sourceMappingURL=workflow-generator.js.map