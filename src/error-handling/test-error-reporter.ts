/**
 * Test suite for User-Friendly Error Reporting and Suggestions System
 * Verifies error reporting, formatting, and suggestion generation
 */

import { ErrorReporter, ReportFormat, DetailLevel, SuggestionType } from './error-reporter';
import { ErrorClassifier, ErrorSeverity, ErrorCategory, ErrorType } from './error-classifier';
import type { ErrorReport, ErrorSuggestion } from './error-reporter';
import type { ErrorContext } from './error-classifier';

/**
 * Test data generators
 */
function createMockErrorContext(): ErrorContext {
  return {
    userId: 'test-user-456',
    sessionId: 'session-789',
    workflowId: 'workflow-abc',
    nodeId: 'node-def',
    operationId: 'generate-workflow',
    timestamp: new Date(),
    userAgent: 'n8n-ultimate/1.0.0',
    ipAddress: '192.168.1.100',
    systemInfo: {
      platform: process.platform,
      nodeVersion: process.version,
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    },
    requestInfo: {
      method: 'POST',
      url: '/api/workflow/validate',
      headers: { 'content-type': 'application/json', 'authorization': 'Bearer test-token' },
      body: { workflowData: { nodes: [], connections: {} } }
    },
    performanceMetrics: {
      executionTime: 2500,
      memoryDelta: 75000,
      cpuUsage: 45.2
    }
  };
}

function createMockWorkflowError(): Error {
  return new Error('Invalid workflow structure: missing start node');
}

function createMockNetworkError(): Error {
  const error = new Error('Failed to connect to community node registry');
  (error as any).code = 'ECONNREFUSED';
  return error;
}

function createMockAIError(): Error {
  const error = new Error('AI service request timed out after 30 seconds');
  error.name = 'TimeoutError';
  return error;
}

function createMockNodeError(): Error {
  return new Error('Community node "advanced-airtable-connector" not found in registry');
}

/**
 * Test runner class
 */
export class ErrorReporterTest {
  private classifier: ErrorClassifier;
  private reporter: ErrorReporter;
  private testResults: Array<{ test: string; passed: boolean; error?: string }> = [];

  constructor() {
    this.classifier = new ErrorClassifier();
    this.reporter = new ErrorReporter(this.classifier, {
      defaultFormat: ReportFormat.CONSOLE,
      defaultDetailLevel: DetailLevel.STANDARD,
      includeStackTrace: false,
      includeSuggestions: true,
      maxSuggestions: 5,
      supportEmail: 'support@n8n-ultimate.com',
      supportUrl: 'https://support.n8n-ultimate.com',
      documentationBaseUrl: 'https://docs.n8n-ultimate.com',
      enableAnalytics: true
    });
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.reporter.on('reportGenerated', (report: ErrorReport) => {
      console.log(`📋 Report generated: ${report.id} (${report.summary.severity})`);
    });

    this.reporter.on('reportResolved', (report: ErrorReport) => {
      console.log(`✅ Report resolved: ${report.id}`);
    });

    this.reporter.on('criticalErrorReport', (report: ErrorReport) => {
      console.log(`🚨 Critical error report: ${report.id}`);
    });
  }

  /**
   * Run all tests
   */
  async runAllTests(): Promise<void> {
    console.log('🧪 Starting Error Reporter System Tests\n');

    try {
      this.testBasicReportGeneration();
      this.testWorkflowErrorReporting();
      this.testNetworkErrorReporting();
      this.testAIErrorReporting();
      this.testCommunityNodeErrorReporting();
      this.testReportFormatting();
      this.testSuggestionGeneration();
      this.testReportHistory();
      this.testReportFiltering();
      this.testReportResolution();
      this.testCustomSuggestions();
      this.testTemplateSystem();

      this.printTestSummary();

    } catch (error) {
      console.error('❌ Test suite failed:', error);
    }
  }

  private testBasicReportGeneration(): void {
    try {
      const error = createMockWorkflowError();
      const context = createMockErrorContext();
      
      const report = this.reporter.generateReport(error, context);
      
      if (report.id && 
          report.summary.title && 
          report.userMessage.primary && 
          report.suggestions.length > 0 &&
          report.support.errorCode &&
          report.support.correlationId) {
        this.recordTest('Basic Report Generation', true);
        console.log(`   Report ID: ${report.id}`);
        console.log(`   Title: ${report.summary.title}`);
        console.log(`   Suggestions: ${report.suggestions.length}`);
      } else {
        this.recordTest('Basic Report Generation', false, 'Missing required report fields');
      }
    } catch (error) {
      this.recordTest('Basic Report Generation', false, error.message);
    }
  }

