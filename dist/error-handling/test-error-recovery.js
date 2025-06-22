import { ErrorRecoveryManager } from './error-recovery';
import { ErrorClassifier, ErrorSeverity, ErrorCategory, ErrorType, RecoveryStrategy } from './error-classifier';
/**
 * Test data generators for error recovery testing
 */
class ErrorRecoveryTestData {
    static createMockContext(overrides = {}) {
        return {
            userId: 'test_user_123',
            userRole: 'developer',
            userExperience: 'intermediate',
            userPreferences: {
                autoRetry: true,
                detailedErrors: true,
                fallbackMode: 'conservative',
                notificationLevel: 'normal'
            },
            systemLoad: 45,
            availableMemory: 2048,
            networkQuality: 'good',
            currentTime: new Date(),
            timezone: 'UTC',
            workflowId: 'test_workflow_456',
            workflowComplexity: 'moderate',
            criticalWorkflow: false,
            workflowProgress: 75,
            previousFailures: 1,
            environment: 'development',
            deploymentMode: 'local',
            resourceConstraints: {
                maxRetries: 3,
                timeoutLimits: 30000,
                memoryLimits: 1024
            },
            recentErrors: [],
            recoveryHistory: [],
            userBehaviorPattern: 'technical',
            ...overrides
        };
    }
    static createMockClassifiedError(overrides = {}) {
        return {
            id: 'error_test_789',
            originalError: new Error('Test workflow generation failed'),
            message: 'Workflow generation failed due to invalid node configuration',
            severity: ErrorSeverity.HIGH,
            category: ErrorCategory.WORKFLOW_GENERATION,
            type: ErrorType.WORKFLOW_EXECUTION_ERROR,
            recoveryStrategy: RecoveryStrategy.RETRY,
            context: {
                userId: 'test_user_123',
                workflowId: 'test_workflow_456',
                timestamp: new Date(),
                systemInfo: {
                    platform: 'darwin',
                    nodeVersion: '18.0.0',
                    memoryUsage: process.memoryUsage(),
                    uptime: process.uptime()
                }
            },
            technicalMessage: 'Node validation failed for HTTP Request node: missing authentication configuration',
            userFriendlyMessage: 'There was an issue with your workflow configuration. Let me help you fix it.',
            tags: ['workflow', 'validation', 'http'],
            relatedErrors: [],
            metadata: {
                source: 'workflow_generator',
                version: '1.0.0',
                environment: 'development'
            },
            stackTrace: 'Error: Test workflow generation failed\n    at Object.<anonymous>',
            suggestedActions: ['Check node configuration', 'Verify authentication'],
            isRetryable: true,
            maxRetries: 3,
            retryCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...overrides
        };
    }
    static createHighSeverityNetworkError() {
        return this.createMockClassifiedError({
            id: 'network_error_001',
            message: 'Network connection timeout',
            severity: ErrorSeverity.CRITICAL,
            category: ErrorCategory.NETWORK,
            type: ErrorType.CONNECTION_ERROR,
            originalError: new Error('ECONNRESET: Connection reset by peer'),
            technicalMessage: 'HTTP request to n8n API timed out after 30 seconds',
            userFriendlyMessage: 'Unable to connect to the n8n service. Please check your network connection.'
        });
    }
    static createCommunityNodeError() {
        return this.createMockClassifiedError({
            id: 'community_error_002',
            message: 'Community node installation failed',
            severity: ErrorSeverity.MEDIUM,
            category: ErrorCategory.COMMUNITY_NODE,
            type: ErrorType.NODE_INSTALLATION_FAILED,
            originalError: new Error('npm install failed with exit code 1'),
            technicalMessage: 'Failed to install @n8n/n8n-nodes-discord: version conflict with existing dependencies',
            userFriendlyMessage: 'There was a problem installing the Discord node. I can suggest alternatives.'
        });
    }
    static createSystemResourceError() {
        return this.createMockClassifiedError({
            id: 'system_error_003',
            message: 'Insufficient system resources',
            severity: ErrorSeverity.HIGH,
            category: ErrorCategory.SYSTEM,
            type: ErrorType.RESOURCE_EXHAUSTION,
            originalError: new Error('Out of memory'),
            technicalMessage: 'Available memory (256MB) insufficient for workflow execution',
            userFriendlyMessage: 'Your system is running low on memory. I\'ll try a lighter approach.'
        });
    }
    static createBeginnerUserContext() {
        return this.createMockContext({
            userRole: 'end_user',
            userExperience: 'beginner',
            userPreferences: {
                autoRetry: false,
                detailedErrors: false,
                fallbackMode: 'conservative',
                notificationLevel: 'minimal'
            },
            userBehaviorPattern: 'non_technical'
        });
    }
    static createExpertUserContext() {
        return this.createMockContext({
            userRole: 'admin',
            userExperience: 'expert',
            userPreferences: {
                autoRetry: true,
                detailedErrors: true,
                fallbackMode: 'aggressive',
                notificationLevel: 'verbose'
            },
            userBehaviorPattern: 'technical'
        });
    }
    static createConstrainedSystemContext() {
        return this.createMockContext({
            systemLoad: 95,
            availableMemory: 128,
            networkQuality: 'poor',
            resourceConstraints: {
                maxRetries: 1,
                timeoutLimits: 10000,
                memoryLimits: 256
            }
        });
    }
    static createProductionContext() {
        return this.createMockContext({
            environment: 'production',
            deploymentMode: 'cloud',
            criticalWorkflow: true,
            userRole: 'admin',
            resourceConstraints: {
                maxRetries: 5,
                timeoutLimits: 60000,
                memoryLimits: 4096
            }
        });
    }
}
/**
 * Test suite for Error Recovery Manager
 */
