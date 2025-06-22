/**
 * Troubleshooting Guide for n8n Ultimate
 * Solutions for common issues and error scenarios
 */
export interface TroubleshootingItem {
    id: string;
    problem: string;
    symptoms: string[];
    causes: string[];
    solutions: string[];
    prevention?: string[];
    difficulty: 'easy' | 'medium' | 'hard';
    category: string;
}
/**
 * Common troubleshooting scenarios
 */
export declare const TROUBLESHOOTING_GUIDE: TroubleshootingItem[];
/**
 * Quick fix suggestions based on error patterns
 */
export declare const QUICK_FIXES: {
    timeout: string[];
    unauthorized: string[];
    rate_limit: string[];
    invalid_data: string[];
};
/**
 * Troubleshooting utility class
 */
export declare class TroubleshootingHelper {
    /**
     * Search troubleshooting guide by keyword
     */
    static searchTroubleshooting(query: string): TroubleshootingItem[];
    /**
     * Get troubleshooting items by category
     */
    static getByCategory(category: string): TroubleshootingItem[];
    /**
     * Get troubleshooting items by difficulty
     */
    static getByDifficulty(difficulty: 'easy' | 'medium' | 'hard'): TroubleshootingItem[];
    /**
     * Get quick fix suggestions for error type
     */
    static getQuickFixes(errorType: string): string[];
    /**
     * Generate diagnostic report for troubleshooting
     */
    static generateDiagnosticReport(workflowId?: string): object;
}
export default TroubleshootingHelper;
//# sourceMappingURL=troubleshooting.d.ts.map