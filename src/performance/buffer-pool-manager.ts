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
    memoryLimit: number; // in bytes
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

interface BufferInfo {
    id: string;
    buffer: Buffer;
    created: number;
    lastUsed: number;
    writeOffset: number;
    flushPending: boolean;
}

export class BufferPoolManager extends EventEmitter {
    private buffers: Map<string, BufferInfo> = new Map();
    private availableBuffers: string[] = [];
    private busyBuffers: Set<string> = new Set();
    private pendingFlush: Set<string> = new Set();
    private config: BufferPoolConfig;
    private bufferCounter = 0;
    private flushTimer: NodeJS.Timeout | null = null;
    private flushCount = 0;

    constructor(config: Partial<BufferPoolConfig> = {}) {
        super();
        
        const defaultConfig: BufferPoolConfig = {
            maxBuffers: 10,
            bufferSize: 1024 * 1024, // 1MB
            flushThreshold: 1024 * 512, // 512KB
            flushIntervalMs: 5000,
            autoFlush: true,
            memoryLimit: 100 * 1024 * 1024 // 100MB
        };

        this.config = { ...defaultConfig, ...config };
        this.initializeBuffers();
        
        if (this.config.autoFlush) {
            this.startFlushTimer();
        }
    }

    private initializeBuffers(): void {
        for (let i = 0; i < this.config.maxBuffers; i++) {
            this.createBuffer();
        }
        
        this.emit('initialized', {
            totalBuffers: this.buffers.size,
            bufferSize: this.config.bufferSize,
            totalMemory: this.buffers.size * this.config.bufferSize
        });
    }

    private createBuffer(): string {
        const bufferId = `buffer_${this.bufferCounter++}`;
        const buffer = Buffer.alloc(this.config.bufferSize);
        
        const bufferInfo: BufferInfo = {
            id: bufferId,
            buffer,
            created: Date.now(),
            lastUsed: Date.now(),
            writeOffset: 0,
            flushPending: false
        };

        this.buffers.set(bufferId, bufferInfo);
        this.availableBuffers.push(bufferId);
        
        this.emit('bufferCreated', { bufferId, totalBuffers: this.buffers.size });
        return bufferId;
    }

    private startFlushTimer(): void {
        this.flushTimer = setInterval(() => {
            this.autoFlushBuffers();
        }, this.config.flushIntervalMs);
    }

    public acquireBuffer(): string | null {
        // Check memory limit
        if (this.getCurrentMemoryUsage() >= this.config.memoryLimit) {
            this.emit('memoryLimitReached', { 
                currentUsage: this.getCurrentMemoryUsage(),
                limit: this.config.memoryLimit 
            });
            return null;
        }

        // Get available buffer or create new one
        let bufferId: string;
        
        if (this.availableBuffers.length > 0) {
            bufferId = this.availableBuffers.shift()!;
        } else if (this.buffers.size < this.config.maxBuffers) {
            bufferId = this.createBuffer();
            this.availableBuffers.pop(); // Remove from available since we're using it
        } else {
            // No buffers available
            this.emit('bufferPoolExhausted', { 
                totalBuffers: this.buffers.size,
                busyBuffers: this.busyBuffers.size 
            });
            return null;
        }

        // Mark as busy and update usage
        this.busyBuffers.add(bufferId);
        const bufferInfo = this.buffers.get(bufferId)!;
        bufferInfo.lastUsed = Date.now();
        bufferInfo.writeOffset = 0; // Reset for new usage
        
        this.emit('bufferAcquired', { bufferId, busyCount: this.busyBuffers.size });
        return bufferId;
    }

    public releaseBuffer(bufferId: string, forceFlush: boolean = false): void {
        if (!this.busyBuffers.has(bufferId)) {
            return;
        }

        const bufferInfo = this.buffers.get(bufferId);
        if (!bufferInfo) {
            return;
        }

        this.busyBuffers.delete(bufferId);

        // Check if buffer needs flushing
        if (forceFlush || bufferInfo.writeOffset >= this.config.flushThreshold) {
            this.pendingFlush.add(bufferId);
            bufferInfo.flushPending = true;
        } else {
            // Clear buffer and return to available pool
            this.clearBuffer(bufferId);
            this.availableBuffers.push(bufferId);
        }

        this.emit('bufferReleased', { 
            bufferId, 
            flushPending: bufferInfo.flushPending,
            availableCount: this.availableBuffers.length 
        });
    }

