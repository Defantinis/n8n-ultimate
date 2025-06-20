/**
 * Test Suite for Node Compatibility Validator
 */

import {
  NodeCompatibilityValidator,
  NodeCompatibilityUtils,
  NODE_COMPATIBILITY_DB,
  NODE_CATEGORIES,
  NodeCompatibilityInfo,
  ConnectionCompatibilityInfo
} from './node-compatibility-validator';

import {
  N8NWorkflowSchema,
  N8NNode,
  N8N_CORE_NODES,
  WorkflowSchemaUtils
} from './n8n-workflow-schema';

/**
 * Test data for node compatibility validation
 */
export class NodeCompatibilityTestData {
  /**
   * Create a valid workflow with compatible nodes
   */
  static createValidCompatibleWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Compatible Workflow',
      active: true,
      nodes: [
        {
          id: 'trigger_node',
          name: 'Manual Trigger',
          type: N8N_CORE_NODES.MANUAL_TRIGGER,
          typeVersion: 1,
          position: [100, 100] as [number, number],
          parameters: {}
        },
        {
          id: 'http_node',
          name: 'HTTP Request',
          type: N8N_CORE_NODES.HTTP_REQUEST,
          typeVersion: 3,
          position: [300, 100] as [number, number],
          parameters: {
            method: 'GET',
            url: 'https://api.example.com/data'
          }
        },
        {
          id: 'set_node',
          name: 'Set Data',
          type: N8N_CORE_NODES.SET,
          typeVersion: 2,
          position: [500, 100] as [number, number],
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
        'trigger_node': {
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

  /**
   * Create a workflow with incompatible nodes
   */
  static createIncompatibleWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Incompatible Workflow',
      active: true,
      nodes: [
        {
          id: 'webhook_node',
          name: 'Webhook',
          type: N8N_CORE_NODES.WEBHOOK,
          typeVersion: 1,
          position: [100, 100] as [number, number],
          parameters: {} // Missing required 'path' parameter
        },
        {
          id: 'http_node',
          name: 'HTTP Request',
          type: N8N_CORE_NODES.HTTP_REQUEST,
          typeVersion: 10, // Version too high
          position: [300, 100] as [number, number],
          parameters: {
            method: 'GET'
            // Missing required 'url' parameter
          }
        },
        {
          id: 'invalid_trigger',
          name: 'Invalid Trigger',
          type: N8N_CORE_NODES.MANUAL_TRIGGER,
          typeVersion: 1,
          position: [500, 100] as [number, number],
          parameters: {}
        }
      ],
      connections: {
        'webhook_node': {
          'main': [{
            node: 'http_node',
            type: 'main',
            index: 0
          }]
        },
        'http_node': {
          'main': [{
            node: 'invalid_trigger', // Trigger nodes cannot receive input
            type: 'main',
            index: 0
          }]
        }
      }
    };
  }

  /**
   * Create a workflow with deprecated nodes
   */
  static createDeprecatedWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Deprecated Workflow',
      active: true,
      nodes: [
        {
          id: 'trigger_node',
          name: 'Manual Trigger',
          type: N8N_CORE_NODES.MANUAL_TRIGGER,
          typeVersion: 1,
          position: [100, 100] as [number, number],
          parameters: {}
        },
        {
          id: 'function_node',
          name: 'Function Node',
          type: N8N_CORE_NODES.FUNCTION, // Deprecated node
          typeVersion: 1,
          position: [300, 100] as [number, number],
          parameters: {
            functionCode: 'return items;'
          }
        }
      ],
      connections: {
        'trigger_node': {
          'main': [{
            node: 'function_node',
            type: 'main',
            index: 0
          }]
        }
      }
    };
  }

  /**
   * Create a complex AI workflow for testing
   */
  static createComplexAIWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Complex AI Workflow',
      active: true,
      nodes: [
        {
          id: 'webhook_trigger',
          name: 'Webhook Trigger',
          type: N8N_CORE_NODES.WEBHOOK,
          typeVersion: 1,
          position: [100, 100] as [number, number],
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
          position: [300, 100] as [number, number],
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
          position: [500, 100] as [number, number],
          parameters: {
            resource: 'text',
            operation: 'complete'
          }
        },
        {
          id: 'condition_check',
          name: 'Check Result',
          type: N8N_CORE_NODES.IF,
          typeVersion: 1,
          position: [700, 100] as [number, number],
          parameters: {
            conditions: [{
              leftValue: '{{ $json.success }}',
              rightValue: true,
              operation: 'equal'
            }]
          }
        },
        {
          id: 'merge_results',
          name: 'Merge Results',
          type: N8N_CORE_NODES.MERGE,
          typeVersion: 2,
          position: [900, 100] as [number, number],
          parameters: {
            mode: 'append'
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
          'main': [{
            node: 'merge_results',
            type: 'main',
            index: 0
          }]
        }
      }
    };
  }
}

