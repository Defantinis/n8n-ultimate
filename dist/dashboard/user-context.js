/**
 * Manages user-specific context, like skill level and preferences,
 * to enable adaptive UI components.
 */
class UserContext {
    context;
    constructor() {
        // In a real app, this would be loaded from user settings
        this.context = {
            userId: 'user_123_abc',
            skillLevel: 'beginner',
            aiConfidence: 1.0,
            preferences: {
                useGuidedMode: true,
            },
        };
    }
    get() {
        return this.context;
    }
    setSkillLevel(level) {
        this.context.skillLevel = level;
    }
    setAiConfidence(score) {
        this.context.aiConfidence = Math.max(0, Math.min(1, score));
    }
}
export const userContext = new UserContext();
//# sourceMappingURL=user-context.js.map