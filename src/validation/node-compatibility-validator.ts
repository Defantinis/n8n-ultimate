/**
 * Node Compatibility Validator
 * Validates n8n node compatibility, parameters, and connections
 */

import {
  N8NWorkflowSchema,
  N8NNode,
  N8NConnections,
  ValidationResult,
  N8N_CORE_NODES,
  NODE_PARAMETER_SCHEMAS,
  WorkflowSchemaUtils
} from './n8n-workflow-schema';

/**
 * Node type categories for compatibility validation
 */
export const NODE_CATEGORIES = {
  TRIGGER: 'trigger',
  ACTION: 'action',
  TRANSFORM: 'transform',
  CONTROL: 'control',
  OUTPUT: 'output'
} as const;

/**
 * Node compatibility information
 */
export interface NodeCompatibilityInfo {
  category: string;
  supportedInputTypes: string[];
  supportedOutputTypes: string[];
  requiredParameters: string[];
  optionalParameters: string[];
  maxInputConnections: number;
  maxOutputConnections: number;
  minTypeVersion: number;
  maxTypeVersion: number;
  deprecatedInVersion?: string;
  replacedBy?: string;
}

/**
 * Connection compatibility information
 */
export interface ConnectionCompatibilityInfo {
  sourceNodeType: string;
  targetNodeType: string;
  outputType: string;
  inputType: string;
  compatible: boolean;
  reason?: string;
}

/**
 * Node compatibility database
 */
export const NODE_COMPATIBILITY_DB: Record<string, NodeCompatibilityInfo> = {
  [N8N_CORE_NODES.MANUAL_TRIGGER]: {
    category: NODE_CATEGORIES.TRIGGER,
    supportedInputTypes: [],
    supportedOutputTypes: ['main'],
    requiredParameters: [],
    optionalParameters: [],
    maxInputConnections: 0,
    maxOutputConnections: 1,
    minTypeVersion: 1,
    maxTypeVersion: 2
  },
  [N8N_CORE_NODES.WEBHOOK]: {
    category: NODE_CATEGORIES.TRIGGER,
    supportedInputTypes: [],
    supportedOutputTypes: ['main'],
    requiredParameters: ['path'],
    optionalParameters: ['httpMethod', 'responseMode', 'responseData'],
    maxInputConnections: 0,
    maxOutputConnections: 1,
    minTypeVersion: 1,
    maxTypeVersion: 2
  },
  [N8N_CORE_NODES.CRON]: {
    category: NODE_CATEGORIES.TRIGGER,
    supportedInputTypes: [],
    supportedOutputTypes: ['main'],
    requiredParameters: ['triggerTimes'],
    optionalParameters: ['timezone'],
    maxInputConnections: 0,
    maxOutputConnections: 1,
    minTypeVersion: 1,
    maxTypeVersion: 1
  },
  [N8N_CORE_NODES.HTTP_REQUEST]: {
    category: NODE_CATEGORIES.ACTION,
    supportedInputTypes: ['main'],
    supportedOutputTypes: ['main', 'error'],
    requiredParameters: ['url', 'method'],
    optionalParameters: ['headers', 'body', 'authentication', 'timeout'],
    maxInputConnections: 1,
    maxOutputConnections: 2,
    minTypeVersion: 1,
    maxTypeVersion: 4
  },
  [N8N_CORE_NODES.SET]: {
    category: NODE_CATEGORIES.TRANSFORM,
    supportedInputTypes: ['main'],
    supportedOutputTypes: ['main'],
    requiredParameters: ['values'],
    optionalParameters: ['keepOnlySet'],
    maxInputConnections: 1,
    maxOutputConnections: 1,
    minTypeVersion: 1,
    maxTypeVersion: 3
  },
  [N8N_CORE_NODES.CODE]: {
    category: NODE_CATEGORIES.TRANSFORM,
    supportedInputTypes: ['main'],
    supportedOutputTypes: ['main', 'error'],
    requiredParameters: ['code'],
    optionalParameters: ['mode', 'workflowStaticData'],
    maxInputConnections: 1,
    maxOutputConnections: 2,
    minTypeVersion: 1,
    maxTypeVersion: 2
  },
  [N8N_CORE_NODES.FUNCTION]: {
    category: NODE_CATEGORIES.TRANSFORM,
    supportedInputTypes: ['main'],
    supportedOutputTypes: ['main'],
    requiredParameters: ['functionCode'],
    optionalParameters: [],
    maxInputConnections: 1,
    maxOutputConnections: 1,
    minTypeVersion: 1,
    maxTypeVersion: 1,
    deprecatedInVersion: '1.0.0',
    replacedBy: N8N_CORE_NODES.CODE
  },
  [N8N_CORE_NODES.IF]: {
    category: NODE_CATEGORIES.CONTROL,
    supportedInputTypes: ['main'],
    supportedOutputTypes: ['main'],
    requiredParameters: ['conditions'],
    optionalParameters: ['combineOperation'],
    maxInputConnections: 1,
    maxOutputConnections: 2, // true and false branches
    minTypeVersion: 1,
    maxTypeVersion: 2
  },
  [N8N_CORE_NODES.SWITCH]: {
    category: NODE_CATEGORIES.CONTROL,
    supportedInputTypes: ['main'],
    supportedOutputTypes: ['main'],
    requiredParameters: ['rules'],
    optionalParameters: ['fallbackOutput'],
    maxInputConnections: 1,
    maxOutputConnections: 4, // Multiple output branches
    minTypeVersion: 1,
    maxTypeVersion: 3
  },
  [N8N_CORE_NODES.MERGE]: {
    category: NODE_CATEGORIES.CONTROL,
    supportedInputTypes: ['main'],
    supportedOutputTypes: ['main'],
    requiredParameters: ['mode'],
    optionalParameters: ['mergeByFields', 'options'],
    maxInputConnections: 2,
    maxOutputConnections: 1,
    minTypeVersion: 1,
    maxTypeVersion: 3
  },
  [N8N_CORE_NODES.SPLIT_IN_BATCHES]: {
    category: NODE_CATEGORIES.CONTROL,
    supportedInputTypes: ['main'],
    supportedOutputTypes: ['main'],
    requiredParameters: ['batchSize'],
    optionalParameters: ['options'],
    maxInputConnections: 1,
    maxOutputConnections: 1,
    minTypeVersion: 1,
    maxTypeVersion: 3
  },
  [N8N_CORE_NODES.OPENAI]: {
    category: NODE_CATEGORIES.ACTION,
    supportedInputTypes: ['main'],
    supportedOutputTypes: ['main', 'error'],
    requiredParameters: ['resource', 'operation'],
    optionalParameters: ['model', 'prompt', 'maxTokens', 'temperature'],
    maxInputConnections: 1,
    maxOutputConnections: 2,
    minTypeVersion: 1,
    maxTypeVersion: 1
  },
  [N8N_CORE_NODES.ANTHROPIC]: {
    category: NODE_CATEGORIES.ACTION,
    supportedInputTypes: ['main'],
    supportedOutputTypes: ['main', 'error'],
    requiredParameters: ['resource', 'operation'],
    optionalParameters: ['model', 'prompt', 'maxTokens'],
    maxInputConnections: 1,
    maxOutputConnections: 2,
    minTypeVersion: 1,
    maxTypeVersion: 1
  }
};

