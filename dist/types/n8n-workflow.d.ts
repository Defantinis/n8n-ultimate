/**
 * TypeScript type definitions for n8n workflow structure
 * Based on analysis of n8nscraper.json workflow
 */
export interface N8nWorkflow {
    name: string;
    nodes: N8nNode[];
    connections: N8nConnections;
    active: boolean;
    settings: N8nSettings;
    id: string;
    meta: N8nMeta;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
    versionId?: string;
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
}
export interface N8nConnections {
    [nodeName: string]: {
        [outputType: string]: Array<Array<{
            node: string;
            type: string;
            index: number;
        }>>;
    };
}
export interface N8nSettings {
    executionOrder?: 'v0' | 'v1';
    saveManualExecutions?: boolean;
    callerPolicy?: string;
    errorWorkflow?: string;
    timezone?: string;
    saveExecutionProgress?: boolean;
    saveDataErrorExecution?: 'all' | 'none';
    saveDataSuccessExecution?: 'all' | 'none';
    executionTimeout?: number;
}
export interface N8nMeta {
    instanceId?: string;
    templateId?: string;
    templateCredsSetupCompleted?: boolean;
}
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
export type NodeType = 'n8n-nodes-base.start' | 'n8n-nodes-base.code' | 'n8n-nodes-base.httpRequest' | 'n8n-nodes-base.htmlExtract' | 'n8n-nodes-base.writeBinaryFile' | string;
export type ConnectionType = 'main' | 'ai_tool' | 'ai_document' | 'ai_memory';
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
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}
export interface ValidationError {
    type: 'structure' | 'node' | 'connection' | 'parameter';
    message: string;
    nodeId?: string;
    field?: string;
    severity: 'error' | 'warning';
}
export interface ValidationWarning {
    type: 'performance' | 'compatibility' | 'best-practice';
    message: string;
    nodeId?: string;
    suggestion?: string;
}
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
    validation: ValidationResult;
}
//# sourceMappingURL=n8n-workflow.d.ts.map