/**
 * n8n Ultimate Dashboard - Main Entry Point
 * Phase 2: User-Friendly Production Experience
 * 
 * This is the central hub for all user interactions with n8n Ultimate.
 * Provides easy access to all major features through an intuitive interface.
 */

export interface DashboardConfig {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
  user: {
    level: 'beginner' | 'intermediate' | 'expert';
    preferences: Record<string, any>;
  };
}

export interface NavigationItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  requiredLevel?: 'beginner' | 'intermediate' | 'expert';
  isAvailable: boolean;
  shortcut?: string;
}

/**
 * Main Navigation Structure - Designed for Progressive Disclosure
 * Shows features based on user expertise level and system availability
 */
export const DASHBOARD_NAVIGATION: NavigationItem[] = [
  {
    id: 'workflow-generator',
    title: 'Create Workflow',
    description: 'Generate n8n workflows from natural language descriptions using AI',
    icon: '🤖',
    path: '/dashboard/workflow-generator',
    requiredLevel: 'beginner',
    isAvailable: true,
    shortcut: 'Ctrl+N'
  },
  {
    id: 'template-gallery',
    title: 'Template Gallery',
    description: 'Browse and customize 50+ pre-built workflow templates',
    icon: '📚',
    path: '/dashboard/template-gallery',
    requiredLevel: 'beginner',
    isAvailable: true,
    shortcut: 'Ctrl+T'
  },
  {
    id: 'control-panel',
    title: 'Control Panel',
    description: 'Configure AI models, system settings, and advanced options',
    icon: '⚙️',
    path: '/dashboard/control-panel',
    requiredLevel: 'intermediate',
    isAvailable: true,
    shortcut: 'Ctrl+,'
  },
  {
    id: 'system-monitor',
    title: 'System Status',
    description: 'Monitor performance, health, and usage analytics',
    icon: '📊',
    path: '/dashboard/system-monitor',
    requiredLevel: 'intermediate',
    isAvailable: true,
    shortcut: 'Ctrl+M'
  },
  {
    id: 'user-guide',
    title: 'User Guide',
    description: 'Interactive tutorials, documentation, and help system',
    icon: '📖',
    path: '/dashboard/user-guide',
    requiredLevel: 'beginner',
    isAvailable: true,
    shortcut: 'F1'
  }
];

/**
 * Quick Actions - Contextual shortcuts for common tasks
 */
export const QUICK_ACTIONS = [
  {
    id: 'quick-workflow',
    title: 'Quick Workflow',
    description: 'Describe your automation idea in one sentence',
    action: 'openQuickWorkflow',
    shortcut: 'Ctrl+Q'
  },
  {
    id: 'import-template',
    title: 'Import Template',
    description: 'Import workflow from file or URL',
    action: 'importTemplate',
    shortcut: 'Ctrl+I'
  },
  {
    id: 'help',
    title: 'Get Help',
    description: 'Ask questions or report issues',
    action: 'openHelp',
    shortcut: '?'
  }
];

/**
 * Accessibility Features Configuration
 */
export const ACCESSIBILITY_FEATURES = {
  keyboardNavigation: {
    enabled: true,
    skipLinks: true,
    focusIndicators: true
  },
  screenReader: {
    ariaLabels: true,
    descriptions: true,
    announcements: true
  },
  visualAccessibility: {
    highContrast: false,
    reducedMotion: false,
    largeText: false
  },
  cognitiveAccessibility: {
    simplifiedUI: false,
    progressIndicators: true,
    clearInstructions: true
  }
};

import { WorkflowGeneratorComponent } from './workflow-generator/index.js';
import { TemplateGalleryComponent } from './template-gallery/index.js';
import { SystemMonitorComponent } from './system-monitor/index.js';
import { GuidedGenerationComponent } from './interactions/guided-generation';
import { CommandPalette } from './interactions/command-palette';
import { feedbackBus, UserIntent } from './interactions/feedback-bus';
import { userContext } from './user-context';
import { WorkspaceSwitcher } from './collaboration/workspace-switcher';
import { TeamManager } from './collaboration/team-manager';
import { WorkflowReviewUI } from './collaboration/workflow-review-ui';
import { TemplateManagerComponent } from './template-manager';
import { ABTestManagerComponent } from './ab-test-manager';

const MOCK_WORKSPACE_ID = 'ws_1';
const MOCK_WORKFLOW_ID = 'wf_123';

/**
 * Main Dashboard Class - Central orchestrator for user experience
 */
export class N8nUltimateDashboard {
  private config: DashboardConfig;
  private rootElement: HTMLElement;
  private currentComponent: { dispose?: () => void } | null = null;
  private commandPalette: CommandPalette;
  
  constructor(config: DashboardConfig, rootElement: HTMLElement) {
    this.config = config;
    this.rootElement = rootElement;
    this.commandPalette = new CommandPalette(this.rootElement);
    this.initializeDashboard();
    this.initializeAccessibility();
    this.listenForIntents();
    this.showGettingStarted();
  }
  
