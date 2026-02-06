/**
 * Logseq API Mocks
 *
 * Mock implementations of the Logseq Plugin API for testing.
 */

import { vi } from 'vitest';
import type { PageData } from '../../src/types';

export function mockLogseqAPI() {
  return {
    ready: vi.fn((fn: () => Promise<void>) => Promise.resolve(fn())),
    beforeunload: vi.fn(),
    provideStyle: vi.fn(),
    provideUI: vi.fn(),

    Editor: {
      getPage: vi.fn(),
      getPageBlocksTree: vi.fn(),
    },

    App: {
      getUserConfigs: vi.fn().mockResolvedValue({
        preferredThemeMode: 'light',
      }),
      pushState: vi.fn(),
    },

    Settings: {
      registerSettings: vi.fn(),
      on: vi.fn(),
    },
  };
}

export function mockPageData(overrides: Partial<PageData> = {}): PageData {
  return {
    name: 'Test Page',
    originalName: 'Test Page',
    properties: {},
    ...overrides,
  };
}

export function mockPageWithProperties(properties: Record<string, unknown>): PageData {
  return mockPageData({
    properties,
  });
}

export function mockBlockData(content: string, children: unknown[] = []) {
  return {
    content,
    children,
  };
}
