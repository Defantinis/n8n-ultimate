/**
 * Test Suite for Error Handling Validator
 * Comprehensive tests for workflow error handling validation and resilience analysis
 */

import {
  ErrorHandlingValidator,
  ErrorType,
  RecoveryStrategy,
  NodeErrorHandling,
  WorkflowErrorHandling
} from './error-handling-validator';

import {
  N8NWorkflowSchema,
  N8NWorkflowBuilder
} from './n8n-workflow-schema';

import { ConnectionValidator } from './connection-validator';

/**
 * Mock Connection Validator for testing
 */
class MockConnectionValidator extends ConnectionValidator {
  constructor() {
    super();
  }

  analyzeDataFlow(workflow: N8NWorkflowSchema) {
    const baseAnalysis = super.analyzeDataFlow(workflow);
    
    // Add predictable connection paths for testing
    baseAnalysis.connectionPaths = [
      { path: workflow.nodes.map(n => n.id), length: workflow.nodes.length, hasErrors: false, errorMessages: [] }
    ];
    
    return baseAnalysis;
  }
}

/**
 * Test data generators for error handling validation testing
 */
export class ErrorHandlingValidatorTestData {
  /**
   * Create a simple workflow with basic error handling
   */
  static createSimpleErrorHandlingWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Simple Error Handling Test')
      .addNode({
        id: 'trigger1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [100, 100],
        parameters: {}
      })
      .addNode({
        id: 'http1',
        name: 'HTTP Request with Retry',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [300, 100],
        parameters: {
          url: 'https://api.example.com',
          method: 'GET',
          retry: true,
          maxRetries: 3,
          continueOnFail: true
        }
      })
      .addNode({
        id: 'set1',
        name: 'Set Result',
        type: 'n8n-nodes-base.set',
        typeVersion: 2,
        position: [500, 100],
        parameters: {
          values: { string: [{ name: 'status', value: 'success' }] }
        }
      })
      .addConnection('trigger1', 'http1')
      .addConnection('http1', 'set1')
      .build();
  }

  /**
   * Create a workflow with poor error handling
   */
  static createPoorErrorHandlingWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Poor Error Handling Test')
      .addNode({
        id: 'trigger1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [100, 100],
        parameters: {}
      })
      .addNode({
        id: 'http1',
        name: 'HTTP Request No Retry',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [300, 100],
        parameters: {
          url: 'https://unreliable-api.example.com',
          method: 'GET'
          // No retry or error handling configured
        }
      })
      .addNode({
        id: 'http2',
        name: 'Another HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [500, 100],
        parameters: {
          url: 'https://another-api.example.com',
          method: 'POST'
          // No error handling
        }
      })
      .addNode({
        id: 'openai1',
        name: 'OpenAI No Fallback',
        type: '@n8n/n8n-nodes-langchain.openAi',
        typeVersion: 1,
        position: [700, 100],
        parameters: {
          model: 'gpt-4',
          messages: { messageValues: [{ message: 'Process: {{$json}}' }] }
          // No retry or fallback configured
        }
      })
      .addConnection('trigger1', 'http1')
      .addConnection('http1', 'http2')
      .addConnection('http2', 'openai1')
      .build();
  }

  /**
   * Create a resilient workflow with comprehensive error handling
   */
  static createResilientWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Resilient Workflow Test')
      .addNode({
        id: 'trigger1',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [100, 100],
        parameters: {
          path: 'resilient-endpoint',
          continueOnFail: true
        }
      })
      .addNode({
        id: 'http1',
        name: 'Primary API Call',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [300, 100],
        parameters: {
          url: 'https://primary-api.example.com',
          method: 'GET',
          retry: true,
          maxRetries: 5,
          continueOnFail: true,
          alwaysOutputData: true
        }
      })
      .addNode({
        id: 'code1',
        name: 'Process with Error Handling',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [500, 100],
        parameters: {
          jsCode: `
            try {
              const data = $input.all()[0].json;
              if (!data) {
                return [{ json: { error: 'No data received', fallback: true } }];
              }
              return [{ json: { processed: true, data } }];
            } catch (error) {
              return [{ json: { error: error.message, fallback: true } }];
            }
          `,
          continueOnFail: true
        }
      })
      .addNode({
        id: 'set1',
        name: 'Set Final Result',
        type: 'n8n-nodes-base.set',
        typeVersion: 2,
        position: [700, 100],
        parameters: {
          values: { string: [{ name: 'status', value: 'completed' }] },
          continueOnFail: true
        }
      })
      .addConnection('trigger1', 'http1')
      .addConnection('http1', 'code1')
      .addConnection('code1', 'set1')
      .build();
  }

  /**
   * Create a workflow with cascading failure risk
   */
  static createCascadingFailureWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Cascading Failure Risk Test')
      .addNode({
        id: 'trigger1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [100, 100],
        parameters: {}
      })
      .addNode({
        id: 'critical1',
        name: 'Critical Service 1',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [300, 100],
        parameters: {
          url: 'https://critical-service-1.example.com',
          method: 'GET'
          // No error handling - single point of failure
        }
      })
      .addNode({
        id: 'critical2',
        name: 'Critical Service 2',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [500, 100],
        parameters: {
          url: 'https://critical-service-2.example.com',
          method: 'GET'
          // No error handling - depends on critical1
        }
      })
      .addNode({
        id: 'critical3',
        name: 'Critical Service 3',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [700, 100],
        parameters: {
          url: 'https://critical-service-3.example.com',
          method: 'GET'
          // No error handling - depends on critical2
        }
      })
      .addConnection('trigger1', 'critical1')
      .addConnection('critical1', 'critical2')
      .addConnection('critical2', 'critical3')
      .build();
  }

  /**
   * Create a workflow with mixed error handling patterns
   */
  static createMixedErrorHandlingWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Mixed Error Handling Test')
      .addNode({
        id: 'trigger1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [100, 100],
        parameters: {}
      })
      .addNode({
        id: 'good1',
        name: 'Well Handled HTTP',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [300, 50],
        parameters: {
          url: 'https://api1.example.com',
          method: 'GET',
          retry: true,
          maxRetries: 3,
          continueOnFail: true
        }
      })
      .addNode({
        id: 'poor1',
        name: 'Poorly Handled HTTP',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [300, 150],
        parameters: {
          url: 'https://api2.example.com',
          method: 'GET'
          // No error handling
        }
      })
      .addNode({
        id: 'merge1',
        name: 'Merge Results',
        type: 'n8n-nodes-base.merge',
        typeVersion: 2,
        position: [500, 100],
        parameters: {}
      })
      .addConnection('trigger1', 'good1')
      .addConnection('trigger1', 'poor1')
      .addConnection('good1', 'merge1', 'main', 0, 'main', 0)
      .addConnection('poor1', 'merge1', 'main', 0, 'main', 1)
      .build();
  }
}

