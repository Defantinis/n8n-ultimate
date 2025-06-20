/**
 * Test Suite for Connection Validator
 */

import {
  ConnectionValidator,
  ConnectionValidatorUtils,
  DataFlowAnalysis,
  ConnectionStatistics,
  ConnectionValidationRule
} from './connection-validator';

import {
  N8NWorkflowSchema,
  N8NNode,
  N8N_CORE_NODES
} from './n8n-workflow-schema';

/**
 * Test data for connection validation
 */
export class ConnectionValidatorTestData {
  /**
   * Create a valid workflow with proper connections
   */
  static createValidConnectedWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Valid Connected Workflow',
      active: true,
      nodes: [
        {
          id: 'trigger',
          name: 'Manual Trigger',
          type: N8N_CORE_NODES.MANUAL_TRIGGER,
          typeVersion: 1,
          position: [100, 100] as [number, number],
          parameters: {}
        },
        {
          id: 'http1',
          name: 'HTTP Request 1',
          type: N8N_CORE_NODES.HTTP_REQUEST,
          typeVersion: 3,
          position: [300, 100] as [number, number],
          parameters: {
            method: 'GET',
            url: 'https://api.example.com/data'
          }
        },
        {
          id: 'condition',
          name: 'IF Condition',
          type: N8N_CORE_NODES.IF,
          typeVersion: 1,
          position: [500, 100] as [number, number],
          parameters: {
            conditions: [{
              leftValue: '{{ $json.success }}',
              rightValue: true,
              operation: 'equal'
            }]
          }
        },
        {
          id: 'http2',
          name: 'HTTP Request 2',
          type: N8N_CORE_NODES.HTTP_REQUEST,
          typeVersion: 3,
          position: [700, 50] as [number, number],
          parameters: {
            method: 'POST',
            url: 'https://api.example.com/success'
          }
        },
        {
          id: 'error_handler',
          name: 'Error Handler',
          type: N8N_CORE_NODES.SET,
          typeVersion: 2,
          position: [700, 150] as [number, number],
          parameters: {
            values: [
              { name: 'error', value: 'true' }
            ]
          }
        }
      ],
      connections: {
        'trigger': {
          'main': [{
            node: 'http1',
            type: 'main',
            index: 0
          }]
        },
        'http1': {
          'main': [{
            node: 'condition',
            type: 'main',
            index: 0
          }]
        },
        'condition': {
          'main': [
            {
              node: 'http2',
              type: 'main',
              index: 0
            },
            {
              node: 'error_handler',
              type: 'main',
              index: 0
            }
          ]
        }
      }
    };
  }

  /**
   * Create a workflow with connection errors
   */
  static createInvalidConnectionWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Invalid Connection Workflow',
      active: true,
      nodes: [
        {
          id: 'trigger',
          name: 'Manual Trigger',
          type: N8N_CORE_NODES.MANUAL_TRIGGER,
          typeVersion: 1,
          position: [100, 100] as [number, number],
          parameters: {}
        },
        {
          id: 'http1',
          name: 'HTTP Request 1',
          type: N8N_CORE_NODES.HTTP_REQUEST,
          typeVersion: 3,
          position: [300, 100] as [number, number],
          parameters: {
            method: 'GET',
            url: 'https://api.example.com/data'
          }
        }
      ],
      connections: {
        'trigger': {
          'main': [{
            node: 'nonexistent_node', // Non-existent target
            type: 'main',
            index: 0
          }]
        },
        'nonexistent_source': { // Non-existent source
          'main': [{
            node: 'http1',
            type: 'main',
            index: 0
          }]
        },
        'http1': {
          'main': [{
            node: 'trigger', // Invalid: connecting back to trigger
            type: 'main',
            index: -1 // Invalid index
          }]
        }
      }
    };
  }

  /**
   * Create a workflow with circular dependencies
   */
  static createCircularWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Circular Workflow',
      active: true,
      nodes: [
        {
          id: 'node1',
          name: 'Node 1',
          type: N8N_CORE_NODES.SET,
          typeVersion: 2,
          position: [100, 100] as [number, number],
          parameters: { values: [] }
        },
        {
          id: 'node2',
          name: 'Node 2',
          type: N8N_CORE_NODES.SET,
          typeVersion: 2,
          position: [300, 100] as [number, number],
          parameters: { values: [] }
        },
        {
          id: 'node3',
          name: 'Node 3',
          type: N8N_CORE_NODES.SET,
          typeVersion: 2,
          position: [500, 100] as [number, number],
          parameters: { values: [] }
        }
      ],
      connections: {
        'node1': {
          'main': [{
            node: 'node2',
            type: 'main',
            index: 0
          }]
        },
        'node2': {
          'main': [{
            node: 'node3',
            type: 'main',
            index: 0
          }]
        },
        'node3': {
          'main': [{
            node: 'node1', // Creates a cycle
            type: 'main',
            index: 0
          }]
        }
      }
    };
  }

  /**
   * Create a workflow with isolated nodes
   */
  static createIsolatedNodesWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Isolated Nodes Workflow',
      active: true,
      nodes: [
        {
          id: 'trigger',
          name: 'Manual Trigger',
          type: N8N_CORE_NODES.MANUAL_TRIGGER,
          typeVersion: 1,
          position: [100, 100] as [number, number],
          parameters: {}
        },
        {
          id: 'connected_node',
          name: 'Connected Node',
          type: N8N_CORE_NODES.SET,
          typeVersion: 2,
          position: [300, 100] as [number, number],
          parameters: { values: [] }
        },
        {
          id: 'isolated_node1',
          name: 'Isolated Node 1',
          type: N8N_CORE_NODES.HTTP_REQUEST,
          typeVersion: 3,
          position: [100, 300] as [number, number],
          parameters: {
            method: 'GET',
            url: 'https://api.example.com'
          }
        },
        {
          id: 'isolated_node2',
          name: 'Isolated Node 2',
          type: N8N_CORE_NODES.SET,
          typeVersion: 2,
          position: [300, 300] as [number, number],
          parameters: { values: [] }
        }
      ],
      connections: {
        'trigger': {
          'main': [{
            node: 'connected_node',
            type: 'main',
            index: 0
          }]
        }
        // isolated_node1 and isolated_node2 have no connections
      }
    };
  }

  /**
   * Create a complex workflow for comprehensive testing
   */
  static createComplexWorkflow(): N8NWorkflowSchema {
    return {
      name: 'Complex Workflow',
      active: true,
      nodes: [
        {
          id: 'webhook',
          name: 'Webhook Trigger',
          type: N8N_CORE_NODES.WEBHOOK,
          typeVersion: 1,
          position: [100, 100] as [number, number],
          parameters: {
            path: 'complex-webhook',
            httpMethod: 'POST'
          }
        },
        {
          id: 'validate',
          name: 'Validate Input',
          type: N8N_CORE_NODES.CODE,
          typeVersion: 1,
          position: [300, 100] as [number, number],
          parameters: {
            code: 'if (!$input.first().json.data) throw new Error("Missing data");'
          }
        },
        {
          id: 'parallel1',
          name: 'Parallel Process 1',
          type: N8N_CORE_NODES.HTTP_REQUEST,
          typeVersion: 3,
          position: [500, 50] as [number, number],
          parameters: {
            method: 'GET',
            url: 'https://api1.example.com'
          }
        },
        {
          id: 'parallel2',
          name: 'Parallel Process 2',
          type: N8N_CORE_NODES.HTTP_REQUEST,
          typeVersion: 3,
          position: [500, 150] as [number, number],
          parameters: {
            method: 'GET',
            url: 'https://api2.example.com'
          }
        },
        {
          id: 'merge',
          name: 'Merge Results',
          type: N8N_CORE_NODES.MERGE,
          typeVersion: 2,
          position: [700, 100] as [number, number],
          parameters: {
            mode: 'append'
          }
        },
        {
          id: 'final_process',
          name: 'Final Processing',
          type: N8N_CORE_NODES.SET,
          typeVersion: 2,
          position: [900, 100] as [number, number],
          parameters: {
            values: [
              { name: 'processed', value: 'true' }
            ]
          }
        }
      ],
      connections: {
        'webhook': {
          'main': [{
            node: 'validate',
            type: 'main',
            index: 0
          }]
        },
        'validate': {
          'main': [
            {
              node: 'parallel1',
              type: 'main',
              index: 0
            },
            {
              node: 'parallel2',
              type: 'main',
              index: 0
            }
          ]
        },
        'parallel1': {
          'main': [{
            node: 'merge',
            type: 'main',
            index: 0
          }]
        },
        'parallel2': {
          'main': [{
            node: 'merge',
            type: 'main',
            index: 1
          }]
        },
        'merge': {
          'main': [{
            node: 'final_process',
            type: 'main',
            index: 0
          }]
        }
      }
    };
  }
}

