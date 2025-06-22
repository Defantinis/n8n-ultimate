/**
 * Test Suite for Ollama Cache Manager
 *
 * Comprehensive tests for caching functionality, performance tracking,
 * memory management, and integration with the AI agent system.
 */
export declare class OllamaCacheManagerTestData {
    /**
     * Test prompts for caching validation
     */
    static getTestPrompts(): {
        prompt: string;
        model: string;
        temperature: number;
        topP: number;
        numPredict: number;
        expectedResponse: string;
    }[];
    /**
     * Get test configuration for cache manager
     */
    static getTestConfig(): {
        maxEntries: number;
        defaultTtl: number;
        cleanupInterval: number;
        enablePerformanceTracking: boolean;
        compressionEnabled: boolean;
        persistToDisk: boolean;
    };
    /**
     * Get workflow requirements for testing AI agent integration
     */
    static getTestWorkflowRequirements(): ({
        description: string;
        type: string;
        inputs: {
            name: string;
            type: string;
            description: string;
        }[];
        outputs: {
            name: string;
            type: string;
            description: string;
        }[];
        steps: string[];
        constraints: {
            timeout: number;
            maxItems?: undefined;
            conditions?: undefined;
        };
    } | {
        description: string;
        type: string;
        inputs: {
            name: string;
            type: string;
            description: string;
        }[];
        outputs: {
            name: string;
            type: string;
            description: string;
        }[];
        steps: string[];
        constraints: {
            maxItems: number;
            timeout?: undefined;
            conditions?: undefined;
        };
    } | {
        description: string;
        type: string;
        inputs: {
            name: string;
            type: string;
            description: string;
        }[];
        outputs: {
            name: string;
            type: string;
            description: string;
        }[];
        steps: string[];
        constraints: {
            conditions: string[];
            timeout?: undefined;
            maxItems?: undefined;
        };
    })[];
}
export declare class OllamaCacheManagerTest {
    private cacheManager;
    private testAgent;
    constructor();
    /**
     * Run all cache manager tests
     */
    runAllTests(): Promise<boolean>;
    /**
     * Test basic caching functionality
     */
    private testBasicCaching;
    /**
     * Test cache key generation consistency
     */
    private testCacheKeyGeneration;
    /**
     * Test cache expiration (TTL)
     */
    private testCacheExpiration;
    /**
     * Test cache eviction when max entries exceeded
     */
    private testCacheEviction;
    /**
     * Test performance tracking
     */
    private testPerformanceTracking;
    /**
     * Test memory management
     */
    private testMemoryManagement;
    /**
     * Test cache statistics
     */
    private testCacheStatistics;
    /**
     * Test AI agent integration
     */
    private testAIAgentIntegration;
    /**
     * Test cache preloading
     */
    private testCachePreloading;
    /**
     * Test error handling
     */
    private testErrorHandling;
    /**
     * Test compression functionality
     */
    private testCacheCompression;
    /**
     * Test concurrent access
     */
    private testConcurrentAccess;
    /**
     * Cleanup test resources
     */
    private cleanup;
}
/**
 * Main test execution
 */
export declare function testOllamaCacheManager(): Promise<boolean>;
//# sourceMappingURL=test-ollama-cache-manager.d.ts.map