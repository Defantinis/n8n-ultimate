#!/usr/bin/env node

/**
 * n8n Workflow Testing CLI
 * 
 * This CLI tool helps with manual testing of n8n workflows and collecting structured feedback
 * for continuous improvement of our workflow generation system.
 */

import { RealWorldTestingFramework } from './real-world-testing-framework.js';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as readline from 'readline';

interface CLIOptions {
    action: 'create-test' | 'submit-feedback' | 'generate-report' | 'list-tests' | 'generate-protocol';
    workflowPath?: string;
    testId?: string;
    workflowType?: string;
}

class WorkflowTestingCLI {
    private framework: RealWorldTestingFramework;
    private rl: readline.Interface;

    constructor(projectRoot: string) {
        this.framework = new RealWorldTestingFramework(projectRoot);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    public async run(): Promise<void> {
        console.log('🧪 n8n Workflow Testing CLI');
        console.log('============================\n');

        const action = await this.promptAction();
        
        switch (action) {
            case 'create-test':
                await this.createTestCase();
                break;
            case 'submit-feedback':
                await this.submitFeedback();
                break;
            case 'generate-report':
                await this.generateReport();
                break;
            case 'list-tests':
                await this.listTests();
                break;
            case 'generate-protocol':
                await this.generateProtocol();
                break;
        }

        this.rl.close();
    }

    private async promptAction(): Promise<string> {
        return new Promise((resolve) => {
            console.log('What would you like to do?');
            console.log('1. Create new test case');
            console.log('2. Submit feedback for existing test');
            console.log('3. Generate testing report');
            console.log('4. List all test cases');
            console.log('5. Generate testing protocol');
            
            this.rl.question('Choose an option (1-5): ', (answer) => {
                const actions = ['create-test', 'submit-feedback', 'generate-report', 'list-tests', 'generate-protocol'];
                const index = parseInt(answer) - 1;
                resolve(actions[index] || 'list-tests');
            });
        });
    }

    private async createTestCase(): Promise<void> {
        console.log('\n📝 Creating New Test Case');
        console.log('=========================\n');

        const name = await this.prompt('Test case name: ');
        const workflowPath = await this.prompt('Workflow file path (relative to project root): ');
        const description = await this.prompt('Description: ');
        
        console.log('\nWorkflow types:');
        console.log('1. scraper');
        console.log('2. api');
        console.log('3. data-processing');
        console.log('4. automation');
        
        const typeChoice = await this.prompt('Choose workflow type (1-4): ');
        const types = ['scraper', 'api', 'data-processing', 'automation'];
        const workflowType = types[parseInt(typeChoice) - 1] || 'scraper';

                 try {
             const testId = await this.framework.createTestCase({
                 name,
                 workflowPath,
                 workflowType: workflowType as any,
                 description,
                 expectedOutcome: 'Workflow should execute successfully without manual intervention',
                 testingNotes: 'Initial test case - to be updated after testing',
                 status: 'pending'
             });

            console.log(`\n✅ Test case created successfully!`);
            console.log(`Test ID: ${testId}`);
            console.log(`\nNext steps:`);
            console.log(`1. Import the workflow into n8n: ${workflowPath}`);
            console.log(`2. Test the workflow manually`);
            console.log(`3. Run this CLI again to submit feedback`);
            
        } catch (error) {
            console.error('❌ Error creating test case:', error);
        }
    }

    private async submitFeedback(): Promise<void> {
        console.log('\n📝 Submit Testing Feedback');
        console.log('==========================\n');

        const testCases = this.framework.getTestCases();
        if (testCases.length === 0) {
            console.log('No test cases found. Create a test case first.');
            return;
        }

        console.log('Available test cases:');
        testCases.forEach((tc, index) => {
            console.log(`${index + 1}. ${tc.name} (${tc.id}) - Status: ${tc.status}`);
        });

        const choice = await this.prompt('Choose test case (number): ');
        const testCase = testCases[parseInt(choice) - 1];
        
        if (!testCase) {
            console.log('Invalid test case selection.');
            return;
        }

        console.log(`\nSubmitting feedback for: ${testCase.name}`);
        
        const tester = await this.prompt('Your name: ');
        const notes = await this.prompt('Overall testing notes: ');
        
        console.log('\nDeployment readiness (1-5):');
        console.log('1 = Major work needed');
        console.log('2 = Significant issues');
        console.log('3 = Some manual work required');
        console.log('4 = Minor adjustments needed');
        console.log('5 = Copy-paste ready');
        
        const readinessInput = await this.prompt('Deployment readiness: ');
        const deploymentReadiness = parseInt(readinessInput) as 1 | 2 | 3 | 4 | 5;

        // Collect manual steps
        const manualSteps = [];
        console.log('\n📋 Manual Steps Required');
        console.log('========================');
        console.log('Enter manual steps (press Enter with empty input to finish):');
        
        while (true) {
            const step = await this.prompt('Manual step (or Enter to finish): ');
            if (!step.trim()) break;
            
            console.log('Categories: 1=credentials, 2=configuration, 3=connections, 4=parameters');
            const categoryChoice = await this.prompt('Category (1-4): ');
            const categories = ['credentials', 'configuration', 'connections', 'parameters'];
            const category = categories[parseInt(categoryChoice) - 1] || 'configuration';
            
            console.log('Difficulty: 1=easy, 2=medium, 3=hard');
            const difficultyChoice = await this.prompt('Difficulty (1-3): ');
            const difficulties = ['easy', 'medium', 'hard'];
            const difficulty = difficulties[parseInt(difficultyChoice) - 1] || 'medium';
            
                         const canAutomate = await this.prompt('Can this be automated? (y/n): ');
             const timeRequired = await this.prompt('Time required (minutes): ');
             
             manualSteps.push({
                 step,
                 category: category as any,
                 difficulty: difficulty as any,
                 timeRequired: parseInt(timeRequired) || 5,
                 canBeAutomated: canAutomate.toLowerCase() === 'y'
             });
        }

        // Collect issues
        const issues = [];
        console.log('\n⚠️ Issues Encountered');
        console.log('====================');
        console.log('Enter issues (press Enter with empty input to finish):');
        
        while (true) {
            const description = await this.prompt('Issue description (or Enter to finish): ');
            if (!description.trim()) break;
            
            console.log('Types: 1=error, 2=warning, 3=usability');
            const typeChoice = await this.prompt('Issue type (1-3): ');
            const types = ['error', 'warning', 'usability'];
            const type = types[parseInt(typeChoice) - 1] || 'warning';
            
            console.log('Severity: 1=low, 2=medium, 3=high, 4=critical');
            const severityChoice = await this.prompt('Severity (1-4): ');
            const severities = ['low', 'medium', 'high', 'critical'];
            const severity = severities[parseInt(severityChoice) - 1] || 'medium';
            
            const workaround = await this.prompt('Workaround (optional): ');
            
            issues.push({
                type: type as any,
                severity: severity as any,
                description,
                workaround: workaround || undefined
            });
        }

                 try {
             await this.framework.submitFeedback({
                 testCaseId: testCase.id,
                 tester,
                 manualStepsRequired: manualSteps,
                 issues,
                 performance: {
                     nodeCount: 0, // Will be updated with actual values
                     connectionCount: 0,
                     complexity: 'medium'
                 },
                 deploymentReadiness,
                 notes,
                 suggestedImprovements: []
             });

            console.log('\n✅ Feedback submitted successfully!');
            console.log('Thank you for helping improve our workflow generation system.');
            
        } catch (error) {
            console.error('❌ Error submitting feedback:', error);
        }
    }

    private async generateReport(): Promise<void> {
        console.log('\n📊 Testing Report');
        console.log('=================\n');

        const report = this.framework.generateTestingReport();
        
        console.log('📈 Summary:');
        console.log(`  Total Tests: ${report.summary.totalTests}`);
        console.log(`  Passed Tests: ${report.summary.passedTests}`);
        console.log(`  Success Rate: ${report.summary.successRate.toFixed(1)}%`);
        console.log(`  Total Feedback: ${report.totalFeedback}`);

        // Save detailed report
        const reportPath = path.join(process.cwd(), '.taskmaster', 'testing', 'latest-report.json');
        await fs.mkdir(path.dirname(reportPath), { recursive: true });
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        console.log(`\n📄 Detailed report saved to: ${reportPath}`);
    }

    private async listTests(): Promise<void> {
        console.log('\n📋 Test Cases');
        console.log('=============\n');

        const testCases = this.framework.getTestCases();
        
        if (testCases.length === 0) {
            console.log('No test cases found.');
            return;
        }

        testCases.forEach((tc) => {
            console.log(`🧪 ${tc.name} (${tc.id})`);
            console.log(`   Type: ${tc.workflowType}`);
            console.log(`   Status: ${tc.status}`);
            console.log(`   Path: ${tc.workflowPath}`);
            console.log(`   Created: ${tc.createdAt.toLocaleDateString()}`);
            console.log(`   Description: ${tc.description}`);
            console.log('');
        });
    }

    private async generateProtocol(): Promise<void> {
        console.log('\n📋 Generate Testing Protocol');
        console.log('============================\n');

        console.log('Workflow types:');
        console.log('1. scraper');
        console.log('2. api');
        console.log('3. data-processing');
        console.log('4. automation');
        
        const typeChoice = await this.prompt('Choose workflow type (1-4): ');
        const types = ['scraper', 'api', 'data-processing', 'automation'];
        const workflowType = types[parseInt(typeChoice) - 1] || 'scraper';

        // For now, generate a basic protocol since we don't have the full framework
        const protocol = this.generateBasicProtocol(workflowType);
        
        const protocolPath = path.join(process.cwd(), '.taskmaster', 'testing', `${workflowType}-protocol.md`);
        await fs.mkdir(path.dirname(protocolPath), { recursive: true });
        await fs.writeFile(protocolPath, protocol);
        
        console.log(`\n📄 Testing protocol generated: ${protocolPath}`);
        console.log('\nProtocol preview:');
        console.log('================');
        console.log(protocol.substring(0, 500) + '...');
    }

    private generateBasicProtocol(workflowType: string): string {
        return `# Testing Protocol for ${workflowType} Workflows

## Pre-Testing Checklist
- [ ] Workflow JSON is valid
- [ ] All required nodes are available in n8n
- [ ] Test environment is prepared
- [ ] Required credentials are available

## Testing Steps

### 1. Import Workflow
- [ ] Open n8n interface
- [ ] Import workflow JSON
- [ ] Verify all nodes loaded correctly

### 2. Configure Workflow
- [ ] Set up credentials
- [ ] Configure node parameters
- [ ] Test connections between nodes

### 3. Execute Tests
- [ ] Test individual nodes
- [ ] Execute full workflow
- [ ] Validate output
- [ ] Check error handling

### 4. Document Results
- [ ] Note any manual configuration steps
- [ ] Document issues encountered
- [ ] Record performance observations
- [ ] Submit feedback using CLI tool

## Common ${workflowType} Workflow Issues to Check
- Authentication and credential setup
- API rate limiting and timeouts
- Data format validation
- Error handling and retry logic
- Output data structure

## Success Criteria
- [ ] Workflow executes without errors
- [ ] Output matches expected format
- [ ] All manual steps are documented
- [ ] Performance is acceptable
- [ ] Ready for production use
`;
    }

    private async prompt(question: string): Promise<string> {
        return new Promise((resolve) => {
            this.rl.question(question, resolve);
        });
    }
}

// CLI Entry Point
async function main() {
    const args = process.argv.slice(2);
    const projectRoot = process.cwd();
    
    const cli = new WorkflowTestingCLI(projectRoot);
    
    try {
        await cli.run();
    } catch (error) {
        console.error('❌ CLI Error:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    main();
} 