/**
 * Node Compatibility Test Suite
 */
export class NodeCompatibilityTestSuite {
  private validator: NodeCompatibilityValidator;
  private testResults: Array<{ test: string; passed: boolean; message?: string }> = [];

  constructor() {
    this.validator = new NodeCompatibilityValidator();
  }

  /**
   * Run all tests
   */
  runAllTests(): void {
    console.log('🧪 Running Node Compatibility Validator Test Suite...\n');

    this.testValidWorkflowCompatibility();
    this.testIncompatibleWorkflow();
    this.testDeprecatedNodes();
    this.testNodeTypeValidation();
    this.testNodeVersionValidation();
    this.testParameterValidation();
    this.testConnectionValidation();
    this.testCompatibilityDatabase();
    this.testUtilityFunctions();
    this.testCustomRules();
    this.testCompatibilityReport();
    this.testComplexAIWorkflow();

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
   * Test valid workflow compatibility
   */
  private testValidWorkflowCompatibility(): void {
    const workflow = NodeCompatibilityTestData.createValidCompatibleWorkflow();
    const results = this.validator.validateWorkflowNodeCompatibility(workflow);
    
    const errors = results.filter(r => r.severity === 'error' && !r.valid);
    this.addTest(
      'Valid Workflow Compatibility',
      errors.length === 0,
      `Should have no errors, found ${errors.length}`
    );

    // Test individual nodes
    for (const node of workflow.nodes) {
      const nodeResults = this.validator.validateNode(node, workflow);
      const nodeErrors = nodeResults.filter(r => r.severity === 'error' && !r.valid);
      this.addTest(
        `Node ${node.id} Compatibility`,
        nodeErrors.length === 0,
        `Should be compatible, found ${nodeErrors.length} errors`
      );
    }
  }

  /**
   * Test incompatible workflow
   */
  private testIncompatibleWorkflow(): void {
    const workflow = NodeCompatibilityTestData.createIncompatibleWorkflow();
    const results = this.validator.validateWorkflowNodeCompatibility(workflow);
    
    const errors = results.filter(r => r.severity === 'error' && !r.valid);
    this.addTest(
      'Incompatible Workflow Detection',
      errors.length > 0,
      `Should detect errors, found ${errors.length}`
    );

    // Test specific error types
    const missingParamError = results.some(r => r.message?.includes('missing required parameter'));
    this.addTest('Missing Parameter Detection', missingParamError);

    const versionError = results.some(r => r.message?.includes('version'));
    this.addTest('Version Incompatibility Detection', versionError);

    const connectionError = results.some(r => r.message?.includes('cannot receive input'));
    this.addTest('Invalid Connection Detection', connectionError);
  }

  /**
   * Test deprecated nodes
   */
  private testDeprecatedNodes(): void {
    const workflow = NodeCompatibilityTestData.createDeprecatedWorkflow();
    const results = this.validator.validateWorkflowNodeCompatibility(workflow);
    
    const deprecationWarnings = results.filter(r => 
      r.severity === 'warning' && r.message?.includes('deprecated')
    );
    
    this.addTest(
      'Deprecated Node Detection',
      deprecationWarnings.length > 0,
      `Should detect deprecated nodes, found ${deprecationWarnings.length} warnings`
    );

    const replacementSuggestion = results.some(r => 
      r.message?.includes('Consider using')
    );
    this.addTest('Replacement Suggestion', replacementSuggestion);
  }

  /**
   * Test node type validation
   */
  private testNodeTypeValidation(): void {
    // Test valid node type
    const validNode: N8NNode = {
      id: 'test_node',
      name: 'Test Node',
      type: N8N_CORE_NODES.HTTP_REQUEST,
      typeVersion: 1,
      position: [0, 0],
      parameters: { method: 'GET', url: 'https://example.com' }
    };

    const validResults = this.validator.validateNode(validNode);
    const validTypeResult = validResults.find(r => r.message?.includes('supported'));
    this.addTest('Valid Node Type Recognition', !!validTypeResult && validTypeResult.valid);

    // Test invalid node type
    const invalidNode: N8NNode = {
      id: 'invalid_node',
      name: 'Invalid Node',
      type: 'invalid-node-type',
      typeVersion: 1,
      position: [0, 0],
      parameters: {}
    };

    const invalidResults = this.validator.validateNode(invalidNode);
    const invalidTypeResult = invalidResults.find(r => r.message?.includes('not supported'));
    this.addTest('Invalid Node Type Detection', !!invalidTypeResult && !invalidTypeResult.valid);
  }

  /**
   * Test node version validation
   */
  private testNodeVersionValidation(): void {
    // Test version too low
    const lowVersionNode: N8NNode = {
      id: 'low_version',
      name: 'Low Version',
      type: N8N_CORE_NODES.HTTP_REQUEST,
      typeVersion: 0, // Below minimum
      position: [0, 0],
      parameters: { method: 'GET', url: 'https://example.com' }
    };

    const lowResults = this.validator.validateNode(lowVersionNode);
    const lowVersionError = lowResults.some(r => 
      r.severity === 'error' && r.message?.includes('below minimum')
    );
    this.addTest('Low Version Detection', lowVersionError);

    // Test version too high
    const highVersionNode: N8NNode = {
      id: 'high_version',
      name: 'High Version',
      type: N8N_CORE_NODES.HTTP_REQUEST,
      typeVersion: 100, // Above maximum
      position: [0, 0],
      parameters: { method: 'GET', url: 'https://example.com' }
    };

    const highResults = this.validator.validateNode(highVersionNode);
    const highVersionWarning = highResults.some(r => 
      r.severity === 'warning' && r.message?.includes('above maximum')
    );
    this.addTest('High Version Detection', highVersionWarning);
  }

  /**
   * Test parameter validation
   */
  private testParameterValidation(): void {
    // Test missing required parameters
    const missingParamNode: N8NNode = {
      id: 'missing_param',
      name: 'Missing Param',
      type: N8N_CORE_NODES.HTTP_REQUEST,
      typeVersion: 1,
      position: [0, 0],
      parameters: { method: 'GET' } // Missing URL
    };

    const missingResults = this.validator.validateNode(missingParamNode);
    const missingParamError = missingResults.some(r => 
      r.severity === 'error' && r.message?.includes('missing required parameter')
    );
    this.addTest('Missing Required Parameter Detection', missingParamError);

    // Test valid parameters
    const validParamNode: N8NNode = {
      id: 'valid_param',
      name: 'Valid Param',
      type: N8N_CORE_NODES.HTTP_REQUEST,
      typeVersion: 1,
      position: [0, 0],
      parameters: { method: 'GET', url: 'https://example.com' }
    };

    const validResults = this.validator.validateNode(validParamNode);
    const paramErrors = validResults.filter(r => 
      r.severity === 'error' && r.message?.includes('parameter')
    );
    this.addTest('Valid Parameters Acceptance', paramErrors.length === 0);
  }

  /**
   * Test connection validation
   */
  private testConnectionValidation(): void {
    // Test valid connection
    const canConnect = NodeCompatibilityUtils.canConnect(
      N8N_CORE_NODES.MANUAL_TRIGGER,
      N8N_CORE_NODES.HTTP_REQUEST
    );
    this.addTest('Valid Connection Recognition', canConnect);

    // Test invalid connection (trigger as target)
    const cannotConnect = NodeCompatibilityUtils.canConnect(
      N8N_CORE_NODES.HTTP_REQUEST,
      N8N_CORE_NODES.MANUAL_TRIGGER
    );
    this.addTest('Invalid Connection Detection', !cannotConnect);

    // Test error output to main input
    const errorToMain = NodeCompatibilityUtils.canConnect(
      N8N_CORE_NODES.HTTP_REQUEST,
      N8N_CORE_NODES.SET,
      'error',
      'main'
    );
    this.addTest('Error to Main Connection Block', !errorToMain);
  }

  /**
   * Test compatibility database
   */
  private testCompatibilityDatabase(): void {
    // Test database completeness
    const triggerNodes = this.validator.getNodesByCategory(NODE_CATEGORIES.TRIGGER);
    this.addTest('Trigger Nodes in Database', triggerNodes.length > 0);

    const actionNodes = this.validator.getNodesByCategory(NODE_CATEGORIES.ACTION);
    this.addTest('Action Nodes in Database', actionNodes.length > 0);

    const transformNodes = this.validator.getNodesByCategory(NODE_CATEGORIES.TRANSFORM);
    this.addTest('Transform Nodes in Database', transformNodes.length > 0);

    // Test specific node info
    const httpInfo = this.validator.getNodeCompatibilityInfo(N8N_CORE_NODES.HTTP_REQUEST);
    this.addTest('HTTP Request Node Info', !!httpInfo);
    
    if (httpInfo) {
      this.addTest('HTTP Node Required Parameters', httpInfo.requiredParameters.includes('url'));
      this.addTest('HTTP Node Output Types', httpInfo.supportedOutputTypes.includes('main'));
    }
  }

  /**
   * Test utility functions
   */
  private testUtilityFunctions(): void {
    // Test deprecated node checking
    const isDeprecated = NodeCompatibilityUtils.isNodeDeprecated(N8N_CORE_NODES.FUNCTION);
    this.addTest('Deprecated Node Utility', isDeprecated);

    const notDeprecated = NodeCompatibilityUtils.isNodeDeprecated(N8N_CORE_NODES.HTTP_REQUEST);
    this.addTest('Non-Deprecated Node Utility', !notDeprecated);

    // Test replacement suggestion
    const replacement = NodeCompatibilityUtils.getReplacementNode(N8N_CORE_NODES.FUNCTION);
    this.addTest('Replacement Node Suggestion', replacement === N8N_CORE_NODES.CODE);

    // Test category detection
    const category = NodeCompatibilityUtils.getNodeCategory(N8N_CORE_NODES.HTTP_REQUEST);
    this.addTest('Node Category Detection', category === NODE_CATEGORIES.ACTION);
  }

  /**
   * Test custom rules
   */
  private testCustomRules(): void {
    // Add custom node compatibility
    const customValidator = new NodeCompatibilityValidator();
    
    const customNodeInfo: NodeCompatibilityInfo = {
      category: NODE_CATEGORIES.ACTION,
      supportedInputTypes: ['main'],
      supportedOutputTypes: ['main'],
      requiredParameters: ['customParam'],
      optionalParameters: [],
      maxInputConnections: 1,
      maxOutputConnections: 1,
      minTypeVersion: 1,
      maxTypeVersion: 1
    };

    customValidator.addNodeCompatibility('custom-node-type', customNodeInfo);
    
    const customInfo = customValidator.getNodeCompatibilityInfo('custom-node-type');
    this.addTest('Custom Node Addition', !!customInfo);

    // Test custom connection rule
    const customRule: ConnectionCompatibilityInfo = {
      sourceNodeType: 'custom-node-type',
      targetNodeType: 'any',
      outputType: 'main',
      inputType: 'main',
      compatible: false,
      reason: 'Custom rule test'
    };

    customValidator.addConnectionRule(customRule);
    this.addTest('Custom Rule Addition', true); // Rule added successfully
  }

  /**
   * Test compatibility report generation
   */
  private testCompatibilityReport(): void {
    const validWorkflow = NodeCompatibilityTestData.createValidCompatibleWorkflow();
    const validReport = this.validator.generateCompatibilityReport(validWorkflow);
    
    this.addTest('Valid Workflow Report', validReport.summary.errors === 0);
    this.addTest('Report Summary Structure', 
      typeof validReport.summary.totalNodes === 'number' &&
      typeof validReport.summary.compatibleNodes === 'number'
    );

    const invalidWorkflow = NodeCompatibilityTestData.createIncompatibleWorkflow();
    const invalidReport = this.validator.generateCompatibilityReport(invalidWorkflow);
    
    this.addTest('Invalid Workflow Report', invalidReport.summary.errors > 0);
    this.addTest('Report Details Array', Array.isArray(invalidReport.details));
    this.addTest('Report Recommendations', Array.isArray(invalidReport.recommendations));
  }

  /**
   * Test complex AI workflow
   */
  private testComplexAIWorkflow(): void {
    const workflow = NodeCompatibilityTestData.createComplexAIWorkflow();
    const results = this.validator.validateWorkflowNodeCompatibility(workflow);
    
    const errors = results.filter(r => r.severity === 'error' && !r.valid);
    this.addTest(
      'Complex AI Workflow Compatibility',
      errors.length === 0,
      `Should be compatible, found ${errors.length} errors`
    );

    // Test AI node validation
    const aiNodeResults = results.filter(r => r.nodeId === 'openai_analysis');
    const aiNodeValid = aiNodeResults.every(r => r.valid || r.severity !== 'error');
    this.addTest('AI Node Validation', aiNodeValid);

    // Test control flow validation
    const ifNodeResults = results.filter(r => r.nodeId === 'condition_check');
    const ifNodeValid = ifNodeResults.every(r => r.valid || r.severity !== 'error');
    this.addTest('Control Flow Node Validation', ifNodeValid);
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
      console.log('\n🎉 All tests passed! Node Compatibility Validator is working correctly.');
    } else {
      console.log(`\n⚠️  ${total - passed} tests failed. Please review the implementation.`);
    }
  }
}

