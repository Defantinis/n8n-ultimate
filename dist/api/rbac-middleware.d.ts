/**
 * @file Implements Role-Based Access Control (RBAC) middleware for securing API endpoints.
 */
/**
 * A middleware function that checks if a user has the required permission for an action.
 *
 * This is a high-level function that would wrap around route handlers in a framework like Express.
 * e.g., app.post('/workspaces/:id/members', hasPermission('members:manage'), (req, res) => { ... });
 *
 * @param requiredPermission - The permission string required for the action (e.g., 'members:manage').
 * @returns An async function that performs the permission check.
 */
export declare function hasPermission(requiredPermission: string): (workspaceId: string, userId: string) => Promise<void>;
/**
 * Example of how to use the middleware.
 * This function simulates protecting a route.
 *
 * @param workspaceId
 * @param userId
 * @param action - A function representing the protected API logic.
 */
export declare function protectedActionExample(workspaceId: string, userId: string, permission: string, action: () => Promise<any>): Promise<any>;
//# sourceMappingURL=rbac-middleware.d.ts.map