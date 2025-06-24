const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('🔬 Starting n8n Workflow Runtime Validator');

// --- Configuration ---
const WORKFLOW_FILE_PATH = path.join(__dirname, '..', 'workflows', 'My Workflow 2 (8).json');
const INPUT_DATA_FILE_PATH = path.join(__dirname, '..', 'sample-hubspot-contacts.json');
const TARGET_NODE_NAME = 'Process Contacts';

// --- Helper Functions ---
function readFile(filePath) {
    try {
        console.log(`📄 Reading file: ${path.basename(filePath)}`);
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.error(`❌ Error reading file ${filePath}:`, error.message);
        process.exit(1);
    }
}

function findNode(workflow, nodeName) {
    const node = workflow.nodes.find(n => n.name === nodeName);
    if (!node) {
        console.error(`❌ Node named "${nodeName}" not found in the workflow.`);
        process.exit(1);
    }
    console.log(`✅ Found target node: "${nodeName}" (ID: ${node.id})`);
    return node;
}

function validateOutput(output) {
    console.log('🔬 Validating node output...');
    if (output === null || output === undefined) {
        console.log('✅ VALIDATION PASSED: Output is null/undefined, which is valid for filtering.');
        return;
    }
    
    // In "Run Once for Each Item" mode, a single object is returned.
    // n8n expects this, and the output for the next node will be [{ json: output }]
    if (typeof output === 'object' && !Array.isArray(output) && output !== null) {
        console.log('✅ VALIDATION PASSED: Output is a single object, correct for "Run Once for Each Item" mode.');
        return;
    }

    console.error('❌ VALIDATION FAILED: Output is not a single object.');
    console.log('   In "Run Once for Each Item" mode, the code should return a single object or null.');
    console.log('   Raw output type:', typeof output);
}


// --- Main Execution ---
const workflowJson = readFile(WORKFLOW_FILE_PATH);
const inputDataJson = readFile(INPUT_DATA_FILE_PATH);

const workflow = JSON.parse(workflowJson);
const sampleInputData = JSON.parse(inputDataJson);

const targetNode = findNode(workflow, TARGET_NODE_NAME);
const nodeCode = targetNode.parameters.code;

console.log('💻 Code to be executed:');
console.log('--------------------------------------------------');
console.log(nodeCode);
console.log('--------------------------------------------------');


// --- Simulate n8n Runtime for "Run Once for Each Item" ---
console.log(`🚀 Simulating "Run Once for Each Item" with ${sampleInputData.length} input items...`);
let totalOutputItems = 0;

for (let i = 0; i < sampleInputData.length; i++) {
    const item = sampleInputData[i];
    console.log(`\n--- Executing for item ${i + 1} (vid: ${item.vid}) ---`);
    
    const context = {
        $input: {
            item: { json: item }
        },
        // Provide a simple $item for direct property access if needed
        $item: (path) => {
            if (path.startsWith('json.')) {
                const key = path.substring(5);
                return item[key];
            }
            return undefined;
        },
        console: {
            log: (...args) => console.log(`   [NODE LOG]`, ...args)
        }
    };
    
    vm.createContext(context);
    
    try {
        const result = vm.runInContext(nodeCode, context, { timeout: 1000 });
        
        console.log('✅ Code executed successfully for this item.');
        console.log('📦 Raw Output:');
        console.log(JSON.stringify(result, null, 2));
        
        validateOutput(result);
        if (result) {
            totalOutputItems++;
        }

    } catch (error) {
        console.error(`❌ An error occurred during execution for item ${i + 1}:`);
        console.error(error);
    }
}

console.log(`\n🏁 Simulation Complete. Produced ${totalOutputItems} output items.`); 