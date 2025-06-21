/**
 * Test Suite for Database I/O Optimizer
 * 
 * Comprehensive testing for all I/O optimization components:
 * - Connection pool management
 * - Buffer pool operations
 * - Intelligent caching
 * - Performance metrics validation
 */

import DatabaseIOOptimizer from './database-io-optimizer';
import BufferPoolManager from './buffer-pool-manager';
import IntelligentCacheManager from './intelligent-cache-manager';

// Test utilities
class TestReporter {
    private results: Array<{ test: string; passed: boolean; duration: number; error?: string }> = [];
    private startTime: number = 0;

    startTest(testName: string): void {
        console.log(`\n🧪 Running: ${testName}`);
        this.startTime = Date.now();
    }

    endTest(testName: string, passed: boolean, error?: string): void {
        const duration = Date.now() - this.startTime;
        this.results.push({ test: testName, passed, duration, error });
        
        if (passed) {
            console.log(`✅ ${testName} - ${duration}ms`);
        } else {
            console.log(`❌ ${testName} - ${duration}ms`);
            if (error) console.log(`   Error: ${error}`);
        }
    }

    generateReport(): void {
        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.passed).length;
        const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);

        console.log('\n📊 Test Results Summary:');
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   Passed: ${passedTests}`);
        console.log(`   Failed: ${totalTests - passedTests}`);
        console.log(`   Total Duration: ${totalDuration}ms`);
        console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

        if (passedTests < totalTests) {
            console.log('\n❌ Failed Tests:');
            this.results.filter(r => !r.passed).forEach(r => {
                console.log(`   - ${r.test}: ${r.error}`);
            });
        }
    }
}

// Test helper functions
async function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function generateTestData(size: number): Buffer {
    return Buffer.alloc(size, 'test data');
}

// Main test runner
export async function runDatabaseIOOptimizerTests(): Promise<void> {
    const reporter = new TestReporter();
    
    console.log('🚀 Starting Database I/O Optimizer Test Suite\n');

    // Test 1: Connection Pool Basic Operations
    reporter.startTest('Connection Pool - Basic Operations');
    try {
        const optimizer = new DatabaseIOOptimizer({
            maxConnections: 5,
            minConnections: 2
        });

        await optimizer.initialize();
        
        // Test query execution
        const result = await optimizer.executeQuery('SELECT * FROM test');
        if (!result || typeof result !== 'object') {
            throw new Error('Query execution failed');
        }

        const metrics = optimizer.getMetrics();
        if (!metrics.connections || metrics.connections.totalConnections < 2) {
            throw new Error('Connection pool not properly initialized');
        }

        await optimizer.close();
        reporter.endTest('Connection Pool - Basic Operations', true);
    } catch (error) {
        reporter.endTest('Connection Pool - Basic Operations', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 2: Connection Pool Concurrency
    reporter.startTest('Connection Pool - Concurrency');
    try {
        const optimizer = new DatabaseIOOptimizer({
            maxConnections: 3,
            minConnections: 1
        });

        await optimizer.initialize();

        // Execute multiple concurrent queries
        const promises = Array.from({ length: 10 }, (_, i) => 
            optimizer.executeQuery(`SELECT ${i}`)
        );

        const results = await Promise.all(promises);
        if (results.length !== 10) {
            throw new Error('Not all concurrent queries completed');
        }

        const metrics = optimizer.getMetrics();
        if (metrics.connections.totalConnections > 3) {
            throw new Error('Connection pool exceeded maximum connections');
        }

        await optimizer.close();
        reporter.endTest('Connection Pool - Concurrency', true);
    } catch (error) {
        reporter.endTest('Connection Pool - Concurrency', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 3: Buffer Pool Management
    reporter.startTest('Buffer Pool - Basic Operations');
    try {
        const bufferPool = new BufferPoolManager({
            maxBuffers: 5,
            bufferSize: 1024,
            flushThreshold: 512
        });

        // Acquire and use buffer
        const bufferId = bufferPool.acquireBuffer();
        if (!bufferId) {
            throw new Error('Failed to acquire buffer');
        }

        const testData = generateTestData(256);
        const bytesWritten = bufferPool.writeToBuffer(bufferId, testData);
        if (bytesWritten !== 256) {
            throw new Error('Buffer write failed');
        }

        const readData = bufferPool.readFromBuffer(bufferId, 256);
        if (readData.length !== 256) {
            throw new Error('Buffer read failed');
        }

        bufferPool.releaseBuffer(bufferId);
        
        const metrics = bufferPool.getMetrics();
        if (metrics.totalBuffers !== 5) {
            throw new Error('Buffer pool not properly initialized');
        }

        await bufferPool.close();
        reporter.endTest('Buffer Pool - Basic Operations', true);
    } catch (error) {
        reporter.endTest('Buffer Pool - Basic Operations', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 4: Buffer Pool Flushing
    reporter.startTest('Buffer Pool - Auto Flushing');
    try {
        const bufferPool = new BufferPoolManager({
            maxBuffers: 3,
            bufferSize: 1024,
            flushThreshold: 256,
            flushIntervalMs: 100
        });

        let flushEventReceived = false;
        bufferPool.on('bufferFlushed', () => {
            flushEventReceived = true;
        });

        // Write data that exceeds flush threshold
        const bufferId = bufferPool.acquireBuffer();
        if (!bufferId) throw new Error('Failed to acquire buffer');

        const largeData = generateTestData(512);
        bufferPool.writeToBuffer(bufferId, largeData);
        bufferPool.releaseBuffer(bufferId, true); // Force flush

        // Wait for flush
        await sleep(200);

        if (!flushEventReceived) {
            throw new Error('Buffer flush event not received');
        }

        await bufferPool.close();
        reporter.endTest('Buffer Pool - Auto Flushing', true);
    } catch (error) {
        reporter.endTest('Buffer Pool - Auto Flushing', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 5: Intelligent Cache Basic Operations
    reporter.startTest('Intelligent Cache - Basic Operations');
    try {
        const cache = new IntelligentCacheManager({
            maxSize: 100,
            ttlMs: 5000,
            enableCompression: false
        });

        // Test set and get
        await cache.set('test-key', { data: 'test-value' });
        const value = await cache.get('test-key');
        
        if (!value || value.data !== 'test-value') {
            throw new Error('Cache set/get failed');
        }

        // Test cache miss
        const missValue = await cache.get('non-existent-key');
        if (missValue !== null) {
            throw new Error('Cache should return null for missing keys');
        }

        const metrics = cache.getMetrics();
        if (metrics.size !== 1) {
            throw new Error('Cache size incorrect');
        }

        await cache.close();
        reporter.endTest('Intelligent Cache - Basic Operations', true);
    } catch (error) {
        reporter.endTest('Intelligent Cache - Basic Operations', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 6: Cache TTL and Expiration
    reporter.startTest('Intelligent Cache - TTL Expiration');
    try {
        const cache = new IntelligentCacheManager({
            maxSize: 100,
            ttlMs: 100, // Very short TTL for testing
            checkIntervalMs: 50
        });

        await cache.set('expire-key', 'expire-value');
        
        // Verify item exists
        let value = await cache.get('expire-key');
        if (value !== 'expire-value') {
            throw new Error('Cache value not found before expiration');
        }

        // Wait for expiration
        await sleep(150);

        // Verify item expired
        value = await cache.get('expire-key');
        if (value !== null) {
            throw new Error('Cache value should have expired');
        }

        await cache.close();
        reporter.endTest('Intelligent Cache - TTL Expiration', true);
    } catch (error) {
        reporter.endTest('Intelligent Cache - TTL Expiration', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 7: Cache LRU Eviction
    reporter.startTest('Intelligent Cache - LRU Eviction');
    try {
        const cache = new IntelligentCacheManager({
            maxSize: 3,
            ttlMs: 10000 // Long TTL to test LRU, not expiration
        });

        // Fill cache to capacity
        await cache.set('key1', 'value1');
        await cache.set('key2', 'value2');
        await cache.set('key3', 'value3');

        // Access key1 to make it recently used
        await cache.get('key1');

        // Add another item, should evict key2 (least recently used)
        await cache.set('key4', 'value4');

        // Verify key2 was evicted
        const evictedValue = await cache.get('key2');
        if (evictedValue !== null) {
            throw new Error('LRU eviction failed - key2 should have been evicted');
        }

        // Verify other keys still exist
        const value1 = await cache.get('key1');
        const value4 = await cache.get('key4');
        
        if (value1 !== 'value1' || value4 !== 'value4') {
            throw new Error('LRU eviction removed wrong items');
        }

        await cache.close();
        reporter.endTest('Intelligent Cache - LRU Eviction', true);
    } catch (error) {
        reporter.endTest('Intelligent Cache - LRU Eviction', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 8: Cache Compression
    reporter.startTest('Intelligent Cache - Compression');
    try {
        const cache = new IntelligentCacheManager({
            maxSize: 100,
            ttlMs: 10000,
            enableCompression: true,
            compressionThreshold: 100 // Low threshold for testing
        });

        // Create large data that should be compressed
        const largeData = { 
            content: 'x'.repeat(1000),
            metadata: { size: 1000, type: 'test' }
        };

        let compressionEventReceived = false;
        cache.on('cacheSet', (data) => {
            if (data.compressed) {
                compressionEventReceived = true;
            }
        });

        await cache.set('large-key', largeData);
        
        if (!compressionEventReceived) {
            throw new Error('Compression was not applied to large data');
        }

        // Verify data can be retrieved correctly
        const retrievedData = await cache.get('large-key');
        if (!retrievedData || retrievedData.content !== largeData.content) {
            throw new Error('Compressed data retrieval failed');
        }

        await cache.close();
        reporter.endTest('Intelligent Cache - Compression', true);
    } catch (error) {
        reporter.endTest('Intelligent Cache - Compression', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 9: Performance Metrics Collection
    reporter.startTest('Performance Metrics - Collection');
    try {
        const optimizer = new DatabaseIOOptimizer();
        await optimizer.initialize();

        // Execute some operations
        await optimizer.executeQuery('SELECT 1');
        await optimizer.executeQuery('SELECT 2');

        const metrics = optimizer.getMetrics();
        
        // Verify metrics structure
        if (!metrics.connections || !metrics.overall) {
            throw new Error('Metrics structure incomplete');
        }

        if (typeof metrics.overall.efficiency.connectionUtilization !== 'number') {
            throw new Error('Connection utilization metric missing');
        }

        if (!metrics.overall.isOptimized) {
            throw new Error('Optimizer should report as optimized');
        }

        await optimizer.close();
        reporter.endTest('Performance Metrics - Collection', true);
    } catch (error) {
        reporter.endTest('Performance Metrics - Collection', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 10: Memory Management
    reporter.startTest('Memory Management - Limits');
    try {
        const bufferPool = new BufferPoolManager({
            maxBuffers: 2,
            bufferSize: 1024,
            memoryLimit: 1024 // Very low limit for testing
        });

        let memoryLimitEventReceived = false;
        bufferPool.on('memoryLimitReached', () => {
            memoryLimitEventReceived = true;
        });

        // Try to acquire more buffers than memory limit allows
        const buffer1 = bufferPool.acquireBuffer();
        const buffer2 = bufferPool.acquireBuffer(); // This should trigger memory limit

        if (!memoryLimitEventReceived) {
            throw new Error('Memory limit event not triggered');
        }

        if (buffer1) bufferPool.releaseBuffer(buffer1);
        if (buffer2) bufferPool.releaseBuffer(buffer2);

        await bufferPool.close();
        reporter.endTest('Memory Management - Limits', true);
    } catch (error) {
        reporter.endTest('Memory Management - Limits', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 11: Error Handling and Recovery
    reporter.startTest('Error Handling - Recovery');
    try {
        const cache = new IntelligentCacheManager();

        // Test handling of invalid data
        try {
            await cache.set('test', undefined);
            const value = await cache.get('test');
            // Should handle undefined gracefully
        } catch (error) {
            // Some errors are expected and should be handled gracefully
        }

        // Test cache operations after error
        await cache.set('recovery-test', 'recovery-value');
        const value = await cache.get('recovery-test');
        
        if (value !== 'recovery-value') {
            throw new Error('Cache not functioning after error');
        }

        await cache.close();
        reporter.endTest('Error Handling - Recovery', true);
    } catch (error) {
        reporter.endTest('Error Handling - Recovery', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Test 12: Concurrent Operations Stress Test
    reporter.startTest('Stress Test - Concurrent Operations');
    try {
        const optimizer = new DatabaseIOOptimizer({
            maxConnections: 5
        });
        await optimizer.initialize();

        const cache = new IntelligentCacheManager({
            maxSize: 50
        });

        // Run concurrent operations
        const operations = [];
        
        // Database operations
        for (let i = 0; i < 20; i++) {
            operations.push(optimizer.executeQuery(`SELECT ${i}`));
        }

        // Cache operations
        for (let i = 0; i < 30; i++) {
            operations.push(cache.set(`key${i}`, `value${i}`));
        }

        for (let i = 0; i < 30; i++) {
            operations.push(cache.get(`key${i}`));
        }

        const results = await Promise.allSettled(operations);
        const failures = results.filter(r => r.status === 'rejected');
        
        if (failures.length > operations.length * 0.1) { // Allow up to 10% failure rate
            throw new Error(`Too many failures: ${failures.length}/${operations.length}`);
        }

        await optimizer.close();
        await cache.close();
        reporter.endTest('Stress Test - Concurrent Operations', true);
    } catch (error) {
        reporter.endTest('Stress Test - Concurrent Operations', false, error instanceof Error ? error.message : 'Unknown error');
    }

    // Generate final report
    reporter.generateReport();
}

// Performance benchmark tests
export async function runPerformanceBenchmarks(): Promise<void> {
    console.log('\n🏃 Running Performance Benchmarks\n');

    // Benchmark 1: Connection Pool vs Direct Connections
    console.log('📊 Benchmark: Connection Pool Performance');
    const pooledOptimizer = new DatabaseIOOptimizer({ maxConnections: 10 });
    await pooledOptimizer.initialize();

    const startTime = Date.now();
    const promises = Array.from({ length: 100 }, () => 
        pooledOptimizer.executeQuery('SELECT benchmark')
    );
    await Promise.all(promises);
    const pooledTime = Date.now() - startTime;

    await pooledOptimizer.close();

    console.log(`   Pooled connections: ${pooledTime}ms for 100 queries`);
    console.log(`   Average per query: ${(pooledTime / 100).toFixed(2)}ms`);

    // Benchmark 2: Cache Hit Rate Performance
    console.log('\n📊 Benchmark: Cache Performance');
    const cache = new IntelligentCacheManager({ maxSize: 1000 });

    // Populate cache
    for (let i = 0; i < 100; i++) {
        await cache.set(`bench-key-${i}`, `bench-value-${i}`);
    }

    // Measure cache hit performance
    const cacheStartTime = Date.now();
    for (let i = 0; i < 1000; i++) {
        await cache.get(`bench-key-${i % 100}`); // 100% hit rate
    }
    const cacheTime = Date.now() - cacheStartTime;

    const stats = cache.getStats();
    console.log(`   Cache hits: ${cacheTime}ms for 1000 operations`);
    console.log(`   Hit rate: ${(stats.hitRate * 100).toFixed(1)}%`);
    console.log(`   Average per operation: ${(cacheTime / 1000).toFixed(2)}ms`);

    await cache.close();

    // Benchmark 3: Buffer Pool Throughput
    console.log('\n📊 Benchmark: Buffer Pool Throughput');
    const bufferPool = new BufferPoolManager({
        maxBuffers: 10,
        bufferSize: 64 * 1024 // 64KB buffers
    });

    const bufferStartTime = Date.now();
    const testData = generateTestData(1024);

    for (let i = 0; i < 100; i++) {
        const bufferId = bufferPool.acquireBuffer();
        if (bufferId) {
            bufferPool.writeToBuffer(bufferId, testData);
            bufferPool.readFromBuffer(bufferId, 1024);
            bufferPool.releaseBuffer(bufferId);
        }
    }

    const bufferTime = Date.now() - bufferStartTime;
    console.log(`   Buffer operations: ${bufferTime}ms for 100 write/read cycles`);
    console.log(`   Throughput: ${((100 * 1024 * 2) / bufferTime * 1000 / 1024 / 1024).toFixed(2)} MB/s`);

    await bufferPool.close();
}

// Export test runner for use in other modules
if (require.main === module) {
    (async () => {
        await runDatabaseIOOptimizerTests();
        await runPerformanceBenchmarks();
    })().catch(console.error);
} 