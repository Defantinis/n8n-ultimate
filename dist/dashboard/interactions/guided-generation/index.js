/**
 * Guided Generation Wizard Component
 * Takes users through a step-by-step process to build a workflow.
 */
import { getWizardStepTemplate } from './templates';
import { feedbackBus } from '../feedback-bus';
export class GuidedGenerationComponent {
    element;
    currentStep = 1;
    totalSteps = 4;
    workflowIdea = '';
    constructor(container) {
        this.element = document.createElement('div');
        this.element.id = 'guided-generation-wizard';
        container.appendChild(this.element);
        this.render();
        this.attachEventListeners();
    }
    render() {
        this.element.innerHTML = getWizardStepTemplate(this.currentStep, {
            idea: this.workflowIdea,
        });
    }
    attachEventListeners() {
        this.element.addEventListener('click', (e) => {
            const target = e.target;
            if (target.matches('[data-action="next"]')) {
                this.handleNext();
            }
            else if (target.matches('[data-action="prev"]')) {
                this.handlePrev();
            }
            else if (target.matches('[data-action="finish"]')) {
                this.handleFinish();
            }
        });
    }
    handleNext() {
        if (this.currentStep < this.totalSteps) {
            if (this.currentStep === 1) {
                const input = this.element.querySelector('#workflow-idea');
                this.workflowIdea = input?.value || '';
            }
            this.currentStep++;
            this.render();
        }
    }
    handlePrev() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.render();
        }
    }
    handleFinish() {
        const intent = {
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
    dispose() {
        this.element.remove();
    }
}
//# sourceMappingURL=index.js.map