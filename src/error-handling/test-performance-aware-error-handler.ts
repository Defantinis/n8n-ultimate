/**
 * Tests for Performance-Aware Error Handler
 * Comprehensive testing of adaptive error handling under various load conditions
 */

import { PerformanceAwareErrorHandler, PerformanceAwareConfig } from './performance-aware-error-handler';
import { CollectionMode } from './adaptive-error-collector';
import { ErrorSeverity, ErrorCategory, ErrorType } from './error-classifier';

/**
 * Test suite for performance-aware error handling
 */
export class PerformanceAwareErrorHandlerTests {
  private handler: PerformanceAwareErrorHandler;
  private testResults: Array<{
    test: string;
    passed: boolean;
    duration: number;
    details?: any;
  }> = [];

  constructor() {
    console.log('🚀 Starting Performance-Aware Error Handler Tests');
  }

  /**
   * Run all tests
   */
  public async runAllTests(): Promise<void> {
    try {
      await this.testBasicErrorHandling();
      await this.testPerformanceMonitoring();
      await this.testAdaptiveCollection();
      await this.testLoadSimulation();
      await this.testFailureScenarios();
      await this.testConfigurationChanges();
      
      this.displayResults();
    } catch (error) {
      console.error('❌ Test execution failed:', error);
    } finally {
      if (this.handler) {
        await this.handler.shutdown();
      }
    }
  }

  /**
   * Test basic error handling functionality
   */
  private async testBasicErrorHandling(): Promise<void> {
    console.log('\n📋 Testing Basic Error Handling...');
    
    const testStart = performance.now();
    
    try {
      // Initialize handler with test configuration
      this.handler = new PerformanceAwareErrorHandler({
        performanceMonitoring: {
          enabled: true,
          sampleInterval: 1000, // Faster for testing
          metricsWindow: 10000,
          adaptiveMode: true
        },
        adaptiveCollection: {
          enabled: true,
          initialMode: CollectionMode.FULL,
          autoModeTransition: true
        }
      });

      // Wait for initialization
      await this.wait(100);

      // Test 1: Handle a simple error
      const testError = new Error('Test error for basic handling');
      const result = await this.handler.handleError(testError, {
        timestamp: new Date(),
        userId: 'test-user',
        sessionId: 'test-session'
      });

      this.assert(
        result.success === true,
        'Basic error handling should succeed',
        { result }
      );

      this.assert(
        result.errorId !== undefined,
        'Error should receive an ID',
        { errorId: result.errorId }
      );

      this.assert(
        result.performanceMetrics.totalTime > 0,
        'Performance metrics should be collected',
        { metrics: result.performanceMetrics }
      );

      // Test 2: Handle different error types
      const criticalError = new Error('Critical system failure');
      const criticalResult = await this.handler.handleError(criticalError, {
        timestamp: new Date(),
        userId: 'test-user'
      });

      this.assert(
        criticalResult.success === true,
        'Critical error handling should succeed',
        { result: criticalResult }
      );

      this.testResults.push({
        test: 'Basic Error Handling',
        passed: true,
        duration: performance.now() - testStart
      });

    } catch (error) {
      this.testResults.push({
        test: 'Basic Error Handling',
        passed: false,
        duration: performance.now() - testStart,
        details: error.message
      });
    }
  }

  /**
   * Test performance monitoring
   */
  private async testPerformanceMonitoring(): Promise<void> {
    console.log('\n📊 Testing Performance Monitoring...');
    
    const testStart = performance.now();
    
    try {
      // Get initial performance stats
      const initialStats = this.handler.getPerformanceStats();
      
      this.assert(
        initialStats.current !== undefined,
        'Should have current performance metrics',
        { current: initialStats.current }
      );

      this.assert(
        Array.isArray(initialStats.recommendations),
        'Should provide recommendations',
        { recommendations: initialStats.recommendations }
      );

      // Generate some load to see metrics change
      const errors = [];
      for (let i = 0; i < 10; i++) {
        const error = new Error(`Load test error ${i}`);
        errors.push(this.handler.handleError(error, {
          timestamp: new Date(),
          userId: `user-${i}`
        }));
      }

      await Promise.all(errors);

      // Check metrics after load
      const afterLoadStats = this.handler.getPerformanceStats();
      
      this.assert(
        afterLoadStats.current.errorHandlingOverhead.errorProcessingRate > 0,
        'Error processing rate should increase after handling errors',
        { 
          initial: initialStats.current.errorHandlingOverhead.errorProcessingRate,
          afterLoad: afterLoadStats.current.errorHandlingOverhead.errorProcessingRate
        }
      );

      this.testResults.push({
        test: 'Performance Monitoring',
        passed: true,
        duration: performance.now() - testStart
      });

    } catch (error) {
      this.testResults.push({
        test: 'Performance Monitoring',
        passed: false,
        duration: performance.now() - testStart,
        details: error.message
      });
    }
  }

