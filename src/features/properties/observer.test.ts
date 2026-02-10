/**
 * Tests for Properties Observer
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as apiModule from '../../lib/api';
import { setupPropertyObserver } from './observer';

vi.mock('../../lib/api', () => ({
  getPage: vi.fn(),
  cleanPropertyValue: vi.fn((v: unknown) => String(v ?? '')),
}));

const ICON_CLASS = 'pl-property-icon';
const RESOLVED_ATTR = 'data-pl-icon-resolved';

function createPropertyBlock(keys: string[]): HTMLElement {
  const block = document.createElement('div');
  block.className = 'page-properties';

  for (const key of keys) {
    const keyEl = document.createElement('span');
    keyEl.className = 'page-property-key';
    keyEl.textContent = key;
    block.appendChild(keyEl);
  }

  document.body.appendChild(block);
  return block;
}

describe('Property Observer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns a cleanup function', () => {
    const cleanup = setupPropertyObserver();
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('scans existing property keys on setup', async () => {
    vi.mocked(apiModule.getPage).mockResolvedValue({
      properties: { icon: '📦' },
    } as ReturnType<typeof apiModule.getPage> extends Promise<infer T> ? T : never);

    createPropertyBlock(['type']);

    const cleanup = setupPropertyObserver();

    // Wait for async getPage to resolve
    await vi.waitFor(() => {
      expect(apiModule.getPage).toHaveBeenCalledWith('type');
    });

    cleanup();
  });

  it('prepends icon span when page has icon property', async () => {
    vi.mocked(apiModule.getPage).mockResolvedValue({
      properties: { icon: '📦' },
    } as ReturnType<typeof apiModule.getPage> extends Promise<infer T> ? T : never);
    vi.mocked(apiModule.cleanPropertyValue).mockReturnValue('📦');

    const block = createPropertyBlock(['type']);

    const cleanup = setupPropertyObserver();

    await vi.waitFor(() => {
      const icon = block.querySelector(`.${ICON_CLASS}`);
      expect(icon).not.toBeNull();
      expect(icon?.textContent).toBe('📦');
    });

    cleanup();
  });

  it('marks processed elements with resolved attribute', async () => {
    vi.mocked(apiModule.getPage).mockResolvedValue({
      properties: { icon: '📦' },
    } as ReturnType<typeof apiModule.getPage> extends Promise<infer T> ? T : never);

    createPropertyBlock(['type']);

    const cleanup = setupPropertyObserver();

    await vi.waitFor(() => {
      const keyEl = document.querySelector('.page-property-key');
      expect(keyEl?.hasAttribute(RESOLVED_ATTR)).toBe(true);
    });

    cleanup();
  });

  it('skips elements already resolved', async () => {
    vi.mocked(apiModule.getPage).mockResolvedValue({
      properties: { icon: '📦' },
    } as ReturnType<typeof apiModule.getPage> extends Promise<infer T> ? T : never);

    const block = createPropertyBlock(['type']);
    const keyEl = block.querySelector('.page-property-key');
    keyEl?.setAttribute(RESOLVED_ATTR, '');

    const cleanup = setupPropertyObserver();

    // Give it a tick to process
    await new Promise(r => setTimeout(r, 10));

    expect(apiModule.getPage).not.toHaveBeenCalled();

    cleanup();
  });

  it('skips when page has no icon property', async () => {
    vi.mocked(apiModule.getPage).mockResolvedValue({
      properties: { description: 'something' },
    } as ReturnType<typeof apiModule.getPage> extends Promise<infer T> ? T : never);

    const block = createPropertyBlock(['type']);

    const cleanup = setupPropertyObserver();

    await vi.waitFor(() => {
      expect(apiModule.getPage).toHaveBeenCalled();
    });

    // No icon should be prepended
    expect(block.querySelector(`.${ICON_CLASS}`)).toBeNull();

    cleanup();
  });

  it('skips when page is null', async () => {
    vi.mocked(apiModule.getPage).mockResolvedValue(
      null as Awaited<ReturnType<typeof apiModule.getPage>>,
    );

    const block = createPropertyBlock(['unknown-key']);

    const cleanup = setupPropertyObserver();

    await vi.waitFor(() => {
      expect(apiModule.getPage).toHaveBeenCalled();
    });

    expect(block.querySelector(`.${ICON_CLASS}`)).toBeNull();

    cleanup();
  });

  it('skips when key text is empty', async () => {
    const block = document.createElement('div');
    block.className = 'page-properties';

    const keyEl = document.createElement('span');
    keyEl.className = 'page-property-key';
    keyEl.textContent = '';
    block.appendChild(keyEl);
    document.body.appendChild(block);

    const cleanup = setupPropertyObserver();

    await new Promise(r => setTimeout(r, 10));

    expect(apiModule.getPage).not.toHaveBeenCalled();

    cleanup();
  });

  it('skips when cleanPropertyValue returns empty string', async () => {
    vi.mocked(apiModule.getPage).mockResolvedValue({
      properties: { icon: '' },
    } as ReturnType<typeof apiModule.getPage> extends Promise<infer T> ? T : never);
    vi.mocked(apiModule.cleanPropertyValue).mockReturnValue('');

    const block = createPropertyBlock(['type']);

    const cleanup = setupPropertyObserver();

    await vi.waitFor(() => {
      expect(apiModule.getPage).toHaveBeenCalled();
    });

    expect(block.querySelector(`.${ICON_CLASS}`)).toBeNull();

    cleanup();
  });

  describe('Cleanup', () => {
    it('removes all icon spans', async () => {
      vi.mocked(apiModule.getPage).mockResolvedValue({
        properties: { icon: '📦' },
      } as ReturnType<typeof apiModule.getPage> extends Promise<infer T> ? T : never);
      vi.mocked(apiModule.cleanPropertyValue).mockReturnValue('📦');

      createPropertyBlock(['type', 'status']);

      const cleanup = setupPropertyObserver();

      await vi.waitFor(() => {
        expect(document.querySelectorAll(`.${ICON_CLASS}`).length).toBe(2);
      });

      cleanup();

      expect(document.querySelectorAll(`.${ICON_CLASS}`).length).toBe(0);
    });

    it('removes resolved attributes', async () => {
      vi.mocked(apiModule.getPage).mockResolvedValue({
        properties: { icon: '📦' },
      } as ReturnType<typeof apiModule.getPage> extends Promise<infer T> ? T : never);

      createPropertyBlock(['type']);

      const cleanup = setupPropertyObserver();

      await vi.waitFor(() => {
        expect(document.querySelector(`[${RESOLVED_ATTR}]`)).not.toBeNull();
      });

      cleanup();

      expect(document.querySelector(`[${RESOLVED_ATTR}]`)).toBeNull();
    });

    it('disconnects mutation observer', async () => {
      vi.mocked(apiModule.getPage).mockResolvedValue({
        properties: { icon: '🔧' },
      } as ReturnType<typeof apiModule.getPage> extends Promise<infer T> ? T : never);
      vi.mocked(apiModule.cleanPropertyValue).mockReturnValue('🔧');

      const cleanup = setupPropertyObserver();
      cleanup();

      // Clear call count after cleanup
      vi.mocked(apiModule.getPage).mockClear();

      // Add new property key — observer should be disconnected, so no new calls
      createPropertyBlock(['area']);

      await new Promise(r => setTimeout(r, 50));
      await new Promise(r => requestAnimationFrame(r));

      expect(apiModule.getPage).not.toHaveBeenCalled();
    });
  });
});
