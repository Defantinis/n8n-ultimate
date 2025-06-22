/**
 * Step-by-Step Guides for n8n Ultimate
 * Comprehensive guides for common workflow creation scenarios
 */
export interface GuideStep {
    id: string;
    title: string;
    description: string;
    instruction: string;
    tips?: string[];
    warnings?: string[];
    code?: string;
}
export interface UserGuide {
    id: string;
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'expert';
    estimatedTime: string;
    category: string;
    steps: GuideStep[];
    outcomes: string[];
}
/**
 * GUIDE 1: Quick Start - Your First Workflow
 */
export declare const QUICK_START_GUIDE: UserGuide;
/**
 * GUIDE 2: Template Customization
 */
export declare const TEMPLATE_GUIDE: UserGuide;
/**
 * GUIDE 3: AI Collaboration Mastery
 */
export declare const AI_COLLABORATION_GUIDE: UserGuide;
/**
 * All available guides
 */
export declare const ALL_GUIDES: UserGuide[];
/**
 * Guide utility functions
 */
export declare class GuideManager {
    /**
     * Search guides by keyword or category
     */
    static searchGuides(query: string, difficulty?: string): UserGuide[];
    /**
     * Get guides by difficulty level
     */
    static getGuidesByDifficulty(difficulty: 'beginner' | 'intermediate' | 'expert'): UserGuide[];
    /**
     * Get recommended next guide based on current progress
     */
    static getNextRecommendedGuide(completedGuides: string[]): UserGuide | null;
}
//# sourceMappingURL=step-by-step-guides.d.ts.map