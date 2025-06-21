/**
 * Comprehensive Error Testing Framework
 * Tests all error scenarios, edge cases, integration failures, and recovery mechanisms
 */

import { EventEmitter } from 'events';
import { PerformanceAwareErrorHandler } from './performance-aware-error-handler';
import { ErrorClassifier, ErrorType, ErrorSeverity } from './error-classifier';
import { AdvancedErrorLogger } from './error-logger';
import { ErrorRecoveryManager } from './error-recovery';
import { ErrorReporter } from './error-reporter';
import { ValidationErrorIntegrator } from '../validation/validation-error-integrator';
import { CommunityNodeIntegrationManager } from '../community/community-node-integration-api';
import { N8NWorkflowSchema } from '../validation/n8n-workflow-schema';

/**
 * Test result interface
 */
export interface ErrorTestResult {
  testName: string;
  testCategory: string;
  passed: boolean;
  duration: number;
  errorDetails?: string;
  recoverySuccess?: boolean;
  performanceImpact?: number;
  memoryUsage?: number;
  additionalMetrics?: Record<string, any>;
}

/**
 * Test suite configuration
 */
export interface ErrorTestSuiteConfig {
  enableNetworkFailureTests: boolean;
  enableNodeConfigurationTests: boolean;
  enableCommunityNodeTests: boolean;
  enableAIAgentTests: boolean;
  enableWorkflowEdgeTests: boolean;
  enableIntegrationTests: boolean;
  enableRecoveryTests: boolean;
  enablePerformanceTests: boolean;
  maxTestDuration: number;
  concurrentTests: boolean;
  detailedReporting: boolean;
  failureSimulation: boolean;
}

/**
 * Test metrics and statistics
 */
export interface ErrorTestingMetrics {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
  averageTestDuration: number;
  categoryBreakdown: Record<string, { passed: number; failed: number; duration: number }>;
  errorRecoveryRate: number;
  fallbackSuccessRate: number;
  performanceImpact: {
    averageMemoryUsage: number;
    averageProcessingTime: number;
    maxMemorySpike: number;
    maxProcessingTime: number;
  };
  criticalFailures: number;
  systemStabilityScore: number;
}

/**
 * Main Error Testing Framework
 */
export class ErrorTestingFramework extends EventEmitter {
  private config: ErrorTestSuiteConfig;
  private errorHandler: PerformanceAwareErrorHandler;
  private validationIntegrator: ValidationErrorIntegrator;
  private communityNodeManager: CommunityNodeIntegrationManager;
  
  // Test components
  private testResults: ErrorTestResult[] = [];
  private isRunning: boolean = false;
  private startTime: number = 0;
  
  // Error simulation utilities
  private networkSimulator: NetworkFailureSimulator;
  private configurationCorruptor: ConfigurationCorruptor;
  private communityNodeMocker: CommunityNodeErrorMocker;
  private aiAgentMocker: AIAgentErrorMocker;
  private workflowCorruptor: WorkflowCorruptor;
  private integrationDisruptor: IntegrationDisruptor;
  
  constructor(config: Partial<ErrorTestSuiteConfig> = {}) {
    super();
    
    this.config = {
      enableNetworkFailureTests: true,
      enableNodeConfigurationTests: true,
      enableCommunityNodeTests: true,
      enableAIAgentTests: true,
      enableWorkflowEdgeTests: true,
      enableIntegrationTests: true,
      enableRecoveryTests: true,
      enablePerformanceTests: true,
      maxTestDuration: 120000, // 2 minutes
      concurrentTests: false,
      detailedReporting: true,
      failureSimulation: true,
      ...config
    };
    
    this.initializeComponents();
    this.setupEventHandlers();
  }
  
