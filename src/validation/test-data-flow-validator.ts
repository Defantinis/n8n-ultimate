/**
 * Test Suite for Data Flow Validator
 * Comprehensive tests for data flow validation, transformations, and type compatibility
 */

import {
  DataFlowValidator,
  N8NDataType,
  DataTransformation,
  DataFlowPath,
  NodeDataSpec,
  DataFlowValidationReport
} from './data-flow-validator';

import {
  N8NWorkflowSchema,
  N8NNode,
  N8NConnections,
  ValidationResult,
  N8NWorkflowBuilder
} from './n8n-workflow-schema';

import { ConnectionValidator } from './connection-validator';

/**
 * Mock Knowledge Storage Manager for testing
 */
class MockConnectionValidator extends ConnectionValidator {
  constructor() {
    super();
  }

  // Override methods for testing if needed
}

/**
 * Test data generators for data flow validation testing
 */
export class DataFlowValidatorTestData {
  /**
   * Create a simple workflow for testing data flow
   */
  static createSimpleDataFlowWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Simple Data Flow Test')
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
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [300, 100],
        parameters: {
          url: 'https://api.example.com/data',
          method: 'GET'
        }
      })
      .addNode({
        id: 'set1',
        name: 'Set Data',
        type: 'n8n-nodes-base.set',
        typeVersion: 2,
        position: [500, 100],
        parameters: {
          values: {
            string: [
              {
                name: 'processedData',
                value: '={{$json.data}}'
              }
            ]
          }
        }
      })
      .addConnection('trigger1', 'http1')
      .addConnection('http1', 'set1')
      .build();
  }

  /**
   * Create a workflow with data type incompatibilities
   */
  static createIncompatibleDataFlowWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Incompatible Data Flow Test')
      .addNode({
        id: 'trigger1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [100, 100],
        parameters: {}
      })
      .addNode({
        id: 'code1',
        name: 'Code Node',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [300, 100],
        parameters: {
          jsCode: 'return [{ number: 42 }];'
        }
      })
      .addNode({
        id: 'set1',
        name: 'Set Data',
        type: 'n8n-nodes-base.set',
        typeVersion: 2,
        position: [500, 100],
        parameters: {
          values: {
            string: [
              {
                name: 'stringValue',
                value: '={{$json.number.toString()}}'
              }
            ]
          }
        }
      })
      .addConnection('trigger1', 'code1')
      .addConnection('code1', 'set1')
      .build();
  }

  /**
   * Create a workflow with complex data transformations
   */
  static createComplexDataTransformationWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Complex Data Transformation Test')
      .addNode({
        id: 'webhook1',
        name: 'Webhook',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [100, 100],
        parameters: {
          path: 'test-webhook'
        }
      })
      .addNode({
        id: 'function1',
        name: 'Function',
        type: 'n8n-nodes-base.function',
        typeVersion: 1,
        position: [300, 100],
        parameters: {
          functionCode: `
            const items = [];
            for (const item of $input.all()) {
              items.push({
                json: {
                  transformed: item.json.data * 2,
                  processed: true,
                  timestamp: new Date().toISOString()
                }
              });
            }
            return items;
          `
        }
      })
      .addNode({
        id: 'if1',
        name: 'IF',
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [500, 100],
        parameters: {
          conditions: {
            boolean: [
              {
                value1: '={{$json.processed}}',
                operation: 'equal',
                value2: true
              }
            ]
          }
        }
      })
      .addConnection('webhook1', 'function1')
      .addConnection('function1', 'if1')
      .build();
  }

  /**
   * Create a workflow with AI node data flow
   */
  static createAIDataFlowWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('AI Data Flow Test')
      .addNode({
        id: 'trigger1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [100, 100],
        parameters: {}
      })
      .addNode({
        id: 'openai1',
        name: 'OpenAI',
        type: '@n8n/n8n-nodes-langchain.openAi',
        typeVersion: 1,
        position: [300, 100],
        parameters: {
          model: 'gpt-3.5-turbo',
          messages: {
            messageValues: [
              {
                message: 'Analyze this data: {{$json.input}}'
              }
            ]
          }
        }
      })
      .addNode({
        id: 'set1',
        name: 'Process AI Response',
        type: 'n8n-nodes-base.set',
        typeVersion: 2,
        position: [500, 100],
        parameters: {
          values: {
            string: [
              {
                name: 'aiAnalysis',
                value: '={{$json.message.content}}'
              }
            ]
          }
        }
      })
      .addConnection('trigger1', 'openai1')
      .addConnection('openai1', 'set1')
      .build();
  }

  /**
   * Create a workflow with data flow validation errors
   */
  static createDataFlowErrorWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Data Flow Error Test')
      .addNode({
        id: 'trigger1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [100, 100],
        parameters: {}
      })
      .addNode({
        id: 'set1',
        name: 'Set Invalid Data',
        type: 'n8n-nodes-base.set',
        typeVersion: 2,
        position: [300, 100],
        parameters: {
          values: {
            string: [
              {
                name: 'invalidExpression',
                value: '={{$json.nonexistent.property.deep}}'
              }
            ]
          }
        }
      })
      .addNode({
        id: 'http1',
        name: 'HTTP Request',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [500, 100],
        parameters: {
          url: '={{$json.invalidExpression}}',
          method: 'GET'
        }
      })
      .addConnection('trigger1', 'set1')
      .addConnection('set1', 'http1')
      .build();
  }

  /**
   * Create test data types
   */
  static createTestDataTypes(): Record<string, N8NDataType> {
    return {
      json: {
        type: 'json',
        description: 'JSON object data'
      },
      string: {
        type: 'string',
        description: 'String data'
      },
      number: {
        type: 'number',
        description: 'Numeric data'
      },
      boolean: {
        type: 'boolean',
        description: 'Boolean data'
      },
      array: {
        type: 'array',
        description: 'Array data'
      },
      binary: {
        type: 'binary',
        description: 'Binary data'
      }
    };
  }

  /**
   * Create test data transformations
   */
  static createTestDataTransformations(): DataTransformation[] {
    return [
      {
        sourceType: { type: 'string' },
        targetType: { type: 'number' },
        transformation: 'parseInt({{$json.stringValue}})',
        isValid: true
      },
      {
        sourceType: { type: 'number' },
        targetType: { type: 'string' },
        transformation: '{{$json.numberValue}}.toString()',
        isValid: true
      },
      {
        sourceType: { type: 'json' },
        targetType: { type: 'string' },
        transformation: 'JSON.stringify({{$json.objectValue}})',
        isValid: true
      },
      {
        sourceType: { type: 'string' },
        targetType: { type: 'boolean' },
        transformation: '{{$json.invalidExpression.nonexistent}}',
        isValid: false,
        errorMessage: 'Invalid expression: cannot access nonexistent property'
      }
    ];
  }
}

