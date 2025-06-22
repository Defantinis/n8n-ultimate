/**
 * n8n Ultimate - Health Check API Endpoint
 *
 * This file provides a handler for the health check endpoint, which can be
 * used by external services to monitor the application's status.
 */

// We are assuming a framework like Express.js is used for the server,
// so we'll use its common request and response object shapes.
interface Request {
  // Add any properties you might need from the request object
}

interface Response {
  status: (statusCode: number) => Response;
  json: (body: any) => Response;
  send: (body: string) => Response;
}

export function handleHealthCheck(_req: Request, res: Response): void {
  try {
    // In a real application, you might check database connections,
    // external service availability, etc. here.
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      message: 'Service is unavailable.',
      error: error.message,
    });
  }
} 