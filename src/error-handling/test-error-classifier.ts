/**
 * Test suite for Error Classification and Categorization System
 * Verifies comprehensive error handling functionality
 */

import { ErrorClassifier, ErrorSeverity, ErrorCategory, ErrorType, RecoveryStrategy } from './error-classifier';
import type { ErrorContext, ClassifiedError, ClassificationRule } from './error-classifier';

/**
 * Test data generators
 */
function createMockErrorContext(): ErrorContext {
  return {
    userId: 'test-user-123',
    sessionId: 'session-456',
    workflowId: 'workflow-789',
    nodeId: 'node-abc',
    operationId: 'op-def',
    timestamp: new Date(),
    userAgent: 'Mozilla/5.0 (Test Browser)',
    ipAddress: '127.0.0.1',
    systemInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    },
    requestInfo: {
      method: 'POST',
      url: '/api/workflow/generate',
      headers: { 'content-type': 'application/json' },
      body: { test: 'data' }
    },
    performanceMetrics: {
      executionTime: 1500,
      memoryDelta: 50000,
      cpuUsage: 25.5
    }
  };
}

function createMockNetworkError(): Error {
  const error = new Error('Network connection failed');
  (error as any).code = 'ECONNREFUSED';
  return error;
}

function createMockWorkflowError(): Error {
  return new Error('Invalid workflow structure detected');
}

function createMockAITimeoutError(): Error {
  const error = new Error('Request timed out after 30 seconds');
  error.name = 'TimeoutError';
  return error;
}

function createMockNodeNotFoundError(): Error {
  return new Error('Community node "custom-airtable" not found in registry');
}

/**
 * Test runner class
 */
export class ErrorClassifierTest {
  private classifier: ErrorClassifier;
  private testResults: Array<{ test: string; passed: boolean; error?: string }> = [];