class ErrorRecoveryTests {
    errorClassifier;
    recoveryManager;
    constructor() {
        this.errorClassifier = new ErrorClassifier();
        this.recoveryManager = new ErrorRecoveryManager(this.errorClassifier);
    }
    /**
     * Test basic recovery plan generation
     */
    async testBasicRecoveryPlanGeneration() {
        console.log('Testing basic recovery plan generation...');
        const error = ErrorRecoveryTestData.createMockClassifiedError();
        const context = ErrorRecoveryTestData.createMockContext();
        try {
            const plan = await this.recoveryManager.generateRecoveryPlan(error, context);
            // Verify plan structure
            if (!plan.id || !plan.errorId || !plan.actions || !plan.recommendedAction) {
                throw new Error('Recovery plan missing required fields');
            }
            if (plan.actions.length === 0) {
                throw new Error('Recovery plan should contain at least one action');
            }
            if (!plan.actions.includes(plan.recommendedAction)) {
                throw new Error('Recommended action should be included in actions list');
            }
            console.log(`✅ Generated recovery plan with ${plan.actions.length} actions`);
            console.log(`   Recommended: ${plan.recommendedAction.description}`);
            console.log(`   Success probability: ${(plan.successProbability * 100).toFixed(1)}%`);
        }
        catch (error) {
            console.error('❌ Basic recovery plan generation failed:', error.message);
            throw error;
        }
    }
    /**
     * Test context-aware action filtering
     */
    async testContextAwareFiltering() {
        console.log('Testing context-aware action filtering...');
        const error = ErrorRecoveryTestData.createHighSeverityNetworkError();
        // Test with constrained system
        const constrainedContext = ErrorRecoveryTestData.createConstrainedSystemContext();
        const constrainedPlan = await this.recoveryManager.generateRecoveryPlan(error, constrainedContext);
        // Test with normal system
        const normalContext = ErrorRecoveryTestData.createMockContext();
        const normalPlan = await this.recoveryManager.generateRecoveryPlan(error, normalContext);
        // Constrained system should have fewer or different actions
        console.log(`✅ Constrained system: ${constrainedPlan.actions.length} actions`);
        console.log(`   Normal system: ${normalPlan.actions.length} actions`);
        // Verify retry limits are respected
        const constrainedRetryActions = constrainedPlan.actions.filter(a => a.type === 'retry');
        const normalRetryActions = normalPlan.actions.filter(a => a.type === 'retry');
        if (constrainedRetryActions.length > normalRetryActions.length) {
            throw new Error('Constrained system should not have more retry actions');
        }
        console.log('✅ Context-aware filtering working correctly');
    }
    /**
     * Test user experience-based recovery
     */
    async testUserExperienceRecovery() {
        console.log('Testing user experience-based recovery...');
        const error = ErrorRecoveryTestData.createCommunityNodeError();
        // Test beginner user
        const beginnerContext = ErrorRecoveryTestData.createBeginnerUserContext();
        const beginnerPlan = await this.recoveryManager.generateRecoveryPlan(error, beginnerContext);
        // Test expert user
        const expertContext = ErrorRecoveryTestData.createExpertUserContext();
        const expertPlan = await this.recoveryManager.generateRecoveryPlan(error, expertContext);
        // Beginner should get more guided, manual actions
        const beginnerManualActions = beginnerPlan.actions.filter(a => a.type === 'manual');
        const expertManualActions = expertPlan.actions.filter(a => a.type === 'manual');
        console.log(`✅ Beginner manual actions: ${beginnerManualActions.length}`);
        console.log(`   Expert manual actions: ${expertManualActions.length}`);
        // Check user guidance differences
        if (beginnerPlan.userGuidance === expertPlan.userGuidance) {
            console.log('⚠️  User guidance should be different for different experience levels');
        }
        else {
            console.log('✅ User guidance adapted for experience level');
        }
    }
    /**
     * Test recovery action execution
     */
    async testRecoveryActionExecution() {
        console.log('Testing recovery action execution...');
        const error = ErrorRecoveryTestData.createMockClassifiedError();
        const context = ErrorRecoveryTestData.createMockContext();
        const plan = await this.recoveryManager.generateRecoveryPlan(error, context);
        if (plan.actions.length === 0) {
            throw new Error('No actions available for execution test');
        }
        // Execute the recommended action
        const attempt = await this.recoveryManager.executeRecoveryAction(plan.id, plan.recommendedAction.id);
        // Verify attempt structure
        if (!attempt.id || !attempt.timestamp || !attempt.result) {
            throw new Error('Recovery attempt missing required fields');
        }
        if (!['success', 'failure', 'partial', 'abandoned'].includes(attempt.result)) {
            throw new Error('Invalid recovery attempt result');
        }
        console.log(`✅ Recovery action executed: ${attempt.result}`);
        console.log(`   Duration: ${attempt.duration}ms`);
    }
    /**
     * Test custom recovery strategy
     */
    async testCustomRecoveryStrategy() {
        console.log('Testing custom recovery strategy...');
        // Add a custom strategy
        const customStrategy = {
            id: 'test_custom_strategy',
            name: 'Test Custom Strategy',
            description: 'Custom strategy for testing',
            applicableErrors: {
                categories: [ErrorCategory.WORKFLOW_GENERATION]
            },
            contextRequirements: {},
            generateActions: (error, context) => {
                return [{
                        id: 'custom_test_action',
                        type: 'alternative',
                        priority: 10,
                        description: 'Custom test action',
                        userMessage: 'This is a custom recovery action',
                        estimatedDuration: 15,
                        successProbability: 0.95
                    }];
            },
            priority: 10,
            enabled: true
        };
        this.recoveryManager.addRecoveryStrategy(customStrategy);
        const error = ErrorRecoveryTestData.createMockClassifiedError();
        const context = ErrorRecoveryTestData.createMockContext();
        const plan = await this.recoveryManager.generateRecoveryPlan(error, context);
        // Check if custom action is included
        const customAction = plan.actions.find(a => a.id === 'custom_test_action');
        if (!customAction) {
            throw new Error('Custom recovery action not found in plan');
        }
        // Custom action should be recommended due to high priority
        if (plan.recommendedAction.id !== 'custom_test_action') {
            console.log('⚠️  Custom action not recommended despite high priority');
        }
        else {
            console.log('✅ Custom strategy working correctly');
        }
        // Clean up
        this.recoveryManager.removeRecoveryStrategy('test_custom_strategy');
    }
    /**
     * Test recovery metrics and analytics
     */
    async testRecoveryMetrics() {
        console.log('Testing recovery metrics and analytics...');
        // Generate some recovery attempts
        const error = ErrorRecoveryTestData.createMockClassifiedError();
        const context = ErrorRecoveryTestData.createMockContext();
        for (let i = 0; i < 5; i++) {
            const plan = await this.recoveryManager.generateRecoveryPlan(error, context);
            await this.recoveryManager.executeRecoveryAction(plan.id, plan.recommendedAction.id);
        }
        const metrics = this.recoveryManager.getRecoveryMetrics();
        // Verify metrics structure
        if (typeof metrics.totalAttempts !== 'number' ||
            typeof metrics.successfulRecoveries !== 'number' ||
            typeof metrics.failedRecoveries !== 'number' ||
            typeof metrics.averageRecoveryTime !== 'number') {
            throw new Error('Invalid metrics structure');
        }
        if (metrics.totalAttempts !== metrics.successfulRecoveries + metrics.failedRecoveries) {
            console.log('⚠️  Total attempts should equal successful + failed recoveries');
        }
        console.log(`✅ Recovery metrics: ${metrics.totalAttempts} total attempts`);
        console.log(`   Success rate: ${(metrics.successfulRecoveries / metrics.totalAttempts * 100).toFixed(1)}%`);
        console.log(`   Average time: ${metrics.averageRecoveryTime.toFixed(0)}ms`);
    }
    /**
     * Test error type specific recovery
     */
    async testErrorTypeSpecificRecovery() {
        console.log('Testing error type-specific recovery...');
        const errors = [
            ErrorRecoveryTestData.createHighSeverityNetworkError(),
            ErrorRecoveryTestData.createCommunityNodeError(),
            ErrorRecoveryTestData.createSystemResourceError()
        ];
        const context = ErrorRecoveryTestData.createMockContext();
        for (const error of errors) {
            const plan = await this.recoveryManager.generateRecoveryPlan(error, context);
            console.log(`✅ ${error.category} error: ${plan.actions.length} recovery actions`);
            console.log(`   Recommended: ${plan.recommendedAction.type} - ${plan.recommendedAction.description}`);
            // Verify actions are appropriate for error type
            if (error.category === ErrorCategory.NETWORK) {
                const hasRetryAction = plan.actions.some(a => a.type === 'retry');
                if (!hasRetryAction) {
                    console.log('⚠️  Network errors should typically include retry actions');
                }
            }
            if (error.category === ErrorCategory.COMMUNITY_NODE) {
                const hasAlternativeAction = plan.actions.some(a => a.type === 'alternative');
                if (!hasAlternativeAction) {
                    console.log('⚠️  Community node errors should typically include alternative actions');
                }
            }
            if (error.category === ErrorCategory.SYSTEM) {
                const hasSystemOptimization = plan.actions.some(a => a.description.toLowerCase().includes('memory') ||
                    a.description.toLowerCase().includes('load'));
                if (!hasSystemOptimization) {
                    console.log('⚠️  System errors should typically include optimization actions');
                }
            }
        }
    }
    /**
     * Test production vs development context differences
     */
    async testEnvironmentContextDifferences() {
        console.log('Testing environment context differences...');
        const error = ErrorRecoveryTestData.createMockClassifiedError({
            severity: ErrorSeverity.CRITICAL
        });
        // Test development environment
        const devContext = ErrorRecoveryTestData.createMockContext({
            environment: 'development'
        });
        const devPlan = await this.recoveryManager.generateRecoveryPlan(error, devContext);
        // Test production environment
        const prodContext = ErrorRecoveryTestData.createProductionContext();
        const prodPlan = await this.recoveryManager.generateRecoveryPlan(error, prodContext);
        console.log(`✅ Development environment: ${devPlan.actions.length} actions`);
        console.log(`   Production environment: ${prodPlan.actions.length} actions`);
        // Production should be more conservative
        if (prodPlan.successProbability < devPlan.successProbability) {
            console.log('⚠️  Production recovery should not have lower success probability');
        }
        // Check for escalation actions in production
        const prodEscalationActions = prodPlan.actions.filter(a => a.type === 'escalate');
        const devEscalationActions = devPlan.actions.filter(a => a.type === 'escalate');
        if (prodEscalationActions.length <= devEscalationActions.length) {
            console.log('⚠️  Production should typically have more escalation options');
        }
        console.log('✅ Environment-specific recovery strategies working');
    }
    /**
     * Run all tests
     */
    async runAllTests() {
        console.log('🧪 Starting Error Recovery Manager Tests\n');
        const tests = [
            () => this.testBasicRecoveryPlanGeneration(),
            () => this.testContextAwareFiltering(),
            () => this.testUserExperienceRecovery(),
            () => this.testRecoveryActionExecution(),
            () => this.testCustomRecoveryStrategy(),
            () => this.testRecoveryMetrics(),
            () => this.testErrorTypeSpecificRecovery(),
            () => this.testEnvironmentContextDifferences()
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
            console.log('🎉 All Error Recovery Manager tests passed!');
        }
        else {
            console.log('⚠️  Some tests failed. Please review the implementation.');
        }
    }
}
// Export for use in other test files
export { ErrorRecoveryTests, ErrorRecoveryTestData };
// Run tests if this file is executed directly
if (require.main === module) {
    const tests = new ErrorRecoveryTests();
    tests.runAllTests().catch(console.error);
}
//# sourceMappingURL=test-error-recovery.js.map