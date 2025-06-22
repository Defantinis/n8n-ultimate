/**
 * System Integration Testing for n8n-ultimate Performance Optimizations
 */
interface TestResults {
    timestamp: string;
    overall: {
        passed: boolean;
        duration: number;
        score: number;
    };
    components: Record<string, any>;
    performance: Record<string, number>;
    recommendations: string[];
}
export declare class SystemIntegrationTester {
    private results;
    private startTime;
    constructor();
    runFullTestSuite(): Promise<TestResults>;
    private testWorkflowEnhancement;
    private testPerformanceComponents;
    private calculateResults;
    saveResults(outputPath: string): Promise<void>;
}
export {};
//# sourceMappingURL=test-system-integration.d.ts.map