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

/**
 * Main Dashboard Class - Central orchestrator for user experience
 */
export class N8nUltimateDashboard {
  private config: DashboardConfig;
  private rootElement: HTMLElement;
  private currentComponent: { dispose?: () => void } | null = null;
  
  constructor(config: DashboardConfig, rootElement: HTMLElement) {
    this.config = config;
    this.rootElement = rootElement;
    this.initializeAccessibility();
    this.showGettingStarted();
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
  
  /**
   * Get navigation items filtered by user level and availability
   */
  getNavigation(): NavigationItem[] {
    return DASHBOARD_NAVIGATION.filter(item => 
      item.isAvailable && 
      this.isFeatureAccessible(item.requiredLevel)
    );
  }
  
  /**
   * Check if feature is accessible to current user level
   */
  private isFeatureAccessible(requiredLevel?: string): boolean {
    if (!requiredLevel) return true;
    
    const levels = ['beginner', 'intermediate', 'expert'];
    const userLevel = levels.indexOf(this.config.user.level);
    const requireLevel = levels.indexOf(requiredLevel);
    
    return userLevel >= requireLevel;
  }
  
  /**
   * Navigate to a specific dashboard section.
   * This is the primary method for changing views.
   */
  public navigateTo(sectionId: string): void {
    if (this.currentComponent && typeof this.currentComponent.dispose === 'function') {
      this.currentComponent.dispose();
      this.currentComponent = null;
    }

    switch (sectionId) {
      case 'workflow-generator':
        this.currentComponent = new WorkflowGeneratorComponent(this.rootElement);
        break;
      case 'template-gallery':
        this.currentComponent = new TemplateGalleryComponent(this.rootElement);
        break;
      case 'system-monitor':
        this.currentComponent = new SystemMonitorComponent(this.rootElement);
        break;
      // Add cases for 'control-panel' and 'user-guide' here
      default:
        this.showGettingStarted();
        break;
    }
  }

  /**
   * Handle user interaction and route to appropriate feature
   */
  async handleUserInput(input: string, context?: any): Promise<any> {
    // This will be the main entry point for AI-human interaction
    // Route to appropriate dashboard component based on user intent
    
    if (input.toLowerCase().includes('create') || input.toLowerCase().includes('workflow')) {
      this.navigateTo('workflow-generator');
      return;
    }
    
    if (input.toLowerCase().includes('template') || input.toLowerCase().includes('browse')) {
      this.navigateTo('template-gallery');
      return;
    }
    
    if (input.toLowerCase().includes('status') || input.toLowerCase().includes('monitor')) {
      this.navigateTo('system-monitor');
      return;
    }

    if (input.toLowerCase().includes('help') || input.toLowerCase().includes('guide')) {
      this.navigateTo('user-guide');
      return;
    }
    
    // Default: show help with available options
    this.showGettingStarted();
  }
  
  private showGettingStarted(): void {
    if (this.currentComponent && typeof this.currentComponent.dispose === 'function') {
      this.currentComponent.dispose();
    }
    this.rootElement.innerHTML = `
      <div class="getting-started">
        <h2>Welcome to n8n Ultimate!</h2>
        <p>What would you like to do?</p>
        <ul>
          ${DASHBOARD_NAVIGATION.map(item => `<li><button data-section-id="${item.id}">${item.title}</button></li>`).join('')}
        </ul>
      </div>
    `;

    this.rootElement.querySelectorAll('button[data-section-id]').forEach(button => {
      button.addEventListener('click', (e) => {
        const sectionId = (e.target as HTMLElement).dataset.sectionId;
        if (sectionId) {
          this.navigateTo(sectionId);
        }
      });
    });
  }
}

// Export main dashboard for easy import
export default N8nUltimateDashboard; 