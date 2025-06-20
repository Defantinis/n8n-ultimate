/**
 * Test Suite for Knowledge Storage System
 *
 * This file contains comprehensive tests for the knowledge management
 * data storage and retrieval architecture, including database operations,
 * caching, queries, and data integrity validation.
 */
export declare class KnowledgeStorageTestRunner {
    private dal;
    private manager;
    private testResults;
    constructor();
    /**
     * Run all tests and return results
     */
    runAllTests(): Promise<{
        totalTests: number;
        passed: number;
        failed: number;
        results: any;
    }>;
    /**
     * Run individual test with error handling and timing
     */
    private runTest;
    testDatabaseInitialization(): Promise<void>;
    testBasicCRUDOperations(): Promise<void>;
    testCachingSystem(): Promise<void>;
    testQueryOperations(): Promise<void>;
    testWorkflowPatternStorage(): Promise<void>;
    testNodePerformanceStorage(): Promise<void>;
    testPerformanceMetricsStorage(): Promise<void>;
    testSearchFunctionality(): Promise<void>;
    testDataValidation(): Promise<void>;
    testConcurrentOperations(): Promise<void>;
    testErrorHandling(): Promise<void>;
    testBackupAndRestore(): Promise<void>;
    testAnalyticsOperations(): Promise<void>;
    testExportImportFunctionality(): Promise<void>;
    testPerformanceOptimizations(): Promise<void>;
}
/**
 * Run all knowledge storage tests
 */
export declare function runKnowledgeStorageTests(): Promise<void>;
//# sourceMappingURL=test-knowledge-storage-system.d.ts.map