/**
 * Test suite for Comprehensive Error Testing Framework
 * Tests the error testing framework itself to ensure it works correctly
 */

import ErrorTestingFramework, { 
  ErrorTestResult, 
  ErrorTestSuiteConfig, 
  ErrorTestingMetrics 
} from './error-testing-framework';

/**
 * Test data for Error Testing Framework
 */
class ErrorTestingFrameworkTestData {
  /**
   * Create minimal test configuration
   */
  static createMinimalConfig(): Partial<ErrorTestSuiteConfig> {
    return {
      enableNetworkFailureTests: true,
      enableNodeConfigurationTests: true,
      enableCommunityNodeTests: false, // Disable to speed up testing
      enableAIAgentTests: false, // Disable to speed up testing
      enableWorkflowEdgeTests: true,
      enableIntegrationTests: false, // Disable to speed up testing
      enableRecoveryTests: true,
      enablePerformanceTests: false, // Disable to speed up testing
      maxTestDuration: 30000, // 30 seconds for faster testing
      concurrentTests: false,
      detailedReporting: true,
      failureSimulation: true
    };
  }

  /**
   * Create comprehensive test configuration
   */
  static createComprehensiveConfig(): Partial<ErrorTestSuiteConfig> {
    return {
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
      failureSimulation: true
    };
  }

  /**
   * Create performance-focused test configuration
   */
  static createPerformanceConfig(): Partial<ErrorTestSuiteConfig> {
    return {
      enableNetworkFailureTests: false,
      enableNodeConfigurationTests: false,
      enableCommunityNodeTests: false,
      enableAIAgentTests: false,
      enableWorkflowEdgeTests: false,
      enableIntegrationTests: false,
      enableRecoveryTests: false,
      enablePerformanceTests: true,
      maxTestDuration: 60000, // 1 minute
      concurrentTests: true,
      detailedReporting: true,
      failureSimulation: true
    };
  }
}

/**
 * Main test class for Error Testing Framework
 */
class ErrorTestingFrameworkTest {
  private framework: ErrorTestingFramework;
  private testResults: Array<{ name: string; passed: boolean; details?: string }> = [];

  constructor() {
    console.log('🧪 Starting Error Testing Framework Tests\n');
    this.framework = new ErrorTestingFramework(ErrorTestingFrameworkTestData.createMinimalConfig());
    this.setupEventListeners();
  }

  /**
   * Run all tests for the Error Testing Framework
   */
  async runAllTests(): Promise<void> {
    try {
      // Test 1: Basic Framework Initialization
      await this.testFrameworkInitialization();

      // Test 2: Configuration Management
      this.testConfigurationManagement();

      // Test 3: Minimal Test Suite Execution
      await this.testMinimalTestSuiteExecution();

      // Test 4: Error Metrics Calculation
      await this.testErrorMetricsCalculation();

      // Test 5: Event System Functionality
      await this.testEventSystemFunctionality();

      // Test 6: Test Result Collection
      await this.testResultCollection();

      // Test 7: Performance Monitoring During Tests
      await this.testPerformanceMonitoring();

      // Test 8: Error Simulation Accuracy
      await this.testErrorSimulationAccuracy();

      // Test 9: Recovery Mechanism Testing
      await this.testRecoveryMechanismTesting();

      // Test 10: System Stability Assessment
      await this.testSystemStabilityAssessment();

      this.printTestSummary();

    } catch (error) {
      console.error('❌ Error Testing Framework test suite failed:', error);
      this.recordTest('Test Suite Execution', false, error.message);
    }
  }

  /**
   * Test framework initialization
   */
  private async testFrameworkInitialization(): Promise<void> {
    try {
      console.log('Testing framework initialization...');

      // Test with minimal config
      const minimalFramework = new ErrorTestingFramework(ErrorTestingFrameworkTestData.createMinimalConfig());
      const minimalConfig = minimalFramework.getConfiguration();

      if (minimalConfig.enableNetworkFailureTests === true &&
          minimalConfig.enableCommunityNodeTests === false &&
          minimalConfig.maxTestDuration === 30000) {
        this.recordTest('Minimal Framework Initialization', true);
      } else {
        this.recordTest('Minimal Framework Initialization', false, 'Configuration not applied correctly');
      }

      // Test with comprehensive config
      const comprehensiveFramework = new ErrorTestingFramework(ErrorTestingFrameworkTestData.createComprehensiveConfig());
      const comprehensiveConfig = comprehensiveFramework.getConfiguration();

      if (comprehensiveConfig.enableAIAgentTests === true &&
          comprehensiveConfig.enablePerformanceTests === true &&
          comprehensiveConfig.maxTestDuration === 120000) {
        this.recordTest('Comprehensive Framework Initialization', true);
      } else {
        this.recordTest('Comprehensive Framework Initialization', false, 'Comprehensive configuration not applied correctly');
      }

      console.log('  ✅ Framework initialization tests passed');

    } catch (error) {
      this.recordTest('Framework Initialization', false, error.message);
    }
  }

