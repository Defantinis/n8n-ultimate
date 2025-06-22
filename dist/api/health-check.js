/**
 * n8n Ultimate - Health Check API Endpoint
 *
 * This file provides a handler for the health check endpoint, which can be
 * used by external services to monitor the application's status.
 */
export function handleHealthCheck(_req, res) {
    try {
        // In a real application, you might check database connections,
        // external service availability, etc. here.
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'error',
            message: 'Service is unavailable.',
            error: error.message,
        });
    }
}
//# sourceMappingURL=health-check.js.map