/**
 * n8n Ultimate User Guide System
 * Phase 2: Step-by-Step Guides for Common Use Cases
 *
 * Provides comprehensive, interactive guidance for all user types
 */
export interface GuideStep {
    id: string;
    title: string;
    description: string;
    instruction: string;
    code?: string;
    image?: string;
    video?: string;
    tips?: string[];
    warnings?: string[];
    nextSteps?: string[];
    prerequisites?: string[];
}
export interface UserGuide {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'expert';
    estimatedTime: string;
    category: string;
    tags: string[];
    steps: GuideStep[];
    outcomes: string[];
    troubleshooting?: Record<string, string>;
}
/**
 * Step-by-Step Guides for Common Use Cases
 */
export declare const USER_GUIDES: UserGuide[];
/**
 * Interactive Guide Runner
 */
export declare class UserGuideRunner {
    private currentGuide;
    private currentStep;
    private completedSteps;
    /**
     * Start a specific guide
     */
    startGuide(guideId: string): UserGuide | null;
    /**
     * Get current step information
     */
    getCurrentStep(): GuideStep | null;
    /**
     * Mark current step as completed and move to next
     */
    completeCurrentStep(): boolean;
    /**
     * Get progress information
     */
    getProgress(): {
        completed: number;
        total: number;
        percentage: number;
    };
    /**
     * Search guides by keyword or category
     */
    static searchGuides(query: string, difficulty?: string): UserGuide[];
    /**
     * Get guides by category
     */
    static getGuidesByCategory(category: string): UserGuide[];
    /**
     * Get recommended guides for user level
     */
    static getRecommendedGuides(userLevel: 'beginner' | 'intermediate' | 'expert'): UserGuide[];
}
export default UserGuideRunner;
//# sourceMappingURL=index.d.ts.map