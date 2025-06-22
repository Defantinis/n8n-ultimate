/**
 * Community Node Integration API
 * Main interface for integrating community nodes into the workflow generation system
 * Provides installation management, version compatibility, and runtime integration
 */
import { EventEmitter } from 'events';
import { CommunityNodePackage, CommunityNodeDefinition } from './community-node-registry';
import { ParsedNodeDefinition } from './dynamic-node-parser';
import { CommunityValidationResult, ValidationOptions } from './community-node-validator';
export interface CommunityNodeIntegrationAPI {
    discoverAvailableNodes(options?: NodeDiscoveryOptions): Promise<CommunityNodePackage[]>;
    searchNodes(query: string, options?: NodeSearchOptions): Promise<CommunityNodeDefinition[]>;
    getNodeDetails(nodeId: string): Promise<CommunityNodeDetails | null>;
    installNode(packageName: string, options?: InstallationOptions): Promise<InstallationResult>;
    uninstallNode(packageName: string): Promise<UninstallationResult>;
    updateNode(packageName: string, targetVersion?: string): Promise<UpdateResult>;
    listInstalledNodes(): Promise<InstalledNodeInfo[]>;
    validateNode(nodeId: string, options?: ValidationOptions): Promise<CommunityValidationResult>;
    checkCompatibility(nodeId: string, n8nVersion?: string): Promise<CompatibilityCheckResult>;
    integrateNode(nodeId: string, workflowContext: WorkflowContext): Promise<NodeIntegrationResult>;
    generateNodeConfiguration(nodeId: string, requirements: NodeRequirements): Promise<NodeConfiguration>;
    suggestNodesForWorkflow(workflowDescription: string): Promise<NodeSuggestion[]>;
    generateWorkflowWithCommunityNodes(requirements: WorkflowRequirements): Promise<GeneratedWorkflow>;
}
export interface NodeDiscoveryOptions {
    categories?: string[];
    keywords?: string[];
    minPopularity?: number;
    maxAge?: number;
    includePrerelease?: boolean;
    sortBy?: 'popularity' | 'downloads' | 'updated' | 'name' | 'relevance';
    limit?: number;
}
export interface NodeSearchOptions {
    exactMatch?: boolean;
    includeDescription?: boolean;
    categories?: string[];
    sortBy?: 'relevance' | 'popularity' | 'updated';
    limit?: number;
}
export interface CommunityNodeDetails {
    package: CommunityNodePackage;
    definition: CommunityNodeDefinition;
    parsedDefinition: ParsedNodeDefinition;
    validationResult: CommunityValidationResult;
    installationStatus: 'not-installed' | 'installed' | 'outdated' | 'incompatible';
    dependencies: DependencyInfo[];
    usageExamples: NodeUsageExample[];
    documentation: NodeDocumentation;
}
export interface InstallationOptions {
    version?: string;
    force?: boolean;
    skipValidation?: boolean;
    installDependencies?: boolean;
    timeout?: number;
}
export interface InstallationResult {
    success: boolean;
    packageName: string;
    version: string;
    installPath: string;
    dependencies: string[];
    validationResult?: CommunityValidationResult;
    warnings: string[];
    errors: string[];
    installationTime: number;
}
export interface UninstallationResult {
    success: boolean;
    packageName: string;
    removedFiles: string[];
    errors: string[];
}
export interface UpdateResult {
    success: boolean;
    packageName: string;
    fromVersion: string;
    toVersion: string;
    changes: VersionChange[];
    migrationRequired: boolean;
    migrationSteps?: MigrationStep[];
    warnings: string[];
    errors: string[];
}
export interface InstalledNodeInfo {
    packageName: string;
    version: string;
    installDate: Date;
    lastUsed?: Date;
    usageCount: number;
    status: 'active' | 'inactive' | 'deprecated' | 'error';
    size: number;
    dependencies: string[];
}
export interface CompatibilityCheckResult {
    compatible: boolean;
    compatibilityLevel: 'full' | 'partial' | 'limited' | 'incompatible';
    n8nVersion: string;
    nodeVersion: string;
    issues: CompatibilityIssue[];
    recommendations: string[];
    migrationRequired: boolean;
    estimatedMigrationEffort: 'low' | 'medium' | 'high';
}
export interface CompatibilityIssue {
    type: 'version' | 'dependency' | 'api' | 'feature' | 'security';
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    affectedFeatures: string[];
    resolution?: string;
}
export interface WorkflowContext {
    workflowId: string;
    n8nVersion: string;
    existingNodes: string[];
    dataTypes: string[];
    requirements: string[];
    constraints: WorkflowConstraints;
}
export interface WorkflowConstraints {
    maxExecutionTime?: number;
    maxMemoryUsage?: number;
    securityLevel: 'low' | 'medium' | 'high';
    allowExternalConnections: boolean;
    requiredCompliance: string[];
}
export interface NodeIntegrationResult {
    success: boolean;
    nodeId: string;
    integrationPath: string;
    configuration: NodeConfiguration;
    connectionMappings: ConnectionMapping[];
    validationResults: CommunityValidationResult;
    warnings: string[];
    errors: string[];
}
export interface NodeRequirements {
    functionality: string[];
    inputTypes: string[];
    outputTypes: string[];
    credentialTypes?: string[];
    performanceRequirements?: PerformanceRequirements;
    securityRequirements?: SecurityRequirements;
}
export interface PerformanceRequirements {
    maxExecutionTime?: number;
    maxMemoryUsage?: number;
    throughput?: number;
    scalability?: 'low' | 'medium' | 'high';
}
export interface SecurityRequirements {
    encryptionRequired?: boolean;
    auditLogging?: boolean;
    accessControl?: boolean;
    complianceStandards?: string[];
}
export interface NodeConfiguration {
    nodeId: string;
    properties: Record<string, any>;
    credentials: CredentialConfiguration[];
    connections: ConnectionConfiguration[];
    settings: NodeSettings;
    environment: EnvironmentConfiguration;
}
export interface CredentialConfiguration {
    type: string;
    name: string;
    required: boolean;
    configuration: Record<string, any>;
}
export interface ConnectionConfiguration {
    input: string;
    output: string;
    type: string;
    mapping: DataMapping;
}
export interface DataMapping {
    fields: FieldMapping[];
    transformations: DataTransformation[];
}
export interface FieldMapping {
    source: string;
    target: string;
    type: string;
    required: boolean;
    defaultValue?: any;
}
export interface DataTransformation {
    type: 'format' | 'filter' | 'aggregate' | 'validate' | 'custom';
    operation: string;
    parameters: Record<string, any>;
}
export interface NodeSettings {
    retryOnFailure?: boolean;
    maxRetries?: number;
    timeout?: number;
    continueOnFail?: boolean;
    alwaysOutputData?: boolean;
}
export interface EnvironmentConfiguration {
    variables: Record<string, string>;
    secrets: string[];
    volumes?: VolumeMount[];
    networkAccess?: NetworkAccess;
}
export interface VolumeMount {
    source: string;
    target: string;
    readOnly: boolean;
}
export interface NetworkAccess {
    allowedHosts: string[];
    blockedHosts: string[];
    allowInternet: boolean;
}
export interface ConnectionMapping {
    sourceNode: string;
    sourceOutput: string;
    targetNode: string;
    targetInput: string;
    dataType: string;
}
export interface DependencyInfo {
    name: string;
    version: string;
    type: 'runtime' | 'peer' | 'dev';
    installed: boolean;
    compatible: boolean;
    issues: string[];
}
export interface NodeUsageExample {
    title: string;
    description: string;
    configuration: Record<string, any>;
    inputData: any;
    expectedOutput: any;
    workflowContext?: string;
}
export interface NodeDocumentation {
    readme: string;
    changelog: string;
    apiReference: string;
    examples: string[];
    troubleshooting: string;
    links: DocumentationLink[];
}
export interface DocumentationLink {
    title: string;
    url: string;
    type: 'documentation' | 'tutorial' | 'example' | 'support';
}
export interface NodeSuggestion {
    nodeId: string;
    packageName: string;
    relevanceScore: number;
    matchedRequirements: string[];
    benefits: string[];
    limitations: string[];
    alternatives: string[];
    estimatedImplementationTime: number;
}
export interface WorkflowRequirements {
    description: string;
    inputSources: DataSource[];
    outputTargets: DataTarget[];
    transformations: TransformationRequirement[];
    constraints: WorkflowConstraints;
    preferences: WorkflowPreferences;
}
export interface DataSource {
    type: string;
    format: string;
    location: string;
    authentication?: string;
    schema?: any;
}
export interface DataTarget {
    type: string;
    format: string;
    location: string;
    authentication?: string;
    schema?: any;
}
export interface TransformationRequirement {
    type: string;
    description: string;
    inputFields: string[];
    outputFields: string[];
    rules: TransformationRule[];
}
export interface TransformationRule {
    condition: string;
    action: string;
    parameters: Record<string, any>;
}
export interface WorkflowPreferences {
    preferCommunityNodes?: boolean;
    maxCommunityNodes?: number;
    allowBetaNodes?: boolean;
    performanceOverFeatures?: boolean;
    securityFirst?: boolean;
}
export interface GeneratedWorkflow {
    id: string;
    name: string;
    description: string;
    nodes: WorkflowNode[];
    connections: WorkflowConnection[];
    settings: WorkflowSettings;
    metadata: WorkflowMetadata;
    validation: WorkflowValidationResult;
}
export interface WorkflowNode {
    id: string;
    type: string;
    packageName?: string;
    position: {
        x: number;
        y: number;
    };
    parameters: Record<string, any>;
    credentials?: string;
    isCommunityNode: boolean;
}
export interface WorkflowConnection {
    source: string;
    sourceOutput: string;
    target: string;
    targetInput: string;
    type: string;
}
export interface WorkflowSettings {
    timezone: string;
    saveDataErrorExecution: string;
    saveDataSuccessExecution: string;
    saveManualExecutions: boolean;
    callerPolicy: string;
}
export interface WorkflowMetadata {
    createdAt: Date;
    createdBy: string;
    version: string;
    tags: string[];
    communityNodesUsed: string[];
    estimatedExecutionTime: number;
    complexity: 'low' | 'medium' | 'high';
}
export interface WorkflowValidationResult {
    valid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    communityNodeValidations: Record<string, CommunityValidationResult>;
}
export interface VersionChange {
    type: 'added' | 'removed' | 'modified' | 'deprecated';
    component: string;
    description: string;
    impact: 'breaking' | 'feature' | 'fix' | 'performance';
    migrationRequired: boolean;
}
export interface MigrationStep {
    order: number;
    description: string;
    type: 'automatic' | 'manual' | 'assisted';
    code?: string;
    validation?: string;
    estimatedTime: number;
}
/**
 * Main implementation of the Community Node Integration API
 */
