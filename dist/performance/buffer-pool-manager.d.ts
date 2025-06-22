/**
 * Buffer Pool Manager
 *
 * Provides efficient buffer management for I/O operations including:
 * - Multiple buffer pools with automatic sizing
 * - Intelligent buffer allocation and deallocation
 * - Automatic flushing based on thresholds and timers
 * - Memory-efficient buffer reuse
 */
import { EventEmitter } from 'events';
interface BufferPoolConfig {
    maxBuffers: number;
    bufferSize: number;
    flushThreshold: number;
    flushIntervalMs: number;
    autoFlush: boolean;
    memoryLimit: number;
}
interface BufferMetrics {
    totalBuffers: number;
    availableBuffers: number;
    busyBuffers: number;
    pendingFlush: number;
    utilization: number;
    memoryUsage: number;
    flushCount: number;
}
export declare class BufferPoolManager extends EventEmitter {
    private buffers;
    private availableBuffers;
    private busyBuffers;
    private pendingFlush;
    private config;
    private bufferCounter;
    private flushTimer;
    private flushCount;
    constructor(config?: Partial<BufferPoolConfig>);
    private initializeBuffers;
    private createBuffer;
    private startFlushTimer;
    acquireBuffer(): string | null;
    releaseBuffer(bufferId: string, forceFlush?: boolean): void;
    writeToBuffer(bufferId: string, data: Buffer, offset?: number): number;
    readFromBuffer(bufferId: string, length: number, offset?: number): Buffer;
    private clearBuffer;
    private autoFlushBuffers;
    flushBuffer(bufferId: string): Promise<void>;
    private performFlushOperation;
    private getCurrentMemoryUsage;
    getMetrics(): BufferMetrics;
    close(): Promise<void>;
}
export default BufferPoolManager;
//# sourceMappingURL=buffer-pool-manager.d.ts.map