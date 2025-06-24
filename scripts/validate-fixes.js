// 🚀 ENHANCED n8n Workflow Validation Tool v2.0
// Updated with latest n8n community findings and best practices

import fs from 'fs';
import path from 'path';

console.log('🚀 ENHANCED n8n WORKFLOW VALIDATION v2.0');
console.log('============================================');

function validateWorkflow() {
  try {
    // Load workflow
    const workflowPath = './workflows/hubspot-mixpanel-integration.json';
    const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    console.log('✅ Workflow JSON structure is valid');
    console.log(`📊 Workflow: "${workflow.name}"`);
    console.log(`📊 Total nodes: ${workflow.nodes?.length || 0}`);
    
    // Enhanced Issue #1: Check for deprecated $node syntax (causes "Cannot read properties of undefined")
    const deprecatedNodeRefs = [];
    const codeNodes = workflow.nodes.filter(node => node.type === 'n8n-nodes-base.code');
    
    codeNodes.forEach(node => {
      if (node.parameters.code && node.parameters.code.includes('$node[')) {
        deprecatedNodeRefs.push(node.name);
      }
    });
    
    if (deprecatedNodeRefs.length > 0) {
      console.log('❌ CRITICAL: Found deprecated $node syntax in:', deprecatedNodeRefs);
      console.log('   Fix: Replace $node["NodeName"] with $("NodeName")');
    } else {
      console.log('✅ All Code node references use modern $() syntax');
    }
    
    // Enhanced Issue #2: Check parameter expressions for deprecated syntax
    const deprecatedParamRefs = [];
    workflow.nodes.forEach(node => {
      if (node.parameters) {
        const paramStr = JSON.stringify(node.parameters);
        if (paramStr.includes('$node[')) {
          deprecatedParamRefs.push(node.name);
        }
      }
    });
    
    if (deprecatedParamRefs.length > 0) {
      console.log('❌ CRITICAL: Found deprecated $node syntax in parameters:', deprecatedParamRefs);
    } else {
      console.log('✅ All parameter expressions use modern syntax');
    }
    
    // Enhanced Issue #3: Advanced connection validation
    const connections = workflow.connections || {};
    const connectedNodes = new Set();
    const connectionDetails = [];
    
    Object.keys(connections).forEach(nodeId => {
      connectedNodes.add(nodeId);
      if (connections[nodeId].main) {
        connections[nodeId].main.forEach((outputConnections, outputIndex) => {
          outputConnections.forEach(connection => {
            connectedNodes.add(connection.node);
            connectionDetails.push({
              from: nodeId,
              to: connection.node,
              output: outputIndex,
              input: connection.index
            });
          });
        });
      }
    });
    
    console.log(`✅ Found ${Object.keys(connections).length} connection groups`);
    console.log(`✅ Total connected nodes: ${connectedNodes.size}/${workflow.nodes.length}`);
    console.log(`📊 Total connections: ${connectionDetails.length}`);
    
    // Enhanced Issue #4: Check for problematic node types
    const executeWorkflowNodes = workflow.nodes.filter(node => 
      node.type === 'n8n-nodes-base.executeWorkflow'
    );
    
    const httpRequestNodes = workflow.nodes.filter(node => 
      node.type === 'n8n-nodes-base.httpRequest'
    );
    
    const webhookNodes = workflow.nodes.filter(node => 
      node.type === 'n8n-nodes-base.webhook'
    );
    
    if (executeWorkflowNodes.length > 0) {
      console.log('⚠️  WARNING: Execute Workflow nodes detected - known to cause connection issues');
      console.log('   Consider replacing with HTTP Request + Webhook pattern');
    } else {
      console.log('✅ No Execute Workflow nodes found');
    }
    
    console.log(`📊 HTTP Request nodes: ${httpRequestNodes.length}`);
    console.log(`📊 Webhook nodes: ${webhookNodes.length}`);
    
    // Enhanced Issue #5: Advanced Code node validation
    const codeReturnIssues = [];
    const codeComplexityIssues = [];
    
    codeNodes.forEach(node => {
      const code = node.parameters.code;
      if (code) {
        // Check return format
        if (!code.includes('return [') && !code.includes('return result') && !code.includes('return [{')) {
          codeReturnIssues.push(node.name);
        }
        
        // Check code complexity
        const lines = code.split('\n').length;
        if (lines > 100) {
          codeComplexityIssues.push({ name: node.name, lines });
        }
        
        // Check for async/await patterns
        if (code.includes('fetch(') && !code.includes('await')) {
          console.log(`⚠️  ${node.name}: Using fetch() without await - consider adding proper async handling`);
        }
      }
    });
    
    if (codeReturnIssues.length > 0) {
      console.log('⚠️  Potential return format issues in Code nodes:', codeReturnIssues);
    } else {
      console.log('✅ Code nodes appear to have proper return formats');
    }
    
    if (codeComplexityIssues.length > 0) {
      console.log('⚠️  Complex Code nodes (consider splitting):', codeComplexityIssues);
    }
    
    // NEW: Issue #6: Check for credential security
    const credentialNodes = workflow.nodes.filter(node => node.credentials);
    console.log(`📊 Nodes with credentials: ${credentialNodes.length}`);
    
    // NEW: Issue #7: Check for trigger nodes
    const triggerNodes = workflow.nodes.filter(node => 
      node.type.includes('trigger') || node.type.includes('Trigger')
    );
    console.log(`📊 Trigger nodes: ${triggerNodes.length}`);
    
    if (triggerNodes.length === 0) {
      console.log('⚠️  No trigger nodes found - workflow needs a trigger to execute automatically');
    }
    
    // NEW: Issue #8: Performance analysis
    const performanceWarnings = [];
    
    // Check for potential performance issues
    workflow.nodes.forEach(node => {
      if (node.type === 'n8n-nodes-base.httpRequest') {
        const timeout = node.parameters?.options?.timeout;
        if (!timeout || timeout > 30000) {
          performanceWarnings.push(`${node.name}: Consider setting HTTP timeout < 30s`);
        }
      }
    });
    
    if (performanceWarnings.length > 0) {
      console.log('⚠️  Performance recommendations:');
      performanceWarnings.forEach(warning => console.log(`   - ${warning}`));
    }
    
    // Enhanced version warnings with latest info
    console.log('\n🚨 CRITICAL VERSION WARNINGS (Updated 2025):');
    console.log('- Version 1.75.2: Known bugs with Code nodes ("Cannot read properties of undefined")');
    console.log('- Version 1.76-1.79: Partial fixes, some issues remain');
    console.log('- Version 1.80+: Recommended for stability');
    console.log('- Version 1.85+: Latest features and security updates');
    console.log('- RECOMMENDATION: Update to n8n 1.85+ for best experience');
    
    // Enhanced troubleshooting with 2025 best practices
    console.log('\n🔧 ENHANCED TROUBLESHOOTING STEPS:');
    console.log('1. Clear browser cache and try private/incognito mode');
    console.log('2. If using Docker: docker system prune && docker pull n8nio/n8n:latest');
    console.log('3. Check n8n logs: docker logs n8n-container-name');
    console.log('4. Disable browser extensions (especially ad blockers)');
    console.log('5. Try different browser (Chrome, Firefox, Safari)');
    console.log('6. Check network connectivity and proxy settings');
    console.log('7. Verify credentials are properly configured');
    console.log('8. Test with minimal workflow first');
    
    // Enhanced summary
    const totalIssues = deprecatedNodeRefs.length + deprecatedParamRefs.length + codeReturnIssues.length;
    
    console.log('\n📊 ENHANCED VALIDATION SUMMARY');
    console.log('==============================');
    console.log(`Workflow: ${workflow.name}`);
    console.log(`Total nodes: ${workflow.nodes.length}`);
    console.log(`Code nodes: ${codeNodes.length}`);
    console.log(`Connections: ${connectionDetails.length}`);
    console.log(`Coverage: ${connectedNodes.size}/${workflow.nodes.length} nodes connected`);
    
    if (totalIssues === 0) {
      console.log('🎉 No critical issues detected in workflow structure');
      console.log('   Note: Version compatibility and environment issues may still apply');
    } else {
      console.log(`❌ Found ${totalIssues} critical issues that need fixing`);
      console.log('   Priority: Update deprecated $node syntax first');
    }
    
    // NEW: Generate validation report
    const report = {
      timestamp: new Date().toISOString(),
      workflow: workflow.name,
      validation: {
        totalNodes: workflow.nodes.length,
        codeNodes: codeNodes.length,
        connections: connectionDetails.length,
        coverage: `${connectedNodes.size}/${workflow.nodes.length}`,
        issues: totalIssues,
        status: totalIssues === 0 ? 'PASS' : 'FAIL'
      }
    };
    
    fs.writeFileSync('./validation-results.json', JSON.stringify(report, null, 2));
    console.log('\n📋 Validation report saved to: validation-results.json');
    
    return totalIssues === 0;
    
  } catch (error) {
    console.error('❌ VALIDATION ERROR:', error.message);
    return false;
  }
}

// Run enhanced validation
const isValid = validateWorkflow();
console.log(`\n🏁 FINAL RESULT: ${isValid ? 'PASS ✅' : 'FAIL ❌'}`);
process.exit(isValid ? 0 : 1); 