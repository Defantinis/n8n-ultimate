import { WorkflowParser } from './parsers/workflow-parser.js';
import * as path from 'path';
/**
 * Script to analyze an existing n8n workflow skeleton.
 */
async function analyzeSkeleton() {
    const skeletonPath = process.argv[2];
    if (!skeletonPath) {
        console.error('❌ Please provide the path to the workflow skeleton JSON file.');
        process.exit(1);
    }
    console.log(`🚀 Analyzing workflow skeleton: "${skeletonPath}"`);
    try {
        const parser = new WorkflowParser();
        const filePath = path.resolve(process.cwd(), skeletonPath);
        const parsedWorkflow = await parser.parseFromFile(filePath);
        const { workflow, metadata, validation } = parsedWorkflow;
        console.log(`\n✅ Skeleton "${workflow.name}" analyzed successfully!`);
        console.log('---');
        console.log('📊 Analysis Results:');
        console.log(`   - Nodes: ${metadata.nodeCount}`);
        console.log(`   - Connections: ${metadata.connectionCount}`);
        console.log(`   - Complexity Score: ${metadata.estimatedComplexity}/10`);
        console.log(`   - Validation: ${validation.isValid ? '✅ Valid' : '❌ Has Issues'}`);
        if (!validation.isValid) {
            console.log('   - Errors:', validation.errors.map((e) => e.message).join(', '));
            console.log('   - Warnings:', validation.warnings.map((w) => w.message).join(', '));
        }
        console.log('\n🔍 Node Summary:');
        for (const node of workflow.nodes) {
            console.log(`   - ${node.name} (${node.type})`);
        }
        console.log('\n📝 Inferred Purpose:');
        console.log('   This workflow appears to be designed to scrape workflow templates from the n8n.io website.');
        console.log('   1. It starts manually.');
        console.log('   2. Fetches the main workflow list page.');
        console.log('   3. Extracts the URL for each individual workflow.');
        console.log('   4. Then, for each URL, it fetches the individual workflow page.');
        console.log('\n🤔 Next Steps?');
        console.log('   The workflow stops after fetching the individual pages. A logical next step would be to extract the actual template JSON from each page and save it to a file.');
    }
    catch (error) {
        console.error('\n❌ An error occurred during skeleton analysis:');
        console.error(error);
    }
}
analyzeSkeleton();
//# sourceMappingURL=analyze-skeleton.js.map