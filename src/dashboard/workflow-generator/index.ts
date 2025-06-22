/**
 * n8n Ultimate - Workflow Generator Component
 * 
 * This component provides the user interface for generating n8n workflows
 * from natural language descriptions.
 */

import { WorkflowGenerator } from '../../generators/workflow-generator.js';

export class WorkflowGeneratorComponent {
  private element: HTMLElement;
  private generator: WorkflowGenerator;

  constructor(element: HTMLElement) {
    this.element = element;
    this.generator = new WorkflowGenerator();
    this.render();
  }

  private render(): void {
    this.element.innerHTML = `
      <div class="workflow-generator">
        <h2>Create a new Workflow</h2>
        <p>Describe the workflow you want to create in plain English.</p>
        <textarea id="workflow-description" rows="5" placeholder="e.g., 'Every day at 9am, check my new emails and send a Slack message with the subject'"></textarea>
        <button id="generate-workflow-btn">Generate Workflow</button>
        <div id="workflow-preview"></div>
      </div>
    `;

    this.attachEventListeners();
  }

  private attachEventListeners(): void {
    const generateBtn = this.element.querySelector('#generate-workflow-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.handleGenerateWorkflow());
    }
  }

  private async handleGenerateWorkflow(): Promise<void> {
    const descriptionInput = this.element.querySelector('#workflow-description') as HTMLTextAreaElement;
    const description = descriptionInput.value;
    const previewContainer = this.element.querySelector('#workflow-preview');

    if (!description || !previewContainer) {
      return;
    }

    previewContainer.innerHTML = '<p>Generating workflow...</p>';

    try {
      const requirements = {
        description: description,
        type: 'automation' as const
      };
      const result = await this.generator.generateWorkflow(requirements);
      previewContainer.innerHTML = `
        <h3>Generated Workflow</h3>
        <pre><code>${JSON.stringify(result.workflow, null, 2)}</code></pre>
      `;
    } catch (error) {
      previewContainer.innerHTML = `<p class="error">Failed to generate workflow: ${error.message}</p>`;
    }
  }
} 