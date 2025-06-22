/**
 * Learning Data Extractor
 *
 * Simple utility to extract and analyze learning data collected from
 * n8n workflow testing sessions stored in browser localStorage.
 */
export interface LearningSession {
    sessionId: string;
    timestamp: string;
    workflowName: string;
    workflowVersion: string;
    performance: {
        totalExecutionTime: number;
        finalDataCount: number;
        successRate: number;
        dataExtractionEfficiency: string;
    };
    insights: Array<{
        type: string;
        category: string;
        description: string;
        confidence: number;
        impact: string;
    }>;
    patterns: {
        execution_pattern: string;
        data_extraction_pattern: string;
        node_connectivity: string;
        parameter_automation: string;
    };
    improvements: Array<{
        id: string;
        title: string;
        description: string;
        priority: string;
        autoApplicable: boolean;
    }>;
}
export declare class LearningDataExtractor {
    /**
     * Extract learning data from localStorage (run this in browser console)
     */
    static extractFromBrowser(): string;
    /**
     * Analyze extracted learning data
     */
    static analyzeLearningData(learningDataJson: string): {
        summary: any;
        patterns: any;
        recommendations: string[];
    };
    private static countPatterns;
    private static extractCommonIssues;
    private static analyzeImprovementTrends;
    private static generateRecommendations;
}
/**
 * Browser Console Helper
 *
 * Paste this into browser console after workflow execution:
 */
export declare const BROWSER_CONSOLE_HELPER = "\n// === LEARNING DATA EXTRACTION ===\nconsole.log('\uD83D\uDD0D Extracting learning data...');\nconst learningData = localStorage.getItem('n8n_learning_data');\nif (learningData) {\n  const sessions = JSON.parse(learningData);\n  console.log('\uD83D\uDCCA LEARNING DATA SUMMARY:');\n  console.log('Total Sessions:', sessions.length);\n  console.log('Latest Session:', sessions[sessions.length - 1]);\n  console.log('\\n\uD83D\uDCCB FULL LEARNING DATA (copy this):');\n  console.log(learningData);\n  console.log('\\n\u2705 Copy the JSON above and share with AI assistant');\n} else {\n  console.log('\u274C No learning data found');\n}\n";
/**
 * Usage Instructions
 */
export declare const USAGE_INSTRUCTIONS = "\n\uD83C\uDFAF HOW TO USE THE LEARNING FRAMEWORK:\n\n1. \uD83D\uDE80 Execute the enhanced workflow in n8n\n2. \uD83D\uDCCB Open browser console (F12 \u2192 Console tab)  \n3. \uD83D\uDCCA Paste this code to extract learning data:\n\n\n// === LEARNING DATA EXTRACTION ===\nconsole.log('\uD83D\uDD0D Extracting learning data...');\nconst learningData = localStorage.getItem('n8n_learning_data');\nif (learningData) {\n  const sessions = JSON.parse(learningData);\n  console.log('\uD83D\uDCCA LEARNING DATA SUMMARY:');\n  console.log('Total Sessions:', sessions.length);\n  console.log('Latest Session:', sessions[sessions.length - 1]);\n  console.log('\\n\uD83D\uDCCB FULL LEARNING DATA (copy this):');\n  console.log(learningData);\n  console.log('\\n\u2705 Copy the JSON above and share with AI assistant');\n} else {\n  console.log('\u274C No learning data found');\n}\n\n\n4. \uD83D\uDCDD Copy the JSON output\n5. \uD83E\uDD16 Share with AI assistant for systematic analysis\n6. \uD83D\uDD27 Apply recommended improvements\n7. \uD83D\uDD04 Run workflow again to measure improvement\n\n\uD83D\uDCC8 WHAT GETS COLLECTED:\n- \u2705 Performance metrics (execution time, success rate)\n- \u2705 Data extraction efficiency \n- \u2705 Automation patterns (node connectivity, parameters)\n- \u2705 Failure modes and recovery patterns\n- \u2705 Improvement suggestions with priority\n- \u2705 Trend analysis across sessions\n\n\uD83C\uDF89 RESULT: Systematic, data-driven workflow improvement!\n";
//# sourceMappingURL=learning-data-extractor.d.ts.map