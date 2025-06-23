/**
 * @file Exposes the WorkspaceService functionality via an HTTP API.
 * This file sets up routes for managing workspaces, members, and roles.
 * Note: This is a simplified example and would need a proper web framework (e.g., Express)
 * and authentication/authorization middleware in a real application.
 */
interface MockRequest {
    method: 'GET' | 'POST' | 'DELETE';
    url: string;
    body?: any;
    headers: {
        authorization?: string;
    };
}
interface MockResponse {
    statusCode: number;
    body: any;
}
/**
 * A simple router to handle API requests for collaboration features.
 * @param req - The incoming request object.
 * @returns A response object.
 */
export declare function handleCollaborationRequest(req: MockRequest): Promise<MockResponse>;
export {};
//# sourceMappingURL=collaboration-api.d.ts.map