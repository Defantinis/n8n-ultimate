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

console.log('🚀 ENHANCED n8n WORKFLOW EXECUTION TESTER v2.0');
console.log('===============================================');

// Enhanced AI service testing with retry logic
async function testAIServiceWithRetry(maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 Testing AI service (attempt ${attempt}/${maxRetries})...`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('http://localhost:3000/health', {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Accept': 'application/json' }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const healthData = await response.json();
        console.log('✅ AI service is running and healthy');
        console.log(`📊 Service info:`, healthData);
        
        // Test additional endpoints
        await testAIEndpoints();
        return true;
      } else {
        console.log(`⚠️  AI service responded with status: ${response.status}`);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log(`⚠️  AI service timeout (attempt ${attempt})`);
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`⚠️  AI service not running (attempt ${attempt})`);
      } else {
        console.log(`⚠️  AI service error: ${error.message} (attempt ${attempt})`);
      }
      
      if (attempt < maxRetries) {
        console.log('   Retrying in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }
  
  console.log('❌ AI service not available after all attempts');
  console.log('💡 Start the service with: npm start');
  return false;
}

// Enhanced AI endpoint testing
async function testAIEndpoints() {
  const endpoints = [
    { path: '/summarize-error', method: 'POST', data: { error: 'Test error', workflow: 'test' } },
    { path: '/analyze-engagement', method: 'POST', data: { contacts: [], pageViews: {} } },
    { path: '/report-error', method: 'POST', data: { error: 'Test', timestamp: new Date() } },
    { path: '/log-execution', method: 'POST', data: { execution: 'test' } }
  ];
  
  console.log('🔍 Testing AI service endpoints...');
  
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint.path}`, {
        method: endpoint.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(endpoint.data)
      });
      
      if (response.ok) {
        console.log(`   ✅ ${endpoint.path} - Working`);
      } else {
        console.log(`   ⚠️  ${endpoint.path} - Status ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint.path} - Error: ${error.message}`);
    }
  }
}

