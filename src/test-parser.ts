#!/usr/bin/env node

/**
 * Test script to demonstrate the n8n workflow parsing tools
 * This will analyze the n8nscraper.json workflow in our workflows directory
 */

import { parseWorkflow } from './index.js';
import { NodeAnalyzer } from './utils/node-analyzer.js';
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
    console.log(`Validation Status: ${parsedWorkflow.validation.isValid ? '✅ Valid' : '❌ Invalid'}`);
    
    if (!parsedWorkflow.validation.isValid) {
      console.log(`\n⚠️  Validation Issues:`);
      parsedWorkflow.validation.errors.forEach(error => {
        console.log(`   • ${error.message}`);
      });
    }

    if (parsedWorkflow.validation.warnings.length > 0) {
      console.log(`\n⚠️  Warnings:`);
      parsedWorkflow.validation.warnings.forEach(warning => {
        console.log(`   • ${warning.message}`);
      });
    }

    // Analyze individual nodes
    console.log('\n🔍 Node Analysis:');
    console.log('=================');
    const nodeAnalyzer = new NodeAnalyzer();
    
    parsedWorkflow.workflow.nodes.forEach(node => {
      const analysis = nodeAnalyzer.analyzeNode(node);
      console.log(`\n📦 ${node.name} (${node.type})`);
      console.log(`   Category: ${analysis.category}`);
      console.log(`   Complexity: ${analysis.complexity}/10`);
      console.log(`   Description: ${analysis.description}`);
      console.log(`   Parameters: ${analysis.parameterCount}`);
      console.log(`   Custom Code: ${analysis.hasCustomCode ? 'Yes' : 'No'}`);
      console.log(`   Async: ${analysis.isAsync ? 'Yes' : 'No'}`);
      console.log(`   Can Fail: ${analysis.canFail ? 'Yes' : 'No'}`);
    });

    // Analyze relationships
    console.log('\n🔗 Relationship Analysis:');
    console.log('=========================');
    const relationships = nodeAnalyzer.analyzeNodeRelationships(parsedWorkflow.workflow);
    
    console.log(`Total Connections: ${relationships.totalConnections}`);
    console.log(`Average Influence: ${relationships.averageInfluence.toFixed(2)}`);
    
    if (relationships.criticalNodes.length > 0) {
      console.log('\n🎯 Critical Nodes (High Influence):');
      relationships.criticalNodes.forEach(node => {
        console.log(`   • ${node.nodeName}: ${node.influence} connections`);
      });
    }

    // Check for bottlenecks
    console.log('\n🚨 Bottleneck Analysis:');
    console.log('=======================');
    const bottlenecks = nodeAnalyzer.findBottlenecks(parsedWorkflow.workflow);
    
    if (bottlenecks.length === 0) {
      console.log('✅ No significant bottlenecks detected');
    } else {
      bottlenecks.forEach(bottleneck => {
        const severityIcon = bottleneck.severity === 'high' ? '🔴' : 
                           bottleneck.severity === 'medium' ? '🟡' : '🟢';
        console.log(`\n${severityIcon} ${bottleneck.nodeName} (${bottleneck.type})`);
        console.log(`   Description: ${bottleneck.description}`);
        console.log(`   Suggestion: ${bottleneck.suggestion}`);
      });
    }

    // Display connection details
    console.log('\n🔀 Connection Details:');
    console.log('======================');
    relationships.relationships.forEach(rel => {
      console.log(`${rel.source} → ${rel.target} (${rel.type}, strength: ${rel.strength})`);
    });

    console.log('\n✅ Analysis complete!');
    console.log('\n💡 This parsing toolkit can now be used to:');
    console.log('   • Validate n8n workflow structure');
    console.log('   • Analyze workflow complexity');
    console.log('   • Identify potential issues and bottlenecks');
    console.log('   • Extract metadata for AI-powered generation');
    console.log('   • Build workflow modification tools');

  } catch (error) {
    console.error('❌ Error analyzing workflow:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
} 