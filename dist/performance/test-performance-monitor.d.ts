/**
 * Test Suite for Performance Monitor
 * Comprehensive testing of performance monitoring and profiling capabilities
 */
/**
 * Test data generator for performance monitoring tests
 */
export declare class PerformanceMonitorTestData {
    static generateTestConfig(): {
        enabled: boolean;
        interval: number;
        retentionPeriod: number;
        alerts: {
            enabled: boolean;
            thresholds: {
                cpuUsage: number;
                memoryUsage: number;
                eventLoopDelay: number;
                responseTime: number;
                errorRate: number;
            };
        };
        profiling: {
            enabled: boolean;
            sampleInterval: number;
            maxProfiles: number;
        };
        persistence: {
            enabled: boolean;
            directory: string;
            format: "json";
        };
    };
    static createCPULoad(duration?: number): Promise<void>;
    static createMemoryLoad(): Promise<void>;
    static simulateAsyncOperation(duration?: number): Promise<string>;
    static simulateHTTPRequest(responseTime?: number, statusCode?: number): Promise<void>;
}
/**
 * Comprehensive test suite for performance monitor
 */
export declare class PerformanceMonitorTest {
    private monitor;
    constructor();
    private setupTestEnvironment;
    /**
     * Run all performance monitor tests
     */
    runAllTests(): Promise<void>;
    /**
     * Test basic monitoring functionality
     */
    private testBasicMonitoring;
    /**
     * Test performance profiling functionality
     */
    private testPerformanceProfiling;
    /**
     * Test metrics collection accuracy
     */
    private testMetricsCollection;
    /**
     * Test alert system functionality
     */
    private testAlertSystem;
    /**
     * Test HTTP request tracking
     */
    private testHTTPTracking;
    /**
     * Test async operation tracking
     */
    private testAsyncTracking;
    /**
     * Test custom metrics functionality
     */
    private testCustomMetrics;
    /**
     * Test performance utilities
     */
    private testPerformanceUtils;
    /**
     * Test event emission functionality
     */
    private testEventEmission;
    /**
     * Test data retention functionality
     */
    private testDataRetention;
    /**
     * Test performance report generation
     */
    private testPerformanceReport;
    /**
     * Test error handling
     */
    private testErrorHandling;
    /**
     * Helper method for assertions
     */
    private assert;
}
/**
 * Test global monitor instance
 */
export declare function testGlobalMonitor(): Promise<void>;
/**
 * Export test runner function
 */
export declare function runPerformanceMonitorTests(): Promise<void>;
//# sourceMappingURL=test-performance-monitor.d.ts.map