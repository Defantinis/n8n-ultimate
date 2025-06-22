#!/usr/bin/env node

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(`
🎮 **n8n ULTIMATE - WORKFLOW BUILDER DEMO**
==========================================

Let's build your HubSpot → Mixpanel integration workflow!

🎯 **YOUR WORKFLOW REQUEST:**
1. Fetch Contacts from HubSpot
2. Match Customer IDs with Mixpanel
3. Call Mixpanel API via Service Account
4. Process events per user (Page Views)

🧠 **AI PROCESSING...**
`);

function simulateWorkflowGeneration() {
  console.log(`
⚡ **WORKFLOW SKELETON GENERATED:**

┌─ 🔄 TRIGGER: Schedule/Webhook
│  └─ Run every hour or on-demand
│
├─ 📊 HUBSPOT: Fetch Contacts
│  └─ GET /crm/v3/objects/contacts
│  └─ Filter: Updated since last run
│  └─ Fields: customer_id, email, name, properties
│
├─ 🔄 TRANSFORM: Prepare Data
│  └─ Extract customer_id from HubSpot
│  └─ Create Mixpanel user mapping
│  └─ Validate required fields
│
├─ 📈 MIXPANEL: Service Account Auth
│  └─ Authenticate with Service Account
│  └─ Set project context
│  └─ Prepare API headers
│
├─ 🔍 MIXPANEL: Query User Events
│  └─ GET /api/2.0/engage (for each customer)
│  └─ Filter: Page View events
│  └─ Date range: Last 30 days
│
├─ 📋 PROCESS: Aggregate Data
│  └─ Count page views per customer
│  └─ Calculate engagement metrics
│  └─ Format for HubSpot update
│
└─ 💾 HUBSPOT: Update Contacts
   └─ PATCH /crm/v3/objects/contacts/{id}
   └─ Update custom properties
   └─ Log results & errors

🔐 **CREDENTIALS NEEDED:**
• HubSpot Private App Token
• Mixpanel Service Account Username & Secret
• Mixpanel Project ID

🎯 **SMART FEATURES ADDED:**
• Error handling & retry logic
• Rate limiting compliance
• Data validation & transformation
• Logging for debugging
• Batch processing for performance

Want me to generate the detailed n8n JSON workflow? (y/n): `);

  rl.question('', (answer) => {
    if (answer.toLowerCase().includes('y')) {
      console.log('\n🚀 Generating detailed workflow...\n');
      rl.close();
    } else {
      console.log('\n👍 No problem! You can run this anytime.\n');
      rl.close();
    }
  });
}

// Start the workflow generation
setTimeout(simulateWorkflowGeneration, 2000); 