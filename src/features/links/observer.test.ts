/**
 * Tests for Link Observer
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setupLinkObserver } from './observer';

describe('setupLinkObserver', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function createExternalLink(id = '1'): HTMLAnchorElement {
    const anchor = document.createElement('a');
    anchor.className = 'external-link';
    anchor.href = `https://example${id}.com`;
    anchor.textContent = `Link ${id}`;
    return anchor;
  }

  it('scans existing external links on setup', () => {
    const link1 = createExternalLink('1');
    const link2 = createExternalLink('2');
    document.body.appendChild(link1);
    document.body.appendChild(link2);

    const onLinksFound = vi.fn();
    const cleanup = setupLinkObserver(onLinksFound);

    expect(onLinksFound).toHaveBeenCalledTimes(1);
    expect(onLinksFound).toHaveBeenCalledWith([link1, link2]);

    cleanup();
  });

  it('does not call callback if no initial links exist', () => {
    const onLinksFound = vi.fn();
    const cleanup = setupLinkObserver(onLinksFound);

    expect(onLinksFound).not.toHaveBeenCalled();

    cleanup();
  });

  it('skips already-processed links in initial scan', () => {
    const link = createExternalLink();
    link.setAttribute('data-pl-favicon', 'true');
    document.body.appendChild(link);

    const onLinksFound = vi.fn();
    const cleanup = setupLinkObserver(onLinksFound);

    expect(onLinksFound).not.toHaveBeenCalled();

    cleanup();
  });

  it('detects new links added via mutation observer', async () => {
    const onLinksFound = vi.fn();
    const cleanup = setupLinkObserver(onLinksFound);

    const newLink = createExternalLink('new');
    document.body.appendChild(newLink);

    // Wait for MutationObserver + rAF to process
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    expect(onLinksFound).toHaveBeenCalled();
    const lastCall = onLinksFound.mock.calls[onLinksFound.mock.calls.length - 1];
    expect(lastCall[0]).toContain(newLink);

    cleanup();
  });

  it('detects links inside appended subtrees', async () => {
    const onLinksFound = vi.fn();
    const cleanup = setupLinkObserver(onLinksFound);

    const container = document.createElement('div');
    const link = createExternalLink('nested');
    container.appendChild(link);
    document.body.appendChild(container);

    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    expect(onLinksFound).toHaveBeenCalled();
    const lastCall = onLinksFound.mock.calls[onLinksFound.mock.calls.length - 1];
    expect(lastCall[0]).toContain(link);

    cleanup();
  });

  it('returns a cleanup function that disconnects the observer', async () => {
    const onLinksFound = vi.fn();
    const cleanup = setupLinkObserver(onLinksFound);

    cleanup();

    // Adding links after cleanup should not trigger callback
    const callCount = onLinksFound.mock.calls.length;
    document.body.appendChild(createExternalLink('after-cleanup'));

    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    expect(onLinksFound.mock.calls.length).toBe(callCount);
  });
});
