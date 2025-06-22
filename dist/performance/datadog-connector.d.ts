import { PerformanceMonitor } from './performance-monitor';
export interface DatadogConnectorConfig {
    host?: string;
    port?: number;
    prefix?: string;
    globalTags?: string[];
}
export declare class DatadogPerformanceConnector {
    private performanceMonitor;
    private statsdClient;
    private config;
    constructor(performanceMonitor: PerformanceMonitor, config?: DatadogConnectorConfig);
    private bindEvents;
    private sendMetrics;
    private sendAlert;
    close(): void;
}
//# sourceMappingURL=datadog-connector.d.ts.map