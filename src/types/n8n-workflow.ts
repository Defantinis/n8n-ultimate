/**
 * TypeScript type definitions for n8n workflow structure
 * This is the canonical source of truth for workflow-related types.
 */

export interface N8nWorkflow {
  name: string;
  active: boolean;
  nodes: N8nNode[];
  connections: N8nConnections;
  createdAt?: string;
  updatedAt?: string;
  id: string;
  versionId?: string;
  meta?: WorkflowMetadata;
  settings?: WorkflowSettings;
  staticData?: Record<string, any>;
  pinData?: Record<string, any>;
  tags?: WorkflowTag[];
}

export interface N8nNode {
  parameters: Record<string, any>;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  id: string;
  notes?: string;
  disabled?: boolean;
  webhookId?: string;
  credentials?: Record<string, any>;
  continueOnFail?: boolean;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
  notesInFlow?: boolean;
  color?: string;
}

export interface N8nConnections {
  [nodeName: string]: {
    [outputType: string]: Array<{
      node: string;
      type: string;
      index: number;
    }>;
  };
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

export interface WorkflowMetadata {
  instanceId?: string;
  templateId?: string;
  templateCredsSetupCompleted?: boolean;
}

export interface WorkflowTag {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

// Node-specific parameter types
export interface HttpRequestParameters {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  headers?: Record<string, string>;
  body?: any;
  authentication?: 'none' | 'basicAuth' | 'oAuth1Api' | 'oAuth2Api' | 'bearerTokenAuth';
  sendQuery?: boolean;
  queryParameters?: Record<string, string>;
  options?: Record<string, any>;
}

export interface CodeParameters {
  mode: 'runOnceForAllItems' | 'runOnceForEachItem';
  jsCode: string;
}

export interface HtmlExtractParameters {
  extractionValues: Array<{
    key: string;
    cssSelector: string;
    returnValue: 'text' | 'html' | 'attribute' | 'value';
    attribute?: string;
  }>;
  options?: {
    trimValues?: boolean;
    dataPropertyName?: string;
  };
}

export interface WriteBinaryFileParameters {
  fileName: string;
  dataPropertyName?: string;
  options?: Record<string, any>;
}

// Common node types
export type NodeType = 
  | 'n8n-nodes-base.start'
  | 'n8n-nodes-base.code'
  | 'n8n-nodes-base.httpRequest'
  | 'n8n-nodes-base.htmlExtract'
  | 'n8n-nodes-base.writeBinaryFile'
  | string; // Allow for custom nodes

// Connection types
export type ConnectionType = 'main' | 'ai_tool' | 'ai_document' | 'ai_memory';

// Execution data types
export interface N8nExecutionData {
  resultData: {
    runData: Record<string, any[]>;
    pinData?: Record<string, any[]>;
  };
  executionData?: {
    contextData: Record<string, any>;
    nodeExecutionStack: any[];
    metadata: Record<string, any>;
    waitingExecution: Record<string, any>;
    waitingExecutionSource: Record<string, any>;
  };
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  type: 'structure' | 'node' | 'connection' | 'parameter' | 'data_transformation' | 'data_flow_continuity' | 'node_data_requirements' | 'workflow' | 'cycle' | 'performance';
  message: string;
  nodeId?: string;
  field?: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  type: 'performance' | 'compatibility' | 'best-practice' | 'data_transformation' | 'data_flow_continuity' | 'node_data_requirements' | 'connection' | 'node';
  message: string;
  nodeId?: string;
  suggestion?: string;
}

// Parsing result types
export interface ParsedWorkflow {
  workflow: N8nWorkflow;
  metadata: {
    nodeCount: number;
    connectionCount: number;
    nodeTypes: string[];
    hasLoops: boolean;
    maxDepth: number;
    estimatedComplexity: number;
  };
}

// Workflow generation types
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