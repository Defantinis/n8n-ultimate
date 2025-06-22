/**
 * Step-by-Step Guides for n8n Ultimate
 * Comprehensive guides for common workflow creation scenarios
 */
/**
 * GUIDE 1: Quick Start - Your First Workflow
 */
export const QUICK_START_GUIDE = {
    id: 'quick-start',
    title: 'Quick Start: Your First Workflow in 5 Minutes',
    description: 'Complete beginner guide to creating your first n8n workflow using AI',
    difficulty: 'beginner',
    estimatedTime: '5 minutes',
    category: 'Getting Started',
    outcomes: [
        'Create your first working n8n workflow',
        'Understand basic workflow concepts',
        'Learn to use AI-powered generation',
        'Test and validate your workflow'
    ],
    steps: [
        {
            id: 'qs-1',
            title: 'Open n8n Ultimate Dashboard',
            description: 'Access the main control interface',
            instruction: 'Open your web browser and navigate to the n8n Ultimate dashboard. You should see the main navigation with 5 primary options: Create Workflow, Template Gallery, Control Panel, System Monitor, and User Guide.',
            tips: [
                'Bookmark the dashboard URL for quick access',
                'The dashboard adapts to your user level automatically',
                'Use keyboard shortcuts for faster navigation'
            ]
        },
        {
            id: 'qs-2',
            title: 'Use Quick Workflow Creation',
            description: 'Create a workflow using natural language',
            instruction: 'Click "Create Workflow" or press Ctrl+Q. You\'ll see a text input box where you can describe your automation idea in plain English.',
            code: `// Example descriptions you can try:
"Send me an email when someone mentions my company on Twitter"
"Create a task in Notion when I receive a specific email" 
"Post daily weather updates to my Slack channel"
"Backup my Google Drive files to Dropbox weekly"`,
            tips: [
                'Be specific about triggers and actions',
                'Mention the apps/services you want to connect',
                'Use natural language - no technical jargon needed',
                'Include timing details (daily, weekly, when X happens)'
            ]
        },
        {
            id: 'qs-3',
            title: 'Review Generated Workflow',
            description: 'Examine the AI-generated workflow structure',
            instruction: 'After entering your description, the AI will generate a complete n8n workflow. Review the nodes (boxes), connections (arrows), and configurations.',
            tips: [
                'Each node represents a step in your automation',
                'Arrows show the flow of data between steps',
                'Green indicators mean the configuration is valid',
                'Click on any node to see its settings'
            ],
            warnings: [
                'Red indicators mean additional configuration is needed',
                'Always review sensitive data handling steps',
                'Check that the workflow matches your intended logic'
            ]
        },
        {
            id: 'qs-4',
            title: 'Configure API Credentials',
            description: 'Set up authentication for external services',
            instruction: 'Click on any node that requires credentials (marked with a key icon). Follow the guided setup to connect your accounts securely.',
            tips: [
                'Most services use OAuth - just click "Connect Account"',
                'Your credentials are stored securely and encrypted',
                'You can reuse credentials across multiple workflows',
                'Test the connection after setting up credentials'
            ],
            warnings: [
                'Never share your API keys with others',
                'Review permissions carefully when connecting accounts',
                'Use dedicated service accounts for automation when possible'
            ]
        },
        {
            id: 'qs-5',
            title: 'Test Your Workflow',
            description: 'Validate that everything works correctly',
            instruction: 'Click the "Test Workflow" button. This will run your workflow once to verify all connections and logic work properly.',
            tips: [
                'Check the execution log for any errors',
                'Verify that data flows correctly between nodes',
                'Test with real data when possible',
                'Use the manual trigger for testing complex workflows'
            ]
        },
        {
            id: 'qs-6',
            title: 'Activate and Monitor',
            description: 'Deploy your workflow for production use',
            instruction: 'Once testing is successful, click "Activate" to enable your workflow. Monitor its performance in the System Monitor section.',
            tips: [
                'Activated workflows run automatically based on their triggers',
                'Check the monitor dashboard regularly for any issues',
                'You can pause/resume workflows anytime',
                'Set up notifications for workflow failures'
            ]
        }
    ]
};
/**
 * GUIDE 2: Template Customization
 */
