/**
 * n8n Ultimate User Guide System
 * Phase 2: Step-by-Step Guides for Common Use Cases
 * 
 * Provides comprehensive, interactive guidance for all user types
 */

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  instruction: string;
  code?: string;
  image?: string;
  video?: string;
  tips?: string[];
  warnings?: string[];
  nextSteps?: string[];
  prerequisites?: string[];
}

export interface UserGuide {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  estimatedTime: string;
  category: string;
  tags: string[];
  steps: GuideStep[];
  outcomes: string[];
  troubleshooting?: Record<string, string>;
}

/**
 * Step-by-Step Guides for Common Use Cases
 */
export const USER_GUIDES: UserGuide[] = [
  {
    id: 'quick-start',
    title: 'Quick Start: Your First Workflow in 5 Minutes',
    description: 'Complete beginner guide to creating your first n8n workflow using AI',
    difficulty: 'beginner',
    estimatedTime: '5 minutes',
    category: 'Getting Started',
    tags: ['beginner', 'first-time', 'quick'],
    outcomes: [
      'Create your first working n8n workflow',
      'Understand basic workflow concepts',
      'Learn to use AI-powered generation',
      'Test and validate your workflow'
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Open n8n Ultimate Dashboard',
        description: 'Access the main control interface',
        instruction: 'Open your web browser and navigate to the n8n Ultimate dashboard. You should see the main navigation with 5 primary options.',
        tips: [
          'Bookmark the dashboard URL for quick access',
          'The dashboard adapts to your user level automatically'
        ],
        nextSteps: ['step-2']
      },
      {
        id: 'step-2',
        title: 'Use Quick Workflow Creation',
        description: 'Create a workflow using natural language',
        instruction: 'Click "Create Workflow" or press Ctrl+Q. You\'ll see a text input box where you can describe your automation idea.',
        code: `// Example descriptions you can try:
"Send me an email when someone mentions my company on Twitter"
"Create a task in Notion when I receive a specific email"
"Post daily weather updates to my Slack channel"
"Backup my Google Drive files to Dropbox weekly"`,
        tips: [
          'Be specific about triggers and actions',
          'Mention the apps/services you want to connect',
          'Use natural language - no technical jargon needed'
        ],
        nextSteps: ['step-3']
      },
      {
        id: 'step-3',
        title: 'Review Generated Workflow',
        description: 'Examine the AI-generated workflow structure',
        instruction: 'After entering your description, the AI will generate a complete n8n workflow. Review the nodes, connections, and configurations.',
        tips: [
          'Each node represents a step in your automation',
          'Arrows show the flow of data between steps',
          'Green indicators mean the configuration is valid'
        ],
        warnings: [
          'Red indicators mean additional configuration is needed',
          'Always review sensitive data handling steps'
        ],
        nextSteps: ['step-4']
      },
      {
        id: 'step-4',
        title: 'Configure API Credentials',
        description: 'Set up authentication for external services',
        instruction: 'Click on any node that requires credentials (marked with a key icon). Follow the guided setup to connect your accounts.',
        tips: [
          'Most services use OAuth - just click "Connect Account"',
          'Your credentials are stored securely and encrypted',
          'You can reuse credentials across multiple workflows'
        ],
        warnings: [
          'Never share your API keys with others',
          'Review permissions carefully when connecting accounts'
        ],
        nextSteps: ['step-5']
      },
      {
        id: 'step-5',
        title: 'Test Your Workflow',
        description: 'Validate that everything works correctly',
        instruction: 'Click the "Test Workflow" button. This will run your workflow once to verify all connections and logic work properly.',
        tips: [
          'Check the execution log for any errors',
          'Verify that data flows correctly between nodes',
          'Test with real data when possible'
        ],
        nextSteps: ['step-6']
      },
      {
        id: 'step-6',
        title: 'Activate and Monitor',
        description: 'Deploy your workflow for production use',
        instruction: 'Once testing is successful, click "Activate" to enable your workflow. Monitor its performance in the System Monitor section.',
        tips: [
          'Activated workflows run automatically based on their triggers',
          'Check the monitor dashboard regularly for any issues',
          'You can pause/resume workflows anytime'
        ]
      }
    ],
    troubleshooting: {
      'Workflow fails to generate': 'Try being more specific in your description. Mention exact app names and what data should flow between them.',
      'Authentication errors': 'Ensure you have admin permissions for the services you\'re connecting. Clear browser cache if OAuth fails.',
      'Test execution fails': 'Check that all required fields are filled. Verify your API credentials are still valid.',
      'No data in output': 'Ensure your trigger conditions are met. For manual triggers, click "Execute Node" to test individual steps.'
    }
  },
  {
    id: 'template-customization',
    title: 'Template Customization: Adapt Pre-Built Workflows',
    description: 'Learn to browse, select, and customize existing workflow templates',
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    category: 'Templates',
    tags: ['templates', 'customization', 'gallery'],
    outcomes: [
      'Browse and find relevant templates',
      'Understand template categories and filtering',
      'Customize templates for your specific needs',
      'Save and share modified templates'
    ],
    steps: [
      {
        id: 'template-1',
        title: 'Access Template Gallery',
        description: 'Navigate to the collection of 50+ pre-built templates',
        instruction: 'Click "Template Gallery" in the main navigation or press Ctrl+T. You\'ll see categories like Communication, Data Processing, Marketing, and more.',
        tips: [
          'Use the search bar to find specific use cases',
          'Filter by complexity level or app integrations',
          'Preview templates before importing'
        ]
      },
      {
        id: 'template-2',
        title: 'Select a Template',
        description: 'Choose a template that matches your use case',
        instruction: 'Browse the categories or search for keywords. Click on any template to see a detailed preview with description, required apps, and complexity level.',
        code: `// Popular template categories:
- Email Automation (10+ templates)
- Social Media Management (8+ templates)  
- Data Synchronization (15+ templates)
- File Processing (12+ templates)
- Notification Systems (10+ templates)`,
        tips: [
          'Read the template description carefully',
          'Check the required app integrations',
          'Look at the estimated setup time'
        ]
      },
      {
        id: 'template-3',
        title: 'Import and Customize',
        description: 'Import the template and modify it for your needs',
        instruction: 'Click "Use This Template" to import it to your workflow editor. Then modify nodes, add/remove steps, and adjust configurations as needed.',
        tips: [
          'Start with the trigger node - adjust timing or conditions',
          'Modify filter conditions to match your data',
          'Add additional processing steps if needed'
        ],
        warnings: [
          'Always test thoroughly after making changes',
          'Be careful when modifying data transformation logic'
        ]
      },
      {
        id: 'template-4',
        title: 'Save Your Version',
        description: 'Save your customized template for future use',
        instruction: 'After customization, click "Save as Template" to add your version to your personal template library. Add a descriptive name and tags.',
        tips: [
          'Use descriptive names that explain the specific use case',
          'Add tags to make templates easy to find later',
          'Include setup notes for future reference'
        ]
      }
    ],
    troubleshooting: {
      'Template not working': 'Check that you have access to all required apps. Update any deprecated node configurations.',
      'Customization breaks workflow': 'Test each change individually. Use the workflow validation feature to identify issues.',
      'Cannot find suitable template': 'Try broader search terms or browse by app rather than use case. Consider starting with a simple template and adding complexity.'
    }
  },
  {
    id: 'ai-interaction-patterns',
    title: 'Master AI-Human Collaboration',
    description: 'Advanced guide to optimizing your interaction with the AI system',
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    category: 'AI Collaboration',
    tags: ['ai', 'interaction', 'optimization', 'advanced'],
    outcomes: [
      'Understand different AI interaction modes',
      'Learn to provide optimal input for better results',
      'Master iterative refinement techniques',
      'Use context and feedback effectively'
    ],
    steps: [
      {
        id: 'ai-1',
        title: 'Understand AI Interaction Modes',
        description: 'Learn the different ways to interact with the AI system',
        instruction: 'The AI system supports multiple interaction modes: Guided Generation (beginner), Expert Mode (advanced), Enhancement Mode (refinement), and Learning Mode (adaptive).',
        code: `// Interaction Mode Examples:

// Guided Generation (Beginner)
"Create a workflow to sync data between apps"

// Expert Mode (Advanced)  
"Generate HTTP webhook receiver → JSON parser → conditional router → Slack/email based on priority field → log to database"

// Enhancement Mode (Refinement)
"Improve my existing workflow by adding error handling and retry logic"

// Learning Mode (Adaptive)
"I want to learn how to build complex data transformation workflows"`,
        tips: [
          'Start with Guided Mode if you\'re new to automation',
          'Use Expert Mode when you know exactly what you want',
          'Enhancement Mode is perfect for improving existing workflows'
        ]
      },
      {
        id: 'ai-2',
        title: 'Optimize Your Input Descriptions',
        description: 'Learn to provide descriptions that generate better results',
        instruction: 'Structure your descriptions with clear triggers, actions, and conditions. Be specific about data sources, transformations, and destinations.',
        code: `// Good Description Structure:
"When [TRIGGER] happens, 
 get [DATA] from [SOURCE],
 transform it by [TRANSFORMATION],
 then send it to [DESTINATION] if [CONDITION]"

// Example:
"When a new email arrives in Gmail with subject containing 'invoice',
 extract the attachment and amount,
 convert currency if needed,
 then create a record in Airtable if amount > $100"`,
        tips: [
          'Include specific app names and data fields',
          'Mention error handling requirements',
          'Specify timing and frequency for triggers'
        ]
      },
      {
        id: 'ai-3',
        title: 'Use Iterative Refinement',
        description: 'Learn to refine and improve AI-generated workflows',
        instruction: 'After the AI generates a workflow, use natural language to request specific improvements: "Add error handling", "Include data validation", "Optimize for performance".',
        tips: [
          'Make one change at a time for better results',
          'Ask for explanations: "Why did you choose this approach?"',
          'Request alternatives: "Show me another way to handle this data"'
        ]
      },
      {
        id: 'ai-4',
        title: 'Provide Context and Feedback',
        description: 'Help the AI understand your specific needs and constraints',
        instruction: 'Share context about your use case, technical constraints, and preferences. The AI learns from your feedback to provide better future recommendations.',
        code: `// Providing Helpful Context:
"I'm working with a team of 5 people"
"We process about 1000 records per day"  
"Security is very important for our industry"
"We prefer simple workflows over complex ones"
"Budget is limited, so use free/cheap services when possible"`,
        tips: [
          'Mention team size and technical expertise',
          'Share volume and performance requirements',
          'Indicate security and compliance needs'
        ]
      }
    ]
  },
  {
    id: 'control-panel-mastery',
    title: 'Control Panel: System Configuration',
    description: 'Complete guide to configuring AI models, system settings, and advanced options',
    difficulty: 'intermediate',
    estimatedTime: '20 minutes',
    category: 'Configuration',
    tags: ['configuration', 'ai-models', 'settings', 'advanced'],
    outcomes: [
      'Configure AI models for optimal performance',
      'Understand system settings and their impact',
      'Set up monitoring and alerting',
      'Optimize resource usage'
    ],
    steps: [
      {
        id: 'control-1',
        title: 'Access Control Panel',
        description: 'Navigate to system configuration interface',
        instruction: 'Click "Control Panel" or press Ctrl+, to access system settings. You\'ll see sections for AI Models, Performance, Security, and Integrations.',
        prerequisites: ['Intermediate user level or higher'],
        tips: [
          'Changes take effect immediately unless noted',
          'Some settings require system restart',
          'Always backup settings before major changes'
        ]
      },
      {
        id: 'control-2',
        title: 'Configure AI Models',
        description: 'Select and optimize AI models for different tasks',
        instruction: 'In the AI Models section, choose models for workflow generation, template recommendation, and error analysis. Each model has different strengths and resource requirements.',
        code: `// Recommended Model Configurations:

// For Workflow Generation:
- GPT-4: Best quality, higher cost
- Claude Sonnet: Balanced performance
- Local Llama: Private, lower cost

// For Template Recommendation:  
- Claude Haiku: Fast, efficient
- GPT-3.5: Good quality, affordable

// For Error Analysis:
- GPT-4: Complex problem solving
- Local DeepSeek: Private analysis`,
        tips: [
          'Use more powerful models for complex workflows',
          'Local models provide better privacy',
          'Monitor token usage and costs'
        ]
      },
      {
        id: 'control-3',
        title: 'Performance Optimization',
        description: 'Adjust settings for optimal system performance',
        instruction: 'Configure cache settings, parallel processing limits, and memory allocation based on your system resources and usage patterns.',
        tips: [
          'Enable caching for frequently used templates',
          'Adjust parallel limits based on CPU cores',
          'Monitor memory usage in System Monitor'
        ]
      },
      {
        id: 'control-4',
        title: 'Set Up Monitoring',
        description: 'Configure alerts and monitoring for system health',
        instruction: 'Enable monitoring for workflow failures, performance degradation, and resource usage. Set up email or Slack notifications for critical alerts.',
        tips: [
          'Start with default alert thresholds',
          'Adjust sensitivity based on your needs',
          'Test notification delivery'
        ]
      }
    ]
  },
  {
    id: 'production-deployment',
    title: 'Production Deployment Guide',
    description: 'Deploy n8n Ultimate workflows for enterprise production use',
    difficulty: 'expert',
    estimatedTime: '45 minutes',
    category: 'Deployment',
    tags: ['production', 'enterprise', 'deployment', 'scaling'],
    outcomes: [
      'Deploy workflows to production environment',
      'Set up monitoring and alerting',
      'Implement security best practices',
      'Configure scaling and load balancing'
    ],
    steps: [
      {
        id: 'prod-1',
        title: 'Pre-Deployment Checklist',
        description: 'Verify readiness for production deployment',
        instruction: 'Complete testing, security review, and performance validation before deploying to production.',
        prerequisites: [
          'Workflows tested in development environment',
          'Security credentials properly configured',
          'Performance benchmarks established',
          'Monitoring systems ready'
        ]
      },
      {
        id: 'prod-2',
        title: 'Environment Configuration',
        description: 'Set up production environment with proper security',
        instruction: 'Configure production environment variables, secure credential storage, network security, and access controls.',
        code: `// Production Environment Setup:
export NODE_ENV=production
export N8N_SECURITY_AUDIT_DAYS=7
export N8N_ENCRYPTION_KEY=your-secure-key
export DATABASE_HOST=your-db-host
export WEBHOOK_URL=https://your-domain.com`,
        warnings: [
          'Never use development credentials in production',
          'Enable SSL/TLS for all communications',
          'Regularly rotate encryption keys'
        ]
      },
      {
        id: 'prod-3',
        title: 'Deploy and Monitor',
        description: 'Deploy workflows and establish monitoring',
        instruction: 'Deploy workflows using automated deployment pipeline. Monitor performance, errors, and resource usage continuously.',
        tips: [
          'Use blue-green deployment for zero downtime',
          'Set up comprehensive logging',
          'Monitor key performance indicators'
        ]
      }
    ]
  }
];

