/**
 * Command Palette for Expert Mode
 * Provides keyboard-driven access to all major actions.
 */
import { QUICK_ACTIONS, DASHBOARD_NAVIGATION } from '../../index';
import { feedbackBus, UserIntent } from '../feedback-bus';

interface Command {
  id: string;
  title: string;
  description: string;
  action: () => void;
}

export class CommandPalette {
  private element: HTMLElement;
  private input: HTMLInputElement;
  private list: HTMLUListElement;
  private commands: Command[] = [];
  private filteredCommands: Command[] = [];

  constructor(container: HTMLElement) {
    this.element = document.createElement('div');
    this.element.id = 'command-palette';
    this.element.className = 'hidden';
    this.element.innerHTML = `
      <input type="text" placeholder="Type a command or search..." />
      <ul></ul>
    `;
    container.appendChild(this.element);

    this.input = this.element.querySelector('input')!;
    this.list = this.element.querySelector('ul')!;

    this.loadCommands();
    this.attachEventListeners();
  }

  private loadCommands(): void {
    const navCommands = DASHBOARD_NAVIGATION.map(item => ({
      id: item.id,
      title: `Navigate: ${item.title}`,
      description: item.description,
      action: () => {
        const intent: UserIntent = { type: 'NAVIGATE', payload: { sectionId: item.id } };
        feedbackBus.publish('userIntent', intent);
        this.hide();
      }
    }));

    const actionCommands = QUICK_ACTIONS.map(item => ({
      id: item.id,
      title: `Action: ${item.title}`,
      description: item.description,
      action: () => {
        const intent: UserIntent = { type: 'QUICK_ACTION', payload: { actionId: item.action } };
        feedbackBus.publish('userIntent', intent);
        this.hide();
      }
    }));
    
    // In a real app, this would also fetch Task Master commands
    this.commands = [...navCommands, ...actionCommands];
    this.filteredCommands = this.commands;
  }

  private attachEventListeners(): void {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggle();
      }
    });

    this.input.addEventListener('input', () => this.filter());
    this.list.addEventListener('click', (e) => {
        const target = e.target as HTMLElement;
        const commandItem = target.closest('li');
        if (commandItem && commandItem.dataset.commandId) {
            const command = this.filteredCommands.find(c => c.id === commandItem.dataset.commandId);
            command?.action();
        }
    });
  }

  toggle(): void {
    this.element.classList.toggle('hidden');
    if (!this.element.classList.contains('hidden')) {
      this.input.focus();
      this.renderList();
    }
  }
  
  hide(): void {
    this.element.classList.add('hidden');
  }

  private filter(): void {
    const query = this.input.value.toLowerCase();
    this.filteredCommands = this.commands.filter(
      c =>
        c.title.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
    );
    this.renderList();
  }

  private renderList(): void {
    this.list.innerHTML = this.filteredCommands
      .map(
        c => `<li data-command-id="${c.id}">
                <strong>${c.title}</strong>
                <small>${c.description}</small>
              </li>`
      )
      .join('');
  }

  dispose(): void {
      this.element.remove();
      // remove keydown listener
  }
} 