export declare class CommunityNodeIntegrationManager extends EventEmitter implements CommunityNodeIntegrationAPI {
    private registry;
    private parser;
    private validator;
    private installedNodes;
    private integrationCache;
    private cacheTimeout;
    constructor();
    /**
     * Initialize event handlers for component communication
     */
    private initializeEventHandlers;
    /**
     * Initialize the integration manager
     */
    initialize(): Promise<void>;
    /**
     * Discover available community nodes
     */
    discoverAvailableNodes(options?: NodeDiscoveryOptions): Promise<CommunityNodePackage[]>;
    /**
     * Search for specific nodes
     */
    searchNodes(query: string, options?: NodeSearchOptions): Promise<CommunityNodeDefinition[]>;
    /**
     * Get detailed information about a specific node
     */
    getNodeDetails(nodeId: string): Promise<CommunityNodeDetails | null>;
    /**
     * Install a community node
     */
    installNode(packageName: string, options?: InstallationOptions): Promise<InstallationResult>;
    /**
     * Uninstall a community node
     */
    uninstallNode(packageName: string): Promise<UninstallationResult>;
    /**
     * Update an installed node
     */
    updateNode(packageName: string, targetVersion?: string): Promise<UpdateResult>;
    /**
     * List all installed nodes
     */
    listInstalledNodes(): Promise<InstalledNodeInfo[]>;
    /**
     * Validate a specific node
     */
    validateNode(nodeId: string, options?: ValidationOptions): Promise<CommunityValidationResult>;
    /**
     * Check compatibility of a node with specific n8n version
     */
    checkCompatibility(nodeId: string, n8nVersion?: string): Promise<CompatibilityCheckResult>;
    /**
     * Integrate a node into a workflow context
     */
    integrateNode(nodeId: string, workflowContext: WorkflowContext): Promise<NodeIntegrationResult>;
    /**
     * Generate node configuration based on requirements
     */
    generateNodeConfiguration(nodeId: string, requirements: NodeRequirements): Promise<NodeConfiguration>;
    /**
     * Suggest nodes for a workflow based on description
     */
    suggestNodesForWorkflow(workflowDescription: string): Promise<NodeSuggestion[]>;
    /**
     * Generate a complete workflow with community nodes
     */
    generateWorkflowWithCommunityNodes(requirements: WorkflowRequirements): Promise<GeneratedWorkflow>;
    private loadInstalledNodes;
    private saveInstalledNodes;
    private delay;
    private isVersionNewer;
    private generateUsageExamples;
    private generateDocumentation;
    private analyzeDependencies;
    private generateConnectionMappings;
    private generateDefaultValue;
    private extractKeywords;
    private calculateRelevanceScore;
    private selectOptimalNodes;
    private validateGeneratedWorkflow;
    /**
     * Clear all caches
     */
    clearCaches(): void;
    /**
     * Get integration statistics
     */
    getStats(): {
        installedNodes: number;
        cachedIntegrations: number;
        registryNodes: number;
    };
}
//# sourceMappingURL=community-node-integration-api.d.ts.map