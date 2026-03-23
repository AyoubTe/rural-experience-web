import { setupServer } from 'msw/node';
import { handlers }    from '../mocks/handlers';

export const server = setupServer(...handlers);

// playwright.config.ts global setup:
// globalSetup: './e2e/setup/global-setup.ts'


