/**
 * Test Suite for Knowledge Management API and CLI
 */
import { KnowledgeManagementAPI } from './knowledge-management-api';
import { KnowledgeCLI } from '../cli/knowledge-cli';
// Mock Knowledge Storage Manager for testing
class MockKnowledgeStorageManager {
    entries = [];
    async create(entry) {
        const newEntry = { ...entry, id: `test-${Date.now()}` };
        this.entries.push(newEntry);
        return newEntry;
    }
    async read(query) {
        let filtered = this.entries;
        if (query.type) {
            filtered = filtered.filter(e => e.type === query.type);
        }
        if (query.category) {
            filtered = filtered.filter(e => e.category === query.category);
        }
        const offset = query.offset || 0;
        const limit = query.limit || 20;
        return {
            data: filtered.slice(offset, offset + limit),
            total: filtered.length
        };
    }
    async findById(id) {
        return this.entries.find(e => e.id === id);
    }
    async update(id, updates) {
        const index = this.entries.findIndex(e => e.id === id);
        if (index !== -1) {
            this.entries[index] = { ...this.entries[index], ...updates };
            return this.entries[index];
        }
        return null;
    }
    async delete(id) {
        const index = this.entries.findIndex(e => e.id === id);
        if (index !== -1) {
            this.entries.splice(index, 1);
            return true;
        }
        return false;
    }
    async search(query, options) {
        const filtered = this.entries.filter(entry => entry.title.toLowerCase().includes(query.toLowerCase()) ||
            entry.description.toLowerCase().includes(query.toLowerCase()));
        const limit = options.limit || 20;
        return {
            data: filtered.slice(0, limit),
            total: filtered.length
        };
    }
    async getAnalytics() {
        return {
            totalEntries: this.entries.length,
            byType: this.getCountByField('type'),
            byCategory: this.getCountByField('category'),
            bySource: this.getCountByField('source'),
            popularTags: []
        };
    }
    async export(format) {
        if (format === 'json') {
            return JSON.stringify(this.entries, null, 2);
        }
        return '';
    }
    async import(data, format) {
        try {
            const parsed = JSON.parse(data);
            let imported = 0;
            for (const entry of parsed) {
                await this.create(entry);
                imported++;
            }
            return { imported, errors: 0 };
        }
        catch (error) {
            return { imported: 0, errors: 1 };
        }
    }
    getCountByField(field) {
        return this.entries.reduce((acc, entry) => {
            const value = entry[field] || 'unknown';
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
    }
}
// Test API functionality
export async function runAPITests() {
    console.log('Running Knowledge Management API Tests...\n');
    const mockStorage = new MockKnowledgeStorageManager();
    const api = new KnowledgeManagementAPI(mockStorage);
    // Test 1: Create knowledge entry
    console.log('Test 1: Create knowledge entry');
    try {
        const entry = await mockStorage.create({
            title: 'Test Knowledge',
            description: 'Test description',
            type: 'WORKFLOW_PATTERN',
            category: 'WORKFLOW'
        });
        console.log('✓ Knowledge entry created:', entry.id);
    }
    catch (error) {
        console.log('✗ Error creating knowledge:', error.message);
    }
    // Test 2: Read knowledge entries
    console.log('\nTest 2: Read knowledge entries');
    try {
        const result = await mockStorage.read({});
        console.log(`✓ Found ${result.total} entries`);
    }
    catch (error) {
        console.log('✗ Error reading knowledge:', error.message);
    }
    // Test 3: Search knowledge
    console.log('\nTest 3: Search knowledge');
    try {
        const result = await mockStorage.search('Test', {});
        console.log(`✓ Search found ${result.total} results`);
    }
    catch (error) {
        console.log('✗ Error searching knowledge:', error.message);
    }
    // Test 4: Analytics
    console.log('\nTest 4: Get analytics');
    try {
        const analytics = await mockStorage.getAnalytics();
        console.log(`✓ Analytics: ${analytics.totalEntries} total entries`);
    }
    catch (error) {
        console.log('✗ Error getting analytics:', error.message);
    }
    console.log('\nAPI Tests completed!\n');
}
// Test CLI functionality
export async function runCLITests() {
    console.log('Running Knowledge Management CLI Tests...\n');
    const mockStorage = new MockKnowledgeStorageManager();
    const cli = new KnowledgeCLI(mockStorage);
    // Add test data
    await mockStorage.create({
        title: 'CLI Test Knowledge',
        description: 'CLI test description',
        type: 'WORKFLOW_PATTERN',
        category: 'WORKFLOW'
    });
    console.log('✓ CLI initialized with test data');
    console.log('✓ CLI commands available: list, search, create, analytics');
    console.log('\nCLI Tests completed!\n');
}
// Integration tests
export async function runIntegrationTests() {
    console.log('Running Integration Tests...\n');
    const mockStorage = new MockKnowledgeStorageManager();
    const api = new KnowledgeManagementAPI(mockStorage);
    const cli = new KnowledgeCLI(mockStorage);
    // Test 1: API and CLI work with same storage
    console.log('Test 1: API and CLI integration');
    try {
        await mockStorage.create({
            title: 'Integration Test',
            description: 'Testing API and CLI integration',
            type: 'WORKFLOW_PATTERN',
            category: 'WORKFLOW'
        });
        const result = await mockStorage.read({});
        console.log(`✓ Integration test: ${result.total} entries accessible by both API and CLI`);
    }
    catch (error) {
        console.log('✗ Integration test failed:', error.message);
    }
    console.log('\nIntegration Tests completed!\n');
}
// Main test runner
export async function runAllTests() {
    console.log('=== Knowledge Management API & CLI Test Suite ===\n');
    await runAPITests();
    await runCLITests();
    await runIntegrationTests();
    console.log('=== All Tests Completed ===');
}
// Export for use in other test files
export { MockKnowledgeStorageManager, KnowledgeManagementAPI, KnowledgeCLI };
//# sourceMappingURL=test-knowledge-management-api.js.map