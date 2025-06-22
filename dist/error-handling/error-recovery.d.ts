import { EventEmitter } from 'events';
import { ErrorClassifier, ClassifiedError, ErrorSeverity, ErrorCategory, ErrorType } from './error-classifier';
/**
 * Context information for error recovery decisions
 */
export interface RecoveryContext {
    userId?: string;
    userRole?: 'admin' | 'developer' | 'end_user' | 'guest';
    userExperience?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    userPreferences?: {
        autoRetry?: boolean;
        detailedErrors?: boolean;
        fallbackMode?: 'conservative' | 'aggressive';
        notificationLevel?: 'minimal' | 'normal' | 'verbose';
    };
    systemLoad?: number;
    availableMemory?: number;
    networkQuality?: 'excellent' | 'good' | 'poor' | 'offline';
    currentTime?: Date;
    timezone?: string;
    workflowId?: string;
    workflowComplexity?: 'simple' | 'moderate' | 'complex' | 'enterprise';
    criticalWorkflow?: boolean;
    workflowProgress?: number;
    previousFailures?: number;
    environment?: 'development' | 'staging' | 'production';
    deploymentMode?: 'local' | 'cloud' | 'hybrid';
    resourceConstraints?: {
        maxRetries?: number;
        timeoutLimits?: number;
        memoryLimits?: number;
    };
    recentErrors?: ClassifiedError[];
    recoveryHistory?: RecoveryAttempt[];
    userBehaviorPattern?: 'patient' | 'impatient' | 'technical' | 'non_technical';
}
/**
 * Recovery action definition
 */
export interface RecoveryAction {
    id: string;
    type: 'retry' | 'fallback' | 'alternative' | 'manual' | 'escalate' | 'abort';
    priority: number;
    description: string;
    userMessage: string;
    technicalDetails?: string;
    estimatedDuration?: number;
    successProbability?: number;
    parameters?: {
        retryCount?: number;
        retryDelay?: number;
        fallbackWorkflow?: string;
        alternativeApproach?: string;
        manualSteps?: string[];
        escalationTarget?: string;
    };
    conditions?: {
        maxRetries?: number;
        minSystemLoad?: number;
        requiredNetworkQuality?: string;
        userPermissions?: string[];
    };
    metadata?: {
        category?: string;
        tags?: string[];
        documentation?: string;
        supportContact?: string;
    };
}
/**
 * Recovery attempt tracking
 */
export interface RecoveryAttempt {
    id: string;
    timestamp: Date;
    errorId: string;
    action: RecoveryAction;
    context: RecoveryContext;
    result: 'success' | 'failure' | 'partial' | 'abandoned';
    duration: number;
    userFeedback?: 'helpful' | 'not_helpful' | 'confusing';
    notes?: string;
}
/**
 * Recovery plan containing multiple potential actions
 */
export interface RecoveryPlan {
    id: string;
    errorId: string;
    context: RecoveryContext;
    actions: RecoveryAction[];
    recommendedAction: RecoveryAction;
    alternativeActions: RecoveryAction[];
    estimatedTotalTime: number;
    successProbability: number;
    userGuidance: string;
    technicalSummary: string;
    createdAt: Date;
    expiresAt?: Date;
}
/**
 * Recovery strategy definition
 */
export interface ContextualRecoveryStrategy {
    id: string;
    name: string;
    description: string;
    applicableErrors: {
        categories?: ErrorCategory[];
        types?: ErrorType[];
        severities?: ErrorSeverity[];
    };
    contextRequirements: {
        userRoles?: string[];
        environments?: string[];
        systemConditions?: string[];
    };
    generateActions: (error: ClassifiedError, context: RecoveryContext) => RecoveryAction[];
    priority: number;
    enabled: boolean;
}
/**
 * Recovery metrics and analytics
 */
export interface RecoveryMetrics {
    totalAttempts: number;
    successfulRecoveries: number;
    failedRecoveries: number;
    averageRecoveryTime: number;
    mostEffectiveStrategies: string[];
    userSatisfactionScore: number;
    contextualSuccessRates: Map<string, number>;
    recoveryTrends: {
        period: string;
        attempts: number;
        successRate: number;
    }[];
}
/**
 * Context-aware error recovery manager
 */
export declare class ErrorRecoveryManager extends EventEmitter {
    private strategies;
    private recoveryHistory;
    private activeRecoveries;
    private errorClassifier;
    private maxHistorySize;
    constructor(errorClassifier: ErrorClassifier);
    /**
     * Generate a recovery plan for a classified error
     */
    generateRecoveryPlan(error: ClassifiedError, context: RecoveryContext): Promise<RecoveryPlan>;
    /**
     * Execute a recovery action
     */
    executeRecoveryAction(planId: string, actionId: string, executionContext?: any): Promise<RecoveryAttempt>;
    /**
     * Add a custom recovery strategy
     */
    addRecoveryStrategy(strategy: ContextualRecoveryStrategy): void;
    /**
     * Remove a recovery strategy
     */
    removeRecoveryStrategy(strategyId: string): boolean;
    /**
     * Get recovery metrics and analytics
     */
    getRecoveryMetrics(): RecoveryMetrics;
    /**
     * Initialize default recovery strategies
     */
    private initializeDefaultStrategies;
    /**
     * Find applicable recovery strategies for an error and context
     */
    private findApplicableStrategies;
    /**
     * Generate workflow recovery actions
     */
    private generateWorkflowRecoveryActions;
    /**
     * Generate community node recovery actions
     */
    private generateCommunityNodeRecoveryActions;
    /**
     * Generate network recovery actions
     */
    private generateNetworkRecoveryActions;
    /**
     * Generate system recovery actions
     */
    private generateSystemRecoveryActions;
    /**
     * Generate user experience-based recovery actions
     */
    private generateUserExperienceRecoveryActions;
    /**
     * Remove duplicate actions based on type and description
     */
    private deduplicateActions;
    /**
     * Filter actions based on context constraints
     */
    private filterFeasibleActions;
    /**
     * Calculate estimated duration for recovery plan
     */
    private calculatePlanDuration;
    /**
     * Calculate success probability for recovery plan
     */
    private calculatePlanSuccessProbability;
    /**
     * Generate user-friendly guidance message
     */
    private generateUserGuidance;
    /**
     * Generate technical summary for developers
     */
    private generateTechnicalSummary;
    /**
     * Get numeric score for network quality
     */
    private getNetworkQualityScore;
    /**
     * Execute retry recovery action
     */
    private executeRetryAction;
    /**
     * Execute fallback recovery action
     */
    private executeFallbackAction;
    /**
     * Execute alternative recovery action
     */
    private executeAlternativeAction;
    /**
     * Execute manual recovery action
     */
    private executeManualAction;
    /**
     * Execute escalation recovery action
     */
    private executeEscalationAction;
    /**
     * Clean up old recovery history
     */
    private cleanupHistory;
}
export default ErrorRecoveryManager;
//# sourceMappingURL=error-recovery.d.ts.map