/**
 * Connection compatibility rules
 */
export const CONNECTION_COMPATIBILITY_RULES: ConnectionCompatibilityInfo[] = [
  // Trigger nodes can only be sources, not targets
  {
    sourceNodeType: 'any',
    targetNodeType: N8N_CORE_NODES.MANUAL_TRIGGER,
    outputType: 'main',
    inputType: 'main',
    compatible: false,
    reason: 'Trigger nodes cannot receive input connections'
  },
  {
    sourceNodeType: 'any',
    targetNodeType: N8N_CORE_NODES.WEBHOOK,
    outputType: 'main',
    inputType: 'main',
    compatible: false,
    reason: 'Webhook trigger nodes cannot receive input connections'
  },
  // Error outputs can only connect to nodes that accept error inputs
  {
    sourceNodeType: 'any',
    targetNodeType: 'any',
    outputType: 'error',
    inputType: 'main',
    compatible: false,
    reason: 'Error outputs cannot connect to main inputs'
  },
  // Control flow nodes have special connection rules
  {
    sourceNodeType: N8N_CORE_NODES.IF,
    targetNodeType: 'any',
    outputType: 'main',
    inputType: 'main',
    compatible: true,
    reason: 'IF node can connect to any node accepting main input'
  }
];

/**
 * Node Compatibility Validator Class
 */
export class NodeCompatibilityValidator {
  private compatibilityDB: Record<string, NodeCompatibilityInfo>;
  private connectionRules: ConnectionCompatibilityInfo[];

  constructor(
    customCompatibilityDB?: Record<string, NodeCompatibilityInfo>,
    customConnectionRules?: ConnectionCompatibilityInfo[]
  ) {
    this.compatibilityDB = { ...NODE_COMPATIBILITY_DB, ...customCompatibilityDB };
    this.connectionRules = [...CONNECTION_COMPATIBILITY_RULES, ...(customConnectionRules || [])];
  }

