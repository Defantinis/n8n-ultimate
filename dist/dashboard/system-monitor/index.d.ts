/**
 * n8n Ultimate - System Monitor Component
 *
 * This component displays real-time system monitoring information,
 * such as memory usage, CPU load, and active workflows.
 */
export declare class SystemMonitorComponent {
    private element;
    private intervalId?;
    constructor(element: HTMLElement);
    private render;
    private startMonitoring;
    private stopMonitoring;
    private updateMetrics;
    dispose(): void;
}
//# sourceMappingURL=index.d.ts.map