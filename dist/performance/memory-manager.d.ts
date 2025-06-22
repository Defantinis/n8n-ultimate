/**
 * Memory Management System for Large Workflow Processing
 *
 * Implements intelligent memory management strategies including heap monitoring,
 * memory pooling, garbage collection optimization, and memory leak detection
 * for the n8n-ultimate workflow generation system.
 */
import { EventEmitter } from 'events';
export interface MemoryStats {
    heapUsed: number;
    heapTotal: number;
    external: number;
    arrayBuffers: number;
    rss: number;
    heapUsedPercent: number;
    gcCount: number;
    gcDuration: number;
    memoryLeakRisk: 'low' | 'medium' | 'high';
    timestamp: number;
}
export interface MemoryThresholds {
    warningThreshold: number;
    criticalThreshold: number;
    maxHeapSize: number;
    gcTriggerThreshold: number;
    leakDetectionWindow: number;
}
export interface MemoryPool<T> {
    name: string;
    factory: () => T;
    reset: (item: T) => void;
    maxSize: number;
    currentSize: number;
    available: T[];
    inUse: Set<T>;
}
export interface MemoryManagerConfig {
    thresholds?: Partial<MemoryThresholds>;
    enableGCOptimization?: boolean;
    enableMemoryPools?: boolean;
    enableLeakDetection?: boolean;
    monitoringInterval?: number;
    enableHeapSnapshots?: boolean;
    maxSnapshotHistory?: number;
}
export interface WorkflowMemoryContext {
    workflowId: string;
    startMemory: MemoryStats;
    peakMemory: MemoryStats;
    currentMemory: MemoryStats;
    allocatedObjects: Map<string, any>;
    memoryPools: Map<string, any>;
    cleanupCallbacks: Array<() => void>;
}
/**
 * Advanced memory management system for workflow processing
 */
export declare class MemoryManager extends EventEmitter {
    private config;
    private thresholds;
    private memoryPools;
    private activeContexts;
    private memoryHistory;
    private gcStats;
    private monitoringTimer?;
    private heapSnapshots;
    constructor(config?: MemoryManagerConfig);
    /**
     * Create memory context for workflow processing
     */
    createWorkflowContext(workflowId: string): WorkflowMemoryContext;
    /**
     * Update memory context during workflow processing
     */
    updateWorkflowContext(workflowId: string): void;
    /**
     * Clean up workflow context and release memory
     */
    cleanupWorkflowContext(workflowId: string): Promise<void>;
    /**
     * Create memory pool for reusable objects
     */
    createMemoryPool<T>(name: string, factory: () => T, reset: (item: T) => void, maxSize?: number): void;
    /**
     * Get object from memory pool
     */
    getFromPool<T>(poolName: string, workflowId?: string): T | null;
    /**
     * Return object to memory pool
     */
    returnToPool<T>(poolName: string, item: T): void;
    /**
     * Get current memory statistics
     */
    getCurrentMemoryStats(): MemoryStats;
    /**
     * Trigger manual garbage collection
     */
    triggerGarbageCollection(): Promise<void>;
    /**
     * Take heap snapshot for analysis
     */
    takeHeapSnapshot(): void;
    /**
     * Analyze memory usage patterns
     */
    analyzeMemoryPatterns(): {
        trend: 'increasing' | 'decreasing' | 'stable';
        averageUsage: number;
        peakUsage: number;
        leakSuspicion: boolean;
    };
    /**
     * Get memory pool statistics
     */
    getPoolStats(): Array<{
        name: string;
        available: number;
        inUse: number;
        maxSize: number;
        utilization: number;
    }>;
    /**
     * Get active workflow contexts summary
     */
    getActiveContexts(): Array<{
        workflowId: string;
        memoryUsed: number;
        duration: number;
        objectCount: number;
    }>;
    /**
     * Initialize memory monitoring
     */
    private initializeMonitoring;
    /**
     * Setup garbage collection optimization
     */
    private setupGCOptimization;
    /**
     * Create default memory pools
     */
    private createDefaultMemoryPools;
    /**
     * Assess memory leak risk
     */
    private assessMemoryLeakRisk;
    /**
     * Add cleanup callback to workflow context
     */
    addCleanupCallback(workflowId: string, callback: () => void): void;
    /**
     * Register object in workflow context for tracking
     */
    registerObject(workflowId: string, objectId: string, object: any): void;
    /**
     * Unregister object from workflow context
     */
    unregisterObject(workflowId: string, objectId: string): void;
    /**
     * Force cleanup of all contexts (emergency cleanup)
     */
    emergencyCleanup(): Promise<void>;
    /**
     * Get comprehensive memory report
     */
    getMemoryReport(): {
        current: MemoryStats;
        pools: ReturnType<typeof this.getPoolStats>;
        contexts: ReturnType<typeof this.getActiveContexts>;
        analysis: ReturnType<typeof this.analyzeMemoryPatterns>;
        thresholds: MemoryThresholds;
        gcStats: typeof this.gcStats;
    };
    /**
     * Shutdown memory manager
     */
    shutdown(): void;
}
/**
 * Global memory manager instance
 */
export declare const memoryManager: MemoryManager;
//# sourceMappingURL=memory-manager.d.ts.map