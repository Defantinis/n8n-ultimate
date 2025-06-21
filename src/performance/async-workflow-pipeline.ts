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
import { Readable, Writable, Transform, pipeline } from 'stream';
import { promisify } from 'util';
import { ConcurrentProcessor } from './concurrent-processor';

const pipelineAsync = promisify(pipeline);

// Pipeline configuration
interface PipelineConfig {
    maxConcurrency: number;
    bufferSize: number;
    retryAttempts: number;
    retryDelay: number;
    enableBackpressure: boolean;
    timeoutMs: number;
    enableMetrics: boolean;
}

// Pipeline stage definition
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

// Pipeline context
interface PipelineContext {
    pipelineId: string;
    stageIndex: number;
    stageName: string;
    metadata: Map<string, any>;
    startTime: number;
    retryCount: number;
}

// Pipeline result
interface PipelineResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    metrics: PipelineMetrics;
    context: PipelineContext;
}

// Pipeline metrics
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

// Stream-based pipeline stage
class PipelineStageStream extends Transform {
    private stage: PipelineStage;
    private context: PipelineContext;
    private metrics: StageMetrics;

    constructor(stage: PipelineStage, context: PipelineContext) {
        super({ objectMode: true });
        this.stage = stage;
        this.context = context;
        this.metrics = {
            stageName: stage.name,
            duration: 0,
            inputCount: 0,
            outputCount: 0,
            errorCount: 0,
            retryCount: 0
        };
    }

    async _transform(chunk: any, encoding: string, callback: Function): Promise<void> {
        const startTime = Date.now();
        this.metrics.inputCount++;

        try {
            // Validate input if validator provided
            if (this.stage.validate && !this.stage.validate(chunk)) {
                throw new Error(`Input validation failed for stage ${this.stage.name}`);
            }

            // Transform input if transformer provided
            const input = this.stage.transform ? this.stage.transform(chunk) : chunk;

            // Process with timeout if specified
            let result;
            if (this.stage.timeout) {
                result = await this.processWithTimeout(input, this.stage.timeout);
            } else {
                result = await this.stage.process(input, this.context);
            }

            this.metrics.outputCount++;
            this.metrics.duration += Date.now() - startTime;

            callback(null, result);

        } catch (error) {
            this.metrics.errorCount++;
            
            // Try error handler if provided
            if (this.stage.onError) {
                try {
                    const recoveryResult = await this.stage.onError(error as Error, chunk);
                    if (recoveryResult !== null) {
                        this.metrics.outputCount++;
                        this.metrics.duration += Date.now() - startTime;
                        callback(null, recoveryResult);
                        return;
                    }
                } catch (recoveryError) {
                    // Recovery failed, fall through to error callback
                }
            }

            this.metrics.duration += Date.now() - startTime;
            callback(error);
        }
    }

    private async processWithTimeout(input: any, timeoutMs: number): Promise<any> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Stage ${this.stage.name} timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            this.stage.process(input, this.context)
                .then(result => {
                    clearTimeout(timeout);
                    resolve(result);
                })
                .catch(error => {
                    clearTimeout(timeout);
                    reject(error);
                });
        });
    }

    public getMetrics(): StageMetrics {
        return { ...this.metrics };
    }
}

// Async workflow pipeline
export class AsyncWorkflowPipeline extends EventEmitter {
    private config: PipelineConfig;
    private stages: PipelineStage[] = [];
    private concurrentProcessor: ConcurrentProcessor | null = null;
    private pipelineCounter = 0;
    private activePipelines = new Map<string, PipelineContext>();
    private globalMetrics: PipelineMetrics[] = [];

    constructor(config: Partial<PipelineConfig> = {}) {
        super();

        const defaultConfig: PipelineConfig = {
            maxConcurrency: 10,
            bufferSize: 1000,
            retryAttempts: 3,
            retryDelay: 1000,
            enableBackpressure: true,
            timeoutMs: 30000,
            enableMetrics: true
        };

        this.config = { ...defaultConfig, ...config };
    }

