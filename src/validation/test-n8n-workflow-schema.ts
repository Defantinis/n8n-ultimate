/**
 * Test Suite for N8N Workflow Schema Validation
 */

import {
  N8NWorkflowSchema,
  N8NNode,
  N8NWorkflowSchemaValidator,
  N8NWorkflowBuilder,
  WorkflowSchemaUtils,
  N8N_CORE_NODES,
  CONNECTION_TYPES,
  ValidationResult
} from './n8n-workflow-schema';

/**
 * Mock data for testing
 */
export class N8NWorkflowTestData {
  static createValidWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Test Workflow',
      active: true,
      nodes: [
        {
          id: 'start_node',
          name: 'Start',
          type: N8N_CORE_NODES.MANUAL_TRIGGER,
          typeVersion: 1,
          position: [100, 100],
          parameters: {}
        },
        {
          id: 'http_node',
          name: 'HTTP Request',
          type: N8N_CORE_NODES.HTTP_REQUEST,
          typeVersion: 1,
          position: [300, 100],
          parameters: {
            method: 'GET',
            url: 'https://api.example.com/data'
          }
        },
        {
          id: 'set_node',
          name: 'Set Data',
          type: N8N_CORE_NODES.SET,
          typeVersion: 1,
          position: [500, 100],
          parameters: {
            values: [
              {
                name: 'processedData',
                value: '{{ $json.data }}'
              }
            ]
          }
        }
      ],
      connections: {
        'start_node': {
          'main': [{
            node: 'http_node',
            type: 'main',
            index: 0
          }]
        },
        'http_node': {
          'main': [{
            node: 'set_node',
            type: 'main',
            index: 0
          }]
        }
      }
    };
  }

  static createInvalidWorkflow(): N8NWorkflowSchema {
    return {
      name: '',
      active: true,
      nodes: [
        {
          id: 'duplicate_id',
          name: 'Node 1',
          type: N8N_CORE_NODES.MANUAL_TRIGGER,
          typeVersion: 1,
          position: [100, 100],
          parameters: {}
        },
        {
          id: 'duplicate_id', // Duplicate ID
          name: 'Node 2',
          type: N8N_CORE_NODES.HTTP_REQUEST,
          typeVersion: 1,
          position: [300, 100],
          parameters: {}
        }
      ],
      connections: {
        'duplicate_id': {
          'main': [{
            node: 'non_existent_node', // Reference to non-existent node
            type: 'main',
            index: 0
          }]
        }
      }
    };
  }

  static createCyclicWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Cyclic Workflow',
      active: true,
      nodes: [
        {
          id: 'node_a',
          name: 'Node A',
          type: N8N_CORE_NODES.SET,
          typeVersion: 1,
          position: [100, 100],
          parameters: { values: [] }
        },
        {
          id: 'node_b',
          name: 'Node B',
          type: N8N_CORE_NODES.SET,
          typeVersion: 1,
          position: [300, 100],
          parameters: { values: [] }
        },
        {
          id: 'node_c',
          name: 'Node C',
          type: N8N_CORE_NODES.SET,
          typeVersion: 1,
          position: [500, 100],
          parameters: { values: [] }
        }
      ],
      connections: {
        'node_a': {
          'main': [{
            node: 'node_b',
            type: 'main',
            index: 0
          }]
        },
        'node_b': {
          'main': [{
            node: 'node_c',
            type: 'main',
            index: 0
          }]
        },
        'node_c': {
          'main': [{
            node: 'node_a', // Creates cycle
            type: 'main',
            index: 0
          }]
        }
      }
    };
  }

  static createComplexWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Complex AI Workflow',
      active: true,
      nodes: [
        {
          id: 'webhook_trigger',
          name: 'Webhook Trigger',
          type: N8N_CORE_NODES.WEBHOOK,
          typeVersion: 1,
          position: [100, 100],
          parameters: {
            path: 'ai-process',
            httpMethod: 'POST'
          }
        },
        {
          id: 'validate_input',
          name: 'Validate Input',
          type: N8N_CORE_NODES.CODE,
          typeVersion: 1,
          position: [300, 100],
          parameters: {
            code: 'if (!$input.first().json.text) throw new Error("Text required");',
            mode: 'runOnceForAllItems'
          }
        },
        {
          id: 'openai_analysis',
          name: 'OpenAI Analysis',
          type: N8N_CORE_NODES.OPENAI,
          typeVersion: 1,
          position: [500, 100],
          parameters: {
            resource: 'text',
            operation: 'complete',
            model: 'gpt-4',
            prompt: '{{ $json.text }}'
          },
          credentials: {
            openAiApi: 'openai_credentials'
          }
        },
        {
          id: 'condition_check',
          name: 'Check Sentiment',
          type: N8N_CORE_NODES.IF,
          typeVersion: 1,
          position: [700, 100],
          parameters: {
            conditions: [{
              leftValue: '{{ $json.sentiment }}',
              rightValue: 'positive',
              operation: 'equal'
            }]
          }
        },
        {
          id: 'positive_response',
          name: 'Positive Response',
          type: N8N_CORE_NODES.SET,
          typeVersion: 1,
          position: [900, 50],
          parameters: {
            values: [{
              name: 'response',
              value: 'Positive sentiment detected!'
            }]
          }
        },
        {
          id: 'negative_response',
          name: 'Negative Response',
          type: N8N_CORE_NODES.SET,
          typeVersion: 1,
          position: [900, 150],
          parameters: {
            values: [{
              name: 'response',
              value: 'Negative sentiment detected!'
            }]
          }
        }
      ],
      connections: {
        'webhook_trigger': {
          'main': [{
            node: 'validate_input',
            type: 'main',
            index: 0
          }]
        },
        'validate_input': {
          'main': [{
            node: 'openai_analysis',
            type: 'main',
            index: 0
          }]
        },
        'openai_analysis': {
          'main': [{
            node: 'condition_check',
            type: 'main',
            index: 0
          }]
        },
        'condition_check': {
          'main': [
            {
              node: 'positive_response',
              type: 'main',
              index: 0
            },
            {
              node: 'negative_response',
              type: 'main',
              index: 0
            }
          ]
        }
      },
      settings: {
        executionOrder: 'v1',
        saveManualExecutions: true,
        executionTimeout: 300
      },
      tags: [
        {
          id: 'ai_tag',
          name: 'AI Processing'
        }
      ]
    };
  }
}

