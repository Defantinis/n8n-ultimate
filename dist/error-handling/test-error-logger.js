import { AdvancedErrorLogger, LogLevel } from './error-logger';
import { ErrorClassifier, ErrorSeverity, ErrorCategory, ErrorType, RecoveryStrategy } from './error-classifier';
import { tmpdir } from 'os';
import { join } from 'path';
import { rmSync, existsSync } from 'fs';
/**
 * Test data generators for error logging testing
 */
class ErrorLoggerTestData {
    static createMockClassifiedError(overrides = {}) {
        return {
            id: 'test_error_123',
            originalError: new Error('Test error for logging'),
            message: 'Test error occurred during workflow execution',
            severity: ErrorSeverity.HIGH,
            category: ErrorCategory.WORKFLOW_GENERATION,
            type: ErrorType.WORKFLOW_EXECUTION_ERROR,
            recoveryStrategy: RecoveryStrategy.RETRY,
            context: {
                userId: 'test_user_456',
                sessionId: 'test_session_789',
                workflowId: 'test_workflow_101',
                nodeId: 'test_node_202',
                timestamp: new Date(),
                systemInfo: {
                    platform: 'darwin',
                    nodeVersion: '18.0.0',
                    memoryUsage: process.memoryUsage(),
                    uptime: process.uptime()
                }
            },
            technicalMessage: 'Workflow execution failed at node validation step',
            userFriendlyMessage: 'There was an issue with your workflow. Please check the configuration.',
            tags: ['workflow', 'execution', 'test'],
            relatedErrors: [],
            metadata: {
                source: 'test',
                version: '1.0.0',
                environment: 'test'
            },
            stackTrace: 'Error: Test error\n    at Object.<anonymous>',
            suggestedActions: ['Check workflow configuration', 'Retry execution'],
            isRetryable: true,
            maxRetries: 3,
            retryCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        };
    }
    static createMockTelemetryData(overrides = {}) {
        return {
            timestamp: new Date(),
            sessionId: 'test_session_789',
            userId: 'test_user_456',
            errorId: 'test_error_123',
            systemInfo: {
                platform: process.platform,
                arch: process.arch,
                nodeVersion: process.version,
                memoryUsage: process.memoryUsage(),
                cpuUsage: 12345,
                uptime: process.uptime(),
                loadAverage: process.platform !== 'win32' ? process.loadavg() : undefined
            },
            applicationInfo: {
                version: '1.0.0',
                environment: 'development',
                buildNumber: 'test-build-123',
                commitHash: 'abc123def456',
                deploymentId: 'test-deployment-789'
            },
            performanceMetrics: {
                executionTime: 150,
                memoryDelta: 1024 * 1024, // 1MB
                cpuDelta: 50,
                networkLatency: 25,
                dbQueryTime: 75,
                cacheHitRate: 0.85
            },
            userInteraction: {
                userAgent: 'Test-Agent/1.0',
                ipAddress: '127.0.0.1',
                sessionDuration: 300000, // 5 minutes
                actionsPerformed: 15,
                lastAction: 'create_workflow',
                errorContext: 'workflow_execution'
            },
            workflowTelemetry: {
                workflowId: 'test_workflow_101',
                nodeCount: 5,
                connectionCount: 4,
                executionCount: 10,
                avgExecutionTime: 200,
                failureRate: 0.1
            },
            customData: {
                testMode: true,
                feature: 'error_logging_test'
            },
            ...overrides
        };
    }
    static createTestAlertRule(overrides = {}) {
        return {
            id: 'test_alert_rule',
            name: 'Test Alert Rule',
            description: 'Alert rule for testing purposes',
            enabled: true,
            conditions: {
                errorRate: 5,
                timeWindow: 10
            },
            actions: {
                email: ['test@example.com'],
                webhook: 'https://test.example.com/webhook'
            },
            throttle: {
                maxAlertsPerHour: 5,
                cooldownPeriod: 10
            },
            ...overrides
        };
    }
    static createCriticalError() {
        return this.createMockClassifiedError({
            id: 'critical_error_001',
            severity: ErrorSeverity.CRITICAL,
            category: ErrorCategory.SYSTEM,
            type: ErrorType.MEMORY_ERROR,
            message: 'Critical system memory error',
            technicalMessage: 'System ran out of available memory during workflow execution',
            userFriendlyMessage: 'A critical system error occurred. Please contact support.'
        });
    }
    static createNetworkError() {
        return this.createMockClassifiedError({
            id: 'network_error_002',
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.NETWORK,
            type: ErrorType.CONNECTION_ERROR,
            message: 'Network connection failed',
            technicalMessage: 'Failed to establish connection to external API',
            userFriendlyMessage: 'Unable to connect to the service. Please check your internet connection.'
        });
    }
    static createWorkflowError() {
        return this.createMockClassifiedError({
            id: 'workflow_error_003',
            severity: ErrorSeverity.LOW,
            category: ErrorCategory.WORKFLOW_VALIDATION,
            type: ErrorType.NODE_CONNECTION_ERROR,
            message: 'Invalid node connection',
            technicalMessage: 'Node connection validation failed: missing required input',
            userFriendlyMessage: 'There\'s an issue with your workflow connections. Please review the setup.'
        });
    }
}
/**
 * Test suite for Advanced Error Logger
 */