    // Configure concurrent processor for parallel stages
    public setConcurrentProcessor(processor: ConcurrentProcessor): void {
        this.concurrentProcessor = processor;
    }

    // Add pipeline stage
    public addStage<TInput, TOutput>(stage: PipelineStage<TInput, TOutput>): this {
        this.stages.push(stage);
        this.emit('stageAdded', { stageName: stage.name, stageCount: this.stages.length });
        return this;
    }

    // Remove stage by name
    public removeStage(stageName: string): boolean {
        const index = this.stages.findIndex(s => s.name === stageName);
        if (index !== -1) {
            this.stages.splice(index, 1);
            this.emit('stageRemoved', { stageName, stageCount: this.stages.length });
            return true;
        }
        return false;
    }

    // Execute pipeline with single input
    public async execute<TInput, TOutput>(
        input: TInput,
        metadata: Record<string, any> = {}
    ): Promise<PipelineResult<TOutput>> {
        const pipelineId = `pipeline_${this.pipelineCounter++}`;
        const startTime = Date.now();

        const context: PipelineContext = {
            pipelineId,
            stageIndex: 0,
            stageName: '',
            metadata: new Map(Object.entries(metadata)),
            startTime,
            retryCount: 0
        };

        this.activePipelines.set(pipelineId, context);
        this.emit('pipelineStarted', { pipelineId, input });

        try {
            let currentData: any = input;
            const stageMetrics: StageMetrics[] = [];

            // Execute stages sequentially
            for (let i = 0; i < this.stages.length; i++) {
                const stage = this.stages[i];
                context.stageIndex = i;
                context.stageName = stage.name;

                const stageStartTime = Date.now();
                
                try {
                    // Handle concurrent stages
                    if (stage.concurrent && this.concurrentProcessor) {
                        currentData = await this.executeConcurrentStage(stage, currentData, context);
                    } else {
                        currentData = await this.executeStage(stage, currentData, context);
                    }

                    stageMetrics.push({
                        stageName: stage.name,
                        duration: Date.now() - stageStartTime,
                        inputCount: 1,
                        outputCount: 1,
                        errorCount: 0,
                        retryCount: context.retryCount
                    });

                } catch (error) {
                    stageMetrics.push({
                        stageName: stage.name,
                        duration: Date.now() - stageStartTime,
                        inputCount: 1,
                        outputCount: 0,
                        errorCount: 1,
                        retryCount: context.retryCount
                    });

                    throw error;
                }
            }

            const totalDuration = Date.now() - startTime;
            const metrics: PipelineMetrics = {
                totalDuration,
                stageMetrics,
                throughput: 1000 / totalDuration,
                errorRate: 0,
                retryCount: context.retryCount
            };

            const result: PipelineResult<TOutput> = {
                success: true,
                data: currentData,
                metrics,
                context
            };

            this.activePipelines.delete(pipelineId);
            if (this.config.enableMetrics) {
                this.globalMetrics.push(metrics);
            }

            this.emit('pipelineCompleted', { pipelineId, result });
            return result;

        } catch (error) {
            const totalDuration = Date.now() - startTime;
            const metrics: PipelineMetrics = {
                totalDuration,
                stageMetrics: [],
                throughput: 0,
                errorRate: 1,
                retryCount: context.retryCount
            };

            const result: PipelineResult<TOutput> = {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                metrics,
                context
            };

            this.activePipelines.delete(pipelineId);
            this.emit('pipelineError', { pipelineId, error, result });
            return result;
        }
    }

