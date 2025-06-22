/**
 * Concurrent Processing System for Node.js
 * Implements worker threads, task queues, and parallel execution strategies
 */
import { EventEmitter } from 'events';
import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { cpus } from 'os';
// Task Queue Manager
class TaskQueue extends EventEmitter {
    queue = [];
    priorityQueue = [];
    completedTasks = new Map();
    dependencyMap = new Map();
    maxSize;
    constructor(maxSize = 10000) {
        super();
        this.maxSize = maxSize;
    }
    enqueue(task) {
        if (this.queue.length + this.priorityQueue.length >= this.maxSize) {
            this.emit('queueFull', { taskId: task.id, queueSize: this.getTotalSize() });
            return false;
        }
        // Handle dependencies
        if (task.dependencies.length > 0) {
            this.dependencyMap.set(task.id, task.dependencies);
        }
        // Add to appropriate queue based on priority
        if (task.priority > 5) {
            this.priorityQueue.push(task);
            this.priorityQueue.sort((a, b) => b.priority - a.priority);
        }
        else {
            this.queue.push(task);
        }
        this.emit('taskEnqueued', { taskId: task.id, queueSize: this.getTotalSize() });
        return true;
    }
    dequeue() {
        // Check priority queue first
        let task = this.getNextAvailableTask(this.priorityQueue);
        if (task) {
            this.priorityQueue.splice(this.priorityQueue.indexOf(task), 1);
            return task;
        }
        // Check regular queue
        task = this.getNextAvailableTask(this.queue);
        if (task) {
            this.queue.splice(this.queue.indexOf(task), 1);
            return task;
        }
        return null;
    }
    getNextAvailableTask(queue) {
        for (const task of queue) {
            if (this.areDependenciesSatisfied(task)) {
                return task;
            }
        }
        return null;
    }
    areDependenciesSatisfied(task) {
        const dependencies = this.dependencyMap.get(task.id) || [];
        return dependencies.every(depId => this.completedTasks.has(depId));
    }
    markTaskCompleted(taskId, result) {
        this.completedTasks.set(taskId, result);
        this.dependencyMap.delete(taskId);
        this.emit('taskCompleted', result);
    }
    getTotalSize() {
        return this.queue.length + this.priorityQueue.length;
    }
    getMetrics() {
        return {
            queueSize: this.queue.length,
            priorityQueueSize: this.priorityQueue.length,
            totalSize: this.getTotalSize(),
            completedTasks: this.completedTasks.size,
            pendingDependencies: this.dependencyMap.size
        };
    }
    clear() {
        this.queue.length = 0;
        this.priorityQueue.length = 0;
        this.completedTasks.clear();
        this.dependencyMap.clear();
    }
}
// Worker Pool Manager
class WorkerPool extends EventEmitter {
    workers = new Map();
    availableWorkers = [];
    maxWorkers;
    workerScript;
    workerCounter = 0;
    constructor(maxWorkers, workerScript) {
        super();
        this.maxWorkers = maxWorkers;
        this.workerScript = workerScript;
        this.initializeWorkers();
    }
    initializeWorkers() {
        for (let i = 0; i < this.maxWorkers; i++) {
            this.createWorker();
        }
    }
    createWorker() {
        const workerId = this.workerCounter++;
        const worker = new Worker(this.workerScript, {
            workerData: { workerId, isWorker: true }
        });
        const workerInfo = {
            id: workerId,
            worker,
            busy: false,
            currentTask: null,
            tasksCompleted: 0,
            totalProcessingTime: 0,
            lastActivity: Date.now(),
            errors: 0
        };
        worker.on('message', (result) => {
            this.handleWorkerMessage(workerId, result);
        });
        worker.on('error', (error) => {
            this.handleWorkerError(workerId, error);
        });
        worker.on('exit', (code) => {
            if (code !== 0) {
                this.handleWorkerExit(workerId, code);
            }
        });
        this.workers.set(workerId, workerInfo);
        this.availableWorkers.push(workerId);
        this.emit('workerCreated', { workerId, totalWorkers: this.workers.size });
        return workerId;
    }
    getAvailableWorker() {
        return this.availableWorkers.shift() || null;
    }
    assignTask(workerId, task) {
        const workerInfo = this.workers.get(workerId);
        if (!workerInfo) {
            throw new Error(`Worker ${workerId} not found`);
        }
        workerInfo.busy = true;
        workerInfo.currentTask = task.id;
        workerInfo.lastActivity = Date.now();
        workerInfo.worker.postMessage({
            task,
            timeout: task.timeout
        });
        this.emit('taskAssigned', { workerId, taskId: task.id });
    }
    handleWorkerMessage(workerId, result) {
        const workerInfo = this.workers.get(workerId);
        if (!workerInfo)
            return;
        const processingTime = Date.now() - workerInfo.lastActivity;
        workerInfo.busy = false;
        workerInfo.currentTask = null;
        workerInfo.tasksCompleted++;
        workerInfo.totalProcessingTime += processingTime;
        workerInfo.lastActivity = Date.now();
        this.availableWorkers.push(workerId);
        const taskResult = {
            taskId: result.taskId,
            success: result.success,
            result: result.data,
            error: result.error,
            processingTime,
            workerId
        };
        this.emit('taskCompleted', taskResult);
    }
    handleWorkerError(workerId, error) {
        const workerInfo = this.workers.get(workerId);
        if (workerInfo) {
            workerInfo.errors++;
            this.emit('workerError', { workerId, error: error.message });
        }
        this.replaceWorker(workerId);
    }
    handleWorkerExit(workerId, code) {
        this.emit('workerExit', { workerId, exitCode: code });
        this.replaceWorker(workerId);
    }
    replaceWorker(workerId) {
        const workerInfo = this.workers.get(workerId);
        if (workerInfo) {
            workerInfo.worker.terminate();
            this.workers.delete(workerId);
            // Remove from available workers if present
            const index = this.availableWorkers.indexOf(workerId);
            if (index !== -1) {
                this.availableWorkers.splice(index, 1);
            }
        }
        // Create replacement worker
        this.createWorker();
    }
    getMetrics() {
        const totalTasks = Array.from(this.workers.values()).reduce((sum, w) => sum + w.tasksCompleted, 0);
        const totalProcessingTime = Array.from(this.workers.values()).reduce((sum, w) => sum + w.totalProcessingTime, 0);
        const busyWorkers = Array.from(this.workers.values()).filter(w => w.busy).length;
        return {
            totalWorkers: this.workers.size,
            availableWorkers: this.availableWorkers.length,
            busyWorkers,
            utilization: busyWorkers / this.workers.size,
            totalTasksCompleted: totalTasks,
            averageProcessingTime: totalTasks > 0 ? totalProcessingTime / totalTasks : 0,
            workerDetails: Array.from(this.workers.values()).map(w => ({
                id: w.id,
                busy: w.busy,
                tasksCompleted: w.tasksCompleted,
                errors: w.errors,
                averageTime: w.tasksCompleted > 0 ? w.totalProcessingTime / w.tasksCompleted : 0
            }))
        };
    }
    async terminate() {
        const terminationPromises = Array.from(this.workers.values()).map(w => w.worker.terminate());
        await Promise.all(terminationPromises);
        this.workers.clear();
        this.availableWorkers.length = 0;
    }
}
// Parallel Execution Manager
class ParallelExecutionManager extends EventEmitter {
    concurrencyLimit;
    constructor(concurrencyLimit = 10) {
        super();
        this.concurrencyLimit = concurrencyLimit;
    }
    async executeParallel(tasks, batchSize) {
        const actualBatchSize = batchSize || this.concurrencyLimit;
        const results = [];
        for (let i = 0; i < tasks.length; i += actualBatchSize) {
            const batch = tasks.slice(i, i + actualBatchSize);
            const batchPromises = batch.map(async (task, index) => {
                try {
                    const result = await task();
                    return { success: true, result, index: i + index };
                }
                catch (error) {
                    return {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        index: i + index
                    };
                }
            });
            const batchResults = await Promise.allSettled(batchPromises);
            for (const settledResult of batchResults) {
                if (settledResult.status === 'fulfilled') {
                    results[settledResult.value.index] = settledResult.value;
                }
                else {
                    results.push({
                        success: false,
                        error: settledResult.reason?.message || 'Promise rejected'
                    });
                }
            }
            this.emit('batchCompleted', {
                batchIndex: Math.floor(i / actualBatchSize),
                completedTasks: Math.min(i + actualBatchSize, tasks.length),
                totalTasks: tasks.length
            });
        }
        return results;
    }
    async executeWithConcurrencyLimit(tasks) {
        const results = [];
        const executing = [];
        for (const [index, task] of tasks.entries()) {
            const promise = task().then(result => {
                results[index] = result;
            });
            executing.push(promise);
            if (executing.length >= this.concurrencyLimit) {
                await Promise.race(executing);
                executing.splice(executing.findIndex(p => p === promise), 1);
            }
        }
        await Promise.all(executing);
        return results;
    }
}
// Main Concurrent Processor
export class ConcurrentProcessor extends EventEmitter {
    config;
    taskQueue;
    workerPool;
    parallelExecutor;
    isProcessing = false;
    processingInterval = null;
    metrics;
    constructor(config = {}) {
        super();
        const defaultConfig = {
            maxWorkers: cpus().length,
            taskQueueSize: 10000,
            workerTimeout: 30000,
            enablePriority: true,
            retryAttempts: 3,
            batchSize: 10
        };
        this.config = { ...defaultConfig, ...config };
        this.taskQueue = new TaskQueue(this.config.taskQueueSize);
        this.workerPool = new WorkerPool(this.config.maxWorkers, __filename);
        this.parallelExecutor = new ParallelExecutionManager(this.config.maxWorkers);
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageProcessingTime: 0,
            throughput: 0,
            workerUtilization: 0,
            queueSize: 0,
            activeWorkers: 0
        };
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.taskQueue.on('taskCompleted', (result) => {
            this.updateMetrics(result);
            this.emit('taskCompleted', result);
        });
        this.workerPool.on('taskCompleted', (result) => {
            this.taskQueue.markTaskCompleted(result.taskId, result);
        });
        this.workerPool.on('workerError', (data) => {
            this.emit('workerError', data);
        });
        this.parallelExecutor.on('batchCompleted', (data) => {
            this.emit('batchCompleted', data);
        });
    }
    async addTask(task) {
        const fullTask = {
            id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            ...task
        };
        const added = this.taskQueue.enqueue(fullTask);
        if (!added) {
            throw new Error('Task queue is full');
        }
        this.metrics.totalTasks++;
        if (!this.isProcessing) {
            this.startProcessing();
        }
        return fullTask.id;
    }
    async addBatch(tasks) {
        const taskIds = [];
        for (const task of tasks) {
            try {
                const taskId = await this.addTask(task);
                taskIds.push(taskId);
            }
            catch (error) {
                this.emit('batchError', { task, error });
            }
        }
        return taskIds;
    }
    startProcessing() {
        if (this.isProcessing)
            return;
        this.isProcessing = true;
        this.processingInterval = setInterval(() => {
            this.processQueue();
        }, 100); // Check every 100ms
        this.emit('processingStarted');
    }
    processQueue() {
        const availableWorker = this.workerPool.getAvailableWorker();
        if (!availableWorker)
            return;
        const task = this.taskQueue.dequeue();
        if (!task) {
            // No tasks available, check if we should stop processing
            if (this.taskQueue.getTotalSize() === 0) {
                this.stopProcessing();
            }
            return;
        }
        this.workerPool.assignTask(availableWorker, task);
    }
    stopProcessing() {
        if (!this.isProcessing)
            return;
        this.isProcessing = false;
        if (this.processingInterval) {
            clearInterval(this.processingInterval);
            this.processingInterval = null;
        }
        this.emit('processingStopped');
    }
    updateMetrics(result) {
        if (result.success) {
            this.metrics.completedTasks++;
        }
        else {
            this.metrics.failedTasks++;
        }
        // Update average processing time
        const totalCompleted = this.metrics.completedTasks + this.metrics.failedTasks;
        this.metrics.averageProcessingTime =
            ((this.metrics.averageProcessingTime * (totalCompleted - 1)) + result.processingTime) / totalCompleted;
        // Update other metrics
        const workerMetrics = this.workerPool.getMetrics();
        this.metrics.workerUtilization = workerMetrics.utilization;
        this.metrics.activeWorkers = workerMetrics.busyWorkers;
        this.metrics.queueSize = this.taskQueue.getTotalSize();
    }
    async executeParallel(tasks, options = {}) {
        const batchSize = options.batchSize || this.config.batchSize;
        return await this.parallelExecutor.executeParallel(tasks, batchSize);
    }
    getMetrics() {
        return { ...this.metrics };
    }
    getDetailedMetrics() {
        return {
            processor: this.getMetrics(),
            queue: this.taskQueue.getMetrics(),
            workers: this.workerPool.getMetrics(),
            isProcessing: this.isProcessing
        };
    }
    async close() {
        this.stopProcessing();
        await this.workerPool.terminate();
        this.taskQueue.clear();
        this.emit('closed');
    }
}
// Worker thread implementation
if (!isMainThread && workerData?.isWorker) {
    parentPort?.on('message', async ({ task, timeout }) => {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Task timeout')), timeout);
        });
        try {
            // Execute the task based on its type
            const resultPromise = executeTask(task);
            const result = await Promise.race([resultPromise, timeoutPromise]);
            parentPort?.postMessage({
                taskId: task.id,
                success: true,
                data: result
            });
        }
        catch (error) {
            parentPort?.postMessage({
                taskId: task.id,
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    });
    async function executeTask(task) {
        // Task execution logic based on task type
        switch (task.type) {
            case 'compute':
                return await computeTask(task.payload);
            case 'io':
                return await ioTask(task.payload);
            case 'transform':
                return await transformTask(task.payload);
            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    }
    async function computeTask(payload) {
        // Simulate CPU-intensive work
        const start = Date.now();
        while (Date.now() - start < (payload.duration || 100)) {
            Math.random() * Math.random();
        }
        return { computed: true, duration: Date.now() - start };
    }
    async function ioTask(payload) {
        // Simulate I/O work
        await new Promise(resolve => setTimeout(resolve, payload.delay || 50));
        return { processed: payload.data };
    }
    async function transformTask(payload) {
        // Simulate data transformation
        return {
            original: payload,
            transformed: JSON.stringify(payload).split('').reverse().join(''),
            timestamp: Date.now()
        };
    }
}
export default ConcurrentProcessor;
//# sourceMappingURL=concurrent-processor.js.map