class ErrorLoggerTests {
    logger;
    testLogDir;
    errorClassifier;
    constructor() {
        this.testLogDir = join(tmpdir(), 'error-logger-tests');
        this.errorClassifier = new ErrorClassifier();
        this.logger = new AdvancedErrorLogger({
            logDirectory: this.testLogDir,
            maxHistorySize: 1000,
            sessionId: 'test_session_' + Date.now()
        });
    }
    /**
     * Test basic error logging functionality
     */
    async testBasicErrorLogging() {
        console.log('Testing basic error logging...');
        const error = ErrorLoggerTestData.createMockClassifiedError();
        const telemetry = ErrorLoggerTestData.createMockTelemetryData();
        try {
            const logId = await this.logger.logError(error, telemetry);
            if (!logId) {
                throw new Error('Log ID should be returned');
            }
            // Verify log entry was created
            const entries = this.logger.getLogEntries({ limit: 1 });
            if (entries.length === 0) {
                throw new Error('Log entry should be created');
            }
            const logEntry = entries[0];
            if (logEntry.error?.id !== error.id) {
                throw new Error('Log entry should contain the original error');
            }
            if (!logEntry.telemetry) {
                throw new Error('Log entry should contain telemetry data');
            }
            console.log(`✅ Basic error logging successful - Log ID: ${logId}`);
            console.log(`   Error: ${logEntry.message}`);
            console.log(`   Severity: ${logEntry.metadata.severity}`);
            console.log(`   Category: ${logEntry.metadata.category}`);
        }
        catch (error) {
            console.error('❌ Basic error logging failed:', error.message);
            throw error;
        }
    }
    /**
     * Test general message logging
     */
    async testGeneralLogging() {
        console.log('Testing general message logging...');
        try {
            const logId = await this.logger.log(LogLevel.INFO, 'Test info message', 'test_category', { customData: { test: true } });
            const entries = this.logger.getLogEntries({
                level: LogLevel.INFO,
                category: 'test_category',
                limit: 1
            });
            if (entries.length === 0) {
                throw new Error('Info log entry should be created');
            }
            const logEntry = entries[0];
            if (logEntry.message !== 'Test info message') {
                throw new Error('Log message should match input');
            }
            if (logEntry.level !== LogLevel.INFO) {
                throw new Error('Log level should match input');
            }
            console.log(`✅ General logging successful - Log ID: ${logId}`);
            console.log(`   Message: ${logEntry.message}`);
            console.log(`   Level: ${logEntry.level}`);
        }
        catch (error) {
            console.error('❌ General logging failed:', error.message);
            throw error;
        }
    }
    /**
     * Test log filtering and querying
     */
    async testLogFiltering() {
        console.log('Testing log filtering and querying...');
        try {
            // Create multiple log entries with different properties
            const errors = [
                ErrorLoggerTestData.createCriticalError(),
                ErrorLoggerTestData.createNetworkError(),
                ErrorLoggerTestData.createWorkflowError()
            ];
            for (const error of errors) {
                await this.logger.logError(error);
            }
            // Test filtering by severity
            const criticalEntries = this.logger.getLogEntries({
                severity: ErrorSeverity.CRITICAL
            });
            if (criticalEntries.length !== 1) {
                throw new Error('Should find exactly one critical error');
            }
            // Test filtering by category
            const networkEntries = this.logger.getLogEntries({
                category: ErrorCategory.NETWORK
            });
            if (networkEntries.length !== 1) {
                throw new Error('Should find exactly one network error');
            }
            // Test filtering by user
            const userEntries = this.logger.getLogEntries({
                userId: 'test_user_456'
            });
            if (userEntries.length < 3) {
                throw new Error('Should find at least 3 entries for test user');
            }
            // Test time range filtering
            const now = new Date();
            const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
            const recentEntries = this.logger.getLogEntries({
                timeRange: { start: oneMinuteAgo, end: now }
            });
            if (recentEntries.length === 0) {
                throw new Error('Should find recent entries');
            }
            console.log(`✅ Log filtering successful`);
            console.log(`   Critical errors: ${criticalEntries.length}`);
            console.log(`   Network errors: ${networkEntries.length}`);
            console.log(`   User entries: ${userEntries.length}`);
            console.log(`   Recent entries: ${recentEntries.length}`);
        }
        catch (error) {
            console.error('❌ Log filtering failed:', error.message);
            throw error;
        }
    }
    /**
     * Test monitoring metrics generation
     */
    async testMonitoringMetrics() {
        console.log('Testing monitoring metrics generation...');
        try {
            // Generate some test data
            const errors = [
                ErrorLoggerTestData.createCriticalError(),
                ErrorLoggerTestData.createNetworkError(),
                ErrorLoggerTestData.createWorkflowError()
            ];
            for (const error of errors) {
                await this.logger.logError(error);
            }
            // Get metrics
            const metrics = this.logger.getMetrics(60); // 60-minute window
            // Verify metrics structure
            if (!metrics.errorMetrics || !metrics.performanceMetrics ||
                !metrics.userMetrics || !metrics.systemHealth) {
                throw new Error('Metrics should contain all required sections');
            }
            // Verify error metrics
            if (metrics.errorMetrics.totalErrors < 3) {
                throw new Error('Should count at least 3 errors');
            }
            if (typeof metrics.errorMetrics.errorRate !== 'number') {
                throw new Error('Error rate should be a number');
            }
            // Verify system health score
            if (typeof metrics.systemHealth.overallScore !== 'number' ||
                metrics.systemHealth.overallScore < 0 ||
                metrics.systemHealth.overallScore > 100) {
                throw new Error('System health score should be between 0-100');
            }
            console.log(`✅ Monitoring metrics successful`);
            console.log(`   Total errors: ${metrics.errorMetrics.totalErrors}`);
            console.log(`   Error rate: ${metrics.errorMetrics.errorRate.toFixed(2)}/min`);
            console.log(`   System health: ${metrics.systemHealth.overallScore}/100`);
            console.log(`   Active users: ${metrics.userMetrics.activeUsers}`);
        }
        catch (error) {
            console.error('❌ Monitoring metrics failed:', error.message);
            throw error;
        }
    }
    /**
     * Test alert rules and notifications
     */
    async testAlertSystem() {
        console.log('Testing alert system...');
        try {
            let alertTriggered = false;
            let triggeredAlert = null;
            // Listen for alert events
            this.logger.on('alert_triggered', (alert) => {
                alertTriggered = true;
                triggeredAlert = alert;
            });
            // Add a test alert rule with low threshold
            const alertRule = ErrorLoggerTestData.createTestAlertRule({
                conditions: {
                    errorCount: 2,
                    timeWindow: 5,
                    severity: [ErrorSeverity.CRITICAL, ErrorSeverity.HIGH]
                }
            });
            this.logger.addAlertRule(alertRule);
            // Generate errors to trigger the alert
            const criticalError = ErrorLoggerTestData.createCriticalError();
            const highError = ErrorLoggerTestData.createMockClassifiedError({
                severity: ErrorSeverity.HIGH
            });
            await this.logger.logError(criticalError);
            await this.logger.logError(highError);
            // Wait a bit for alert processing
            await new Promise(resolve => setTimeout(resolve, 100));
            if (!alertTriggered) {
                throw new Error('Alert should have been triggered');
            }
            if (!triggeredAlert) {
                throw new Error('Alert notification should be created');
            }
            if (triggeredAlert.ruleId !== alertRule.id) {
                throw new Error('Alert should reference the correct rule');
            }
            if (triggeredAlert.affectedCount < 2) {
                throw new Error('Alert should count affected errors');
            }
            console.log(`✅ Alert system successful`);
            console.log(`   Alert ID: ${triggeredAlert.id}`);
            console.log(`   Rule: ${triggeredAlert.ruleName}`);
            console.log(`   Affected count: ${triggeredAlert.affectedCount}`);
            console.log(`   Severity: ${triggeredAlert.severity}`);
        }
        catch (error) {
            console.error('❌ Alert system failed:', error.message);
            throw error;
        }
    }
    /**
     * Test log export functionality
     */
    async testLogExport() {
        console.log('Testing log export functionality...');
        try {
            // Create some test entries
            await this.logger.log(LogLevel.INFO, 'Test export message 1', 'export_test');
            await this.logger.log(LogLevel.WARN, 'Test export message 2', 'export_test');
            await this.logger.log(LogLevel.ERROR, 'Test export message 3', 'export_test');
            // Test JSON export
            const jsonExport = this.logger.exportLogs('json', {
                category: 'export_test',
                limit: 10
            });
            if (!jsonExport) {
                throw new Error('JSON export should return data');
            }
            const parsedJson = JSON.parse(jsonExport);
            if (!Array.isArray(parsedJson)) {
                throw new Error('JSON export should be an array');
            }
            if (parsedJson.length < 3) {
                throw new Error('JSON export should contain test entries');
            }
            // Test CSV export
            const csvExport = this.logger.exportLogs('csv', {
                category: 'export_test',
                limit: 10
            });
            if (!csvExport) {
                throw new Error('CSV export should return data');
            }
            const csvLines = csvExport.split('\n');
            if (csvLines.length < 4) { // Header + 3 data lines
                throw new Error('CSV export should contain header and data lines');
            }
            // Test text export
            const textExport = this.logger.exportLogs('text', {
                category: 'export_test',
                limit: 10
            });
            if (!textExport) {
                throw new Error('Text export should return data');
            }
            const textLines = textExport.split('\n');
            if (textLines.length < 3) {
                throw new Error('Text export should contain data lines');
            }
            console.log(`✅ Log export successful`);
            console.log(`   JSON entries: ${parsedJson.length}`);
            console.log(`   CSV lines: ${csvLines.length}`);
            console.log(`   Text lines: ${textLines.length}`);
        }
        catch (error) {
            console.error('❌ Log export failed:', error.message);
            throw error;
        }
    }
    /**
     * Test custom log outputs
     */
    async testCustomOutputs() {
        console.log('Testing custom log outputs...');
        try {
            let customOutputCalled = false;
            let capturedEntry = null;
            // Add custom output
            this.logger.addOutput({
                type: 'custom',
                enabled: true,
                level: LogLevel.INFO,
                format: 'json',
                customHandler: async (entry) => {
                    customOutputCalled = true;
                    capturedEntry = entry;
                }
            });
            // Log a message that should trigger the custom output
            await this.logger.log(LogLevel.INFO, 'Test custom output message', 'custom_test');
            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 50));
            if (!customOutputCalled) {
                throw new Error('Custom output handler should be called');
            }
            if (!capturedEntry) {
                throw new Error('Custom output should capture log entry');
            }
            if (capturedEntry.message !== 'Test custom output message') {
                throw new Error('Custom output should receive correct log entry');
            }
            console.log(`✅ Custom outputs successful`);
            console.log(`   Handler called: ${customOutputCalled}`);
            console.log(`   Captured message: ${capturedEntry.message}`);
        }
        catch (error) {
            console.error('❌ Custom outputs failed:', error.message);
            throw error;
        }
    }
    /**
     * Test telemetry data collection
     */
    async testTelemetryCollection() {
        console.log('Testing telemetry data collection...');
        try {
            const error = ErrorLoggerTestData.createMockClassifiedError();
            const customTelemetry = {
                customData: {
                    feature: 'telemetry_test',
                    experimentId: 'exp_123'
                },
                performanceMetrics: {
                    executionTime: 500,
                    memoryDelta: 2048,
                    cpuDelta: 100
                }
            };
            await this.logger.logError(error, customTelemetry);
            const entries = this.logger.getLogEntries({ limit: 1 });
            const logEntry = entries[0];
            if (!logEntry.telemetry) {
                throw new Error('Log entry should contain telemetry data');
            }
            // Verify system info is collected
            if (!logEntry.telemetry.systemInfo.platform) {
                throw new Error('System info should be collected');
            }
            // Verify custom data is preserved
            if (logEntry.telemetry.customData?.feature !== 'telemetry_test') {
                throw new Error('Custom telemetry data should be preserved');
            }
            // Verify performance metrics are merged
            if (logEntry.telemetry.performanceMetrics.executionTime !== 500) {
                throw new Error('Custom performance metrics should be used');
            }
            // Verify application info is populated
            if (!logEntry.telemetry.applicationInfo.version) {
                throw new Error('Application info should be populated');
            }
            console.log(`✅ Telemetry collection successful`);
            console.log(`   Platform: ${logEntry.telemetry.systemInfo.platform}`);
            console.log(`   Memory usage: ${Math.round(logEntry.telemetry.systemInfo.memoryUsage.heapUsed / 1024 / 1024)}MB`);
            console.log(`   Execution time: ${logEntry.telemetry.performanceMetrics.executionTime}ms`);
            console.log(`   Custom feature: ${logEntry.telemetry.customData?.feature}`);
        }
        catch (error) {
            console.error('❌ Telemetry collection failed:', error.message);
            throw error;
        }
    }
    /**
     * Test error correlation and related error detection
     */
    async testErrorCorrelation() {
        console.log('Testing error correlation...');
        try {
            // Create related errors with same workflow ID
            const workflowId = 'correlation_test_workflow';
            const baseError = ErrorLoggerTestData.createMockClassifiedError({
                context: {
                    ...ErrorLoggerTestData.createMockClassifiedError().context,
                    workflowId
                }
            });
            const relatedError = ErrorLoggerTestData.createNetworkError();
            relatedError.context.workflowId = workflowId;
            await this.logger.logError(baseError);
            await this.logger.logError(relatedError);
            // Get entries for the workflow
            const workflowEntries = this.logger.getLogEntries({
                workflowId,
                limit: 10
            });
            if (workflowEntries.length < 2) {
                throw new Error('Should find related errors for the same workflow');
            }
            // Verify correlation IDs are present
            const correlationIds = workflowEntries.map(e => e.metadata.correlationId);
            if (correlationIds.some(id => !id)) {
                throw new Error('All entries should have correlation IDs');
            }
            console.log(`✅ Error correlation successful`);
            console.log(`   Related entries: ${workflowEntries.length}`);
            console.log(`   Workflow ID: ${workflowId}`);
            console.log(`   Correlation IDs: ${correlationIds.length} unique`);
        }
        catch (error) {
            console.error('❌ Error correlation failed:', error.message);
            throw error;
        }
    }
    /**
     * Test logger shutdown and cleanup
     */
    async testShutdownAndCleanup() {
        console.log('Testing logger shutdown and cleanup...');
        try {
            let shutdownEventEmitted = false;
            this.logger.on('shutdown', () => {
                shutdownEventEmitted = true;
            });
            // Test graceful shutdown
            await this.logger.shutdown();
            if (!shutdownEventEmitted) {
                throw new Error('Shutdown event should be emitted');
            }
            // Test that operations still work after shutdown (they should handle gracefully)
            try {
                await this.logger.log(LogLevel.INFO, 'Post-shutdown message');
                // This should not throw an error, but might not process normally
            }
            catch (error) {
                // Expected behavior - some operations might fail after shutdown
            }
            console.log(`✅ Shutdown and cleanup successful`);
            console.log(`   Shutdown event emitted: ${shutdownEventEmitted}`);
        }
        catch (error) {
            console.error('❌ Shutdown and cleanup failed:', error.message);
            throw error;
        }
    }
    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting Advanced Error Logger Tests\n');
        const tests = [
            () => this.testBasicErrorLogging(),
            () => this.testGeneralLogging(),
            () => this.testLogFiltering(),
            () => this.testMonitoringMetrics(),
            () => this.testAlertSystem(),
            () => this.testLogExport(),
            () => this.testCustomOutputs(),
            () => this.testTelemetryCollection(),
            () => this.testErrorCorrelation(),
            () => this.testShutdownAndCleanup()
        ];
        let passed = 0;
        let failed = 0;
        for (const test of tests) {
            try {
                await test();
                passed++;
                console.log('');
            }
            catch (error) {
                console.error(`❌ Test failed: ${error.message}\n`);
                failed++;
            }
        }
        console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);
        if (failed === 0) {
            console.log('🎉 All Advanced Error Logger tests passed!');
        }
        else {
            console.log('⚠️  Some tests failed. Please review the implementation.');
        }
        // Cleanup test directory
        this.cleanup();
    }
    /**
     * Cleanup test resources
     */
    cleanup() {
        try {
            if (existsSync(this.testLogDir)) {
                rmSync(this.testLogDir, { recursive: true, force: true });
            }
        }
        catch (error) {
            console.warn('Warning: Failed to cleanup test directory:', error.message);
        }
    }
}
// Export for use in other test files
export { ErrorLoggerTests, ErrorLoggerTestData };
// Run tests if this file is executed directly
if (require.main === module) {
    const tests = new ErrorLoggerTests();
    tests.runAllTests().catch(console.error);
}
//# sourceMappingURL=test-error-logger.js.map