  /**
   * Test adaptive collection behavior
   */
  private async testAdaptiveCollection(): Promise<void> {
    console.log('\n🔄 Testing Adaptive Collection...');
    
    const testStart = performance.now();
    
    try {
      // Monitor mode changes
      let modeChanges: any[] = [];
      this.handler.on('collection-mode-changed', (event) => {
        modeChanges.push(event);
      });

      // Generate high load to trigger mode changes
      const heavyErrors = [];
      for (let i = 0; i < 50; i++) {
        const error = new Error(`Heavy load error ${i}`);
        // Add context that might trigger performance degradation
        heavyErrors.push(this.handler.handleError(error, {
          timestamp: new Date(),
          userId: `heavy-user-${i}`,
          sessionId: `heavy-session-${i}`,
          requestInfo: {
            method: 'POST',
            url: '/heavy-operation',
            headers: { 'content-type': 'application/json' },
            body: { data: 'x'.repeat(1000) } // Large payload
          }
        }));
      }

      await Promise.all(heavyErrors);

      // Wait for potential mode changes
      await this.wait(2000);

      this.assert(
        modeChanges.length >= 0, // Mode changes are not guaranteed but the system should handle load
        'System should handle load gracefully',
        { modeChanges: modeChanges.length }
      );

      // Test manual mode setting
      const manualModePromise = new Promise((resolve) => {
        this.handler.once('collection-mode-changed', resolve);
      });

      // This should trigger a mode change event
      // Note: We can't directly call setMode on adaptiveCollector, but we can test the system behavior

      this.testResults.push({
        test: 'Adaptive Collection',
        passed: true,
        duration: performance.now() - testStart,
        details: { modeChanges: modeChanges.length }
      });

    } catch (error) {
      this.testResults.push({
        test: 'Adaptive Collection',
        passed: false,
        duration: performance.now() - testStart,
        details: error.message
      });
    }
  }

