#!/usr/bin/env node

/**
 * 🧪 n8n Ultimate Workflow Execution Tester
 * Tests the HubSpot-Mixpanel integration workflow for proper node linking and execution
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 n8n Ultimate Workflow Execution Tester');
console.log('==========================================');

// Load the workflow
const workflowPath = path.join(__dirname, '../workflows/hubspot-mixpanel-integration.json');

if (!fs.existsSync(workflowPath)) {
    console.error('❌ Workflow file not found:', workflowPath);
    process.exit(1);
}

const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

console.log('✅ Workflow loaded:', workflow.name);
console.log('📊 Nodes:', workflow.nodes.length);
console.log('🔗 Connection groups:', Object.keys(workflow.connections).length);

// Analyze node structure
console.log('\n📋 Node Analysis:');
console.log('================');

const nodeMap = new Map();
workflow.nodes.forEach(node => {
    nodeMap.set(node.id, node);
    console.log(`• ${node.name} (${node.type}) - ID: ${node.id}`);
});

// Analyze connections
console.log('\n🔗 Connection Analysis:');
console.log('======================');

const connectionIssues = [];
let totalConnections = 0;

Object.entries(workflow.connections).forEach(([sourceId, connections]) => {
    const sourceNode = nodeMap.get(sourceId);
    if (!sourceNode) {
        connectionIssues.push(`❌ Source node not found: ${sourceId}`);
        return;
    }
    
    console.log(`\n📤 From: ${sourceNode.name} (${sourceId})`);
    
    connections.main?.forEach((connectionGroup, groupIndex) => {
        connectionGroup.forEach((connection, connIndex) => {
            totalConnections++;
            const targetNode = nodeMap.get(connection.node);
            
            if (!targetNode) {
                connectionIssues.push(`❌ Target node not found: ${connection.node} (from ${sourceNode.name})`);
                console.log(`  ❌ → MISSING NODE: ${connection.node}`);
            } else {
                console.log(`  ✅ → ${targetNode.name} (${connection.node})`);
            }
        });
    });
});

// Connection summary
console.log('\n📊 Connection Summary:');
console.log('=====================');
console.log(`Total connections: ${totalConnections}`);
console.log(`Connection issues: ${connectionIssues.length}`);

if (connectionIssues.length > 0) {
    console.log('\n❌ Connection Issues Found:');
    connectionIssues.forEach(issue => console.log(`  ${issue}`));
} else {
    console.log('✅ All connections are valid!');
}

// Test workflow execution flow
console.log('\n🚀 Execution Flow Analysis:');
console.log('===========================');

// Find trigger nodes
const triggerNodes = workflow.nodes.filter(node => 
    node.type.includes('trigger') || node.type.includes('manualTrigger')
);

console.log(`Found ${triggerNodes.length} trigger node(s):`);
triggerNodes.forEach(trigger => {
    console.log(`• ${trigger.name} (${trigger.type})`);
    
    // Trace execution path
    const executionPath = [];
    const visited = new Set();
    
    function traceExecution(nodeId, depth = 0) {
        if (visited.has(nodeId) || depth > 20) return; // Prevent infinite loops
        
        visited.add(nodeId);
        const node = nodeMap.get(nodeId);
        if (!node) return;
        
        executionPath.push(`${'  '.repeat(depth)}${depth + 1}. ${node.name}`);
        
        // Follow connections
        const nodeConnections = workflow.connections[nodeId];
        if (nodeConnections?.main) {
            nodeConnections.main.forEach(connectionGroup => {
                connectionGroup.forEach(connection => {
                    traceExecution(connection.node, depth + 1);
                });
            });
        }
    }
    
    traceExecution(trigger.id);
    
    console.log('\n📋 Execution Path:');
    executionPath.forEach(step => console.log(step));
});

// Test AI service integration
console.log('\n🤖 AI Service Integration Test:');
console.log('===============================');

async function testAIService() {
    try {
        const response = await fetch('http://localhost:3000/health');
        if (response.ok) {
            console.log('✅ AI service is running on localhost:3000');
            
            // Test error analysis endpoint
            const testError = await fetch('http://localhost:3000/summarize-error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    error: 'Test workflow execution error',
                    workflow: 'hubspot-mixpanel-integration',
                    timestamp: new Date().toISOString()
                })
            });
            
            if (testError.ok) {
                const result = await testError.json();
                console.log('✅ AI error analysis endpoint working');
                console.log('📊 Sample AI response:', JSON.stringify(result, null, 2));
            } else {
                console.log('⚠️ AI error analysis endpoint not responding properly');
            }
        } else {
            console.log('❌ AI service not responding');
        }
    } catch (error) {
        console.log('❌ AI service not available:', error.message);
        console.log('💡 Start the service with: npm start');
    }
}

// Run AI service test
testAIService().then(() => {
    console.log('\n🎯 Test Summary:');
    console.log('===============');
    console.log(`Nodes: ${workflow.nodes.length}`);
    console.log(`Connections: ${totalConnections}`);
    console.log(`Issues: ${connectionIssues.length}`);
    console.log(`Status: ${connectionIssues.length === 0 ? '✅ Ready for execution' : '❌ Needs fixes'}`);
    
    if (connectionIssues.length === 0) {
        console.log('\n🚀 Workflow is properly linked and ready for n8n execution!');
        console.log('📋 To test in n8n:');
        console.log('   1. Import the workflow JSON into n8n');
        console.log('   2. Configure HubSpot and Mixpanel credentials');
        console.log('   3. Click "Execute workflow" on the manual trigger');
        console.log('   4. Monitor the AI service logs for integration points');
    }
}); 