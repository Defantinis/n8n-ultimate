/**
 * Manages user-specific context, like skill level and preferences,
 * to enable adaptive UI components.
 */
export type UserSkillLevel = 'beginner' | 'intermediate' | 'expert';
export interface UserContextData {
    userId: string;
    skillLevel: UserSkillLevel;
    aiConfidence: number;
    preferences: {
        useGuidedMode: boolean;
    };
}
declare class UserContext {
    private context;
    constructor();
    get(): UserContextData;
    setSkillLevel(level: UserSkillLevel): void;
    setAiConfidence(score: number): void;
}
export declare const userContext: UserContext;
export {};
//# sourceMappingURL=user-context.d.ts.map