/**
 * Test Suite Class
 */
export class N8NWorkflowSchemaTestSuite {
  private validator: N8NWorkflowSchemaValidator;
  private testResults: Array<{ test: string; passed: boolean; message?: string }> = [];

  constructor() {
    this.validator = new N8NWorkflowSchemaValidator();
  }

  /**
   * Run all tests
   */
  runAllTests(): void {
    console.log('🧪 Running N8N Workflow Schema Test Suite...\n');

    this.testValidWorkflow();
    this.testInvalidWorkflow();
    this.testWorkflowBuilder();
    this.testSchemaUtils();
    this.testParameterValidation();
    this.testCycleDetection();
    this.testComplexWorkflow();
    this.testCustomValidationRules();

    this.printResults();
  }

  private addTest(testName: string, condition: boolean, message?: string): void {
    this.testResults.push({
      test: testName,
      passed: condition,
      message: message
    });
  }

  /**
   * Test valid workflow validation
   */
  private testValidWorkflow(): void {
    const workflow = N8NWorkflowTestData.createValidWorkflow();
    const isValid = this.validator.isValid(workflow);
    const results = this.validator.validate(workflow);
    
    this.addTest(
      'Valid Workflow Validation',
      isValid,
      `Should pass validation, got ${results.length} issues`
    );

    // Test individual validation rules
    const hasName = workflow.name && workflow.name.length > 0;
    this.addTest('Workflow Has Name', hasName);

    const hasNodes = workflow.nodes && workflow.nodes.length > 0;
    this.addTest('Workflow Has Nodes', hasNodes);

    const uniqueIds = new Set(workflow.nodes.map(n => n.id)).size === workflow.nodes.length;
    this.addTest('Nodes Have Unique IDs', uniqueIds);
  }

  /**
   * Test invalid workflow validation
   */
  private testInvalidWorkflow(): void {
    const workflow = N8NWorkflowTestData.createInvalidWorkflow();
    const isValid = this.validator.isValid(workflow);
    const results = this.validator.validate(workflow);
    
    this.addTest(
      'Invalid Workflow Validation',
      !isValid,
      `Should fail validation, got ${results.length} issues`
    );

    // Check specific validation failures
    const hasNameError = results.some(r => r.message?.includes('name'));
    this.addTest('Detects Missing Name', hasNameError);

    const hasDuplicateIdError = results.some(r => r.message?.includes('unique'));
    this.addTest('Detects Duplicate IDs', hasDuplicateIdError);

    const hasConnectionError = results.some(r => r.message?.includes('non-existent'));
    this.addTest('Detects Invalid Connections', hasConnectionError);
  }

