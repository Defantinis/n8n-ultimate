#!/usr/bin/env node
import { SkeletonAnalyzer } from './skeleton-analyzer.js';
import { writeFileSync } from 'fs';
/**
 * Skeleton Workshop - Interactive tool for working with skeleton workflows
 */
class SkeletonWorkshop {
    analyzer;
    constructor() {
        this.analyzer = new SkeletonAnalyzer();
    }
    async run() {
        console.log('🛠️  N8N SKELETON WORKFLOW WORKSHOP');
        console.log('=====================================\n');
        try {
            // Analyze all skeleton workflows
            console.log('📊 ANALYZING SKELETON WORKFLOWS...\n');
            const skeletonDir = './workflows/skeletons';
            const analyses = await this.analyzer.analyzeSkeletonDirectory(skeletonDir);
            if (analyses.length === 0) {
                console.log('❌ No skeleton workflows found in ./workflows/skeletons/');
                return;
            }
            // Display individual analyses
            for (const analysis of analyses) {
                await this.displaySkeletonAnalysis(analysis);
            }
            // Generate comprehensive report
            console.log('📋 GENERATING COMPREHENSIVE REPORT...\n');
            const report = this.analyzer.generateSkeletonReport(analyses);
            // Save report to file
            const reportPath = './docs/SKELETON_ANALYSIS_REPORT.md';
            writeFileSync(reportPath, report);
            console.log(`✅ Report saved to: ${reportPath}\n`);
            // Display the report
            console.log('📄 SKELETON ANALYSIS REPORT:');
            console.log('============================');
            console.log(report);
            // Offer enhancement suggestions
            await this.offerEnhancements(analyses);
        }
        catch (error) {
            console.error('❌ Error in skeleton workshop:', error);
        }
    }
    async displaySkeletonAnalysis(analysis) {
        console.log(`🔍 ANALYZING: ${analysis.fileName}`);
        console.log('─'.repeat(50));
        console.log(`📝 Basic Info:`);
        console.log(`   • Name: ${analysis.parsed.workflow.name}`);
        console.log(`   • Nodes: ${analysis.parsed.metadata.nodeCount}`);
        console.log(`   • Connections: ${analysis.parsed.metadata.connectionCount}`);
        console.log(`   • Complexity: ${analysis.capabilities.complexity}`);
        console.log(`   • Purpose: ${analysis.capabilities.mainPurpose}`);
        console.log(`   • Valid: ${analysis.parsed.validation.isValid ? '✅' : '❌'}`);
        console.log(`\n🎯 Capabilities:`);
        const caps = analysis.capabilities;
        console.log(`   • Can Trigger: ${caps.canTrigger ? '✅' : '❌'}`);
        console.log(`   • Can Fetch Data: ${caps.canFetchData ? '✅' : '❌'}`);
        console.log(`   • Can Process Data: ${caps.canProcessData ? '✅' : '❌'}`);
        console.log(`   • Can Extract Data: ${caps.canExtractData ? '✅' : '❌'}`);
        console.log(`   • Can Store Data: ${caps.canStoreData ? '✅' : '❌'}`);
        console.log(`   • Can Notify: ${caps.canNotify ? '✅' : '❌'}`);
        console.log(`   • Can Handle Errors: ${caps.canHandleErrors ? '✅' : '❌'}`);
        if (analysis.patterns.length > 0) {
            console.log(`\n🔄 Detected Patterns:`);
            analysis.patterns.forEach((pattern) => {
                console.log(`   • ${pattern.name} (${Math.round(pattern.confidence * 100)}% confidence)`);
                console.log(`     ${pattern.description}`);
            });
        }
        if (analysis.enhancementSuggestions.length > 0) {
            console.log(`\n💡 Enhancement Suggestions:`);
            analysis.enhancementSuggestions.forEach((suggestion) => {
                const priority = suggestion.priority === 'high' ? '🔴' :
                    suggestion.priority === 'medium' ? '🟡' : '🟢';
                console.log(`   ${priority} ${suggestion.description}`);
                console.log(`     Implementation: ${suggestion.implementation}`);
            });
        }
        // Show node flow
        console.log(`\n🔗 Node Flow:`);
        analysis.parsed.workflow.nodes.forEach((node, i) => {
            const nodeType = node.type.split('.').pop();
            console.log(`   ${i + 1}. ${node.name} (${nodeType})`);
        });
        console.log('\n' + '='.repeat(70) + '\n');
    }
    async offerEnhancements(analyses) {
        console.log('🚀 ENHANCEMENT OPPORTUNITIES');
        console.log('============================\n');
        for (const analysis of analyses) {
            if (analysis.enhancementSuggestions.length > 0) {
                console.log(`📁 ${analysis.fileName}:`);
                const highPriority = analysis.enhancementSuggestions.filter((s) => s.priority === 'high');
                const mediumPriority = analysis.enhancementSuggestions.filter((s) => s.priority === 'medium');
                if (highPriority.length > 0) {
                    console.log('   🔴 HIGH PRIORITY:');
                    highPriority.forEach((suggestion) => {
                        console.log(`      • ${suggestion.description}`);
                    });
                }
                if (mediumPriority.length > 0) {
                    console.log('   🟡 MEDIUM PRIORITY:');
                    mediumPriority.forEach((suggestion) => {
                        console.log(`      • ${suggestion.description}`);
                    });
                }
                // Generate an enhanced version
                console.log(`\n   🛠️  To create an enhanced version, run:`);
                console.log(`   node dist/skeleton-enhancer.js "${analysis.fileName}"`);
                console.log('');
            }
        }
        // Create skeleton enhancer script
        await this.createSkeletonEnhancer();
    }
    async createSkeletonEnhancer() {
        const enhancerScript = `#!/usr/bin/env node

import { SkeletonAnalyzer } from './skeleton-analyzer.js';
import { join } from 'path';

const fileName = process.argv[2];
if (!fileName) {
  console.log('Usage: node skeleton-enhancer.js <skeleton-file-name>');
  process.exit(1);
}

const analyzer = new SkeletonAnalyzer();
const skeletonPath = join('./workflows/skeletons', fileName);
const outputPath = join('./workflows/enhanced', fileName.replace('.json', '-enhanced.json'));

try {
  console.log(\`🔧 Analyzing \${fileName}...\`);
  const analysis = await analyzer.analyzeSkeleton(skeletonPath);
  
  console.log(\`💡 Found \${analysis.enhancementSuggestions.length} enhancement suggestions\`);
  
  if (analysis.enhancementSuggestions.length > 0) {
    console.log('🚀 Creating enhanced version...');
    await analyzer.enhanceSkeleton(skeletonPath, analysis.enhancementSuggestions, outputPath);
    console.log(\`✅ Enhanced workflow saved to: \${outputPath}\`);
  } else {
    console.log('✨ This skeleton is already well-structured!');
  }
} catch (error) {
  console.error('❌ Error enhancing skeleton:', error.message);
}
`;
        writeFileSync('./src/skeleton-enhancer.ts', enhancerScript);
        console.log('📝 Created skeleton-enhancer.ts for individual enhancements\n');
    }
}
// Run the workshop if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const workshop = new SkeletonWorkshop();
    workshop.run().catch(console.error);
}
export { SkeletonWorkshop };
//# sourceMappingURL=skeleton-workshop.js.map