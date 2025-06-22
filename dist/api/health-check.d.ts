/**
 * n8n Ultimate - Health Check API Endpoint
 *
 * This file provides a handler for the health check endpoint, which can be
 * used by external services to monitor the application's status.
 */
interface Request {
}
interface Response {
    status: (statusCode: number) => Response;
    json: (body: any) => Response;
    send: (body: string) => Response;
}
export declare function handleHealthCheck(_req: Request, res: Response): void;
export {};
//# sourceMappingURL=health-check.d.ts.map