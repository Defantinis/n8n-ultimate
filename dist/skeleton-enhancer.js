#!/usr/bin/env node
import { SkeletonAnalyzer } from './skeleton-analyzer.js';
import { join, basename } from 'path';
import { writeFileSync } from 'fs';
const fileName = process.argv[2];
if (!fileName) {
    console.log('Usage: node skeleton-enhancer.js <skeleton-file-name>');
    process.exit(1);
}
const analyzer = new SkeletonAnalyzer();
const skeletonPath = join('./workflows/skeletons', fileName);
try {
    console.log(`🔧 Analyzing ${fileName}...`);
    const analysis = await analyzer.analyzeSkeleton(skeletonPath);
    console.log(`💡 Found ${analysis.enhancementSuggestions.length} enhancement suggestions`);
    if (analysis.enhancementSuggestions.length > 0) {
        console.log('🚀 Creating enhanced version...');
        const generated = await analyzer.enhanceSkeleton(skeletonPath, analysis.enhancementSuggestions);
        const outputPath = join('./workflows/enhanced', `${basename(skeletonPath, '.json')}-enhanced.json`);
        writeFileSync(outputPath, JSON.stringify(generated.workflow, null, 2));
        console.log(`✅ Enhanced workflow saved to: ${outputPath}`);
    }
    else {
        console.log('✨ This skeleton is already well-structured!');
    }
}
catch (error) {
    if (error instanceof Error) {
        console.error('❌ Error enhancing skeleton:', error.message);
    }
    else {
        console.error('❌ An unknown error occurred while enhancing the skeleton.');
    }
}
//# sourceMappingURL=skeleton-enhancer.js.map