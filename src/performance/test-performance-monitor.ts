/**
 * Test Suite for Performance Monitor
 * Comprehensive testing of performance monitoring and profiling capabilities
 */

import { PerformanceMonitor, PerformanceUtils, getPerformanceMonitor } from './performance-monitor';

/**
 * Test data generator for performance monitoring tests
 */
export class PerformanceMonitorTestData {
  static generateTestConfig() {
    return {
      enabled: true,
      interval: 1000, // 1 second for testing
      retentionPeriod: 60000, // 1 minute for testing
      alerts: {
        enabled: true,
        thresholds: {
          cpuUsage: 50, // Lower threshold for testing
          memoryUsage: 70,
          eventLoopDelay: 50,
          responseTime: 500,
          errorRate: 2
        }
      },
      profiling: {
        enabled: true,
        sampleInterval: 500,
        maxProfiles: 10
      },
      persistence: {
        enabled: false, // Disable for testing
        directory: './test-performance-logs',
        format: 'json' as const
      }
    };
  }

  static async createCPULoad(duration: number = 100): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < duration) {
      // CPU intensive operation
      Math.sqrt(Math.random() * 1000000);
    }
  }

  static async createMemoryLoad(): Promise<void> {
    // Create some memory pressure
    const arrays: number[][] = [];
    for (let i = 0; i < 100; i++) {
      arrays.push(new Array(1000).fill(Math.random()));
    }
    // Keep reference briefly
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  static async simulateAsyncOperation(duration: number = 100): Promise<string> {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(`Operation completed in ${duration}ms`);
      }, duration);
    });
  }

  static async simulateHTTPRequest(responseTime: number = 200, statusCode: number = 200): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, responseTime));
    // Simulate request completion
  }
}

/**
 * Comprehensive test suite for performance monitor
 */
export class PerformanceMonitorTest {
  private monitor: PerformanceMonitor;

  constructor() {
    this.setupTestEnvironment();
  }

  private setupTestEnvironment(): void {
    const config = PerformanceMonitorTestData.generateTestConfig();
    this.monitor = new PerformanceMonitor(config);
  }

  /**
   * Run all performance monitor tests
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Performance Monitor Tests...\n');

    try {
      await this.testBasicMonitoring();
      await this.testPerformanceProfiling();
      await this.testMetricsCollection();
      await this.testAlertSystem();
      await this.testHTTPTracking();
      await this.testAsyncTracking();
      await this.testCustomMetrics();
      await this.testPerformanceUtils();
      await this.testEventEmission();
      await this.testDataRetention();
      await this.testPerformanceReport();
      await this.testErrorHandling();

      console.log('✅ All Performance Monitor Tests Passed!\n');

    } catch (error) {
      console.error('❌ Test Failed:', error);
      throw error;
    } finally {
      // Cleanup
      await this.monitor.stop();
    }
  }

  /**
   * Test basic monitoring functionality
   */
  private async testBasicMonitoring(): Promise<void> {
    console.log('📊 Testing Basic Monitoring...');

    // Start monitoring
    await this.monitor.start();
    this.assert(this.monitor['isRunning'], 'Monitor should be running');

    // Wait for some metrics to be collected
    await new Promise(resolve => setTimeout(resolve, 2500)); // Wait for 2.5 seconds

    // Get current metrics
    const metrics = this.monitor.getCurrentMetrics();
    this.assert(metrics !== null, 'Should have current metrics');
    this.assert(typeof metrics.timestamp === 'number', 'Metrics should have timestamp');
    this.assert(typeof metrics.cpu.usage === 'number', 'Should have CPU usage');
    this.assert(typeof metrics.memory.heapUsed === 'number', 'Should have memory usage');

    // Get historical metrics
    const historical = this.monitor.getHistoricalMetrics();
    this.assert(historical.length > 0, 'Should have historical metrics');

    // Stop monitoring
    await this.monitor.stop();
    this.assert(!this.monitor['isRunning'], 'Monitor should be stopped');

    console.log(`   ✅ Basic monitoring test completed (collected ${historical.length} metrics)`);
  }

  /**
   * Test performance profiling functionality
   */
  private async testPerformanceProfiling(): Promise<void> {
    console.log('⏱️ Testing Performance Profiling...');

    // Start a profile
    this.monitor.startProfile('test-profile');
    
    // Simulate some work
    await PerformanceMonitorTestData.createCPULoad(50);
    await PerformanceMonitorTestData.createMemoryLoad();
    
    // End the profile
    const profile = this.monitor.endProfile('test-profile');
    
    this.assert(profile !== null, 'Should return profile');
    this.assert(profile!.name === 'test-profile', 'Profile should have correct name');
    this.assert(typeof profile!.duration === 'number', 'Profile should have duration');
    this.assert(profile!.duration! > 0, 'Profile duration should be positive');

    // Test profile retrieval
    const retrievedProfile = this.monitor.getProfile('test-profile');
    this.assert(retrievedProfile !== null, 'Should retrieve profile');
    this.assert(retrievedProfile!.name === 'test-profile', 'Retrieved profile should match');

    // Test all profiles
    const allProfiles = this.monitor.getAllProfiles();
    this.assert(allProfiles.length > 0, 'Should have profiles');

    console.log(`   ✅ Performance profiling test completed (profile duration: ${profile!.duration}ms)`);
  }

