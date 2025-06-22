export function getWizardStepTemplate(step: number, state: { idea: string }): string {
  switch (step) {
    case 1:
      return `
        <h2>Step 1: Describe Your Idea</h2>
        <p>What automation are you looking to build? Be as descriptive as possible.</p>
        <textarea id="workflow-idea" rows="5" style="width: 100%;">${state.idea}</textarea>
        <button data-action="next">Next: Review Nodes</button>
      `;
    case 2:
      return `
        <h2>Step 2: Review AI-Suggested Nodes</h2>
        <p>Based on your idea, the AI suggests the following nodes. You can modify them before proceeding.</p>
        <!-- AI suggestion will be dynamically inserted here -->
        <div id="suggested-nodes">Loading...</div>
        <button data-action="prev">Back</button>
        <button data-action="next">Next: Validate</button>
      `;
    case 3:
      return `
        <h2>Step 3: Validation</h2>
        <p>The system is running checks on the proposed workflow...</p>
        <!-- Validation results will be dynamically inserted here -->
        <div id="validation-results">Validating...</div>
        <button data-action="prev">Back</button>
        <button data-action="finish">Generate Workflow</button>
      `;
    case 4:
        return `
            <h2>Step 4: Complete</h2>
            <p>Your workflow is being generated!</p>
        `;
    default:
      return `<p>Invalid step.</p>`;
  }
} 