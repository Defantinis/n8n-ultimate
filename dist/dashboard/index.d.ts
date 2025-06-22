/**
 * n8n Ultimate Dashboard - Main Entry Point
 * Phase 2: User-Friendly Production Experience
 *
 * This is the central hub for all user interactions with n8n Ultimate.
 * Provides easy access to all major features through an intuitive interface.
 */
export interface DashboardConfig {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    accessibility: {
        reducedMotion: boolean;
        highContrast: boolean;
        screenReader: boolean;
    };
    user: {
        level: 'beginner' | 'intermediate' | 'expert';
        preferences: Record<string, any>;
    };
}
export interface NavigationItem {
    id: string;
    title: string;
    description: string;
    icon: string;
    path: string;
    requiredLevel?: 'beginner' | 'intermediate' | 'expert';
    isAvailable: boolean;
    shortcut?: string;
}
/**
 * Main Navigation Structure - Designed for Progressive Disclosure
 * Shows features based on user expertise level and system availability
 */
export declare const DASHBOARD_NAVIGATION: NavigationItem[];
/**
 * Quick Actions - Contextual shortcuts for common tasks
 */
export declare const QUICK_ACTIONS: {
    id: string;
    title: string;
    description: string;
    action: string;
    shortcut: string;
}[];
/**
 * Accessibility Features Configuration
 */
export declare const ACCESSIBILITY_FEATURES: {
    keyboardNavigation: {
        enabled: boolean;
        skipLinks: boolean;
        focusIndicators: boolean;
    };
    screenReader: {
        ariaLabels: boolean;
        descriptions: boolean;
        announcements: boolean;
    };
    visualAccessibility: {
        highContrast: boolean;
        reducedMotion: boolean;
        largeText: boolean;
    };
    cognitiveAccessibility: {
        simplifiedUI: boolean;
        progressIndicators: boolean;
        clearInstructions: boolean;
    };
};
/**
 * Main Dashboard Class - Central orchestrator for user experience
 */
export declare class N8nUltimateDashboard {
    private config;
    private rootElement;
    private currentComponent;
    constructor(config: DashboardConfig, rootElement: HTMLElement);
    /**
     * Initialize accessibility features based on user preferences
     */
    private initializeAccessibility;
    /**
     * Get navigation items filtered by user level and availability
     */
    getNavigation(): NavigationItem[];
    /**
     * Check if feature is accessible to current user level
     */
    private isFeatureAccessible;
    /**
     * Navigate to a specific dashboard section.
     * This is the primary method for changing views.
     */
    navigateTo(sectionId: string): void;
    /**
     * Handle user interaction and route to appropriate feature
     */
    handleUserInput(input: string, context?: any): Promise<any>;
    private showGettingStarted;
}
export default N8nUltimateDashboard;
//# sourceMappingURL=index.d.ts.map