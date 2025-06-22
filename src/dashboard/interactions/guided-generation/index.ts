/**
 * Guided Generation Wizard Component
 * Takes users through a step-by-step process to build a workflow.
 */
import { getWizardStepTemplate } from './templates';
import { feedbackBus, UserIntent } from '../feedback-bus';

export class GuidedGenerationComponent {
  private element: HTMLElement;
  private currentStep = 1;
  private totalSteps = 4;
  private workflowIdea = '';

  constructor(container: HTMLElement) {
    this.element = document.createElement('div');
    this.element.id = 'guided-generation-wizard';
    container.appendChild(this.element);

    this.render();
    this.attachEventListeners();
  }

  private render(): void {
    this.element.innerHTML = getWizardStepTemplate(this.currentStep, {
      idea: this.workflowIdea,
    });
  }

  private attachEventListeners(): void {
    this.element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;

      if (target.matches('[data-action="next"]')) {
        this.handleNext();
      } else if (target.matches('[data-action="prev"]')) {
        this.handlePrev();
      } else if (target.matches('[data-action="finish"]')) {
        this.handleFinish();
      }
    });
  }

  private handleNext(): void {
    if (this.currentStep < this.totalSteps) {
      if (this.currentStep === 1) {
        const input = this.element.querySelector<HTMLTextAreaElement>('#workflow-idea');
        this.workflowIdea = input?.value || '';
      }
      this.currentStep++;
      this.render();
    }
  }

  private handlePrev(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.render();
    }
  }

  private handleFinish(): void {
    const intent: UserIntent = {
      type: 'GENERATE_WORKFLOW_FROM_GUIDE',
      payload: {
        description: this.workflowIdea,
        settings: {
          // Future settings from the wizard can go here
        },
      },
    };
    feedbackBus.publish('userIntent', intent);
    this.element.innerHTML = `<p>🚀 Generating your workflow... The AI will take it from here!</p>`;
  }

  dispose(): void {
    this.element.remove();
  }
} 