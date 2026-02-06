/**
 * Global test setup
 *
 * Configures mocks and test environment for all tests.
 */

import { afterEach, beforeEach, vi } from 'vitest';
import { mockLogseqAPI } from './mocks/logseq';

// Mock SCSS imports
vi.mock('*.scss?inline', () => ({
  default: '',
}));

// Setup global mocks
beforeEach(() => {
  // Mock Logseq API
  global.logseq = mockLogseqAPI();

  // Mock top/parent for iframe context
  global.top = window as unknown as Window & typeof globalThis;
  global.parent = window;

  // Reset DOM
  document.body.innerHTML = '';

  // Suppress console output during tests
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});
