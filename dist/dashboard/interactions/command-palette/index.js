/**
 * Command Palette for Expert Mode
 * Provides keyboard-driven access to all major actions.
 */
import { QUICK_ACTIONS, DASHBOARD_NAVIGATION } from '../../index';
import { feedbackBus } from '../feedback-bus';
export class CommandPalette {
    element;
    input;
    list;
    commands = [];
    filteredCommands = [];
    constructor(container) {
        this.element = document.createElement('div');
        this.element.id = 'command-palette';
        this.element.className = 'hidden';
        this.element.innerHTML = `
      <input type="text" placeholder="Type a command or search..." />
      <ul></ul>
    `;
        container.appendChild(this.element);
        this.input = this.element.querySelector('input');
        this.list = this.element.querySelector('ul');
        this.loadCommands();
        this.attachEventListeners();
    }
    loadCommands() {
        const navCommands = DASHBOARD_NAVIGATION.map(item => ({
            id: item.id,
            title: `Navigate: ${item.title}`,
            description: item.description,
            action: () => {
                const intent = { type: 'NAVIGATE', payload: { sectionId: item.id } };
                feedbackBus.publish('userIntent', intent);
                this.hide();
            }
        }));
        const actionCommands = QUICK_ACTIONS.map(item => ({
            id: item.id,
            title: `Action: ${item.title}`,
            description: item.description,
            action: () => {
                const intent = { type: 'QUICK_ACTION', payload: { actionId: item.action } };
                feedbackBus.publish('userIntent', intent);
                this.hide();
            }
        }));
        // In a real app, this would also fetch Task Master commands
        this.commands = [...navCommands, ...actionCommands];
        this.filteredCommands = this.commands;
    }
    attachEventListeners() {
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
        });
        this.input.addEventListener('input', () => this.filter());
        this.list.addEventListener('click', (e) => {
            const target = e.target;
            const commandItem = target.closest('li');
            if (commandItem && commandItem.dataset.commandId) {
                const command = this.filteredCommands.find(c => c.id === commandItem.dataset.commandId);
                command?.action();
            }
        });
    }
    toggle() {
        this.element.classList.toggle('hidden');
        if (!this.element.classList.contains('hidden')) {
            this.input.focus();
            this.renderList();
        }
    }
    hide() {
        this.element.classList.add('hidden');
    }
    filter() {
        const query = this.input.value.toLowerCase();
        this.filteredCommands = this.commands.filter(c => c.title.toLowerCase().includes(query) ||
            c.description.toLowerCase().includes(query));
        this.renderList();
    }
    renderList() {
        this.list.innerHTML = this.filteredCommands
            .map(c => `<li data-command-id="${c.id}">
                <strong>${c.title}</strong>
                <small>${c.description}</small>
              </li>`)
            .join('');
    }
    dispose() {
        this.element.remove();
        // remove keydown listener
    }
}
//# sourceMappingURL=index.js.map