/**
 * Interactive Guide Runner
 */
export class UserGuideRunner {
  private currentGuide: UserGuide | null = null;
  private currentStep: number = 0;
  private completedSteps: Set<string> = new Set();
  
  /**
   * Start a specific guide
   */
  startGuide(guideId: string): UserGuide | null {
    this.currentGuide = USER_GUIDES.find(guide => guide.id === guideId) || null;
    this.currentStep = 0;
    this.completedSteps.clear();
    return this.currentGuide;
  }
  
  /**
   * Get current step information
   */
  getCurrentStep(): GuideStep | null {
    if (!this.currentGuide || this.currentStep >= this.currentGuide.steps.length) {
      return null;
    }
    return this.currentGuide.steps[this.currentStep];
  }
  
  /**
   * Mark current step as completed and move to next
   */
  completeCurrentStep(): boolean {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return false;
    
    this.completedSteps.add(currentStep.id);
    this.currentStep++;
    
    return true;
  }
  
  /**
   * Get progress information
   */
  getProgress(): { completed: number; total: number; percentage: number } {
    if (!this.currentGuide) return { completed: 0, total: 0, percentage: 0 };
    
    const total = this.currentGuide.steps.length;
    const completed = this.completedSteps.size;
    const percentage = Math.round((completed / total) * 100);
    
    return { completed, total, percentage };
  }
  
