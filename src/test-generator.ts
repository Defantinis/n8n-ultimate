import { WorkflowGenerator, WorkflowRequirements } from './generators/workflow-generator.js';

/**
 * Test the workflow generation tools
 */
async function testWorkflowGeneration() {
  console.log('🚀 Testing n8n Workflow Generation Tools\n');

  const generator = new WorkflowGenerator();

  // Test 1: Generate a simple API integration workflow
  console.log('📡 Test 1: API Integration Workflow');
  const apiRequirements: WorkflowRequirements = {
    name: 'Weather API Integration',
    description: 'Fetch weather data from an API and process it',
    type: 'api-integration',
    inputs: [
      {
        name: 'trigger',
        type: 'manual',
        description: 'Manual trigger to start the workflow'
      }
    ],
    outputs: [
      {
        name: 'weather_data',
        type: 'api',
        description: 'Processed weather information'
      }
    ],
    steps: [
      'Start the workflow',
      'Make HTTP request to weather API',
      'Process the weather data',
      'Format the output'
    ],
    constraints: {
      maxNodes: 5,
      maxComplexity: 6
    }
  };

  try {
    const apiWorkflow = await generator.generateWorkflow(apiRequirements);
    console.log(`✅ Generated workflow: ${apiWorkflow.workflow.name}`);
    console.log(`   - Nodes: ${apiWorkflow.generationDetails.nodeCount}`);
    console.log(`   - Connections: ${apiWorkflow.generationDetails.connectionCount}`);
    console.log(`   - Complexity: ${apiWorkflow.generationDetails.complexity}/10`);
    console.log(`   - Validation: ${apiWorkflow.validation.isValid ? 'Valid' : 'Has issues'}`);
    
    if (!apiWorkflow.validation.isValid) {
      console.log(`   - Errors: ${apiWorkflow.validation.errors.length}`);
      console.log(`   - Warnings: ${apiWorkflow.validation.warnings.length}`);
    }
  } catch (error) {
    console.log(`❌ Failed to generate API workflow: ${error}`);
  }

  console.log();

  // Test 2: Generate a data processing workflow
  console.log('📊 Test 2: Data Processing Workflow');
  const dataRequirements: WorkflowRequirements = {
    name: 'CSV Data Processor',
    description: 'Read CSV file, process data, and output results',
    type: 'data-processing',
    inputs: [
      {
        name: 'csv_file',
        type: 'file',
        description: 'Input CSV file with data to process'
      }
    ],
    outputs: [
      {
        name: 'processed_file',
        type: 'file',
        description: 'Processed data file'
      }
    ],
    steps: [
      'Read CSV file',
      'Validate data format',
      'Transform data',
      'Calculate aggregations',
      'Write output file'
    ],
    constraints: {
      maxNodes: 8,
      maxComplexity: 7
    }
  };

  try {
    const dataWorkflow = await generator.generateWorkflow(dataRequirements);
    console.log(`✅ Generated workflow: ${dataWorkflow.workflow.name}`);
    console.log(`   - Nodes: ${dataWorkflow.generationDetails.nodeCount}`);
    console.log(`   - Connections: ${dataWorkflow.generationDetails.connectionCount}`);
    console.log(`   - Complexity: ${dataWorkflow.generationDetails.complexity}/10`);
    console.log(`   - Validation: ${dataWorkflow.validation.isValid ? 'Valid' : 'Has issues'}`);
  } catch (error) {
    console.log(`❌ Failed to generate data processing workflow: ${error}`);
  }

  console.log();

  // Test 3: Generate a notification workflow
  console.log('📬 Test 3: Notification Workflow');
  const notificationRequirements: WorkflowRequirements = {
    name: 'Alert System',
    description: 'Monitor system status and send alerts if issues detected',
    type: 'notification',
    inputs: [
      {
        name: 'webhook',
        type: 'webhook',
        description: 'Webhook trigger from monitoring system'
      }
    ],
    outputs: [
      {
        name: 'email_alert',
        type: 'email',
        description: 'Email notification to administrators'
      }
    ],
    steps: [
      'Receive webhook notification',
      'Parse alert data',
      'Check severity level',
      'Format alert message',
      'Send email notification'
    ],
    constraints: {
      maxNodes: 6,
      maxComplexity: 5
    }
  };

  try {
    const notificationWorkflow = await generator.generateWorkflow(notificationRequirements);
    console.log(`✅ Generated workflow: ${notificationWorkflow.workflow.name}`);
    console.log(`   - Nodes: ${notificationWorkflow.generationDetails.nodeCount}`);
    console.log(`   - Connections: ${notificationWorkflow.generationDetails.connectionCount}`);
    console.log(`   - Complexity: ${notificationWorkflow.generationDetails.complexity}/10`);
    console.log(`   - Validation: ${notificationWorkflow.validation.isValid ? 'Valid' : 'Has issues'}`);
  } catch (error) {
    console.log(`❌ Failed to generate notification workflow: ${error}`);
  }

  console.log();

  // Test 4: Test AI fallback when Ollama is not available
  console.log('🤖 Test 4: AI Fallback (Ollama not available)');
  const complexRequirements: WorkflowRequirements = {
    name: 'Complex Multi-Step Process',
    description: 'A complex workflow with multiple integrations and conditional logic',
    type: 'automation',
    inputs: [
      {
        name: 'schedule',
        type: 'schedule',
        description: 'Scheduled trigger every hour'
      }
    ],
    outputs: [
      {
        name: 'database_update',
        type: 'database',
        description: 'Updated records in database'
      },
      {
        name: 'report_file',
        type: 'file',
        description: 'Generated report file'
      }
    ],
    steps: [
      'Check for new data',
      'Validate data quality',
      'Process records',
      'Generate reports',
      'Update database',
      'Send notifications if errors'
    ],
    constraints: {
      maxNodes: 12,
      maxComplexity: 8
    }
  };

  try {
    const complexWorkflow = await generator.generateWorkflow(complexRequirements);
    console.log(`✅ Generated workflow: ${complexWorkflow.workflow.name}`);
    console.log(`   - Nodes: ${complexWorkflow.generationDetails.nodeCount}`);
    console.log(`   - Connections: ${complexWorkflow.generationDetails.connectionCount}`);
    console.log(`   - Complexity: ${complexWorkflow.generationDetails.complexity}/10`);
    console.log(`   - Validation: ${complexWorkflow.validation.isValid ? 'Valid' : 'Has issues'}`);
    console.log(`   - Generation rationale: ${complexWorkflow.generationDetails.plan.rationale}`);
  } catch (error) {
    console.log(`❌ Failed to generate complex workflow: ${error}`);
  }

  console.log('\n🎉 Workflow generation testing completed!');
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testWorkflowGeneration().catch(console.error);
} 