    public writeToBuffer(bufferId: string, data: Buffer, offset?: number): number {
        const bufferInfo = this.buffers.get(bufferId);
        if (!bufferInfo) {
            throw new Error(`Buffer ${bufferId} not found`);
        }

        const writeOffset = offset !== undefined ? offset : bufferInfo.writeOffset;
        const bytesWritten = data.copy(bufferInfo.buffer, writeOffset);
        
        // Update write offset if using automatic offset
        if (offset === undefined) {
            bufferInfo.writeOffset += bytesWritten;
        }

        bufferInfo.lastUsed = Date.now();

        // Check if buffer needs flushing
        if (bufferInfo.writeOffset >= this.config.flushThreshold) {
            this.pendingFlush.add(bufferId);
            bufferInfo.flushPending = true;
        }

        this.emit('bufferWrite', { 
            bufferId, 
            bytesWritten, 
            totalWritten: bufferInfo.writeOffset,
            flushPending: bufferInfo.flushPending 
        });

        return bytesWritten;
    }

    public readFromBuffer(bufferId: string, length: number, offset: number = 0): Buffer {
        const bufferInfo = this.buffers.get(bufferId);
        if (!bufferInfo) {
            throw new Error(`Buffer ${bufferId} not found`);
        }

        const actualLength = Math.min(length, bufferInfo.writeOffset - offset);
        const data = bufferInfo.buffer.subarray(offset, offset + actualLength);
        
        bufferInfo.lastUsed = Date.now();
        
        this.emit('bufferRead', { 
            bufferId, 
            bytesRead: actualLength, 
            offset 
        });

        return data;
    }

    private clearBuffer(bufferId: string): void {
        const bufferInfo = this.buffers.get(bufferId);
        if (!bufferInfo) {
            return;
        }

        bufferInfo.buffer.fill(0);
        bufferInfo.writeOffset = 0;
        bufferInfo.flushPending = false;
        bufferInfo.lastUsed = Date.now();
    }

    private async autoFlushBuffers(): Promise<void> {
        const buffersToFlush = Array.from(this.pendingFlush);
        
        for (const bufferId of buffersToFlush) {
            // Don't flush buffers that are currently in use
            if (this.busyBuffers.has(bufferId)) {
                continue;
            }

            await this.flushBuffer(bufferId);
        }
    }

    public async flushBuffer(bufferId: string): Promise<void> {
        const bufferInfo = this.buffers.get(bufferId);
        if (!bufferInfo || bufferInfo.writeOffset === 0) {
            return;
        }

        try {
            // Get the data to flush
            const dataToFlush = bufferInfo.buffer.subarray(0, bufferInfo.writeOffset);
            
            // Simulate actual I/O operation (replace with real implementation)
            await this.performFlushOperation(bufferId, dataToFlush);
            
            // Clear buffer and remove from pending flush
            this.clearBuffer(bufferId);
            this.pendingFlush.delete(bufferId);
            this.flushCount++;

            // Return buffer to available pool if not busy
            if (!this.busyBuffers.has(bufferId)) {
                this.availableBuffers.push(bufferId);
            }

            this.emit('bufferFlushed', { 
                bufferId, 
                bytesWritten: dataToFlush.length,
                timestamp: Date.now(),
                totalFlushes: this.flushCount
            });

        } catch (error) {
            this.emit('flushError', { 
                bufferId, 
                error: error instanceof Error ? error.message : 'Unknown error' 
            });
        }
    }

    private async performFlushOperation(bufferId: string, data: Buffer): Promise<void> {
        // Simulate async I/O operation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    }

    private getCurrentMemoryUsage(): number {
        return this.buffers.size * this.config.bufferSize;
    }

    public getMetrics(): BufferMetrics {
        return {
            totalBuffers: this.buffers.size,
            availableBuffers: this.availableBuffers.length,
            busyBuffers: this.busyBuffers.size,
            pendingFlush: this.pendingFlush.size,
            utilization: this.buffers.size > 0 ? this.busyBuffers.size / this.buffers.size : 0,
            memoryUsage: this.getCurrentMemoryUsage(),
            flushCount: this.flushCount
        };
    }

    public async close(): Promise<void> {
        // Stop flush timer
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }

        // Flush all remaining data
        const flushPromises: Promise<void>[] = [];
        for (const bufferId of this.pendingFlush) {
            flushPromises.push(this.flushBuffer(bufferId));
        }
        await Promise.all(flushPromises);

        // Clear all buffers
        this.buffers.clear();
        this.availableBuffers.length = 0;
        this.busyBuffers.clear();
        this.pendingFlush.clear();

        this.emit('closed', { 
            totalFlushes: this.flushCount,
            timestamp: Date.now() 
        });
    }
}

export default BufferPoolManager; 