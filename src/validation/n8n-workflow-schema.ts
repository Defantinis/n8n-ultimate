/**
 * N8N Workflow Schema Definition
 * Comprehensive schema for validating n8n workflow structure
 */

export interface N8NWorkflowSchema {
  name: string;
  active: boolean;
  nodes: N8NNode[];
  connections: N8NConnections;
  createdAt?: string;
  updatedAt?: string;
  id?: string;
  hash?: string;
  versionId?: string;
  meta?: WorkflowMetadata;
  settings?: WorkflowSettings;
  staticData?: Record<string, any>;
  pinData?: Record<string, any>;
  tags?: WorkflowTag[];
}

export interface N8NNode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  parameters: Record<string, any>;
  credentials?: Record<string, string>;
  webhookId?: string;
  disabled?: boolean;
  notes?: string;
  notesInFlow?: boolean;
  color?: string;
  continueOnFail?: boolean;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
}

export interface N8NConnections {
  [sourceNodeName: string]: {
    [outputType: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
}

export interface WorkflowMetadata {
  instanceId?: string;
  templateId?: string;
  templateCredsSetupCompleted?: boolean;
}

export interface WorkflowSettings {
  executionOrder?: 'v0' | 'v1';
  saveManualExecutions?: boolean;
  callerPolicy?: 'workflowsFromSameOwner' | 'workflowsFromAList' | 'any';
  callerIds?: string;
  errorWorkflow?: string;
  timezone?: string;
  saveExecutionProgress?: boolean;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  executionTimeout?: number;
}

export interface WorkflowTag {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
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
 * Connection Types
 */
export const CONNECTION_TYPES = {
  MAIN: 'main',
  ERROR: 'error'
} as const;

/**
 * Node Parameter Types
 */
export interface NodeParameterSchema {
  [key: string]: {
    type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'json' | 'collection';
    required?: boolean;
    default?: any;
    options?: Array<{ name: string; value: any }>;
    multipleValues?: boolean;
    typeOptions?: Record<string, any>;
  };
}

/**
 * Common parameter schemas for different node types
 */
export const NODE_PARAMETER_SCHEMAS: Record<string, NodeParameterSchema> = {
  [N8N_CORE_NODES.HTTP_REQUEST]: {
    method: {
      type: 'string',
      required: true,
      default: 'GET',
      options: [
        { name: 'GET', value: 'GET' },
        { name: 'POST', value: 'POST' },
        { name: 'PUT', value: 'PUT' },
        { name: 'DELETE', value: 'DELETE' },
        { name: 'PATCH', value: 'PATCH' }
      ]
    },
    url: {
      type: 'string',
      required: true
    },
    headers: {
      type: 'collection',
      multipleValues: true
    },
    body: {
      type: 'json'
    }
  },
  [N8N_CORE_NODES.SET]: {
    values: {
      type: 'collection',
      required: true,
      multipleValues: true
    }
  },
  [N8N_CORE_NODES.IF]: {
    conditions: {
      type: 'collection',
      required: true,
      multipleValues: true
    }
  },
  [N8N_CORE_NODES.CODE]: {
    code: {
      type: 'string',
      required: true
    },
    mode: {
      type: 'string',
      default: 'runOnceForAllItems',
      options: [
        { name: 'Run Once for All Items', value: 'runOnceForAllItems' },
        { name: 'Run Once for Each Item', value: 'runOnceForEachItem' }
      ]
    }
  }
};

/**
 * Workflow validation rules
 */
export interface WorkflowValidationRule {
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  validate: (workflow: N8NWorkflowSchema) => ValidationResult;
}

export interface ValidationResult {
  valid: boolean;
  message?: string;
  details?: string;
  nodeId?: string;
  connectionId?: string;
  rule?: string;
  severity?: 'error' | 'warning' | 'info';
}

/**
 * Schema validation utilities
 */
export class N8NWorkflowSchemaValidator {
  private validationRules: WorkflowValidationRule[] = [];

  constructor() {
    this.initializeDefaultRules();
  }

  private initializeDefaultRules(): void {
    // Basic structure validation
    this.addRule({
      name: 'workflow-has-name',
      description: 'Workflow must have a name',
      severity: 'error',
      validate: (workflow) => ({
        valid: !!workflow.name && workflow.name.trim().length > 0,
        message: 'Workflow name is required'
      })
    });

    this.addRule({
      name: 'workflow-has-nodes',
      description: 'Workflow must have at least one node',
      severity: 'error',
      validate: (workflow) => ({
        valid: workflow.nodes && workflow.nodes.length > 0,
        message: 'Workflow must contain at least one node'
      })
    });

    // Node validation
    this.addRule({
      name: 'nodes-have-unique-ids',
      description: 'All nodes must have unique IDs',
      severity: 'error',
      validate: (workflow) => {
        const nodeIds = workflow.nodes.map(node => node.id);
        const uniqueIds = new Set(nodeIds);
        return {
          valid: nodeIds.length === uniqueIds.size,
          message: 'All node IDs must be unique'
        };
      }
    });

    this.addRule({
      name: 'nodes-have-valid-types',
      description: 'All nodes must have valid type specifications',
      severity: 'error',
      validate: (workflow) => {
        for (const node of workflow.nodes) {
          if (!node.type || typeof node.type !== 'string') {
            return {
              valid: false,
              message: `Node ${node.id} has invalid type`,
              nodeId: node.id
            };
          }
        }
        return { valid: true };
      }
    });

    // Connection validation
    this.addRule({
      name: 'connections-reference-existing-nodes',
      description: 'All connections must reference existing nodes',
      severity: 'error',
      validate: (workflow) => {
        const nodeIds = new Set(workflow.nodes.map(node => node.id));
        
        for (const [sourceId, outputs] of Object.entries(workflow.connections)) {
          if (!nodeIds.has(sourceId)) {
            return {
              valid: false,
              message: `Connection references non-existent source node: ${sourceId}`,
              connectionId: sourceId
            };
          }

          for (const outputType of Object.values(outputs)) {
            for (const connection of outputType) {
              if (!nodeIds.has(connection.node)) {
                return {
                  valid: false,
                  message: `Connection references non-existent target node: ${connection.node}`,
                  connectionId: connection.node
                };
              }
            }
          }
        }
        return { valid: true };
      }
    });
  }

  addRule(rule: WorkflowValidationRule): void {
    this.validationRules.push(rule);
  }

  validate(workflow: N8NWorkflowSchema): ValidationResult[] {
    return this.validationRules.map(rule => ({
      ...rule.validate(workflow),
      rule: rule.name,
      severity: rule.severity
    }));
  }

  isValid(workflow: N8NWorkflowSchema): boolean {
    const results = this.validate(workflow);
    return results.every(result => result.valid || result.severity !== 'error');
  }
}

/**
 * Schema builder utility for creating valid n8n workflows
 */
export class N8NWorkflowBuilder {
  private workflow: Partial<N8NWorkflowSchema> = {
    nodes: [],
    connections: {},
    active: false
  };

  setName(name: string): this {
    this.workflow.name = name;
    return this;
  }

  setActive(active: boolean): this {
    this.workflow.active = active;
    return this;
  }

  addNode(node: N8NNode): this {
    if (!this.workflow.nodes) {
      this.workflow.nodes = [];
    }
    this.workflow.nodes.push(node);
    return this;
  }

  addConnection(
    sourceNode: string,
    targetNode: string,
    outputType: string = 'main',
    outputIndex: number = 0,
    inputType: string = 'main',
    inputIndex: number = 0
  ): this {
    if (!this.workflow.connections) {
      this.workflow.connections = {};
    }

    if (!this.workflow.connections[sourceNode]) {
      this.workflow.connections[sourceNode] = {};
    }

    if (!this.workflow.connections[sourceNode][outputType]) {
      this.workflow.connections[sourceNode][outputType] = [];
    }

    this.workflow.connections[sourceNode][outputType].push({
      node: targetNode,
      type: inputType,
      index: inputIndex
    });

    return this;
  }

  setSettings(settings: WorkflowSettings): this {
    this.workflow.settings = settings;
    return this;
  }

  addTag(tag: WorkflowTag): this {
    if (!this.workflow.tags) {
      this.workflow.tags = [];
    }
    this.workflow.tags.push(tag);
    return this;
  }

  build(): N8NWorkflowSchema {
    if (!this.workflow.name) {
      throw new Error('Workflow name is required');
    }
    if (!this.workflow.nodes || this.workflow.nodes.length === 0) {
      throw new Error('Workflow must have at least one node');
    }

    return this.workflow as N8NWorkflowSchema;
  }

  validate(): ValidationResult[] {
    const validator = new N8NWorkflowSchemaValidator();
    return validator.validate(this.workflow as N8NWorkflowSchema);
  }
}

/**
 * Utility functions for working with n8n workflows
 */
export const WorkflowSchemaUtils = {
  /**
   * Generate a unique node ID
   */
  generateNodeId(prefix: string = 'node'): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Create a basic node structure
   */
  createNode(
    type: string,
    name: string,
    parameters: Record<string, any> = {},
    position: [number, number] = [0, 0]
  ): N8NNode {
    return {
      id: this.generateNodeId(),
      name,
      type,
      typeVersion: 1,
      position,
      parameters
    };
  },

  /**
   * Validate node parameters against schema
   */
  validateNodeParameters(nodeType: string, parameters: Record<string, any>): ValidationResult {
    const schema = NODE_PARAMETER_SCHEMAS[nodeType];
    if (!schema) {
      return {
        valid: true,
        message: `No parameter schema available for node type: ${nodeType}`
      };
    }

    for (const [paramName, paramSchema] of Object.entries(schema)) {
      if (paramSchema.required && !(paramName in parameters)) {
        return {
          valid: false,
          message: `Required parameter '${paramName}' is missing for node type '${nodeType}'`
        };
      }
    }

    return { valid: true };
  },

  /**
   * Get all connected nodes for a given node
   */
  getConnectedNodes(workflow: N8NWorkflowSchema, nodeId: string): string[] {
    const connected: string[] = [];
    
    // Find outgoing connections
    if (workflow.connections[nodeId]) {
      for (const outputs of Object.values(workflow.connections[nodeId])) {
        for (const connection of outputs) {
          connected.push(connection.node);
        }
      }
    }

    // Find incoming connections
    for (const [sourceId, outputs] of Object.entries(workflow.connections)) {
      for (const outputType of Object.values(outputs)) {
        for (const connection of outputType) {
          if (connection.node === nodeId) {
            connected.push(sourceId);
          }
        }
      }
    }

    return [...new Set(connected)];
  },

  /**
   * Check if workflow has cycles
   */
  hasCycles(workflow: N8NWorkflowSchema): boolean {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycleDFS = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) {
        return true;
      }
      if (visited.has(nodeId)) {
        return false;
      }

      visited.add(nodeId);
      recursionStack.add(nodeId);

      if (workflow.connections[nodeId]) {
        for (const outputs of Object.values(workflow.connections[nodeId])) {
          for (const connection of outputs) {
            if (hasCycleDFS(connection.node)) {
              return true;
            }
          }
        }
      }

      recursionStack.delete(nodeId);
      return false;
    };

    for (const node of workflow.nodes) {
      if (!visited.has(node.id) && hasCycleDFS(node.id)) {
        return true;
      }
    }

    return false;
  }
}; 