/**
 * n8n Ultimate - Workflow Generator Component
 *
 * This component provides the user interface for generating n8n workflows
 * from natural language descriptions.
 */
export class WorkflowGeneratorComponent {
    element;
    constructor(element) {
        this.element = element;
        this.render();
    }
    render() {
        this.element.innerHTML = `
      <div class="workflow-generator">
        <h2>Create a new Workflow</h2>
        <p>Under construction.</p>
      </div>
    `;
    }
    // This method can be called to clean up event listeners
    // or other resources when the component is removed.
    dispose() {
        // No-op for now
    }
}
//# sourceMappingURL=index.js.map