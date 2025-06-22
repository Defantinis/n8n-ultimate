import { TemplateService } from '../../customization/template-service';
import { VersionHistoryComponent } from './version-history';

export class TemplateManagerComponent {
  private element: HTMLElement;
  private templateService: TemplateService;
  private versionHistoryComponent: VersionHistoryComponent | null = null;

  constructor(container: HTMLElement) {
    this.element = document.createElement('div');
    this.element.id = 'template-manager';
    container.appendChild(this.element);
    
    this.templateService = new TemplateService();
    this.render();
    this.attachEventListeners();
  }

  private async render(): Promise<void> {
    const templates = await this.templateService.listTemplates();
    
    this.element.innerHTML = `
      <h2>Workflow Templates</h2>
      <div class="template-list">
        ${templates.map(t => this.getTemplateCardHTML(t)).join('') || '<p>No custom templates yet. Save a workflow to create one!</p>'}
      </div>
      <div class="actions">
        <!-- Button to trigger saving the current workflow would go here -->
      </div>
    `;
  }

  private attachEventListeners(): void {
    this.element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const action = target.dataset.action;
      const templateName = target.dataset.templateName;

      if (action === 'view-versions' && templateName) {
        this.showVersionHistory(templateName);
      }
    });
  }

  private showVersionHistory(templateName: string): void {
    if (this.versionHistoryComponent) {
      this.versionHistoryComponent.dispose();
    }
    this.versionHistoryComponent = new VersionHistoryComponent(this.element, templateName);
  }

  private getTemplateCardHTML(template: { name: string; latestVersion: number; description?: string }): string {
    return `
      <div class="template-card">
        <h3>${template.name}</h3>
        <p>${template.description || 'No description'}</p>
        <div class="meta">
          <span>Latest Version: ${template.latestVersion}</span>
          <button data-action="use-template" data-template-name="${template.name}">Use</button>
          <button data-action="view-versions" data-template-name="${template.name}">History</button>
        </div>
      </div>
    `;
  }

  dispose(): void {
    this.versionHistoryComponent?.dispose();
    this.element.remove();
  }
} 