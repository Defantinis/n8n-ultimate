/**
 * n8n Ultimate - System Monitor Component
 *
 * This component displays real-time system monitoring information,
 * such as memory usage, CPU load, and active workflows.
 */
export class SystemMonitorComponent {
    element;
    intervalId;
    constructor(element) {
        this.element = element;
        this.render();
        this.startMonitoring();
    }
    render() {
        this.element.innerHTML = `
      <div class="system-monitor">
        <h2>System Monitor</h2>
        <div id="metrics-container">
          <p>Loading metrics...</p>
        </div>
      </div>
    `;
    }
    startMonitoring() {
        // In a real application, this would connect to a WebSocket
        // or use polling to get real-time data from the backend.
        this.updateMetrics();
        this.intervalId = window.setInterval(() => this.updateMetrics(), 5000);
    }
    stopMonitoring() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    updateMetrics() {
        const metricsContainer = this.element.querySelector('#metrics-container');
        if (!metricsContainer) {
            return;
        }
        // Placeholder data - replace with actual data from a backend service.
        const memoryUsage = (Math.random() * 100).toFixed(2);
        const cpuLoad = (Math.random() * 100).toFixed(2);
        const activeWorkflows = Math.floor(Math.random() * 10);
        metricsContainer.innerHTML = `
      <ul>
        <li><strong>Memory Usage:</strong> ${memoryUsage}%</li>
        <li><strong>CPU Load:</strong> ${cpuLoad}%</li>
        <li><strong>Active Workflows:</strong> ${activeWorkflows}</li>
      </ul>
    `;
    }
    // Call this method when the component is destroyed to prevent memory leaks.
    dispose() {
        this.stopMonitoring();
    }
}
//# sourceMappingURL=index.js.map