  /**
   * Test workflow builder
   */
  private testWorkflowBuilder(): void {
    try {
      const builder = new N8NWorkflowBuilder();
      
      const startNode = WorkflowSchemaUtils.createNode(
        N8N_CORE_NODES.MANUAL_TRIGGER,
        'Start Node'
      );
      
      const httpNode = WorkflowSchemaUtils.createNode(
        N8N_CORE_NODES.HTTP_REQUEST,
        'HTTP Node',
        { method: 'GET', url: 'https://api.example.com' }
      );

      const workflow = builder
        .setName('Builder Test Workflow')
        .setActive(true)
        .addNode(startNode)
        .addNode(httpNode)
        .addConnection(startNode.id, httpNode.id)
        .build();

      const isValid = this.validator.isValid(workflow);
      this.addTest('Workflow Builder Creates Valid Workflow', isValid);

      this.addTest('Builder Sets Name Correctly', workflow.name === 'Builder Test Workflow');
      this.addTest('Builder Sets Active Status', workflow.active === true);
      this.addTest('Builder Adds Nodes', workflow.nodes.length === 2);
      this.addTest('Builder Creates Connections', Object.keys(workflow.connections).length > 0);

    } catch (error) {
      this.addTest('Workflow Builder', false, `Builder failed: ${error}`);
    }
  }

  /**
   * Test schema utilities
   */
  private testSchemaUtils(): void {
    // Test node ID generation
    const nodeId1 = WorkflowSchemaUtils.generateNodeId('test');
    const nodeId2 = WorkflowSchemaUtils.generateNodeId('test');
    this.addTest('Generate Unique Node IDs', nodeId1 !== nodeId2);

    // Test node creation
    const node = WorkflowSchemaUtils.createNode(
      N8N_CORE_NODES.SET,
      'Test Node',
      { values: [] },
      [100, 200]
    );
    
    this.addTest('Create Node Structure', 
      node.type === N8N_CORE_NODES.SET && 
      node.name === 'Test Node' &&
      node.position[0] === 100 &&
      node.position[1] === 200
    );

    // Test connected nodes detection
    const workflow = N8NWorkflowTestData.createValidWorkflow();
    const connected = WorkflowSchemaUtils.getConnectedNodes(workflow, 'start_node');
    this.addTest('Detect Connected Nodes', connected.includes('http_node'));
  }

  /**
   * Test parameter validation
   */
  private testParameterValidation(): void {
    // Test valid HTTP request parameters
    const validParams = { method: 'GET', url: 'https://example.com' };
    const validResult = WorkflowSchemaUtils.validateNodeParameters(
      N8N_CORE_NODES.HTTP_REQUEST,
      validParams
    );
    this.addTest('Valid Parameter Validation', validResult.valid);

    // Test missing required parameters
    const invalidParams = { method: 'GET' }; // Missing URL
    const invalidResult = WorkflowSchemaUtils.validateNodeParameters(
      N8N_CORE_NODES.HTTP_REQUEST,
      invalidParams
    );
    this.addTest('Invalid Parameter Detection', !invalidResult.valid);

    // Test unknown node type
    const unknownResult = WorkflowSchemaUtils.validateNodeParameters(
      'unknown-node-type',
      {}
    );
    this.addTest('Unknown Node Type Handling', unknownResult.valid); // Should pass with warning
  }

  /**
   * Test cycle detection
   */
  private testCycleDetection(): void {
    // Test workflow without cycles
    const validWorkflow = N8NWorkflowTestData.createValidWorkflow();
    const hasCycles1 = WorkflowSchemaUtils.hasCycles(validWorkflow);
    this.addTest('Detect No Cycles in Valid Workflow', !hasCycles1);

    // Test workflow with cycles
    const cyclicWorkflow = N8NWorkflowTestData.createCyclicWorkflow();
    const hasCycles2 = WorkflowSchemaUtils.hasCycles(cyclicWorkflow);
    this.addTest('Detect Cycles in Cyclic Workflow', hasCycles2);
  }

  /**
   * Test complex workflow
   */
  private testComplexWorkflow(): void {
    const workflow = N8NWorkflowTestData.createComplexWorkflow();
    const isValid = this.validator.isValid(workflow);
    
    this.addTest('Complex Workflow Validation', isValid);
    this.addTest('Complex Workflow Has Settings', !!workflow.settings);
    this.addTest('Complex Workflow Has Tags', !!workflow.tags && workflow.tags.length > 0);
    this.addTest('Complex Workflow Has Multiple Connections', 
      Object.keys(workflow.connections).length >= 4
    );

    // Test AI node validation
    const hasAINode = workflow.nodes.some(node => node.type === N8N_CORE_NODES.OPENAI);
    this.addTest('Complex Workflow Contains AI Node', hasAINode);

    // Test conditional logic
    const hasConditional = workflow.nodes.some(node => node.type === N8N_CORE_NODES.IF);
    this.addTest('Complex Workflow Contains Conditional Logic', hasConditional);
  }

