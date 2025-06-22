/**
 * Comprehensive Test Suite for Memory Management System
 *
 * Tests all aspects of the MemoryManager including heap monitoring,
 * memory pooling, garbage collection optimization, leak detection,
 * and workflow context management.
 */
import { MemoryStats } from './memory-manager';
/**
 * Test data generator for memory management testing
 */
export declare class MemoryManagerTestData {
    /**
     * Generate mock memory stats for testing
     */
    static generateMockMemoryStats(overrides?: Partial<MemoryStats>): MemoryStats;
    /**
     * Generate memory stress test objects
     */
    static generateStressTestObjects(count: number): Array<{
        id: string;
        data: Buffer;
    }>;
    /**
     * Generate workflow test scenarios
     */
    static generateWorkflowScenarios(): Array<{
        workflowId: string;
        nodeCount: number;
        connectionCount: number;
        complexity: 'simple' | 'medium' | 'complex';
    }>;
    /**
     * Generate memory pool test configurations
     */
    static generatePoolConfigurations(): Array<{
        name: string;
        maxSize: number;
        objectSize: number;
        testOperations: number;
    }>;
    /**
     * Generate leak simulation scenarios
     */
    static generateLeakScenarios(): Array<{
        name: string;
        leakRate: number;
        iterations: number;
        objectSize: number;
    }>;
}
/**
 * Comprehensive test suite for MemoryManager
 */
export declare class MemoryManagerTest {
    private memoryManager;
    private testResults;
    constructor();
    /**
     * Run all memory manager tests
     */
    runAllTests(): Promise<void>;
    /**
     * Test memory statistics collection
     */
    private testMemoryStatsCollection;
    /**
     * Test workflow context management
     */
    private testWorkflowContextManagement;
    /**
     * Test memory pool operations
     */
    private testMemoryPoolOperations;
    /**
     * Test garbage collection trigger
     */
    private testGarbageCollectionTrigger;
    /**
     * Test memory leak detection
     */
    private testMemoryLeakDetection;
    /**
     * Test memory pressure handling
     */
    private testMemoryPressureHandling;
    /**
     * Test pool utilization optimization
     */
    private testPoolUtilizationOptimization;
    /**
     * Test concurrent workflow handling
     */
    private testConcurrentWorkflowHandling;
    /**
     * Test memory pool performance
     */
    private testMemoryPoolPerformance;
    /**
     * Test large workflow memory usage
     */
    private testLargeWorkflowMemoryUsage;
    /**
     * Test memory cleanup efficiency
     */
    private testMemoryCleanupEfficiency;
    /**
     * Test emergency cleanup
     */
    private testEmergencyCleanup;
    /**
     * Test memory threshold boundaries
     */
    private testMemoryThresholdBoundaries;
    /**
     * Test memory manager shutdown
     */
    private testMemoryManagerShutdown;
    /**
     * Record test result
     */
    private recordTestResult;
    /**
     * Print test summary
     */
    private printTestSummary;
    /**
     * Get test results
     */
    getTestResults(): Array<{
        test: string;
        passed: boolean;
        message: string;
        duration: number;
    }>;
    /**
     * Clean up test resources
     */
    cleanup(): void;
}
export declare function runMemoryManagerTests(): Promise<void>;
//# sourceMappingURL=test-memory-manager.d.ts.map