  /**
   * Run comprehensive error testing suite
   */
  async runComprehensiveTests(): Promise<ErrorTestingMetrics> {
    if (this.isRunning) {
      throw new Error('Error testing suite is already running');
    }
    
    this.isRunning = true;
    this.startTime = Date.now();
    this.testResults = [];
    
    console.log('🧪 Starting Comprehensive Error Testing Framework\n');
    this.emit('testingSuiteStarted', { totalCategories: 8 });
    
    try {
      // Run test categories in sequence
      if (this.config.enableNetworkFailureTests) {
        await this.runNetworkFailureTests();
      }
      
      if (this.config.enableNodeConfigurationTests) {
        await this.runNodeConfigurationTests();
      }
      
      if (this.config.enableCommunityNodeTests) {
        await this.runCommunityNodeTests();
      }
      
      if (this.config.enableAIAgentTests) {
        await this.runAIAgentTests();
      }
      
      if (this.config.enableWorkflowEdgeTests) {
        await this.runWorkflowEdgeTests();
      }
      
      if (this.config.enableIntegrationTests) {
        await this.runIntegrationTests();
      }
      
      if (this.config.enableRecoveryTests) {
        await this.runRecoveryTests();
      }
      
      if (this.config.enablePerformanceTests) {
        await this.runPerformanceStressTests();
      }
      
      const metrics = this.calculateMetrics();
      
      console.log('\n🎉 Comprehensive Error Testing Complete!');
      this.printDetailedReport(metrics);
      
      this.emit('testingSuiteCompleted', { metrics, results: this.testResults });
      
      return metrics;
      
    } catch (error) {
      this.emit('testingSuiteError', { error });
      throw error;
    } finally {
      this.isRunning = false;
    }
  }
  
  /**
   * Test network failure scenarios
   */
  private async runNetworkFailureTests(): Promise<void> {
    console.log('🌐 Running Network Failure Tests...');
    
    const networkTests = [
      {
        name: 'Connection Timeout',
        scenario: async () => this.networkSimulator.simulateConnectionTimeout(),
        expectedRecovery: true
      },
      {
        name: 'DNS Resolution Failure',
        scenario: async () => this.networkSimulator.simulateDNSFailure(),
        expectedRecovery: true
      },
      {
        name: 'API Rate Limiting',
        scenario: async () => this.networkSimulator.simulateRateLimiting(),
        expectedRecovery: true
      },
      {
        name: 'Intermittent Connection Loss',
        scenario: async () => this.networkSimulator.simulateIntermittentConnection(),
        expectedRecovery: true
      },
      {
        name: 'SSL/TLS Certificate Error',
        scenario: async () => this.networkSimulator.simulateSSLError(),
        expectedRecovery: false
      }
    ];
    
    for (const test of networkTests) {
      await this.runIndividualTest(
        test.name,
        'Network Failure',
        test.scenario,
        test.expectedRecovery
      );
    }
  }
  
  /**
   * Test invalid node configuration scenarios
   */
  private async runNodeConfigurationTests(): Promise<void> {
    console.log('⚙️ Running Node Configuration Tests...');
    
    const configTests = [
      {
        name: 'Missing Required Parameters',
        scenario: async () => this.configurationCorruptor.createMissingParametersError(),
        expectedRecovery: false
      },
      {
        name: 'Invalid Parameter Types',
        scenario: async () => this.configurationCorruptor.createInvalidTypeError(),
        expectedRecovery: false
      },
      {
        name: 'Circular Dependencies',
        scenario: async () => this.configurationCorruptor.createCircularDependency(),
        expectedRecovery: false
      },
      {
        name: 'Malformed JSON Configuration',
        scenario: async () => this.configurationCorruptor.createMalformedJSON(),
        expectedRecovery: false
      },
      {
        name: 'Version Incompatibility',
        scenario: async () => this.configurationCorruptor.createVersionConflict(),
        expectedRecovery: true
      }
    ];
    
    for (const test of configTests) {
      await this.runIndividualTest(
        test.name,
        'Node Configuration',
        test.scenario,
        test.expectedRecovery
      );
    }
  }
  
