#!/usr/bin/env node

const readline = require('readline');
const { N8nUltimateDashboard } = require('./dist/src/dashboard/index.js');
const { feedbackBus } = require('./dist/src/dashboard/interactions/feedback-bus.js');

// Mock the DOM environment
require('global-jsdom/register');

// --- Mock AI Agent Listener ---
feedbackBus.subscribe('userIntent', (intent) => {
  console.log(`\n🤖 AI Agent received intent: ${intent.type}`);
  console.log('   Payload:', intent.payload);
  console.log('   (In a real scenario, this would trigger AI processing and update the UI)\n');
});


function setupDashboard() {
  document.body.innerHTML = '<div id="dashboard-root"></div>';
  const rootElement = document.getElementById('dashboard-root');
  if (rootElement) {
    return new N8nUltimateDashboard(rootElement, { enableRouting: true });
  }
  throw new Error('Dashboard root element not found');
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const DEMO_STEPS = [
  // Guided Mode for Brenda
  {
    persona: 'Brenda (Business Automator)',
    description: "Start with Guided Mode. Navigate to '#/guided-generation'.",
    action: () => {
      window.location.hash = '#/guided-generation';
      console.log(document.body.innerHTML);
    }
  },
  {
    description: "Brenda describes her workflow idea.",
    action: () => {
      const textarea = document.getElementById('workflow-idea');
      const nextButton = document.querySelector('[data-action="next"]');
      if (textarea && nextButton) {
        textarea.value = 'When a new HubSpot contact is created, send a welcome email via Mailchimp';
        nextButton.click();
        console.log(document.body.innerHTML);
      }
    }
  },
   {
    description: "Brenda reviews the AI-suggested nodes and proceeds.",
    action: () => {
      // Simulate AI providing nodes
      const nodesDiv = document.getElementById('suggested-nodes');
      if(nodesDiv) nodesDiv.innerHTML = '<p>Nodes: HubSpot Trigger, Mailchimp Send Email</p>';
      
      const nextButton = document.querySelector('[data-action="next"]');
      if(nextButton) nextButton.click();
      console.log(document.body.innerHTML);
    }
  },
   {
    description: "Brenda sees the validated workflow and activates it.",
    action: () => {
      const activateButton = document.querySelector('[data-action="activate"]');
      if (activateButton) activateButton.click();
      console.log(document.body.innerHTML);
    }
  },
  // Expert Mode for Paul
  {
    persona: 'Paul (Rapid Prototyper)',
    description: "Switch to Expert Mode. Paul opens the Command Palette (Ctrl+K).",
    action: () => {
      // In a real browser, a keydown event would do this. We'll call the method directly.
      dashboard.commandPalette.toggle();
      console.log(document.body.innerHTML);
    }
  },
  {
    description: "Paul types 'template' to filter commands and selects 'View Templates'.",
    action: () => {
       dashboard.commandPalette.filterCommands('template');
       dashboard.commandPalette.selectCommand(0); // Assume 'View Templates' is the first match
       console.log(document.body.innerHTML);
    }
  },
];

let currentStep = 0;
const dashboard = setupDashboard();

function runStep() {
  if (currentStep >= DEMO_STEPS.length) {
    console.log('\n✅ Demo complete! Thank you for watching.');
    rl.close();
    process.exit();
  }

  const step = DEMO_STEPS[currentStep];
  
  console.log('---');
  if (step.persona) console.log(`\n👤 Persona: ${step.persona}`);
  console.log(`\n➡️  Step ${currentStep + 1}: ${step.description}`);
  
  step.action();
  
  currentStep++;
  
  rl.question('\nPress Enter to continue to the next step...', () => {
    runStep();
  });
}

console.log('🚀 Welcome to the n8n Ultimate Interactive Feature Demo!');
console.log('This script will walk you through key features from the perspective of our user personas.');

runStep(); 