/**
 * n8n Node Interfaces - Extracted from n8n Repository Research
 *
 * These interfaces are based on our analysis of the official n8n repository
 * and represent the core patterns used for node definition and execution.
 */
export interface INodeType {
    id: string;
    name: string;
    description?: string;
    category?: string;
}
export interface INodeTypeDescription extends INodeType {
    icon?: string;
    color?: string;
    label?: string;
    version?: number;
    group?: string[];
    subtitle?: string;
    defaults?: INodeParameters;
    inputs?: string[];
    outputs?: string[];
    properties?: INodeProperties[];
    credentials?: INodeCredentials[];
}
export interface INodeProperties {
    displayName: string;
    name: string;
    type: 'string' | 'number' | 'boolean' | 'options' | 'multiOptions' | 'collection' | 'fixedCollection' | 'json' | 'dateTime' | 'color' | 'hidden';
    required?: boolean;
    default?: any;
    description?: string;
    placeholder?: string;
    options?: INodePropertyOptions[];
    typeOptions?: INodePropertyTypeOptions;
    displayOptions?: IDisplayOptions;
    routing?: INodePropertyRouting;
}
export interface INodePropertyOptions {
    name: string;
    value: string | number | boolean;
    description?: string;
}
export interface INodePropertyTypeOptions {
    minValue?: number;
    maxValue?: number;
    numberStepSize?: number;
    numberPrecision?: number;
    rows?: number;
    alwaysOpenEditWindow?: boolean;
    editor?: string;
    editorLanguage?: string;
}
export interface IDisplayOptions {
    show?: {
        [key: string]: any[];
    };
    hide?: {
        [key: string]: any[];
    };
}
export interface INodePropertyRouting {
    operations?: {
        [key: string]: any;
    };
    output?: {
        [key: string]: any;
    };
    request?: {
        [key: string]: any;
    };
}
export interface INodeParameters {
    [key: string]: any;
}
export interface IExecuteFunctions {
    getInputData: (inputIndex?: number) => INodeExecutionData[];
    getNodeParameter: (parameterName: string, itemIndex?: number, fallbackValue?: any) => any;
    getCredentials: (type: string) => Promise<ICredentialDataDecryptedObject>;
    helpers: {
        request: (options: any) => Promise<any>;
        returnJsonArray: (jsonData: any[]) => INodeExecutionData[];
    };
    getWorkflow: () => IWorkflowMetadata;
    getNode: () => INode;
}
export interface INodeExecutionData {
    json: {
        [key: string]: any;
    };
    binary?: {
        [key: string]: IBinaryData;
    };
    pairedItem?: IPairedItemData;
    error?: NodeOperationError;
}
export interface IBinaryData {
    data: string;
    mimeType: string;
    fileName?: string;
    directory?: string;
    fileExtension?: string;
    fileSize?: number;
}
export interface IPairedItemData {
    item: number;
    input?: number;
}
export interface NodeOperationError extends Error {
    lineNumber?: number;
    description?: string;
    context?: {
        [key: string]: any;
    };
    timestamp?: number;
}
export interface INodeCredentials {
    name: string;
    required?: boolean;
    displayOptions?: IDisplayOptions;
    testedBy?: string;
}
export interface ICredentialDataDecryptedObject {
    [key: string]: any;
}
export interface IWorkflowMetadata {
    id: string;
    name: string;
    active: boolean;
    nodes: INode[];
    connections: IConnections;
    settings?: {
        [key: string]: any;
    };
}
export interface INode {
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters: INodeParameters;
    credentials?: {
        [key: string]: string;
    };
    disabled?: boolean;
    notes?: string;
    retryOnFail?: boolean;
    maxTries?: number;
    waitBetweenTries?: number;
    alwaysOutputData?: boolean;
    executeOnce?: boolean;
    onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
}
export interface IConnections {
    [key: string]: {
        [type: string]: Array<{
            node: string;
            type: string;
            index: number;
        }>;
    };
}
export type NodeCategory = 'trigger' | 'action' | 'transform' | 'communication' | 'logic' | 'data-processing' | 'storage' | 'notification' | 'control-flow' | 'utility' | 'ai' | 'analytics';
export type CommonNodeType = 'n8n-nodes-base.httpRequest' | 'n8n-nodes-base.code' | 'n8n-nodes-base.if' | 'n8n-nodes-base.switch' | 'n8n-nodes-base.start' | 'n8n-nodes-base.set' | 'n8n-nodes-base.merge' | 'n8n-nodes-base.noOp' | 'n8n-nodes-base.function' | 'n8n-nodes-base.webhook' | 'n8n-nodes-base.emailSend' | 'n8n-nodes-base.writeBinaryFile' | 'n8n-nodes-base.htmlExtract';
export interface NodeGenerationContext {
    nodeType: CommonNodeType;
    category: NodeCategory;
    description: string;
    parameters: INodeParameters;
    position?: [number, number];
    connections?: {
        input?: string[];
        output?: string[];
    };
}
export interface NodeTemplate {
    type: CommonNodeType;
    category: NodeCategory;
    defaultParameters: INodeParameters;
    requiredParameters: string[];
    description: string;
    examples: INodeParameters[];
}
export interface EnhancedNodeAnalysis {
    nodeType: CommonNodeType;
    category: NodeCategory;
    complexity: number;
    capabilities: string[];
    suggestedEnhancements: string[];
    compatibilityScore: number;
}
export interface NodeValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    compatibilityVersion: number;
}
//# sourceMappingURL=n8n-node-interfaces.d.ts.map