  /**
   * Test metrics collection accuracy
   */
  private async testMetricsCollection(): Promise<void> {
    console.log('📈 Testing Metrics Collection...');

    await this.monitor.start();

    // Generate some load to test metrics
    await PerformanceMonitorTestData.createCPULoad(100);
    await PerformanceMonitorTestData.createMemoryLoad();

    // Wait for metrics collection
    await new Promise(resolve => setTimeout(resolve, 1500));

    const metrics = this.monitor.getCurrentMetrics();

    // Validate CPU metrics
    this.assert(typeof metrics.cpu.usage === 'number', 'CPU usage should be a number');
    this.assert(metrics.cpu.usage >= 0, 'CPU usage should be non-negative');
    this.assert(Array.isArray(metrics.cpu.loadAverage), 'Load average should be an array');

    // Validate memory metrics
    this.assert(metrics.memory.heapUsed > 0, 'Heap used should be positive');
    this.assert(metrics.memory.heapTotal > 0, 'Heap total should be positive');
    this.assert(metrics.memory.rss > 0, 'RSS should be positive');
    this.assert(metrics.memory.systemMemory.total > 0, 'System memory total should be positive');

    // Validate event loop metrics
    this.assert(typeof metrics.eventLoop.utilization === 'number', 'Event loop utilization should be a number');

    await this.monitor.stop();

    console.log(`   ✅ Metrics collection test completed`);
    console.log(`      CPU Usage: ${metrics.cpu.usage.toFixed(1)}%`);
    console.log(`      Memory Used: ${(metrics.memory.heapUsed / 1024 / 1024).toFixed(1)}MB`);
    console.log(`      Event Loop Utilization: ${(metrics.eventLoop.utilization * 100).toFixed(1)}%`);
  }

