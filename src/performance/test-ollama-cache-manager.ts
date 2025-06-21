/**
 * Test Suite for Ollama Cache Manager
 * 
 * Comprehensive tests for caching functionality, performance tracking,
 * memory management, and integration with the AI agent system.
 */

import { OllamaCacheManager } from './ollama-cache-manager.js';
import { AIAgent } from '../ai-agents/ai-agent.js';

export class OllamaCacheManagerTestData {
  
  /**
   * Test prompts for caching validation
   */
  static getTestPrompts() {
    return [
      {
        prompt: "You are an expert n8n workflow designer. Create a simple HTTP request workflow.",
        model: "llama3.2",
        temperature: 0.3,
        topP: 0.9,
        numPredict: 2000,
        expectedResponse: JSON.stringify({
          nodes: [
            { id: "start", name: "Start", type: "n8n-nodes-base.start" },
            { id: "http", name: "HTTP Request", type: "n8n-nodes-base.httpRequest" }
          ]
        })
      },
      {
        prompt: "You are an expert n8n workflow designer. Create a data processing workflow.",
        model: "llama3.2",
        temperature: 0.3,
        topP: 0.9,
        numPredict: 2000,
        expectedResponse: JSON.stringify({
          nodes: [
            { id: "start", name: "Start", type: "n8n-nodes-base.start" },
            { id: "set", name: "Process Data", type: "n8n-nodes-base.set" }
          ]
        })
      },
      {
        prompt: "You are an expert n8n workflow designer. Create a conditional workflow with IF nodes.",
        model: "llama3.2",
        temperature: 0.5,
        topP: 0.8,
        numPredict: 1500,
        expectedResponse: JSON.stringify({
          nodes: [
            { id: "start", name: "Start", type: "n8n-nodes-base.start" },
            { id: "if", name: "Condition", type: "n8n-nodes-base.if" }
          ]
        })
      }
    ];
  }

  /**
   * Get test configuration for cache manager
   */
  static getTestConfig() {
    return {
      maxEntries: 100,
      defaultTtl: 5 * 60 * 1000, // 5 minutes for testing
      cleanupInterval: 30 * 1000, // 30 seconds for testing
      enablePerformanceTracking: true,
      compressionEnabled: true,
      persistToDisk: false
    };
  }

  /**
   * Get workflow requirements for testing AI agent integration
   */
  static getTestWorkflowRequirements() {
    return [
      {
        description: "Create a simple HTTP request workflow that fetches data from an API",
        type: "data-fetching",
        inputs: [{ name: "apiUrl", type: "string", description: "API endpoint URL" }],
        outputs: [{ name: "data", type: "object", description: "Fetched data" }],
        steps: ["Make HTTP request", "Process response"],
        constraints: { timeout: 30000 }
      },
      {
        description: "Create a data transformation workflow that processes JSON",
        type: "data-processing",
        inputs: [{ name: "rawData", type: "object", description: "Raw JSON data" }],
        outputs: [{ name: "processedData", type: "object", description: "Transformed data" }],
        steps: ["Validate input", "Transform data", "Format output"],
        constraints: { maxItems: 1000 }
      },
      {
        description: "Create a conditional workflow that routes data based on conditions",
        type: "conditional",
        inputs: [{ name: "inputData", type: "any", description: "Input data to route" }],
        outputs: [{ name: "routedData", type: "any", description: "Routed data" }],
        steps: ["Evaluate condition", "Route to appropriate path"],
        constraints: { conditions: ["value > 100", "type === 'premium'"] }
      }
    ];
  }
}

export class OllamaCacheManagerTest {
  private cacheManager: OllamaCacheManager;
  private testAgent: AIAgent;

  constructor() {
    this.cacheManager = new OllamaCacheManager(OllamaCacheManagerTestData.getTestConfig());
    this.testAgent = new AIAgent('http://localhost:11434', 'llama3.2', true);
  }

  /**
   * Run all cache manager tests
   */
  async runAllTests(): Promise<boolean> {
    console.log('🧪 Starting Ollama Cache Manager Tests...\n');

    try {
      await this.testBasicCaching();
      await this.testCacheKeyGeneration();
      await this.testCacheExpiration();
      await this.testCacheEviction();
      await this.testPerformanceTracking();
      await this.testMemoryManagement();
      await this.testCacheStatistics();
      await this.testAIAgentIntegration();
      await this.testCachePreloading();
      await this.testErrorHandling();
      await this.testCacheCompression();
      await this.testConcurrentAccess();

      console.log('✅ All Ollama Cache Manager tests passed!\n');
      return true;
    } catch (error) {
      console.error('❌ Cache Manager test failed:', error);
      return false;
    } finally {
      this.cleanup();
    }
  }

