import { RecoveryContext } from './error-recovery';
import { ClassifiedError } from './error-classifier';
/**
 * Test data generators for error recovery testing
 */
declare class ErrorRecoveryTestData {
    static createMockContext(overrides?: Partial<RecoveryContext>): RecoveryContext;
    static createMockClassifiedError(overrides?: Partial<ClassifiedError>): ClassifiedError;
    static createHighSeverityNetworkError(): ClassifiedError;
    static createCommunityNodeError(): ClassifiedError;
    static createSystemResourceError(): ClassifiedError;
    static createBeginnerUserContext(): RecoveryContext;
    static createExpertUserContext(): RecoveryContext;
    static createConstrainedSystemContext(): RecoveryContext;
    static createProductionContext(): RecoveryContext;
}
/**
 * Test suite for Error Recovery Manager
 */
declare class ErrorRecoveryTests {
    private errorClassifier;
    private recoveryManager;
    constructor();
    /**
     * Test basic recovery plan generation
     */
    testBasicRecoveryPlanGeneration(): Promise<void>;
    /**
     * Test context-aware action filtering
     */
    testContextAwareFiltering(): Promise<void>;
    /**
     * Test user experience-based recovery
     */
    testUserExperienceRecovery(): Promise<void>;
    /**
     * Test recovery action execution
     */
    testRecoveryActionExecution(): Promise<void>;
    /**
     * Test custom recovery strategy
     */
    testCustomRecoveryStrategy(): Promise<void>;
    /**
     * Test recovery metrics and analytics
     */
    testRecoveryMetrics(): Promise<void>;
    /**
     * Test error type specific recovery
     */
    testErrorTypeSpecificRecovery(): Promise<void>;
    /**
     * Test production vs development context differences
     */
    testEnvironmentContextDifferences(): Promise<void>;
    /**
     * Run all tests
     */
    runAllTests(): Promise<void>;
}
export { ErrorRecoveryTests, ErrorRecoveryTestData };
//# sourceMappingURL=test-error-recovery.d.ts.map