/**
 * Data Flow Validator
 * Validates data flow integrity, transformations, and type compatibility in n8n workflows
 */

import {
  N8NWorkflowSchema,
  N8NNode,
  N8NConnections,
  ValidationResult,
  WorkflowSchemaUtils
} from './n8n-workflow-schema';

import {
  ConnectionValidator,
  DataFlowAnalysis
} from './connection-validator';

/**
 * Data type definitions for n8n
 */
export interface N8NDataType {
  type: 'json' | 'binary' | 'string' | 'number' | 'boolean' | 'array' | 'object' | 'null' | 'undefined' | 'any';
  schema?: Record<string, any>;
  format?: string;
  required?: boolean;
  description?: string;
}

/**
 * Data transformation rule
 */
export interface DataTransformation {
  sourceType: N8NDataType;
  targetType: N8NDataType;
  transformation: string; // JavaScript expression or function
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Data flow path analysis
 */
export interface DataFlowPath {
  path: string[];
  dataTypes: N8NDataType[];
  transformations: DataTransformation[];
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Node data specification
 */
export interface NodeDataSpec {
  nodeId: string;
  nodeType: string;
  inputTypes: Record<string, N8NDataType>;
  outputTypes: Record<string, N8NDataType>;
  transformations: Record<string, string>; // Input key -> transformation expression
  requirements: {
    requiredInputs: string[];
    optionalInputs: string[];
    guaranteedOutputs: string[];
    conditionalOutputs: string[];
  };
}

/**
 * Data flow validation report
 */
export interface DataFlowValidationReport {
  summary: {
    totalPaths: number;
    validPaths: number;
    invalidPaths: number;
    warnings: number;
    errors: number;
    dataTypeIssues: number;
    transformationIssues: number;
  };
  pathAnalysis: DataFlowPath[];
  nodeAnalysis: Array<{
    nodeId: string;
    inputCompatibility: boolean;
    outputCompatibility: boolean;
    transformationValidity: boolean;
    issues: string[];
  }>;
  recommendations: string[];
}

/**
 * Data Flow Validator Class
 */
export class DataFlowValidator {
  private connectionValidator: ConnectionValidator;
  private nodeDataSpecs: Map<string, NodeDataSpec>;

  constructor(connectionValidator?: ConnectionValidator) {
    this.connectionValidator = connectionValidator || new ConnectionValidator();
    this.nodeDataSpecs = new Map();
    this.initializeNodeDataSpecs();
  }

  /**
   * Validate data flow in a workflow
   */
  validateDataFlow(workflow: N8NWorkflowSchema): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Validate data types compatibility
    results.push(...this.validateDataTypeCompatibility(workflow));

    // Validate data transformations
    results.push(...this.validateDataTransformations(workflow));

    // Validate data flow paths
    results.push(...this.validateDataFlowPaths(workflow));

    // Validate node data requirements
    results.push(...this.validateNodeDataRequirements(workflow));

    // Validate data flow continuity
    results.push(...this.validateDataFlowContinuity(workflow));

    return results;
  }

  /**
   * Generate comprehensive data flow report
   */
  generateDataFlowReport(workflow: N8NWorkflowSchema): DataFlowValidationReport {
    const validationResults = this.validateDataFlow(workflow);
    const dataFlowAnalysis = this.connectionValidator.analyzeDataFlow(workflow);
    
    // Analyze data flow paths
    const pathAnalysis = this.analyzeDataFlowPaths(workflow, dataFlowAnalysis);
    
    // Analyze individual nodes
    const nodeAnalysis = this.analyzeNodeDataFlow(workflow);
    
    // Calculate summary statistics
    const summary = {
      totalPaths: pathAnalysis.length,
      validPaths: pathAnalysis.filter(p => p.isValid).length,
      invalidPaths: pathAnalysis.filter(p => !p.isValid).length,
      warnings: validationResults.filter(r => r.severity === 'warning').length,
      errors: validationResults.filter(r => r.severity === 'error' && !r.valid).length,
      dataTypeIssues: validationResults.filter(r => r.message?.includes('type')).length,
      transformationIssues: validationResults.filter(r => r.message?.includes('transformation')).length
    };

    // Generate recommendations
    const recommendations = this.generateDataFlowRecommendations(workflow, validationResults, pathAnalysis);

    return {
      summary,
      pathAnalysis,
      nodeAnalysis,
      recommendations
    };
  }

