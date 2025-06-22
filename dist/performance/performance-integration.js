/**
 * Performance Integration Layer
 * Connects performance monitoring with the workflow generation system
 */
import { EventEmitter } from 'events';
import { getPerformanceMonitor } from './performance-monitor';
/**
 * Performance Integration Manager
 */
export class PerformanceIntegrationManager extends EventEmitter {
    config;
    monitor;
    memoryManager;
    cacheManager;
    pipeline;
    workflowMetrics = new Map();
    activeWorkflows = new Map();
    isIntegrated = false;
    constructor(config = {}) {
        super();
        this.config = this.mergeConfig(config);
        this.monitor = getPerformanceMonitor();
        this.setupEventListeners();
    }
    /**
     * Initialize performance integration
     */
    async initialize(components) {
        if (this.isIntegrated) {
            return;
        }
        // Connect to performance components
        if (components?.memoryManager) {
            this.memoryManager = components.memoryManager;
            this.integrateMemoryManager();
        }
        if (components?.cacheManager) {
            this.cacheManager = components.cacheManager;
            this.integrateCacheManager();
        }
        if (components?.pipeline) {
            this.pipeline = components.pipeline;
            this.integratePipeline();
        }
        // Start monitoring
        await this.monitor.start();
        this.isIntegrated = true;
        this.emit('initialized', { timestamp: Date.now() });
        console.log('🔗 Performance integration initialized');
    }
    /**
     * Start tracking workflow generation performance
     */
    startWorkflowTracking(workflowId, metadata) {
        if (!this.config.enableWorkflowTracking) {
            return;
        }
        const startTime = Date.now();
        this.activeWorkflows.set(workflowId, {
            startTime,
            stages: new Map()
        });
        // Start performance profile
        this.monitor.startProfile(`workflow-${workflowId}`);
        // Add custom metrics
        this.monitor.addCustomMetric(`workflow_${workflowId}_started`, startTime);
        if (metadata) {
            this.monitor.addCustomMetric(`workflow_${workflowId}_metadata`, metadata);
        }
        this.emit('workflowTrackingStarted', { workflowId, startTime, metadata });
    }
    /**
     * Track workflow generation stage
     */
    trackWorkflowStage(workflowId, stage, duration) {
        if (!this.config.enableWorkflowTracking) {
            return;
        }
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            return;
        }
        const stageTime = duration || Date.now();
        workflow.stages.set(stage, stageTime);
        // Track stage performance
        this.monitor.addCustomMetric(`workflow_${workflowId}_stage_${stage}`, stageTime);
        this.emit('workflowStageTracked', { workflowId, stage, duration: stageTime });
    }
    /**
     * End workflow tracking and calculate metrics
     */
    endWorkflowTracking(workflowId, result) {
        if (!this.config.enableWorkflowTracking) {
            return null;
        }
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) {
            return null;
        }
        const endTime = Date.now();
        const totalTime = endTime - workflow.startTime;
        // End performance profile
        const profile = this.monitor.endProfile(`workflow-${workflowId}`);
        // Calculate stage timings
        const stages = Array.from(workflow.stages.entries());
        const generation = {
            totalTime,
            analysisTime: this.getStageTime(stages, 'analysis'),
            planningTime: this.getStageTime(stages, 'planning'),
            nodeGenerationTime: this.getStageTime(stages, 'nodeGeneration'),
            connectionTime: this.getStageTime(stages, 'connectionBuilding'),
            validationTime: this.getStageTime(stages, 'validation'),
            optimizationTime: this.getStageTime(stages, 'optimization')
        };
        // Get resource metrics
        const currentMetrics = this.monitor.getCurrentMetrics();
        const resources = {
            peakMemoryUsage: profile?.summary.peakMemory || currentMetrics.memory.heapUsed,
            cpuUsage: profile?.summary.averageCPU || currentMetrics.cpu.usage,
            cacheHitRate: this.getCacheHitRate(),
            parallelEfficiency: this.getParallelEfficiency()
        };
        // Calculate quality metrics
        const quality = {
            nodeCount: result?.nodes?.length || 0,
            connectionCount: result?.connections?.length || 0,
            validationScore: result?.validationScore || 0,
            complexityScore: result?.complexityScore || 0
        };
        // Calculate AI metrics
        const ai = {
            totalTokens: this.getAITokens(workflowId),
            totalCost: this.getAICost(workflowId),
            apiCalls: this.getAPICalls(workflowId),
            averageResponseTime: this.getAverageResponseTime(workflowId)
        };
        const metrics = {
            workflowId,
            timestamp: endTime,
            generation,
            resources,
            quality,
            ai
        };
        // Store metrics
        this.workflowMetrics.set(workflowId, metrics);
        this.activeWorkflows.delete(workflowId);
        // Check alerts
        this.checkWorkflowAlerts(metrics);
        // Persist if enabled
        if (this.config.persistence.enabled) {
            this.persistMetrics();
        }
        this.emit('workflowTrackingEnded', { workflowId, metrics });
        return metrics;
    }
    /**
     * Get workflow performance metrics
     */
    getWorkflowMetrics(workflowId) {
        if (workflowId) {
            return this.workflowMetrics.get(workflowId) || null;
        }
        return Array.from(this.workflowMetrics.values());
    }
    /**
     * Get performance summary for all workflows
     */
    getPerformanceSummary() {
        const allMetrics = Array.from(this.workflowMetrics.values());
        if (allMetrics.length === 0) {
            return {
                totalWorkflows: 0,
                averageGenerationTime: 0,
                averageMemoryUsage: 0,
                averageCacheHitRate: 0,
                totalCost: 0
            };
        }
        const summary = {
            totalWorkflows: allMetrics.length,
            averageGenerationTime: allMetrics.reduce((sum, m) => sum + m.generation.totalTime, 0) / allMetrics.length,
            averageMemoryUsage: allMetrics.reduce((sum, m) => sum + m.resources.peakMemoryUsage, 0) / allMetrics.length,
            averageCacheHitRate: allMetrics.reduce((sum, m) => sum + m.resources.cacheHitRate, 0) / allMetrics.length,
            averageCPUUsage: allMetrics.reduce((sum, m) => sum + m.resources.cpuUsage, 0) / allMetrics.length,
            totalCost: allMetrics.reduce((sum, m) => sum + m.ai.totalCost, 0),
            totalTokens: allMetrics.reduce((sum, m) => sum + m.ai.totalTokens, 0),
            fastestGeneration: Math.min(...allMetrics.map(m => m.generation.totalTime)),
            slowestGeneration: Math.max(...allMetrics.map(m => m.generation.totalTime)),
            averageQuality: allMetrics.reduce((sum, m) => sum + m.quality.validationScore, 0) / allMetrics.length
        };
        return summary;
    }
    /**
     * Generate comprehensive performance report
     */
    generatePerformanceReport() {
        const systemReport = this.monitor.generateReport();
        const workflowSummary = this.getPerformanceSummary();
        const recentMetrics = Array.from(this.workflowMetrics.values()).slice(-10);
        return {
            timestamp: Date.now(),
            system: systemReport,
            workflows: {
                summary: workflowSummary,
                recent: recentMetrics,
                active: Array.from(this.activeWorkflows.keys())
            },
            integration: {
                memoryManagerConnected: !!this.memoryManager,
                cacheManagerConnected: !!this.cacheManager,
                pipelineConnected: !!this.pipeline,
                isIntegrated: this.isIntegrated
            },
            recommendations: this.generateRecommendations()
        };
    }
    /**
     * Clear performance history
     */
    clearHistory() {
        this.workflowMetrics.clear();
        this.activeWorkflows.clear();
        this.monitor.clearHistory();
        this.emit('historyCleared', { timestamp: Date.now() });
    }
    /**
     * Stop performance integration
     */
    async stop() {
        if (!this.isIntegrated) {
            return;
        }
        // Persist final metrics
        if (this.config.persistence.enabled) {
            await this.persistMetrics();
        }
        // Stop monitoring
        await this.monitor.stop();
        this.isIntegrated = false;
        this.emit('stopped', { timestamp: Date.now() });
        console.log('🔗 Performance integration stopped');
    }
    /**
     * Private methods
     */
    mergeConfig(config) {
        return {
            enableWorkflowTracking: config.enableWorkflowTracking ?? true,
            enableResourceMonitoring: config.enableResourceMonitoring ?? true,
            enableAIMetrics: config.enableAIMetrics ?? true,
            enableQualityMetrics: config.enableQualityMetrics ?? true,
            trackingInterval: config.trackingInterval ?? 1000,
            alertThresholds: {
                maxGenerationTime: config.alertThresholds?.maxGenerationTime ?? 600000, // 10 minutes
                maxMemoryUsage: config.alertThresholds?.maxMemoryUsage ?? 2048, // 2GB
                minCacheHitRate: config.alertThresholds?.minCacheHitRate ?? 0.7, // 70%
                maxCPUUsage: config.alertThresholds?.maxCPUUsage ?? 90 // 90%
            },
            persistence: {
                enabled: config.persistence?.enabled ?? true,
                saveInterval: config.persistence?.saveInterval ?? 300000, // 5 minutes
                maxHistory: config.persistence?.maxHistory ?? 1000
            }
        };
    }
    setupEventListeners() {
        // Monitor system alerts
        this.monitor.on('alert', (alert) => {
            this.emit('systemAlert', alert);
        });
        // Monitor performance measures
        this.monitor.on('performanceMeasure', (measure) => {
            this.emit('performanceMeasure', measure);
        });
    }
    integrateMemoryManager() {
        if (!this.memoryManager)
            return;
        // Listen to memory events
        this.memoryManager.on('memoryWarning', (data) => {
            this.emit('memoryWarning', data);
        });
        this.memoryManager.on('memoryCleanup', (data) => {
            this.emit('memoryCleanup', data);
        });
    }
    integrateCacheManager() {
        if (!this.cacheManager)
            return;
        // Cache manager integration would be implemented based on actual API
        // For now, we'll track cache metrics through other means
        console.log('Cache manager integrated for performance tracking');
    }
    integratePipeline() {
        if (!this.pipeline)
            return;
        // Listen to pipeline events
        this.pipeline.on('stageCompleted', (data) => {
            if (data.workflowId) {
                this.trackWorkflowStage(data.workflowId, data.stage, data.duration);
            }
        });
    }
    getStageTime(stages, stageName) {
        const stage = stages.find(([name]) => name === stageName);
        return stage ? stage[1] : 0;
    }
    getCacheHitRate() {
        if (!this.cacheManager)
            return 0;
        // Cache hit rate would be calculated based on actual cache manager API
        // For now, return a placeholder value
        return 0.85; // Placeholder
    }
    getParallelEfficiency() {
        // Calculate parallel efficiency based on pipeline performance
        // This would be implemented based on actual pipeline metrics
        return 0.85; // Placeholder
    }
    getAITokens(workflowId) {
        // Get AI token usage for this workflow
        // This would integrate with AI agent metrics
        return 0; // Placeholder
    }
    getAICost(workflowId) {
        // Get AI cost for this workflow
        // This would integrate with AI agent metrics
        return 0; // Placeholder
    }
    getAPICalls(workflowId) {
        // Get API call count for this workflow
        // This would integrate with AI agent metrics
        return 0; // Placeholder
    }
    getAverageResponseTime(workflowId) {
        // Get average AI response time for this workflow
        // This would integrate with AI agent metrics
        return 0; // Placeholder
    }
    checkWorkflowAlerts(metrics) {
        const alerts = [];
        // Check generation time
        if (metrics.generation.totalTime > this.config.alertThresholds.maxGenerationTime) {
            alerts.push({
                type: 'warning',
                metric: 'generation.totalTime',
                value: metrics.generation.totalTime,
                threshold: this.config.alertThresholds.maxGenerationTime,
                workflowId: metrics.workflowId,
                message: `Workflow generation took ${metrics.generation.totalTime}ms (threshold: ${this.config.alertThresholds.maxGenerationTime}ms)`
            });
        }
        // Check memory usage
        if (metrics.resources.peakMemoryUsage > this.config.alertThresholds.maxMemoryUsage * 1024 * 1024) {
            alerts.push({
                type: 'warning',
                metric: 'resources.peakMemoryUsage',
                value: metrics.resources.peakMemoryUsage,
                threshold: this.config.alertThresholds.maxMemoryUsage * 1024 * 1024,
                workflowId: metrics.workflowId,
                message: `Peak memory usage was ${(metrics.resources.peakMemoryUsage / 1024 / 1024).toFixed(1)}MB (threshold: ${this.config.alertThresholds.maxMemoryUsage}MB)`
            });
        }
        // Check cache hit rate
        if (metrics.resources.cacheHitRate < this.config.alertThresholds.minCacheHitRate) {
            alerts.push({
                type: 'warning',
                metric: 'resources.cacheHitRate',
                value: metrics.resources.cacheHitRate,
                threshold: this.config.alertThresholds.minCacheHitRate,
                workflowId: metrics.workflowId,
                message: `Cache hit rate was ${(metrics.resources.cacheHitRate * 100).toFixed(1)}% (threshold: ${(this.config.alertThresholds.minCacheHitRate * 100).toFixed(1)}%)`
            });
        }
        // Emit alerts
        alerts.forEach(alert => {
            this.emit('workflowAlert', alert);
        });
    }
    generateRecommendations() {
        const recommendations = [];
        const summary = this.getPerformanceSummary();
        if (summary.averageGenerationTime > 300000) { // 5 minutes
            recommendations.push('Consider optimizing AI model responses or increasing parallel processing');
        }
        if (summary.averageCacheHitRate < 0.8) {
            recommendations.push('Improve caching strategies to increase cache hit rate');
        }
        if (summary.averageCPUUsage > 80) {
            recommendations.push('Consider scaling horizontally or optimizing CPU-intensive operations');
        }
        if (summary.averageMemoryUsage > 1024 * 1024 * 1024) { // 1GB
            recommendations.push('Optimize memory usage or implement more aggressive garbage collection');
        }
        return recommendations;
    }
    async persistMetrics() {
        // Implement metrics persistence
        // This would save to database or file system
    }
}
/**
 * Performance integration utilities
 */
