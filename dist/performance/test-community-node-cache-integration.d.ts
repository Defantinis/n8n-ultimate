/**
 * Test Suite for Community Node Cache Integration
 * Comprehensive testing of caching strategies for community node metadata
 */
/**
 * Test data generator for community node cache integration tests
 */
export declare class CommunityNodeCacheIntegrationTestData {
    static generateTestNodeMetadata(nodeId?: string): any;
    static generateTestSearchOptions(query?: string): any;
    static generateTestValidationResult(nodeId?: string): any;
    static generateTestCompatibilityResult(nodeId?: string, n8nVersion?: string): any;
}
/**
 * Comprehensive test suite for community node cache integration
 */
export declare class CommunityNodeCacheIntegrationTest {
    private cacheIntegration;
    private metadataCache;
    private mockRegistry;
    private mockValidator;
    private mockIntegrationManager;
    private mockParser;
    constructor();
    private setupTestEnvironment;
    /**
     * Run all cache integration tests
     */
    runAllTests(): Promise<void>;
    /**
     * Test metadata caching functionality
     */
    private testMetadataCaching;
    /**
     * Test validation result caching
     */
    private testValidationCaching;
    /**
     * Test compatibility checking with caching
     */
    private testCompatibilityCaching;
    /**
     * Test search results caching
     */
    private testSearchResultsCaching;
    /**
     * Test bulk metadata retrieval with parallel caching
     */
    private testBulkMetadataRetrieval;
    /**
     * Test cache invalidation functionality
     */
    private testCacheInvalidation;
    /**
     * Test performance monitoring functionality
     */
    private testPerformanceMonitoring;
    /**
     * Test cache optimization functionality
     */
    private testCacheOptimization;
    /**
     * Test event emission functionality
     */
    private testEventEmission;
    /**
     * Test error handling in cache operations
     */
    private testErrorHandling;
    /**
     * Test cache warmup functionality
     */
    private testCacheWarmup;
    /**
     * Test background refresh functionality
     */
    private testBackgroundRefresh;
    /**
     * Helper method for assertions
     */
    private assert;
}
/**
 * Export test runner function
 */
export declare function runCommunityNodeCacheIntegrationTests(): Promise<void>;
//# sourceMappingURL=test-community-node-cache-integration.d.ts.map