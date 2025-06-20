/**
 * n8n Core API Interfaces - Based on Official Repository Research
 * 
 * These interfaces define the core APIs used by n8n for workflow execution,
 * data flow between nodes, credential management, and execution context.
 */

// Core data structures
export interface IDataObject {
  [key: string]: any;
}

export interface IBinaryData {
  [key: string]: IBinaryKeyData;
}

export interface IBinaryKeyData {
  data: string; // Base64 encoded data
  mimeType: string;
  fileName?: string;
  fileExtension?: string;
  directory?: string;
  fileSize?: number;
  id?: string;
}

export interface INodeExecutionData {
  json: IDataObject;
  binary?: IBinaryData;
  error?: NodeOperationError;
  pairedItem?: IPairedItemData | IPairedItemData[];
}

export interface IPairedItemData {
  item: number;
  input?: number;
}

export interface NodeOperationError {
  message: string;
  description?: string;
  context?: IDataObject;
  timestamp?: Date;
  node?: {
    id: string;
    name: string;
    type: string;
  };
}

// Node type definitions
export interface INodeType {
  description: INodeTypeDescription;
  execute?(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
  poll?(this: IPollFunctions): Promise<INodeExecutionData[][]>;
  trigger?(this: ITriggerFunctions): Promise<ITriggerResponse | undefined>;
  webhook?(this: IWebhookFunctions): Promise<IWebhookResponseData>;
}

export interface INodeTypeDescription {
  displayName: string;
  name: string;
  icon?: string;
  iconUrl?: string;
  group: string[];
  version: number | number[];
  description: string;
  subtitle?: string;
  defaults: {
    name: string;
    color?: string;
  };
  inputs: Array<string | INodeInputConfiguration>;
  outputs: Array<string | INodeOutputConfiguration>;
  outputNames?: string[];
  properties: INodeProperties[];
  credentials?: INodeCredentialDescription[];
  maxNodes?: number;
  polling?: boolean;
  supportsCORS?: boolean;
  webhooks?: IWebhookDescription[];
}

export interface INodeInputConfiguration {
  type: string;
  displayName?: string;
  required?: boolean;
  maxConnections?: number;
}

export interface INodeOutputConfiguration {
  type: string;
  displayName?: string;
}

export interface INodeProperties {
  displayName: string;
  name: string;
  type: NodePropertyTypes;
  default: any;
  description?: string;
  hint?: string;
  displayOptions?: {
    show?: { [key: string]: Array<string | number | boolean> };
    hide?: { [key: string]: Array<string | number | boolean> };
  };
  options?: Array<INodePropertyOptions | INodePropertyCollection>;
  placeholder?: string;
  multipleValues?: boolean;
  multipleValueButtonText?: string;
  required?: boolean;
}

export type NodePropertyTypes =
  | 'boolean'
  | 'collection'
  | 'color'
  | 'dateTime'
  | 'fixedCollection'
  | 'hidden'
  | 'json'
  | 'notice'
  | 'number'
  | 'options'
  | 'string'
  | 'credentialsSelect'
  | 'resourceLocator'
  | 'curlImport'
  | 'resourceMapper'
  | 'filter';

export interface INodePropertyOptions {
  name: string;
  value: string | number | boolean;
  description?: string;
  action?: string;
}

export interface INodePropertyCollection {
  displayName: string;
  name: string;
  values: INodeProperties[];
}

// Execution functions
export interface IExecuteFunctions {
  getContext(type: string): IContextObject;
  getCredentials(type: string, itemIndex?: number): Promise<ICredentialDataDecryptedObject>;
  getExecuteData(): IExecuteData;
  getInputData(inputIndex?: number, inputName?: string): INodeExecutionData[];
  getNode(): INode;
  getNodeParameter(parameterName: string, itemIndex: number, fallbackValue?: any): any;
  getRestApiUrl(): string;
  getTimezone(): string;
  getWorkflow(): IWorkflowMetadata;
  getWorkflowDataProxy(itemIndex: number): IWorkflowDataProxyData;
  getWorkflowStaticData(type: string): IDataObject;
  
  evaluateExpression(expression: string, itemIndex: number): any;
  executeWorkflow(workflowInfo: IExecuteWorkflowInfo, inputData?: INodeExecutionData[]): Promise<any>;
  prepareOutputData(outputData: IDataObject[], outputIndex?: number): Promise<INodeExecutionData[][]>;
  
