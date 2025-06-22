/**
 * Test suite for Comprehensive Error Testing Framework
 * Tests the error testing framework itself to ensure it works correctly
 */
import { ErrorTestSuiteConfig } from './error-testing-framework';
/**
 * Test data for Error Testing Framework
 */
declare class ErrorTestingFrameworkTestData {
    /**
     * Create minimal test configuration
     */
    static createMinimalConfig(): Partial<ErrorTestSuiteConfig>;
    /**
     * Create comprehensive test configuration
     */
    static createComprehensiveConfig(): Partial<ErrorTestSuiteConfig>;
    /**
     * Create performance-focused test configuration
     */
    static createPerformanceConfig(): Partial<ErrorTestSuiteConfig>;
}
/**
 * Main test class for Error Testing Framework
 */
declare class ErrorTestingFrameworkTest {
    private framework;
    private testResults;
    constructor();
    /**
     * Run all tests for the Error Testing Framework
     */
    runAllTests(): Promise<void>;
    /**
     * Test framework initialization
     */
    private testFrameworkInitialization;
    /**
     * Test configuration management
     */
    private testConfigurationManagement;
    /**
     * Test minimal test suite execution
     */
    private testMinimalTestSuiteExecution;
    /**
     * Test error metrics calculation
     */
    private testErrorMetricsCalculation;
    /**
     * Test event system functionality
     */
    private testEventSystemFunctionality;
    /**
     * Test result collection
     */
    private testResultCollection;
    /**
     * Test performance monitoring during tests
     */
    private testPerformanceMonitoring;
    /**
     * Test error simulation accuracy
     */
    private testErrorSimulationAccuracy;
    /**
     * Test recovery mechanism testing
     */
    private testRecoveryMechanismTesting;
    /**
     * Test system stability assessment
     */
    private testSystemStabilityAssessment;
    /**
     * Setup event listeners for monitoring
     */
    private setupEventListeners;
    /**
     * Record individual test result
     */
    private recordTest;
    /**
     * Print test summary
     */
    private printTestSummary;
}
export { ErrorTestingFrameworkTest, ErrorTestingFrameworkTestData };
//# sourceMappingURL=test-error-testing-framework.d.ts.map