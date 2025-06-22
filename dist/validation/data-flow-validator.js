import { ConnectionValidator } from './connection-validator.js';
export class DataFlowValidator {
    generateDataFlowReport(workflow) {
        const { errors, warnings } = this.validateDataFlowContinuity(workflow);
        return {
            summary: {
                errors: errors.length,
                warnings: warnings.length,
            }
        };
    }
    validateDataFlowContinuity(workflow) {
        const errors = [];
        const warnings = [];
        const analysis = new ConnectionValidator().analyzeDataFlow(workflow);
        if (analysis.unreachableNodes.length > 0) {
            const message = `Unreachable nodes detected: ${analysis.unreachableNodes.join(', ')}`;
            errors.push({ type: 'data_flow_continuity', message, severity: 'error' });
        }
        if (analysis.isolatedNodes.length > 0) {
            const message = `Isolated nodes detected: ${analysis.isolatedNodes.join(', ')}`;
            warnings.push({ type: 'data_flow_continuity', message });
        }
        return { isValid: errors.length === 0, errors, warnings };
    }
}
//# sourceMappingURL=data-flow-validator.js.map