  /**
   * Test configuration management
   */
  private testConfigurationManagement(): void {
    try {
      console.log('Testing configuration management...');

      const initialConfig = this.framework.getConfiguration();
      
      // Test configuration update
      this.framework.updateConfiguration({
        maxTestDuration: 60000,
        detailedReporting: false,
        enablePerformanceTests: true
      });
      
      const updatedConfig = this.framework.getConfiguration();
      
      if (updatedConfig.maxTestDuration === 60000 &&
          updatedConfig.detailedReporting === false &&
          updatedConfig.enablePerformanceTests === true &&
          updatedConfig.enableNetworkFailureTests === initialConfig.enableNetworkFailureTests) {
        
        this.recordTest('Configuration Update', true);
        console.log('  ✅ Configuration management test passed');
      } else {
        this.recordTest('Configuration Update', false, 'Configuration update failed');
      }
      
      // Reset configuration for other tests
      this.framework.updateConfiguration(ErrorTestingFrameworkTestData.createMinimalConfig());
      
    } catch (error) {
      this.recordTest('Configuration Management', false, error.message);
    }
  }

  /**
   * Test minimal test suite execution
   */
  private async testMinimalTestSuiteExecution(): Promise<void> {
    try {
      console.log('Testing minimal test suite execution...');

      const startTime = Date.now();
      const metrics = await this.framework.runComprehensiveTests();
      const executionTime = Date.now() - startTime;

      // Validate metrics structure
      if (typeof metrics.totalTests === 'number' &&
          typeof metrics.passedTests === 'number' &&
          typeof metrics.failedTests === 'number' &&
          typeof metrics.totalDuration === 'number' &&
          typeof metrics.averageTestDuration === 'number' &&
          typeof metrics.errorRecoveryRate === 'number' &&
          typeof metrics.systemStabilityScore === 'number' &&
          metrics.totalTests > 0) {
        
        this.recordTest('Test Suite Execution', true);
        console.log(`  ✅ Test suite executed successfully (${executionTime}ms)`);
        console.log(`     Total tests: ${metrics.totalTests}`);
        console.log(`     Passed: ${metrics.passedTests}`);
        console.log(`     Failed: ${metrics.failedTests}`);
        console.log(`     Stability score: ${metrics.systemStabilityScore.toFixed(1)}`);
      } else {
        this.recordTest('Test Suite Execution', false, 'Invalid metrics structure');
      }

    } catch (error) {
      this.recordTest('Minimal Test Suite Execution', false, error.message);
    }
  }

  /**
   * Test error metrics calculation
   */
  private async testErrorMetricsCalculation(): Promise<void> {
    try {
      console.log('Testing error metrics calculation...');

      // Run a test suite to generate data
      const metrics = await this.framework.runComprehensiveTests();

      // Validate metrics calculations
      const expectedTotal = metrics.passedTests + metrics.failedTests;
      if (metrics.totalTests === expectedTotal) {
        this.recordTest('Metrics Total Calculation', true);
      } else {
        this.recordTest('Metrics Total Calculation', false, 
          `Total mismatch: expected ${expectedTotal}, got ${metrics.totalTests}`);
      }

      // Validate performance impact structure
      if (typeof metrics.performanceImpact.averageMemoryUsage === 'number' &&
          typeof metrics.performanceImpact.averageProcessingTime === 'number' &&
          typeof metrics.performanceImpact.maxMemorySpike === 'number' &&
          typeof metrics.performanceImpact.maxProcessingTime === 'number') {
        this.recordTest('Performance Impact Metrics', true);
      } else {
        this.recordTest('Performance Impact Metrics', false, 'Invalid performance impact structure');
      }

      // Validate category breakdown
      if (typeof metrics.categoryBreakdown === 'object' &&
          Object.keys(metrics.categoryBreakdown).length > 0) {
        this.recordTest('Category Breakdown', true);
      } else {
        this.recordTest('Category Breakdown', false, 'Invalid category breakdown');
      }

      console.log('  ✅ Error metrics calculation tests passed');

    } catch (error) {
      this.recordTest('Error Metrics Calculation', false, error.message);
    }
  }

