#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🧪 n8n Workflow Code Node Fix Validator');
console.log('=========================================');

try {
  // Load the workflow file
  const workflowPath = path.join(__dirname, '..', 'workflows', 'My Workflow 2 (8).json');
  const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));
  
  console.log('✅ Workflow loaded successfully');
  console.log(`📊 Name: ${workflow.name}`);
  console.log(`📊 Nodes: ${workflow.nodes.length}`);
  
  // Find the code nodes that need validation
  const processContactsNode = workflow.nodes.find(node => node.name === 'Process Contacts');
  const prepareUpdatesNode = workflow.nodes.find(node => node.name === 'Prepare HubSpot Updates');
  
  let allGood = true;
  
  // Validate Process Contacts node
  if (processContactsNode) {
    console.log('\n📋 Process Contacts Node Analysis:');
    const code = processContactsNode.parameters.code;
    
    // Check for correct return format
    if (code.includes('return contacts.map(contact =>')) {
      console.log('  ✅ Uses correct return format (array mapping)');
    } else if (code.includes('return [{') && code.includes('json: {')) {
      console.log('  ❌ ERROR: Still uses incorrect json wrapper format');
      allGood = false;
    } else {
      console.log('  ⚠️  WARNING: Return format unclear');
      allGood = false;
    }
    
    // Check if it includes data for next node
    if (code.includes('customer_ids: customerIds')) {
      console.log('  ✅ Includes customer_ids for downstream nodes');
    } else {
      console.log('  ⚠️  WARNING: May not include necessary data for next node');
    }
  } else {
    console.log('\n❌ ERROR: Process Contacts node not found');
    allGood = false;
  }
  
  // Validate Prepare HubSpot Updates node
  if (prepareUpdatesNode) {
    console.log('\n📋 Prepare HubSpot Updates Node Analysis:');
    const code = prepareUpdatesNode.parameters.code;
    
    // Check for correct return format
    if (code.includes('return updatesForHubspot;')) {
      console.log('  ✅ Uses correct return format (direct array)');
    } else if (code.includes('json: update')) {
      console.log('  ❌ ERROR: Still uses incorrect json wrapper format');
      allGood = false;
    } else {
      console.log('  ⚠️  WARNING: Return format unclear');
    }
    
    // Check data access from previous node
    if (code.includes('Process Contacts') && code.includes('.all()')) {
      console.log('  ✅ Correctly accesses Process Contacts data using .all()');
    } else if (code.includes('Process Contacts') && code.includes('.json.contacts')) {
      console.log('  ❌ ERROR: Uses old data access pattern that won\'t work');
      allGood = false;
    }
  } else {
    console.log('\n❌ ERROR: Prepare HubSpot Updates node not found');
    allGood = false;
  }
  
  // Final summary
  console.log('\n🎯 VALIDATION SUMMARY:');
  console.log('=====================');
  
  if (allGood) {
    console.log('✅ ALL FIXES APPLIED CORRECTLY');
    console.log('📤 Workflow is ready to import into n8n');
    console.log('🚀 Code nodes should now execute without "return items properly" errors');
  } else {
    console.log('❌ ISSUES DETECTED');
    console.log('⚠️  Please review the errors above and apply additional fixes');
  }
  
} catch (error) {
  console.log('❌ VALIDATION FAILED:', error.message);
  process.exit(1);
} 