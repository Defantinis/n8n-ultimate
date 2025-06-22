import { N8nWorkflow } from '../types/n8n-workflow.js';
export declare class DataFlowValidator {
    generateDataFlowReport(workflow: N8nWorkflow): {
        summary: {
            errors: number;
            warnings: number;
        };
    };
    private validateDataFlowContinuity;
}
//# sourceMappingURL=data-flow-validator.d.ts.map