  /**
   * Test basic caching functionality
   */
  private async testBasicCaching(): Promise<void> {
    console.log('🔍 Testing basic caching functionality...');

    const prompt = "Test prompt for basic caching";
    const model = "llama3.2";
    const response = "Test response for caching";

    // Store response in cache
    await this.cacheManager.setCachedResponse(prompt, response, model);

    // Retrieve from cache
    const cachedResponse = await this.cacheManager.getCachedResponse(prompt, model);

    if (cachedResponse !== response) {
      throw new Error('Basic caching failed - response mismatch');
    }

    console.log('✅ Basic caching test passed');
  }

  /**
   * Test cache key generation consistency
   */
  private async testCacheKeyGeneration(): Promise<void> {
    console.log('🔍 Testing cache key generation...');

    const testPrompts = OllamaCacheManagerTestData.getTestPrompts();
    
    for (const testPrompt of testPrompts) {
      await this.cacheManager.setCachedResponse(
        testPrompt.prompt,
        testPrompt.expectedResponse,
        testPrompt.model,
        testPrompt.temperature,
        testPrompt.topP,
        testPrompt.numPredict
      );

      const cachedResponse = await this.cacheManager.getCachedResponse(
        testPrompt.prompt,
        testPrompt.model,
        testPrompt.temperature,
        testPrompt.topP,
        testPrompt.numPredict
      );

      if (!cachedResponse) {
        throw new Error('Cache key generation failed - could not retrieve cached response');
      }

      // Test with slightly different parameters should miss cache
      const missResponse = await this.cacheManager.getCachedResponse(
        testPrompt.prompt,
        testPrompt.model,
        testPrompt.temperature + 0.1, // Different temperature
        testPrompt.topP,
        testPrompt.numPredict
      );

      if (missResponse) {
        throw new Error('Cache key generation failed - should have missed cache with different parameters');
      }
    }

    console.log('✅ Cache key generation test passed');
  }

  /**
   * Test cache expiration (TTL)
   */
  private async testCacheExpiration(): Promise<void> {
    console.log('🔍 Testing cache expiration...');

    const prompt = "Test prompt for expiration";
    const model = "llama3.2";
    const response = "Test response for expiration";
    const shortTtl = 100; // 100ms TTL

    // Store with short TTL
    await this.cacheManager.setCachedResponse(prompt, response, model, 0.3, 0.9, 2000, shortTtl);

    // Should be cached immediately
    let cachedResponse = await this.cacheManager.getCachedResponse(prompt, model);
    if (!cachedResponse) {
      throw new Error('Cache expiration test failed - should be cached initially');
    }

    // Wait for expiration
    await new Promise(resolve => setTimeout(resolve, 150));

    // Should be expired now
    cachedResponse = await this.cacheManager.getCachedResponse(prompt, model);
    if (cachedResponse) {
      throw new Error('Cache expiration test failed - should be expired');
    }

    console.log('✅ Cache expiration test passed');
  }

  /**
   * Test cache eviction when max entries exceeded
   */
  private async testCacheEviction(): Promise<void> {
    console.log('🔍 Testing cache eviction...');

    const maxEntries = this.cacheManager['config'].maxEntries;
    
    // Fill cache beyond capacity
    for (let i = 0; i < maxEntries + 10; i++) {
      await this.cacheManager.setCachedResponse(
        `Test prompt ${i}`,
        `Test response ${i}`,
        "llama3.2"
      );
    }

    const stats = this.cacheManager.getCacheStats();
    if (stats.totalEntries > maxEntries) {
      throw new Error('Cache eviction failed - exceeded max entries');
    }

    console.log('✅ Cache eviction test passed');
  }

  /**
   * Test performance tracking
   */
  private async testPerformanceTracking(): Promise<void> {
    console.log('🔍 Testing performance tracking...');

    // Record some response times
    this.cacheManager.recordResponseTime(100);
    this.cacheManager.recordResponseTime(200);
    this.cacheManager.recordResponseTime(150);

    const stats = this.cacheManager.getCacheStats();
    
    if (stats.averageResponseTime !== 150) {
      throw new Error('Performance tracking failed - incorrect average response time');
    }

    console.log('✅ Performance tracking test passed');
  }

  /**
   * Test memory management
   */
  private async testMemoryManagement(): Promise<void> {
    console.log('🔍 Testing memory management...');

    // Add some entries to measure memory
    for (let i = 0; i < 10; i++) {
      await this.cacheManager.setCachedResponse(
        `Memory test prompt ${i}`,
        `Memory test response ${i}`.repeat(100), // Larger response
        "llama3.2"
      );
    }

    const stats = this.cacheManager.getCacheStats();
    
    if (stats.memoryUsage <= 0) {
      throw new Error('Memory management test failed - no memory usage recorded');
    }

    console.log(`📊 Memory usage: ${(stats.memoryUsage / 1024).toFixed(2)} KB`);
    console.log('✅ Memory management test passed');
  }