  /**
   * Search guides by keyword or category
   */
  static searchGuides(query: string, difficulty?: string): UserGuide[] {
    const lowerQuery = query.toLowerCase();
    
    return USER_GUIDES.filter(guide => {
      const matchesQuery = 
        guide.title.toLowerCase().includes(lowerQuery) ||
        guide.description.toLowerCase().includes(lowerQuery) ||
        guide.category.toLowerCase().includes(lowerQuery) ||
        guide.tags.some(tag => tag.includes(lowerQuery));
      
      const matchesDifficulty = !difficulty || guide.difficulty === difficulty;
      
      return matchesQuery && matchesDifficulty;
    });
  }
  
  /**
   * Get guides by category
   */
  static getGuidesByCategory(category: string): UserGuide[] {
    return USER_GUIDES.filter(guide => 
      guide.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  /**
   * Get recommended guides for user level
   */
  static getRecommendedGuides(userLevel: 'beginner' | 'intermediate' | 'expert'): UserGuide[] {
    const levelOrder = ['beginner', 'intermediate', 'expert'];
    const userLevelIndex = levelOrder.indexOf(userLevel);
    
    return USER_GUIDES
      .filter(guide => levelOrder.indexOf(guide.difficulty) <= userLevelIndex)
      .sort((a, b) => {
        // Prioritize guides matching user level, then easier ones
        const aDiff = Math.abs(levelOrder.indexOf(a.difficulty) - userLevelIndex);
        const bDiff = Math.abs(levelOrder.indexOf(b.difficulty) - userLevelIndex);
        return aDiff - bDiff;
      });
  }
}

export default UserGuideRunner; 