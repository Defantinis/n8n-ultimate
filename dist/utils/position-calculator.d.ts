import { N8nNode, N8nConnections } from '../types/n8n-workflow.js';
/**
 * Utility class for calculating visual positions of nodes in n8n workflows
 */
export declare class PositionCalculator {
    private readonly HORIZONTAL_SPACING;
    private readonly VERTICAL_SPACING;
    private readonly START_X;
    private readonly START_Y;
    /**
     * Calculate positions for all nodes based on their connections
     */
    calculatePositions(nodes: N8nNode[], connections: N8nConnections): N8nNode[];
    /**
     * Analyze the structure of the workflow
     */
    private analyzeWorkflowStructure;
    /**
     * Position nodes in a linear workflow
     */
    private positionLinearWorkflow;
    /**
     * Position nodes in a parallel workflow
     */
    private positionParallelWorkflow;
    /**
     * Position nodes in a conditional workflow
     */
    private positionConditionalWorkflow;
    /**
     * Position nodes in a complex workflow using force-directed layout
     */
    private positionComplexWorkflow;
    /**
     * Apply default grid layout
     */
    private positionDefaultLayout;
    private findStartNodes;
    private findEndNodes;
    private isLinearStructure;
    private isParallelStructure;
    private isConditionalStructure;
    private createLinearLayers;
    private createParallelLayers;
    private createConditionalLayers;
    private createComplexLayers;
}
//# sourceMappingURL=position-calculator.d.ts.map