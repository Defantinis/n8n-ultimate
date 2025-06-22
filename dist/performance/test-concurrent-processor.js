/**
 * Test Suite for Concurrent Processing System
 * Tests worker threads, task queues, parallel execution, and performance metrics
 */
import { ConcurrentProcessor } from './concurrent-processor';
// Test configuration
const TEST_CONFIG = {
    maxWorkers: 4,
    taskQueueSize: 1000,
    workerTimeout: 5000,
    enablePriority: true,
    retryAttempts: 2,
    batchSize: 5
};
// Test harness
class TestHarness {
    processor = null;
    testResults = new Map();
    async setup() {
        this.processor = new ConcurrentProcessor(TEST_CONFIG);
        console.log('✓ Concurrent processor initialized');
    }
    async teardown() {
        if (this.processor) {
            await this.processor.close();
            this.processor = null;
        }
        console.log('✓ Concurrent processor closed');
    }
    getProcessor() {
        if (!this.processor) {
            throw new Error('Processor not initialized. Call setup() first.');
        }
        return this.processor;
    }
    recordResult(testName, result) {
        this.testResults.set(testName, result);
    }
    getResults() {
        return this.testResults;
    }
    printResults() {
        console.log('\n=== Test Results Summary ===');
        for (const [testName, result] of this.testResults) {
            console.log(`${testName}: ${result.success ? '✓ PASS' : '✗ FAIL'}`);
            if (result.metrics) {
                console.log(`  - Duration: ${result.metrics.duration}ms`);
                console.log(`  - Tasks: ${result.metrics.tasks || 'N/A'}`);
                console.log(`  - Throughput: ${result.metrics.throughput || 'N/A'} tasks/sec`);
            }
            if (!result.success && result.error) {
                console.log(`  - Error: ${result.error}`);
            }
        }
        console.log('===========================\n');
    }
}
// Test functions
async function testBasicTaskExecution(harness) {
    console.log('Testing basic task execution...');
    const processor = harness.getProcessor();
    const startTime = Date.now();
    try {
        // Add a simple compute task
        const taskId = await processor.addTask({
            type: 'compute',
            payload: { duration: 100 },
            priority: 5,
            timeout: 5000,
            retries: 1,
            dependencies: []
        });
        // Wait for task completion
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Task execution timeout'));
            }, 10000);
            processor.on('taskCompleted', (result) => {
                if (result.taskId === taskId) {
                    clearTimeout(timeout);
                    if (result.success) {
                        resolve();
                    }
                    else {
                        reject(new Error(result.error));
                    }
                }
            });
        });
        const duration = Date.now() - startTime;
        harness.recordResult('Basic Task Execution', {
            success: true,
            metrics: { duration, tasks: 1 }
        });
    }
    catch (error) {
        harness.recordResult('Basic Task Execution', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function testBatchTaskExecution(harness) {
    console.log('Testing batch task execution...');
    const processor = harness.getProcessor();
    const startTime = Date.now();
    const batchSize = 10;
    try {
        // Create batch of tasks
        const tasks = Array.from({ length: batchSize }, (_, i) => ({
            type: 'compute',
            payload: { duration: 50, index: i },
            priority: Math.floor(Math.random() * 10),
            timeout: 5000,
            retries: 1,
            dependencies: []
        }));
        const taskIds = await processor.addBatch(tasks);
        console.log(`Added ${taskIds.length} tasks to batch`);
        // Wait for all tasks to complete
        let completedCount = 0;
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Batch execution timeout'));
            }, 15000);
            processor.on('taskCompleted', (result) => {
                if (taskIds.includes(result.taskId)) {
                    completedCount++;
                    if (completedCount === batchSize) {
                        clearTimeout(timeout);
                        resolve();
                    }
                }
            });
        });
        const duration = Date.now() - startTime;
        const throughput = (batchSize / duration) * 1000;
        harness.recordResult('Batch Task Execution', {
            success: true,
            metrics: { duration, tasks: batchSize, throughput }
        });
    }
    catch (error) {
        harness.recordResult('Batch Task Execution', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function testPriorityTaskExecution(harness) {
    console.log('Testing priority task execution...');
    const processor = harness.getProcessor();
    const startTime = Date.now();
    try {
        const completionOrder = [];
        // Add low priority task first
        const lowPriorityTask = await processor.addTask({
            type: 'compute',
            payload: { duration: 200, name: 'low' },
            priority: 1,
            timeout: 5000,
            retries: 1,
            dependencies: []
        });
        // Add high priority task second
        const highPriorityTask = await processor.addTask({
            type: 'compute',
            payload: { duration: 100, name: 'high' },
            priority: 9,
            timeout: 5000,
            retries: 1,
            dependencies: []
        });
        // Track completion order
        processor.on('taskCompleted', (result) => {
            if ([lowPriorityTask, highPriorityTask].includes(result.taskId)) {
                const taskName = result.result?.name || 'unknown';
                completionOrder.push(taskName);
            }
        });
        // Wait for both tasks to complete
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Priority test timeout'));
            }, 10000);
            const checkCompletion = () => {
                if (completionOrder.length === 2) {
                    clearTimeout(timeout);
                    resolve();
                }
            };
            processor.on('taskCompleted', checkCompletion);
        });
        const duration = Date.now() - startTime;
        const priorityWorked = completionOrder[0] === 'high';
        harness.recordResult('Priority Task Execution', {
            success: priorityWorked,
            metrics: { duration, completionOrder },
            error: priorityWorked ? undefined : 'High priority task did not execute first'
        });
    }
    catch (error) {
        harness.recordResult('Priority Task Execution', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function testDependencyHandling(harness) {
    console.log('Testing dependency handling...');
    const processor = harness.getProcessor();
    const startTime = Date.now();
    try {
        const completionOrder = [];
        // Add first task (no dependencies)
        const task1 = await processor.addTask({
            type: 'compute',
            payload: { duration: 100, name: 'task1' },
            priority: 5,
            timeout: 5000,
            retries: 1,
            dependencies: []
        });
        // Add second task (depends on first)
        const task2 = await processor.addTask({
            type: 'compute',
            payload: { duration: 100, name: 'task2' },
            priority: 5,
            timeout: 5000,
            retries: 1,
            dependencies: [task1]
        });
        // Track completion order
        processor.on('taskCompleted', (result) => {
            if ([task1, task2].includes(result.taskId)) {
                const taskName = result.result?.name || 'unknown';
                completionOrder.push(taskName);
            }
        });
        // Wait for both tasks to complete
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Dependency test timeout'));
            }, 10000);
            const checkCompletion = () => {
                if (completionOrder.length === 2) {
                    clearTimeout(timeout);
                    resolve();
                }
            };
            processor.on('taskCompleted', checkCompletion);
        });
        const duration = Date.now() - startTime;
        const dependencyWorked = completionOrder[0] === 'task1' && completionOrder[1] === 'task2';
        harness.recordResult('Dependency Handling', {
            success: dependencyWorked,
            metrics: { duration, completionOrder },
            error: dependencyWorked ? undefined : 'Tasks did not execute in dependency order'
        });
    }
    catch (error) {
        harness.recordResult('Dependency Handling', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function testParallelExecution(harness) {
    console.log('Testing parallel execution...');
    const processor = harness.getProcessor();
    const startTime = Date.now();
    try {
        // Create parallel tasks
        const parallelTasks = Array.from({ length: 8 }, (_, i) => () => new Promise(resolve => {
            setTimeout(() => resolve(i), 100);
        }));
        const results = await processor.executeParallel(parallelTasks, { batchSize: 4 });
        const duration = Date.now() - startTime;
        const successCount = results.filter(r => r.success).length;
        const allSuccessful = successCount === parallelTasks.length;
        harness.recordResult('Parallel Execution', {
            success: allSuccessful,
            metrics: {
                duration,
                tasks: parallelTasks.length,
                successRate: (successCount / parallelTasks.length) * 100
            },
            error: allSuccessful ? undefined : `Only ${successCount}/${parallelTasks.length} tasks succeeded`
        });
    }
    catch (error) {
        harness.recordResult('Parallel Execution', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function testErrorHandling(harness) {
    console.log('Testing error handling...');
    const processor = harness.getProcessor();
    const startTime = Date.now();
    try {
        // Add a task that will fail
        const taskId = await processor.addTask({
            type: 'invalid_type',
            payload: { data: 'test' },
            priority: 5,
            timeout: 5000,
            retries: 1,
            dependencies: []
        });
        // Wait for task to fail
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Error handling test timeout'));
            }, 10000);
            processor.on('taskCompleted', (result) => {
                if (result.taskId === taskId) {
                    clearTimeout(timeout);
                    if (!result.success && result.error) {
                        resolve();
                    }
                    else {
                        reject(new Error('Task should have failed but succeeded'));
                    }
                }
            });
        });
        const duration = Date.now() - startTime;
        harness.recordResult('Error Handling', {
            success: true,
            metrics: { duration }
        });
    }
    catch (error) {
        harness.recordResult('Error Handling', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function testMetricsCollection(harness) {
    console.log('Testing metrics collection...');
    const processor = harness.getProcessor();
    const startTime = Date.now();
    try {
        // Add several tasks to generate metrics
        const taskIds = await processor.addBatch([
            { type: 'compute', payload: { duration: 50 }, priority: 5, timeout: 5000, retries: 1, dependencies: [] },
            { type: 'io', payload: { delay: 100 }, priority: 5, timeout: 5000, retries: 1, dependencies: [] },
            { type: 'transform', payload: { data: 'test' }, priority: 5, timeout: 5000, retries: 1, dependencies: [] }
        ]);
        // Wait for tasks to complete
        let completedCount = 0;
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Metrics test timeout'));
            }, 10000);
            processor.on('taskCompleted', (result) => {
                if (taskIds.includes(result.taskId)) {
                    completedCount++;
                    if (completedCount === taskIds.length) {
                        clearTimeout(timeout);
                        resolve();
                    }
                }
            });
        });
        // Check metrics
        const metrics = processor.getMetrics();
        const detailedMetrics = processor.getDetailedMetrics();
        const hasBasicMetrics = metrics.totalTasks > 0 && metrics.completedTasks > 0;
        const hasDetailedMetrics = detailedMetrics.processor && detailedMetrics.queue && detailedMetrics.workers;
        const duration = Date.now() - startTime;
        harness.recordResult('Metrics Collection', {
            success: hasBasicMetrics && hasDetailedMetrics,
            metrics: {
                duration,
                totalTasks: metrics.totalTasks,
                completedTasks: metrics.completedTasks,
                workerUtilization: metrics.workerUtilization
            },
            error: hasBasicMetrics && hasDetailedMetrics ? undefined : 'Metrics not properly collected'
        });
    }
    catch (error) {
        harness.recordResult('Metrics Collection', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
async function testConcurrencyStress(harness) {
    console.log('Testing concurrency stress...');
    const processor = harness.getProcessor();
    const startTime = Date.now();
    const stressTaskCount = 50;
    try {
        // Create many concurrent tasks
        const tasks = Array.from({ length: stressTaskCount }, (_, i) => ({
            type: 'compute',
            payload: { duration: Math.random() * 100 + 50, index: i },
            priority: Math.floor(Math.random() * 10),
            timeout: 10000,
            retries: 1,
            dependencies: []
        }));
        const taskIds = await processor.addBatch(tasks);
        console.log(`Added ${taskIds.length} stress test tasks`);
        // Wait for all tasks to complete
        let completedCount = 0;
        let failedCount = 0;
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Stress test timeout'));
            }, 30000);
            processor.on('taskCompleted', (result) => {
                if (taskIds.includes(result.taskId)) {
                    if (result.success) {
                        completedCount++;
                    }
                    else {
                        failedCount++;
                    }
                    if (completedCount + failedCount === stressTaskCount) {
                        clearTimeout(timeout);
                        resolve();
                    }
                }
            });
        });
        const duration = Date.now() - startTime;
        const throughput = (completedCount / duration) * 1000;
        const successRate = (completedCount / stressTaskCount) * 100;
        harness.recordResult('Concurrency Stress Test', {
            success: successRate >= 95, // 95% success rate threshold
            metrics: {
                duration,
                tasks: stressTaskCount,
                completed: completedCount,
                failed: failedCount,
                throughput,
                successRate
            },
            error: successRate >= 95 ? undefined : `Success rate ${successRate.toFixed(1)}% below threshold`
        });
    }
    catch (error) {
        harness.recordResult('Concurrency Stress Test', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// Performance benchmark
async function benchmarkPerformance(harness) {
    console.log('Running performance benchmark...');
    const processor = harness.getProcessor();
    const benchmarkTasks = 50;
    const startTime = Date.now();
    try {
        // Create benchmark tasks
        const tasks = Array.from({ length: benchmarkTasks }, (_, i) => ({
            type: 'compute',
            payload: { duration: 10, index: i },
            priority: 5,
            timeout: 5000,
            retries: 1,
            dependencies: []
        }));
        const taskIds = await processor.addBatch(tasks);
        // Measure execution time
        let completedCount = 0;
        const completionTimes = [];
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Benchmark timeout'));
            }, 20000);
            processor.on('taskCompleted', (result) => {
                if (taskIds.includes(result.taskId)) {
                    completedCount++;
                    completionTimes.push(result.processingTime);
                    if (completedCount === benchmarkTasks) {
                        clearTimeout(timeout);
                        resolve();
                    }
                }
            });
        });
        const totalDuration = Date.now() - startTime;
        const throughput = (benchmarkTasks / totalDuration) * 1000;
        const avgProcessingTime = completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length;
        const maxProcessingTime = Math.max(...completionTimes);
        const minProcessingTime = Math.min(...completionTimes);
        harness.recordResult('Performance Benchmark', {
            success: true,
            metrics: {
                totalDuration,
                throughput,
                avgProcessingTime,
                maxProcessingTime,
                minProcessingTime,
                tasksPerSecond: throughput
            }
        });
    }
    catch (error) {
        harness.recordResult('Performance Benchmark', {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
// Main test runner
export async function runConcurrentProcessorTests() {
    console.log('🚀 Starting Concurrent Processor Tests...\n');
    const harness = new TestHarness();
    try {
        await harness.setup();
        // Run all tests
        await testBasicTaskExecution(harness);
        await testBatchTaskExecution(harness);
        await testPriorityTaskExecution(harness);
        await testDependencyHandling(harness);
        await testParallelExecution(harness);
        await testErrorHandling(harness);
        await testMetricsCollection(harness);
        await testConcurrencyStress(harness);
        await benchmarkPerformance(harness);
        // Print results
        harness.printResults();
    }
    catch (error) {
        console.error('Test harness error:', error);
    }
    finally {
        await harness.teardown();
    }
    console.log('✅ Concurrent Processor Tests Complete\n');
}
// Export for individual test execution
export { testBasicTaskExecution, testBatchTaskExecution, testPriorityTaskExecution, testDependencyHandling, testParallelExecution, testErrorHandling, testMetricsCollection, testConcurrencyStress, benchmarkPerformance, TestHarness };
// Auto-run tests if this file is executed directly
if (require.main === module) {
    runConcurrentProcessorTests().catch(console.error);
}
//# sourceMappingURL=test-concurrent-processor.js.map