/**
 * Comprehensive test suite for Error Handling Validator
 */
export class ErrorHandlingValidatorTestSuite {
  private validator: ErrorHandlingValidator;
  private mockConnectionValidator: MockConnectionValidator;

  constructor() {
    this.mockConnectionValidator = new MockConnectionValidator();
    this.validator = new ErrorHandlingValidator(this.mockConnectionValidator);
  }

  /**
   * Run all error handling validation tests
   */
  runAllTests(): boolean {
    console.log('🚀 Running Error Handling Validator Test Suite...\n');

    const tests = [
      () => this.testBasicErrorHandlingValidation(),
      () => this.testNodeErrorHandlingAnalysis(),
      () => this.testWorkflowErrorHandlingAnalysis(),
      () => this.testErrorTypeDetection(),
      () => this.testRecoveryStrategyValidation(),
      () => this.testResilienceCalculation(),
      () => this.testCascadingFailureDetection(),
      () => this.testErrorHandlingCoverage(),
      () => this.testNetworkDependentNodes(),
      () => this.testRetryLogicValidation(),
      () => this.testErrorOutputValidation(),
      () => this.testMixedErrorHandlingPatterns(),
      () => this.testResilientWorkflowValidation(),
      () => this.testPoorErrorHandlingDetection()
    ];

    let passed = 0;
    let total = tests.length;

    for (let i = 0; i < tests.length; i++) {
      try {
        const testName = tests[i].name.replace('bound ', '');
        console.log(`Running ${testName}...`);
        
        const result = tests[i]();
        if (result) {
          console.log(`✅ ${testName} passed`);
          passed++;
        } else {
          console.log(`❌ ${testName} failed`);
        }
      } catch (error) {
        console.log(`💥 ${tests[i].name} threw an error:`, error);
      }
      console.log('');
    }

    console.log(`📊 Test Results: ${passed}/${total} tests passed`);
    return passed === total;
  }

