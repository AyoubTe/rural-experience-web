// e2e/setup/global-setup.ts
import { server } from './msw-server';

export default async function globalSetup() {
  server.listen({ onUnhandledRequest: 'warn' });
}
