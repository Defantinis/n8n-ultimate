/**
 * Comprehensive Error Testing Framework
 * Tests all error scenarios, edge cases, integration failures, and recovery mechanisms
 */
import { EventEmitter } from 'events';
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
    categoryBreakdown: Record<string, {
        passed: number;
        failed: number;
        duration: number;
    }>;
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
export declare class ErrorTestingFramework extends EventEmitter {
    private config;
    private errorHandler;
    private validationIntegrator;
    private communityNodeManager;
    private testResults;
    private isRunning;
    private startTime;
    private networkSimulator;
    private configurationCorruptor;
    private communityNodeMocker;
    private aiAgentMocker;
    private workflowCorruptor;
    private integrationDisruptor;
    constructor(config?: Partial<ErrorTestSuiteConfig>);
    /**
     * Run comprehensive error testing suite
     */
    runComprehensiveTests(): Promise<ErrorTestingMetrics>;
    /**
     * Test network failure scenarios
     */
    private runNetworkFailureTests;
    /**
     * Test invalid node configuration scenarios
     */
    private runNodeConfigurationTests;
    /**
     * Test community node integration issues
     */
    private runCommunityNodeTests;
    /**
     * Test AI agent failure scenarios
     */
    private runAIAgentTests;
    /**
     * Test workflow edge cases
     */
    private runWorkflowEdgeTests;
    /**
     * Test integration failure scenarios
     */
    private runIntegrationTests;
    /**
     * Test error recovery mechanisms
     */
    private runRecoveryTests;
    /**
     * Test system performance under error conditions
     */
    private runPerformanceStressTests;
    /**
     * Run an individual test with error handling and metrics collection
     */
    private runIndividualTest;
    /**
     * Calculate comprehensive testing metrics
     */
    private calculateMetrics;
    /**
     * Print detailed test report
     */
    private printDetailedReport;
    /**
     * Initialize all components and error simulators
     */
    private initializeComponents;
    /**
     * Setup event handlers for monitoring
     */
    private setupEventHandlers;
    private testFallbackStrategyActivation;
    private testAdaptiveErrorHandling;
    private testPerformanceDegradationRecovery;
    private testGracefulShutdown;
    private testRecoveryTimeOptimization;
    private simulateHighErrorRate;
    private simulateConcurrentErrors;
    private testMemoryLeakDetection;
    private testErrorHandlerPerformance;
    /**
     * Get current test results
     */
    getTestResults(): ErrorTestResult[];
    /**
     * Get configuration
     */
    getConfiguration(): ErrorTestSuiteConfig;
    /**
     * Update configuration
     */
    updateConfiguration(config: Partial<ErrorTestSuiteConfig>): void;
}
export default ErrorTestingFramework;
//# sourceMappingURL=error-testing-framework.d.ts.map