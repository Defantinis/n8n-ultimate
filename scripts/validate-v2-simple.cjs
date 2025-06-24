const fs = require('fs');
const path = require('path');

console.log('🔍 Simple v2HS-MXP.json Workflow Validator');
console.log('==========================================');

try {
    const workflowPath = path.join(__dirname, '..', 'workflows', 'v2HS-MXP.json');
    
    if (!fs.existsSync(workflowPath)) {
        console.log('❌ v2HS-MXP.json not found');
        process.exit(1);
    }

    const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
    
    console.log(`✅ Workflow loaded: "${workflow.name}"`);
    console.log(`📊 Node count: ${workflow.nodes.length}`);
    
    // Find Config node
    const configNode = workflow.nodes.find(node => node.name === 'Config');
    if (configNode) {
        console.log('✅ Config node found');
        const params = configNode.parameters?.values?.string || [];
        console.log(`📊 Config parameters: ${params.length}`);
        params.forEach(param => {
            console.log(`  - ${param.name}: ${param.value}`);
        });
    } else {
        console.log('❌ Config node not found');
    }
    
    // Find Mixpanel node
    const mixpanelNode = workflow.nodes.find(node => node.name === 'Get Mixpanel Events');
    if (mixpanelNode) {
        console.log('✅ Mixpanel node found');
        const queryParams = mixpanelNode.parameters?.queryParameters?.parameters || [];
        console.log(`📊 Query parameters: ${queryParams.length}`);
        queryParams.forEach(param => {
            console.log(`  - ${param.name}: ${param.value}`);
        });
        
        // Check if project_id is present
        const hasProjectId = queryParams.some(p => p.name === 'project_id');
        console.log(`📊 Project ID parameter: ${hasProjectId ? '✅ PRESENT' : '❌ MISSING'}`);
    } else {
        console.log('❌ Mixpanel node not found');
    }
    
    console.log('\n🎯 Summary:');
    console.log(`Nodes: ${workflow.nodes.length}`);
    console.log('Status: Analysis complete');
    
} catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
} 