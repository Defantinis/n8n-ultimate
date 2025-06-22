/**
 * n8n Ultimate - Template Gallery Component
 *
 * This component displays a gallery of available workflow templates
 * and allows users to select one to use.
 */
export class TemplateGalleryComponent {
    element;
    constructor(element) {
        this.element = element;
        this.render();
    }
    async render() {
        this.element.innerHTML = '<h2>Template Gallery</h2><p>Under construction.</p>';
    }
    // This method can be called to clean up event listeners
    // or other resources when the component is removed.
    dispose() {
        // No-op for now
    }
}
//# sourceMappingURL=index.js.map