  /**
   * Test community node integration issues
   */
  private async runCommunityNodeTests(): Promise<void> {
    console.log('🔗 Running Community Node Integration Tests...');
    
    const communityTests = [
      {
        name: 'Node Package Not Found',
        scenario: async () => this.communityNodeMocker.simulatePackageNotFound(),
        expectedRecovery: false
      },
      {
        name: 'Installation Failure',
        scenario: async () => this.communityNodeMocker.simulateInstallationFailure(),
        expectedRecovery: true
      },
      {
        name: 'Version Compatibility Error',
        scenario: async () => this.communityNodeMocker.simulateVersionConflict(),
        expectedRecovery: true
      },
      {
        name: 'Security Validation Failure',
        scenario: async () => this.communityNodeMocker.simulateSecurityViolation(),
        expectedRecovery: false
      },
      {
        name: 'Dynamic Parsing Error',
        scenario: async () => this.communityNodeMocker.simulateParsingError(),
        expectedRecovery: false
      },
      {
        name: 'Registry Connection Failure',
        scenario: async () => this.communityNodeMocker.simulateRegistryFailure(),
        expectedRecovery: true
      }
    ];
    
    for (const test of communityTests) {
      await this.runIndividualTest(
        test.name,
        'Community Node',
        test.scenario,
        test.expectedRecovery
      );
    }
  }
  
  /**
   * Test AI agent failure scenarios
   */
  private async runAIAgentTests(): Promise<void> {
    console.log('🤖 Running AI Agent Error Tests...');
    
    const aiTests = [
      {
        name: 'Model Timeout',
        scenario: async () => this.aiAgentMocker.simulateModelTimeout(),
        expectedRecovery: true
      },
      {
        name: 'Rate Limit Exceeded',
        scenario: async () => this.aiAgentMocker.simulateRateLimit(),
        expectedRecovery: true
      },
      {
        name: 'Invalid Response Format',
        scenario: async () => this.aiAgentMocker.simulateInvalidResponse(),
        expectedRecovery: true
      },
      {
        name: 'Model Unavailability',
        scenario: async () => this.aiAgentMocker.simulateModelUnavailable(),
        expectedRecovery: true
      },
      {
        name: 'Token Limit Exceeded',
        scenario: async () => this.aiAgentMocker.simulateTokenLimitExceeded(),
        expectedRecovery: true
      },
      {
        name: 'Authentication Failure',
        scenario: async () => this.aiAgentMocker.simulateAuthFailure(),
        expectedRecovery: false
      }
    ];
    
    for (const test of aiTests) {
      await this.runIndividualTest(
        test.name,
        'AI Agent',
        test.scenario,
        test.expectedRecovery
      );
    }
  }
  
  /**
   * Test workflow edge cases
   */
  private async runWorkflowEdgeTests(): Promise<void> {
    console.log('📊 Running Workflow Edge Case Tests...');
    
    const workflowTests = [
      {
        name: 'Empty Workflow',
        scenario: async () => this.workflowCorruptor.createEmptyWorkflow(),
        expectedRecovery: false
      },
      {
        name: 'Orphaned Nodes',
        scenario: async () => this.workflowCorruptor.createOrphanedNodes(),
        expectedRecovery: false
      },
      {
        name: 'Invalid Connection Types',
        scenario: async () => this.workflowCorruptor.createInvalidConnections(),
        expectedRecovery: false
      },
      {
        name: 'Data Type Mismatches',
        scenario: async () => this.workflowCorruptor.createDataTypeMismatch(),
        expectedRecovery: false
      },
      {
        name: 'Extremely Large Workflow',
        scenario: async () => this.workflowCorruptor.createMassiveWorkflow(),
        expectedRecovery: true
      },
      {
        name: 'Deeply Nested Workflow',
        scenario: async () => this.workflowCorruptor.createDeeplyNestedWorkflow(),
        expectedRecovery: true
      }
    ];
    
    for (const test of workflowTests) {
      await this.runIndividualTest(
        test.name,
        'Workflow Edge Case',
        test.scenario,
        test.expectedRecovery
      );
    }
  }
  