/**
 * Connection Validator Test Suite
 */
export class ConnectionValidatorTestSuite {
  private validator: ConnectionValidator;
  private testResults: Array<{ test: string; passed: boolean; message?: string }> = [];

  constructor() {
    this.validator = new ConnectionValidator();
  }

  /**
   * Run all tests
   */
  runAllTests(): void {
    console.log('🧪 Running Connection Validator Test Suite...\n');

    this.testValidWorkflowConnections();
    this.testInvalidConnections();
    this.testCircularDependencies();
    this.testDataFlowAnalysis();
    this.testConnectionStatistics();
    this.testUtilityFunctions();
    this.testCustomValidationRules();
    this.testComplexWorkflow();
    this.testEdgeCases();

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
   * Test valid workflow connections
   */
  private testValidWorkflowConnections(): void {
    const workflow = ConnectionValidatorTestData.createValidConnectedWorkflow();
    const results = this.validator.validateWorkflowConnections(workflow);
    
    const errors = results.filter(r => r.severity === 'error' && !r.valid);
    this.addTest(
      'Valid Workflow Connections',
      errors.length === 0,
      `Should have no errors, found ${errors.length}`
    );

    // Test connection integrity
    const integrityResults = results.filter(r => r.rule === 'connection_integrity');
    const integrityErrors = integrityResults.filter(r => !r.valid);
    this.addTest('Connection Integrity Validation', integrityErrors.length === 0);

    // Test data flow continuity
    const flowResults = results.filter(r => r.rule === 'data_flow_continuity');
    const flowErrors = flowResults.filter(r => r.severity === 'error' && !r.valid);
    this.addTest('Data Flow Continuity', flowErrors.length === 0);
  }

  /**
   * Test invalid connections
   */
  private testInvalidConnections(): void {
    const workflow = ConnectionValidatorTestData.createInvalidConnectionWorkflow();
    const results = this.validator.validateWorkflowConnections(workflow);
    
    const errors = results.filter(r => r.severity === 'error' && !r.valid);
    this.addTest(
      'Invalid Connection Detection',
      errors.length > 0,
      `Should detect errors, found ${errors.length}`
    );

    // Test non-existent node detection
    const nonExistentNodeErrors = results.filter(r => 
      r.message?.includes('non-existent')
    );
    this.addTest('Non-existent Node Detection', nonExistentNodeErrors.length > 0);

    // Test invalid index detection
    const invalidIndexErrors = results.filter(r => 
      r.message?.includes('Invalid connection index')
    );
    this.addTest('Invalid Index Detection', invalidIndexErrors.length > 0);
  }

  /**
   * Test circular dependency detection
   */
  private testCircularDependencies(): void {
    const workflow = ConnectionValidatorTestData.createCircularWorkflow();
    const results = this.validator.validateWorkflowConnections(workflow);
    
    const circularErrors = results.filter(r => 
      r.rule === 'circular_dependencies' && !r.valid
    );
    this.addTest(
      'Circular Dependency Detection',
      circularErrors.length > 0,
      `Should detect cycles, found ${circularErrors.length}`
    );

    // Test data flow analysis cycle detection
    const analysis = this.validator.analyzeDataFlow(workflow);
    this.addTest('Data Flow Cycle Detection', analysis.cycles.length > 0);

    // Test utility function
    const hasCycles = ConnectionValidatorUtils.hasCycles(workflow);
    this.addTest('Utility Cycle Detection', hasCycles);
  }

  /**
   * Test data flow analysis
   */
  private testDataFlowAnalysis(): void {
    const validWorkflow = ConnectionValidatorTestData.createValidConnectedWorkflow();
    const analysis = this.validator.analyzeDataFlow(validWorkflow);
    
    // Test entry points detection
    this.addTest('Entry Points Detection', analysis.entryPoints.length > 0);
    this.addTest('Entry Point Identification', analysis.entryPoints.includes('trigger'));

    // Test exit points detection
    this.addTest('Exit Points Detection', analysis.exitPoints.length > 0);

    // Test isolated nodes detection
    const isolatedWorkflow = ConnectionValidatorTestData.createIsolatedNodesWorkflow();
    const isolatedAnalysis = this.validator.analyzeDataFlow(isolatedWorkflow);
    this.addTest('Isolated Nodes Detection', isolatedAnalysis.isolatedNodes.length > 0);

    // Test unreachable nodes
    this.addTest('Unreachable Nodes Analysis', isolatedAnalysis.unreachableNodes.length > 0);

    // Test maximum depth calculation
    this.addTest('Maximum Depth Calculation', analysis.maxDepth >= 0);

    // Test connection paths generation
    this.addTest('Connection Paths Generation', analysis.connectionPaths.length > 0);
  }

  /**
   * Test connection statistics
   */
  private testConnectionStatistics(): void {
    const workflow = ConnectionValidatorTestData.createComplexWorkflow();
    const stats = this.validator.generateConnectionStatistics(workflow);
    
    // Test total connections count
    this.addTest('Total Connections Count', stats.totalConnections > 0);

    // Test connections by type
    this.addTest('Connections by Type', Object.keys(stats.connectionsByType).length > 0);

    // Test node connection counts
    this.addTest('Node Connection Counts', Object.keys(stats.nodeConnectionCounts).length > 0);

    // Test statistics calculations
    this.addTest('Average Connections Calculation', stats.averageConnectionsPerNode >= 0);
    this.addTest('Max Connections Calculation', stats.maxConnectionsPerNode >= 0);
    this.addTest('Min Connections Calculation', stats.minConnectionsPerNode >= 0);

    // Verify specific statistics
    const webhookStats = stats.nodeConnectionCounts['webhook'];
    if (webhookStats) {
      this.addTest('Webhook Node Stats', webhookStats.inputs === 0 && webhookStats.outputs > 0);
    }
  }

  /**
   * Test utility functions
   */
  private testUtilityFunctions(): void {
    const workflow = ConnectionValidatorTestData.createValidConnectedWorkflow();
    
    // Test nodes connected check
    const areConnected = ConnectionValidatorUtils.areNodesConnected(workflow, 'trigger', 'http1');
    this.addTest('Nodes Connected Check', areConnected);

    const notConnected = ConnectionValidatorUtils.areNodesConnected(workflow, 'http2', 'trigger');
    this.addTest('Nodes Not Connected Check', !notConnected);

    // Test node connections retrieval
    const triggerConnections = ConnectionValidatorUtils.getNodeConnections(workflow, 'trigger');
    this.addTest('Node Connections Retrieval', triggerConnections.outputs.length > 0);

    const http1Connections = ConnectionValidatorUtils.getNodeConnections(workflow, 'http1');
    this.addTest('Node Input/Output Connections', 
      http1Connections.inputs.length > 0 && http1Connections.outputs.length > 0
    );

    // Test shortest path
    const path = ConnectionValidatorUtils.getShortestPath(workflow, 'trigger', 'condition');
    this.addTest('Shortest Path Calculation', path !== null && path.length > 0);

    const noPath = ConnectionValidatorUtils.getShortestPath(workflow, 'http2', 'trigger');
    this.addTest('No Path Detection', noPath === null);
  }

  /**
   * Test custom validation rules
   */
  private testCustomValidationRules(): void {
    const customValidator = new ConnectionValidator();
    
    // Add custom rule
    const customRule: ConnectionValidationRule = {
      name: 'test_custom_rule',
      description: 'Test custom validation rule',
      validate: (workflow) => [{
        valid: true,
        message: 'Custom rule passed',
        severity: 'info' as const,
        rule: 'test_custom_rule'
      }]
    };

    customValidator.addValidationRule(customRule);
    
    const rules = customValidator.getValidationRules();
    const hasCustomRule = rules.some(r => r.name === 'test_custom_rule');
    this.addTest('Custom Rule Addition', hasCustomRule);

    // Test custom rule execution
    const workflow = ConnectionValidatorTestData.createValidConnectedWorkflow();
    const results = customValidator.validateWorkflowConnections(workflow);
    const customRuleResult = results.find(r => r.rule === 'test_custom_rule');
    this.addTest('Custom Rule Execution', !!customRuleResult);

    // Test rule removal
    const removed = customValidator.removeValidationRule('test_custom_rule');
    this.addTest('Custom Rule Removal', removed);

    const rulesAfterRemoval = customValidator.getValidationRules();
    const stillHasCustomRule = rulesAfterRemoval.some(r => r.name === 'test_custom_rule');
    this.addTest('Custom Rule Removal Verification', !stillHasCustomRule);
  }

  /**
   * Test complex workflow
   */
  private testComplexWorkflow(): void {
    const workflow = ConnectionValidatorTestData.createComplexWorkflow();
    const results = this.validator.validateWorkflowConnections(workflow);
    
    const errors = results.filter(r => r.severity === 'error' && !r.valid);
    this.addTest(
      'Complex Workflow Validation',
      errors.length === 0,
      `Complex workflow should be valid, found ${errors.length} errors`
    );

    // Test parallel processing detection
    const analysis = this.validator.analyzeDataFlow(workflow);
    const parallelPaths = analysis.connectionPaths.filter(path => 
      path.path.includes('parallel1') || path.path.includes('parallel2')
    );
    this.addTest('Parallel Processing Detection', parallelPaths.length > 0);

    // Test merge node analysis
    const mergeConnections = ConnectionValidatorUtils.getNodeConnections(workflow, 'merge');
    this.addTest('Merge Node Input Analysis', mergeConnections.inputs.length >= 2);
  }

  /**
   * Test edge cases
   */
  private testEdgeCases(): void {
    // Empty workflow
    const emptyWorkflow: N8NWorkflowSchema = {
      name: 'Empty Workflow',
      active: true,
      nodes: [],
      connections: {}
    };

    const emptyResults = this.validator.validateWorkflowConnections(emptyWorkflow);
    this.addTest('Empty Workflow Validation', emptyResults.length === 0);

    const emptyAnalysis = this.validator.analyzeDataFlow(emptyWorkflow);
    this.addTest('Empty Workflow Analysis', emptyAnalysis.entryPoints.length === 0);

    // Single node workflow
    const singleNodeWorkflow: N8NWorkflowSchema = {
      name: 'Single Node Workflow',
      active: true,
      nodes: [{
        id: 'single',
        name: 'Single Node',
        type: N8N_CORE_NODES.MANUAL_TRIGGER,
        typeVersion: 1,
        position: [100, 100] as [number, number],
        parameters: {}
      }],
      connections: {}
    };

    const singleResults = this.validator.validateWorkflowConnections(singleNodeWorkflow);
    const singleErrors = singleResults.filter(r => r.severity === 'error' && !r.valid);
    this.addTest('Single Node Workflow', singleErrors.length === 0);

    const singleAnalysis = this.validator.analyzeDataFlow(singleNodeWorkflow);
    this.addTest('Single Node Analysis', 
      singleAnalysis.entryPoints.length === 1 && 
      singleAnalysis.exitPoints.length === 1
    );
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
      console.log('\n🎉 All tests passed! Connection Validator is working correctly.');
    } else {
      console.log(`\n⚠️  ${total - passed} tests failed. Please review the implementation.`);
    }
  }
}

