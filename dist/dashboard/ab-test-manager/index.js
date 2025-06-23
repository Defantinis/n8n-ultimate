import { ABTestWorkflowGenerator } from '../../customization/ab-test-generator';
import { TemplateService } from '../../customization/template-service';
export class ABTestManagerComponent {
    element;
    generator;
    templateService;
    constructor(container) {
        this.element = document.createElement('div');
        this.element.id = 'ab-test-manager';
        container.appendChild(this.element);
        this.generator = new ABTestWorkflowGenerator();
        this.templateService = new TemplateService();
        this.render();
    }
    async render() {
        const templates = await this.templateService.listTemplates();
        this.element.innerHTML = `
      <h2>A/B Testing</h2>
      <div class="setup-form">
        <h3>Create New A/B Test</h3>
        <input type="text" id="test-name" placeholder="A/B Test Name">
        
        <label for="workflow-a">Workflow A:</label>
        <select id="workflow-a">
          ${templates.map(t => `<option value="${t.name}">${t.name} (v${t.latestVersion})</option>`).join('')}
        </select>
        
        <label for="workflow-b">Workflow B:</label>
        <select id="workflow-b">
          ${templates.map(t => `<option value="${t.name}">${t.name} (v${t.latestVersion})</option>`).join('')}
        </select>

        <label for="split-percentage">Traffic to A (%):</label>
        <input type="number" id="split-percentage" value="50" min="0" max="100">

        <button data-action="generate-ab-test">Generate Test Workflow</button>
      </div>
      <div class="test-results">
        <h3>Test Results</h3>
        <!-- Results would be displayed here -->
      </div>
    `;
    }
    dispose() {
        this.element.remove();
    }
}
//# sourceMappingURL=index.js.map