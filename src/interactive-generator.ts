import { WorkflowGenerator, WorkflowRequirements } from './generators/workflow-generator.js';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Interactive script to generate an n8n workflow from a command-line prompt.
 */
async function generateFromPrompt() {
  const prompt = process.argv[2];

  if (!prompt) {
    console.error('❌ Please provide a description for the workflow as an argument.');
    console.log('   Example: node dist/interactive-generator.js "Create a workflow that fetches a random joke from an API and saves it to a file"');
    process.exit(1);
  }

  console.log(`🚀 Generating workflow for prompt: "${prompt}"`);

  const generator = new WorkflowGenerator();

  // Basic requirements from the prompt
  const requirements: WorkflowRequirements = {
    name: 'AI Generated Workflow',
    description: prompt,
    type: 'automation', // Let the AI decide the specifics
  };

  try {
    const generated = await generator.generateWorkflow(requirements);
    const { workflow, generationDetails, validation } = generated;

    console.log(`\n✅ Workflow "${workflow.name}" generated successfully!`);
    console.log('---');
    console.log('📊 Generation Details:');
    console.log(`   - AI Rationale: ${generationDetails.plan.rationale}`);
    console.log(`   - Nodes Created: ${generationDetails.nodeCount}`);
    console.log(`   - Connections: ${generationDetails.connectionCount}`);
    console.log(`   - Estimated Complexity: ${generationDetails.complexity}/10`);
    console.log(`   - Validation Status: ${validation.isValid ? '✅ Valid' : '❌ Has Issues'}`);

    if (!validation.isValid) {
      console.log('   - Errors:', validation.errors.map((e: any) => e.message).join(', '));
      console.log('   - Warnings:', validation.warnings.map((w: any) => w.message).join(', '));
    }

    // Save the workflow to a file
    const outputDir = path.join(process.cwd(), 'workflows');
    await fs.mkdir(outputDir, { recursive: true });
    
    // Create a filename-safe version of the prompt
    const safeName = workflow.name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50);
    const outputPath = path.join(outputDir, `${safeName}.json`);
    
    await fs.writeFile(outputPath, JSON.stringify(workflow, null, 2));
    
    console.log(`\n💾 Workflow saved to: ${outputPath}`);
    console.log('---');

  } catch (error) {
    console.error('\n❌ An error occurred during workflow generation:');
    console.error(error);
  }
}

generateFromPrompt(); 