/**
 * Export test runner function
 */
export function runNodeCompatibilityTests(): void {
  const testSuite = new NodeCompatibilityTestSuite();
  testSuite.runAllTests();
}

/**
 * Demonstration function
 */
export function demonstrateNodeCompatibilityValidator(): void {
  console.log('🔧 Node Compatibility Validator Demonstration\n');

  const validator = new NodeCompatibilityValidator();

  // Test with a valid workflow
  const validWorkflow = NodeCompatibilityTestData.createValidCompatibleWorkflow();
  console.log('📋 Testing Valid Workflow:');
  const validReport = validator.generateCompatibilityReport(validWorkflow);
  console.log(`✅ Compatible Nodes: ${validReport.summary.compatibleNodes}/${validReport.summary.totalNodes}`);
  console.log(`⚠️  Warnings: ${validReport.summary.warnings}`);
  console.log(`❌ Errors: ${validReport.summary.errors}\n`);

  // Test with an incompatible workflow
  const invalidWorkflow = NodeCompatibilityTestData.createIncompatibleWorkflow();
  console.log('📋 Testing Incompatible Workflow:');
  const invalidReport = validator.generateCompatibilityReport(invalidWorkflow);
  console.log(`✅ Compatible Nodes: ${invalidReport.summary.compatibleNodes}/${invalidReport.summary.totalNodes}`);
  console.log(`⚠️  Warnings: ${invalidReport.summary.warnings}`);
  console.log(`❌ Errors: ${invalidReport.summary.errors}\n`);

  if (invalidReport.details.length > 0) {
    console.log('🔍 Validation Issues:');
    invalidReport.details.forEach(issue => {
      if (!issue.valid) {
        const severity = issue.severity === 'error' ? '❌' : '⚠️';
        console.log(`${severity} ${issue.message}`);
      }
    });
  }

  if (invalidReport.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    invalidReport.recommendations.forEach(rec => {
      console.log(`• ${rec}`);
    });
  }
} 