  /**
   * Validate all nodes in a workflow for compatibility
   */
  validateWorkflowNodeCompatibility(workflow: N8NWorkflowSchema): ValidationResult[] {
    const results: ValidationResult[] = [];

    for (const node of workflow.nodes) {
      const nodeResults = this.validateNode(node, workflow);
      results.push(...nodeResults);
    }

    return results;
  }

  /**
   * Validate a single node for compatibility
   */
  validateNode(node: N8NNode, workflow?: N8NWorkflowSchema): ValidationResult[] {
    const results: ValidationResult[] = [];

    // Check if node type is supported
    const typeValidation = this.validateNodeType(node);
    results.push(typeValidation);

    if (!typeValidation.valid) {
      return results; // Skip further validation if type is invalid
    }

    // Validate node version
    const versionValidation = this.validateNodeVersion(node);
    results.push(versionValidation);

    // Validate node parameters
    const parameterValidation = this.validateNodeParameters(node);
    results.push(parameterValidation);

    // Validate connections if workflow is provided
    if (workflow) {
      const connectionValidation = this.validateNodeConnections(node, workflow);
      results.push(...connectionValidation);
    }

    // Check for deprecated nodes
    const deprecationValidation = this.validateNodeDeprecation(node);
    if (deprecationValidation) {
      results.push(deprecationValidation);
    }

    return results.filter(result => result !== null);
  }

  /**
   * Validate node type compatibility
   */
  private validateNodeType(node: N8NNode): ValidationResult {
    if (!node.type || typeof node.type !== 'string') {
      return {
        valid: false,
        message: `Node ${node.id} has invalid or missing type`,
        nodeId: node.id,
        severity: 'error'
      };
    }

    const compatibilityInfo = this.compatibilityDB[node.type];
    if (!compatibilityInfo) {
      return {
        valid: false,
        message: `Node type ${node.type} is not supported or recognized`,
        nodeId: node.id,
        severity: 'warning'
      };
    }

    return {
      valid: true,
      message: `Node type ${node.type} is supported`,
      nodeId: node.id,
      severity: 'info'
    };
  }

  /**
   * Validate node version compatibility
   */
  private validateNodeVersion(node: N8NNode): ValidationResult {
    const compatibilityInfo = this.compatibilityDB[node.type];
    if (!compatibilityInfo) {
      return {
        valid: true,
        message: `Cannot validate version for unknown node type ${node.type}`,
        nodeId: node.id,
        severity: 'info'
      };
    }

    const nodeVersion = node.typeVersion || 1;

    if (nodeVersion < compatibilityInfo.minTypeVersion) {
      return {
        valid: false,
        message: `Node ${node.id} version ${nodeVersion} is below minimum supported version ${compatibilityInfo.minTypeVersion}`,
        nodeId: node.id,
        severity: 'error'
      };
    }

    if (nodeVersion > compatibilityInfo.maxTypeVersion) {
      return {
        valid: false,
        message: `Node ${node.id} version ${nodeVersion} is above maximum supported version ${compatibilityInfo.maxTypeVersion}`,
        nodeId: node.id,
        severity: 'warning'
      };
    }

    return {
      valid: true,
      message: `Node version ${nodeVersion} is compatible`,
      nodeId: node.id,
      severity: 'info'
    };
  }

  /**
   * Validate node parameters
   */
  private validateNodeParameters(node: N8NNode): ValidationResult {
    const compatibilityInfo = this.compatibilityDB[node.type];
    if (!compatibilityInfo) {
      return {
        valid: true,
        message: `Cannot validate parameters for unknown node type ${node.type}`,
        nodeId: node.id,
        severity: 'info'
      };
    }

    // Check required parameters
    for (const requiredParam of compatibilityInfo.requiredParameters) {
      if (!node.parameters || !(requiredParam in node.parameters)) {
        return {
          valid: false,
          message: `Node ${node.id} is missing required parameter: ${requiredParam}`,
          nodeId: node.id,
          severity: 'error'
        };
      }
    }

    // Use existing parameter validation from schema utils
    const schemaValidation = WorkflowSchemaUtils.validateNodeParameters(
      node.type,
      node.parameters || {}
    );

    return {
      valid: schemaValidation.valid,
      message: schemaValidation.message || `Parameters validation ${schemaValidation.valid ? 'passed' : 'failed'}`,
      nodeId: node.id,
      severity: schemaValidation.valid ? 'info' : 'error'
    };
  }

