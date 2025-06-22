import { promises as fs } from 'fs';
import path from 'path';
import { WorkflowParser } from './parsers/workflow-parser.js';
import { SimplifiedValidationErrorIntegrator } from './validation/validation-error-integrator.js';
async function main() {
    try {
        console.log('Starting validation process...');
        // 1. Read the workflow file
        const workflowPath = path.resolve(process.cwd(), 'workflows/hubspot-mixpanel-integration.json');
        console.log(`Reading workflow from: ${workflowPath}`);
        const workflowContent = await fs.readFile(workflowPath, 'utf-8');
        const workflowJson = JSON.parse(workflowContent);
        // 2. Parse the workflow
        console.log('Parsing workflow...');
        const parser = new WorkflowParser();
        const parsedWorkflow = await parser.parseWorkflow(workflowJson);
        console.log(`Workflow "${parsedWorkflow.workflow.name}" parsed successfully.`);
        // 3. Instantiate the validator
        console.log('Instantiating validator...');
        const validator = new SimplifiedValidationErrorIntegrator();
        // 4. Run the validation
        console.log('Running validation...');
        const validationResult = validator.validate(parsedWorkflow.workflow);
        // 5. Print the results
        console.log('\n--- Validation Results ---');
        console.log(`Overall Valid: ${validationResult.overallValid}`);
        console.log('\nConnection Validation:');
        console.log(`  - Is Valid: ${validationResult.connectionValidation.isValid}`);
        console.log(`  - Errors: ${validationResult.connectionValidation.errors.length}`);
        console.log(`  - Warnings: ${validationResult.connectionValidation.warnings.length}`);
        if (validationResult.connectionValidation.errors.length > 0) {
            console.log('  - Error Details:');
            validationResult.connectionValidation.errors.forEach(e => console.log(`    - ${e.message}`));
        }
        console.log('\nNode Compatibility Validation:');
        console.log(`  - Is Valid: ${validationResult.nodeCompatibilityValidation.isValid}`);
        console.log(`  - Errors: ${validationResult.nodeCompatibilityValidation.errors.length}`);
        console.log(`  - Warnings: ${validationResult.nodeCompatibilityValidation.warnings.length}`);
        if (validationResult.nodeCompatibilityValidation.errors.length > 0) {
            console.log('  - Error Details:');
            validationResult.nodeCompatibilityValidation.errors.forEach(e => console.log(`    - ${e.message}`));
        }
        console.log('\n--- Validation Complete ---');
    }
    catch (error) {
        console.error('An unexpected error occurred during validation:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=run-validation.js.map