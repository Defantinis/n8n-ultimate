import { PerformanceMonitor } from './performance/performance-monitor';
import { DatadogPerformanceConnector } from './performance/datadog-connector';
import { parseWorkflow } from './index';
import * as path from 'path';

async function main() {
  console.log('Initializing performance monitoring example...');

  // 1. Initialize Performance Monitor
  const performanceMonitor = new PerformanceMonitor({
    interval: 5000, // Collect metrics every 5 seconds
    alerts: {
      enabled: true,
      thresholds: {
        cpuUsage: 80,
        memoryUsage: 80,
        eventLoopDelay: 1000,
        responseTime: 2000,
        errorRate: 10,
      },
    },
    profiling: {
      enabled: true,
      sampleInterval: 100,
      maxProfiles: 100,
    },
    persistence: {
        enabled: true,
        directory: path.join(__dirname, '..', '.monitoring-data'),
        format: 'json',
    }
  });

  // 2. Initialize and connect Datadog connector
  const datadogConnector = new DatadogPerformanceConnector(performanceMonitor, {
    prefix: 'n8n_ultimate.dev.',
    globalTags: ['env:development', 'project:n8n-ultimate'],
  });

  // 3. Start monitoring
  await performanceMonitor.start();

  console.log('Performance monitoring started. Running a sample task...');

  // 4. Simulate some application work
  try {
    const workflowPath = path.join(__dirname, '..', 'workflows', 'hubspot-mixpanel-integration.json');
    await parseWorkflow(workflowPath);
    console.log('Sample task completed.');
    // Simulate tracking an HTTP request
    performanceMonitor.trackHTTPRequest(Math.random() * 500, 200);
  } catch (error) {
    console.error('Error during sample task:', error);
    performanceMonitor.trackHTTPRequest(Math.random() * 100 + 500, 500); // Track error response
  }
  
  // 5. Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 2000));
  performanceMonitor.trackAsyncOperation(2000, true);


  // 6. Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down performance monitoring...');
    await performanceMonitor.stop();
    datadogConnector.close();
    console.log('Shutdown complete.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  // Keep the process alive for a while to collect some metrics
  setTimeout(() => {
    shutdown();
  }, 60000); // Run for 60 seconds
}

main().catch(error => {
  console.error('An unexpected error occurred:', error);
  process.exit(1);
}); 