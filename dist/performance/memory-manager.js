/**
 * Memory Management System for Large Workflow Processing
 *
 * Implements intelligent memory management strategies including heap monitoring,
 * memory pooling, garbage collection optimization, and memory leak detection
 * for the n8n-ultimate workflow generation system.
 */
import { EventEmitter } from 'events';
import { performance } from 'perf_hooks';
import v8 from 'v8';
/**
 * Advanced memory management system for workflow processing
 */
export class MemoryManager extends EventEmitter {
    constructor(config) {
        super();
        this.memoryPools = new Map();
        this.activeContexts = new Map();
        this.memoryHistory = [];
        this.gcStats = {
            count: 0,
            totalDuration: 0,
            lastGC: 0
        };
        this.heapSnapshots = [];
        this.config = {
            enableGCOptimization: config?.enableGCOptimization ?? true,
            enableMemoryPools: config?.enableMemoryPools ?? true,
            enableLeakDetection: config?.enableLeakDetection ?? true,
            monitoringInterval: config?.monitoringInterval ?? 5000,
            enableHeapSnapshots: config?.enableHeapSnapshots ?? false,
            maxSnapshotHistory: config?.maxSnapshotHistory ?? 10,
            thresholds: config?.thresholds ?? {}
        };
        this.thresholds = {
            warningThreshold: 70,
            criticalThreshold: 85,
            maxHeapSize: 1024 * 1024 * 1024, // 1GB default
            gcTriggerThreshold: 80,
            leakDetectionWindow: 60000, // 1 minute
            ...this.config.thresholds
        };
        this.initializeMonitoring();
        this.setupGCOptimization();
        this.createDefaultMemoryPools();
    }
    /**
     * Create memory context for workflow processing
     */
    createWorkflowContext(workflowId) {
        const startMemory = this.getCurrentMemoryStats();
        const context = {
            workflowId,
            startMemory,
            peakMemory: startMemory,
            currentMemory: startMemory,
            allocatedObjects: new Map(),
            memoryPools: new Map(),
            cleanupCallbacks: []
        };
        this.activeContexts.set(workflowId, context);
        this.emit('contextCreated', { workflowId, startMemory });
        return context;
    }
    /**
     * Update memory context during workflow processing
     */
    updateWorkflowContext(workflowId) {
        const context = this.activeContexts.get(workflowId);
        if (!context)
            return;
        const currentMemory = this.getCurrentMemoryStats();
        context.currentMemory = currentMemory;
        // Update peak memory if current is higher
        if (currentMemory.heapUsed > context.peakMemory.heapUsed) {
            context.peakMemory = currentMemory;
        }
        // Check for memory pressure
        if (currentMemory.heapUsedPercent > this.thresholds.warningThreshold) {
            this.emit('memoryPressure', {
                workflowId,
                currentMemory,
                level: currentMemory.heapUsedPercent > this.thresholds.criticalThreshold ? 'critical' : 'warning'
            });
        }
    }
    /**
     * Clean up workflow context and release memory
     */
    async cleanupWorkflowContext(workflowId) {
        const context = this.activeContexts.get(workflowId);
        if (!context)
            return;
        // Execute cleanup callbacks
        for (const callback of context.cleanupCallbacks) {
            try {
                callback();
            }
            catch (error) {
                this.emit('cleanupError', { workflowId, error });
            }
        }
        // Return pooled objects
        for (const [poolName, objects] of context.memoryPools) {
            const pool = this.memoryPools.get(poolName);
            if (pool && Array.isArray(objects)) {
                for (const obj of objects) {
                    this.returnToPool(poolName, obj);
                }
            }
        }
        // Clear allocated objects
        context.allocatedObjects.clear();
        context.memoryPools.clear();
        context.cleanupCallbacks.length = 0;
        // Remove context
        this.activeContexts.delete(workflowId);
        // Trigger garbage collection if memory pressure is high
        const currentMemory = this.getCurrentMemoryStats();
        if (currentMemory.heapUsedPercent > this.thresholds.gcTriggerThreshold) {
            await this.triggerGarbageCollection();
        }
        this.emit('contextCleaned', {
            workflowId,
            memoryFreed: context.peakMemory.heapUsed - currentMemory.heapUsed
        });
    }
    /**
     * Create memory pool for reusable objects
     */
    createMemoryPool(name, factory, reset, maxSize = 100) {
        const pool = {
            name,
            factory,
            reset,
            maxSize,
            currentSize: 0,
            available: [],
            inUse: new Set()
        };
        this.memoryPools.set(name, pool);
        this.emit('poolCreated', { name, maxSize });
    }
    /**
     * Get object from memory pool
     */
    getFromPool(poolName, workflowId) {
        const pool = this.memoryPools.get(poolName);
        if (!pool)
            return null;
        let item;
        if (pool.available.length > 0) {
            item = pool.available.pop();
        }
        else if (pool.currentSize < pool.maxSize) {
            item = pool.factory();
            pool.currentSize++;
        }
        else {
            // Pool is full, create new item (will be GC'd later)
            item = pool.factory();
        }
        pool.inUse.add(item);
        // Track in workflow context if provided
        if (workflowId) {
            const context = this.activeContexts.get(workflowId);
            if (context) {
                if (!context.memoryPools.has(poolName)) {
                    context.memoryPools.set(poolName, []);
                }
                context.memoryPools.get(poolName).push(item);
            }
        }
        return item;
    }
    /**
     * Return object to memory pool
     */
    returnToPool(poolName, item) {
        const pool = this.memoryPools.get(poolName);
        if (!pool || !pool.inUse.has(item))
            return;
        pool.inUse.delete(item);
        if (pool.available.length < pool.maxSize) {
            pool.reset(item);
            pool.available.push(item);
        }
        // If pool is full, let the item be garbage collected
    }
    /**
     * Get current memory statistics
     */
    getCurrentMemoryStats() {
        const memUsage = process.memoryUsage();
        const heapStats = v8.getHeapStatistics();
        return {
            heapUsed: memUsage.heapUsed,
            heapTotal: memUsage.heapTotal,
            external: memUsage.external,
            arrayBuffers: memUsage.arrayBuffers,
            rss: memUsage.rss,
            heapUsedPercent: (memUsage.heapUsed / heapStats.heap_size_limit) * 100,
            gcCount: this.gcStats.count,
            gcDuration: this.gcStats.totalDuration,
            memoryLeakRisk: this.assessMemoryLeakRisk(),
            timestamp: Date.now()
        };
    }
    /**
     * Trigger manual garbage collection
     */
    async triggerGarbageCollection() {
        if (!global.gc) {
            this.emit('gcWarning', { message: 'Garbage collection not available. Start Node.js with --expose-gc flag.' });
            return;
        }
        const startTime = performance.now();
        const beforeMemory = this.getCurrentMemoryStats();
        global.gc();
        const endTime = performance.now();
        const afterMemory = this.getCurrentMemoryStats();
        const duration = endTime - startTime;
        this.gcStats.count++;
        this.gcStats.totalDuration += duration;
        this.gcStats.lastGC = Date.now();
        const memoryFreed = beforeMemory.heapUsed - afterMemory.heapUsed;
        this.emit('gcTriggered', {
            duration,
            memoryFreed,
            beforeMemory,
            afterMemory
        });
    }
    /**
     * Take heap snapshot for analysis
     */
    takeHeapSnapshot() {
        if (!this.config.enableHeapSnapshots)
            return;
        try {
            const snapshot = v8.writeHeapSnapshot();
            this.heapSnapshots.push({
                timestamp: Date.now(),
                snapshot
            });
            // Limit snapshot history
            if (this.heapSnapshots.length > this.config.maxSnapshotHistory) {
                this.heapSnapshots.shift();
            }
            this.emit('snapshotTaken', { path: snapshot });
        }
        catch (error) {
            this.emit('snapshotError', { error });
        }
    }
    /**
     * Analyze memory usage patterns
     */
    analyzeMemoryPatterns() {
        if (this.memoryHistory.length < 10) {
            return {
                trend: 'stable',
                averageUsage: 0,
                peakUsage: 0,
                leakSuspicion: false
            };
        }
        const recent = this.memoryHistory.slice(-10);
        const older = this.memoryHistory.slice(-20, -10);
        const recentAvg = recent.reduce((sum, stat) => sum + stat.heapUsed, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((sum, stat) => sum + stat.heapUsed, 0) / older.length : recentAvg;
        const trend = recentAvg > olderAvg * 1.1 ? 'increasing' :
            recentAvg < olderAvg * 0.9 ? 'decreasing' : 'stable';
        const peakUsage = Math.max(...this.memoryHistory.map(stat => stat.heapUsed));
        const averageUsage = this.memoryHistory.reduce((sum, stat) => sum + stat.heapUsed, 0) / this.memoryHistory.length;
        // Simple leak detection: consistently increasing memory over time
        const leakSuspicion = trend === 'increasing' &&
            this.memoryHistory.length > 20 &&
            recentAvg > olderAvg * 1.5;
        return {
            trend,
            averageUsage,
            peakUsage,
            leakSuspicion
        };
    }
    /**
     * Get memory pool statistics
     */
    getPoolStats() {
        return Array.from(this.memoryPools.entries()).map(([name, pool]) => ({
            name,
            available: pool.available.length,
            inUse: pool.inUse.size,
            maxSize: pool.maxSize,
            utilization: (pool.inUse.size / pool.maxSize) * 100
        }));
    }
    /**
     * Get active workflow contexts summary
     */
    getActiveContexts() {
        return Array.from(this.activeContexts.entries()).map(([workflowId, context]) => ({
            workflowId,
            memoryUsed: context.currentMemory.heapUsed - context.startMemory.heapUsed,
            duration: Date.now() - context.startMemory.timestamp,
            objectCount: context.allocatedObjects.size
        }));
    }
    /**
     * Initialize memory monitoring
     */
    initializeMonitoring() {
        this.monitoringTimer = setInterval(() => {
            const stats = this.getCurrentMemoryStats();
            this.memoryHistory.push(stats);
            // Limit history size
            if (this.memoryHistory.length > 1000) {
                this.memoryHistory.shift();
            }
            // Update active contexts
            for (const workflowId of this.activeContexts.keys()) {
                this.updateWorkflowContext(workflowId);
            }
            // Check for memory leaks
            if (this.config.enableLeakDetection) {
                const analysis = this.analyzeMemoryPatterns();
                if (analysis.leakSuspicion) {
                    this.emit('memoryLeakSuspected', { analysis, currentStats: stats });
                }
            }
            // Take snapshot if enabled and memory is high
            if (this.config.enableHeapSnapshots && stats.heapUsedPercent > this.thresholds.criticalThreshold) {
                this.takeHeapSnapshot();
            }
            this.emit('memoryStats', stats);
        }, this.config.monitoringInterval);
    }
    /**
     * Setup garbage collection optimization
     */
    setupGCOptimization() {
        if (!this.config.enableGCOptimization)
            return;
        // Monitor GC events if available
        if (process.versions.node >= '14.0.0') {
            try {
                const { PerformanceObserver } = require('perf_hooks');
                const obs = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'gc') {
                            this.gcStats.count++;
                            this.gcStats.totalDuration += entry.duration;
                            this.gcStats.lastGC = Date.now();
                            this.emit('gcEvent', {
                                kind: entry.detail?.kind,
                                duration: entry.duration,
                                timestamp: entry.startTime
                            });
                        }
                    }
                });
                obs.observe({ entryTypes: ['gc'] });
            }
            catch (error) {
                // GC monitoring not available
            }
        }
    }
    /**
     * Create default memory pools
     */
    createDefaultMemoryPools() {
        if (!this.config.enableMemoryPools)
            return;
        // Node object pool
        this.createMemoryPool('nodes', () => ({}), (node) => {
            Object.keys(node).forEach(key => delete node[key]);
        }, 1000);
        // Connection object pool
        this.createMemoryPool('connections', () => ({}), (conn) => {
            Object.keys(conn).forEach(key => delete conn[key]);
        }, 500);
        // Buffer pool for large data processing
        this.createMemoryPool('buffers', () => Buffer.alloc(1024 * 1024), // 1MB buffers
        (buffer) => buffer.fill(0), 10);
        // Array pool for collections
        this.createMemoryPool('arrays', () => [], (arr) => arr.length = 0, 200);
    }
    /**
     * Assess memory leak risk
     */
    assessMemoryLeakRisk() {
        if (this.memoryHistory.length < 5)
            return 'low';
        const recent = this.memoryHistory.slice(-5);
        const trend = recent.every((stat, i) => i === 0 || stat.heapUsed >= recent[i - 1].heapUsed);
        const currentPercent = recent[recent.length - 1].heapUsedPercent;
        if (trend && currentPercent > this.thresholds.criticalThreshold) {
            return 'high';
        }
        else if (trend || currentPercent > this.thresholds.warningThreshold) {
            return 'medium';
        }
        return 'low';
    }
    /**
     * Add cleanup callback to workflow context
     */
    addCleanupCallback(workflowId, callback) {
        const context = this.activeContexts.get(workflowId);
        if (context) {
            context.cleanupCallbacks.push(callback);
        }
    }
    /**
     * Register object in workflow context for tracking
     */
    registerObject(workflowId, objectId, object) {
        const context = this.activeContexts.get(workflowId);
        if (context) {
            context.allocatedObjects.set(objectId, object);
        }
    }
    /**
     * Unregister object from workflow context
     */
    unregisterObject(workflowId, objectId) {
        const context = this.activeContexts.get(workflowId);
        if (context) {
            context.allocatedObjects.delete(objectId);
        }
    }
    /**
     * Force cleanup of all contexts (emergency cleanup)
     */
    async emergencyCleanup() {
        this.emit('emergencyCleanup', { activeContexts: this.activeContexts.size });
        // Clean up all active contexts
        const cleanupPromises = Array.from(this.activeContexts.keys()).map(workflowId => this.cleanupWorkflowContext(workflowId));
        await Promise.all(cleanupPromises);
        // Clear all pools
        for (const pool of this.memoryPools.values()) {
            pool.available.length = 0;
            pool.inUse.clear();
            pool.currentSize = 0;
        }
        // Force garbage collection
        await this.triggerGarbageCollection();
    }
    /**
     * Get comprehensive memory report
     */
    getMemoryReport() {
        return {
            current: this.getCurrentMemoryStats(),
            pools: this.getPoolStats(),
            contexts: this.getActiveContexts(),
            analysis: this.analyzeMemoryPatterns(),
            thresholds: this.thresholds,
            gcStats: { ...this.gcStats }
        };
    }
    /**
     * Shutdown memory manager
     */
    shutdown() {
        if (this.monitoringTimer) {
            clearInterval(this.monitoringTimer);
            this.monitoringTimer = undefined;
        }
        // Clean up all contexts
        this.activeContexts.clear();
        this.memoryPools.clear();
        this.memoryHistory.length = 0;
        this.heapSnapshots.length = 0;
        this.emit('shutdown');
    }
}
/**
 * Global memory manager instance
 */
export const memoryManager = new MemoryManager({
    enableGCOptimization: true,
    enableMemoryPools: true,
    enableLeakDetection: true,
    monitoringInterval: 5000,
    enableHeapSnapshots: false,
    maxSnapshotHistory: 5,
    thresholds: {
        warningThreshold: 70,
        criticalThreshold: 85,
        maxHeapSize: 1024 * 1024 * 1024, // 1GB
        gcTriggerThreshold: 80,
        leakDetectionWindow: 60000
    }
});