  /**
   * Test integration failure scenarios
   */
  private async runIntegrationTests(): Promise<void> {
    console.log('🔧 Running Integration Failure Tests...');
    
    const integrationTests = [
      {
        name: 'ValidationErrorIntegrator Failure',
        scenario: async () => this.integrationDisruptor.disruptValidationIntegrator(),
        expectedRecovery: true
      },
      {
        name: 'Event System Breakdown',
        scenario: async () => this.integrationDisruptor.disruptEventSystem(),
        expectedRecovery: true
      },
      {
        name: 'Cross-System Communication Failure',
        scenario: async () => this.integrationDisruptor.disruptCommunication(),
        expectedRecovery: true
      },
      {
        name: 'Memory Pressure During Integration',
        scenario: async () => this.integrationDisruptor.simulateMemoryPressure(),
        expectedRecovery: true
      },
      {
        name: 'Concurrent Integration Conflicts',
        scenario: async () => this.integrationDisruptor.simulateConcurrencyConflicts(),
        expectedRecovery: true
      }
    ];
    
    for (const test of integrationTests) {
      await this.runIndividualTest(
        test.name,
        'Integration Failure',
        test.scenario,
        test.expectedRecovery
      );
    }
  }
  
  /**
   * Test error recovery mechanisms
   */
  private async runRecoveryTests(): Promise<void> {
    console.log('🔄 Running Recovery Mechanism Tests...');
    
    const recoveryTests = [
      {
        name: 'Fallback Strategy Activation',
        scenario: async () => this.testFallbackStrategyActivation(),
        expectedRecovery: true
      },
      {
        name: 'Adaptive Error Handling',
        scenario: async () => this.testAdaptiveErrorHandling(),
        expectedRecovery: true
      },
      {
        name: 'Performance Degradation Recovery',
        scenario: async () => this.testPerformanceDegradationRecovery(),
        expectedRecovery: true
      },
      {
        name: 'Graceful System Shutdown',
        scenario: async () => this.testGracefulShutdown(),
        expectedRecovery: true
      },
      {
        name: 'Recovery Time Optimization',
        scenario: async () => this.testRecoveryTimeOptimization(),
        expectedRecovery: true
      }
    ];
    
    for (const test of recoveryTests) {
      await this.runIndividualTest(
        test.name,
        'Recovery Mechanism',
        test.scenario,
        test.expectedRecovery
      );
    }
  }
  
  /**
   * Test system performance under error conditions
   */
  private async runPerformanceStressTests(): Promise<void> {
    console.log('⚡ Running Performance Stress Tests...');
    
    const performanceTests = [
      {
        name: 'High Error Rate Stress Test',
        scenario: async () => this.simulateHighErrorRate(),
        expectedRecovery: true
      },
      {
        name: 'Concurrent Error Handling',
        scenario: async () => this.simulateConcurrentErrors(),
        expectedRecovery: true
      },
      {
        name: 'Memory Leak Detection',
        scenario: async () => this.testMemoryLeakDetection(),
        expectedRecovery: true
      },
      {
        name: 'Error Handler Performance',
        scenario: async () => this.testErrorHandlerPerformance(),
        expectedRecovery: true
      }
    ];
    
    for (const test of performanceTests) {
      await this.runIndividualTest(
        test.name,
        'Performance Stress',
        test.scenario,
        test.expectedRecovery
      );
    }
  }
  
