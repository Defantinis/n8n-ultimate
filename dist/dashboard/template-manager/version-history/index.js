import { TemplateService } from '../../../customization/template-service';
export class VersionHistoryComponent {
    element;
    templateService;
    templateName;
    constructor(container, templateName) {
        this.element = document.createElement('div');
        this.element.id = 'version-history-modal';
        container.appendChild(this.element);
        this.templateService = new TemplateService();
        this.templateName = templateName;
        this.render();
    }
    async render() {
        const latestVersion = await this.templateService.getLatestVersion(this.templateName);
        const versions = [];
        for (let i = latestVersion; i >= 1; i--) {
            versions.push(await this.templateService.getTemplate(this.templateName, i));
        }
        this.element.innerHTML = `
      <div class="modal-content">
        <span class="close-button">&times;</span>
        <h2>Version History for ${this.templateName}</h2>
        <ul class="version-list">
          ${versions.map(v => this.getVersionItemHTML(v)).join('')}
        </ul>
      </div>
    `;
        this.attachEventListeners();
    }
    getVersionItemHTML(template) {
        if (!template)
            return '';
        return `
        <li>
          <div class="version-info">
            <strong>Version ${template.version}</strong>
            <span class="date">Updated: ${new Date(template.updatedAt).toLocaleString()}</span>
          </div>
          <button data-action="restore" data-version="${template.version}">Restore</button>
        </li>
      `;
    }
    attachEventListeners() {
        const closeButton = this.element.querySelector('.close-button');
        closeButton?.addEventListener('click', () => this.dispose());
    }
    dispose() {
        this.element.remove();
    }
}
//# sourceMappingURL=index.js.map