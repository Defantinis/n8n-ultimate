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
import { Transform, pipeline } from 'stream';
import { promisify } from 'util';
const pipelineAsync = promisify(pipeline);
// Stream-based pipeline stage
class PipelineStageStream extends Transform {
    stage;
    context;
    metrics;
    constructor(stage, context) {
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
    async _transform(chunk, encoding, callback) {
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
            }
            else {
                result = await this.stage.process(input, this.context);
            }
            this.metrics.outputCount++;
            this.metrics.duration += Date.now() - startTime;
            callback(null, result);
        }
        catch (error) {
            this.metrics.errorCount++;
            // Try error handler if provided
            if (this.stage.onError) {
                try {
                    const recoveryResult = await this.stage.onError(error, chunk);
                    if (recoveryResult !== null) {
                        this.metrics.outputCount++;
                        this.metrics.duration += Date.now() - startTime;
                        callback(null, recoveryResult);
                        return;
                    }
                }
                catch (recoveryError) {
                    // Recovery failed, fall through to error callback
                }
            }
            this.metrics.duration += Date.now() - startTime;
            callback(error);
        }
    }
    async processWithTimeout(input, timeoutMs) {
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
    getMetrics() {
        return { ...this.metrics };
    }
}
// Async workflow pipeline
export class AsyncWorkflowPipeline extends EventEmitter {
    config;
    stages = [];
    concurrentProcessor = null;
    pipelineCounter = 0;
    activePipelines = new Map();
    globalMetrics = [];
    constructor(config = {}) {
        super();
        const defaultConfig = {
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
    setConcurrentProcessor(processor) {
        this.concurrentProcessor = processor;
    }
    // Add pipeline stage
    addStage(stage) {
        this.stages.push(stage);
        this.emit('stageAdded', { stageName: stage.name, stageCount: this.stages.length });
        return this;
    }
    // Remove stage by name
    removeStage(stageName) {
        const index = this.stages.findIndex(s => s.name === stageName);
        if (index !== -1) {
            this.stages.splice(index, 1);
            this.emit('stageRemoved', { stageName, stageCount: this.stages.length });
            return true;
        }
        return false;
    }
    // Execute pipeline with single input
    async execute(input, metadata = {}) {
        const pipelineId = `pipeline_${this.pipelineCounter++}`;
        const startTime = Date.now();
        const context = {
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
            let currentData = input;
            const stageMetrics = [];
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
                    }
                    else {
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
                }
                catch (error) {
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
            const metrics = {
                totalDuration,
                stageMetrics,
                throughput: 1000 / totalDuration,
                errorRate: 0,
                retryCount: context.retryCount
            };
            const result = {
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
        }
        catch (error) {
            const totalDuration = Date.now() - startTime;
            const metrics = {
                totalDuration,
                stageMetrics: [],
                throughput: 0,
                errorRate: 1,
                retryCount: context.retryCount
            };
            const result = {
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
    async executeStream(inputStream, outputStream) {
        const startTime = Date.now();
        const stageStreams = [];
        let totalProcessed = 0;
        let totalErrors = 0;
        // Create stream for each stage
        for (let i = 0; i < this.stages.length; i++) {
            const stage = this.stages[i];
            const context = {
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
            await pipelineAsync(inputStream, inputCounter, ...stageStreams, errorCounter, outputStream);
            const totalDuration = Date.now() - startTime;
            const stageMetrics = stageStreams.map(s => s.getMetrics());
            const metrics = {
                totalDuration,
                stageMetrics,
                throughput: totalProcessed > 0 ? (totalProcessed / totalDuration) * 1000 : 0,
                errorRate: totalProcessed > 0 ? totalErrors / totalProcessed : 0,
                retryCount: stageMetrics.reduce((sum, m) => sum + m.retryCount, 0)
            };
            this.emit('streamCompleted', { totalProcessed, totalErrors, metrics });
            return metrics;
        }
        catch (error) {
            this.emit('streamError', { error, totalProcessed, totalErrors });
            throw error;
        }
    }
    // Execute batch of inputs with concurrency control
    async executeBatch(inputs, options = {}) {
        const maxConcurrency = options.maxConcurrency || this.config.maxConcurrency;
        const failFast = options.failFast || false;
        const metadata = options.metadata || {};
        const results = [];
        const executing = [];
        for (const [index, input] of inputs.entries()) {
            const promise = this.execute(input, {
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
    async executeStage(stage, input, context) {
        const maxRetries = stage.maxRetries || this.config.retryAttempts;
        let lastError = null;
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
            }
            catch (error) {
                lastError = error;
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
                }
                else {
                    // Try error handler on final attempt
                    if (stage.onError) {
                        try {
                            const recoveryResult = await stage.onError(lastError, input);
                            if (recoveryResult !== null) {
                                return recoveryResult;
                            }
                        }
                        catch (recoveryError) {
                            // Recovery failed, throw original error
                        }
                    }
                }
            }
        }
        throw lastError || new Error(`Stage ${stage.name} failed after ${maxRetries} attempts`);
    }
    // Execute stage using concurrent processor
    async executeConcurrentStage(stage, input, context) {
        if (!this.concurrentProcessor) {
            throw new Error('Concurrent processor not configured');
        }
        return new Promise((resolve, reject) => {
            this.concurrentProcessor.addTask({
                type: 'pipeline_stage',
                payload: { stage, input, context },
                priority: 5,
                timeout: stage.timeout || this.config.timeoutMs,
                retries: stage.maxRetries || this.config.retryAttempts,
                dependencies: []
            }).then(taskId => {
                const handler = (result) => {
                    if (result.taskId === taskId) {
                        this.concurrentProcessor.off('taskCompleted', handler);
                        if (result.success) {
                            resolve(result.result);
                        }
                        else {
                            reject(new Error(result.error));
                        }
                    }
                };
                this.concurrentProcessor.on('taskCompleted', handler);
            }).catch(reject);
        });
    }
    // Execute function with timeout
    async executeWithTimeout(fn, input, context, timeoutMs) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Stage execution timed out after ${timeoutMs}ms`));
            }, timeoutMs);
            fn(input, context)
                .then((result) => {
                clearTimeout(timeout);
                resolve(result);
            })
                .catch((error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }
    // Get pipeline metrics
    getMetrics() {
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
        const stagePerformance = new Map();
        for (const metrics of this.globalMetrics) {
            for (const stageMetric of metrics.stageMetrics) {
                const existing = stagePerformance.get(stageMetric.stageName);
                if (existing) {
                    existing.duration += stageMetric.duration;
                    existing.inputCount += stageMetric.inputCount;
                    existing.outputCount += stageMetric.outputCount;
                    existing.errorCount += stageMetric.errorCount;
                    existing.retryCount += stageMetric.retryCount;
                }
                else {
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
    clearMetrics() {
        this.globalMetrics.length = 0;
        this.emit('metricsCleared');
    }
    // Get active pipelines
    getActivePipelines() {
        return Array.from(this.activePipelines.values());
    }
    // Clear all stages
    clearStages() {
        this.stages.length = 0;
        this.emit('stagesCleared');
    }
}
export default AsyncWorkflowPipeline;
//# sourceMappingURL=async-workflow-pipeline.js.map