// Enhanced workflow analysis with performance metrics
async function analyzeWorkflow() {
  try {
    const startTime = Date.now();
    
    // Load and validate workflow
    const workflowPath = path.join(__dirname, '../workflows/hubspot-mixpanel-integration.json');
    if (!fs.existsSync(workflowPath)) {
      throw new Error(`Workflow file not found: ${workflowPath}`);
    }
    
    const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    console.log(`✅ Workflow loaded: "${workflow.name}"`);
    console.log(`📊 Nodes: ${workflow.nodes.length}`);
    console.log(`📊 Version: ${workflow.versionId || 'Unknown'}`);
    console.log(`📊 Active: ${workflow.active ? 'Yes' : 'No'}`);
    
    // Enhanced node analysis with categorization
    const nodeMap = new Map();
    const nodeTypes = new Map();
    const nodeCategories = {
      triggers: [],
      actions: [],
      logic: [],
      code: [],
      http: [],
      credentials: []
    };
    
    workflow.nodes.forEach(node => {
      nodeMap.set(node.id, node);
      
      // Count node types
      const count = nodeTypes.get(node.type) || 0;
      nodeTypes.set(node.type, count + 1);
      
      // Categorize nodes
      if (node.type.includes('trigger') || node.type.includes('Trigger')) {
        nodeCategories.triggers.push(node);
      } else if (node.type === 'n8n-nodes-base.code') {
        nodeCategories.code.push(node);
      } else if (node.type === 'n8n-nodes-base.httpRequest') {
        nodeCategories.http.push(node);
      } else if (node.type === 'n8n-nodes-base.if' || node.type === 'n8n-nodes-base.switch') {
        nodeCategories.logic.push(node);
      } else if (node.credentials) {
        nodeCategories.credentials.push(node);
      } else {
        nodeCategories.actions.push(node);
      }
      
      console.log(`• ${node.name} (${node.type}) - ID: ${node.id}`);
    });
    
    // Enhanced connection analysis with validation
    console.log('\n🔗 ENHANCED CONNECTION ANALYSIS:');
    console.log('===============================');
    
    const connections = workflow.connections || {};
    const connectionIssues = [];
    const connectionDetails = [];
    const orphanedNodes = [];
    
    // Find all connected nodes
    const connectedNodeIds = new Set();
    
    Object.entries(connections).forEach(([sourceId, connectionGroup]) => {
      const sourceNode = nodeMap.get(sourceId);
      if (!sourceNode) {
        connectionIssues.push(`❌ Source node not found: ${sourceId}`);
        return;
      }
      
      connectedNodeIds.add(sourceId);
      console.log(`📤 From: ${sourceNode.name} (${sourceId})`);
      
      if (connectionGroup.main) {
        connectionGroup.main.forEach((outputConnections, outputIndex) => {
          outputConnections.forEach(connection => {
            const targetNode = nodeMap.get(connection.node);
            if (!targetNode) {
              connectionIssues.push(`❌ Target node not found: ${connection.node}`);
            } else {
              connectedNodeIds.add(connection.node);
              connectionDetails.push({
                from: sourceNode.name,
                to: targetNode.name,
                fromId: sourceId,
                toId: connection.node,
                output: outputIndex,
                input: connection.index
              });
              console.log(`  ✅ → ${targetNode.name} (${connection.node})`);
            }
          });
        });
      }
    });
    
    // Find orphaned nodes
    workflow.nodes.forEach(node => {
      if (!connectedNodeIds.has(node.id) && !node.type.includes('trigger')) {
        orphanedNodes.push(node);
      }
    });
    
    // Enhanced execution flow analysis
    console.log('\n🚀 ENHANCED EXECUTION FLOW ANALYSIS:');
    console.log('===================================');
    
    const triggerNodes = workflow.nodes.filter(node => 
      node.type.includes('trigger') || node.type.includes('Trigger')
    );
    
    console.log(`Found ${triggerNodes.length} trigger node(s):`);
    triggerNodes.forEach(trigger => {
      console.log(`• ${trigger.name} (${trigger.type})`);
    });
    
    // Trace execution paths from each trigger
    const executionPaths = [];
    const visited = new Set();
    
    function traceExecution(nodeId, path = [], depth = 0) {
      if (visited.has(nodeId) || depth > 20) {
        if (depth > 20) console.log('⚠️  Maximum depth reached - possible circular reference');
        return;
      }
      
      visited.add(nodeId);
      const node = nodeMap.get(nodeId);
      if (!node) return;
      
      const currentPath = [...path, { name: node.name, id: nodeId, depth }];
      
      const nodeConnections = connections[nodeId];
      if (nodeConnections?.main) {
        let hasConnections = false;
        nodeConnections.main.forEach(connectionGroup => {
          connectionGroup.forEach(connection => {
            hasConnections = true;
            traceExecution(connection.node, currentPath, depth + 1);
          });
        });
        
        if (!hasConnections) {
          executionPaths.push(currentPath);
        }
      } else {
        executionPaths.push(currentPath);
      }
    }
    
    triggerNodes.forEach(trigger => {
      visited.clear();
      traceExecution(trigger.id);
    });
    
    console.log('\n📋 Execution Paths:');
    executionPaths.forEach((path, index) => {
      console.log(`Path ${index + 1}:`);
      path.forEach(step => {
        console.log(`${'  '.repeat(step.depth)}${step.depth + 1}. ${step.name}`);
      });
    });
    
    // Enhanced performance analysis
    console.log('\n⚡ PERFORMANCE ANALYSIS:');
    console.log('=======================');
    
    const performanceMetrics = {
      totalNodes: workflow.nodes.length,
      codeNodes: nodeCategories.code.length,
      httpNodes: nodeCategories.http.length,
      connections: connectionDetails.length,
      maxDepth: Math.max(...executionPaths.flat().map(step => step.depth), 0),
      complexity: 'Low'
    };
    
    // Calculate complexity
    if (performanceMetrics.totalNodes > 20 || performanceMetrics.maxDepth > 10) {
      performanceMetrics.complexity = 'High';
    } else if (performanceMetrics.totalNodes > 10 || performanceMetrics.maxDepth > 5) {
      performanceMetrics.complexity = 'Medium';
    }
    
    console.log(`📊 Total nodes: ${performanceMetrics.totalNodes}`);
    console.log(`📊 Code nodes: ${performanceMetrics.codeNodes}`);
    console.log(`📊 HTTP nodes: ${performanceMetrics.httpNodes}`);
    console.log(`📊 Max execution depth: ${performanceMetrics.maxDepth}`);
    console.log(`📊 Workflow complexity: ${performanceMetrics.complexity}`);
    
    // Performance recommendations
    const recommendations = [];
    if (performanceMetrics.codeNodes > 5) {
      recommendations.push('Consider consolidating Code nodes for better performance');
    }
    if (performanceMetrics.httpNodes > 10) {
      recommendations.push('High number of HTTP requests - consider batching');
    }
    if (performanceMetrics.maxDepth > 15) {
      recommendations.push('Deep execution chain - consider parallel processing');
    }
    
    if (recommendations.length > 0) {
      console.log('\n💡 Performance Recommendations:');
      recommendations.forEach(rec => console.log(`   • ${rec}`));
    }
    
    // Enhanced summary with detailed metrics
    console.log('\n📊 ENHANCED CONNECTION SUMMARY:');
    console.log('==============================');
    console.log(`Total connections: ${connectionDetails.length}`);
    console.log(`Connection issues: ${connectionIssues.length}`);
    console.log(`Orphaned nodes: ${orphanedNodes.length}`);
    console.log(`Coverage: ${connectedNodeIds.size}/${workflow.nodes.length} nodes connected`);
    
    if (orphanedNodes.length > 0) {
      console.log('\n⚠️  Orphaned nodes (not connected):');
      orphanedNodes.forEach(node => console.log(`   • ${node.name}`));
    }
    
    if (connectionIssues.length === 0) {
      console.log('✅ All connections are valid!');
    } else {
      console.log('❌ Connection issues found:');
      connectionIssues.forEach(issue => console.log(`   ${issue}`));
    }
    
    // Test AI service integration
    console.log('\n🤖 AI SERVICE INTEGRATION TEST:');
    console.log('===============================');
    const aiServiceWorking = await testAIServiceWithRetry();
    
    // Generate comprehensive test report
    const analysisTime = Date.now() - startTime;
    const testReport = {
      timestamp: new Date().toISOString(),
      analysisTime: `${analysisTime}ms`,
      workflow: {
        name: workflow.name,
        nodes: performanceMetrics.totalNodes,
        connections: connectionDetails.length,
        complexity: performanceMetrics.complexity
      },
      validation: {
        connectionIssues: connectionIssues.length,
        orphanedNodes: orphanedNodes.length,
        coverage: `${connectedNodeIds.size}/${workflow.nodes.length}`,
        status: connectionIssues.length === 0 ? 'PASS' : 'FAIL'
      },
      aiService: {
        available: aiServiceWorking,
        tested: true
      },
      performance: performanceMetrics,
      recommendations: recommendations
    };
    
    // Save detailed report
    fs.writeFileSync('./workflow-test-report.json', JSON.stringify(testReport, null, 2));
    console.log('\n📋 Detailed test report saved to: workflow-test-report.json');
    
    // Final status
    console.log('\n🎯 ENHANCED TEST SUMMARY:');
    console.log('=========================');
    console.log(`Workflow: ${workflow.name}`);
    console.log(`Analysis time: ${analysisTime}ms`);
    console.log(`Nodes: ${performanceMetrics.totalNodes}`);
    console.log(`Connections: ${connectionDetails.length}`);
    console.log(`Issues: ${connectionIssues.length}`);
    console.log(`AI Service: ${aiServiceWorking ? 'Available' : 'Unavailable'}`);
    console.log(`Status: ${connectionIssues.length === 0 ? '✅ Ready for execution' : '❌ Needs fixes'}`);
    
    if (connectionIssues.length === 0 && aiServiceWorking) {
      console.log('🚀 STATUS: Workflow is fully validated and ready for execution!');
      return true;
    } else if (connectionIssues.length === 0) {
      console.log('⚠️  STATUS: Workflow structure is valid, but AI service is offline');
      return true;
    } else {
      console.log('❌ STATUS: Workflow has issues that need to be resolved');
      return false;
    }
    
  } catch (error) {
    console.error('❌ ANALYSIS ERROR:', error.message);
    console.error('Stack trace:', error.stack);
    return false;
  }
}

// Run enhanced analysis
console.log('🔍 Starting enhanced workflow analysis...\n');
const success = await analyzeWorkflow();
console.log(`\n🏁 FINAL RESULT: ${success ? 'SUCCESS ✅' : 'FAILED ❌'}`);
process.exit(success ? 0 : 1); 