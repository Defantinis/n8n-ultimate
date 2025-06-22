import assert from 'assert';

(async () => {
  // @ts-ignore - TS extension import handled by ts-node register
  const WorkspaceService = await import('../../collaboration/workspace-service.ts');
  // @ts-ignore - TS extension import handled by ts-node register
  const ReviewService = await import('../../collaboration/workflow-review-service.ts');

  console.log('\n⚙️  Running Collaboration API Integration Tests');

  // --- Setup test data ---
  const ownerId = 'user_owner';
  const editorId = 'user_editor';
  const viewerId = 'user_viewer';

  // 1. Create workspace
  const workspace = await WorkspaceService.createWorkspace('Test Workspace', ownerId);
  assert.ok(workspace.workspace_id, 'Workspace should return an ID');

  // 2. Add an editor and viewer
  await WorkspaceService.addUserToWorkspace(workspace.workspace_id, editorId, 'editor');
  await WorkspaceService.addUserToWorkspace(workspace.workspace_id, viewerId, 'viewer');

  const members = WorkspaceService.getWorkspaceMembers(workspace.workspace_id);
  assert.strictEqual(members.length, 3, 'Workspace should have 3 members');

  // 3. Attempt to remove a user as viewer (should fail)
  let permissionErrorCaught = false;
  try {
    await WorkspaceService.removeUserFromWorkspace(workspace.workspace_id, editorId, viewerId);
  } catch (err) {
    permissionErrorCaught = true;
  }
  assert.ok(permissionErrorCaught, 'Viewer should not have permission to remove members');

  // 4. Owner removes viewer (should succeed)
  await WorkspaceService.removeUserFromWorkspace(workspace.workspace_id, viewerId, ownerId);
  const membersAfterRemoval = WorkspaceService.getWorkspaceMembers(workspace.workspace_id);
  assert.strictEqual(membersAfterRemoval.length, 2, 'Viewer should be removed');

  // 5. Create a Workflow Change Request as editor (requires workflows:manage permission)
  const wcr = await ReviewService.createWorkflowChangeRequest(
    workspace.workspace_id,
    editorId,
    'workflow_1',
    'Add New Step',
    'Proposes adding a new automation step',
    { nodes: [] }
  );
  assert.strictEqual(wcr.status, 'open', 'WCR should be open after creation');

  // 6. Approve and merge WCR as owner
  await ReviewService.addReview(workspace.workspace_id, ownerId, wcr.wcr_id, 'approved', 'Looks good');
  const merged = await ReviewService.mergeWCR(workspace.workspace_id, ownerId, wcr.wcr_id);
  assert.strictEqual(merged.status, 'merged', 'WCR should be merged');

  console.log('✅ Collaboration API integration tests passed');
})(); 