export const TEMPLATE_GUIDE = {
    id: 'template-customization',
    title: 'Template Customization: Adapt Pre-Built Workflows',
    description: 'Learn to browse, select, and customize existing workflow templates',
    difficulty: 'beginner',
    estimatedTime: '10 minutes',
    category: 'Templates',
    outcomes: [
        'Browse and find relevant templates',
        'Understand template categories and filtering',
        'Customize templates for your specific needs',
        'Save and share modified templates'
    ],
    steps: [
        {
            id: 'tc-1',
            title: 'Access Template Gallery',
            description: 'Navigate to the collection of 50+ pre-built templates',
            instruction: 'Click "Template Gallery" in the main navigation or press Ctrl+T. You\'ll see categories like Communication, Data Processing, Marketing, and more.',
            tips: [
                'Use the search bar to find specific use cases',
                'Filter by complexity level or app integrations',
                'Preview templates before importing',
                'Check the rating and usage statistics'
            ]
        },
        {
            id: 'tc-2',
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
                'Look at the estimated setup time',
                'Review the complexity level vs your experience'
            ]
        },
        {
            id: 'tc-3',
            title: 'Import and Customize',
            description: 'Import the template and modify it for your needs',
            instruction: 'Click "Use This Template" to import it to your workflow editor. Then modify nodes, add/remove steps, and adjust configurations as needed.',
            tips: [
                'Start with the trigger node - adjust timing or conditions',
                'Modify filter conditions to match your data',
                'Add additional processing steps if needed',
                'Update notification settings and recipients'
            ],
            warnings: [
                'Always test thoroughly after making changes',
                'Be careful when modifying data transformation logic',
                'Backup the original template before major changes'
            ]
        },
        {
            id: 'tc-4',
            title: 'Save Your Version',
            description: 'Save your customized template for future use',
            instruction: 'After customization, click "Save as Template" to add your version to your personal template library. Add a descriptive name and tags.',
            tips: [
                'Use descriptive names that explain the specific use case',
                'Add tags to make templates easy to find later',
                'Include setup notes for future reference',
                'Share useful templates with your team'
            ]
        }
    ]
};
/**
 * GUIDE 3: AI Collaboration Mastery
 */
export const AI_COLLABORATION_GUIDE = {
    id: 'ai-collaboration',
    title: 'Master AI-Human Collaboration',
    description: 'Advanced guide to optimizing your interaction with the AI system',
    difficulty: 'intermediate',
    estimatedTime: '15 minutes',
    category: 'AI Collaboration',
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
                'Enhancement Mode is perfect for improving existing workflows',
                'Learning Mode provides educational explanations'
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
                'Specify timing and frequency for triggers',
                'Describe data validation needs'
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
                'Request alternatives: "Show me another way to handle this data"',
                'Be specific about what you want to improve'
            ]
        }
    ]
};
/**
 * All available guides
 */
export const ALL_GUIDES = [
    QUICK_START_GUIDE,
    TEMPLATE_GUIDE,
    AI_COLLABORATION_GUIDE
];
/**
 * Guide utility functions
 */
export class GuideManager {
    /**
     * Search guides by keyword or category
     */
    static searchGuides(query, difficulty) {
        const lowerQuery = query.toLowerCase();
        return ALL_GUIDES.filter(guide => {
            const matchesQuery = guide.title.toLowerCase().includes(lowerQuery) ||
                guide.description.toLowerCase().includes(lowerQuery) ||
                guide.category.toLowerCase().includes(lowerQuery);
            const matchesDifficulty = !difficulty || guide.difficulty === difficulty;
            return matchesQuery && matchesDifficulty;
        });
    }
    /**
     * Get guides by difficulty level
     */
    static getGuidesByDifficulty(difficulty) {
        return ALL_GUIDES.filter(guide => guide.difficulty === difficulty);
    }
    /**
     * Get recommended next guide based on current progress
     */
    static getNextRecommendedGuide(completedGuides) {
        // If no guides completed, start with quick start
        if (completedGuides.length === 0) {
            return QUICK_START_GUIDE;
        }
        // If quick start done, recommend template guide
        if (completedGuides.includes('quick-start') && !completedGuides.includes('template-customization')) {
            return TEMPLATE_GUIDE;
        }
        // If both basic guides done, recommend AI collaboration
        if (completedGuides.includes('quick-start') && completedGuides.includes('template-customization')) {
            return AI_COLLABORATION_GUIDE;
        }
        return null;
    }
}
//# sourceMappingURL=step-by-step-guides.js.map