/**
 * Knowledge Management CLI Interface for n8n Workflow Automation Project
 */
import { Command } from 'commander';
import { KnowledgeManagementAPI } from '../api/knowledge-management-api';
export class KnowledgeCLI {
    program;
    knowledgeStorage;
    api;
    constructor(knowledgeStorage) {
        this.knowledgeStorage = knowledgeStorage;
        this.api = new KnowledgeManagementAPI(knowledgeStorage);
        this.program = new Command();
        this.setupCommands();
    }
    setupCommands() {
        this.program
            .name('knowledge')
            .description('Knowledge Management CLI')
            .version('1.0.0');
        // List knowledge entries
        this.program
            .command('list')
            .description('List knowledge entries')
            .option('-t, --type <type>', 'Filter by knowledge type')
            .option('-c, --category <category>', 'Filter by category')
            .option('-l, --limit <number>', 'Limit results', '20')
            .action(this.listKnowledge.bind(this));
        // Search knowledge
        this.program
            .command('search <query>')
            .description('Search knowledge entries')
            .option('-l, --limit <number>', 'Limit results', '10')
            .action(this.searchKnowledge.bind(this));
        // Create knowledge entry
        this.program
            .command('create')
            .description('Create new knowledge entry')
            .requiredOption('-t, --title <title>', 'Knowledge title')
            .requiredOption('-d, --description <description>', 'Knowledge description')
            .option('--type <type>', 'Knowledge type', 'WORKFLOW_PATTERN')
            .option('--category <category>', 'Knowledge category', 'WORKFLOW')
            .action(this.createKnowledge.bind(this));
        // Show analytics
        this.program
            .command('analytics')
            .description('Show knowledge analytics')
            .action(this.showAnalytics.bind(this));
    }
    async listKnowledge(options) {
        try {
            const query = {
                limit: parseInt(options.limit)
            };
            if (options.type)
                query.type = options.type;
            if (options.category)
                query.category = options.category;
            const result = await this.knowledgeStorage.read(query);
            console.log(`\nFound ${result.total} knowledge entries:\n`);
            result.data.forEach((entry) => {
                console.log(`ID: ${entry.id}`);
                console.log(`Title: ${entry.title}`);
                console.log(`Type: ${entry.type}`);
                console.log(`Category: ${entry.category}`);
                console.log(`Created: ${entry.timestamp}`);
                console.log('---');
            });
        }
        catch (error) {
            console.error('Error listing knowledge:', error.message);
        }
    }
    async searchKnowledge(query, options) {
        try {
            const result = await this.knowledgeStorage.search(query, {
                limit: parseInt(options.limit)
            });
            console.log(`\nSearch results for "${query}":\n`);
            result.data.forEach((entry) => {
                console.log(`Title: ${entry.title}`);
                console.log(`Description: ${entry.description}`);
                console.log(`Confidence: ${(entry.confidence * 100).toFixed(1)}%`);
                console.log('---');
            });
        }
        catch (error) {
            console.error('Error searching knowledge:', error.message);
        }
    }
    async createKnowledge(options) {
        try {
            const entry = {
                id: `knowledge-${Date.now()}`,
                title: options.title,
                description: options.description,
                type: options.type,
                category: options.category,
                timestamp: new Date(),
                metadata: {},
                tags: [],
                source: 'MANUAL',
                confidence: 1.0,
                usageCount: 0,
                lastAccessed: new Date()
            };
            const created = await this.knowledgeStorage.create(entry);
            console.log(`\nKnowledge entry created successfully:`);
            console.log(`ID: ${created.id}`);
            console.log(`Title: ${created.title}`);
        }
        catch (error) {
            console.error('Error creating knowledge:', error.message);
        }
    }
    async showAnalytics() {
        try {
            const analytics = await this.knowledgeStorage.getAnalytics();
            console.log('\nKnowledge Analytics:');
            console.log(`Total Entries: ${analytics.totalEntries}`);
            console.log(`By Type:`, analytics.entriesByType);
            console.log(`By Category:`, analytics.entriesByCategory);
            console.log(`By Source:`, analytics.entriesBySource);
            console.log(`Top Tags:`, analytics.topTags.slice(0, 10));
        }
        catch (error) {
            console.error('Error getting analytics:', error.message);
        }
    }
    run(args) {
        this.program.parse(args);
    }
}
export default KnowledgeCLI;
//# sourceMappingURL=knowledge-cli.js.map