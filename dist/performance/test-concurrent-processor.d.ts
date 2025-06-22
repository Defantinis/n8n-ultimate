/**
 * Test Suite for Concurrent Processing System
 * Tests worker threads, task queues, parallel execution, and performance metrics
 */
import { ConcurrentProcessor } from './concurrent-processor';
declare class TestHarness {
    private processor;
    private testResults;
    setup(): Promise<void>;
    teardown(): Promise<void>;
    getProcessor(): ConcurrentProcessor;
    recordResult(testName: string, result: any): void;
    getResults(): Map<string, any>;
    printResults(): void;
}
declare function testBasicTaskExecution(harness: TestHarness): Promise<void>;
declare function testBatchTaskExecution(harness: TestHarness): Promise<void>;
declare function testPriorityTaskExecution(harness: TestHarness): Promise<void>;
declare function testDependencyHandling(harness: TestHarness): Promise<void>;
declare function testParallelExecution(harness: TestHarness): Promise<void>;
declare function testErrorHandling(harness: TestHarness): Promise<void>;
declare function testMetricsCollection(harness: TestHarness): Promise<void>;
declare function testConcurrencyStress(harness: TestHarness): Promise<void>;
declare function benchmarkPerformance(harness: TestHarness): Promise<void>;
export declare function runConcurrentProcessorTests(): Promise<void>;
export { testBasicTaskExecution, testBatchTaskExecution, testPriorityTaskExecution, testDependencyHandling, testParallelExecution, testErrorHandling, testMetricsCollection, testConcurrencyStress, benchmarkPerformance, TestHarness };
//# sourceMappingURL=test-concurrent-processor.d.ts.map