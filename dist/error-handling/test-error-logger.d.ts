import { TelemetryData, AlertRule } from './error-logger';
import { ClassifiedError } from './error-classifier';
/**
 * Test data generators for error logging testing
 */
declare class ErrorLoggerTestData {
    static createMockClassifiedError(overrides?: Partial<ClassifiedError>): ClassifiedError;
    static createMockTelemetryData(overrides?: Partial<TelemetryData>): TelemetryData;
    static createTestAlertRule(overrides?: Partial<AlertRule>): AlertRule;
    static createCriticalError(): ClassifiedError;
    static createNetworkError(): ClassifiedError;
    static createWorkflowError(): ClassifiedError;
}
/**
 * Test suite for Advanced Error Logger
 */
declare class ErrorLoggerTests {
    private logger;
    private testLogDir;
    private errorClassifier;
    constructor();
    /**
     * Test basic error logging functionality
     */
    testBasicErrorLogging(): Promise<void>;
    /**
     * Test general message logging
     */
    testGeneralLogging(): Promise<void>;
    /**
     * Test log filtering and querying
     */
    testLogFiltering(): Promise<void>;
    /**
     * Test monitoring metrics generation
     */
    testMonitoringMetrics(): Promise<void>;
    /**
     * Test alert rules and notifications
     */
    testAlertSystem(): Promise<void>;
    /**
     * Test log export functionality
     */
    testLogExport(): Promise<void>;
    /**
     * Test custom log outputs
     */
    testCustomOutputs(): Promise<void>;
    /**
     * Test telemetry data collection
     */
    testTelemetryCollection(): Promise<void>;
    /**
     * Test error correlation and related error detection
     */
    testErrorCorrelation(): Promise<void>;
    /**
     * Test logger shutdown and cleanup
     */
    testShutdownAndCleanup(): Promise<void>;
    /**
     * Run all tests
     */
    runAllTests(): Promise<void>;
    /**
     * Cleanup test resources
     */
    private cleanup;
}
export { ErrorLoggerTests, ErrorLoggerTestData };
//# sourceMappingURL=test-error-logger.d.ts.map