  /**
   * Validate data type compatibility between connected nodes
   */
  private validateDataTypeCompatibility(workflow: N8NWorkflowSchema): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const [sourceNodeId, outputs] of Object.entries(workflow.connections)) {
      const sourceNode = workflow.nodes.find(n => n.id === sourceNodeId);
      if (!sourceNode) continue;

      const sourceSpec = this.getNodeDataSpec(sourceNode);

      for (const [outputType, connectionList] of Object.entries(outputs)) {
        for (const connection of connectionList) {
          const targetNode = workflow.nodes.find(n => n.id === connection.node);
          if (!targetNode) continue;

          const targetSpec = this.getNodeDataSpec(targetNode);
          
          // Check output type compatibility
          const sourceOutputType = sourceSpec.outputTypes[outputType];
          const targetInputType = targetSpec.inputTypes[connection.type];

          if (sourceOutputType && targetInputType) {
            const compatible = this.areDataTypesCompatible(sourceOutputType, targetInputType);
            
            if (!compatible) {
              results.push({
                valid: false,
                message: `Data type incompatibility: ${sourceNode.type} (${sourceNodeId}) outputs ${sourceOutputType.type} but ${targetNode.type} (${connection.node}) expects ${targetInputType.type}`,
                nodeId: sourceNodeId,
                connectionId: connection.node,
                severity: 'error',
                rule: 'data_type_compatibility'
              });
            }
          } else {
            // Missing type information
            if (!sourceOutputType) {
              results.push({
                valid: false,
                message: `Missing output type specification for ${sourceNode.type} (${sourceNodeId}) output: ${outputType}`,
                nodeId: sourceNodeId,
                severity: 'warning',
                rule: 'data_type_compatibility'
              });
            }
            
            if (!targetInputType) {
              results.push({
                valid: false,
                message: `Missing input type specification for ${targetNode.type} (${connection.node}) input: ${connection.type}`,
                nodeId: connection.node,
                severity: 'warning',
                rule: 'data_type_compatibility'
              });
            }
          }
        }
      }
    }