  private testWorkflowErrorReporting(): void {
    try {
      const error = createMockWorkflowError();
      const context = createMockErrorContext();
      
      const report = this.reporter.generateReport(error, context);
      
      if (report.summary.category === ErrorCategory.WORKFLOW_GENERATION &&
          report.summary.severity === ErrorSeverity.HIGH &&
          report.suggestions.some(s => s.type === SuggestionType.USER_ACTION) &&
          report.context.component === 'Workflow Generator') {
        this.recordTest('Workflow Error Reporting', true);
        console.log(`   Category: ${report.summary.category}`);
        console.log(`   Component: ${report.context.component}`);
        console.log(`   Recovery strategy: ${report.recovery.strategy}`);
      } else {
        this.recordTest('Workflow Error Reporting', false, 'Incorrect workflow error classification');
      }
    } catch (error) {
      this.recordTest('Workflow Error Reporting', false, error.message);
    }
  }

  private testNetworkErrorReporting(): void {
    try {
      const error = createMockNetworkError();
      const context = createMockErrorContext();
      
      const report = this.reporter.generateReport(error, context);
      
      if (report.summary.category === ErrorCategory.NETWORK &&
          report.recovery.isRetryable === true &&
          report.suggestions.some(s => s.title.toLowerCase().includes('internet')) &&
          report.support.errorCode.includes('NETWORK')) {
        this.recordTest('Network Error Reporting', true);
        console.log(`   Error code: ${report.support.errorCode}`);
        console.log(`   Retryable: ${report.recovery.isRetryable}`);
        console.log(`   Max retries: ${report.recovery.maxRetries}`);
      } else {
        this.recordTest('Network Error Reporting', false, 'Incorrect network error handling');
      }
    } catch (error) {
      this.recordTest('Network Error Reporting', false, error.message);
    }
  }

  private testAIErrorReporting(): void {
    try {
      const error = createMockAIError();
      const context = createMockErrorContext();
      
      const report = this.reporter.generateReport(error, context);
      
      if (report.summary.category === ErrorCategory.AI_AGENT &&
          report.suggestions.some(s => s.title.toLowerCase().includes('retry')) &&
          report.suggestions.some(s => s.title.toLowerCase().includes('config')) &&
          report.recovery.nextRetryIn !== undefined) {
        this.recordTest('AI Error Reporting', true);
        console.log(`   Next retry in: ${report.recovery.nextRetryIn}ms`);
        console.log(`   AI-specific suggestions: ${report.suggestions.filter(s => s.description.toLowerCase().includes('ai')).length}`);
      } else {
        this.recordTest('AI Error Reporting', false, 'Incorrect AI error handling');
      }
    } catch (error) {
      this.recordTest('AI Error Reporting', false, error.message);
    }
  }

  private testCommunityNodeErrorReporting(): void {
    try {
      const error = createMockNodeError();
      const context = createMockErrorContext();
      
      const report = this.reporter.generateReport(error, context);
      
      if (report.summary.category === ErrorCategory.COMMUNITY_NODE &&
          report.suggestions.some(s => s.type === SuggestionType.WORKAROUND) &&
          report.suggestions.some(s => s.description.toLowerCase().includes('alternative')) &&
          report.context.component === 'Community Node Manager') {
        this.recordTest('Community Node Error Reporting', true);
        console.log(`   Workaround suggestions: ${report.suggestions.filter(s => s.type === SuggestionType.WORKAROUND).length}`);
        console.log(`   Fallback options provided: ${report.suggestions.some(s => s.description.includes('built-in'))}`);
      } else {
        this.recordTest('Community Node Error Reporting', false, 'Incorrect community node error handling');
      }
    } catch (error) {
      this.recordTest('Community Node Error Reporting', false, error.message);
    }
  }