  /**
   * Validate node connections
   */
  private validateNodeConnections(node: N8NNode, workflow: N8NWorkflowSchema): ValidationResult[] {
    const results: ValidationResult[] = [];
    const compatibilityInfo = this.compatibilityDB[node.type];

    if (!compatibilityInfo) {
      return [{
        valid: true,
        message: `Cannot validate connections for unknown node type ${node.type}`,
        nodeId: node.id,
        severity: 'info'
      }];
    }

    // Count input connections
    let inputConnectionCount = 0;
    for (const [sourceId, outputs] of Object.entries(workflow.connections)) {
      for (const outputType of Object.values(outputs)) {
        for (const connection of outputType) {
          if (connection.node === node.id) {
            inputConnectionCount++;
          }
        }
      }
    }

    // Validate input connection count
    if (inputConnectionCount > compatibilityInfo.maxInputConnections) {
      results.push({
        valid: false,
        message: `Node ${node.id} has ${inputConnectionCount} input connections, but maximum allowed is ${compatibilityInfo.maxInputConnections}`,
        nodeId: node.id,
        severity: 'error'
      });
    }

    // Count output connections
    let outputConnectionCount = 0;
    if (workflow.connections[node.id]) {
      for (const outputs of Object.values(workflow.connections[node.id])) {
        outputConnectionCount += outputs.length;
      }
    }

    // Validate output connection count
    if (outputConnectionCount > compatibilityInfo.maxOutputConnections) {
      results.push({
        valid: false,
        message: `Node ${node.id} has ${outputConnectionCount} output connections, but maximum allowed is ${compatibilityInfo.maxOutputConnections}`,
        nodeId: node.id,
        severity: 'error'
      });
    }

    // Validate specific connection types
    if (workflow.connections[node.id]) {
      for (const [outputType, connections] of Object.entries(workflow.connections[node.id])) {
        if (!compatibilityInfo.supportedOutputTypes.includes(outputType)) {
          results.push({
            valid: false,
            message: `Node ${node.id} does not support output type: ${outputType}`,
            nodeId: node.id,
            severity: 'error'
          });
        }

        // Validate each connection
        for (const connection of connections) {
          const connectionValidation = this.validateConnection(
            node.type,
            workflow.nodes.find(n => n.id === connection.node)?.type || 'unknown',
            outputType,
            connection.type
          );

          if (!connectionValidation.compatible) {
            results.push({
              valid: false,
              message: `Invalid connection from ${node.id} to ${connection.node}: ${connectionValidation.reason}`,
              nodeId: node.id,
              connectionId: connection.node,
              severity: 'error'
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Validate a specific connection between two nodes
   */
  private validateConnection(
    sourceNodeType: string,
    targetNodeType: string,
    outputType: string,
    inputType: string
  ): ConnectionCompatibilityInfo {
    // Check specific rules first
    for (const rule of this.connectionRules) {
      if (
        (rule.sourceNodeType === 'any' || rule.sourceNodeType === sourceNodeType) &&
        (rule.targetNodeType === 'any' || rule.targetNodeType === targetNodeType) &&
        rule.outputType === outputType &&
        rule.inputType === inputType
      ) {
        return rule;
      }
    }

    // Default compatibility check
    const sourceInfo = this.compatibilityDB[sourceNodeType];
    const targetInfo = this.compatibilityDB[targetNodeType];

    if (!sourceInfo || !targetInfo) {
      return {
        sourceNodeType,
        targetNodeType,
        outputType,
        inputType,
        compatible: true, // Allow unknown node types with warning
        reason: 'Unknown node type - compatibility cannot be determined'
      };
    }

    // Check if source supports this output type
    if (!sourceInfo.supportedOutputTypes.includes(outputType)) {
      return {
        sourceNodeType,
        targetNodeType,
        outputType,
        inputType,
        compatible: false,
        reason: `Source node does not support output type: ${outputType}`
      };
    }

    // Check if target supports this input type
    if (!targetInfo.supportedInputTypes.includes(inputType)) {
      return {
        sourceNodeType,
        targetNodeType,
        outputType,
        inputType,
        compatible: false,
        reason: `Target node does not support input type: ${inputType}`
      };
    }

    return {
      sourceNodeType,
      targetNodeType,
      outputType,
      inputType,
      compatible: true
    };
  }

  /**
   * Check for deprecated nodes
   */
  private validateNodeDeprecation(node: N8NNode): ValidationResult | null {
    const compatibilityInfo = this.compatibilityDB[node.type];
    if (!compatibilityInfo || !compatibilityInfo.deprecatedInVersion) {
      return null;
    }

    return {
      valid: true, // Deprecated but still functional
      message: `Node ${node.id} uses deprecated node type ${node.type}. ${
        compatibilityInfo.replacedBy 
          ? `Consider using ${compatibilityInfo.replacedBy} instead.`
          : 'Consider updating to a newer node type.'
      }`,
      nodeId: node.id,
      severity: 'warning'
    };
  }

  /**
   * Get compatibility information for a node type
   */
  getNodeCompatibilityInfo(nodeType: string): NodeCompatibilityInfo | null {
    return this.compatibilityDB[nodeType] || null;
  }

  /**
   * Add custom node compatibility information
   */
  addNodeCompatibility(nodeType: string, info: NodeCompatibilityInfo): void {
    this.compatibilityDB[nodeType] = info;
  }

  /**
   * Add custom connection rule
   */
  addConnectionRule(rule: ConnectionCompatibilityInfo): void {
    this.connectionRules.push(rule);
  }

  /**
   * Get all supported node types
   */
  getSupportedNodeTypes(): string[] {
    return Object.keys(this.compatibilityDB);
  }

  /**
   * Get nodes by category
   */
  getNodesByCategory(category: string): string[] {
    return Object.entries(this.compatibilityDB)
      .filter(([, info]) => info.category === category)
      .map(([nodeType]) => nodeType);
  }

  /**
   * Generate compatibility report for a workflow
   */
  generateCompatibilityReport(workflow: N8NWorkflowSchema): {
    summary: {
      totalNodes: number;
      compatibleNodes: number;
      incompatibleNodes: number;
      warnings: number;
      errors: number;
    };
    details: ValidationResult[];
    recommendations: string[];
  } {
    const results = this.validateWorkflowNodeCompatibility(workflow);
    
    const summary = {
      totalNodes: workflow.nodes.length,
      compatibleNodes: 0,
      incompatibleNodes: 0,
      warnings: 0,
      errors: 0
    };

    const recommendations: string[] = [];

    // Group results by node
    const nodeResults = new Map<string, ValidationResult[]>();
    for (const result of results) {
      if (result.nodeId) {
        if (!nodeResults.has(result.nodeId)) {
          nodeResults.set(result.nodeId, []);
        }
        nodeResults.get(result.nodeId)!.push(result);
      }
    }

    // Analyze results
    for (const [nodeId, nodeResultsArray] of Array.from(nodeResults.entries())) {
      const hasErrors = nodeResultsArray.some(r => r.severity === 'error' && !r.valid);
      const hasWarnings = nodeResultsArray.some(r => r.severity === 'warning');

      if (hasErrors) {
        summary.incompatibleNodes++;
        summary.errors += nodeResultsArray.filter(r => r.severity === 'error' && !r.valid).length;
      } else {
        summary.compatibleNodes++;
      }

      if (hasWarnings) {
        summary.warnings += nodeResultsArray.filter(r => r.severity === 'warning').length;
      }

      // Generate recommendations
      const deprecatedResults = nodeResultsArray.filter(r => r.message?.includes('deprecated'));
      for (const deprecatedResult of deprecatedResults) {
        recommendations.push(deprecatedResult.message || '');
      }
    }

    return {
      summary,
      details: results,
      recommendations: Array.from(new Set(recommendations)) // Remove duplicates
    };
  }
}

/**
 * Utility functions for node compatibility
 */
export const NodeCompatibilityUtils = {
  /**
   * Check if two node types can be connected
   */
  canConnect(
    sourceNodeType: string,
    targetNodeType: string,
    outputType: string = 'main',
    inputType: string = 'main',
    validator?: NodeCompatibilityValidator
  ): boolean {
    const validatorInstance = validator || new NodeCompatibilityValidator();
    const result = validatorInstance['validateConnection'](
      sourceNodeType,
      targetNodeType,
      outputType,
      inputType
    );
    return result.compatible;
  },

  /**
   * Get recommended replacement for deprecated node
   */
  getReplacementNode(nodeType: string): string | null {
    const info = NODE_COMPATIBILITY_DB[nodeType];
    return info?.replacedBy || null;
  },

  /**
   * Check if node is deprecated
   */
  isNodeDeprecated(nodeType: string): boolean {
    const info = NODE_COMPATIBILITY_DB[nodeType];
    return !!info?.deprecatedInVersion;
  },

  /**
   * Get node category
   */
  getNodeCategory(nodeType: string): string | null {
    const info = NODE_COMPATIBILITY_DB[nodeType];
    return info?.category || null;
  }
}; 