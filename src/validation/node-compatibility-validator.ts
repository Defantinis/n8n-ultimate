/**
 * Node Compatibility Validator
 * Validates n8n node compatibility, parameters, and connections
 */

import {
  N8nWorkflow,
  N8nNode,
  N8nConnections,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '../types/n8n-workflow.js';

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
 * Common N8N Node Types
 */
export const N8N_CORE_NODES = {
  // Core nodes
  START: 'n8n-nodes-base.start',
  MANUAL_TRIGGER: 'n8n-nodes-base.manualTrigger',
  WEBHOOK: 'n8n-nodes-base.webhook',
  CRON: 'n8n-nodes-base.cron',
  
  // Data manipulation
  SET: 'n8n-nodes-base.set',
  CODE: 'n8n-nodes-base.code',
  FUNCTION: 'n8n-nodes-base.function',
  FUNCTION_ITEM: 'n8n-nodes-base.functionItem',
  
  // Flow control
  IF: 'n8n-nodes-base.if',
  SWITCH: 'n8n-nodes-base.switch',
  MERGE: 'n8n-nodes-base.merge',
  SPLIT_IN_BATCHES: 'n8n-nodes-base.splitInBatches',
  
  // HTTP and API
  HTTP_REQUEST: 'n8n-nodes-base.httpRequest',
  
  // Database
  POSTGRES: 'n8n-nodes-base.postgres',
  MYSQL: 'n8n-nodes-base.mySql',
  MONGODB: 'n8n-nodes-base.mongoDb',
  
  // Cloud services
  AWS_S3: 'n8n-nodes-base.awsS3',
  GOOGLE_SHEETS: 'n8n-nodes-base.googleSheets',
  
  // Communication
  EMAIL_SEND: 'n8n-nodes-base.emailSend',
  SLACK: 'n8n-nodes-base.slack',
  
  // AI and ML
  OPENAI: 'n8n-nodes-base.openAi',
  ANTHROPIC: 'n8n-nodes-base.anthropic'
} as const;

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
    this.compatibilityDB = customCompatibilityDB || NODE_COMPATIBILITY_DB;
    this.connectionRules = customConnectionRules || CONNECTION_COMPATIBILITY_RULES;
  }

  /**
   * Validate all nodes in a workflow for compatibility
   */
  validateWorkflowNodeCompatibility(workflow: N8nWorkflow): ValidationResult {
    const allErrors: ValidationError[] = [];
    const allWarnings: ValidationWarning[] = [];
    for (const node of workflow.nodes) {
      const result = this.validateNode(node, workflow);
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }
    return {
        isValid: allErrors.length === 0,
        errors: allErrors,
        warnings: allWarnings
    };
  }

  /**
   * Validate a single node's compatibility
   */
  validateNode(node: N8nNode, workflow?: N8nWorkflow): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate node type existence
    const typeResult = this.validateNodeType(node);
    errors.push(...typeResult.errors);
    warnings.push(...typeResult.warnings);

    // Validate node version
    const versionResult = this.validateNodeVersion(node);
    errors.push(...versionResult.errors);
    warnings.push(...versionResult.warnings);

    // Validate node parameters
    const paramsResult = this.validateNodeParameters(node);
    errors.push(...paramsResult.errors);
    warnings.push(...paramsResult.warnings);

    // Validate node connections if workflow is provided
    if (workflow) {
      const connResult = this.validateNodeConnections(node, workflow);
      errors.push(...connResult.errors);
      warnings.push(...connResult.warnings);
    }
    
    // Check for deprecation
    const deprecationResult = this.validateNodeDeprecation(node);
    if (deprecationResult) {
      warnings.push(...deprecationResult.warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate node type compatibility
   */
  private validateNodeType(node: N8nNode): ValidationResult {
    const errors: ValidationError[] = [];

    if (!node.type || typeof node.type !== 'string') {
      errors.push({
        type: 'node',
        message: `Node ${node.id} has an invalid type`,
        nodeId: node.id,
        severity: 'error'
      });
    } else if (!this.compatibilityDB[node.type]) {
      errors.push({
        type: 'node',
        message: `Node type '${node.type}' is not supported or recognized`,
        nodeId: node.id,
        severity: 'error'
      });
    }

    return { isValid: errors.length === 0, errors, warnings: [] };
  }

  /**
   * Validate node version compatibility
   */
  private validateNodeVersion(node: N8nNode): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const compatibilityInfo = this.compatibilityDB[node.type];

    if (!compatibilityInfo) {
      return { isValid: true, errors, warnings }; // Type validation will handle this
    }

    if (node.typeVersion < compatibilityInfo.minTypeVersion) {
      errors.push({
        type: 'node',
        message: `Node type '${node.type}' version ${node.typeVersion} is outdated. Minimum required version is ${compatibilityInfo.minTypeVersion}`,
        nodeId: node.id,
        severity: 'error'
      });
    }

    if (node.typeVersion > compatibilityInfo.maxTypeVersion) {
      warnings.push({
        type: 'compatibility',
        message: `Node type '${node.type}' version ${node.typeVersion} is newer than supported version ${compatibilityInfo.maxTypeVersion}. It may cause issues.`,
        nodeId: node.id,
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
  }

  /**
   * Validate node parameters
   */
  private validateNodeParameters(node: N8nNode): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const compatibilityInfo = this.compatibilityDB[node.type];
    if (!compatibilityInfo) {
      return { isValid: true, errors, warnings };
    }

    // Check required parameters
    for (const requiredParam of compatibilityInfo.requiredParameters) {
      if (!node.parameters || !(requiredParam in node.parameters)) {
        errors.push({
          type: 'parameter',
          message: `Node ${node.id} is missing required parameter: ${requiredParam}`,
          nodeId: node.id,
          severity: 'error'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate node connections
   */
  private validateNodeConnections(node: N8nNode, workflow: N8nWorkflow): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const compatibilityInfo = this.compatibilityDB[node.type];

    if (!compatibilityInfo) {
      return { isValid: true, errors, warnings };
    }

    // Validate input connections
    const inputConnections = this.countInputConnections(node.id, workflow);
    if (inputConnections > compatibilityInfo.maxInputConnections) {
      errors.push({
        type: 'connection',
        message: `Node ${node.id} has too many input connections. Max: ${compatibilityInfo.maxInputConnections}, found: ${inputConnections}`,
        nodeId: node.id,
        severity: 'error'
      });
    }

    // Validate output connections
    const outputConnections = this.countOutputConnections(node.id, workflow);
    if (outputConnections > compatibilityInfo.maxOutputConnections) {
      errors.push({
        type: 'connection',
        message: `Node ${node.id} has too many output connections. Max: ${compatibilityInfo.maxOutputConnections}, found: ${outputConnections}`,
        nodeId: node.id,
        severity: 'error'
      });
    }

    return { isValid: errors.length === 0, errors, warnings };
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
  private validateNodeDeprecation(node: N8nNode): ValidationResult | null {
    const compatibilityInfo = this.compatibilityDB[node.type];
    if (!compatibilityInfo || !compatibilityInfo.deprecatedInVersion) {
      return null;
    }

    const warning: ValidationWarning = {
        type: 'compatibility',
        message: `Node type '${node.type}' is deprecated since version ${compatibilityInfo.deprecatedInVersion}. Consider replacing with '${compatibilityInfo.replacedBy}'.`,
        nodeId: node.id
    };
    
    return {
      isValid: true,
      errors: [],
      warnings: [warning]
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
   * Generate a compatibility report for the workflow
   */
  generateCompatibilityReport(workflow: N8nWorkflow): {
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
    const details = workflow.nodes.map(node => this.validateNode(node, workflow));
    const errorsCount = details.reduce((acc, r) => acc + r.errors.length, 0);
    const warningsCount = details.reduce((acc, r) => acc + r.warnings.length, 0);

    const summary = {
      totalNodes: workflow.nodes.length,
      compatibleNodes: details.filter(r => r.isValid).length,
      incompatibleNodes: details.filter(r => !r.isValid).length,
      warnings: warningsCount,
      errors: errorsCount
    };

    const recommendations = this.generateRecommendations(details);

    return { summary, details, recommendations };
  }

  private generateRecommendations(results: ValidationResult[]): string[] {
    const recommendations: string[] = [];
    for (const result of results) {
        if (!result.isValid) {
            for(const error of result.errors) {
                if (error.message.includes('deprecated')) {
                    recommendations.push(`Replace deprecated node ${error.nodeId}`);
                }
            }
        }
    }
    return recommendations;
  }

  private countInputConnections(nodeId: string, workflow: N8nWorkflow): number {
    let count = 0;
    for (const sourceNode of Object.values(workflow.connections)) {
        for (const output of Object.values(sourceNode)) {
            for (const connection of output) {
                if (connection.node === nodeId) {
                    count++;
                }
            }
        }
    }
    return count;
  }

  private countOutputConnections(nodeId: string, workflow: N8nWorkflow): number {
    let count = 0;
    if (workflow.connections[nodeId]) {
        for (const output of Object.values(workflow.connections[nodeId])) {
            count += output.length;
        }
    }
    return count;
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