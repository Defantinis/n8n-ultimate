/**
 * Database and File I/O Optimization System
 *
 * Provides comprehensive optimization for database and file operations including:
 * - Connection pooling for database operations
 * - Buffered I/O with multiple buffer pools
 * - Parallelization using Node.js concurrency
 * - Intelligent caching strategies
 * - Memory-efficient resource management
 */
import { EventEmitter } from 'events';
interface ConnectionPoolConfig {
    maxConnections: number;
    minConnections: number;
    acquireTimeoutMs: number;
    idleTimeoutMs: number;
    maxRetries: number;
}
export declare class DatabaseIOOptimizer extends EventEmitter {
    private connectionPool;
    private isInitialized;
    constructor(connectionConfig?: Partial<ConnectionPoolConfig>);
    private setupEventHandlers;
    initialize(): Promise<void>;
    executeQuery(query: string, params?: any[]): Promise<any>;
    getMetrics(): any;
    close(): Promise<void>;
}
export default DatabaseIOOptimizer;
//# sourceMappingURL=database-io-optimizer.d.ts.map