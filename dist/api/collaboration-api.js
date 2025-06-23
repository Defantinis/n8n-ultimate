/**
 * @file Exposes the WorkspaceService functionality via an HTTP API.
 * This file sets up routes for managing workspaces, members, and roles.
 * Note: This is a simplified example and would need a proper web framework (e.g., Express)
 * and authentication/authorization middleware in a real application.
 */
import * as WorkspaceService from '../collaboration/workspace-service';
import { hasPermission } from './rbac-middleware';
// --- API Route Handler ---
/**
 * A simple router to handle API requests for collaboration features.
 * @param req - The incoming request object.
 * @returns A response object.
 */
export async function handleCollaborationRequest(req) {
    const { method, url, body, headers } = req;
    const urlParts = url.split('/').filter(p => p); // e.g., ['workspaces', 'ws_123', 'members']
    // A very basic auth mechanism for demonstration.
    const performingUserId = headers.authorization?.split(' ')[1];
    if (!performingUserId) {
        return { statusCode: 401, body: { error: 'Unauthorized' } };
    }
    try {
        // Route: POST /workspaces
        if (method === 'POST' && urlParts[0] === 'workspaces' && urlParts.length === 1) {
            const { name } = body;
            const workspace = await WorkspaceService.createWorkspace(name, performingUserId);
            return { statusCode: 201, body: workspace };
        }
        // Route: POST /workspaces/{workspaceId}/members
        if (method === 'POST' && urlParts[0] === 'workspaces' && urlParts[2] === 'members') {
            const workspaceId = urlParts[1];
            // Protect this route: only admins or owners can add members
            await hasPermission('members:manage')(workspaceId, performingUserId);
            const { userId, role } = body;
            const member = await WorkspaceService.addUserToWorkspace(workspaceId, userId, role);
            return { statusCode: 201, body: member };
        }
        // Route: GET /workspaces/{workspaceId}/members
        if (method === 'GET' && urlParts[0] === 'workspaces' && urlParts[2] === 'members') {
            const workspaceId = urlParts[1];
            const members = await WorkspaceService.getWorkspaceMembers(workspaceId);
            return { statusCode: 200, body: members };
        }
        // Route: DELETE /workspaces/{workspaceId}/members/{userId}
        if (method === 'DELETE' && urlParts[0] === 'workspaces' && urlParts[2] === 'members') {
            const workspaceId = urlParts[1];
            const userIdToRemove = urlParts[3];
            // Protect this route: only admins or owners can remove members
            await hasPermission('members:manage')(workspaceId, performingUserId);
            await WorkspaceService.removeUserFromWorkspace(workspaceId, userIdToRemove, performingUserId);
            return { statusCode: 204, body: null };
        }
        return { statusCode: 404, body: { error: 'Not Found' } };
    }
    catch (error) {
        if (error.message.includes('[RBAC]')) {
            return { statusCode: 403, body: { error: error.message } };
        }
        if (error.message.includes('Permission denied')) {
            return { statusCode: 403, body: { error: error.message } };
        }
        return { statusCode: 500, body: { error: error.message } };
    }
}
//# sourceMappingURL=collaboration-api.js.map