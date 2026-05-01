import { test as base, Page, BrowserContext } from '@playwright/test';

// Extend Playwright's test with auth helpers
export const test = base.extend<{
  authenticatedPage: Page;
  hostPage: Page;
}>({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      // Set localStorage before the page loads
      storageState: {
        cookies: [],
        origins: [{
          origin: 'http://localhost:4200',
          localStorage: [{
            name:  'rxp_access_token',
            value: process.env['EXPLORER_TOKEN'] ?? 'test-explorer-token',
          }, {
            name:  'rxp_user',
            value: JSON.stringify({
              id: 1, email: 'explorer@test.com',
              firstName: 'Marie', lastName: 'Dupont',
              role: 'EXPLORER', avatarUrl: null,
            }),
          }],
        }],
      },
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  hostPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [{
          origin: 'http://localhost:4200',
          localStorage: [{
            name: 'rxp_access_token', value: 'test-host-token',
          }, {
            name: 'rxp_user', value: JSON.stringify({
              id: 2, email: 'host@test.com',
              firstName: 'Jean', lastName: 'Martin',
              role: 'HOST', avatarUrl: null,
            }),
          }],
        }],
      },
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