  /**
   * Test custom validation rules
   */
  private testCustomValidationRules(): void {
    // Add custom rule
    this.validator.addRule({
      name: 'no-webhook-without-path',
      description: 'Webhook nodes must have a path parameter',
      severity: 'warning',
      validate: (workflow) => {
        for (const node of workflow.nodes) {
          if (node.type === N8N_CORE_NODES.WEBHOOK && !node.parameters.path) {
            return {
              valid: false,
              message: `Webhook node ${node.id} missing path parameter`,
              nodeId: node.id
            };
          }
        }
        return { valid: true };
      }
    });

    // Test with webhook that has path
    const validWebhookWorkflow = N8NWorkflowTestData.createComplexWorkflow();
    const results1 = this.validator.validate(validWebhookWorkflow);
    const webhookValid = results1.every(r => r.valid || r.severity !== 'warning');
    this.addTest('Custom Rule - Valid Webhook', webhookValid);

    // Test with webhook without path
    const invalidWebhookWorkflow = {
      ...validWebhookWorkflow,
      nodes: [
                 {
           id: 'bad_webhook',
           name: 'Bad Webhook',
           type: N8N_CORE_NODES.WEBHOOK,
           typeVersion: 1,
           position: [100, 100] as [number, number],
           parameters: {} // Missing path
         }
      ]
    };

    const results2 = this.validator.validate(invalidWebhookWorkflow);
    const hasWebhookWarning = results2.some(r => 
      r.message?.includes('path parameter') && r.severity === 'warning'
    );
    this.addTest('Custom Rule - Invalid Webhook Detection', hasWebhookWarning);
  }

  /**
   * Print test results
   */
  private printResults(): void {
    const passed = this.testResults.filter(r => r.passed).length;
    const total = this.testResults.length;
    
    console.log(`\n📊 Test Results: ${passed}/${total} tests passed\n`);

    this.testResults.forEach(result => {
      const icon = result.passed ? '✅' : '❌';
      const message = result.message ? ` - ${result.message}` : '';
      console.log(`${icon} ${result.test}${message}`);
    });

    if (passed === total) {
      console.log('\n🎉 All tests passed! N8N Workflow Schema validation is working correctly.');
    } else {
      console.log(`\n⚠️  ${total - passed} tests failed. Please review the implementation.`);
    }
  }
}

/**
 * Example usage and demonstration
 */
export function demonstrateN8NWorkflowSchema(): void {
  console.log('🔧 N8N Workflow Schema Demonstration\n');

  // Create a sample workflow using the builder
  const builder = new N8NWorkflowBuilder();
  
  const startNode = WorkflowSchemaUtils.createNode(
    N8N_CORE_NODES.MANUAL_TRIGGER,
    'Manual Trigger'
  );
  
  const aiNode = WorkflowSchemaUtils.createNode(
    N8N_CORE_NODES.OPENAI,
    'AI Analysis',
    {
      resource: 'text',
      operation: 'complete',
      model: 'gpt-4',
      prompt: 'Analyze this data: {{ $json.input }}'
    }
  );

  const workflow = builder
    .setName('AI Analysis Workflow')
    .setActive(true)
    .addNode(startNode)
    .addNode(aiNode)
    .addConnection(startNode.id, aiNode.id)
    .setSettings({
      executionOrder: 'v1',
      saveManualExecutions: true
    })
    .build();

  console.log('📋 Generated Workflow:');
  console.log(JSON.stringify(workflow, null, 2));

  // Validate the workflow
  const validator = new N8NWorkflowSchemaValidator();
  const results = validator.validate(workflow);
  
  console.log('\n🔍 Validation Results:');
  results.forEach(result => {
    const status = result.valid ? '✅ PASS' : '❌ FAIL';
    console.log(`${status}: ${result.message || 'No message'}`);
  });

  console.log(`\n📈 Overall Valid: ${validator.isValid(workflow)}`);
}

// Export test runner function
export function runN8NWorkflowSchemaTests(): void {
  const testSuite = new N8NWorkflowSchemaTestSuite();
  testSuite.runAllTests();
}

// Export demonstration function is already exported above 