import { ConnectionValidator } from './connection-validator.js';
import { NodeCompatibilityValidator } from './node-compatibility-validator.js';
export class SimplifiedValidationErrorIntegrator {
    connectionValidator;
    nodeCompatibilityValidator;
    constructor() {
        this.connectionValidator = new ConnectionValidator();
        this.nodeCompatibilityValidator = new NodeCompatibilityValidator();
    }
    validate(workflow) {
        const connectionValidation = this.connectionValidator.validateWorkflowConnections(workflow);
        const nodeCompatibilityValidation = this.nodeCompatibilityValidator.validateWorkflowNodeCompatibility(workflow);
        const overallValid = connectionValidation.isValid && nodeCompatibilityValidation.isValid;
        return {
            connectionValidation,
            nodeCompatibilityValidation,
            overallValid,
        };
    }
}
//# sourceMappingURL=validation-error-integrator.js.map