  private initializeDashboard(): void {
    this.rootElement.innerHTML = `
      <header class="main-header">
        <div class="header-left"></div>
        <div class="header-right"></div>
      </header>
      <main class="main-content"></main>
    `;
    
    const headerLeft = this.rootElement.querySelector('.header-left') as HTMLElement;
    const mainContent = this.rootElement.querySelector('.main-content') as HTMLElement;

    this.renderCollaborationSection(headerLeft, mainContent);
  }
  
  /**
   * Initialize accessibility features based on user preferences
   */
  private initializeAccessibility(): void {
    // Apply accessibility settings
    if (this.config.accessibility.reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0s');
    }
    
    if (this.config.accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast');
    }
  }
  
  private listenForIntents(): void {
    feedbackBus.subscribe('userIntent', (intent: UserIntent) => {
      if (intent.type === 'NAVIGATE') {
        this.navigateTo(intent.payload.sectionId);
      }
      // ... handle other intents
    });
  }
  
  /**
   * Get navigation items filtered by user level and availability
   */
  getNavigation(): NavigationItem[] {
    const { skillLevel } = userContext.get();
    return DASHBOARD_NAVIGATION.filter(item => 
      item.isAvailable && 
      this.isFeatureAccessible(item.requiredLevel, skillLevel)
    );
  }
  
  /**
   * Check if feature is accessible to current user level
   */
  private isFeatureAccessible(requiredLevel: string | undefined, userLevel: string): boolean {
    if (!requiredLevel) return true;
    
    const levels = ['beginner', 'intermediate', 'expert'];
    const currentUserLevelIndex = levels.indexOf(userLevel);
    const requiredLevelIndex = levels.indexOf(requiredLevel);
    
    return currentUserLevelIndex >= requiredLevelIndex;
  }
  
  /**
   * Navigate to a specific section of the dashboard
   */
  public navigateTo(sectionId: string): void {
    if (this.currentComponent && typeof this.currentComponent.dispose === 'function') {
      this.currentComponent.dispose();
      this.currentComponent = null;
    }

    // Do not clear the whole root element, only the main content
    const mainContent = this.rootElement.querySelector('.main-content');
    if (mainContent) {
        mainContent.innerHTML = ''; // Clear previous component
    } else {
        console.error('Main content area not found!');
        return;
    }
    
    let ComponentClass;
    switch (sectionId) {
      case 'workflow-generator':
        ComponentClass = WorkflowGeneratorComponent;
        break;
      case 'template-gallery':
        ComponentClass = TemplateGalleryComponent;
        break;
      case 'system-monitor':
        ComponentClass = SystemMonitorComponent;
        break;
      case 'guided-generation':
        ComponentClass = GuidedGenerationComponent;
        break;
      case 'template-manager':
        ComponentClass = TemplateManagerComponent;
        break;
      case 'ab-test-manager':
        ComponentClass = ABTestManagerComponent;
        break;
      // Add other cases for control-panel, user-guide etc.
      default:
        this.showGettingStarted();
        return;
    }
    
    this.currentComponent = new ComponentClass(mainContent);
  }

  /**
   * Handle user input, potentially routing to the AI agent
   */
  async handleUserInput(input: string, context?: any): Promise<any> {
    // This could now be powered by the feedback bus
    const intent: UserIntent = {
      type: 'HANDLE_TEXT_INPUT',
      payload: { input, context },
    };
    feedbackBus.publish('userIntent', intent);
    
    // Placeholder response
    return { response: 'AI is processing your request...' };
  }
  
  private showGettingStarted(): void {
    const { useGuidedMode } = userContext.get().preferences;
    if (useGuidedMode) {
      this.navigateTo('guided-generation');
    } else {
        const mainContent = this.rootElement.querySelector('.main-content');
        if(mainContent){
            mainContent.innerHTML = `
                <h1>Welcome to n8n Ultimate</h1>
                <p>Select a feature from the sidebar to get started.</p>
            `;
        }
    }
  }

  public dispose(): void {
    this.currentComponent?.dispose?.();
    this.commandPalette.dispose();
    // Unsubscribe from feedbackBus
  }

  private renderCollaborationSection(headerLeft: HTMLElement, mainContent: HTMLElement): void {
    const { userId } = userContext.get();

    // Workspace switcher in the header
    new WorkspaceSwitcher(headerLeft, userId);

    // Container grouping collaboration tools
    const collaborationSection = document.createElement('section');
    collaborationSection.className = 'collaboration-section';
    mainContent.appendChild(collaborationSection);

    // Team Manager
    const teamManagerContainer = document.createElement('div');
    teamManagerContainer.className = 'team-manager-section';
    collaborationSection.appendChild(teamManagerContainer);
    new TeamManager(teamManagerContainer, MOCK_WORKSPACE_ID, userId);

    // Workflow Review UI
    const reviewUiContainer = document.createElement('div');
    reviewUiContainer.className = 'workflow-review-section';
    collaborationSection.appendChild(reviewUiContainer);
    new WorkflowReviewUI(reviewUiContainer, MOCK_WORKSPACE_ID, userId, MOCK_WORKFLOW_ID);
  }
}

// Export main dashboard for easy import
export default N8nUltimateDashboard; 