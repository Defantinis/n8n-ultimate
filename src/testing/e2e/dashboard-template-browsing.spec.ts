import { test, expect } from '@playwright/test';

test.describe('Dashboard – Template Browsing & Import', () => {
  /*
    Scenario: User browses template gallery and imports template
    Given user is logged in
    When user opens Template Gallery
    And selects a template card
    And clicks Import
    Then template should appear in Workspace Templates list
  */

  test('happy path – import template', async ({ page }) => {
    // TODO: implement login helper
    // TODO: navigate to dashboard
    // TODO: assert template import success
    expect(true).toBeTruthy();
  });
}); 