  /**
   * Test event system functionality
   */
  private async testEventSystemFunctionality(): Promise<void> {
    try {
      console.log('Testing event system functionality...');

      let testStartedFired = false;
      let testCompletedFired = false;
      let testingSuiteStartedFired = false;
      let testingSuiteCompletedFired = false;

      // Set up event listeners
      this.framework.on('testStarted', () => { testStartedFired = true; });
      this.framework.on('testCompleted', () => { testCompletedFired = true; });
      this.framework.on('testingSuiteStarted', () => { testingSuiteStartedFired = true; });
      this.framework.on('testingSuiteCompleted', () => { testingSuiteCompletedFired = true; });

      // Run a minimal test suite
      await this.framework.runComprehensiveTests();

      // Validate events were fired
      if (testStartedFired && testCompletedFired && testingSuiteStartedFired && testingSuiteCompletedFired) {
        this.recordTest('Event System Functionality', true);
        console.log('  ✅ Event system tests passed');
      } else {
        this.recordTest('Event System Functionality', false, 
          `Events fired: started=${testStartedFired}, completed=${testCompletedFired}, suiteStarted=${testingSuiteStartedFired}, suiteCompleted=${testingSuiteCompletedFired}`);
      }

    } catch (error) {
      this.recordTest('Event System Functionality', false, error.message);
    }
  }

  /**
   * Test result collection
   */
  private async testResultCollection(): Promise<void> {
    try {
      console.log('Testing test result collection...');

      // Run test suite and collect results
      await this.framework.runComprehensiveTests();
      const results = this.framework.getTestResults();

      // Validate result structure
      if (Array.isArray(results) && results.length > 0) {
        const firstResult = results[0];
        if (typeof firstResult.testName === 'string' &&
            typeof firstResult.testCategory === 'string' &&
            typeof firstResult.passed === 'boolean' &&
            typeof firstResult.duration === 'number') {
          this.recordTest('Test Result Structure', true);
        } else {
          this.recordTest('Test Result Structure', false, 'Invalid result structure');
        }

        // Validate that we have results from different categories
        const categories = new Set(results.map(r => r.testCategory));
        if (categories.size > 1) {
          this.recordTest('Multi-Category Results', true);
        } else {
          this.recordTest('Multi-Category Results', false, 'Only one category found');
        }

        console.log(`  ✅ Test result collection passed (${results.length} results)`);
      } else {
        this.recordTest('Test Result Collection', false, 'No results collected');
      }

    } catch (error) {
      this.recordTest('Test Result Collection', false, error.message);
    }
  }

  /**
   * Test performance monitoring during tests
   */
  private async testPerformanceMonitoring(): Promise<void> {
    try {
      console.log('Testing performance monitoring...');

      const performanceFramework = new ErrorTestingFramework(
        ErrorTestingFrameworkTestData.createPerformanceConfig()
      );

      const startMemory = process.memoryUsage().heapUsed;
      const startTime = Date.now();

      const metrics = await performanceFramework.runComprehensiveTests();
      
      const endTime = Date.now();
      const endMemory = process.memoryUsage().heapUsed;
      const memoryDelta = endMemory - startMemory;
      const executionTime = endTime - startTime;

      // Validate that performance metrics are captured
      if (metrics.performanceImpact.averageMemoryUsage >= 0 &&
          metrics.performanceImpact.averageProcessingTime >= 0 &&
          metrics.averageTestDuration > 0) {
        this.recordTest('Performance Monitoring', true);
        console.log(`  ✅ Performance monitoring test passed`);
        console.log(`     Memory delta: ${(memoryDelta / 1024 / 1024).toFixed(2)} MB`);
        console.log(`     Execution time: ${executionTime}ms`);
        console.log(`     Average test duration: ${metrics.averageTestDuration.toFixed(2)}ms`);
      } else {
        this.recordTest('Performance Monitoring', false, 'Performance metrics not captured correctly');
      }

    } catch (error) {
      this.recordTest('Performance Monitoring', false, error.message);
    }
  }

  /**
   * Test error simulation accuracy
   */
  private async testErrorSimulationAccuracy(): Promise<void> {
    try {
      console.log('Testing error simulation accuracy...');

      await this.framework.runComprehensiveTests();
      const results = this.framework.getTestResults();

      // Validate that different error types are being simulated
      const errorTypes = new Set();
      for (const result of results) {
        if (result.additionalMetrics?.errorType) {
          errorTypes.add(result.additionalMetrics.errorType);
        }
      }

      if (errorTypes.size > 3) {
        this.recordTest('Error Type Diversity', true);
        console.log(`  ✅ Error simulation accuracy test passed (${errorTypes.size} error types)`);
      } else {
        this.recordTest('Error Type Diversity', false, `Only ${errorTypes.size} error types simulated`);
      }

      // Validate that both recovery success and failure scenarios exist
      const recoveryResults = results.filter(r => r.recoverySuccess !== undefined);
      const successfulRecoveries = recoveryResults.filter(r => r.recoverySuccess).length;
      const failedRecoveries = recoveryResults.length - successfulRecoveries;

      if (successfulRecoveries > 0 && failedRecoveries > 0) {
        this.recordTest('Recovery Scenario Diversity', true);
      } else {
        this.recordTest('Recovery Scenario Diversity', false, 
          `Recovery scenarios: ${successfulRecoveries} success, ${failedRecoveries} failed`);
      }

    } catch (error) {
      this.recordTest('Error Simulation Accuracy', false, error.message);
    }
  }