    // Execute pipeline with stream of inputs
    public async executeStream<TInput, TOutput>(
        inputStream: Readable,
        outputStream: Writable
    ): Promise<PipelineMetrics> {
        const startTime = Date.now();
        const stageStreams: Transform[] = [];
        let totalProcessed = 0;
        let totalErrors = 0;

        // Create stream for each stage
        for (let i = 0; i < this.stages.length; i++) {
            const stage = this.stages[i];
            const context: PipelineContext = {
                pipelineId: `stream_${Date.now()}`,
                stageIndex: i,
                stageName: stage.name,
                metadata: new Map(),
                startTime,
                retryCount: 0
            };

            const stageStream = new PipelineStageStream(stage, context);
            stageStreams.push(stageStream);
        }

        // Create counting streams
        const inputCounter = new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                totalProcessed++;
                callback(null, chunk);
            }
        });

        const errorCounter = new Transform({
            objectMode: true,
            transform(chunk, encoding, callback) {
                callback(null, chunk);
            }
        });

        errorCounter.on('error', () => {
            totalErrors++;
        });

        try {
            // Build pipeline: input -> counter -> stages -> error counter -> output
            await pipelineAsync(
                inputStream,
                inputCounter,
                ...stageStreams,
                errorCounter,
                outputStream
            );

            const totalDuration = Date.now() - startTime;
            const stageMetrics = stageStreams.map(s => (s as PipelineStageStream).getMetrics());

            const metrics: PipelineMetrics = {
                totalDuration,
                stageMetrics,
                throughput: totalProcessed > 0 ? (totalProcessed / totalDuration) * 1000 : 0,
                errorRate: totalProcessed > 0 ? totalErrors / totalProcessed : 0,
                retryCount: stageMetrics.reduce((sum, m) => sum + m.retryCount, 0)
            };

            this.emit('streamCompleted', { totalProcessed, totalErrors, metrics });
            return metrics;

        } catch (error) {
            this.emit('streamError', { error, totalProcessed, totalErrors });
            throw error;
        }
    }

    // Execute batch of inputs with concurrency control
    public async executeBatch<TInput, TOutput>(
        inputs: TInput[],
        options: { 
            maxConcurrency?: number; 
            failFast?: boolean; 
            metadata?: Record<string, any> 
        } = {}
    ): Promise<PipelineResult<TOutput>[]> {
        const maxConcurrency = options.maxConcurrency || this.config.maxConcurrency;
        const failFast = options.failFast || false;
        const metadata = options.metadata || {};

        const results: PipelineResult<TOutput>[] = [];
        const executing: Promise<PipelineResult<TOutput>>[] = [];

        for (const [index, input] of inputs.entries()) {
            const promise = this.execute<TInput, TOutput>(input, {
                ...metadata,
                batchIndex: index,
                batchSize: inputs.length
            });

            executing.push(promise);

            if (executing.length >= maxConcurrency) {
                const result = await Promise.race(executing);
                results.push(result);
                
                // Remove completed promise
                const completedIndex = executing.findIndex(p => p === promise);
                if (completedIndex !== -1) {
                    executing.splice(completedIndex, 1);
                }

                // Fail fast if enabled and result failed
                if (failFast && !result.success) {
                    throw new Error(`Batch execution failed at index ${index}: ${result.error}`);
                }
            }
        }

        // Wait for remaining executions
        const remainingResults = await Promise.all(executing);
        results.push(...remainingResults);

        this.emit('batchCompleted', { 
            totalInputs: inputs.length, 
            totalResults: results.length,
            successRate: results.filter(r => r.success).length / results.length
        });

        return results;
    }

    // Execute stage with retry logic
    private async executeStage(
        stage: PipelineStage,
        input: any,
        context: PipelineContext
    ): Promise<any> {
        const maxRetries = stage.maxRetries || this.config.retryAttempts;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                // Validate input
                if (stage.validate && !stage.validate(input)) {
                    throw new Error(`Input validation failed for stage ${stage.name}`);
                }

                // Transform input
                const processInput = stage.transform ? stage.transform(input) : input;

                // Execute with timeout
                const result = stage.timeout 
                    ? await this.executeWithTimeout(stage.process, processInput, context, stage.timeout)
                    : await stage.process(processInput, context);

                return result;

            } catch (error) {
                lastError = error as Error;
                context.retryCount++;

                if (attempt < maxRetries) {
                    this.emit('stageRetry', { 
                        stageName: stage.name, 
                        attempt: attempt + 1, 
                        maxRetries, 
                        error: lastError.message 
                    });

                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, this.config.retryDelay));
                } else {
                    // Try error handler on final attempt
                    if (stage.onError) {
                        try {
                            const recoveryResult = await stage.onError(lastError, input);
                            if (recoveryResult !== null) {
                                return recoveryResult;
                            }
                        } catch (recoveryError) {
                            // Recovery failed, throw original error
                        }
                    }
                }
            }
        }

        throw lastError || new Error(`Stage ${stage.name} failed after ${maxRetries} attempts`);
    }

    // Execute stage using concurrent processor
    private async executeConcurrentStage(
        stage: PipelineStage,
        input: any,
        context: PipelineContext
    ): Promise<any> {
        if (!this.concurrentProcessor) {
            throw new Error('Concurrent processor not configured');
        }

        return new Promise((resolve, reject) => {
            this.concurrentProcessor!.addTask({
                type: 'pipeline_stage',
                payload: { stage, input, context },
                priority: 5,
                timeout: stage.timeout || this.config.timeoutMs,
                retries: stage.maxRetries || this.config.retryAttempts,
                dependencies: []
            }).then(taskId => {
                const handler = (result: any) => {
                    if (result.taskId === taskId) {
                        this.concurrentProcessor!.off('taskCompleted', handler);
                        if (result.success) {
                            resolve(result.result);
                        } else {
                            reject(new Error(result.error));
                        }
                    }
                };

                this.concurrentProcessor!.on('taskCompleted', handler);
            }).catch(reject);
        });
    }

    // Execute function with timeout
    private async executeWithTimeout<T>(
        fn: Function,
        input: any,
        context: PipelineContext,
        timeoutMs: number
    ): Promise<T> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Stage execution timed out after ${timeoutMs}ms`));
            }, timeoutMs);

            fn(input, context)
                .then((result: T) => {
                    clearTimeout(timeout);
                    resolve(result);
                })
                .catch((error: Error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
        });
    }

    // Get pipeline metrics
    public getMetrics(): {
        totalPipelines: number;
        activePipelines: number;
        averageDuration: number;
        averageThroughput: number;
        overallErrorRate: number;
        stagePerformance: Map<string, StageMetrics>;
    } {
        const totalPipelines = this.globalMetrics.length;
        const activePipelines = this.activePipelines.size;

        if (totalPipelines === 0) {
            return {
                totalPipelines: 0,
                activePipelines,
                averageDuration: 0,
                averageThroughput: 0,
                overallErrorRate: 0,
                stagePerformance: new Map()
            };
        }

        const averageDuration = this.globalMetrics.reduce((sum, m) => sum + m.totalDuration, 0) / totalPipelines;
        const averageThroughput = this.globalMetrics.reduce((sum, m) => sum + m.throughput, 0) / totalPipelines;
        const overallErrorRate = this.globalMetrics.reduce((sum, m) => sum + m.errorRate, 0) / totalPipelines;

        // Aggregate stage performance
        const stagePerformance = new Map<string, StageMetrics>();
        for (const metrics of this.globalMetrics) {
            for (const stageMetric of metrics.stageMetrics) {
                const existing = stagePerformance.get(stageMetric.stageName);
                if (existing) {
                    existing.duration += stageMetric.duration;
                    existing.inputCount += stageMetric.inputCount;
                    existing.outputCount += stageMetric.outputCount;
                    existing.errorCount += stageMetric.errorCount;
                    existing.retryCount += stageMetric.retryCount;
                } else {
                    stagePerformance.set(stageMetric.stageName, { ...stageMetric });
                }
            }
        }

        return {
            totalPipelines,
            activePipelines,
            averageDuration,
            averageThroughput,
            overallErrorRate,
            stagePerformance
        };
    }

    // Clear metrics
    public clearMetrics(): void {
        this.globalMetrics.length = 0;
        this.emit('metricsCleared');
    }

    // Get active pipelines
    public getActivePipelines(): PipelineContext[] {
        return Array.from(this.activePipelines.values());
    }

    // Clear all stages
    public clearStages(): void {
        this.stages.length = 0;
        this.emit('stagesCleared');
    }
}

export default AsyncWorkflowPipeline; 