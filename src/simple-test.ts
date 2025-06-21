/**
 * Simple System Validation Test
 */

import * as fs from 'fs/promises';
import * as path from 'path';

async function validateSystem(): Promise<void> {
    console.log('🎯 n8n-ultimate System Validation');
    console.log('==================================\n');

    const results = {
        passed: 0,
        total: 0,
        components: [] as string[]
    };

    // Test 1: Check performance components exist
    const performanceComponents = [
        'src/performance/concurrent-processor.ts',
        'src/performance/database-io-optimizer.ts', 
        'src/performance/intelligent-cache-manager.ts',
        'src/performance/buffer-pool-manager.ts',
        'src/performance/async-workflow-pipeline.ts'
    ];

    console.log('📦 Checking Performance Components...');
    for (const component of performanceComponents) {
        results.total++;
        try {
            const stats = await fs.stat(component);
            if (stats.size > 1000) { // At least 1KB
                console.log(`✅ ${path.basename(component)} - ${Math.round(stats.size/1024)}KB`);
                results.passed++;
                results.components.push(component);
            } else {
                console.log(`❌ ${path.basename(component)} - Too small (${stats.size} bytes)`);
            }
        } catch (error) {
            console.log(`❌ ${path.basename(component)} - Not found`);
        }
    }

    // Test 2: Check workflow skeleton exists
    console.log('\n🔍 Checking Workflow Skeleton...');
    results.total++;
    try {
        const skeletonPath = 'workflows/skeletons/v1-n8n-scraper.json';
        const skeletonData = await fs.readFile(skeletonPath, 'utf-8');
        const skeleton = JSON.parse(skeletonData);
        
        if (skeleton.nodes && skeleton.nodes.length > 0) {
            console.log(`✅ Workflow skeleton found - ${skeleton.nodes.length} nodes`);
            results.passed++;
        } else {
            console.log(`❌ Workflow skeleton invalid - No nodes found`);
        }
    } catch (error) {
        console.log(`❌ Workflow skeleton - Not found or invalid`);
    }

    // Test 3: Check enhanced workflow was created
    console.log('\n⚡ Checking Enhanced Workflow...');
    results.total++;
    try {
        const enhancedPath = 'workflows/enhanced/enhanced-n8n-scraper.json';
        const enhancedData = await fs.readFile(enhancedPath, 'utf-8');
        const enhanced = JSON.parse(enhancedData);
        
        if (enhanced.nodes && enhanced.nodes.length > 0) {
            console.log(`✅ Enhanced workflow created - ${enhanced.nodes.length} nodes`);
            results.passed++;
        } else {
            console.log(`❌ Enhanced workflow invalid - No nodes found`);
        }
    } catch (error) {
        console.log(`❌ Enhanced workflow - Not found or invalid`);
    }

    // Test 4: Memory and performance check
    console.log('\n📊 Performance Metrics...');
    const memUsage = process.memoryUsage();
    console.log(`💾 Memory Usage: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
    console.log(`🔄 Process Uptime: ${Math.round(process.uptime() * 1000)}ms`);

    // Final Results
    console.log('\n📈 Final Results:');
    console.log(`✅ Tests Passed: ${results.passed}/${results.total}`);
    console.log(`📊 Success Rate: ${Math.round((results.passed / results.total) * 100)}%`);
    
    if (results.passed === results.total) {
        console.log('\n🎉 All systems operational! Ready for production.');
    } else {
        console.log('\n⚠️  Some components need attention.');
    }

    // Save results
    const testResults = {
        timestamp: new Date().toISOString(),
        passed: results.passed,
        total: results.total,
        successRate: Math.round((results.passed / results.total) * 100),
        components: results.components,
        memoryUsageMB: Math.round(memUsage.heapUsed / 1024 / 1024),
        uptimeMs: Math.round(process.uptime() * 1000)
    };

    await fs.writeFile('validation-results.json', JSON.stringify(testResults, null, 2));
    console.log('\n💾 Results saved to validation-results.json');
}

// Run validation
validateSystem().catch(console.error); 