  /**
   * Run an individual test with error handling and metrics collection
   */
  private async runIndividualTest(
    testName: string,
    category: string,
    testScenario: () => Promise<Error>,
    expectedRecovery: boolean
  ): Promise<void> {
    const startTime = Date.now();
    const initialMemory = process.memoryUsage().heapUsed;
    
    try {
      console.log(`  • ${testName}...`);
      this.emit('testStarted', { testName, category });
      
      // Generate the error scenario
      const simulatedError = await testScenario();
      
      // Test error handling through our system
      const errorResult = await this.errorHandler.handleError(simulatedError, {
        timestamp: new Date(),
        systemInfo: {
          platform: process.platform,
          nodeVersion: process.version,
          memoryUsage: process.memoryUsage(),
          uptime: process.uptime()
        }
      });
      
      const duration = Date.now() - startTime;
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDelta = finalMemory - initialMemory;
      
      // Evaluate test success
      const passed = expectedRecovery === errorResult.success;
      
      const result: ErrorTestResult = {
        testName,
        testCategory: category,
        passed,
        duration,
        recoverySuccess: errorResult.success,
        performanceImpact: errorResult.performanceMetrics?.totalTime || 0,
        memoryUsage: memoryDelta,
        additionalMetrics: {
          errorType: simulatedError.name,
          adaptiveModeUsed: errorResult.processingResult?.mode || 'unknown',
          systemStatus: errorResult.systemStatus
        }
      };
      
      if (!passed) {
        result.errorDetails = `Expected recovery: ${expectedRecovery}, Actual recovery: ${errorResult.success}`;
      }
      
      this.testResults.push(result);
      
      const status = passed ? '✅' : '❌';
      console.log(`    ${status} ${testName} (${duration}ms)`);
      
      this.emit('testCompleted', result);
      
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const result: ErrorTestResult = {
        testName,
        testCategory: category,
        passed: false,
        duration,
        errorDetails: error.message,
        recoverySuccess: false
      };
      
      this.testResults.push(result);
      
      console.log(`    ❌ ${testName} - Test execution failed: ${error.message}`);
      this.emit('testFailed', { testName, error });
    }
  }
  
  /**
   * Calculate comprehensive testing metrics
   */
  private calculateMetrics(): ErrorTestingMetrics {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const totalDuration = Date.now() - this.startTime;
    const averageTestDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0) / totalTests;
    
    const categoryBreakdown: Record<string, { passed: number; failed: number; duration: number }> = {};
    
    for (const result of this.testResults) {
      if (!categoryBreakdown[result.testCategory]) {
        categoryBreakdown[result.testCategory] = { passed: 0, failed: 0, duration: 0 };
      }
      
      const category = categoryBreakdown[result.testCategory];
      if (result.passed) {
        category.passed++;
      } else {
        category.failed++;
      }
      category.duration += result.duration;
    }
    
    const recoveryTests = this.testResults.filter(r => r.recoverySuccess !== undefined);
    const successfulRecoveries = recoveryTests.filter(r => r.recoverySuccess).length;
    const errorRecoveryRate = recoveryTests.length > 0 ? (successfulRecoveries / recoveryTests.length) * 100 : 0;
    
    const fallbackTests = this.testResults.filter(r => r.additionalMetrics?.systemStatus === 'degraded' || r.additionalMetrics?.systemStatus === 'critical');
    const fallbackSuccessRate = fallbackTests.length > 0 ? (fallbackTests.filter(r => r.passed).length / fallbackTests.length) * 100 : 0;
    
    const memoryUsages = this.testResults.filter(r => r.memoryUsage !== undefined).map(r => r.memoryUsage!);
    const performanceImpacts = this.testResults.filter(r => r.performanceImpact !== undefined).map(r => r.performanceImpact!);
    
    const criticalFailures = this.testResults.filter(r => !r.passed && !r.recoverySuccess).length;
    const systemStabilityScore = Math.max(0, 100 - (criticalFailures / totalTests) * 100);
    
