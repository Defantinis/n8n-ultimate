# Performance Monitoring with Datadog

This document outlines how to set up and use the performance monitoring features in the n8n-ultimate project, with a focus on the integration with Datadog.

## Overview

The performance monitoring system is built around the `PerformanceMonitor` class located in `src/performance/performance-monitor.ts`. This class is capable of collecting a wide range of metrics, including:

-   CPU usage and load
-   Memory allocation (heap, RSS)
-   Event loop delay and utilization
-   Garbage collection statistics
-   HTTP request/response metrics
-   Asynchronous operation timings

The `DatadogPerformanceConnector` class in `src/performance/datadog-connector.ts` acts as a bridge between the `PerformanceMonitor` and Datadog, sending the collected metrics and alerts to your Datadog account via the DogStatsD protocol.

## Setup and Configuration

To enable performance monitoring with Datadog, you need to have a Datadog agent running and configured to receive DogStatsD metrics. Please refer to the [official Datadog documentation](https://docs.datadoghq.com/agent/docker/) for instructions on how to run the agent.

Once the agent is running, you can configure the application to send metrics to it. The primary configuration is done through environment variables.

### Environment Variables

-   `DD_AGENT_HOST`: The hostname of your Datadog agent. Defaults to `localhost`.
-   `DD_DOGSTATSD_PORT`: The port on which your Datadog agent is listening for DogStatsD metrics. Defaults to `8125`.
-   `DD_ENV`: The environment name for your application (e.g., `development`, `staging`, `production`).
-   `DD_SERVICE`: The name of your service (e.g., `n8n-ultimate`).
-   `DD_VERSION`: The version of your application.

## How to Run the Monitoring Example

A practical example of how to initialize and use the performance monitoring system is available in `src/monitoring-example.ts`. This script starts the monitor, connects it to Datadog, and simulates some application work to generate metrics.

To run the example, you first need to compile the TypeScript code and then execute the compiled JavaScript file:

```bash
# 1. Compile the TypeScript code
npx tsc

# 2. Run the example
node dist/monitoring-example.js
```

The example will run for 60 seconds, collecting and sending metrics to your Datadog agent during that time.

## Collected Metrics

The following metrics are collected and sent to Datadog with the prefix `n8n_ultimate.`:

| Metric Name                       | Type      | Description                                           |
| --------------------------------- | --------- | ----------------------------------------------------- |
| `cpu.usage`                       | Gauge     | CPU usage percentage.                                 |
| `cpu.load_average.1m`             | Gauge     | 1-minute load average.                                |
| `cpu.load_average.5m`             | Gauge     | 5-minute load average.                                |
| `cpu.load_average.15m`            | Gauge     | 15-minute load average.                               |
| `memory.heap_used`                | Gauge     | V8 heap memory used, in bytes.                        |
| `memory.heap_total`               | Gauge     | Total V8 heap memory, in bytes.                       |
| `memory.rss`                      | Gauge     | Resident Set Size, in bytes.                          |
| `memory.system.used_percentage`   | Gauge     | System memory usage percentage.                       |
| `event_loop.delay`                | Histogram | Event loop delay, in milliseconds.                    |
| `event_loop.utilization`          | Gauge     | Event loop utilization.                               |
| `event_loop.lag`                  | Histogram | Event loop lag, in milliseconds.                      |
| `gc.duration`                     | Histogram | Duration of garbage collection events, in ms.         |
| `gc.count.total`                  | Counter   | Total number of GC events.                            |
| `gc.count.major`                  | Counter   | Number of major GC events.                            |
| `gc.count.minor`                  | Counter   | Number of minor GC events.                            |
| `http.requests.count`             | Counter   | Total number of HTTP requests.                        |
| `http.responses.count`            | Counter   | Total number of HTTP responses.                       |
| `http.response_time.average`      | Histogram | Average HTTP response time, in milliseconds.          |
| `http.requests.slow`              | Counter   | Number of slow HTTP requests.                         |
| `http.errors.count`               | Counter   | Number of HTTP requests that resulted in an error.    |
| `http.connections.active`         | Gauge     | Number of active HTTP connections.                    |
| `async.operations.pending`        | Gauge     | Number of pending asynchronous operations.            |
| `async.operations.completed`      | Counter   | Total number of completed asynchronous operations.    |
| `async.operation_time.average`    | Histogram | Average duration of asynchronous operations, in ms.   |

## Alerting

The `PerformanceMonitor` can trigger alerts when certain thresholds are breached. These alerts are sent to Datadog as events. You can then configure monitors in the Datadog UI to trigger notifications (e.g., to Slack, PagerDuty) based on these events.

The default alert thresholds are configured in `src/monitoring-example.ts` but can be customized.

### Recommended Datadog Monitors

-   **High CPU Usage**: Trigger an alert when `avg(last_5m):n8n_ultimate.cpu.usage > 80`
-   **High Memory Usage**: Trigger an alert when `avg(last_5m):n8n_ultimate.memory.system.used_percentage > 80`
-   **High Event Loop Delay**: Trigger an alert when `p95(last_5m):n8n_ultimate.event_loop.delay > 1000`
-   **High Error Rate**: Trigger an alert when `sum(last_5m):n8n_ultimate.http.errors.count > 5`

This setup provides a solid foundation for monitoring the performance of the n8n-ultimate application and ensuring its reliability in a production environment. 