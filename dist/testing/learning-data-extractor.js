/**
 * Learning Data Extractor
 *
 * Simple utility to extract and analyze learning data collected from
 * n8n workflow testing sessions stored in browser localStorage.
 */
export class LearningDataExtractor {
    /**
     * Extract learning data from localStorage (run this in browser console)
     */
    static extractFromBrowser() {
        return `
// Run this in your browser console after workflow execution:
const learningData = localStorage.getItem('n8n_learning_data');
if (learningData) {
  console.log('📊 LEARNING DATA EXTRACTED:');
  console.log(learningData);
  console.log('\\n📋 Copy the JSON above and share with AI assistant for analysis');
} else {
  console.log('❌ No learning data found in localStorage');
}
`;
    }
    /**
     * Analyze extracted learning data
     */
    static analyzeLearningData(learningDataJson) {
        try {
            const sessions = JSON.parse(learningDataJson);
            const summary = {
                totalSessions: sessions.length,
                successRate: sessions.filter(s => s.performance.finalDataCount > 0).length / sessions.length,
                averageExecutionTime: sessions.reduce((sum, s) => sum + s.performance.totalExecutionTime, 0) / sessions.length,
                averageDataExtracted: sessions.reduce((sum, s) => sum + s.performance.finalDataCount, 0) / sessions.length,
                timeRange: {
                    first: sessions[0]?.timestamp,
                    last: sessions[sessions.length - 1]?.timestamp
                }
            };
            const patterns = {
                executionPatterns: this.countPatterns(sessions.map(s => s.patterns.execution_pattern)),
                dataExtractionPatterns: this.countPatterns(sessions.map(s => s.patterns.data_extraction_pattern)),
                commonIssues: this.extractCommonIssues(sessions),
                improvementTrends: this.analyzeImprovementTrends(sessions)
            };
            const recommendations = this.generateRecommendations(summary, patterns);
            return { summary, patterns, recommendations };
        }
        catch (error) {
            throw new Error(`Failed to analyze learning data: ${error.message}`);
        }
    }
    static countPatterns(values) {
        return values.reduce((acc, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
    }
    static extractCommonIssues(sessions) {
        const issues = sessions.flatMap(s => s.improvements.map(i => ({
            id: i.id,
            title: i.title,
            priority: i.priority
        })));
        const issueCount = issues.reduce((acc, issue) => {
            acc[issue.title] = (acc[issue.title] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(issueCount)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([title, count]) => ({ title, count }));
    }
    static analyzeImprovementTrends(sessions) {
        const recentSessions = sessions.slice(-5);
        const olderSessions = sessions.slice(0, Math.max(1, sessions.length - 5));
        const recentSuccess = recentSessions.filter(s => s.performance.finalDataCount > 0).length / recentSessions.length;
        const olderSuccess = olderSessions.filter(s => s.performance.finalDataCount > 0).length / olderSessions.length;
        return {
            successRateImprovement: recentSuccess - olderSuccess,
            performanceImprovement: recentSessions.length > 0 && olderSessions.length > 0 ?
                (olderSessions.reduce((sum, s) => sum + s.performance.totalExecutionTime, 0) / olderSessions.length) -
                    (recentSessions.reduce((sum, s) => sum + s.performance.totalExecutionTime, 0) / recentSessions.length) : 0
        };
    }
    static generateRecommendations(summary, patterns) {
        const recommendations = [];
        if (summary.successRate < 0.8) {
            recommendations.push(`🔧 Improve success rate: Currently ${(summary.successRate * 100).toFixed(1)}%, target 80%+`);
        }
        if (summary.averageExecutionTime > 10000) {
            recommendations.push(`⚡ Optimize performance: Average ${summary.averageExecutionTime.toFixed(0)}ms, target <10s`);
        }
        if (summary.averageDataExtracted < 5) {
            recommendations.push(`📊 Enhance data extraction: Average ${summary.averageDataExtracted.toFixed(1)} items, target 5+`);
        }
        const topIssue = patterns.commonIssues[0];
        if (topIssue && topIssue.count > 2) {
            recommendations.push(`🎯 Address recurring issue: "${topIssue.title}" occurred ${topIssue.count} times`);
        }
        if (patterns.improvementTrends.successRateImprovement < 0) {
            recommendations.push(`📈 Success rate declining: Focus on reliability improvements`);
        }
        return recommendations;
    }
}
/**
 * Browser Console Helper
 *
 * Paste this into browser console after workflow execution:
 */
export const BROWSER_CONSOLE_HELPER = `
// === LEARNING DATA EXTRACTION ===
console.log('🔍 Extracting learning data...');
const learningData = localStorage.getItem('n8n_learning_data');
if (learningData) {
  const sessions = JSON.parse(learningData);
  console.log('📊 LEARNING DATA SUMMARY:');
  console.log('Total Sessions:', sessions.length);
  console.log('Latest Session:', sessions[sessions.length - 1]);
  console.log('\\n📋 FULL LEARNING DATA (copy this):');
  console.log(learningData);
  console.log('\\n✅ Copy the JSON above and share with AI assistant');
} else {
  console.log('❌ No learning data found');
}
`;
/**
 * Usage Instructions
 */
export const USAGE_INSTRUCTIONS = `
🎯 HOW TO USE THE LEARNING FRAMEWORK:

1. 🚀 Execute the enhanced workflow in n8n
2. 📋 Open browser console (F12 → Console tab)  
3. 📊 Paste this code to extract learning data:

${BROWSER_CONSOLE_HELPER}

4. 📝 Copy the JSON output
5. 🤖 Share with AI assistant for systematic analysis
6. 🔧 Apply recommended improvements
7. 🔄 Run workflow again to measure improvement

📈 WHAT GETS COLLECTED:
- ✅ Performance metrics (execution time, success rate)
- ✅ Data extraction efficiency 
- ✅ Automation patterns (node connectivity, parameters)
- ✅ Failure modes and recovery patterns
- ✅ Improvement suggestions with priority
- ✅ Trend analysis across sessions

🎉 RESULT: Systematic, data-driven workflow improvement!
`;
//# sourceMappingURL=learning-data-extractor.js.map