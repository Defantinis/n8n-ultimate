/**
 * Async Workflow Pipeline System
 *
 * Provides advanced async workflow execution capabilities:
 * - Pipeline stage management
 * - Async/await optimization
 * - Stream processing
 * - Backpressure handling
 * - Error recovery and retry logic
 */
import { EventEmitter } from 'events';
import { Readable, Writable } from 'stream';
import { ConcurrentProcessor } from './concurrent-processor';
interface PipelineConfig {
    maxConcurrency: number;
    bufferSize: number;
    retryAttempts: number;
    retryDelay: number;
    enableBackpressure: boolean;
    timeoutMs: number;
    enableMetrics: boolean;
}
interface PipelineStage<TInput = any, TOutput = any> {
    name: string;
    process: (input: TInput, context: PipelineContext) => Promise<TOutput>;
    validate?: (input: TInput) => boolean;
    transform?: (input: TInput) => TInput;
    onError?: (error: Error, input: TInput) => Promise<TOutput | null>;
    maxRetries?: number;
    timeout?: number;
    concurrent?: boolean;
}
interface PipelineContext {
    pipelineId: string;
    stageIndex: number;
    stageName: string;
    metadata: Map<string, any>;
    startTime: number;
    retryCount: number;
}
interface PipelineResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metrics: PipelineMetrics;
    context: PipelineContext;
}
interface PipelineMetrics {
    totalDuration: number;
    stageMetrics: StageMetrics[];
    throughput: number;
    errorRate: number;
    retryCount: number;
}
interface StageMetrics {
    stageName: string;
    duration: number;
    inputCount: number;
    outputCount: number;
    errorCount: number;
    retryCount: number;
}
export declare class AsyncWorkflowPipeline extends EventEmitter {
    private config;
    private stages;
    private concurrentProcessor;
    private pipelineCounter;
    private activePipelines;
    private globalMetrics;
    constructor(config?: Partial<PipelineConfig>);
    setConcurrentProcessor(processor: ConcurrentProcessor): void;
    addStage<TInput, TOutput>(stage: PipelineStage<TInput, TOutput>): this;
    removeStage(stageName: string): boolean;
    execute<TInput, TOutput>(input: TInput, metadata?: Record<string, any>): Promise<PipelineResult<TOutput>>;
    executeStream<TInput, TOutput>(inputStream: Readable, outputStream: Writable): Promise<PipelineMetrics>;
    executeBatch<TInput, TOutput>(inputs: TInput[], options?: {
        maxConcurrency?: number;
        failFast?: boolean;
        metadata?: Record<string, any>;
    }): Promise<PipelineResult<TOutput>[]>;
    private executeStage;
    private executeConcurrentStage;
    private executeWithTimeout;
    getMetrics(): {
        totalPipelines: number;
        activePipelines: number;
        averageDuration: number;
        averageThroughput: number;
        overallErrorRate: number;
        stagePerformance: Map<string, StageMetrics>;
    };
    clearMetrics(): void;
    getActivePipelines(): PipelineContext[];
    clearStages(): void;
}
export default AsyncWorkflowPipeline;
//# sourceMappingURL=async-workflow-pipeline.d.ts.map