  /**
   * Test cache statistics
   */
  private async testCacheStatistics(): Promise<void> {
    console.log('🔍 Testing cache statistics...');

    // Clear cache first
    this.cacheManager.clearCache();

    // Add some entries and access them
    await this.cacheManager.setCachedResponse("stat test 1", "response 1", "llama3.2");
    await this.cacheManager.setCachedResponse("stat test 2", "response 2", "llama3.2");

    // Hit cache
    await this.cacheManager.getCachedResponse("stat test 1", "llama3.2");
    await this.cacheManager.getCachedResponse("stat test 1", "llama3.2"); // Second hit

    // Miss cache
    await this.cacheManager.getCachedResponse("non-existent", "llama3.2");

    const stats = this.cacheManager.getCacheStats();
    
    if (stats.totalEntries !== 2) {
      throw new Error('Cache statistics test failed - incorrect total entries');
    }

    if (stats.totalHits !== 2) {
      throw new Error('Cache statistics test failed - incorrect hit count');
    }

    if (stats.totalMisses !== 1) {
      throw new Error('Cache statistics test failed - incorrect miss count');
    }

    console.log(`📊 Cache Stats: ${stats.totalEntries} entries, ${stats.hitRate}% hit rate`);
    console.log('✅ Cache statistics test passed');
  }

  /**
   * Test AI agent integration
   */
  private async testAIAgentIntegration(): Promise<void> {
    console.log('🔍 Testing AI agent integration...');

    // Clear cache first
    this.testAgent.clearCache();

    // Test cache stats availability
    const initialStats = this.testAgent.getCacheStats();
    if (!initialStats) {
      throw new Error('AI agent integration test failed - no cache stats available');
    }

    // Test preloading
    await this.testAgent.preloadCommonPrompts();

    const statsAfterPreload = this.testAgent.getCacheStats();
    if (statsAfterPreload!.totalEntries === 0) {
      throw new Error('AI agent integration test failed - preloading did not work');
    }

    console.log(`📊 Preloaded ${statsAfterPreload!.totalEntries} prompts`);
    console.log('✅ AI agent integration test passed');
  }

  /**
   * Test cache preloading
   */
  private async testCachePreloading(): Promise<void> {
    console.log('🔍 Testing cache preloading...');

    const prompts = [
      { prompt: "preload test 1", response: "preload response 1", model: "llama3.2" },
      { prompt: "preload test 2", response: "preload response 2", model: "llama3.2" }
    ];

    await this.cacheManager.preloadCommonPrompts(prompts);

    for (const prompt of prompts) {
      const cachedResponse = await this.cacheManager.getCachedResponse(prompt.prompt, prompt.model);
      if (cachedResponse !== prompt.response) {
        throw new Error('Cache preloading test failed - preloaded prompt not found');
      }
    }

    console.log('✅ Cache preloading test passed');
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    console.log('🔍 Testing error handling...');

    // Test with invalid parameters
    try {
      const result = await this.cacheManager.getCachedResponse("", "");
      // Should not throw, but should return null
      if (result !== null) {
        throw new Error('Error handling test failed - should return null for invalid parameters');
      }
    } catch (error) {
      // Unexpected error
      throw new Error(`Error handling test failed - unexpected error: ${error}`);
    }

    console.log('✅ Error handling test passed');
  }

  /**
   * Test compression functionality
   */
  private async testCacheCompression(): Promise<void> {
    console.log('🔍 Testing cache compression...');

    const longResponse = "This is a test response with lots of whitespace    and    extra    spaces    that should be compressed.";
    const prompt = "compression test";

    await this.cacheManager.setCachedResponse(prompt, longResponse, "llama3.2");
    const cachedResponse = await this.cacheManager.getCachedResponse(prompt, "llama3.2");

    // Should be compressed (whitespace normalized)
    if (cachedResponse === longResponse) {
      throw new Error('Cache compression test failed - response was not compressed');
    }

    if (!cachedResponse || cachedResponse.includes("    ")) {
      throw new Error('Cache compression test failed - compression did not work properly');
    }

    console.log('✅ Cache compression test passed');
  }

  /**
   * Test concurrent access
   */
  private async testConcurrentAccess(): Promise<void> {
    console.log('🔍 Testing concurrent access...');

    const promises = [];
    
    // Concurrent writes
    for (let i = 0; i < 10; i++) {
      promises.push(
        this.cacheManager.setCachedResponse(`concurrent ${i}`, `response ${i}`, "llama3.2")
      );
    }

    await Promise.all(promises);

    // Concurrent reads
    const readPromises = [];
    for (let i = 0; i < 10; i++) {
      readPromises.push(
        this.cacheManager.getCachedResponse(`concurrent ${i}`, "llama3.2")
      );
    }

    const results = await Promise.all(readPromises);
    
    for (let i = 0; i < results.length; i++) {
      if (results[i] !== `response ${i}`) {
        throw new Error('Concurrent access test failed - data corruption detected');
      }
    }

    console.log('✅ Concurrent access test passed');
  }

  /**
   * Cleanup test resources
   */
  private cleanup(): void {
    this.cacheManager.dispose();
    console.log('🧹 Test cleanup completed');
  }
}

/**
 * Main test execution
 */
export async function testOllamaCacheManager(): Promise<boolean> {
  const test = new OllamaCacheManagerTest();
  return await test.runAllTests();
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testOllamaCacheManager()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
} 