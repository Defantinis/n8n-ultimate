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
export class BufferPoolManager extends EventEmitter {
    buffers = new Map();
    availableBuffers = [];
    busyBuffers = new Set();
    pendingFlush = new Set();
    config;
    bufferCounter = 0;
    flushTimer = null;
    flushCount = 0;
    constructor(config = {}) {
        super();
        const defaultConfig = {
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
    initializeBuffers() {
        for (let i = 0; i < this.config.maxBuffers; i++) {
            this.createBuffer();
        }
        this.emit('initialized', {
            totalBuffers: this.buffers.size,
            bufferSize: this.config.bufferSize,
            totalMemory: this.buffers.size * this.config.bufferSize
        });
    }
    createBuffer() {
        const bufferId = `buffer_${this.bufferCounter++}`;
        const buffer = Buffer.alloc(this.config.bufferSize);
        const bufferInfo = {
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
    startFlushTimer() {
        this.flushTimer = setInterval(() => {
            this.autoFlushBuffers();
        }, this.config.flushIntervalMs);
    }
    acquireBuffer() {
        // Check memory limit
        if (this.getCurrentMemoryUsage() >= this.config.memoryLimit) {
            this.emit('memoryLimitReached', {
                currentUsage: this.getCurrentMemoryUsage(),
                limit: this.config.memoryLimit
            });
            return null;
        }
        // Get available buffer or create new one
        let bufferId;
        if (this.availableBuffers.length > 0) {
            bufferId = this.availableBuffers.shift();
        }
        else if (this.buffers.size < this.config.maxBuffers) {
            bufferId = this.createBuffer();
            this.availableBuffers.pop(); // Remove from available since we're using it
        }
        else {
            // No buffers available
            this.emit('bufferPoolExhausted', {
                totalBuffers: this.buffers.size,
                busyBuffers: this.busyBuffers.size
            });
            return null;
        }
        // Mark as busy and update usage
        this.busyBuffers.add(bufferId);
        const bufferInfo = this.buffers.get(bufferId);
        bufferInfo.lastUsed = Date.now();
        bufferInfo.writeOffset = 0; // Reset for new usage
        this.emit('bufferAcquired', { bufferId, busyCount: this.busyBuffers.size });
        return bufferId;
    }
    releaseBuffer(bufferId, forceFlush = false) {
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
        }
        else {
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
    writeToBuffer(bufferId, data, offset) {
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
    readFromBuffer(bufferId, length, offset = 0) {
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
    clearBuffer(bufferId) {
        const bufferInfo = this.buffers.get(bufferId);
        if (!bufferInfo) {
            return;
        }
        bufferInfo.buffer.fill(0);
        bufferInfo.writeOffset = 0;
        bufferInfo.flushPending = false;
        bufferInfo.lastUsed = Date.now();
    }
    async autoFlushBuffers() {
        const buffersToFlush = Array.from(this.pendingFlush);
        for (const bufferId of buffersToFlush) {
            // Don't flush buffers that are currently in use
            if (this.busyBuffers.has(bufferId)) {
                continue;
            }
            await this.flushBuffer(bufferId);
        }
    }
    async flushBuffer(bufferId) {
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
        }
        catch (error) {
            this.emit('flushError', {
                bufferId,
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    async performFlushOperation(bufferId, data) {
        // Simulate async I/O operation
        await new Promise(resolve => setTimeout(resolve, Math.random() * 50));
    }
    getCurrentMemoryUsage() {
        return this.buffers.size * this.config.bufferSize;
    }
    getMetrics() {
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
    async close() {
        // Stop flush timer
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
            this.flushTimer = null;
        }
        // Flush all remaining data
        const flushPromises = [];
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
//# sourceMappingURL=buffer-pool-manager.js.map