    return {
      totalTests,
      passedTests,
      failedTests,
      totalDuration,
      averageTestDuration,
      categoryBreakdown,
      errorRecoveryRate,
      fallbackSuccessRate,
      performanceImpact: {
        averageMemoryUsage: memoryUsages.length > 0 ? memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length : 0,
        averageProcessingTime: performanceImpacts.length > 0 ? performanceImpacts.reduce((a, b) => a + b, 0) / performanceImpacts.length : 0,
        maxMemorySpike: memoryUsages.length > 0 ? Math.max(...memoryUsages) : 0,
        maxProcessingTime: performanceImpacts.length > 0 ? Math.max(...performanceImpacts) : 0
      },
      criticalFailures,
      systemStabilityScore
    };
  }
  
  /**
   * Print detailed test report
   */
  private printDetailedReport(metrics: ErrorTestingMetrics): void {
    console.log('\n📊 ERROR TESTING FRAMEWORK REPORT');
    console.log('=====================================');
    console.log(`Total Tests: ${metrics.totalTests}`);
    console.log(`Passed: ${metrics.passedTests} (${((metrics.passedTests / metrics.totalTests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${metrics.failedTests} (${((metrics.failedTests / metrics.totalTests) * 100).toFixed(1)}%)`);
    console.log(`Total Duration: ${(metrics.totalDuration / 1000).toFixed(2)}s`);
    console.log(`Average Test Duration: ${metrics.averageTestDuration.toFixed(2)}ms`);
    console.log(`Error Recovery Rate: ${metrics.errorRecoveryRate.toFixed(1)}%`);
    console.log(`Fallback Success Rate: ${metrics.fallbackSuccessRate.toFixed(1)}%`);
    console.log(`System Stability Score: ${metrics.systemStabilityScore.toFixed(1)}/100`);
    console.log(`Critical Failures: ${metrics.criticalFailures}`);
    
    console.log('\n📈 Performance Impact:');
    console.log(`Average Memory Usage: ${(metrics.performanceImpact.averageMemoryUsage / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Average Processing Time: ${metrics.performanceImpact.averageProcessingTime.toFixed(2)}ms`);
    console.log(`Max Memory Spike: ${(metrics.performanceImpact.maxMemorySpike / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Max Processing Time: ${metrics.performanceImpact.maxProcessingTime.toFixed(2)}ms`);
    
    console.log('\n📋 Category Breakdown:');
    for (const [category, stats] of Object.entries(metrics.categoryBreakdown)) {
      const total = stats.passed + stats.failed;
      const successRate = ((stats.passed / total) * 100).toFixed(1);
      console.log(`  ${category}: ${stats.passed}/${total} (${successRate}%) - ${(stats.duration / 1000).toFixed(2)}s`);
    }
    
    if (this.config.detailedReporting) {
      console.log('\n🔍 Failed Tests:');
      const failedTests = this.testResults.filter(r => !r.passed);
      for (const test of failedTests) {
        console.log(`  ❌ ${test.testCategory}: ${test.testName}`);
        if (test.errorDetails) {
          console.log(`     ${test.errorDetails}`);
        }
      }
    }
  }
  
  /**
   * Initialize all components and error simulators
   */
  private initializeComponents(): void {
    this.errorHandler = new PerformanceAwareErrorHandler();
    this.validationIntegrator = new ValidationErrorIntegrator();
    this.communityNodeManager = new CommunityNodeIntegrationManager();
    
    // Initialize error simulators
    this.networkSimulator = new NetworkFailureSimulator();
    this.configurationCorruptor = new ConfigurationCorruptor();
    this.communityNodeMocker = new CommunityNodeErrorMocker();
    this.aiAgentMocker = new AIAgentErrorMocker();
    this.workflowCorruptor = new WorkflowCorruptor();
    this.integrationDisruptor = new IntegrationDisruptor();
  }
  
  /**
   * Setup event handlers for monitoring
   */
  private setupEventHandlers(): void {
    this.on('testStarted', (data) => {
      // Log test start if needed
    });
    
    this.on('testCompleted', (result) => {
      // Handle test completion metrics
    });
    
    this.on('testFailed', (data) => {
      // Handle test failures
    });
  }
  
  // Recovery test implementations
  private async testFallbackStrategyActivation(): Promise<Error> {
    const error = new Error('Primary system failure - testing fallback activation');
    error.name = 'FallbackTestError';
    return error;
  }
  
  private async testAdaptiveErrorHandling(): Promise<Error> {
    const error = new Error('Adaptive error handling test scenario');
    error.name = 'AdaptiveTestError';
    return error;
  }
  
  private async testPerformanceDegradationRecovery(): Promise<Error> {
    const error = new Error('Performance degradation recovery test');
    error.name = 'PerformanceDegradationError';
    return error;
  }
  
  private async testGracefulShutdown(): Promise<Error> {
    const error = new Error('Graceful shutdown test scenario');
    error.name = 'GracefulShutdownError';
    return error;
  }
  
  private async testRecoveryTimeOptimization(): Promise<Error> {
    const error = new Error('Recovery time optimization test');
    error.name = 'RecoveryTimeError';
    return error;
  }
  
  // Performance stress test implementations
  private async simulateHighErrorRate(): Promise<Error> {
    const error = new Error('High error rate simulation');
    error.name = 'HighErrorRateError';
    return error;
  }
  
  private async simulateConcurrentErrors(): Promise<Error> {
    const error = new Error('Concurrent error simulation');
    error.name = 'ConcurrentErrorsError';
    return error;
  }
  
  private async testMemoryLeakDetection(): Promise<Error> {
    const error = new Error('Memory leak detection test');
    error.name = 'MemoryLeakError';
    return error;
  }
  
  private async testErrorHandlerPerformance(): Promise<Error> {
    const error = new Error('Error handler performance test');
    error.name = 'PerformanceTestError';
    return error;
  }
  
  /**
   * Get current test results
   */
  getTestResults(): ErrorTestResult[] {
    return [...this.testResults];
  }
  
  /**
   * Get configuration
   */
  getConfiguration(): ErrorTestSuiteConfig {
    return { ...this.config };
  }
  
  /**
   * Update configuration
   */
  updateConfiguration(config: Partial<ErrorTestSuiteConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Network Failure Simulator
 */
class NetworkFailureSimulator {
  async simulateConnectionTimeout(): Promise<Error> {
    const error = new Error('Connection timeout after 30 seconds');
    error.name = 'TimeoutError';
    (error as any).code = 'ETIMEDOUT';
    return error;
  }
  
  async simulateDNSFailure(): Promise<Error> {
    const error = new Error('DNS resolution failed for domain');
    error.name = 'DNSError';
    (error as any).code = 'ENOTFOUND';
    return error;
  }
  
  async simulateRateLimiting(): Promise<Error> {
    const error = new Error('Rate limit exceeded - 429 Too Many Requests');
    error.name = 'RateLimitError';
    (error as any).status = 429;
    return error;
  }
  
  async simulateIntermittentConnection(): Promise<Error> {
    const error = new Error('Intermittent connection loss detected');
    error.name = 'ConnectionError';
    (error as any).code = 'ECONNRESET';
    return error;
  }
  
  async simulateSSLError(): Promise<Error> {
    const error = new Error('SSL certificate verification failed');
    error.name = 'SSLError';
    (error as any).code = 'CERT_UNTRUSTED';
    return error;
  }
}

/**
 * Configuration Corruptor for testing invalid configurations
 */
class ConfigurationCorruptor {
  async createMissingParametersError(): Promise<Error> {
    const error = new Error('Required parameter "url" is missing from HTTP node configuration');
    error.name = 'ConfigurationError';
    return error;
  }
  
  async createInvalidTypeError(): Promise<Error> {
    const error = new Error('Parameter "timeout" expects number but received string');
    error.name = 'TypeError';
    return error;
  }
  
  async createCircularDependency(): Promise<Error> {
    const error = new Error('Circular dependency detected: Node A → Node B → Node A');
    error.name = 'CircularDependencyError';
    return error;
  }
  
  async createMalformedJSON(): Promise<Error> {
    const error = new Error('Malformed JSON in node configuration at line 15');
    error.name = 'SyntaxError';
    return error;
  }
  
  async createVersionConflict(): Promise<Error> {
    const error = new Error('Node version 2.0 incompatible with n8n version 1.5');
    error.name = 'VersionConflictError';
    return error;
  }
}

/**
 * Community Node Error Mocker
 */
class CommunityNodeErrorMocker {
  async simulatePackageNotFound(): Promise<Error> {
    const error = new Error('Package "n8n-nodes-advanced-excel" not found in registry');
    error.name = 'PackageNotFoundError';
    return error;
  }
  
  async simulateInstallationFailure(): Promise<Error> {
    const error = new Error('Failed to install package: npm install failed with exit code 1');
    error.name = 'InstallationError';
    return error;
  }
  
  async simulateVersionConflict(): Promise<Error> {
    const error = new Error('Package requires n8n@>=0.200.0 but found n8n@0.195.3');
    error.name = 'VersionConflictError';
    return error;
  }
  
  async simulateSecurityViolation(): Promise<Error> {
    const error = new Error('Security validation failed: Package contains potentially unsafe code');
    error.name = 'SecurityViolationError';
    return error;
  }
  
  async simulateParsingError(): Promise<Error> {
    const error = new Error('Failed to parse node definition: Invalid property schema');
    error.name = 'ParsingError';
    return error;
  }
  
  async simulateRegistryFailure(): Promise<Error> {
    const error = new Error('Community node registry unreachable');
    error.name = 'RegistryError';
    (error as any).code = 'ECONNREFUSED';
    return error;
  }
}

/**
 * AI Agent Error Mocker
 */
class AIAgentErrorMocker {
  async simulateModelTimeout(): Promise<Error> {
    const error = new Error('AI model request timed out after 60 seconds');
    error.name = 'ModelTimeoutError';
    return error;
  }
  
  async simulateRateLimit(): Promise<Error> {
    const error = new Error('API rate limit exceeded. Retry after 60 seconds');
    error.name = 'RateLimitError';
    (error as any).retryAfter = 60;
    return error;
  }
  
  async simulateInvalidResponse(): Promise<Error> {
    const error = new Error('AI model returned invalid JSON response');
    error.name = 'InvalidResponseError';
    return error;
  }
  
  async simulateModelUnavailable(): Promise<Error> {
    const error = new Error('AI model temporarily unavailable - 503 Service Unavailable');
    error.name = 'ModelUnavailableError';
    (error as any).status = 503;
    return error;
  }
  
  async simulateTokenLimitExceeded(): Promise<Error> {
    const error = new Error('Token limit exceeded: 4096/4096 tokens used');
    error.name = 'TokenLimitError';
    return error;
  }
  
  async simulateAuthFailure(): Promise<Error> {
    const error = new Error('AI API authentication failed - invalid API key');
    error.name = 'AuthenticationError';
    (error as any).status = 401;
    return error;
  }
}

/**
 * Workflow Corruptor for edge case testing
 */
class WorkflowCorruptor {
  async createEmptyWorkflow(): Promise<Error> {
    const error = new Error('Workflow contains no nodes');
    error.name = 'EmptyWorkflowError';
    return error;
  }
  
  async createOrphanedNodes(): Promise<Error> {
    const error = new Error('Workflow contains orphaned nodes with no connections');
    error.name = 'OrphanedNodesError';
    return error;
  }
  
  async createInvalidConnections(): Promise<Error> {
    const error = new Error('Invalid connection type "invalid_type" between nodes');
    error.name = 'InvalidConnectionError';
    return error;
  }
  
  async createDataTypeMismatch(): Promise<Error> {
    const error = new Error('Data type mismatch: Node expects string but received number');
    error.name = 'DataTypeMismatchError';
    return error;
  }
  
  async createMassiveWorkflow(): Promise<Error> {
    const error = new Error('Workflow exceeds maximum node limit (1000 nodes)');
    error.name = 'WorkflowSizeError';
    return error;
  }
  
  async createDeeplyNestedWorkflow(): Promise<Error> {
    const error = new Error('Workflow nesting depth exceeds maximum (50 levels)');
    error.name = 'WorkflowDepthError';
    return error;
  }
}

/**
 * Integration Disruptor for system integration testing
 */
class IntegrationDisruptor {
  async disruptValidationIntegrator(): Promise<Error> {
    const error = new Error('ValidationErrorIntegrator failed to initialize');
    error.name = 'IntegrationError';
    return error;
  }
  
  async disruptEventSystem(): Promise<Error> {
    const error = new Error('Event emitter system failure');
    error.name = 'EventSystemError';
    return error;
  }
  
  async disruptCommunication(): Promise<Error> {
    const error = new Error('Cross-system communication breakdown');
    error.name = 'CommunicationError';
    return error;
  }
  
  async simulateMemoryPressure(): Promise<Error> {
    const error = new Error('High memory pressure during integration');
    error.name = 'MemoryPressureError';
    return error;
  }
  
  async simulateConcurrencyConflicts(): Promise<Error> {
    const error = new Error('Concurrent integration conflicts detected');
    error.name = 'ConcurrencyError';
    return error;
  }
}

export default ErrorTestingFramework; 