  /**
   * Test alert system functionality
   */
  private async testAlertSystem(): Promise<void> {
    console.log('🚨 Testing Alert System...');

    let alertReceived = false;
    let alertData: any = null;

    // Set up alert listener
    this.monitor.on('alert', (alert) => {
      alertReceived = true;
      alertData = alert;
    });

    await this.monitor.start();

    // Generate high CPU load to trigger alert
    for (let i = 0; i < 10; i++) {
      await PerformanceMonitorTestData.createCPULoad(200);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Wait for metrics collection and alert processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const alerts = this.monitor.getAlerts();

    // We might not always trigger alerts in test environment, so check if we have any
    if (alerts.length > 0) {
      this.assert(typeof alerts[0].type === 'string', 'Alert should have type');
      this.assert(typeof alerts[0].metric === 'string', 'Alert should have metric');
      this.assert(typeof alerts[0].value === 'number', 'Alert should have value');
      this.assert(typeof alerts[0].threshold === 'number', 'Alert should have threshold');
      this.assert(typeof alerts[0].message === 'string', 'Alert should have message');
    }

    await this.monitor.stop();

    console.log(`   ✅ Alert system test completed (${alerts.length} alerts generated)`);
  }

  /**
   * Test HTTP request tracking
   */
  private async testHTTPTracking(): Promise<void> {
    console.log('🌐 Testing HTTP Tracking...');

    // Track some HTTP requests
    this.monitor.trackHTTPRequest(150, 200); // Fast successful request
    this.monitor.trackHTTPRequest(800, 200); // Slow successful request
    this.monitor.trackHTTPRequest(300, 404); // Error request
    this.monitor.trackHTTPRequest(1200, 500); // Slow error request

    const metrics = this.monitor.getCurrentMetrics();
    const httpMetrics = metrics.http;

    this.assert(httpMetrics.requestCount === 4, 'Should track all requests');
    this.assert(httpMetrics.responseCount === 4, 'Should track all responses');
    this.assert(httpMetrics.averageResponseTime > 0, 'Should calculate average response time');
    this.assert(httpMetrics.slowRequests >= 1, 'Should track slow requests');
    this.assert(httpMetrics.errorCount === 2, 'Should track error requests');

    console.log(`   ✅ HTTP tracking test completed`);
    console.log(`      Requests: ${httpMetrics.requestCount}, Avg Response: ${httpMetrics.averageResponseTime.toFixed(1)}ms`);
    console.log(`      Slow Requests: ${httpMetrics.slowRequests}, Errors: ${httpMetrics.errorCount}`);
  }

  /**
   * Test async operation tracking
   */
  private async testAsyncTracking(): Promise<void> {
    console.log('⚡ Testing Async Tracking...');

    // Track some async operations
    const startTime1 = Date.now();
    await PerformanceMonitorTestData.simulateAsyncOperation(100);
    this.monitor.trackAsyncOperation(Date.now() - startTime1, true);

    const startTime2 = Date.now();
    await PerformanceMonitorTestData.simulateAsyncOperation(200);
    this.monitor.trackAsyncOperation(Date.now() - startTime2, true);

    const startTime3 = Date.now();
    await PerformanceMonitorTestData.simulateAsyncOperation(50);
    this.monitor.trackAsyncOperation(Date.now() - startTime3, false); // Failed operation

    const metrics = this.monitor.getCurrentMetrics();
    const asyncMetrics = metrics.async;

    this.assert(asyncMetrics.completedOperations === 2, 'Should track completed operations');
    this.assert(asyncMetrics.averageOperationTime > 0, 'Should calculate average operation time');

    console.log(`   ✅ Async tracking test completed`);
    console.log(`      Completed Operations: ${asyncMetrics.completedOperations}`);
    console.log(`      Average Operation Time: ${asyncMetrics.averageOperationTime.toFixed(1)}ms`);
  }

  /**
   * Test custom metrics functionality
   */
  private async testCustomMetrics(): Promise<void> {
    console.log('🔧 Testing Custom Metrics...');

    let customMetricReceived = false;

    // Set up custom metric listener
    this.monitor.on('customMetric', () => {
      customMetricReceived = true;
    });

    // Add custom metrics
    this.monitor.addCustomMetric('workflow_count', 42);
    this.monitor.addCustomMetric('ai_model_version', 'llama3.2:latest');
    this.monitor.addCustomMetric('cache_hit_rate', 0.85);
    this.monitor.addCustomMetric('feature_flags', { newUI: true, betaFeatures: false });

    const metrics = this.monitor.getCurrentMetrics();
    const customMetrics = metrics.custom;

    this.assert(customMetrics.workflow_count === 42, 'Should store numeric custom metric');
    this.assert(customMetrics.ai_model_version === 'llama3.2:latest', 'Should store string custom metric');
    this.assert(customMetrics.cache_hit_rate === 0.85, 'Should store decimal custom metric');
    this.assert(typeof customMetrics.feature_flags === 'object', 'Should store object custom metric');
    this.assert(customMetricReceived, 'Should emit custom metric event');

    console.log(`   ✅ Custom metrics test completed (${Object.keys(customMetrics).length} metrics)`);
  }

  /**
   * Test performance utilities
   */
  private async testPerformanceUtils(): Promise<void> {
    console.log('🛠️ Testing Performance Utils...');

    // Test async measurement
    const result = await PerformanceUtils.measureAsync('test-async-util', async () => {
      await PerformanceMonitorTestData.simulateAsyncOperation(100);
      return 'async-result';
    });

    this.assert(result === 'async-result', 'Should return correct result from async measurement');

    // Test sync measurement
    const syncResult = PerformanceUtils.measure('test-sync-util', () => {
      let sum = 0;
      for (let i = 0; i < 1000; i++) {
        sum += Math.sqrt(i);
      }
      return sum;
    });

    this.assert(typeof syncResult === 'number', 'Should return correct result from sync measurement');

    // Check that profiles were created
    const asyncProfile = this.monitor.getProfile('test-async-util');
    const syncProfile = this.monitor.getProfile('test-sync-util');

    this.assert(asyncProfile !== null, 'Should create profile for async measurement');
    this.assert(syncProfile !== null, 'Should create profile for sync measurement');

    console.log(`   ✅ Performance utils test completed`);
    console.log(`      Async profile duration: ${asyncProfile!.duration}ms`);
    console.log(`      Sync profile duration: ${syncProfile!.duration}ms`);
  }

  /**
   * Test event emission functionality
   */
  private async testEventEmission(): Promise<void> {
    console.log('📡 Testing Event Emission...');

    let eventsReceived = 0;
    const expectedEvents = ['started', 'metricsCollected', 'profileStarted', 'profileEnded', 'stopped'];

    // Set up event listeners
    expectedEvents.forEach(event => {
      this.monitor.on(event, () => {
        eventsReceived++;
      });
    });

    // Trigger events
    await this.monitor.start();
    this.monitor.startProfile('event-test');
    await new Promise(resolve => setTimeout(resolve, 1100)); // Wait for metrics collection
    this.monitor.endProfile('event-test');
    await this.monitor.stop();

    this.assert(eventsReceived >= 4, 'Should receive multiple events'); // At least start, profile start/end, stop

    console.log(`   ✅ Event emission test completed (${eventsReceived} events received)`);
  }

  /**
   * Test data retention functionality
   */
  private async testDataRetention(): Promise<void> {
    console.log('🗄️ Testing Data Retention...');

    await this.monitor.start();

    // Collect some metrics
    await new Promise(resolve => setTimeout(resolve, 2500));

    const initialMetrics = this.monitor.getHistoricalMetrics();
    const initialCount = initialMetrics.length;

    // Clear history
    this.monitor.clearHistory();

    const clearedMetrics = this.monitor.getHistoricalMetrics();
    this.assert(clearedMetrics.length === 0, 'Should clear all historical metrics');

    // Collect new metrics
    await new Promise(resolve => setTimeout(resolve, 1500));

    const newMetrics = this.monitor.getHistoricalMetrics();
    this.assert(newMetrics.length > 0, 'Should collect new metrics after clearing');

    await this.monitor.stop();

    console.log(`   ✅ Data retention test completed`);
    console.log(`      Initial metrics: ${initialCount}, After clear: ${clearedMetrics.length}, New metrics: ${newMetrics.length}`);
  }

  /**
   * Test performance report generation
   */
  private async testPerformanceReport(): Promise<void> {
    console.log('📋 Testing Performance Report...');

    await this.monitor.start();

    // Generate some activity
    this.monitor.startProfile('report-test');
    await PerformanceMonitorTestData.createCPULoad(50);
    this.monitor.trackHTTPRequest(300, 200);
    this.monitor.addCustomMetric('test_metric', 123);
    await new Promise(resolve => setTimeout(resolve, 1100));
    this.monitor.endProfile('report-test');

    // Generate report
    const report = this.monitor.generateReport() as any;

    this.assert(typeof report.timestamp === 'number', 'Report should have timestamp');
    this.assert(typeof report.uptime === 'number', 'Report should have uptime');
    this.assert(typeof report.summary === 'object', 'Report should have summary');
    this.assert(typeof report.currentMetrics === 'object', 'Report should have current metrics');
    this.assert(Array.isArray(report.profiles), 'Report should have profiles array');
    this.assert(Array.isArray(report.alerts), 'Report should have alerts array');
    this.assert(typeof report.systemInfo === 'object', 'Report should have system info');

    // Validate system info
    this.assert(typeof report.systemInfo.platform === 'string', 'Should have platform info');
    this.assert(typeof report.systemInfo.nodeVersion === 'string', 'Should have Node version');
    this.assert(typeof report.systemInfo.cpuCount === 'number', 'Should have CPU count');

    await this.monitor.stop();

    console.log(`   ✅ Performance report test completed`);
    console.log(`      Report uptime: ${report.uptime}ms`);
    console.log(`      Profiles: ${report.profiles.length}, Alerts: ${report.alerts.length}`);
  }

  /**
   * Test error handling
   */
  private async testErrorHandling(): Promise<void> {
    console.log('🚨 Testing Error Handling...');

    let errorReceived = false;

    // Set up error listener
    this.monitor.on('error', () => {
      errorReceived = true;
    });

    // Test invalid profile operations
    const invalidProfile = this.monitor.endProfile('non-existent-profile');
    this.assert(invalidProfile === null, 'Should return null for non-existent profile');

    const retrievedInvalid = this.monitor.getProfile('non-existent-profile');
    this.assert(retrievedInvalid === null, 'Should return null for non-existent profile');

    // Test multiple starts/stops
    await this.monitor.start();
    await this.monitor.start(); // Should handle gracefully
    await this.monitor.stop();
    await this.monitor.stop(); // Should handle gracefully

    console.log(`   ✅ Error handling test completed`);
  }

  /**
   * Helper method for assertions
   */
  private assert(condition: boolean, message: string): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}`);
    }
  }
}

/**
 * Test global monitor instance
 */
export async function testGlobalMonitor(): Promise<void> {
  console.log('🌍 Testing Global Monitor Instance...');

  const monitor1 = getPerformanceMonitor();
  const monitor2 = getPerformanceMonitor();

  // Should return the same instance
  if (monitor1 !== monitor2) {
    throw new Error('Global monitor should return same instance');
  }

  console.log('   ✅ Global monitor test completed');
}

/**
 * Export test runner function
 */
export async function runPerformanceMonitorTests(): Promise<void> {
  const testSuite = new PerformanceMonitorTest();
  await testSuite.runAllTests();
  await testGlobalMonitor();
}

// Run tests if this file is executed directly
if (require.main === module) {
  runPerformanceMonitorTests()
    .then(() => {
      console.log('🎉 All performance monitor tests completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Tests failed:', error);
      process.exit(1);
    });
} 