export class PerformanceIntegrationUtils {
    /**
     * Create a workflow performance decorator
     */
    static createWorkflowDecorator(integrationManager) {
        return function (target, propertyKey, descriptor) {
            const originalMethod = descriptor.value;
            descriptor.value = async function (...args) {
                const workflowId = args[0]?.workflowId || `${target.constructor.name}-${Date.now()}`;
                integrationManager.startWorkflowTracking(workflowId);
                try {
                    const result = await originalMethod.apply(this, args);
                    integrationManager.endWorkflowTracking(workflowId, result);
                    return result;
                }
                catch (error) {
                    integrationManager.endWorkflowTracking(workflowId, { error: error.message });
                    throw error;
                }
            };
            return descriptor;
        };
    }
    /**
     * Measure workflow stage performance
     */
    static async measureStage(integrationManager, workflowId, stage, fn) {
        const startTime = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - startTime;
            integrationManager.trackWorkflowStage(workflowId, stage, duration);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            integrationManager.trackWorkflowStage(workflowId, `${stage}_error`, duration);
            throw error;
        }
    }
}
/**
 * Global performance integration instance
 */
let globalIntegration = null;
/**
 * Get or create global performance integration
 */
export function getPerformanceIntegration(config) {
    if (!globalIntegration) {
        globalIntegration = new PerformanceIntegrationManager(config);
    }
    return globalIntegration;
}
export default getPerformanceIntegration();
//# sourceMappingURL=performance-integration.js.map