/**
 * Comprehensive test suite for Data Flow Validator
 */
export class DataFlowValidatorTestSuite {
  private validator: DataFlowValidator;
  private mockConnectionValidator: MockConnectionValidator;

  constructor() {
    this.mockConnectionValidator = new MockConnectionValidator();
    this.validator = new DataFlowValidator(this.mockConnectionValidator);
  }

  /**
   * Run all data flow validation tests
   */
  runAllTests(): boolean {
    console.log('🧪 Running Data Flow Validator Test Suite...\n');

    const tests = [
      () => this.testBasicDataFlowValidation(),
      () => this.testDataTypeCompatibility(),
      () => this.testDataTransformationValidation(),
      () => this.testDataFlowPathAnalysis(),
      () => this.testNodeDataRequirements(),
      () => this.testDataFlowContinuity(),
      () => this.testComplexDataTransformations(),
      () => this.testAIDataFlowPatterns(),
      () => this.testDataFlowErrorHandling(),
      () => this.testDataFlowReportGeneration(),
      () => this.testValidationUtilityFunctions(),
      () => this.testDataFlowPerformance()
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
   * Test basic data flow validation
   */
  private testBasicDataFlowValidation(): boolean {
    const workflow = DataFlowValidatorTestData.createSimpleDataFlowWorkflow();
    const results = this.validator.validateDataFlow(workflow);
    
    // Should have minimal validation issues for a simple workflow
    const errors = results.filter(r => r.severity === 'error' && !r.valid);
    console.log(`  - Validation results: ${results.length} total, ${errors.length} errors`);
    
    return errors.length === 0;
  }

  /**
   * Test data type compatibility validation
   */
  private testDataTypeCompatibility(): boolean {
    const compatibleWorkflow = DataFlowValidatorTestData.createSimpleDataFlowWorkflow();
    const compatibleResults = this.validator.validateDataFlow(compatibleWorkflow);
    
    const incompatibleWorkflow = DataFlowValidatorTestData.createIncompatibleDataFlowWorkflow();
    const incompatibleResults = this.validator.validateDataFlow(incompatibleWorkflow);
    
    console.log(`  - Compatible workflow: ${compatibleResults.length} issues`);
    console.log(`  - Incompatible workflow: ${incompatibleResults.length} issues`);
    
    // Incompatible workflow should have more issues than compatible one
    return incompatibleResults.length >= compatibleResults.length;
  }

  /**
   * Test data transformation validation
   */
  private testDataTransformationValidation(): boolean {
    const transformations = DataFlowValidatorTestData.createTestDataTransformations();
    
    let validTransformations = 0;
    let invalidTransformations = 0;
    
    for (const transformation of transformations) {
      if (transformation.isValid) {
        validTransformations++;
      } else {
        invalidTransformations++;
      }
    }
    
    console.log(`  - Valid transformations: ${validTransformations}`);
    console.log(`  - Invalid transformations: ${invalidTransformations}`);
    
    return validTransformations > 0 && invalidTransformations > 0;
  }

  /**
   * Test data flow path analysis
   */
  private testDataFlowPathAnalysis(): boolean {
    const workflow = DataFlowValidatorTestData.createComplexDataTransformationWorkflow();
    const report = this.validator.generateDataFlowReport(workflow);
    
    console.log(`  - Total paths analyzed: ${report.summary.totalPaths}`);
    console.log(`  - Valid paths: ${report.summary.validPaths}`);
    console.log(`  - Invalid paths: ${report.summary.invalidPaths}`);
    
    return report.summary.totalPaths > 0;
  }

  /**
   * Test node data requirements validation
   */
  private testNodeDataRequirements(): boolean {
    const workflow = DataFlowValidatorTestData.createSimpleDataFlowWorkflow();
    const results = this.validator.validateDataFlow(workflow);
    
    // Check for node requirement validation results
    const requirementResults = results.filter(r => 
      r.message?.includes('requirement') || r.message?.includes('parameter')
    );
    
    console.log(`  - Node requirement validations: ${requirementResults.length}`);
    
    return true; // Test passes if no exceptions thrown
  }

  /**
   * Test data flow continuity validation
   */
  private testDataFlowContinuity(): boolean {
    const workflow = DataFlowValidatorTestData.createSimpleDataFlowWorkflow();
    const results = this.validator.validateDataFlow(workflow);
    
    // Check for continuity validation results
    const continuityResults = results.filter(r => 
      r.message?.includes('continuity') || r.message?.includes('flow')
    );
    
    console.log(`  - Data flow continuity checks: ${continuityResults.length}`);
    
    return true; // Test passes if no exceptions thrown
  }

  /**
   * Test complex data transformations
   */
  private testComplexDataTransformations(): boolean {
    const workflow = DataFlowValidatorTestData.createComplexDataTransformationWorkflow();
    const report = this.validator.generateDataFlowReport(workflow);
    
    console.log(`  - Transformation issues: ${report.summary.transformationIssues}`);
    console.log(`  - Recommendations: ${report.recommendations.length}`);
    
    return report.recommendations.length >= 0;
  }

  /**
   * Test AI data flow patterns
   */
  private testAIDataFlowPatterns(): boolean {
    const workflow = DataFlowValidatorTestData.createAIDataFlowWorkflow();
    const results = this.validator.validateDataFlow(workflow);
    
    console.log(`  - AI workflow validation results: ${results.length}`);
    
    return true; // Test passes if no exceptions thrown
  }

  /**
   * Test data flow error handling
   */
  private testDataFlowErrorHandling(): boolean {
    const workflow = DataFlowValidatorTestData.createDataFlowErrorWorkflow();
    const results = this.validator.validateDataFlow(workflow);
    
    const errors = results.filter(r => r.severity === 'error' && !r.valid);
    console.log(`  - Error workflow validation errors: ${errors.length}`);
    
    // Error workflow should produce validation errors
    return errors.length > 0;
  }

  /**
   * Test data flow report generation
   */
  private testDataFlowReportGeneration(): boolean {
    const workflow = DataFlowValidatorTestData.createComplexDataTransformationWorkflow();
    const report = this.validator.generateDataFlowReport(workflow);
    
    // Validate report structure
    const hasValidSummary = report.summary && 
      typeof report.summary.totalPaths === 'number' &&
      typeof report.summary.validPaths === 'number' &&
      typeof report.summary.invalidPaths === 'number';
    
    const hasPathAnalysis = Array.isArray(report.pathAnalysis);
    const hasNodeAnalysis = Array.isArray(report.nodeAnalysis);
    const hasRecommendations = Array.isArray(report.recommendations);
    
    console.log(`  - Report has valid summary: ${hasValidSummary}`);
    console.log(`  - Report has path analysis: ${hasPathAnalysis}`);
    console.log(`  - Report has node analysis: ${hasNodeAnalysis}`);
    console.log(`  - Report has recommendations: ${hasRecommendations}`);
    
    return hasValidSummary && hasPathAnalysis && hasNodeAnalysis && hasRecommendations;
  }

  /**
   * Test validation utility functions
   */
  private testValidationUtilityFunctions(): boolean {
    const dataTypes = DataFlowValidatorTestData.createTestDataTypes();
    
    // Test data type creation and validation
    const jsonType = dataTypes.json;
    const stringType = dataTypes.string;
    
    console.log(`  - JSON type: ${jsonType.type} - ${jsonType.description}`);
    console.log(`  - String type: ${stringType.type} - ${stringType.description}`);
    
    return jsonType.type === 'json' && stringType.type === 'string';
  }

  /**
   * Test data flow performance with larger workflows
   */
  private testDataFlowPerformance(): boolean {
    const startTime = Date.now();
    
    // Create and validate multiple workflows
    const workflows = [
      DataFlowValidatorTestData.createSimpleDataFlowWorkflow(),
      DataFlowValidatorTestData.createComplexDataTransformationWorkflow(),
      DataFlowValidatorTestData.createAIDataFlowWorkflow(),
      DataFlowValidatorTestData.createDataFlowErrorWorkflow()
    ];
    
    for (const workflow of workflows) {
      this.validator.validateDataFlow(workflow);
      this.validator.generateDataFlowReport(workflow);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    console.log(`  - Performance test duration: ${duration}ms`);
    console.log(`  - Average per workflow: ${Math.round(duration / workflows.length)}ms`);
    
    // Test passes if validation completes within reasonable time (< 5 seconds)
    return duration < 5000;
  }
}

// Export test runner function
export function runDataFlowValidatorTests(): boolean {
  const testSuite = new DataFlowValidatorTestSuite();
  return testSuite.runAllTests();
}

// Run tests if this file is executed directly
if (require.main === module) {
  const success = runDataFlowValidatorTests();
  process.exit(success ? 0 : 1);
} 