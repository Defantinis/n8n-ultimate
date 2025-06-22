import { N8nWorkflow, ValidationResult } from '../types/n8n-workflow.js';
export interface SimplifiedValidationResult {
    connectionValidation: ValidationResult;
    nodeCompatibilityValidation: ValidationResult;
    overallValid: boolean;
}
export declare class SimplifiedValidationErrorIntegrator {
    private connectionValidator;
    private nodeCompatibilityValidator;
    constructor();
    validate(workflow: N8nWorkflow): SimplifiedValidationResult;
}
//# sourceMappingURL=validation-error-integrator.d.ts.map