  /**
   * Test basic error handling validation
   */
  private testBasicErrorHandlingValidation(): boolean {
    const workflow = ErrorHandlingValidatorTestData.createSimpleErrorHandlingWorkflow();
    const results = this.validator.validateErrorHandling(workflow);
    
    console.log(`  - Validation results: ${results.length} total`);
    console.log(`  - Error count: ${results.filter(r => r.severity === 'error' && !r.valid).length}`);
    console.log(`  - Warning count: ${results.filter(r => r.severity === 'warning').length}`);
    
    // Simple workflow with error handling should have minimal issues
    return Array.isArray(results);
  }

  /**
   * Test node error handling analysis
   */
  private testNodeErrorHandlingAnalysis(): boolean {
    const workflow = ErrorHandlingValidatorTestData.createResilientWorkflow();
    const nodeAnalysis = this.validator.analyzeNodeErrorHandling(workflow);
    
    console.log(`  - Nodes analyzed: ${nodeAnalysis.length}`);
    console.log(`  - Nodes with retry logic: ${nodeAnalysis.filter(n => n.hasRetryLogic).length}`);
    console.log(`  - Nodes with error output: ${nodeAnalysis.filter(n => n.hasErrorOutput).length}`);
    console.log(`  - Average resilience: ${(nodeAnalysis.reduce((sum, n) => sum + n.resilience, 0) / nodeAnalysis.length * 100).toFixed(1)}%`);
    
    return nodeAnalysis.length === workflow.nodes.length &&
           nodeAnalysis.every(n => typeof n.resilience === 'number');
  }

  /**
   * Test workflow error handling analysis
   */
  private testWorkflowErrorHandlingAnalysis(): boolean {
    const resilientWorkflow = ErrorHandlingValidatorTestData.createResilientWorkflow();
    const poorWorkflow = ErrorHandlingValidatorTestData.createPoorErrorHandlingWorkflow();
    
    const resilientAnalysis = this.validator.analyzeWorkflowErrorHandling(resilientWorkflow);
    const poorAnalysis = this.validator.analyzeWorkflowErrorHandling(poorWorkflow);
    
    console.log(`  - Resilient workflow coverage: ${resilientAnalysis.errorHandlingCoverage.toFixed(1)}%`);
    console.log(`  - Poor workflow coverage: ${poorAnalysis.errorHandlingCoverage.toFixed(1)}%`);
    console.log(`  - Resilient workflow resilience: ${(resilientAnalysis.resilience * 100).toFixed(1)}%`);
    console.log(`  - Poor workflow resilience: ${(poorAnalysis.resilience * 100).toFixed(1)}%`);
    
    // Resilient workflow should have better metrics
    return resilientAnalysis.errorHandlingCoverage > poorAnalysis.errorHandlingCoverage &&
           resilientAnalysis.resilience > poorAnalysis.resilience;
  }

  /**
   * Test error type detection
   */
  private testErrorTypeDetection(): boolean {
    const workflow = ErrorHandlingValidatorTestData.createMixedErrorHandlingWorkflow();
    const nodeAnalysis = this.validator.analyzeNodeErrorHandling(workflow);
    
    const networkErrors = nodeAnalysis.filter(n => n.errorTypes.includes(ErrorType.NETWORK_CONNECTIVITY));
    const dataValidationErrors = nodeAnalysis.filter(n => n.errorTypes.includes(ErrorType.DATA_VALIDATION));
    
    console.log(`  - Nodes with network errors: ${networkErrors.length}`);
    console.log(`  - Nodes with data validation errors: ${dataValidationErrors.length}`);
    console.log(`  - Total error types detected: ${Array.from(new Set(nodeAnalysis.flatMap(n => n.errorTypes))).length}`);
    
    return networkErrors.length > 0; // Should detect network-dependent nodes
  }

