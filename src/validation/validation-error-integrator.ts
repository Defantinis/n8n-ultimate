import { N8nWorkflow, ValidationResult } from '../types/n8n-workflow.js';
import { ConnectionValidator } from './connection-validator.js';
import { NodeCompatibilityValidator } from './node-compatibility-validator.js';

export interface SimplifiedValidationResult {
  connectionValidation: ValidationResult;
  nodeCompatibilityValidation: ValidationResult;
  overallValid: boolean;
}

export class SimplifiedValidationErrorIntegrator {
  private connectionValidator: ConnectionValidator;
  private nodeCompatibilityValidator: NodeCompatibilityValidator;

  constructor() {
    this.connectionValidator = new ConnectionValidator();
    this.nodeCompatibilityValidator = new NodeCompatibilityValidator();
  }

  public validate(workflow: N8nWorkflow): SimplifiedValidationResult {
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