    return results;
  }

  /**
   * Validate data transformations
   */
  private validateDataTransformations(workflow: N8NWorkflowSchema): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const node of workflow.nodes) {
      const spec = this.getNodeDataSpec(node);
      
      // Validate transformation expressions
      for (const [inputKey, transformation] of Object.entries(spec.transformations)) {
        try {
          // Basic syntax validation for transformation expressions
          const isValid = this.validateTransformationExpression(transformation);
          
          if (!isValid) {
            results.push({
              valid: false,
              message: `Invalid transformation expression in ${node.type} (${node.id}): ${transformation}`,
              nodeId: node.id,
              severity: 'error',
              rule: 'data_transformation'
            });
          }
        } catch (error) {
          results.push({
            valid: false,
            message: `Transformation validation error in ${node.type} (${node.id}): ${error instanceof Error ? error.message : 'Unknown error'}`,
            nodeId: node.id,
            severity: 'error',
            rule: 'data_transformation'
          });
        }
      }

      // Validate node-specific transformations based on parameters
      if (node.type === 'n8n-nodes-base.set') {
        results.push(...this.validateSetNodeTransformations(node));
      } else if (node.type === 'n8n-nodes-base.code') {
        results.push(...this.validateCodeNodeTransformations(node));
      } else if (node.type === 'n8n-nodes-base.function') {
        results.push(...this.validateFunctionNodeTransformations(node));
      }
    }

    return results;
  }

  /**
   * Validate data flow paths
   */
  private validateDataFlowPaths(workflow: N8NWorkflowSchema): ValidationResult[] {
    const results: ValidationResult[] = [];
    const dataFlowAnalysis = this.connectionValidator.analyzeDataFlow(workflow);
    
    // Validate each connection path
    for (const path of dataFlowAnalysis.connectionPaths) {
      const pathValidation = this.validateSingleDataFlowPath(workflow, path.path);
      
      if (!pathValidation.isValid) {
        for (const error of pathValidation.errors) {
          results.push({
            valid: false,
            message: `Data flow path error (${path.path.join(' -> ')}): ${error}`,
            details: `Path: ${path.path.join(' -> ')}`,
            severity: 'error',
            rule: 'data_flow_path'
          });
        }
      }

      for (const warning of pathValidation.warnings) {
        results.push({
          valid: true,
          message: `Data flow path warning (${path.path.join(' -> ')}): ${warning}`,
          details: `Path: ${path.path.join(' -> ')}`,
          severity: 'warning',
          rule: 'data_flow_path'
        });
      }
    }

    return results;
  }

  /**
   * Validate node data requirements
   */
  private validateNodeDataRequirements(workflow: N8NWorkflowSchema): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const node of workflow.nodes) {
      const spec = this.getNodeDataSpec(node);
      
      // Check required inputs
      for (const requiredInput of spec.requirements.requiredInputs) {
        const hasInput = this.nodeHasInput(workflow, node.id, requiredInput);
        
        if (!hasInput) {
          results.push({
            valid: false,
            message: `Node ${node.type} (${node.id}) missing required input: ${requiredInput}`,
            nodeId: node.id,
            severity: 'error',
            rule: 'node_data_requirements'
          });
        }
      }

      // Check guaranteed outputs
      for (const guaranteedOutput of spec.requirements.guaranteedOutputs) {
        const hasOutput = this.nodeHasOutput(workflow, node.id, guaranteedOutput);
        
        if (!hasOutput && this.nodeHasConnectedInputs(workflow, node.id)) {
          results.push({
            valid: false,
            message: `Node ${node.type} (${node.id}) should guarantee output: ${guaranteedOutput}`,
            nodeId: node.id,
            severity: 'warning',
            rule: 'node_data_requirements'
          });
        }
      }
    }

    return results;
  }

  /**
   * Validate data flow continuity
   */
  private validateDataFlowContinuity(workflow: N8NWorkflowSchema): ValidationResult[] {
    const results: ValidationResult[] = [];
    const dataFlowAnalysis = this.connectionValidator.analyzeDataFlow(workflow);

    // Check for data flow dead ends
    for (const exitPoint of dataFlowAnalysis.exitPoints) {
      const node = workflow.nodes.find(n => n.id === exitPoint);
      if (!node) continue;

      // Check if exit point is appropriate (e.g., webhook response, email send, etc.)
      const isValidExitPoint = this.isValidDataFlowExitPoint(node);
      
      if (!isValidExitPoint) {
        results.push({
          valid: false,
          message: `Node ${node.type} (${exitPoint}) may not be an appropriate workflow exit point`,
          nodeId: exitPoint,
          severity: 'warning',
          rule: 'data_flow_continuity'
        });
      }
    }

    // Check for potential data loss
    for (const node of workflow.nodes) {
      if (this.nodeHasConnectedInputs(workflow, node.id) && !this.nodeHasConnectedOutputs(workflow, node.id)) {
        const isValidTerminator = this.isValidDataFlowTerminator(node);
        
        if (!isValidTerminator) {
          results.push({
            valid: false,
            message: `Node ${node.type} (${node.id}) receives data but has no outputs - potential data loss`,
            nodeId: node.id,
            severity: 'warning',
            rule: 'data_flow_continuity'
          });
        }
      }
    }

    return results;
  }

  /**
   * Initialize node data specifications
   */
  private initializeNodeDataSpecs(): void {
    // Manual Trigger
    this.nodeDataSpecs.set('n8n-nodes-base.manualTrigger', {
      nodeId: '',
      nodeType: 'n8n-nodes-base.manualTrigger',
      inputTypes: {},
      outputTypes: {
        main: { type: 'json', description: 'Manual trigger data' }
      },
      transformations: {},
      requirements: {
        requiredInputs: [],
        optionalInputs: [],
        guaranteedOutputs: ['main'],
        conditionalOutputs: []
      }
    });

    // HTTP Request
    this.nodeDataSpecs.set('n8n-nodes-base.httpRequest', {
      nodeId: '',
      nodeType: 'n8n-nodes-base.httpRequest',
      inputTypes: {
        main: { type: 'json', description: 'Request configuration data' }
      },
      outputTypes: {
        main: { type: 'json', description: 'HTTP response data' },
        error: { type: 'json', description: 'Error information' }
      },
      transformations: {
        main: '{{ $json }}'
      },
      requirements: {
        requiredInputs: [],
        optionalInputs: ['main'],
        guaranteedOutputs: ['main'],
        conditionalOutputs: ['error']
      }
    });

    // Set Node
    this.nodeDataSpecs.set('n8n-nodes-base.set', {
      nodeId: '',
      nodeType: 'n8n-nodes-base.set',
      inputTypes: {
        main: { type: 'json', description: 'Input data to transform' }
      },
      outputTypes: {
        main: { type: 'json', description: 'Transformed data' }
      },
      transformations: {},
      requirements: {
        requiredInputs: ['main'],
        optionalInputs: [],
        guaranteedOutputs: ['main'],
        conditionalOutputs: []
      }
    });

    // Code Node
    this.nodeDataSpecs.set('n8n-nodes-base.code', {
      nodeId: '',
      nodeType: 'n8n-nodes-base.code',
      inputTypes: {
        main: { type: 'any', description: 'Input data for code execution' }
      },
      outputTypes: {
        main: { type: 'any', description: 'Code execution result' }
      },
      transformations: {},
      requirements: {
        requiredInputs: ['main'],
        optionalInputs: [],
        guaranteedOutputs: ['main'],
        conditionalOutputs: []
      }
    });

    // IF Node
    this.nodeDataSpecs.set('n8n-nodes-base.if', {
      nodeId: '',
      nodeType: 'n8n-nodes-base.if',
      inputTypes: {
        main: { type: 'json', description: 'Data to evaluate' }
      },
      outputTypes: {
        main: { type: 'json', description: 'Data when condition is true or false' }
      },
      transformations: {
        main: '{{ $json }}'
      },
      requirements: {
        requiredInputs: ['main'],
        optionalInputs: [],
        guaranteedOutputs: [],
        conditionalOutputs: ['main']
      }
    });

    // Webhook
    this.nodeDataSpecs.set('n8n-nodes-base.webhook', {
      nodeId: '',
      nodeType: 'n8n-nodes-base.webhook',
      inputTypes: {},
      outputTypes: {
        main: { type: 'json', description: 'Webhook payload data' }
      },
      transformations: {},
      requirements: {
        requiredInputs: [],
        optionalInputs: [],
        guaranteedOutputs: ['main'],
        conditionalOutputs: []
      }
    });

    // OpenAI
    this.nodeDataSpecs.set('n8n-nodes-base.openAi', {
      nodeId: '',
      nodeType: 'n8n-nodes-base.openAi',
      inputTypes: {
        main: { type: 'json', description: 'OpenAI request data' }
      },
      outputTypes: {
        main: { type: 'json', description: 'OpenAI response data' },
        error: { type: 'json', description: 'API error information' }
      },
      transformations: {
        main: '{{ $json }}'
      },
      requirements: {
        requiredInputs: ['main'],
        optionalInputs: [],
        guaranteedOutputs: ['main'],
        conditionalOutputs: ['error']
      }
    });

    // Merge
    this.nodeDataSpecs.set('n8n-nodes-base.merge', {
      nodeId: '',
      nodeType: 'n8n-nodes-base.merge',
      inputTypes: {
        main: { type: 'json', description: 'Data to merge' }
      },
      outputTypes: {
        main: { type: 'json', description: 'Merged data' }
      },
      transformations: {},
      requirements: {
        requiredInputs: ['main'],
        optionalInputs: [],
        guaranteedOutputs: ['main'],
        conditionalOutputs: []
      }
    });
  }

  /**
   * Get node data specification
   */
  private getNodeDataSpec(node: N8NNode): NodeDataSpec {
    const spec = this.nodeDataSpecs.get(node.type);
    if (spec) {
      return { ...spec, nodeId: node.id };
    }

    // Return default spec for unknown nodes
    return {
      nodeId: node.id,
      nodeType: node.type,
      inputTypes: {
        main: { type: 'any', description: 'Generic input' }
      },
      outputTypes: {
        main: { type: 'any', description: 'Generic output' }
      },
      transformations: {},
      requirements: {
        requiredInputs: [],
        optionalInputs: ['main'],
        guaranteedOutputs: ['main'],
        conditionalOutputs: []
      }
    };
  }

  /**
   * Check if data types are compatible
   */
  private areDataTypesCompatible(sourceType: N8NDataType, targetType: N8NDataType): boolean {
    // Any type is compatible with everything
    if (sourceType.type === 'any' || targetType.type === 'any') {
      return true;
    }

    // Exact match
    if (sourceType.type === targetType.type) {
      return true;
    }

    // Compatible type conversions
    const compatibleConversions: Record<string, string[]> = {
      'string': ['json', 'any'],
      'number': ['string', 'json', 'any'],
      'boolean': ['string', 'json', 'any'],
      'array': ['json', 'any'],
      'object': ['json', 'any'],
      'json': ['string', 'array', 'object', 'any'],
      'null': ['any'],
      'undefined': ['any']
    };

    return compatibleConversions[sourceType.type]?.includes(targetType.type) || false;
  }

  /**
   * Validate transformation expression
   */
  private validateTransformationExpression(expression: string): boolean {
    // Basic validation for n8n expressions
    if (!expression || typeof expression !== 'string') {
      return false;
    }

    // Check for valid n8n expression patterns
    const validPatterns = [
      /\{\{.*\}\}/, // n8n expression syntax
      /\$json/, // JSON data reference
      /\$node/, // Node data reference
      /\$input/, // Input data reference
      /\$parameter/, // Parameter reference
      /\$env/, // Environment variable reference
      /\$workflow/, // Workflow data reference
      /\$execution/, // Execution data reference
    ];

    // If it contains n8n syntax, it should match at least one pattern
    if (expression.includes('{{') || expression.includes('$')) {
      return validPatterns.some(pattern => pattern.test(expression));
    }

    // Simple string values are valid
    return true;
  }

  /**
   * Validate Set node transformations
   */
  private validateSetNodeTransformations(node: N8NNode): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    if (node.parameters.values && Array.isArray(node.parameters.values)) {
      for (const value of node.parameters.values) {
        if (value.value && typeof value.value === 'string') {
          const isValid = this.validateTransformationExpression(value.value);
          
          if (!isValid) {
            results.push({
              valid: false,
              message: `Invalid Set node value expression: ${value.value}`,
              nodeId: node.id,
              severity: 'error',
              rule: 'data_transformation'
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Validate Code node transformations
   */
  private validateCodeNodeTransformations(node: N8NNode): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    if (node.parameters.code && typeof node.parameters.code === 'string') {
      // Basic JavaScript syntax validation
      try {
        // This is a simple check - in production, you might want more sophisticated validation
        new Function(node.parameters.code);
      } catch (error) {
        results.push({
          valid: false,
          message: `Invalid JavaScript code in Code node: ${error instanceof Error ? error.message : 'Syntax error'}`,
          nodeId: node.id,
          severity: 'error',
          rule: 'data_transformation'
        });
      }
    }

    return results;
  }

  /**
   * Validate Function node transformations (deprecated)
   */
  private validateFunctionNodeTransformations(node: N8NNode): ValidationResult[] {
    const results: ValidationResult[] = [];
    
    // Function node is deprecated
    results.push({
      valid: false,
      message: 'Function node is deprecated. Consider using Code node instead.',
      nodeId: node.id,
      severity: 'warning',
      rule: 'data_transformation'
    });

    if (node.parameters.functionCode && typeof node.parameters.functionCode === 'string') {
      try {
        new Function('items', node.parameters.functionCode);
      } catch (error) {
        results.push({
          valid: false,
          message: `Invalid function code: ${error instanceof Error ? error.message : 'Syntax error'}`,
          nodeId: node.id,
          severity: 'error',
          rule: 'data_transformation'
        });
      }
    }

    return results;
  }

  /**
   * Validate single data flow path
   */
  private validateSingleDataFlowPath(workflow: N8NWorkflowSchema, path: string[]): DataFlowPath {
    const dataTypes: N8NDataType[] = [];
    const transformations: DataTransformation[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    for (let i = 0; i < path.length - 1; i++) {
      const sourceNodeId = path[i];
      const targetNodeId = path[i + 1];
      
      const sourceNode = workflow.nodes.find(n => n.id === sourceNodeId);
      const targetNode = workflow.nodes.find(n => n.id === targetNodeId);
      
      if (!sourceNode || !targetNode) {
        errors.push(`Missing node in path: ${sourceNodeId} -> ${targetNodeId}`);
        continue;
      }

      const sourceSpec = this.getNodeDataSpec(sourceNode);
      const targetSpec = this.getNodeDataSpec(targetNode);
      
      // Find the connection between these nodes
      const connection = this.findConnection(workflow, sourceNodeId, targetNodeId);
      if (!connection) {
        errors.push(`No connection found between ${sourceNodeId} and ${targetNodeId}`);
        continue;
      }

      const sourceOutputType = sourceSpec.outputTypes[connection.outputType];
      const targetInputType = targetSpec.inputTypes[connection.inputType];
      
      if (sourceOutputType) {
        dataTypes.push(sourceOutputType);
      }

      if (sourceOutputType && targetInputType) {
        const transformation: DataTransformation = {
          sourceType: sourceOutputType,
          targetType: targetInputType,
          transformation: targetSpec.transformations[connection.inputType] || '{{ $json }}',
          isValid: this.areDataTypesCompatible(sourceOutputType, targetInputType),
          errorMessage: undefined
        };

        if (!transformation.isValid) {
          transformation.errorMessage = `Type mismatch: ${sourceOutputType.type} -> ${targetInputType.type}`;
          errors.push(transformation.errorMessage);
        }

        transformations.push(transformation);
      }
    }

    return {
      path,
      dataTypes,
      transformations,
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Analyze data flow paths
   */
  private analyzeDataFlowPaths(workflow: N8NWorkflowSchema, dataFlowAnalysis: DataFlowAnalysis): DataFlowPath[] {
    return dataFlowAnalysis.connectionPaths.map(path => 
      this.validateSingleDataFlowPath(workflow, path.path)
    );
  }

  /**
   * Analyze individual node data flow
   */
  private analyzeNodeDataFlow(workflow: N8NWorkflowSchema): Array<{
    nodeId: string;
    inputCompatibility: boolean;
    outputCompatibility: boolean;
    transformationValidity: boolean;
    issues: string[];
  }> {
    return workflow.nodes.map(node => {
      const spec = this.getNodeDataSpec(node);
      const issues: string[] = [];
      
      // Check input compatibility
      const inputCompatibility = this.checkNodeInputCompatibility(workflow, node, spec, issues);
      
      // Check output compatibility
      const outputCompatibility = this.checkNodeOutputCompatibility(workflow, node, spec, issues);
      
      // Check transformation validity
      const transformationValidity = this.checkNodeTransformationValidity(node, spec, issues);

      return {
        nodeId: node.id,
        inputCompatibility,
        outputCompatibility,
        transformationValidity,
        issues
      };
    });
  }

  /**
   * Generate data flow recommendations
   */
  private generateDataFlowRecommendations(
    workflow: N8NWorkflowSchema, 
    validationResults: ValidationResult[], 
    pathAnalysis: DataFlowPath[]
  ): string[] {
    const recommendations: string[] = [];

    // Analyze common issues
    const typeIssues = validationResults.filter(r => r.message?.includes('type'));
    const transformationIssues = validationResults.filter(r => r.message?.includes('transformation'));
    const invalidPaths = pathAnalysis.filter(p => !p.isValid);

    if (typeIssues.length > 0) {
      recommendations.push('Consider adding Set nodes to transform data types between incompatible nodes');
    }

    if (transformationIssues.length > 0) {
      recommendations.push('Review transformation expressions for syntax errors and n8n compatibility');
    }

    if (invalidPaths.length > 0) {
      recommendations.push('Add data validation and error handling for problematic data flow paths');
    }

    // Check for deprecated nodes
    const deprecatedNodes = validationResults.filter(r => r.message?.includes('deprecated'));
    if (deprecatedNodes.length > 0) {
      recommendations.push('Replace deprecated Function nodes with Code nodes for better performance and maintainability');
    }

    // Check for potential data loss
    const dataLossWarnings = validationResults.filter(r => r.message?.includes('data loss'));
    if (dataLossWarnings.length > 0) {
      recommendations.push('Consider adding output connections or data storage for nodes that receive but do not forward data');
    }

    return recommendations;
  }

  /**
   * Helper methods
   */
  private nodeHasInput(workflow: N8NWorkflowSchema, nodeId: string, inputType: string): boolean {
    for (const outputs of Object.values(workflow.connections)) {
      for (const connectionList of Object.values(outputs)) {
        for (const connection of connectionList) {
          if (connection.node === nodeId && connection.type === inputType) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private nodeHasOutput(workflow: N8NWorkflowSchema, nodeId: string, outputType: string): boolean {
    return workflow.connections[nodeId]?.[outputType]?.length > 0 || false;
  }

  private nodeHasConnectedInputs(workflow: N8NWorkflowSchema, nodeId: string): boolean {
    for (const outputs of Object.values(workflow.connections)) {
      for (const connectionList of Object.values(outputs)) {
        for (const connection of connectionList) {
          if (connection.node === nodeId) {
            return true;
          }
        }
      }
    }
    return false;
  }

  private nodeHasConnectedOutputs(workflow: N8NWorkflowSchema, nodeId: string): boolean {
    return Object.keys(workflow.connections[nodeId] || {}).length > 0;
  }

  private isValidDataFlowExitPoint(node: N8NNode): boolean {
    const validExitTypes = [
      'n8n-nodes-base.webhook',
      'n8n-nodes-base.respondToWebhook',
      'n8n-nodes-base.emailSend',
      'n8n-nodes-base.slackSend',
      'n8n-nodes-base.httpRequest',
      'n8n-nodes-base.writeFile',
      'n8n-nodes-base.set' // Can be a valid terminator for data preparation
    ];
    
    return validExitTypes.includes(node.type);
  }

  private isValidDataFlowTerminator(node: N8NNode): boolean {
    const validTerminators = [
      'n8n-nodes-base.emailSend',
      'n8n-nodes-base.slackSend',
      'n8n-nodes-base.webhook',
      'n8n-nodes-base.respondToWebhook',
      'n8n-nodes-base.writeFile',
      'n8n-nodes-base.database',
      'n8n-nodes-base.httpRequest'
    ];
    
    return validTerminators.includes(node.type);
  }

  private findConnection(workflow: N8NWorkflowSchema, sourceNodeId: string, targetNodeId: string): {
    outputType: string;
    inputType: string;
  } | null {
    if (!workflow.connections[sourceNodeId]) return null;
    
    for (const [outputType, connectionList] of Object.entries(workflow.connections[sourceNodeId])) {
      for (const connection of connectionList) {
        if (connection.node === targetNodeId) {
          return {
            outputType,
            inputType: connection.type
          };
        }
      }
    }
    
    return null;
  }

  private checkNodeInputCompatibility(workflow: N8NWorkflowSchema, node: N8NNode, spec: NodeDataSpec, issues: string[]): boolean {
    // Implementation for checking input compatibility
    return true; // Simplified for now
  }

  private checkNodeOutputCompatibility(workflow: N8NWorkflowSchema, node: N8NNode, spec: NodeDataSpec, issues: string[]): boolean {
    // Implementation for checking output compatibility
    return true; // Simplified for now
  }

  private checkNodeTransformationValidity(node: N8NNode, spec: NodeDataSpec, issues: string[]): boolean {
    // Implementation for checking transformation validity
    return true; // Simplified for now
  }
} 