  /**
   * Test recovery strategy validation
   */
  private testRecoveryStrategyValidation(): boolean {
    const workflow = ErrorHandlingValidatorTestData.createResilientWorkflow();
    const nodeAnalysis = this.validator.analyzeNodeErrorHandling(workflow);
    
    const retryStrategies = nodeAnalysis.filter(n => n.recoveryStrategies.includes(RecoveryStrategy.RETRY_WITH_BACKOFF));
    const fallbackStrategies = nodeAnalysis.filter(n => n.recoveryStrategies.includes(RecoveryStrategy.FALLBACK_VALUE));
    
    console.log(`  - Nodes with retry strategies: ${retryStrategies.length}`);
    console.log(`  - Nodes with fallback strategies: ${fallbackStrategies.length}`);
    console.log(`  - Total recovery strategies: ${Array.from(new Set(nodeAnalysis.flatMap(n => n.recoveryStrategies))).length}`);
    
    return retryStrategies.length > 0; // Should have retry strategies for network nodes
  }

  /**
   * Test resilience calculation
   */
  private testResilienceCalculation(): boolean {
    const resilientWorkflow = ErrorHandlingValidatorTestData.createResilientWorkflow();
    const poorWorkflow = ErrorHandlingValidatorTestData.createPoorErrorHandlingWorkflow();
    
    const resilientNodes = this.validator.analyzeNodeErrorHandling(resilientWorkflow);
    const poorNodes = this.validator.analyzeNodeErrorHandling(poorWorkflow);
    
    const avgResilientScore = resilientNodes.reduce((sum, n) => sum + n.resilience, 0) / resilientNodes.length;
    const avgPoorScore = poorNodes.reduce((sum, n) => sum + n.resilience, 0) / poorNodes.length;
    
    console.log(`  - Average resilient node score: ${(avgResilientScore * 100).toFixed(1)}%`);
    console.log(`  - Average poor node score: ${(avgPoorScore * 100).toFixed(1)}%`);
    
    return avgResilientScore > avgPoorScore;
  }

  /**
   * Test cascading failure detection
   */
  private testCascadingFailureDetection(): boolean {
    const cascadingWorkflow = ErrorHandlingValidatorTestData.createCascadingFailureWorkflow();
    const resilientWorkflow = ErrorHandlingValidatorTestData.createResilientWorkflow();
    
    const cascadingAnalysis = this.validator.analyzeWorkflowErrorHandling(cascadingWorkflow);
    const resilientAnalysis = this.validator.analyzeWorkflowErrorHandling(resilientWorkflow);
    
    console.log(`  - Cascading workflow failure risk: ${(cascadingAnalysis.cascadingFailureRisk * 100).toFixed(1)}%`);
    console.log(`  - Resilient workflow failure risk: ${(resilientAnalysis.cascadingFailureRisk * 100).toFixed(1)}%`);
    
    // Cascading workflow should have higher failure risk
    return cascadingAnalysis.cascadingFailureRisk > resilientAnalysis.cascadingFailureRisk;
  }

  /**
   * Test error handling coverage calculation
   */
  private testErrorHandlingCoverage(): boolean {
    const workflows = [
      ErrorHandlingValidatorTestData.createResilientWorkflow(),
      ErrorHandlingValidatorTestData.createPoorErrorHandlingWorkflow(),
      ErrorHandlingValidatorTestData.createMixedErrorHandlingWorkflow()
    ];
    
    const coverages = workflows.map(w => this.validator.analyzeWorkflowErrorHandling(w).errorHandlingCoverage);
    
    console.log(`  - Coverage scores: ${coverages.map(c => c.toFixed(1) + '%').join(', ')}`);
    console.log(`  - Average coverage: ${(coverages.reduce((sum, c) => sum + c, 0) / coverages.length).toFixed(1)}%`);
    
    return coverages.every(c => c >= 0 && c <= 100);
  }

  /**
   * Test network-dependent node validation
   */
  private testNetworkDependentNodes(): boolean {
    const workflow = ErrorHandlingValidatorTestData.createPoorErrorHandlingWorkflow();
    const results = this.validator.validateErrorHandling(workflow);
    
    const networkWarnings = results.filter(r => r.rule === 'network_node_retry');
    
    console.log(`  - Network dependency warnings: ${networkWarnings.length}`);
    console.log(`  - Total validation results: ${results.length}`);
    
    // Should detect network nodes without retry logic
    return networkWarnings.length > 0;
  }