  /**
   * Test recovery mechanism testing
   */
  private async testRecoveryMechanismTesting(): Promise<void> {
    try {
      console.log('Testing recovery mechanism testing...');

      // Create framework with recovery tests enabled
      const recoveryFramework = new ErrorTestingFramework({
        ...ErrorTestingFrameworkTestData.createMinimalConfig(),
        enableRecoveryTests: true,
        enableNetworkFailureTests: false,
        enableNodeConfigurationTests: false,
        enableWorkflowEdgeTests: false
      });

      const metrics = await recoveryFramework.runComprehensiveTests();
      
      // Validate that recovery tests were executed
      const recoveryCategory = metrics.categoryBreakdown['Recovery Mechanism'];
      if (recoveryCategory && (recoveryCategory.passed + recoveryCategory.failed) > 0) {
        this.recordTest('Recovery Mechanism Testing', true);
        console.log(`  ✅ Recovery mechanism testing passed`);
        console.log(`     Recovery tests: ${recoveryCategory.passed + recoveryCategory.failed}`);
        console.log(`     Recovery rate: ${metrics.errorRecoveryRate.toFixed(1)}%`);
      } else {
        this.recordTest('Recovery Mechanism Testing', false, 'No recovery tests executed');
      }

    } catch (error) {
      this.recordTest('Recovery Mechanism Testing', false, error.message);
    }
  }

  /**
   * Test system stability assessment
   */
  private async testSystemStabilityAssessment(): Promise<void> {
    try {
      console.log('Testing system stability assessment...');

      const metrics = await this.framework.runComprehensiveTests();

      // Validate stability score calculation
      if (typeof metrics.systemStabilityScore === 'number' &&
          metrics.systemStabilityScore >= 0 &&
          metrics.systemStabilityScore <= 100) {
        this.recordTest('Stability Score Calculation', true);
      } else {
        this.recordTest('Stability Score Calculation', false, 
          `Invalid stability score: ${metrics.systemStabilityScore}`);
      }

      // Validate critical failures tracking
      if (typeof metrics.criticalFailures === 'number' && metrics.criticalFailures >= 0) {
        this.recordTest('Critical Failures Tracking', true);
      } else {
        this.recordTest('Critical Failures Tracking', false, 
          `Invalid critical failures count: ${metrics.criticalFailures}`);
      }

      console.log(`  ✅ System stability assessment passed`);
      console.log(`     Stability score: ${metrics.systemStabilityScore.toFixed(1)}/100`);
      console.log(`     Critical failures: ${metrics.criticalFailures}`);

    } catch (error) {
      this.recordTest('System Stability Assessment', false, error.message);
    }
  }

  /**
   * Setup event listeners for monitoring
   */
  private setupEventListeners(): void {
    this.framework.on('testingSuiteStarted', (data) => {
      console.log(`🚀 Test suite started with ${data.totalCategories} categories`);
    });

    this.framework.on('testingSuiteCompleted', (data) => {
      console.log(`🎉 Test suite completed with ${data.metrics.totalTests} tests`);
    });

    this.framework.on('testingSuiteError', (data) => {
      console.error(`❌ Test suite error: ${data.error.message}`);
    });
  }

  /**
   * Record individual test result
   */
  private recordTest(name: string, passed: boolean, details?: string): void {
    this.testResults.push({ name, passed, details });
  }

  /**
   * Print test summary
   */
  private printTestSummary(): void {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;

    console.log('\n📊 ERROR TESTING FRAMEWORK TEST SUMMARY');
    console.log('=========================================');
    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests} (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failedTests} (${((failedTests / totalTests) * 100).toFixed(1)}%)`);

    if (failedTests > 0) {
      console.log('\n❌ Failed Tests:');
      this.testResults.filter(r => !r.passed).forEach(test => {
        console.log(`  • ${test.name}: ${test.details || 'No details'}`);
      });
    }

    if (passedTests === totalTests) {
      console.log('\n🎉 All Error Testing Framework tests passed!');
    } else {
      console.log(`\n⚠️  ${failedTests} test(s) failed. Please review the implementation.`);
    }
  }
}

/**
 * Main execution function
 */
async function runErrorTestingFrameworkTests(): Promise<void> {
  const testSuite = new ErrorTestingFrameworkTest();
  await testSuite.runAllTests();
}

// Export for use in other test files
export { ErrorTestingFrameworkTest, ErrorTestingFrameworkTestData };

// Run tests if this file is executed directly
if (require.main === module) {
  runErrorTestingFrameworkTests().catch(console.error);
} 