/**
 * @file Implements Role-Based Access Control (RBAC) middleware for securing API endpoints.
 */
// @ts-ignore - TS extension import handled by ts-node register
import * as WorkspaceService from '../collaboration/workspace-service.ts';
// Define permissions for each role
const rolePermissions = {
    owner: ['workspace:delete', 'members:manage', 'workflows:manage', 'billing:manage'],
    admin: ['members:manage', 'workflows:manage'],
    editor: ['workflows:manage'],
    viewer: ['workflows:view'],
};
/**
 * A middleware function that checks if a user has the required permission for an action.
 *
 * This is a high-level function that would wrap around route handlers in a framework like Express.
 * e.g., app.post('/workspaces/:id/members', hasPermission('members:manage'), (req, res) => { ... });
 *
 * @param requiredPermission - The permission string required for the action (e.g., 'members:manage').
 * @returns An async function that performs the permission check.
 */
export function hasPermission(requiredPermission) {
    /**
     * @param workspaceId - The ID of the workspace context.
     * @param userId - The ID of the user performing the action.
     * @returns A Promise that resolves if the user has permission, and rejects otherwise.
     */
    return async function (workspaceId, userId) {
        console.log(`[RBAC] Checking if user ${userId} has permission '${requiredPermission}' in workspace ${workspaceId}`);
        const userRole = await WorkspaceService.getUserRole(workspaceId, userId);
        if (!userRole) {
            throw new Error(`[RBAC] Permission denied: User ${userId} is not a member of workspace ${workspaceId}.`);
        }
        const permissions = rolePermissions[userRole];
        if (!permissions || !permissions.includes(requiredPermission)) {
            throw new Error(`[RBAC] Permission denied: Role '${userRole}' does not have permission '${requiredPermission}'.`);
        }
        console.log(`[RBAC] Access granted for user ${userId} with role ${userRole}.`);
    };
}
/**
 * Example of how to use the middleware.
 * This function simulates protecting a route.
 *
 * @param workspaceId
 * @param userId
 * @param action - A function representing the protected API logic.
 */
export async function protectedActionExample(workspaceId, userId, permission, action) {
    try {
        // Check permission before executing the action
        await hasPermission(permission)(workspaceId, userId);
        // If permission check passes, execute the action
        console.log('[RBAC Example] Permission check passed. Executing action...');
        return await action();
    }
    catch (error) {
        console.error('[RBAC Example] Action failed due to permission error:', error.message);
        throw error; // Re-throw the error to be handled by the API layer
    }
}
//# sourceMappingURL=rbac-middleware.js.map