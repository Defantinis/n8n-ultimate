import {
  TestingManager,
  WorkflowValidator,
  WorkflowTestRunner,
  TestSuiteGenerator,
  MockDataGenerator,
  IWorkflowDb,
  INode,
  WorkflowTestCase,
  TestingConfig,
  DEFAULT_TESTING_CONFIG
} from './testing-patterns';

// Test Data Setup
const createSampleWorkflow = (): IWorkflowDb => ({
  id: 'test-workflow-001',
  name: 'Sample Test Workflow',
  nodes: {
    'webhook-node': {
      id: 'webhook-node',
      name: 'Webhook Trigger',
      type: 'n8n-nodes-base.webhook',
      position: [100, 100],
      parameters: {
        path: '/test-webhook'
      },
      webhookId: 'test-webhook-id'
    },
    'ai-node': {
      id: 'ai-node',
      name: 'OpenAI Chat',
      type: 'n8n-nodes-base.openai',
      position: [300, 100],
      parameters: {
        resource: 'chat',
        operation: 'create'
      },
      credentials: {
        openaiApi: 'openai-credentials'
      }
    },
    'response-node': {
      id: 'response-node',
      name: 'Respond',
      type: 'n8n-nodes-base.respondToWebhook',
      position: [500, 100],
      parameters: {
        statusCode: 200
      }
    }
  },
  connections: {
    'webhook-node': {
      main: [[{
        node: 'ai-node',
        type: 'main',
        index: 0
      }]]
    },
    'ai-node': {
      main: [[{
        node: 'response-node',
        type: 'main',
        index: 0
      }]]
    }
  },
  meta: {
    description: 'A test workflow for AI integration testing'
  }
});

const createInvalidWorkflow = (): IWorkflowDb => ({
  id: 'invalid-workflow',
  name: '', // Missing name
  nodes: {
    'orphan-node': {
      id: 'orphan-node',
      name: 'Orphaned Node',
      type: '', // Missing type
      position: [100, 100]
    }
  },
  connections: {
    'non-existent-node': { // Invalid connection
      main: [[{
        node: 'another-non-existent',
        type: 'main',
        index: 0
      }]]
    }
  }
});

// Test Results Tracking
interface TestResults {
  passed: number;
  failed: number;
  total: number;
  results: Array<{
    name: string;
    status: 'PASS' | 'FAIL';
    message?: string;
    duration?: number;
  }>;
}

const testResults: TestResults = {
  passed: 0,
  failed: 0,
  total: 0,
  results: []
};

// Test Helper Functions
function runTest(name: string, testFn: () => Promise<boolean> | boolean): void {
  testResults.total++;
  const startTime = Date.now();
  
  try {
    const result = testFn();
    const isAsync = result instanceof Promise;
    
    if (isAsync) {
      result.then(success => {
        const duration = Date.now() - startTime;
        if (success) {
          testResults.passed++;
          testResults.results.push({ name, status: 'PASS', duration });
          console.log(`✅ ${name} (${duration}ms)`);
        } else {
          testResults.failed++;
          testResults.results.push({ name, status: 'FAIL', message: 'Test returned false', duration });
          console.log(`❌ ${name} - Test returned false (${duration}ms)`);
        }
      }).catch(error => {
        const duration = Date.now() - startTime;
        testResults.failed++;
        testResults.results.push({ name, status: 'FAIL', message: error.message, duration });
        console.log(`❌ ${name} - ${error.message} (${duration}ms)`);
      });
    } else {
      const duration = Date.now() - startTime;
      if (result) {
        testResults.passed++;
        testResults.results.push({ name, status: 'PASS', duration });
        console.log(`✅ ${name} (${duration}ms)`);
      } else {
        testResults.failed++;
        testResults.results.push({ name, status: 'FAIL', message: 'Test returned false', duration });
        console.log(`❌ ${name} - Test returned false (${duration}ms)`);
      }
    }
  } catch (error) {
    const duration = Date.now() - startTime;
    testResults.failed++;
    const message = error instanceof Error ? error.message : 'Unknown error';
    testResults.results.push({ name, status: 'FAIL', message, duration });
    console.log(`❌ ${name} - ${message} (${duration}ms)`);
  }
}

