/**
 * n8n Workflow JSON Schema - Based on Official n8n Repository Research
 *
 * This schema defines the exact structure and validation rules for n8n workflows
 * based on our analysis of the official n8n repository and documentation.
 */
export interface N8nWorkflowSchema {
    id: string;
    name: string;
    nodes: N8nNodeSchema[];
    connections: N8nConnectionsSchema;
    active?: boolean;
    tags?: string[];
    settings?: N8nWorkflowSettings;
    staticData?: N8nStaticData;
    pinData?: N8nPinData;
    versionId?: string;
    meta?: N8nWorkflowMeta;
    hash?: string;
}
export interface N8nNodeSchema {
    id: string;
    name: string;
    type: string;
    typeVersion: number;
    position: [number, number];
    parameters: Record<string, any>;
    credentials?: Record<string, string>;
    disabled?: boolean;
    notes?: string;
    retryOnFail?: boolean;
    maxTries?: number;
    waitBetweenTries?: number;
    alwaysOutputData?: boolean;
    executeOnce?: boolean;
    onError?: 'stopWorkflow' | 'continueRegularOutput' | 'continueErrorOutput';
    webhookId?: string;
    color?: string;
}
export interface N8nConnectionsSchema {
    [nodeId: string]: {
        [connectionType: string]: Array<Array<{
            node: string;
            type: string;
            index: number;
        }>>;
    };
}
export interface N8nWorkflowSettings {
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
export interface N8nStaticData {
    node?: {
        [nodeId: string]: Record<string, any>;
    };
    global?: Record<string, any>;
}
export interface N8nPinData {
    [nodeId: string]: Array<{
        json: Record<string, any>;
        binary?: Record<string, any>;
    }>;
}
export interface N8nWorkflowMeta {
    templateCredsSetupCompleted?: boolean;
    instanceId?: string;
    [key: string]: any;
}
export declare const N8N_VALIDATION_RULES: {
    readonly REQUIRED_WORKFLOW_FIELDS: readonly ["id", "name", "nodes", "connections"];
    readonly REQUIRED_NODE_FIELDS: readonly ["id", "name", "type", "typeVersion", "position", "parameters"];
    readonly CONSTRAINTS: {
        readonly WORKFLOW_NAME_MAX_LENGTH: 255;
        readonly WORKFLOW_ID_PATTERN: RegExp;
        readonly NODE_NAME_MAX_LENGTH: 100;
        readonly NODE_ID_PATTERN: RegExp;
        readonly NODE_TYPE_PATTERN: RegExp;
        readonly NODE_POSITION_BOUNDS: {
            readonly MIN_X: -10000;
            readonly MAX_X: 10000;
            readonly MIN_Y: -10000;
            readonly MAX_Y: 10000;
        };
        readonly CONNECTION_TYPES: readonly ["main", "error"];
        readonly MAX_CONNECTIONS_PER_OUTPUT: 100;
        readonly EXECUTION_TIMEOUT_MAX: 3600000;
        readonly MAX_TRIES_RANGE: {
            readonly MIN: 1;
            readonly MAX: 10;
        };
    };
    readonly COMMON_NODE_TYPES: readonly ["n8n-nodes-base.start", "n8n-nodes-base.httpRequest", "n8n-nodes-base.code", "n8n-nodes-base.if", "n8n-nodes-base.switch", "n8n-nodes-base.set", "n8n-nodes-base.merge", "n8n-nodes-base.noOp", "n8n-nodes-base.function", "n8n-nodes-base.webhook", "n8n-nodes-base.emailSend", "n8n-nodes-base.writeBinaryFile", "n8n-nodes-base.htmlExtract", "n8n-nodes-base.json", "n8n-nodes-base.dateTime", "n8n-nodes-base.itemLists"];
    readonly ERROR_HANDLING_OPTIONS: readonly ["stopWorkflow", "continueRegularOutput", "continueErrorOutput"];
};
export interface ValidationError {
    field: string;
    message: string;
    code: string;
    severity: 'error' | 'warning';
    nodeId?: string;
}
export interface WorkflowValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
    suggestions: string[];
    compatibilityScore: number;
    n8nVersion?: string;
}
export declare class N8nWorkflowSchemaValidator {
    /**
     * Validate a complete workflow against n8n schema
     */
    static validateWorkflow(workflow: any): WorkflowValidationResult;
    /**
     * Validate required fields
     */
    private static validateRequiredFields;
    /**
     * Validate workflow structure
     */
    private static validateWorkflowStructure;
    /**
     * Validate individual nodes
     */
    private static validateNodes;
    /**
     * Validate connections
     */
    private static validateConnections;
    /**
     * Generate suggestions for workflow improvement
     */
    private static generateSuggestions;
    /**
     * Calculate compatibility score (0-100)
     */
    private static calculateCompatibilityScore;
}
export declare const validateN8nWorkflow: typeof N8nWorkflowSchemaValidator.validateWorkflow;
export declare const N8N_SCHEMA_VERSION = "1.0.0";
//# sourceMappingURL=n8n-workflow-schema.d.ts.map