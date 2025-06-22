/**
 * HTTP Client Fix Validation Testing Framework
 *
 * This specialized testing framework systematically validates the HTTP client fix
 * and captures learnings to improve our workflow development process.
 *
 * Testing Strategy:
 * 1. Validate HTTP client fix with progressive complexity
 * 2. Capture detailed performance and error metrics
 * 3. Generate actionable insights for workflow improvement
 * 4. Document patterns for future HTTP client troubleshooting
 */
export interface HTTPFixValidationResult {
    phase: string;
    workflowName: string;
    httpTests: {
        basicHTTP: boolean;
        httpsBasic: boolean;
        httpsEnhanced: boolean;
        realWorldAPI: boolean;
    };
    performanceMetrics: {
        responseTime: number;
        successRate: number;
        errorRate: number;
    };
    errorPatterns: string[];
    improvements: string[];
}
export declare class HTTPFixValidationTestFramework {
    private testingFramework;
    private projectRoot;
    private testResults;
    constructor(projectRoot: string);
    /**
     * Execute comprehensive HTTP client fix validation
     */
    executeValidationSequence(): Promise<void>;
    /**
     * Phase 1: Core HTTP Client Validation
     */
    private executePhase1;
    /**
     * Phase 2: Real-World Application Testing
     */
    private executePhase2;
    /**
     * Phase 3: Analysis & Learning Capture
     */
    private executePhase3;
    /**
     * Test individual workflow and capture results
     */
    private testWorkflow;
    /**
     * Calculate overall success rate across all tests
     */
    private calculateOverallSuccessRate;
    /**
     * Identify common error patterns across tests
     */
    private identifyErrorPatterns;
    /**
     * Analyze performance metrics for insights
     */
    private analyzePerformanceMetrics;
    /**
     * Capture insights in knowledge base
     */
    private captureInsights;
    /**
     * Generate comprehensive validation report
     */
    private generateValidationReport;
    /**
     * Generate actionable recommendations based on results
     */
    private generateRecommendations;
}
/**
 * Main execution function for HTTP fix validation
 */
export declare function executeHTTPFixValidation(projectRoot: string): Promise<void>;
export default HTTPFixValidationTestFramework;
//# sourceMappingURL=http-fix-validation-test.d.ts.map