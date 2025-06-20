/**
 * Test suite for n8n Integration Patterns
 *
 * This test validates all integration patterns and best practices
 * implementations to ensure they work correctly.
 */
/**
 * Integration Patterns Test Suite
 */
export declare class IntegrationPatternsTestSuite {
    private integrationManager;
    private testUtils;
    private logger;
    constructor();
    /**
     * Run all integration pattern tests
     */
    runAllTests(): Promise<{
        passed: number;
        failed: number;
        results: Array<{
            test: string;
            passed: boolean;
            error?: string;
        }>;
    }>;
    /**
     * Test Authentication Manager
     */
    private testAuthManager;
    /**
     * Test Error Handler
     */
    private testErrorHandler;
    /**
     * Test Performance Optimizer
     */
    private testPerformanceOptimizer;
    /**
     * Test Monitor
     */
    private testMonitor;
    /**
     * Test Webhook Handler
     */
    private testWebhookHandler;
    /**
     * Test Workflow Validation
     */
    private testWorkflowValidation;
    /**
     * Test Mock Workflow Creation
     */
    private testMockWorkflowCreation;
    /**
     * Test Integration Manager
     */
    private testIntegrationManager;
    /**
     * Performance benchmark test
     */
    runPerformanceBenchmark(): Promise<{
        cachePerformance: {
            withCache: number;
            withoutCache: number;
            improvement: string;
        };
        batchPerformance: {
            sequential: number;
            batch: number;
            improvement: string;
        };
        parallelPerformance: {
            sequential: number;
            parallel: number;
            improvement: string;
        };
    }>;
}
/**
 * Run the integration patterns test suite
 */
export declare function runIntegrationPatternsTests(): Promise<void>;
//# sourceMappingURL=test-integration-patterns.d.ts.map