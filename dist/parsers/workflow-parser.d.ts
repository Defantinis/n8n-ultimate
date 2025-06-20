import { N8nWorkflow, N8nNode, ParsedWorkflow } from '../types/n8n-workflow.js';
/**
 * Main workflow parser for n8n JSON files
 */
export declare class WorkflowParser {
    private validator;
    constructor();
    /**
     * Parse a workflow from a JSON file
     */
    parseFromFile(filePath: string): Promise<ParsedWorkflow>;
    /**
     * Parse a workflow from a JSON string
     */
    parseFromString(jsonContent: string): Promise<ParsedWorkflow>;
    /**
     * Parse a workflow object
     */
    parseWorkflow(workflow: N8nWorkflow): Promise<ParsedWorkflow>;
    /**
     * Analyze workflow metadata and complexity
     */
    private analyzeWorkflowMetadata;
    /**
     * Detect if the workflow has loops
     */
    private detectLoops;
    /**
     * Calculate the maximum depth of the workflow
     */
    private calculateMaxDepth;
    /**
     * Estimate workflow complexity on a scale of 1-10
     */
    private estimateComplexity;
    /**
     * Extract specific node by name
     */
    getNodeByName(workflow: N8nWorkflow, nodeName: string): N8nNode | undefined;
    /**
     * Extract nodes by type
     */
    getNodesByType(workflow: N8nWorkflow, nodeType: string): N8nNode[];
    /**
     * Get all connections for a specific node
     */
    getNodeConnections(workflow: N8nWorkflow, nodeName: string): {
        [outputType: string]: {
            node: string;
            type: string;
            index: number;
        }[][];
    };
    /**
     * Get nodes that connect to a specific node
     */
    getIncomingConnections(workflow: N8nWorkflow, targetNodeName: string): Array<{
        sourceNode: string;
        outputType: string;
        outputIndex: number;
        inputIndex: number;
    }>;
    /**
     * Generate a workflow summary
     */
    generateSummary(parsedWorkflow: ParsedWorkflow): string;
}
//# sourceMappingURL=workflow-parser.d.ts.map