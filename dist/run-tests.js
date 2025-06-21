#!/usr/bin/env node
"use strict";
/**
 * Test Runner for n8n-ultimate System Integration Tests
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.runTests = runTests;
const test_system_integration_js_1 = require("./test-system-integration.js");
const path = require("path");
async function runTests() {
    console.log('🎯 n8n-ultimate System Integration Test Suite');
    console.log('============================================\n');
    const tester = new test_system_integration_js_1.SystemIntegrationTester();
    try {
        // Run the full test suite
        const results = await tester.runFullTestSuite();
        // Display results
        console.log('\n📊 Test Results Summary:');
        console.log(`✅ Overall Status: ${results.overall.passed ? 'PASSED' : 'FAILED'}`);
        console.log(`📈 Score: ${results.overall.score}%`);
        console.log(`⏱️  Duration: ${results.overall.duration}ms`);
        // Show component details
        console.log('\n🔍 Component Results:');
        Object.entries(results.components).forEach(([name, result]) => {
            const icon = result.passed ? '✅' : '❌';
            console.log(`${icon} ${name}: ${result.passed ? 'PASSED' : 'FAILED'} (${result.duration}ms)`);
            if (result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });
        // Show recommendations
        if (results.recommendations.length > 0) {
            console.log('\n💡 Recommendations:');
            results.recommendations.forEach(rec => console.log(`   • ${rec}`));
        }
        // Save results
        const outputPath = path.join(process.cwd(), 'test-results.json');
        await tester.saveResults(outputPath);
        console.log('\n🎉 Test suite completed!');
        // Exit with appropriate code
        process.exit(results.overall.passed ? 0 : 1);
    }
    catch (error) {
        console.error('❌ Test suite failed with error:', error);
        process.exit(1);
    }
}
// Run tests if this file is executed directly
if (require.main === module) {
    runTests();
}
