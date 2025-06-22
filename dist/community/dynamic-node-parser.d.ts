/**
 * Dynamic Node Definition Parser
 * Dynamically loads and analyzes community node definitions with comprehensive parsing capabilities
 */
import { EventEmitter } from 'events';
import { CommunityNodeDefinition, CommunityNodePackage } from './community-node-registry';
export interface ParsedNodeDefinition extends CommunityNodeDefinition {
    parsedProperties: ParsedNodeProperty[];
    inputSchema: NodeSchema;
    outputSchema: NodeSchema;
    connectionRules: ConnectionRule[];
    validationRules: ValidationRule[];
    executionContext: ExecutionContext;
    resourceDefinitions: ResourceDefinition[];
    operationDefinitions: OperationDefinition[];
    credentialRequirements: CredentialRequirement[];
    webhookConfiguration?: WebhookConfig;
    pollingConfiguration?: PollingConfig;
    triggerConfiguration?: TriggerConfig;
}
export interface ParsedNodeProperty {
    displayName: string;
    name: string;
    type: NodePropertyType;
    required: boolean;
    default?: any;
    options?: PropertyOption[];
    description?: string;
    placeholder?: string;
    typeOptions?: PropertyTypeOptions;
    displayOptions?: DisplayOptions;
    extractOnFail?: boolean;
    routing?: RoutingOptions;
    loadOptions?: LoadOptions;
}
export interface NodeSchema {
    type: 'object' | 'array' | 'string' | 'number' | 'boolean';
    properties?: Record<string, SchemaProperty>;
    items?: NodeSchema;
    required?: string[];
    additionalProperties?: boolean;
}
export interface SchemaProperty {
    type: string;
    description?: string;
    format?: string;
    enum?: any[];
    items?: NodeSchema;
    properties?: Record<string, SchemaProperty>;
    additionalProperties?: boolean;
}
export interface ConnectionRule {
    type: 'input' | 'output';
    name: string;
    displayName: string;
    required: boolean;
    maxConnections?: number;
    dataTypes: string[];
    description?: string;
}
export interface ValidationRule {
    type: 'required' | 'format' | 'range' | 'custom';
    property: string;
    message: string;
    condition?: any;
    validator?: string;
}
export interface ExecutionContext {
    supportsStreaming: boolean;
    supportsBatching: boolean;
    maxBatchSize?: number;
    timeout?: number;
    retryPolicy?: RetryPolicy;
    rateLimiting?: RateLimitConfig;
    memoryUsage?: MemoryConfig;
}
export interface RetryPolicy {
    maxAttempts: number;
    backoffStrategy: 'fixed' | 'exponential' | 'linear';
    baseDelay: number;
    maxDelay?: number;
    retryConditions: string[];
}
export interface RateLimitConfig {
    requestsPerSecond?: number;
    requestsPerMinute?: number;
    requestsPerHour?: number;
    burstAllowed?: number;
}
export interface MemoryConfig {
    maxMemoryMB?: number;
    streamingThresholdMB?: number;
    gcThreshold?: number;
}
export interface ResourceDefinition {
    name: string;
    displayName: string;
    description: string;
    operations: string[];
    properties: string[];
}
export interface OperationDefinition {
    name: string;
    displayName: string;
    description: string;
    resource?: string;
    routing: RoutingDefinition;
    requestDefaults?: RequestDefaults;
    outputParsing?: OutputParsing;
}
export interface RoutingDefinition {
    request: RequestRouting;
    output?: OutputRouting;
    send?: SendRouting;
}
export interface RequestRouting {
    method: string;
    url: string;
    headers?: Record<string, string>;
    body?: any;
    qs?: Record<string, any>;
    encoding?: string;
}
export interface OutputRouting {
    postReceive?: PostReceiveAction[];
}
export interface SendRouting {
    preSend?: PreSendAction[];
}
export interface PostReceiveAction {
    type: 'filter' | 'sort' | 'limit' | 'set' | 'rootProperty';
    properties?: any;
}
export interface PreSendAction {
    type: 'set' | 'remove' | 'rename';
    properties?: any;
}
export interface RequestDefaults {
    headers?: Record<string, string>;
    qs?: Record<string, any>;
    body?: any;
}
export interface OutputParsing {
    keyName?: string;
    propertyName?: string;
    responseFormat?: 'json' | 'xml' | 'text' | 'binary';
}
export interface CredentialRequirement {
    name: string;
    displayName: string;
    type: string;
    required: boolean;
    testedBy?: string;
    properties: CredentialProperty[];
}
export interface CredentialProperty {
    displayName: string;
    name: string;
    type: string;
    required: boolean;
    secret?: boolean;
    default?: any;
}
export interface WebhookConfig {
    path: string;
    httpMethod: string[];
    responseMode: 'onReceived' | 'lastNode';
    responseData?: string;
    responseBinaryPropertyName?: string;
}
export interface PollingConfig {
    interval: number;
    pollResponse?: PollResponse;
}
export interface PollResponse {
    mode: 'define' | 'getAllItemsOnce';
    properties?: any;
}
export interface TriggerConfig {
    activationMode: 'init' | 'enable' | 'manual';
    pollResponse?: PollResponse;
}
export type NodePropertyType = 'string' | 'number' | 'boolean' | 'options' | 'multiOptions' | 'collection' | 'fixedCollection' | 'json' | 'dateTime' | 'color' | 'hidden' | 'notice' | 'resourceLocator' | 'credentialsSelect' | 'loadOptions' | 'resourceMapper';
export interface PropertyOption {
    name: string;
    value: any;
    description?: string;
    action?: string;
    routing?: RoutingOptions;
}
export interface PropertyTypeOptions {
    rows?: number;
    password?: boolean;
    alwaysOpenEditWindow?: boolean;
    loadOptionsMethod?: string;
    loadOptionsDependsOn?: string[];
    maxValue?: number;
    minValue?: number;
    numberPrecision?: number;
    multipleValues?: boolean;
    multipleValueButtonText?: string;
    sortable?: boolean;
    resizable?: boolean;
    editor?: string;
    editorLanguage?: string;
}
export interface DisplayOptions {
    show?: Record<string, any>;
    hide?: Record<string, any>;
}
export interface RoutingOptions {
    request?: RequestRouting;
    output?: OutputRouting;
    send?: SendRouting;
}
export interface LoadOptions {
    routing?: RoutingDefinition;
    qs?: Record<string, any>;
}
export interface ParsingOptions {
    includeCredentials?: boolean;
    includeWebhooks?: boolean;
    includePolling?: boolean;
    includeTriggers?: boolean;
    validateSchema?: boolean;
    generateConnectionRules?: boolean;
    generateValidationRules?: boolean;
    parseExecutionContext?: boolean;
}
export interface ParsingResult {
    success: boolean;
    node?: ParsedNodeDefinition;
    errors: string[];
    warnings: string[];
    metadata: ParsingMetadata;
}
export interface ParsingMetadata {
    parseTime: number;
    nodeVersion: string;
    parserVersion: string;
    featuresDetected: string[];
    compatibilityLevel: 'full' | 'partial' | 'limited';
    recommendedUpdates: string[];
}
export declare class DynamicNodeParser extends EventEmitter {
    private parserVersion;
    private supportedNodeVersions;
    private parsingCache;
    private cacheTimeout;
    constructor();
    /**
     * Parse a community node definition into a standardized format
     */
    parseNodeDefinition(nodeDefinition: CommunityNodeDefinition, packageInfo: CommunityNodePackage, options?: ParsingOptions): Promise<ParsingResult>;
    /**
     * Perform the actual parsing of node definition
     */
    private performParsing;
    /**
     * Parse node properties with enhanced type information
     */
    private parseProperties;
    /**
     * Normalize property types to standard format
     */
    private normalizePropertyType;
    /**
     * Parse property options with enhanced information
     */
    private parsePropertyOptions;
    /**
     * Generate input schema from parsed properties
     */
    private generateInputSchema;
    /**
     * Convert parsed property to schema property
     */
    private propertyToSchema;
    /**
     * Generate output schema based on node definition
     */
    private generateOutputSchema;
    /**
     * Generate connection rules from node definition
     */
    private generateConnectionRules;
    /**
     * Generate validation rules from parsed properties
     */
    private generateValidationRules;
    /**
     * Parse execution context from node and package information
     */
    private parseExecutionContext;
    /**
     * Get default execution context
     */
    private getDefaultExecutionContext;
    /**
     * Parse resource definitions from properties
     */
    private parseResourceDefinitions;
    /**
     * Parse operation definitions from properties
     */
    private parseOperationDefinitions;
    /**
     * Parse credential requirements
     */
    private parseCredentialRequirements;
    /**
     * Parse webhook configuration
     */
    private parseWebhookConfiguration;
    /**
     * Parse polling configuration
     */
    private parsePollingConfiguration;
    /**
     * Parse trigger configuration
     */
    private parseTriggerConfiguration;
    private detectFeatures;
    private assessCompatibility;
    private generateRecommendations;
    private detectStreamingSupport;
    private detectBatchingSupport;
    private calculateMaxBatchSize;
    private calculateTimeout;
    private generateRetryPolicy;
    private generateRateLimiting;
    private generateMemoryConfig;
    private extractOperationsForResource;
    private extractPropertiesForResource;
    private extractRoutingForOperation;
    private extractRequestDefaults;
    private extractOutputParsing;
    private formatCredentialName;
    private inferCredentialType;
    private generateCredentialProperties;
    /**
     * Clear parsing cache
     */
    clearCache(): void;
    /**
     * Get cache statistics
     */
    getCacheStats(): {
        size: number;
        keys: string[];
    };
}
export declare const dynamicNodeParser: DynamicNodeParser;
//# sourceMappingURL=dynamic-node-parser.d.ts.map