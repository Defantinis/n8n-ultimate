/**
 * Node Compatibility Validator
 * Validates n8n node compatibility, parameters, and connections
 */
import { N8nWorkflow, N8nNode, ValidationResult } from '../types/n8n-workflow.js';
/**
 * Node type categories for compatibility validation
 */
export declare const NODE_CATEGORIES: {
    readonly TRIGGER: "trigger";
    readonly ACTION: "action";
    readonly TRANSFORM: "transform";
    readonly CONTROL: "control";
    readonly OUTPUT: "output";
};
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
export declare const N8N_CORE_NODES: {
    readonly START: "n8n-nodes-base.start";
    readonly MANUAL_TRIGGER: "n8n-nodes-base.manualTrigger";
    readonly WEBHOOK: "n8n-nodes-base.webhook";
    readonly CRON: "n8n-nodes-base.cron";
    readonly SET: "n8n-nodes-base.set";
    readonly CODE: "n8n-nodes-base.code";
    readonly FUNCTION: "n8n-nodes-base.function";
    readonly FUNCTION_ITEM: "n8n-nodes-base.functionItem";
    readonly IF: "n8n-nodes-base.if";
    readonly SWITCH: "n8n-nodes-base.switch";
    readonly MERGE: "n8n-nodes-base.merge";
    readonly SPLIT_IN_BATCHES: "n8n-nodes-base.splitInBatches";
    readonly HTTP_REQUEST: "n8n-nodes-base.httpRequest";
    readonly POSTGRES: "n8n-nodes-base.postgres";
    readonly MYSQL: "n8n-nodes-base.mySql";
    readonly MONGODB: "n8n-nodes-base.mongoDb";
    readonly AWS_S3: "n8n-nodes-base.awsS3";
    readonly GOOGLE_SHEETS: "n8n-nodes-base.googleSheets";
    readonly EMAIL_SEND: "n8n-nodes-base.emailSend";
    readonly SLACK: "n8n-nodes-base.slack";
    readonly OPENAI: "n8n-nodes-base.openAi";
    readonly ANTHROPIC: "n8n-nodes-base.anthropic";
};
/**
 * Node compatibility database
 */
export declare const NODE_COMPATIBILITY_DB: Record<string, NodeCompatibilityInfo>;
/**
 * Connection compatibility rules
 */
export declare const CONNECTION_COMPATIBILITY_RULES: ConnectionCompatibilityInfo[];
/**
 * Node Compatibility Validator Class
 */
export declare class NodeCompatibilityValidator {
    private compatibilityDB;
    private connectionRules;
    constructor(customCompatibilityDB?: Record<string, NodeCompatibilityInfo>, customConnectionRules?: ConnectionCompatibilityInfo[]);
    /**
     * Validate all nodes in a workflow for compatibility
     */
    validateWorkflowNodeCompatibility(workflow: N8nWorkflow): ValidationResult;
    /**
     * Validate a single node's compatibility
     */
    validateNode(node: N8nNode, workflow?: N8nWorkflow): ValidationResult;
    /**
     * Validate node type compatibility
     */
    private validateNodeType;
    /**
     * Validate node version compatibility
     */
    private validateNodeVersion;
    /**
     * Validate node parameters
     */
    private validateNodeParameters;
    /**
     * Validate node connections
     */
    private validateNodeConnections;
    /**
     * Validate a specific connection between two nodes
     */
    private validateConnection;
    /**
     * Check for deprecated nodes
     */
    private validateNodeDeprecation;
    /**
     * Get compatibility information for a node type
     */
    getNodeCompatibilityInfo(nodeType: string): NodeCompatibilityInfo | null;
    /**
     * Add custom node compatibility information
     */
    addNodeCompatibility(nodeType: string, info: NodeCompatibilityInfo): void;
    /**
     * Add custom connection rule
     */
    addConnectionRule(rule: ConnectionCompatibilityInfo): void;
    /**
     * Get all supported node types
     */
    getSupportedNodeTypes(): string[];
    /**
     * Get nodes by category
     */
    getNodesByCategory(category: string): string[];
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
    };
    private generateRecommendations;
    private countInputConnections;
    private countOutputConnections;
}
/**
 * Utility functions for node compatibility
 */
export declare const NodeCompatibilityUtils: {
    /**
     * Check if two node types can be connected
     */
    canConnect(sourceNodeType: string, targetNodeType: string, outputType?: string, inputType?: string, validator?: NodeCompatibilityValidator): boolean;
    /**
     * Get recommended replacement for deprecated node
     */
    getReplacementNode(nodeType: string): string | null;
    /**
     * Check if node is deprecated
     */
    isNodeDeprecated(nodeType: string): boolean;
    /**
     * Get node category
     */
    getNodeCategory(nodeType: string): string | null;
};
//# sourceMappingURL=node-compatibility-validator.d.ts.map