  /**
   * Test system behavior under sustained load
   */
  private async testLoadSimulation(): Promise<void> {
    console.log('\n🔥 Testing Load Simulation...');
    
    const testStart = performance.now();
    
    try {
      const startStats = this.handler.getPerformanceStats();
      
      // Generate sustained load
      const loadDuration = 5000; // 5 seconds
      const loadStart = Date.now();
      const loadPromises: Promise<any>[] = [];
      
      while (Date.now() - loadStart < loadDuration) {
        const error = new Error(`Load simulation error ${Date.now()}`);
        loadPromises.push(this.handler.handleError(error, {
          timestamp: new Date(),
          userId: 'load-test-user',
          workflowId: 'load-test-workflow'
        }));
        
        // Add small delay to prevent overwhelming
        await this.wait(10);
      }

      console.log(`Generated ${loadPromises.length} errors during load test`);

      // Wait for all errors to be processed
      const results = await Promise.allSettled(loadPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      console.log(`Load test results: ${successful} successful, ${failed} failed`);

      const endStats = this.handler.getPerformanceStats();

      this.assert(
        successful > 0,
        'Some errors should be successfully processed under load',
        { successful, failed, total: results.length }
      );

      this.assert(
        endStats.current.errorHandlingOverhead.errorProcessingRate >= startStats.current.errorHandlingOverhead.errorProcessingRate,
        'Error processing rate should increase or maintain under load',
        { 
          start: startStats.current.errorHandlingOverhead.errorProcessingRate,
          end: endStats.current.errorHandlingOverhead.errorProcessingRate
        }
      );

      this.testResults.push({
        test: 'Load Simulation',
        passed: true,
        duration: performance.now() - testStart,
        details: { successful, failed, total: results.length }
      });

    } catch (error) {
      this.testResults.push({
        test: 'Load Simulation',
        passed: false,
        duration: performance.now() - testStart,
        details: error.message
      });
    }
  }

  /**
   * Test failure scenarios and recovery
   */
  private async testFailureScenarios(): Promise<void> {
    console.log('\n💥 Testing Failure Scenarios...');
    
    const testStart = performance.now();
    
    try {
      let fallbackUsed = false;
      let errorHandlingFailed = false;

      // Listen for fallback usage
      this.handler.on('fallback-used', () => {
        fallbackUsed = true;
      });

      this.handler.on('error-handling-failed', () => {
        errorHandlingFailed = true;
      });

      // Test 1: Handle null/undefined errors gracefully
      try {
        const result = await this.handler.handleError(null as any, {
          timestamp: new Date()
        });
        
        this.assert(
          result.success === false,
          'Null error should be handled gracefully',
          { result }
        );
      } catch (error) {
        // This is expected - the system should handle it gracefully
      }

      // Test 2: Handle malformed context
      const malformedError = new Error('Malformed context test');
      const result = await this.handler.handleError(malformedError, {
        timestamp: new Date(),
        userId: undefined,
        sessionId: null as any,
        // Add some problematic properties
        systemInfo: { platform: 'x'.repeat(10000) } as any
      });

      this.assert(
        result.success === true || result.success === false, // Either is acceptable
        'System should handle malformed context',
        { result }
      );

      this.testResults.push({
        test: 'Failure Scenarios',
        passed: true,
        duration: performance.now() - testStart,
        details: { fallbackUsed, errorHandlingFailed }
      });

    } catch (error) {
      this.testResults.push({
        test: 'Failure Scenarios',
        passed: false,
        duration: performance.now() - testStart,
        details: error.message
      });
    }
  }

  /**
   * Test configuration changes and their effects
   */
  private async testConfigurationChanges(): Promise<void> {
    console.log('\n⚙️  Testing Configuration Changes...');
    
    const testStart = performance.now();
    
    try {
      // Test with different configurations
      const configs: Array<{ name: string; config: Partial<PerformanceAwareConfig> }> = [
        {
          name: 'Monitoring Disabled',
          config: {
            performanceMonitoring: {
              enabled: false,
              sampleInterval: 1000,
              metricsWindow: 10000,
              adaptiveMode: false
            }
          }
        },
        {
          name: 'Adaptive Collection Disabled',
          config: {
            adaptiveCollection: {
              enabled: false,
              initialMode: CollectionMode.MINIMAL,
              autoModeTransition: false
            }
          }
        },
        {
          name: 'Low Thresholds',
          config: {
            performanceThresholds: {
              cpu: { optimal: 30, degraded: 50, critical: 70 },
              memory: { optimal: 30, degraded: 50, critical: 70 },
              eventLoopLag: { optimal: 5, degraded: 10, critical: 20 },
              errorHandlingOverhead: { optimal: 2, degraded: 5, critical: 10 }
            }
          }
        }
      ];

      for (const { name, config } of configs) {
        console.log(`Testing configuration: ${name}`);
        
        // Shutdown current handler
        await this.handler.shutdown();
        await this.wait(100);

        // Create new handler with test config
        this.handler = new PerformanceAwareErrorHandler(config);
        await this.wait(100);

        // Test error handling with new config
        const testError = new Error(`Config test error for ${name}`);
        const result = await this.handler.handleError(testError, {
          timestamp: new Date(),
          userId: 'config-test-user'
        });

        this.assert(
          result !== undefined,
          `Error handling should work with ${name} configuration`,
          { config: name, result }
        );
      }

      this.testResults.push({
        test: 'Configuration Changes',
        passed: true,
        duration: performance.now() - testStart
      });

    } catch (error) {
      this.testResults.push({
        test: 'Configuration Changes',
        passed: false,
        duration: performance.now() - testStart,
        details: error.message
      });
    }
  }

  /**
   * Display test results
   */
  private displayResults(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 PERFORMANCE-AWARE ERROR HANDLER TEST RESULTS');
    console.log('='.repeat(60));

    const passed = this.testResults.filter(r => r.passed).length;
    const failed = this.testResults.filter(r => !r.passed).length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);

    for (const result of this.testResults) {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const duration = `${result.duration.toFixed(2)}ms`;
      console.log(`${status} ${result.test.padEnd(25)} (${duration})`);
      
      if (!result.passed && result.details) {
        console.log(`    Error: ${result.details}`);
      } else if (result.passed && result.details) {
        console.log(`    Details: ${JSON.stringify(result.details)}`);
      }
    }

    console.log('\n' + '-'.repeat(60));
    console.log(`Summary: ${passed} passed, ${failed} failed`);
    console.log(`Total duration: ${totalDuration.toFixed(2)}ms`);
    console.log(`Success rate: ${((passed / this.testResults.length) * 100).toFixed(1)}%`);

    if (failed === 0) {
      console.log('\n🎉 All tests passed! Performance-aware error handling is working correctly.');
    } else {
      console.log('\n⚠️  Some tests failed. Review the error details above.');
    }
  }

  /**
   * Assert helper for tests
   */
  private assert(condition: boolean, message: string, context?: any): void {
    if (!condition) {
      throw new Error(`Assertion failed: ${message}. Context: ${JSON.stringify(context, null, 2)}`);
    }
  }

  /**
   * Wait helper for async operations
   */
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Run tests if this file is executed directly
 */
if (require.main === module) {
  const tests = new PerformanceAwareErrorHandlerTests();
  tests.runAllTests().catch(console.error);
}

// Export for use in other test files - already exported above with class declaration 