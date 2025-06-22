/**
 * Concurrent Processing System for Node.js
 * Implements worker threads, task queues, and parallel execution strategies
 */
import { EventEmitter } from 'events';
interface ConcurrentProcessorConfig {
    maxWorkers: number;
    taskQueueSize: number;
    workerTimeout: number;
    enablePriority: boolean;
    retryAttempts: number;
    batchSize: number;
}
interface Task {
    id: string;
    type: string;
    payload: any;
    priority: number;
    timeout: number;
    retries: number;
    dependencies: string[];
    timestamp: number;
}
interface ProcessingMetrics {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    averageProcessingTime: number;
    throughput: number;
    workerUtilization: number;
    queueSize: number;
    activeWorkers: number;
}
export declare class ConcurrentProcessor extends EventEmitter {
    private config;
    private taskQueue;
    private workerPool;
    private parallelExecutor;
    private isProcessing;
    private processingInterval;
    private metrics;
    constructor(config?: Partial<ConcurrentProcessorConfig>);
    private setupEventHandlers;
    addTask(task: Omit<Task, 'id' | 'timestamp'>): Promise<string>;
    addBatch(tasks: Array<Omit<Task, 'id' | 'timestamp'>>): Promise<string[]>;
    private startProcessing;
    private processQueue;
    private stopProcessing;
    private updateMetrics;
    executeParallel<T>(tasks: Array<() => Promise<T>>, options?: {
        batchSize?: number;
        concurrencyLimit?: number;
    }): Promise<Array<{
        success: boolean;
        result?: T;
        error?: string;
    }>>;
    getMetrics(): ProcessingMetrics;
    getDetailedMetrics(): any;
    close(): Promise<void>;
}
export default ConcurrentProcessor;
//# sourceMappingURL=concurrent-processor.d.ts.map