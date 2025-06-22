import { ConcurrentAnalysisRequest, ConcurrentPlanningRequest } from './optimized-ai-agent.js';
import { WorkflowRequirements, RequirementAnalysis } from './ai-agent.js';
/**
 * Test data generator for optimized AI agent testing
 */
export declare class OptimizedAIAgentTestData {
    static createTestRequirements(): WorkflowRequirements;
    static createTestAnalysis(): RequirementAnalysis;
    static createConcurrentAnalysisRequests(): ConcurrentAnalysisRequest[];
    static createConcurrentPlanningRequests(): ConcurrentPlanningRequest[];
    static createBatchRequests(): {
        type: 'analysis' | 'planning';
        data: any;
        id: string;
    }[];
}
/**
 * Comprehensive test suite for OptimizedAIAgent
 */
export declare class OptimizedAIAgentTest {
    private agent;
    private testConfig;
    constructor();
    /**
     * Run all tests
     */
    runAllTests(): Promise<void>;
    /**
     * Test basic configuration and initialization
     */
    private testBasicConfiguration;
    /**
     * Test streaming analysis functionality
     */
    private testStreamingAnalysis;
    /**
     * Test streaming planning functionality
     */
    private testStreamingPlanning;
    /**
     * Test concurrent analysis processing
     */
    private testConcurrentAnalysis;
    /**
     * Test concurrent planning processing
     */
    private testConcurrentPlanning;
    /**
     * Test batch processing functionality
     */
    private testBatchProcessing;
    /**
     * Test prompt optimization
     */
    private testPromptOptimization;
    /**
     * Test metrics collection
     */
    private testMetricsCollection;
    /**
     * Test event handling
     */
    private testEventHandling;
    /**
     * Test error handling and fallback mechanisms
     */
    private testErrorHandling;
    /**
     * Test performance comparison with base agent
     */
    private testPerformanceComparison;
    /**
     * Test resource management and cleanup
     */
    private testResourceManagement;
    /**
     * Cleanup test resources
     */
    private cleanup;
}
export declare function runOptimizedAIAgentTests(): Promise<void>;
//# sourceMappingURL=test-optimized-ai-agent.d.ts.map