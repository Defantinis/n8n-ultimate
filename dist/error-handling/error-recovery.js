import { EventEmitter } from 'events';
import { ErrorSeverity, ErrorCategory } from './error-classifier';
/**
 * Context-aware error recovery manager
 */
export class ErrorRecoveryManager extends EventEmitter {
    strategies = new Map();
    recoveryHistory = [];
    activeRecoveries = new Map();
    errorClassifier;
    maxHistorySize = 5000;
    constructor(errorClassifier) {
        super();
        this.errorClassifier = errorClassifier;
        this.initializeDefaultStrategies();
    }
    /**
     * Generate a recovery plan for a classified error
     */
    async generateRecoveryPlan(error, context) {
        this.emit('recovery_plan_requested', { errorId: error.id, context });
        try {
            // Find applicable strategies
            const applicableStrategies = this.findApplicableStrategies(error, context);
            // Generate actions from all applicable strategies
            const allActions = [];
            for (const strategy of applicableStrategies) {
                const actions = strategy.generateActions(error, context);
                allActions.push(...actions);
            }
            // Remove duplicates and sort by priority
            const uniqueActions = this.deduplicateActions(allActions);
            const sortedActions = uniqueActions.sort((a, b) => b.priority - a.priority);
            // Filter actions based on context constraints
            const feasibleActions = this.filterFeasibleActions(sortedActions, context);
            if (feasibleActions.length === 0) {
                throw new Error('No feasible recovery actions found');
            }
            // Select recommended action and alternatives
            const recommendedAction = feasibleActions[0];
            const alternativeActions = feasibleActions.slice(1, 4); // Top 3 alternatives
            // Calculate plan metrics
            const estimatedTotalTime = this.calculatePlanDuration(feasibleActions);
            const successProbability = this.calculatePlanSuccessProbability(feasibleActions, context);
            // Generate user guidance
            const userGuidance = this.generateUserGuidance(error, recommendedAction, context);
            const technicalSummary = this.generateTechnicalSummary(error, feasibleActions);
            const plan = {
                id: `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                errorId: error.id,
                context,
                actions: feasibleActions,
                recommendedAction,
                alternativeActions,
                estimatedTotalTime,
                successProbability,
                userGuidance,
                technicalSummary,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
            };
            this.activeRecoveries.set(plan.id, plan);
            this.emit('recovery_plan_generated', plan);
            return plan;
        }
        catch (error) {
            this.emit('recovery_plan_failed', { errorId: error.id, error: error.message });
            throw error;
        }
    }
    /**
     * Execute a recovery action
     */
    async executeRecoveryAction(planId, actionId, executionContext) {
        const plan = this.activeRecoveries.get(planId);
        if (!plan) {
            throw new Error(`Recovery plan ${planId} not found`);
        }
        const action = plan.actions.find(a => a.id === actionId);
        if (!action) {
            throw new Error(`Recovery action ${actionId} not found in plan`);
        }
        const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = Date.now();
        this.emit('recovery_attempt_started', { attemptId, planId, actionId });
        try {
            let result = 'failure';
            // Execute the recovery action based on its type
            switch (action.type) {
                case 'retry':
                    result = await this.executeRetryAction(action, executionContext);
                    break;
                case 'fallback':
                    result = await this.executeFallbackAction(action, executionContext);
                    break;
                case 'alternative':
                    result = await this.executeAlternativeAction(action, executionContext);
                    break;
                case 'manual':
                    result = await this.executeManualAction(action, executionContext);
                    break;
                case 'escalate':
                    result = await this.executeEscalationAction(action, executionContext);
                    break;
                case 'abort':
                    result = 'abandoned';
                    break;
            }
            const attempt = {
                id: attemptId,
                timestamp: new Date(),
                errorId: plan.errorId,
                action,
                context: plan.context,
                result,
                duration: Date.now() - startTime
            };
            this.recoveryHistory.push(attempt);
            this.cleanupHistory();
            this.emit('recovery_attempt_completed', attempt);
            return attempt;
        }
        catch (error) {
            const attempt = {
                id: attemptId,
                timestamp: new Date(),
                errorId: plan.errorId,
                action,
                context: plan.context,
                result: 'failure',
                duration: Date.now() - startTime,
                notes: error.message
            };
            this.recoveryHistory.push(attempt);
            this.emit('recovery_attempt_failed', attempt);
            return attempt;
        }
    }
    /**
     * Add a custom recovery strategy
     */
    addRecoveryStrategy(strategy) {
        this.strategies.set(strategy.id, strategy);
        this.emit('strategy_added', strategy);
    }
    /**
     * Remove a recovery strategy
     */
    removeRecoveryStrategy(strategyId) {
        const removed = this.strategies.delete(strategyId);
        if (removed) {
            this.emit('strategy_removed', strategyId);
        }
        return removed;
    }
    /**
     * Get recovery metrics and analytics
     */
    getRecoveryMetrics() {
        const totalAttempts = this.recoveryHistory.length;
        const successfulRecoveries = this.recoveryHistory.filter(a => a.result === 'success').length;
        const failedRecoveries = this.recoveryHistory.filter(a => a.result === 'failure').length;
        const totalDuration = this.recoveryHistory.reduce((sum, a) => sum + a.duration, 0);
        const averageRecoveryTime = totalAttempts > 0 ? totalDuration / totalAttempts : 0;
        // Calculate strategy effectiveness
        const strategyStats = new Map();
        this.recoveryHistory.forEach(attempt => {
            const strategyId = attempt.action.metadata?.category || 'unknown';
            const stats = strategyStats.get(strategyId) || { attempts: 0, successes: 0 };
            stats.attempts++;
            if (attempt.result === 'success')
                stats.successes++;
            strategyStats.set(strategyId, stats);
        });
        const mostEffectiveStrategies = Array.from(strategyStats.entries())
            .sort((a, b) => (b[1].successes / b[1].attempts) - (a[1].successes / a[1].attempts))
            .slice(0, 5)
            .map(([strategy]) => strategy);
        // Calculate user satisfaction
        const feedbackScores = this.recoveryHistory
            .filter(a => a.userFeedback)
            .map(a => a.userFeedback === 'helpful' ? 1 : a.userFeedback === 'not_helpful' ? 0 : 0.5);
        const userSatisfactionScore = feedbackScores.length > 0
            ? feedbackScores.reduce((sum, score) => sum + score, 0) / feedbackScores.length
            : 0;
        return {
            totalAttempts,
            successfulRecoveries,
            failedRecoveries,
            averageRecoveryTime,
            mostEffectiveStrategies,
            userSatisfactionScore,
            contextualSuccessRates: new Map(),
            recoveryTrends: []
        };
    }
    /**
     * Initialize default recovery strategies
     */
    initializeDefaultStrategies() {
        // Workflow Generation Recovery Strategy
        this.addRecoveryStrategy({
            id: 'workflow_generation_recovery',
            name: 'Workflow Generation Recovery',
            description: 'Handles errors during workflow generation with fallback approaches',
            applicableErrors: {
                categories: [ErrorCategory.WORKFLOW_GENERATION],
                severities: [ErrorSeverity.HIGH, ErrorSeverity.MEDIUM]
            },
            contextRequirements: {},
            generateActions: (error, context) => this.generateWorkflowRecoveryActions(error, context),
            priority: 8,
            enabled: true
        });
        // Community Node Recovery Strategy
        this.addRecoveryStrategy({
            id: 'community_node_recovery',
            name: 'Community Node Recovery',
            description: 'Handles community node installation and compatibility issues',
            applicableErrors: {
                categories: [ErrorCategory.COMMUNITY_NODE]
            },
            contextRequirements: {},
            generateActions: (error, context) => this.generateCommunityNodeRecoveryActions(error, context),
            priority: 7,
            enabled: true
        });
        // Network Recovery Strategy
        this.addRecoveryStrategy({
            id: 'network_recovery',
            name: 'Network Recovery',
            description: 'Handles network connectivity and API timeout issues',
            applicableErrors: {
                categories: [ErrorCategory.NETWORK]
            },
            contextRequirements: {},
            generateActions: (error, context) => this.generateNetworkRecoveryActions(error, context),
            priority: 9,
            enabled: true
        });
        // System Recovery Strategy
        this.addRecoveryStrategy({
            id: 'system_recovery',
            name: 'System Recovery',
            description: 'Handles system-level errors and resource constraints',
            applicableErrors: {
                categories: [ErrorCategory.SYSTEM, ErrorCategory.PERFORMANCE]
            },
            contextRequirements: {},
            generateActions: (error, context) => this.generateSystemRecoveryActions(error, context),
            priority: 6,
            enabled: true
        });
        // User Experience Recovery Strategy
        this.addRecoveryStrategy({
            id: 'user_experience_recovery',
            name: 'User Experience Recovery',
            description: 'Provides user-friendly recovery options based on user experience level',
            applicableErrors: {
                severities: [ErrorSeverity.LOW, ErrorSeverity.MEDIUM]
            },
            contextRequirements: {},
            generateActions: (error, context) => this.generateUserExperienceRecoveryActions(error, context),
            priority: 5,
            enabled: true
        });
    }
    /**
     * Find applicable recovery strategies for an error and context
     */
    findApplicableStrategies(error, context) {
        return Array.from(this.strategies.values())
            .filter(strategy => {
            if (!strategy.enabled)
                return false;
            // Check error applicability
            const errorMatch = (!strategy.applicableErrors.categories ||
                strategy.applicableErrors.categories.includes(error.category)) &&
                (!strategy.applicableErrors.types ||
                    strategy.applicableErrors.types.includes(error.type)) &&
                (!strategy.applicableErrors.severities ||
                    strategy.applicableErrors.severities.includes(error.severity));
            // Check context requirements
            const contextMatch = (!strategy.contextRequirements.userRoles ||
                !context.userRole ||
                strategy.contextRequirements.userRoles.includes(context.userRole)) &&
                (!strategy.contextRequirements.environments ||
                    !context.environment ||
                    strategy.contextRequirements.environments.includes(context.environment));
            return errorMatch && contextMatch;
        })
            .sort((a, b) => b.priority - a.priority);
    }
    /**
     * Generate workflow recovery actions
     */
    generateWorkflowRecoveryActions(error, context) {
        const actions = [];
        // Retry with simplified parameters
        actions.push({
            id: 'workflow_retry_simplified',
            type: 'retry',
            priority: 8,
            description: 'Retry workflow generation with simplified parameters',
            userMessage: 'Let me try generating a simpler version of your workflow',
            estimatedDuration: 30,
            successProbability: 0.7,
            parameters: {
                retryCount: 1,
                retryDelay: 2000
            }
        });
        // Fallback to template-based generation
        actions.push({
            id: 'workflow_template_fallback',
            type: 'fallback',
            priority: 7,
            description: 'Use template-based workflow generation',
            userMessage: 'I\'ll use a proven template as the foundation for your workflow',
            estimatedDuration: 45,
            successProbability: 0.9,
            parameters: {
                fallbackWorkflow: 'basic_template'
            }
        });
        return actions;
    }
    /**
     * Generate community node recovery actions
     */
    generateCommunityNodeRecoveryActions(error, context) {
        const actions = [];
        // Retry installation with different version
        actions.push({
            id: 'node_version_fallback',
            type: 'fallback',
            priority: 8,
            description: 'Try installing a compatible version of the community node',
            userMessage: 'I\'ll try installing a different version that\'s compatible with your n8n setup',
            estimatedDuration: 60,
            successProbability: 0.8
        });
        // Suggest alternative nodes
        actions.push({
            id: 'node_alternative_suggestion',
            type: 'alternative',
            priority: 7,
            description: 'Suggest alternative community nodes with similar functionality',
            userMessage: 'I found some alternative nodes that provide similar functionality',
            estimatedDuration: 15,
            successProbability: 0.9
        });
        return actions;
    }
    /**
     * Generate network recovery actions
     */
    generateNetworkRecoveryActions(error, context) {
        const actions = [];
        const retryCount = Math.min(3, context.resourceConstraints?.maxRetries || 3);
        // Retry with exponential backoff
        actions.push({
            id: 'network_retry_backoff',
            type: 'retry',
            priority: 9,
            description: 'Retry with exponential backoff',
            userMessage: 'Network issue detected. I\'ll retry the request with increasing delays.',
            estimatedDuration: 30,
            successProbability: 0.6,
            parameters: {
                retryCount,
                retryDelay: 1000
            }
        });
        // Use cached data if available
        if (context.networkQuality === 'offline' || context.networkQuality === 'poor') {
            actions.push({
                id: 'network_offline_fallback',
                type: 'fallback',
                priority: 8,
                description: 'Use cached data for offline operation',
                userMessage: 'I\'ll use previously cached data while the network is unavailable',
                estimatedDuration: 5,
                successProbability: 0.7
            });
        }
        return actions;
    }
    /**
     * Generate system recovery actions
     */
    generateSystemRecoveryActions(error, context) {
        const actions = [];
        // Memory optimization
        if (context.availableMemory && context.availableMemory < 512) {
            actions.push({
                id: 'system_memory_optimization',
                type: 'alternative',
                priority: 8,
                description: 'Optimize memory usage and retry',
                userMessage: 'I\'ll optimize memory usage and try a lighter approach',
                estimatedDuration: 20,
                successProbability: 0.8
            });
        }
        // Reduce system load
        if (context.systemLoad && context.systemLoad > 80) {
            actions.push({
                id: 'system_load_reduction',
                type: 'alternative',
                priority: 7,
                description: 'Wait for system load to decrease',
                userMessage: 'System is under heavy load. I\'ll wait a moment and try again.',
                estimatedDuration: 60,
                successProbability: 0.9
            });
        }
        return actions;
    }
    /**
     * Generate user experience-based recovery actions
     */
    generateUserExperienceRecoveryActions(error, context) {
        const actions = [];
        // Beginner-friendly actions
        if (context.userExperience === 'beginner') {
            actions.push({
                id: 'beginner_guided_recovery',
                type: 'manual',
                priority: 9,
                description: 'Provide step-by-step guidance for beginners',
                userMessage: 'I\'ll guide you through fixing this step by step',
                estimatedDuration: 300,
                successProbability: 0.95,
                parameters: {
                    manualSteps: [
                        'First, let\'s check your n8n configuration',
                        'Next, we\'ll verify your workflow structure',
                        'Finally, we\'ll test the connection'
                    ]
                }
            });
        }
        // Expert-level technical details
        if (context.userExperience === 'expert') {
            actions.push({
                id: 'expert_technical_recovery',
                type: 'manual',
                priority: 6,
                description: 'Provide technical details for expert users',
                userMessage: 'Here are the technical details for manual resolution',
                technicalDetails: error.technicalMessage,
                estimatedDuration: 60,
                successProbability: 0.9
            });
        }
        return actions;
    }
    /**
     * Remove duplicate actions based on type and description
     */
    deduplicateActions(actions) {
        const seen = new Set();
        return actions.filter(action => {
            const key = `${action.type}_${action.description}`;
            if (seen.has(key))
                return false;
            seen.add(key);
            return true;
        });
    }
    /**
     * Filter actions based on context constraints
     */
    filterFeasibleActions(actions, context) {
        return actions.filter(action => {
            // Check retry limits
            if (action.conditions?.maxRetries &&
                context.previousFailures &&
                context.previousFailures >= action.conditions.maxRetries) {
                return false;
            }
            // Check system load requirements
            if (action.conditions?.minSystemLoad &&
                context.systemLoad &&
                context.systemLoad > action.conditions.minSystemLoad) {
                return false;
            }
            // Check network quality requirements
            if (action.conditions?.requiredNetworkQuality &&
                context.networkQuality &&
                this.getNetworkQualityScore(context.networkQuality) <
                    this.getNetworkQualityScore(action.conditions.requiredNetworkQuality)) {
                return false;
            }
            return true;
        });
    }
    /**
     * Calculate estimated duration for recovery plan
     */
    calculatePlanDuration(actions) {
        if (actions.length === 0)
            return 0;
        // Use the recommended action's duration, with 20% buffer
        const primaryDuration = actions[0].estimatedDuration || 60;
        return Math.round(primaryDuration * 1.2);
    }
    /**
     * Calculate success probability for recovery plan
     */
    calculatePlanSuccessProbability(actions, context) {
        if (actions.length === 0)
            return 0;
        // Base probability on the recommended action
        let probability = actions[0].successProbability || 0.5;
        // Adjust based on context
        if (context.previousFailures && context.previousFailures > 2) {
            probability *= 0.8; // Reduce probability for repeated failures
        }
        if (context.networkQuality === 'excellent') {
            probability *= 1.1; // Boost for good network
        }
        else if (context.networkQuality === 'poor') {
            probability *= 0.7; // Reduce for poor network
        }
        return Math.min(1, Math.max(0, probability));
    }
    /**
     * Generate user-friendly guidance message
     */
    generateUserGuidance(error, recommendedAction, context) {
        let guidance = `I encountered a ${error.severity.toLowerCase()} ${error.category.replace('_', ' ')} error. `;
        guidance += recommendedAction.userMessage;
        if (recommendedAction.estimatedDuration) {
            guidance += ` This should take about ${Math.round(recommendedAction.estimatedDuration / 60)} minute(s).`;
        }
        // Add context-specific guidance
        if (context.userExperience === 'beginner') {
            guidance += ' Don\'t worry - I\'ll handle the technical details for you.';
        }
        else if (context.userExperience === 'expert') {
            guidance += ' You can also check the technical details if you prefer to handle this manually.';
        }
        return guidance;
    }
    /**
     * Generate technical summary for developers
     */
    generateTechnicalSummary(error, actions) {
        let summary = `Error Classification: ${error.category}/${error.type} (${error.severity})\n`;
        summary += `Original Error: ${error.originalError.message}\n\n`;
        summary += `Available Recovery Actions:\n`;
        actions.forEach((action, index) => {
            summary += `${index + 1}. ${action.description} (${action.type}, priority: ${action.priority})\n`;
        });
        return summary;
    }
    /**
     * Get numeric score for network quality
     */
    getNetworkQualityScore(quality) {
        const scores = { offline: 0, poor: 1, good: 2, excellent: 3 };
        return scores[quality] || 1;
    }
    /**
     * Execute retry recovery action
     */
    async executeRetryAction(action, context) {
        // Simulate retry logic
        const retryCount = action.parameters?.retryCount || 1;
        const retryDelay = action.parameters?.retryDelay || 1000;
        for (let i = 0; i < retryCount; i++) {
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, i)));
            }
            // Simulate operation (in real implementation, this would call the actual operation)
            const success = Math.random() > 0.3; // 70% success rate simulation
            if (success)
                return 'success';
        }
        return 'failure';
    }
    /**
     * Execute fallback recovery action
     */
    async executeFallbackAction(action, context) {
        // Simulate fallback logic
        await new Promise(resolve => setTimeout(resolve, 1000));
        return Math.random() > 0.1 ? 'success' : 'failure'; // 90% success rate for fallbacks
    }
    /**
     * Execute alternative recovery action
     */
    async executeAlternativeAction(action, context) {
        // Simulate alternative approach
        await new Promise(resolve => setTimeout(resolve, 500));
        return Math.random() > 0.2 ? 'success' : 'partial'; // 80% success, 20% partial
    }
    /**
     * Execute manual recovery action
     */
    async executeManualAction(action, context) {
        // Manual actions typically require user interaction
        // In a real implementation, this would present the manual steps to the user
        return 'partial'; // Manual actions usually result in partial completion
    }
    /**
     * Execute escalation recovery action
     */
    async executeEscalationAction(action, context) {
        // Simulate escalation (notify support, create ticket, etc.)
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'success'; // Escalation itself is successful if notification is sent
    }
    /**
     * Clean up old recovery history
     */
    cleanupHistory() {
        if (this.recoveryHistory.length > this.maxHistorySize) {
            this.recoveryHistory = this.recoveryHistory.slice(-this.maxHistorySize);
        }
    }
}
export default ErrorRecoveryManager;
//# sourceMappingURL=error-recovery.js.map