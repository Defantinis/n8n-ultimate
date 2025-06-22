import { N8nWorkflow, ValidationResult, ValidationError, ValidationWarning } from '../types/n8n-workflow.js';
import { ConnectionValidator } from './connection-validator.js';

export class DataFlowValidator {
  public generateDataFlowReport(workflow: N8nWorkflow): { summary: { errors: number, warnings: number } } {
    const { errors, warnings } = this.validateDataFlowContinuity(workflow);
    return {
      summary: {
        errors: errors.length,
        warnings: warnings.length,
      }
    };
  }

  private validateDataFlowContinuity(workflow: N8nWorkflow): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
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