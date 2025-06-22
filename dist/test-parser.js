#!/usr/bin/env node
/**
 * Test script to demonstrate the n8n workflow parsing tools
 * This will analyze the n8nscraper.json workflow in our workflows directory
 */
import { parseWorkflow } from './index.js';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function main() {
    try {
        console.log('🔍 n8n Workflow Parser Test');
        console.log('==========================\n');
        // Path to our test workflow
        const workflowPath = path.join(__dirname, '..', 'workflows', 'n8nscraper.json');
        console.log(`📁 Analyzing workflow: ${workflowPath}\n`);
        // Parse the workflow
        console.log('🔄 Parsing workflow...');
        const parsedWorkflow = await parseWorkflow(workflowPath);
        // Display basic summary
        console.log('📊 Basic Analysis:');
        console.log('==================');
        console.log(`Workflow Name: ${parsedWorkflow.workflow.name}`);
        console.log(`Node Count: ${parsedWorkflow.metadata.nodeCount}`);
        console.log(`Connection Count: ${parsedWorkflow.metadata.connectionCount}`);
        console.log(`Node Types: ${parsedWorkflow.metadata.nodeTypes.join(', ')}`);
        console.log(`Max Depth: ${parsedWorkflow.metadata.maxDepth}`);
        console.log(`Has Loops: ${parsedWorkflow.metadata.hasLoops ? 'Yes' : 'No'}`);
        console.log(`Estimated Complexity: ${parsedWorkflow.metadata.estimatedComplexity}/10`);
        console.log('\n✅ Analysis complete!');
    }
    catch (error) {
        console.error('❌ Error analyzing workflow:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}
//# sourceMappingURL=test-parser.js.map