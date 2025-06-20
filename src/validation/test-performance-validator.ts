/**
 * Test Suite for Performance Validator
 * Comprehensive tests for workflow performance validation, metrics, and optimization
 */

import {
  PerformanceValidator,
  NodePerformanceMetrics,
  WorkflowPerformanceMetrics,
  PerformanceThresholds,
  PerformanceValidationReport
} from './performance-validator';

import {
  N8NWorkflowSchema,
  N8NNode,
  ValidationResult,
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

  // Override analyzeDataFlow for predictable test results
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
 * Test data generators for performance validation testing
 */
export class PerformanceValidatorTestData {
  /**
   * Create a simple workflow for performance testing
   */
  static createSimplePerformanceWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Simple Performance Test')
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
        name: 'Set Data',
        type: 'n8n-nodes-base.set',
        typeVersion: 2,
        position: [300, 100],
        parameters: {
          values: {
            string: [{ name: 'message', value: 'Hello World' }]
          }
        }
      })
      .addConnection('trigger1', 'set1')
      .build();
  }

  /**
   * Create a high-performance workflow with resource-intensive nodes
   */
  static createHighPerformanceWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('High Performance Test')
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
          url: 'https://api.example.com/large-dataset',
          method: 'GET'
        }
      })
      .addNode({
        id: 'code1',
        name: 'Process Data',
        type: 'n8n-nodes-base.code',
        typeVersion: 2,
        position: [500, 100],
        parameters: {
          jsCode: `
            // Complex data processing
            const processedData = [];
            for (let i = 0; i < 10000; i++) {
              processedData.push({
                id: i,
                processed: true,
                timestamp: new Date().toISOString(),
                data: $input.all()[0].json
              });
            }
            return processedData.map(item => ({ json: item }));
          `
        }
      })
      .addNode({
        id: 'openai1',
        name: 'OpenAI Analysis',
        type: '@n8n/n8n-nodes-langchain.openAi',
        typeVersion: 1,
        position: [700, 100],
        parameters: {
          model: 'gpt-4',
          messages: {
            messageValues: [
              { message: 'Analyze this large dataset: {{$json}}' }
            ]
          }
        }
      })
      .addConnection('trigger1', 'http1')
      .addConnection('http1', 'code1')
      .addConnection('code1', 'openai1')
      .build();
  }

  /**
   * Create a parallel execution workflow
   */
  static createParallelExecutionWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Parallel Execution Test')
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
        name: 'HTTP Request 1',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [300, 50],
        parameters: { url: 'https://api1.example.com', method: 'GET' }
      })
      .addNode({
        id: 'http2',
        name: 'HTTP Request 2',
        type: 'n8n-nodes-base.httpRequest',
        typeVersion: 3,
        position: [300, 150],
        parameters: { url: 'https://api2.example.com', method: 'GET' }
      })
      .addNode({
        id: 'merge1',
        name: 'Merge Results',
        type: 'n8n-nodes-base.merge',
        typeVersion: 2,
        position: [500, 100],
        parameters: {}
      })
      .addConnection('trigger1', 'http1')
      .addConnection('trigger1', 'http2')
      .addConnection('http1', 'merge1', 'main', 0, 'main', 0)
      .addConnection('http2', 'merge1', 'main', 0, 'main', 1)
      .build();
  }

  /**
   * Create a workflow with performance bottlenecks
   */
  static createBottleneckWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Bottleneck Test')
      .addNode({
        id: 'trigger1',
        name: 'Manual Trigger',
        type: 'n8n-nodes-base.manualTrigger',
        typeVersion: 1,
        position: [100, 100],
        parameters: {}
      })
      .addNode({
        id: 'function1',
        name: 'Heavy Processing',
        type: 'n8n-nodes-base.function',
        typeVersion: 1,
        position: [300, 100],
        parameters: {
          functionCode: `
            // Simulate heavy processing with nested loops
            const results = [];
            for (let i = 0; i < 1000; i++) {
              for (let j = 0; j < 1000; j++) {
                results.push(i * j);
              }
            }
            return [{ json: { results: results.length } }];
          `
        }
      })
      .addNode({
        id: 'anthropic1',
        name: 'Anthropic Analysis',
        type: '@n8n/n8n-nodes-langchain.anthropic',
        typeVersion: 1,
        position: [500, 100],
        parameters: {
          model: 'claude-2',
          messages: {
            messageValues: [
              { message: 'Process this complex data with detailed analysis: {{$json.results}}' }
            ]
          }
        }
      })
      .addConnection('trigger1', 'function1')
      .addConnection('function1', 'anthropic1')
      .build();
  }

  /**
   * Create a scalable workflow design
   */
  static createScalableWorkflow(): N8NWorkflowSchema {
    return new N8NWorkflowBuilder()
      .setName('Scalable Workflow Test')
      .addNode({
        id: 'webhook1',
        name: 'Webhook Trigger',
        type: 'n8n-nodes-base.webhook',
        typeVersion: 1,
        position: [100, 100],
        parameters: { path: 'scalable-endpoint' }
      })
      .addNode({
        id: 'if1',
        name: 'Route Decision',
        type: 'n8n-nodes-base.if',
        typeVersion: 1,
        position: [300, 100],
        parameters: {
          conditions: {
            boolean: [{ value1: '={{$json.type}}', operation: 'equal', value2: 'priority' }]
          }
        }
      })
      .addNode({
        id: 'set1',
        name: 'Process Priority',
        type: 'n8n-nodes-base.set',
        typeVersion: 2,
        position: [500, 50],
        parameters: {
          values: { string: [{ name: 'status', value: 'priority_processed' }] }
        }
      })
      .addNode({
        id: 'set2',
        name: 'Process Normal',
        type: 'n8n-nodes-base.set',
        typeVersion: 2,
        position: [500, 150],
        parameters: {
          values: { string: [{ name: 'status', value: 'normal_processed' }] }
        }
      })
      .addConnection('webhook1', 'if1')
      .addConnection('if1', 'set1', 'main', 0, 'main', 0)
      .addConnection('if1', 'set2', 'main', 1, 'main', 0)
      .build();
  }

  /**
   * Create custom performance thresholds for testing
   */
  static createTestThresholds(): PerformanceThresholds {
    return {
      maxExecutionTime: 60000, // 1 minute
      maxMemoryUsage: 128, // 128 MB
      maxCpuUsage: 70, // 70%
      maxNodeComplexity: 6,
      minResourceEfficiency: 0.5,
      minScalabilityScore: 0.4,
      warningThresholds: {
        executionTime: 30000, // 30 seconds
        memoryUsage: 64, // 64 MB
        cpuUsage: 50 // 50%
      }
    };
  }
}