/**
 * Export test runner function
 */
export function runConnectionValidatorTests(): void {
  const testSuite = new ConnectionValidatorTestSuite();
  testSuite.runAllTests();
}

/**
 * Demonstration function
 */
export function demonstrateConnectionValidator(): void {
  console.log('🔗 Connection Validator Demonstration\n');

  const validator = new ConnectionValidator();

  // Test with a valid workflow
  const validWorkflow = ConnectionValidatorTestData.createValidConnectedWorkflow();
  console.log('📋 Testing Valid Workflow:');
  const validResults = validator.validateWorkflowConnections(validWorkflow);
  const validErrors = validResults.filter(r => r.severity === 'error' && !r.valid);
  console.log(`✅ Connection Errors: ${validErrors.length}`);
  console.log(`⚠️  Warnings: ${validResults.filter(r => r.severity === 'warning').length}\n`);

  // Test with an invalid workflow
  const invalidWorkflow = ConnectionValidatorTestData.createInvalidConnectionWorkflow();
  console.log('📋 Testing Invalid Workflow:');
  const invalidResults = validator.validateWorkflowConnections(invalidWorkflow);
  const invalidErrors = invalidResults.filter(r => r.severity === 'error' && !r.valid);
  console.log(`❌ Connection Errors: ${invalidErrors.length}`);
  console.log(`⚠️  Warnings: ${invalidResults.filter(r => r.severity === 'warning').length}\n`);

  // Data flow analysis
  const analysis = validator.analyzeDataFlow(validWorkflow);
  console.log('🔍 Data Flow Analysis:');
  console.log(`📍 Entry Points: ${analysis.entryPoints.join(', ')}`);
  console.log(`🏁 Exit Points: ${analysis.exitPoints.join(', ')}`);
  console.log(`🔗 Max Depth: ${analysis.maxDepth}`);
  console.log(`🔄 Cycles: ${analysis.cycles.length}\n`);

  // Connection statistics
  const stats = validator.generateConnectionStatistics(validWorkflow);
  console.log('📊 Connection Statistics:');
  console.log(`🔗 Total Connections: ${stats.totalConnections}`);
  console.log(`📈 Average per Node: ${stats.averageConnectionsPerNode.toFixed(2)}`);
  console.log(`📊 Max per Node: ${stats.maxConnectionsPerNode}`);
  console.log(`📉 Min per Node: ${stats.minConnectionsPerNode}`);
} 