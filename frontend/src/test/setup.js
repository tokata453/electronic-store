import '@testing-library/jest-dom/vitest';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw/server';
import { resetMockData } from './msw/handlers';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

afterEach(() => {
  resetMockData();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