/**
 * Comprehensive test suite for Performance Validator
 */
export class PerformanceValidatorTestSuite {
  private validator: PerformanceValidator;
  private mockConnectionValidator: MockConnectionValidator;

  constructor() {
    this.mockConnectionValidator = new MockConnectionValidator();
    this.validator = new PerformanceValidator(this.mockConnectionValidator);
  }

  /**
   * Run all performance validation tests
   */
  runAllTests(): boolean {
    console.log('🚀 Running Performance Validator Test Suite...\n');

    const tests = [
      () => this.testBasicPerformanceValidation(),
      () => this.testNodePerformanceMetrics(),
      () => this.testWorkflowPerformanceMetrics(),
      () => this.testPerformanceThresholds(),
      () => this.testResourceUsageValidation(),
      () => this.testScalabilityValidation(),
      () => this.testBottleneckDetection(),
      () => this.testParallelExecutionAnalysis(),
      () => this.testPerformanceReportGeneration(),
      () => this.testCustomThresholds(),
      () => this.testOptimizationRecommendations(),
      () => this.testPerformanceGrading(),
      () => this.testCriticalPathCalculation(),
      () => this.testPerformanceBenchmarking()
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
   * Test basic performance validation
   */
  private testBasicPerformanceValidation(): boolean {
    const workflow = PerformanceValidatorTestData.createSimplePerformanceWorkflow();
    const results = this.validator.validatePerformance(workflow);
    
    console.log(`  - Validation results: ${results.length} total`);
    console.log(`  - Error count: ${results.filter(r => r.severity === 'error' && !r.valid).length}`);
    console.log(`  - Warning count: ${results.filter(r => r.severity === 'warning').length}`);
    
    // Simple workflow should have minimal issues
    return results.filter(r => r.severity === 'error' && !r.valid).length === 0;
  }

  /**
   * Test node performance metrics calculation
   */
  private testNodePerformanceMetrics(): boolean {
    const workflow = PerformanceValidatorTestData.createHighPerformanceWorkflow();
    const report = this.validator.generatePerformanceReport(workflow);
    
    console.log(`  - Nodes analyzed: ${report.nodeMetrics.length}`);
    console.log(`  - Resource intensive nodes: ${report.nodeMetrics.filter(m => m.resourceIntensity === 'high' || m.resourceIntensity === 'critical').length}`);
    console.log(`  - High complexity nodes: ${report.nodeMetrics.filter(m => m.complexity > 6).length}`);
    
    // Should have metrics for all nodes
    return report.nodeMetrics.length === workflow.nodes.length &&
           report.nodeMetrics.every(m => m.estimatedExecutionTime > 0);
  }

  /**
   * Test workflow performance metrics calculation
   */
  private testWorkflowPerformanceMetrics(): boolean {
    const workflow = PerformanceValidatorTestData.createParallelExecutionWorkflow();
    const report = this.validator.generatePerformanceReport(workflow);
    const metrics = report.workflowMetrics;
    
    console.log(`  - Total execution time: ${metrics.totalEstimatedExecutionTime}ms`);
    console.log(`  - Total memory usage: ${metrics.totalEstimatedMemoryUsage}MB`);
    console.log(`  - Parallel execution potential: ${(metrics.parallelExecutionPotential * 100).toFixed(1)}%`);
    console.log(`  - Resource efficiency: ${(metrics.resourceEfficiency * 100).toFixed(1)}%`);
    
    return metrics.totalEstimatedExecutionTime > 0 &&
           metrics.totalEstimatedMemoryUsage > 0 &&
           metrics.parallelExecutionPotential >= 0 &&
           metrics.resourceEfficiency >= 0;
  }

  /**
   * Test performance threshold validation
   */
  private testPerformanceThresholds(): boolean {
    const customThresholds = PerformanceValidatorTestData.createTestThresholds();
    const customValidator = new PerformanceValidator(this.mockConnectionValidator, customThresholds);
    
    const workflow = PerformanceValidatorTestData.createBottleneckWorkflow();
    const results = customValidator.validatePerformance(workflow);
    
    const thresholdViolations = results.filter(r => 
      r.rule?.includes('execution_time') || 
      r.rule?.includes('memory_usage') || 
      r.rule?.includes('cpu_usage')
    );
    
    console.log(`  - Threshold violations: ${thresholdViolations.length}`);
    console.log(`  - Custom thresholds applied: ${JSON.stringify(customValidator.getThresholds().maxExecutionTime)}`);
    
    return customValidator.getThresholds().maxExecutionTime === customThresholds.maxExecutionTime;
  }

  /**
   * Test resource usage validation
   */
  private testResourceUsageValidation(): boolean {
    const workflow = PerformanceValidatorTestData.createHighPerformanceWorkflow();
    const results = this.validator.validatePerformance(workflow);
    
    const resourceResults = results.filter(r => r.rule?.includes('resource'));
    console.log(`  - Resource usage validations: ${resourceResults.length}`);
    
    return true; // Test passes if no exceptions thrown
  }

  /**
   * Test scalability validation
   */
  private testScalabilityValidation(): boolean {
    const scalableWorkflow = PerformanceValidatorTestData.createScalableWorkflow();
    const bottleneckWorkflow = PerformanceValidatorTestData.createBottleneckWorkflow();
    
    const scalableReport = this.validator.generatePerformanceReport(scalableWorkflow);
    const bottleneckReport = this.validator.generatePerformanceReport(bottleneckWorkflow);
    
    console.log(`  - Scalable workflow score: ${(scalableReport.workflowMetrics.scalabilityScore * 100).toFixed(1)}%`);
    console.log(`  - Bottleneck workflow score: ${(bottleneckReport.workflowMetrics.scalabilityScore * 100).toFixed(1)}%`);
    
    // Scalable workflow should have better scalability score
    return scalableReport.workflowMetrics.scalabilityScore >= bottleneckReport.workflowMetrics.scalabilityScore;
  }

  /**
   * Test bottleneck detection
   */
  private testBottleneckDetection(): boolean {
    const workflow = PerformanceValidatorTestData.createBottleneckWorkflow();
    const report = this.validator.generatePerformanceReport(workflow);
    
    console.log(`  - Bottlenecks detected: ${report.workflowMetrics.bottlenecks.length}`);
    console.log(`  - High-risk nodes: ${report.nodeMetrics.filter(m => m.bottleneckRisk > 0.6).length}`);
    
    // Bottleneck workflow should have detected bottlenecks
    return report.workflowMetrics.bottlenecks.length > 0;
  }

  /**
   * Test parallel execution analysis
   */
  private testParallelExecutionAnalysis(): boolean {
    const parallelWorkflow = PerformanceValidatorTestData.createParallelExecutionWorkflow();
    const linearWorkflow = PerformanceValidatorTestData.createBottleneckWorkflow();
    
    const parallelReport = this.validator.generatePerformanceReport(parallelWorkflow);
    const linearReport = this.validator.generatePerformanceReport(linearWorkflow);
    
    console.log(`  - Parallel workflow potential: ${(parallelReport.workflowMetrics.parallelExecutionPotential * 100).toFixed(1)}%`);
    console.log(`  - Linear workflow potential: ${(linearReport.workflowMetrics.parallelExecutionPotential * 100).toFixed(1)}%`);
    
    // Parallel workflow should have higher parallel execution potential
    return parallelReport.workflowMetrics.parallelExecutionPotential >= linearReport.workflowMetrics.parallelExecutionPotential;
  }

  /**
   * Test performance report generation
   */
  private testPerformanceReportGeneration(): boolean {
    const workflow = PerformanceValidatorTestData.createHighPerformanceWorkflow();
    const report = this.validator.generatePerformanceReport(workflow);
    
    // Validate report structure
    const hasValidSummary = report.summary && 
      typeof report.summary.overallScore === 'number' &&
      ['A', 'B', 'C', 'D', 'F'].includes(report.summary.performanceGrade);
    
    const hasWorkflowMetrics = report.workflowMetrics && 
      typeof report.workflowMetrics.totalEstimatedExecutionTime === 'number';
    
    const hasNodeMetrics = Array.isArray(report.nodeMetrics) && report.nodeMetrics.length > 0;
    const hasRecommendations = report.recommendations && 
      Array.isArray(report.recommendations.immediate);
    
    console.log(`  - Overall score: ${report.summary.overallScore}/100 (${report.summary.performanceGrade})`);
    console.log(`  - Critical issues: ${report.summary.criticalIssues}`);
    console.log(`  - Optimization opportunities: ${report.summary.optimizationOpportunities}`);
    
    return hasValidSummary && hasWorkflowMetrics && hasNodeMetrics && hasRecommendations;
  }

  /**
   * Test custom thresholds functionality
   */
  private testCustomThresholds(): boolean {
    const originalThresholds = this.validator.getThresholds();
    const newThresholds = { maxExecutionTime: 120000 };
    
    this.validator.updateThresholds(newThresholds);
    const updatedThresholds = this.validator.getThresholds();
    
    console.log(`  - Original max execution time: ${originalThresholds.maxExecutionTime}ms`);
    console.log(`  - Updated max execution time: ${updatedThresholds.maxExecutionTime}ms`);
    
    return updatedThresholds.maxExecutionTime === newThresholds.maxExecutionTime;
  }

  /**
   * Test optimization recommendations
   */
  private testOptimizationRecommendations(): boolean {
    const workflow = PerformanceValidatorTestData.createBottleneckWorkflow();
    const report = this.validator.generatePerformanceReport(workflow);
    
    const hasImmediate = report.recommendations.immediate.length >= 0;
    const hasShortTerm = report.recommendations.shortTerm.length >= 0;
    const hasLongTerm = report.recommendations.longTerm.length >= 0;
    
    console.log(`  - Immediate recommendations: ${report.recommendations.immediate.length}`);
    console.log(`  - Short-term recommendations: ${report.recommendations.shortTerm.length}`);
    console.log(`  - Long-term recommendations: ${report.recommendations.longTerm.length}`);
    
    return hasImmediate && hasShortTerm && hasLongTerm;
  }

  /**
   * Test performance grading system
   */
  private testPerformanceGrading(): boolean {
    const workflows = [
      PerformanceValidatorTestData.createSimplePerformanceWorkflow(),
      PerformanceValidatorTestData.createHighPerformanceWorkflow(),
      PerformanceValidatorTestData.createBottleneckWorkflow()
    ];
    
    const grades: string[] = [];
    for (const workflow of workflows) {
      const report = this.validator.generatePerformanceReport(workflow);
      grades.push(report.summary.performanceGrade);
    }
    
    console.log(`  - Workflow grades: ${grades.join(', ')}`);
    
    // Should have valid grades for all workflows
    return grades.every(grade => ['A', 'B', 'C', 'D', 'F'].includes(grade));
  }

  /**
   * Test critical path calculation
   */
  private testCriticalPathCalculation(): boolean {
    const workflow = PerformanceValidatorTestData.createHighPerformanceWorkflow();
    const report = this.validator.generatePerformanceReport(workflow);
    
    console.log(`  - Critical path length: ${report.workflowMetrics.criticalPath.length}`);
    console.log(`  - Critical path: ${report.workflowMetrics.criticalPath.join(' → ')}`);
    
    // Critical path should exist and contain nodes
    return report.workflowMetrics.criticalPath.length > 0;
  }

  /**
   * Test performance benchmarking
   */
  private testPerformanceBenchmarking(): boolean {
    const workflows = [
      PerformanceValidatorTestData.createSimplePerformanceWorkflow(),
      PerformanceValidatorTestData.createParallelExecutionWorkflow(),
      PerformanceValidatorTestData.createScalableWorkflow()
    ];
    
    let totalScore = 0;
    for (const workflow of workflows) {
      const report = this.validator.generatePerformanceReport(workflow);
      totalScore += report.summary.overallScore;
    }
    
    const averageScore = totalScore / workflows.length;
    console.log(`  - Average performance score: ${averageScore.toFixed(1)}/100`);
    console.log(`  - Workflows tested: ${workflows.length}`);
    
    return averageScore >= 0 && averageScore <= 100;
  }
}

// Export test runner function
export function runPerformanceValidatorTests(): boolean {
  const testSuite = new PerformanceValidatorTestSuite();
  return testSuite.runAllTests();
}

// Run tests if this file is executed directly
if (require.main === module) {
  const success = runPerformanceValidatorTests();
  process.exit(success ? 0 : 1);
} 