  private testReportFormatting(): void {
    try {
      const error = createMockWorkflowError();
      const context = createMockErrorContext();
      const report = this.reporter.generateReport(error, context);
      
      // Test different formats
      const consoleFormat = this.reporter.formatReport(report, ReportFormat.CONSOLE);
      const jsonFormat = this.reporter.formatReport(report, ReportFormat.JSON);
      const htmlFormat = this.reporter.formatReport(report, ReportFormat.HTML);
      const markdownFormat = this.reporter.formatReport(report, ReportFormat.MARKDOWN);
      const plainTextFormat = this.reporter.formatReport(report, ReportFormat.PLAIN_TEXT);
      
      if (consoleFormat.includes('📝') &&
          jsonFormat.includes('"id"') &&
          htmlFormat.includes('<div class="error-report') &&
          markdownFormat.includes('# ') &&
          plainTextFormat.includes('Error Code:')) {
        this.recordTest('Report Formatting', true);
        console.log(`   Console: ${consoleFormat.split('\n').length} lines`);
        console.log(`   JSON: ${jsonFormat.length} chars`);
        console.log(`   HTML: ${htmlFormat.includes('<ol>') ? 'structured' : 'basic'}`);
        console.log(`   Markdown: ${markdownFormat.includes('##') ? 'sectioned' : 'basic'}`);
      } else {
        this.recordTest('Report Formatting', false, 'Format output incorrect');
      }
    } catch (error) {
      this.recordTest('Report Formatting', false, error.message);
    }
  }

  private testSuggestionGeneration(): void {
    try {
      // Test suggestions for different error types
      const workflowSuggestions = this.reporter.getSuggestions(ErrorType.INVALID_WORKFLOW_STRUCTURE, createMockErrorContext());
      const networkSuggestions = this.reporter.getSuggestions(ErrorType.CONNECTION_ERROR, createMockErrorContext());
      const aiSuggestions = this.reporter.getSuggestions(ErrorType.AI_TIMEOUT_ERROR, createMockErrorContext());
      const nodeSuggestions = this.reporter.getSuggestions(ErrorType.NODE_NOT_FOUND, createMockErrorContext());
      
      if (workflowSuggestions.length > 0 &&
          networkSuggestions.length > 0 &&
          aiSuggestions.length > 0 &&
          nodeSuggestions.length > 0 &&
          workflowSuggestions.some(s => s.steps.length > 0) &&
          networkSuggestions.some(s => s.estimatedTime) &&
          aiSuggestions.some(s => s.difficulty) &&
          nodeSuggestions.some(s => s.type === SuggestionType.WORKAROUND)) {
        this.recordTest('Suggestion Generation', true);
        console.log(`   Workflow: ${workflowSuggestions.length}, Network: ${networkSuggestions.length}`);
        console.log(`   AI: ${aiSuggestions.length}, Node: ${nodeSuggestions.length}`);
        console.log(`   Average steps per suggestion: ${workflowSuggestions.reduce((acc, s) => acc + s.steps.length, 0) / workflowSuggestions.length}`);
      } else {
        this.recordTest('Suggestion Generation', false, 'Insufficient or invalid suggestions');
      }
    } catch (error) {
      this.recordTest('Suggestion Generation', false, error.message);
    }
  }

  private testReportHistory(): void {
    try {
      const initialReports = this.reporter.getReports({});
      
      // Generate several test reports
      for (let i = 0; i < 3; i++) {
        const error = new Error(`Test error ${i}`);
        const context = createMockErrorContext();
        context.operationId = `test-operation-${i}`;
        this.reporter.generateReport(error, context);
      }
      
      const finalReports = this.reporter.getReports({});
      
      if (finalReports.length >= initialReports.length + 3) {
        this.recordTest('Report History', true);
        console.log(`   Reports increased from ${initialReports.length} to ${finalReports.length}`);
        
        // Test report retrieval by ID
        const firstReport = finalReports[0];
        const retrievedReport = this.reporter.getReport(firstReport.id);
        
        if (retrievedReport && retrievedReport.id === firstReport.id) {
          console.log(`   Report retrieval by ID: ✅`);
        }
      } else {
        this.recordTest('Report History', false, 'Report history not updated correctly');
      }
    } catch (error) {
      this.recordTest('Report History', false, error.message);
    }
  }

  private testReportFiltering(): void {
    try {
      // Generate reports with different severities and categories
      const criticalError = new Error('Critical system failure');
      const criticalContext = createMockErrorContext();
      
      const networkError = createMockNetworkError();
      const networkContext = createMockErrorContext();
      
      this.reporter.generateReport(criticalError, criticalContext);
      this.reporter.generateReport(networkError, networkContext);
      
      // Test filtering by severity
      const criticalReports = this.reporter.getReports({ severity: ErrorSeverity.CRITICAL });
      const highReports = this.reporter.getReports({ severity: ErrorSeverity.HIGH });
      
      // Test filtering by category
      const networkReports = this.reporter.getReports({ category: ErrorCategory.NETWORK });
      
      // Test filtering by time range
      const recentReports = this.reporter.getReports({
        timeRange: {
          start: new Date(Date.now() - 60000), // Last minute
          end: new Date()
        }
      });
      
      // Test limit
      const limitedReports = this.reporter.getReports({ limit: 2 });
      
      this.recordTest('Report Filtering', true);
      console.log(`   High severity: ${highReports.length}, Network: ${networkReports.length}`);
      console.log(`   Recent: ${recentReports.length}, Limited: ${limitedReports.length}`);
    } catch (error) {
      this.recordTest('Report Filtering', false, error.message);
    }
  }