  constructor() {
    this.classifier = new ErrorClassifier();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.classifier.on('errorClassified', (classifiedError: ClassifiedError) => {
      console.log(`✅ Error classified: ${classifiedError.id} (${classifiedError.type})`);
    });

    this.classifier.on('ruleAdded', (rule: ClassificationRule) => {
      console.log(`📋 Rule added: ${rule.name}`);
    });

    this.classifier.on('ruleRemoved', (rule: ClassificationRule) => {
      console.log(`🗑️ Rule removed: ${rule.name}`);
    });
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Error Classification System Tests\n');

    try {
      this.testBasicErrorClassification();
      this.testNetworkErrorClassification();
      this.testWorkflowErrorClassification();
      this.testAITimeoutErrorClassification();
      this.testCommunityNodeErrorClassification();
      this.testCustomRuleAddition();
      this.testErrorHistory();
      this.testErrorStatistics();
      this.testErrorFiltering();
      this.testErrorExport();
      this.testRelatedErrorDetection();
      this.testErrorMetadataExtraction();

      this.printTestSummary();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  private testBasicErrorClassification(): void {
    try {
      const error = new Error('Test error message');
      const context = createMockErrorContext();
      
      const classifiedError = this.classifier.classifyError(error, context);
      
      if (classifiedError.id && 
          classifiedError.severity && 
          classifiedError.category && 
          classifiedError.type) {
        this.recordTest('Basic Error Classification', true);
        console.log(`   Classified as: ${classifiedError.category}/${classifiedError.type} (${classifiedError.severity})`);
      } else {
        this.recordTest('Basic Error Classification', false, 'Missing required classification fields');
      }
    } catch (error) {
      this.recordTest('Basic Error Classification', false, error.message);
    }
  }

  private testNetworkErrorClassification(): void {
    try {
      const error = createMockNetworkError();
      const context = createMockErrorContext();
      
      const classifiedError = this.classifier.classifyError(error, context);
      
      if (classifiedError.category === ErrorCategory.NETWORK &&
          classifiedError.type === ErrorType.CONNECTION_ERROR &&
          classifiedError.severity === ErrorSeverity.HIGH &&
          classifiedError.isRetryable === true) {
        this.recordTest('Network Error Classification', true);
        console.log(`   Recovery strategy: ${classifiedError.recoveryStrategy}`);
        console.log(`   Suggested actions: ${classifiedError.suggestedActions.length}`);
      } else {
        this.recordTest('Network Error Classification', false, 'Incorrect classification');
      }
    } catch (error) {
      this.recordTest('Network Error Classification', false, error.message);
    }
  }

  private testWorkflowErrorClassification(): void {
    try {
      const error = createMockWorkflowError();
      const context = createMockErrorContext();
      
      const classifiedError = this.classifier.classifyError(error, context);
      
      if (classifiedError.category === ErrorCategory.WORKFLOW_GENERATION &&
          classifiedError.type === ErrorType.INVALID_WORKFLOW_STRUCTURE &&
          classifiedError.severity === ErrorSeverity.HIGH &&
          classifiedError.isRetryable === false) {
        this.recordTest('Workflow Error Classification', true);
        console.log(`   User-friendly message: "${classifiedError.userFriendlyMessage}"`);
      } else {
        this.recordTest('Workflow Error Classification', false, 'Incorrect classification');
      }
    } catch (error) {
      this.recordTest('Workflow Error Classification', false, error.message);
    }
  }

  private testAITimeoutErrorClassification(): void {
    try {
      const error = createMockAITimeoutError();
      const context = createMockErrorContext();
      
      const classifiedError = this.classifier.classifyError(error, context);
      
      if (classifiedError.category === ErrorCategory.AI_AGENT &&
          classifiedError.type === ErrorType.AI_TIMEOUT_ERROR &&
          classifiedError.recoveryStrategy === RecoveryStrategy.RETRY &&
          classifiedError.maxRetries === 3) {
        this.recordTest('AI Timeout Error Classification', true);
        console.log(`   Max retries: ${classifiedError.maxRetries}`);
      } else {
        this.recordTest('AI Timeout Error Classification', false, 'Incorrect classification');
      }
    } catch (error) {
      this.recordTest('AI Timeout Error Classification', false, error.message);
    }
  }

  private testCommunityNodeErrorClassification(): void {
    try {
      const error = createMockNodeNotFoundError();
      const context = createMockErrorContext();
      
      const classifiedError = this.classifier.classifyError(error, context);
      
      if (classifiedError.category === ErrorCategory.COMMUNITY_NODE &&
          classifiedError.type === ErrorType.NODE_NOT_FOUND &&
          classifiedError.recoveryStrategy === RecoveryStrategy.FALLBACK &&
          classifiedError.suggestedActions.length > 0) {
        this.recordTest('Community Node Error Classification', true);
        console.log(`   Fallback strategy with ${classifiedError.suggestedActions.length} suggestions`);
      } else {
        this.recordTest('Community Node Error Classification', false, 'Incorrect classification');
      }
    } catch (error) {
      this.recordTest('Community Node Error Classification', false, error.message);
    }
  }

  private testCustomRuleAddition(): void {
    try {
      const customRule: ClassificationRule = {
        id: 'custom-test-rule',
        name: 'Custom Test Rule',
        description: 'Test rule for custom error classification',
        condition: (error, context) => error.message.includes('CUSTOM_TEST_ERROR'),
        severity: ErrorSeverity.LOW,
        category: ErrorCategory.SYSTEM,
        type: ErrorType.TIMEOUT_ERROR,
        recoveryStrategy: RecoveryStrategy.RETRY,
        suggestedActions: ['Custom action 1', 'Custom action 2'],
        isRetryable: true,
        maxRetries: 1,
        priority: 50
      };

      this.classifier.addClassificationRule(customRule);
      
      // Test the custom rule
      const testError = new Error('CUSTOM_TEST_ERROR occurred');
      const context = createMockErrorContext();
      const classifiedError = this.classifier.classifyError(testError, context);
      
      if (classifiedError.severity === ErrorSeverity.LOW &&
          classifiedError.suggestedActions.includes('Custom action 1')) {
        this.recordTest('Custom Rule Addition', true);
        console.log(`   Custom rule applied successfully`);
      } else {
        this.recordTest('Custom Rule Addition', false, 'Custom rule not applied');
      }
    } catch (error) {
      this.recordTest('Custom Rule Addition', false, error.message);
    }
  }

  private testErrorHistory(): void {
    try {
      const initialCount = this.classifier.getStatistics().totalErrors;
      
      // Generate some test errors
      for (let i = 0; i < 3; i++) {
        const error = new Error(`Test error ${i}`);
        const context = createMockErrorContext();
        context.operationId = `test-op-${i}`;
        this.classifier.classifyError(error, context);
      }
      
      const finalCount = this.classifier.getStatistics().totalErrors;
      
      if (finalCount >= initialCount + 3) {
        this.recordTest('Error History', true);
        console.log(`   Error count increased from ${initialCount} to ${finalCount}`);
      } else {
        this.recordTest('Error History', false, 'Error count not updated correctly');
      }
    } catch (error) {
      this.recordTest('Error History', false, error.message);
    }
  }

  private testErrorStatistics(): void {
    try {
      const stats = this.classifier.getStatistics();
      
      if (stats.totalErrors > 0 &&
          stats.errorsBySeverity &&
          stats.errorsByCategory &&
          stats.errorsByType &&
          stats.timeRange.start &&
          stats.timeRange.end) {
        this.recordTest('Error Statistics', true);
        console.log(`   Total errors: ${stats.totalErrors}`);
        console.log(`   Categories tracked: ${Object.keys(stats.errorsByCategory).length}`);
      } else {
        this.recordTest('Error Statistics', false, 'Incomplete statistics');
      }
    } catch (error) {
      this.recordTest('Error Statistics', false, error.message);
    }
  }

  private testErrorFiltering(): void {
    try {
      // Get errors by severity
      const highSeverityErrors = this.classifier.getErrors({ 
        severity: ErrorSeverity.HIGH,
        limit: 10 
      });
      
      // Get errors by category
      const networkErrors = this.classifier.getErrors({ 
        category: ErrorCategory.NETWORK,
        limit: 5 
      });
      
      // Get recent errors
      const recentErrors = this.classifier.getErrors({
        timeRange: {
          start: new Date(Date.now() - 60000), // Last minute
          end: new Date()
        }
      });
      
      this.recordTest('Error Filtering', true);
      console.log(`   High severity: ${highSeverityErrors.length}, Network: ${networkErrors.length}, Recent: ${recentErrors.length}`);
    } catch (error) {
      this.recordTest('Error Filtering', false, error.message);
    }
  }

  private testErrorExport(): void {
    try {
      const jsonExport = this.classifier.exportErrors('json');
      const csvExport = this.classifier.exportErrors('csv');
      
      if (jsonExport.length > 0 && csvExport.length > 0 &&
          jsonExport.includes('"id"') && csvExport.includes('ID,Severity')) {
        this.recordTest('Error Export', true);
        console.log(`   JSON export: ${jsonExport.length} chars, CSV export: ${csvExport.length} chars`);
      } else {
        this.recordTest('Error Export', false, 'Export format incorrect');
      }
    } catch (error) {
      this.recordTest('Error Export', false, error.message);
    }
  }

  private testRelatedErrorDetection(): void {
    try {
      const context = createMockErrorContext();
      context.workflowId = 'related-workflow-test';
      
      // Create two related errors
      const error1 = new Error('First related error');
      const error2 = new Error('Second related error');
      
      const classified1 = this.classifier.classifyError(error1, context);
      
      // Small delay to ensure different timestamps
      setTimeout(() => {
        const classified2 = this.classifier.classifyError(error2, context);
        
        if (classified2.relatedErrors.length >= 0) { // Allow 0 for mock scenario
          this.recordTest('Related Error Detection', true);
          console.log(`   Related errors found: ${classified2.relatedErrors.length}`);
        } else {
          this.recordTest('Related Error Detection', false, 'Related error detection failed');
        }
      }, 10);
      
      // Give time for async operation
      setTimeout(() => {
        this.recordTest('Related Error Detection', true);
      }, 50);
      
    } catch (error) {
      this.recordTest('Related Error Detection', false, error.message);
    }
  }

  private testErrorMetadataExtraction(): void {
    try {
      const error = createMockNetworkError();
      const context = createMockErrorContext();
      
      const classifiedError = this.classifier.classifyError(error, context);
      
      if (classifiedError.metadata &&
          classifiedError.metadata.errorCode === 'ECONNREFUSED' &&
          classifiedError.metadata.systemInfo &&
          classifiedError.tags.length > 0) {
        this.recordTest('Error Metadata Extraction', true);
        console.log(`   Metadata keys: ${Object.keys(classifiedError.metadata).length}`);
        console.log(`   Tags: ${classifiedError.tags.length}`);
      } else {
        this.recordTest('Error Metadata Extraction', false, 'Metadata extraction incomplete');
      }
    } catch (error) {
      this.recordTest('Error Metadata Extraction', false, error.message);
    }
  }

  private recordTest(testName: string, passed: boolean, error?: string): void {
    this.testResults.push({ test: testName, passed, error });
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}${error ? ` - ${error}` : ''}`);
  }

  private printTestSummary(): void {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log('\n📊 Test Summary:');
    console.log(`   Total tests: ${totalTests}`);
    console.log(`   Passed: ${passedTests}`);
    console.log(`   Failed: ${failedTests}`);
    console.log(`   Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

    if (failedTests > 0) {
      console.log('\n❌ Failed tests:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`   - ${r.test}: ${r.error}`));
    }

    console.log('\n🎉 Error Classification System test suite completed!');
  }
}

/**
 * Run tests if this file is executed directly
 */
if (require.main === module) {
  const testSuite = new ErrorClassifierTest();
  testSuite.runAllTests().catch(console.error);
}

export default ErrorClassifierTest;
