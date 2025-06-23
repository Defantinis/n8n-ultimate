import { N8nWorkflow } from '../types/n8n-workflow';
export interface ABTestConfig {
    testName: string;
    workflowA: N8nWorkflow;
    workflowB: N8nWorkflow;
    splitPercentage: number;
}
/**
 * Generates a single, combined n8n workflow for A/B testing two different workflows.
 */
export declare class ABTestWorkflowGenerator {
    generate(config: ABTestConfig): N8nWorkflow;
    private prefixNodeIds;
    private generateConnections;
}
//# sourceMappingURL=ab-test-generator.d.ts.map