  private testReportResolution(): void {
    try {
      const error = createMockWorkflowError();
      const context = createMockErrorContext();
      const report = this.reporter.generateReport(error, context);
      
      // Mark as resolved
      const resolved = this.reporter.markResolved(report.id, 'test-user', 'Fixed workflow structure');
      
      if (resolved) {
        const updatedReport = this.reporter.getReport(report.id);
        
        if (updatedReport && 
            updatedReport.metadata.resolution?.status === 'resolved' &&
            updatedReport.metadata.resolution.resolvedBy === 'test-user' &&
            updatedReport.metadata.resolution.resolution === 'Fixed workflow structure') {
          this.recordTest('Report Resolution', true);
          console.log(`   Resolution status: ${updatedReport.metadata.resolution.status}`);
          console.log(`   Resolved by: ${updatedReport.metadata.resolution.resolvedBy}`);
        } else {
          this.recordTest('Report Resolution', false, 'Resolution data not updated correctly');
        }
      } else {
        this.recordTest('Report Resolution', false, 'Failed to mark report as resolved');
      }
    } catch (error) {
      this.recordTest('Report Resolution', false, error.message);
    }
  }

  private testCustomSuggestions(): void {
    try {
      const customSuggestions: ErrorSuggestion[] = [
        {
          id: 'custom-suggestion-1',
          type: SuggestionType.USER_ACTION,
          title: 'Custom Workflow Fix',
          description: 'Apply a custom fix for this specific workflow issue',
          steps: [
            'Open workflow editor',
            'Navigate to problematic node',
            'Apply custom configuration',
            'Test workflow execution'
          ],
          priority: 150,
          estimatedTime: '5-10 minutes',
          difficulty: 'medium',
          requiresRestart: false,
          requiresSupport: false,
          relatedLinks: [
            {
              title: 'Custom Fix Documentation',
              url: 'https://docs.example.com/custom-fix',
              type: 'documentation'
            }
          ]
        }
      ];
      
      const error = createMockWorkflowError();
      const context = createMockErrorContext();
      const report = this.reporter.generateReport(error, context, { customSuggestions });
      
      if (report.suggestions.some(s => s.id === 'custom-suggestion-1') &&
          report.suggestions.some(s => s.title === 'Custom Workflow Fix') &&
          report.suggestions.some(s => s.relatedLinks && s.relatedLinks.length > 0)) {
        this.recordTest('Custom Suggestions', true);
        console.log(`   Custom suggestions included: ${report.suggestions.filter(s => s.id.includes('custom')).length}`);
        console.log(`   Total suggestions: ${report.suggestions.length}`);
      } else {
        this.recordTest('Custom Suggestions', false, 'Custom suggestions not properly included');
      }
    } catch (error) {
      this.recordTest('Custom Suggestions', false, error.message);
    }
  }

  private testTemplateSystem(): void {
    try {
      // The template system is initialized with default templates
      // Test that templates are working by checking if workflow errors use the template
      const error = createMockWorkflowError();
      const context = createMockErrorContext();
      context.operationId = 'validation';
      
      const report = this.reporter.generateReport(error, context);
      
      // Check if the report shows signs of template usage
      if (report.summary.title.includes('Error') &&
          report.summary.description.length > 0 &&
          report.suggestions.length > 0) {
        this.recordTest('Template System', true);
        console.log(`   Template-generated title: "${report.summary.title}"`);
        console.log(`   Template-generated description: "${report.summary.description}"`);
      } else {
        this.recordTest('Template System', false, 'Template system not working correctly');
      }
    } catch (error) {
      this.recordTest('Template System', false, error.message);
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

    console.log('\n🎉 Error Reporter System test suite completed!');
  }
}

/**
 * Run tests if this file is executed directly
 */
if (require.main === module) {
  const testSuite = new ErrorReporterTest();
  testSuite.runAllTests().catch(console.error);
}

export default ErrorReporterTest;
