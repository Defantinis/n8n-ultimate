/**
 * n8n Ultimate - Template Gallery Component
 * 
 * This component displays a gallery of available workflow templates
 * and allows users to select one to use.
 */

import { WorkflowGenerator } from '../../generators/workflow-generator.js';

export class TemplateGalleryComponent {
  private element: HTMLElement;
  private generator: WorkflowGenerator;

  constructor(element: HTMLElement) {
    this.element = element;
    this.generator = new WorkflowGenerator();
    this.render();
  }

  private async render(): Promise<void> {
    this.element.innerHTML = '<h2>Template Gallery</h2>';
    
    try {
      const templates = await this.generator.listTemplates();
      const templateList = document.createElement('ul');
      
      templates.forEach(templateName => {
        const listItem = document.createElement('li');
        listItem.textContent = templateName;
        listItem.addEventListener('click', () => this.handleTemplateSelect(templateName));
        templateList.appendChild(listItem);
      });

      this.element.appendChild(templateList);
    } catch (error) {
      this.element.innerHTML += `<p class="error">Failed to load templates: ${error.message}</p>`;
    }
  }

  private handleTemplateSelect(templateName: string): void {
    // Placeholder for template selection logic
    // This would typically trigger a new view where the user can
    // configure and use the selected template.
    console.log(`Selected template: ${templateName}`);
    alert(`You selected the "${templateName}" template.`);
  }
} 