import { WorkflowGenerator } from './dist/generators/workflow-generator.js';

async function testSimpleGeneration() {
  console.log('🧪 Testing WorkflowGenerator with fallback mode...');
  
  const generator = new WorkflowGenerator();
  
  const requirements = {
    name: 'Simple Test Workflow',
    description: 'Create a basic HTTP test workflow that validates our HTTP client fix',
    type: 'automation',
    inputs: [{
      name: 'manual-trigger',
      type: 'manual',
      description: 'Manual trigger to start the test'
    }],
    outputs: [{
      name: 'test-results',
      type: 'api',
      description: 'HTTP test results and validation'
    }],
    steps: [
      'Initialize test session',
      'Make HTTP request to httpbin.org',
      'Validate response',
      'Generate results'
    ]
  };

  try {
    console.log('📋 Requirements:', JSON.stringify(requirements, null, 2));
    
    const result = await generator.generateWorkflow(requirements);
    
    console.log('✅ Workflow generated successfully!');
    console.log('📊 Node count:', result.generationDetails.nodeCount);
    console.log('🔗 Connection count:', result.generationDetails.connectionCount);
    console.log('📈 Complexity:', result.generationDetails.complexity);
    
    // Save the workflow
    const fs = await import('fs/promises');
    await fs.writeFile('workflows/ai-generated-test-workflow.json', JSON.stringify(result.workflow, null, 2));
    
    console.log('💾 Workflow saved to: workflows/ai-generated-test-workflow.json');
    
    return result;
    
  } catch (error) {
    console.error('❌ Generation failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testSimpleGeneration(); 