  helpers: {
    httpRequest(requestOptions: IHttpRequestOptions): Promise<any>;
    httpRequestWithAuthentication(this: IAllExecuteFunctions, credentialsType: string, requestOptions: IHttpRequestOptions, additionalCredentialOptions?: IAdditionalCredentialOptions): Promise<any>;
    prepareBinaryData(binaryData: Buffer, filePath?: string, mimeType?: string): Promise<IBinaryKeyData>;
    getBinaryDataBuffer(itemIndex: number, propertyName: string): Promise<Buffer>;
    constructExecutionMetaData(inputData: INodeExecutionData[], options: { itemData: IPairedItemData | IPairedItemData[] }): INodeExecutionData[];
    returnJsonArray(jsonData: IDataObject | IDataObject[]): INodeExecutionData[];
    normalizeItems(items: INodeExecutionData | INodeExecutionData[]): INodeExecutionData[];
  };
  
  logger: {
    debug(message: string, extra?: IDataObject): void;
    info(message: string, extra?: IDataObject): void;
    warn(message: string, extra?: IDataObject): void;
    error(message: string, extra?: IDataObject): void;
  };
}

export type IAllExecuteFunctions = IExecuteFunctions | IPollFunctions | ITriggerFunctions | IWebhookFunctions;

export interface IPollFunctions extends Omit<IExecuteFunctions, 'getInputData'> {
  __emit(data: INodeExecutionData[][]): void;
}

export interface ITriggerFunctions extends Omit<IExecuteFunctions, 'getInputData'> {
  emit(data: INodeExecutionData[][]): void;
  emitError(error: Error): void;
}

export interface IWebhookFunctions extends Omit<IExecuteFunctions, 'getInputData'> {
  getBodyData(): IDataObject;
  getHeaderData(): IDataObject;
  getParamsData(): IDataObject;
  getQueryData(): IDataObject;
  getRequestObject(): any;
  getResponseObject(): any;
  getWebhookName(): string;
}

export interface ILoadOptionsFunctions {
  getCredentials(type: string): Promise<ICredentialDataDecryptedObject>;
  getCurrentNodeParameter(parameterName: string): any;
  getCurrentNodeParameters(): IDataObject;
  getNode(): INode;
  getNodeParameter(parameterName: string, fallbackValue?: any): any;
  getRestApiUrl(): string;
  getTimezone(): string;
  helpers: {
    httpRequest(requestOptions: IHttpRequestOptions): Promise<any>;
    httpRequestWithAuthentication(credentialsType: string, requestOptions: IHttpRequestOptions, additionalCredentialOptions?: IAdditionalCredentialOptions): Promise<any>;
  };
}

// Credential interfaces
export interface ICredentialDataDecryptedObject {
  [key: string]: string | number | boolean | IDataObject;
}

export interface INodeCredentialDescription {
  name: string;
  required?: boolean;
  displayOptions?: {
    show?: { [key: string]: Array<string | number | boolean> };
    hide?: { [key: string]: Array<string | number | boolean> };
  };
  testedBy?: string;
}

export interface INodeCredentialTestResult {
  status: 'OK' | 'Error';
  message: string;
}

export interface ICredentialsDecrypted {
  id: string;
  name: string;
  type: string;
  data: ICredentialDataDecryptedObject;
}

// Workflow execution interfaces
export interface IWorkflowMetadata {
  id?: string;
  name?: string;
  active?: boolean;
  settings?: IWorkflowSettings;
}

export interface IWorkflowSettings {
  executionOrder?: 'v0' | 'v1';
  saveManualExecutions?: boolean;
  saveExecutionProgress?: boolean;
  saveDataErrorExecution?: 'all' | 'none';
  saveDataSuccessExecution?: 'all' | 'none';
  executionTimeout?: number;
  timezone?: string;
}

export interface IExecuteData {
  data: ITaskData;
  node: INode;
  source: ISourceData | null;
}

export interface ITaskData {
  startTime: number;
  executionTime: number;
  executionStatus?: 'success' | 'error' | 'running' | 'waiting';
  data?: {
    main: INodeExecutionData[][] | null;
    error?: NodeOperationError;
  };
  inputOverride?: IDataObject;
}

export interface ISourceData {
  previousNode: string;
  previousNodeOutput?: number;
  previousNodeRun?: number;
}

export interface INode {
  id: string;
  name: string;
  type: string;
  typeVersion: number;
  position: [number, number];
  disabled?: boolean;
  notes?: string;
  parameters: IDataObject;
  credentials?: INodeCredentials;
  webhookId?: string;
  retryOnFail?: boolean;
  maxTries?: number;
  waitBetweenTries?: number;
  alwaysOutputData?: boolean;
  executeOnce?: boolean;
  onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
  continueOnFail?: boolean;
  color?: string;
}

export interface INodeCredentials {
  [credentialType: string]: {
    id: string;
    name?: string;
  };
}

// HTTP request interfaces
export interface IHttpRequestOptions {
  url: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';
  body?: any;
  headers?: IDataObject;
  qs?: IDataObject;
  timeout?: number;
  encoding?: string | null;
  json?: boolean;
  returnFullResponse?: boolean;
  ignoreHttpStatusErrors?: boolean;
  proxy?: string;
  rejectUnauthorized?: boolean;
  followRedirect?: boolean;
  followAllRedirects?: boolean;
  maxRedirects?: number;
  gzip?: boolean;
  auth?: {
    username: string;
    password: string;
  };
  oauth?: {
    consumer_key: string;
    consumer_secret: string;
    token: string;
    token_secret: string;
  };
}

export interface IAdditionalCredentialOptions {
  oauth2?: {
    property: string;
    tokenType?: string;
    keyToIncludeInAccessTokenHeader?: string;
  };
  credentialsDecrypted?: ICredentialDataDecryptedObject;
}

// Webhook interfaces
export interface IWebhookDescription {
  name: string;
  httpMethod: string | string[];
  isFullPath?: boolean;
  path: string;
  responseBinaryPropertyName?: string;
  responseContentType?: string;
  responsePropertyName?: string;
  restartWebhook?: boolean;
  responseMode?: string;
  responseData?: string;
  hasResponseCode?: boolean;
}

export interface IWebhookResponseData {
  workflowData?: INodeExecutionData[][];
  webhookResponse?: IDataObject | string;
  noWebhookResponse?: boolean;
}

export interface ITriggerResponse {
  closeFunction?: () => Promise<void>;
  manualTriggerFunction?: () => Promise<void>;
  manualTriggerResponse?: () => Promise<INodeExecutionData[][]>;
}

// Utility interfaces
export interface IContextObject {
  [key: string]: any;
}

export interface IWorkflowDataProxyData {
  [key: string]: any;
  $input: INodeExecutionData;
  $json: IDataObject;
  $binary: IBinaryData;
  $node: IDataObject;
  $workflow: IDataObject;
  $parameter: IDataObject;
  $position: number;
  $runIndex: number;
  $mode: string;
  $now: Date;
  $today: Date;
  $jmespath: (expression: string) => any;
}

export interface IExecuteWorkflowInfo {
  code?: IDataObject;
  id?: string;
  source?: string;
}

export interface ICredentialTestFunctions {
  helpers: {
    request: (uriOrObject: string | IDataObject, options?: IDataObject) => Promise<any>;
  };
}

// Constants and type guards
export const N8N_API_CONSTANTS = {
  NODE_PROPERTY_TYPES: [
    'boolean',
    'collection',
    'color',
    'dateTime',
    'fixedCollection',
    'hidden',
    'json',
    'notice',
    'number',
    'options',
    'string',
    'credentialsSelect',
    'resourceLocator',
    'curlImport',
    'resourceMapper',
    'filter'
  ] as const,
  
  HTTP_METHODS: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'HEAD',
    'OPTIONS'
  ] as const,
  
  EXECUTION_STATUSES: [
    'success',
    'error',
    'running',
    'waiting'
  ] as const,
  
  ERROR_HANDLING_OPTIONS: [
    'stopWorkflow',
    'continueRegularOutput',
    'continueErrorOutput'
  ] as const
} as const;

export function isINodeExecutionData(data: any): data is INodeExecutionData {
  return data && typeof data === 'object' && 'json' in data;
}

export function isIDataObject(data: any): data is IDataObject {
  return data && typeof data === 'object' && !Array.isArray(data);
}

export function isNodeOperationError(error: any): error is NodeOperationError {
  return error && typeof error === 'object' && 'message' in error;
}

export const N8N_API_INTERFACES_VERSION = '1.0.0'; 