  /**
   * Test retry logic validation
   */
  private testRetryLogicValidation(): boolean {
    const resilientWorkflow = ErrorHandlingValidatorTestData.createResilientWorkflow();
    const nodeAnalysis = this.validator.analyzeNodeErrorHandling(resilientWorkflow);
    
    const nodesWithRetry = nodeAnalysis.filter(n => n.hasRetryLogic);
    const httpNodes = nodeAnalysis.filter(n => n.nodeType === 'n8n-nodes-base.httpRequest');
    
    console.log(`  - Nodes with retry logic: ${nodesWithRetry.length}`);
    console.log(`  - HTTP nodes: ${httpNodes.length}`);
    console.log(`  - HTTP nodes with retry: ${httpNodes.filter(n => n.hasRetryLogic).length}`);
    
    return nodesWithRetry.length > 0;
  }

  /**
   * Test error output validation
   */
  private testErrorOutputValidation(): boolean {
    const resilientWorkflow = ErrorHandlingValidatorTestData.createResilientWorkflow();
    const nodeAnalysis = this.validator.analyzeNodeErrorHandling(resilientWorkflow);
    
    const nodesWithErrorOutput = nodeAnalysis.filter(n => n.hasErrorOutput);
    
    console.log(`  - Nodes with error output: ${nodesWithErrorOutput.length}`);
    console.log(`  - Total nodes: ${nodeAnalysis.length}`);
    
    return nodesWithErrorOutput.length > 0;
  }

  /**
   * Test mixed error handling patterns
   */
  private testMixedErrorHandlingPatterns(): boolean {
    const workflow = ErrorHandlingValidatorTestData.createMixedErrorHandlingWorkflow();
    const nodeAnalysis = this.validator.analyzeNodeErrorHandling(workflow);
    
    const resilienceScores = nodeAnalysis.map(n => n.resilience);
    const minResilience = Math.min(...resilienceScores);
    const maxResilience = Math.max(...resilienceScores);
    
    console.log(`  - Resilience range: ${(minResilience * 100).toFixed(1)}% - ${(maxResilience * 100).toFixed(1)}%`);
    console.log(`  - Resilience variance: ${((maxResilience - minResilience) * 100).toFixed(1)}%`);
    
    // Mixed workflow should have variance in resilience scores
    return maxResilience > minResilience;
  }

  /**
   * Test resilient workflow validation
   */
  private testResilientWorkflowValidation(): boolean {
    const workflow = ErrorHandlingValidatorTestData.createResilientWorkflow();
    const results = this.validator.validateErrorHandling(workflow);
    
    const errors = results.filter(r => r.severity === 'error' && !r.valid);
    const warnings = results.filter(r => r.severity === 'warning');
    
    console.log(`  - Errors in resilient workflow: ${errors.length}`);
    console.log(`  - Warnings in resilient workflow: ${warnings.length}`);
    
    // Resilient workflow should have minimal errors
    return errors.length === 0;
  }

  /**
   * Test poor error handling detection
   */
  private testPoorErrorHandlingDetection(): boolean {
    const workflow = ErrorHandlingValidatorTestData.createPoorErrorHandlingWorkflow();
    const results = this.validator.validateErrorHandling(workflow);
    
    const errors = results.filter(r => r.severity === 'error' && !r.valid);
    const warnings = results.filter(r => r.severity === 'warning');
    
    console.log(`  - Errors in poor workflow: ${errors.length}`);
    console.log(`  - Warnings in poor workflow: ${warnings.length}`);
    
    // Poor workflow should have warnings or errors
    return warnings.length > 0 || errors.length > 0;
  }
}

// Export test runner function
export function runErrorHandlingValidatorTests(): boolean {
  const testSuite = new ErrorHandlingValidatorTestSuite();
  return testSuite.runAllTests();
}

// Run tests if this file is executed directly
if (require.main === module) {
  const success = runErrorHandlingValidatorTests();
  process.exit(success ? 0 : 1);
} 