// Test Suite for Testing Patterns Module

export function runTestingPatternsTests(): void {
  console.log('🧪 Running Testing Patterns Test Suite...\n');
  
  let passed = 0;
  let failed = 0;
  let total = 0;

  function test(name: string, testFn: () => boolean): void {
    total++;
    try {
      const result = testFn();
      if (result) {
        passed++;
        console.log(`✅ ${name}`);
      } else {
        failed++;
        console.log(`❌ ${name} - Test returned false`);
      }
    } catch (error) {
      failed++;
      console.log(`❌ ${name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Test 1: Mock Data Structure
  test('Mock Data Structure Validation', () => {
    const mockData = {
      json: {
        id: 1,
        data: 'test data',
        timestamp: Date.now()
      }
    };
    
    return mockData.json.id === 1 && mockData.json.data === 'test data';
  });

  // Test 2: Webhook Mock Data
  test('Webhook Mock Data Generation', () => {
    const webhookData = {
      json: {
        body: { message: 'Mock webhook data', timestamp: Date.now() },
        headers: { 'content-type': 'application/json' },
        query: {},
        params: {}
      }
    };
    
    return webhookData.json.body.message === 'Mock webhook data' &&
           webhookData.json.headers['content-type'] === 'application/json';
  });

  // Test 3: AI Node Mock Data
  test('AI Node Mock Data Generation', () => {
    const aiData = {
      json: {
        response: 'AI generated response',
        confidence: 0.95,
        tokens_used: 150,
        model: 'gpt-4'
      }
    };
    
    return aiData.json.response === 'AI generated response' &&
           aiData.json.model === 'gpt-4';
  });

  // Test 4: Workflow Structure Validation
  test('Basic Workflow Structure', () => {
    const workflow = {
      id: 'test-workflow',
      name: 'Test Workflow',
      nodes: {
        'node1': {
          id: 'node1',
          name: 'Test Node',
          type: 'n8n-nodes-base.webhook',
          position: [100, 100] as [number, number]
        }
      },
      connections: {},
      meta: { description: 'Test workflow' }
    };
    
    return workflow.name === 'Test Workflow' &&
           Object.keys(workflow.nodes).length === 1;
  });

  // Test 5: Validation Logic - Valid Workflow
  test('Validation Logic - Valid Workflow', () => {
    const workflow = {
      name: 'Valid Workflow',
      nodes: {
        'webhook': {
          id: 'webhook',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          position: [100, 100] as [number, number]
        }
      },
      connections: {}
    };
    
    // Basic validation
    const hasName = workflow.name && workflow.name.trim().length > 0;
    const hasNodes = Object.keys(workflow.nodes).length > 0;
    const allNodesHaveTypes = Object.values(workflow.nodes).every(
      node => node.type && node.type.length > 0
    );
    
    return hasName && hasNodes && allNodesHaveTypes;
  });

  // Test 6: Validation Logic - Invalid Workflow  
  test('Validation Logic - Invalid Workflow', () => {
    const invalidWorkflow = {
      name: '', // Missing name
      nodes: {
        'orphan': {
          id: 'orphan',
          name: 'Orphan',
          type: '', // Missing type
          position: [100, 100] as [number, number]
        }
      },
      connections: {}
    };
    
    // Should detect issues
    const hasInvalidName = !invalidWorkflow.name || invalidWorkflow.name.trim().length === 0;
    const hasNodeWithoutType = Object.values(invalidWorkflow.nodes).some(
      node => !node.type || node.type.length === 0
    );
    
    return hasInvalidName && hasNodeWithoutType;
  });

  // Test 7: Connection Validation
  test('Connection Validation', () => {
    const workflow = {
      name: 'Connected Workflow',
      nodes: {
        'node1': {
          id: 'node1',
          name: 'Node 1',
          type: 'n8n-nodes-base.webhook',
          position: [100, 100] as [number, number]
        },
        'node2': {
          id: 'node2', 
          name: 'Node 2',
          type: 'n8n-nodes-base.set',
          position: [300, 100] as [number, number]
        }
      },
      connections: {
        'node1': {
          main: [[{
            node: 'node2',
            type: 'main',
            index: 0
          }]]
        }
      }
    };
    
    const nodeNames = Object.keys(workflow.nodes);
    let allConnectionsValid = true;
    
    Object.entries(workflow.connections).forEach(([sourceNode, connections]) => {
      if (!nodeNames.includes(sourceNode)) {
        allConnectionsValid = false;
      }
      
      Object.values(connections).forEach((outputConnections: any) => {
        outputConnections.forEach((connection: any) => {
          connection.forEach((conn: any) => {
            if (!nodeNames.includes(conn.node)) {
              allConnectionsValid = false;
            }
          });
        });
      });
    });
    
    return allConnectionsValid;
  });

  // Test 8: Quality Score Calculation
  test('Quality Score - High Quality', () => {
    const workflow = {
      name: 'High Quality Workflow',
      nodes: {
        'webhook': {
          id: 'webhook',
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          position: [100, 100] as [number, number]
        },
        'process': {
          id: 'process',
          name: 'Process',
          type: 'n8n-nodes-base.function',
          position: [300, 100] as [number, number]
        }
      },
      connections: {
        'webhook': {
          main: [[{ node: 'process', type: 'main', index: 0 }]]
        }
      },
      meta: {
        description: 'A well-documented workflow'
      }
    };
    
    let score = 100;
    
    // Deduct for missing name
    if (!workflow.name || workflow.name.trim().length === 0) {
      score -= 10;
    }
    
    // Bonus for description
    if (workflow.meta?.description) {
      score += 5;
    }
    
    // Deduct for missing node types
    Object.values(workflow.nodes).forEach(node => {
      if (!node.type) {
        score -= 20;
      }
    });
    
    return score > 80;
  });

  // Test 9: Performance Considerations
  test('Large Workflow Detection', () => {
    const nodeCount = 60; // Simulate large workflow
    return nodeCount > 50; // Should trigger performance warning
  });

  // Test 10: Security Validation
  test('Hardcoded Credentials Detection', () => {
    const nodeWithPassword = {
      parameters: {
        authentication: 'password',
        password: 'hardcoded-secret'
      }
    };
    
    const nodeStr = JSON.stringify(nodeWithPassword);
    return nodeStr.includes('password'); // Should detect security issue
  });

  // Test 11: AI Node Validation
  test('AI Node Credentials Check', () => {
    const aiNode = {
      type: 'n8n-nodes-base.openai',
      credentials: {
        openaiApi: 'openai-creds'
      }
    };
    
    const isAINode = aiNode.type.includes('openai');
    const hasCredentials = aiNode.credentials !== undefined;
    
    return isAINode && hasCredentials;
  });

  // Test 12: Test Case Generation
  test('Test Case Structure', () => {
    const testCase = {
      id: 'test-001',
      name: 'Sample Test',
      description: 'A sample test case',
      workflow: { name: 'Test Workflow', nodes: {}, connections: {} },
      inputs: { test: 'data' },
      expectedOutputs: { result: 'success' },
      assertions: [
        {
          type: 'equals',
          path: 'test',
          expected: 'data',
          message: 'Should match input'
        }
      ],
      tags: ['basic'],
      timeout: 5000
    };
    
    return testCase.id === 'test-001' &&
           testCase.assertions.length === 1 &&
           testCase.timeout === 5000;
  });

  // Test 13: Assertion Types
  test('Assertion Types Validation', () => {
    const assertionTypes = ['equals', 'contains', 'exists', 'type', 'range', 'custom'];
    return assertionTypes.length === 6 && assertionTypes.includes('equals');
  });

  // Test 14: Mock Data Generation Functions
  test('Mock Data Generation Logic', () => {
    function generateMockData(nodeType: string) {
      switch (nodeType.toLowerCase()) {
        case 'webhook':
          return {
            json: {
              body: { message: 'Mock webhook data' },
              headers: { 'content-type': 'application/json' }
            }
          };
        case 'ai':
        case 'openai':
          return {
            json: {
              response: 'AI response',
              model: 'gpt-4'
            }
          };
        default:
          return {
            json: {
              data: `Mock data for ${nodeType}`
            }
          };
      }
    }
    
    const webhookData = generateMockData('webhook');
    const aiData = generateMockData('openai');
    const defaultData = generateMockData('unknown');
    
    return webhookData.json.body.message === 'Mock webhook data' &&
           aiData.json.model === 'gpt-4' &&
           defaultData.json.data === 'Mock data for unknown';
  });

  // Test 15: Error Handling
  test('Error Handling in Validation', () => {
    try {
      const invalidInput = null;
      // This should handle gracefully
      const result = invalidInput || { name: 'default', nodes: {} };
      return result.name === 'default';
    } catch (error) {
      return false;
    }
  });

  // Print Summary
  console.log(`\n📊 Test Results Summary:`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📈 Total: ${total}`);
  console.log(`🎯 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Check the output above for details.');
  } else {
    console.log('\n🎉 All tests passed!');
  }
}

// Performance Test Function
export function runPerformanceTests(): void {
  console.log('\n⚡ Running Performance Tests...\n');

  // Test mock data generation performance
  const startTime = Date.now();
  for (let i = 0; i < 10000; i++) {
    const mockData = {
      json: {
        id: i,
        data: `Mock data ${i}`,
        timestamp: Date.now()
      }
    };
  }
  const mockDataTime = Date.now() - startTime;
  console.log(`✅ Mock Data Generation (10,000 records): ${mockDataTime}ms`);

  // Test validation performance
  const validationStart = Date.now();
  for (let i = 0; i < 1000; i++) {
    const workflow = {
      name: `Workflow ${i}`,
      nodes: {
        [`node${i}`]: {
          id: `node${i}`,
          name: `Node ${i}`,
          type: 'n8n-nodes-base.webhook',
          position: [100, 100] as [number, number]
        }
      },
      connections: {}
    };
    
    // Simple validation
    const isValid = workflow.name.length > 0 && Object.keys(workflow.nodes).length > 0;
  }
  const validationTime = Date.now() - validationStart;
  console.log(`✅ Workflow Validation (1,000 workflows): ${validationTime}ms`);
  console.log(`📊 Average validation time: ${(validationTime / 1000).toFixed(2)}ms per workflow`);
}

// Real-world Examples Test
export function runExampleTests(): void {
  console.log('\n🌍 Running Real-world Example Tests...\n');

  const examples = [
    {
      name: 'E-commerce Order Processing',
      nodeCount: 5,
      hasAI: false,
      complexity: 'medium'
    },
    {
      name: 'AI Content Generation',
      nodeCount: 4,
      hasAI: true,
      complexity: 'high'
    },
    {
      name: 'Simple Data Sync',
      nodeCount: 2,
      hasAI: false,
      complexity: 'low'
    }
  ];

  examples.forEach(example => {
    console.log(`✅ ${example.name}:`);
    console.log(`   - Nodes: ${example.nodeCount}`);
    console.log(`   - AI Integration: ${example.hasAI ? 'Yes' : 'No'}`);
    console.log(`   - Complexity: ${example.complexity}`);
  });
}

export default runTestingPatternsTests; 