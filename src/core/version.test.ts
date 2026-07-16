import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyVersionAttribute,
  detectVersion,
  getVersion,
  setVersionForTest,
  VERSION_ATTR,
} from './version';

/** Point the current-graph mock at a given url/name. */
function mockGraph(graph: { url?: string; name?: string } | null): void {
  vi.mocked(logseq.App.getCurrentGraph).mockResolvedValue(
    graph as Awaited<ReturnType<typeof logseq.App.getCurrentGraph>>,
  );
}

/** Set the version override setting. */
function setOverride(value: 'auto' | 'v1' | 'v2'): void {
  logseq.settings = { ...logseq.settings, logseqVersion: value } as typeof logseq.settings;
}

describe('detectVersion', () => {
  beforeEach(() => {
    setVersionForTest(null);
    setOverride('auto');
    document.documentElement.removeAttribute(VERSION_ATTR);
  });

  it("returns the override verbatim without probing when set to 'v1'", async () => {
    setOverride('v1');
    await expect(detectVersion()).resolves.toBe('v1');
    expect(logseq.App.getCurrentGraph).not.toHaveBeenCalled();
  });

  it("returns the override verbatim without probing when set to 'v2'", async () => {
    setOverride('v2');
    await expect(detectVersion()).resolves.toBe('v2');
    expect(logseq.App.getCurrentGraph).not.toHaveBeenCalled();
  });

  it("detects v2 from a 'logseq_db_' graph url", async () => {
    mockGraph({ url: 'logseq_db_my-graph', name: 'my-graph' });
    await expect(detectVersion()).resolves.toBe('v2');
  });

  it("detects v1 from a 'logseq_local_' graph url", async () => {
    mockGraph({ url: 'logseq_local_/home/user/notes', name: 'notes' });
    await expect(detectVersion()).resolves.toBe('v1');
  });

  it('DOM-probes v2 from the .sidebar-navigations shell when the url is inconclusive', async () => {
    mockGraph({ url: 'unknown', name: 'unknown' });
    const nav = document.createElement('div');
    nav.className = 'sidebar-navigations';
    document.body.appendChild(nav);

    await expect(detectVersion()).resolves.toBe('v2');
    nav.remove();
  });

  it('DOM-probes v1 from #left-sidebar .nav-header when the url is inconclusive', async () => {
    mockGraph({ url: 'unknown', name: 'unknown' });
    const sidebar = document.createElement('div');
    sidebar.id = 'left-sidebar';
    const navHeader = document.createElement('div');
    navHeader.className = 'nav-header';
    sidebar.appendChild(navHeader);
    document.body.appendChild(sidebar);

    await expect(detectVersion()).resolves.toBe('v1');
    sidebar.remove();
  });

  it('ignores #head (present in both apps) as a version signal', async () => {
    mockGraph({ url: 'unknown', name: 'unknown' });
    const head = document.createElement('div');
    head.id = 'head';
    document.body.appendChild(head);

    // No sidebar shell marker → inconclusive → safe default.
    await expect(detectVersion()).resolves.toBe('v1');
    head.remove();
  });

  it('defaults to v1 when all signals are inconclusive', async () => {
    mockGraph(null);
    await expect(detectVersion()).resolves.toBe('v1');
  });

  it('defaults to v1 when getCurrentGraph throws', async () => {
    vi.mocked(logseq.App.getCurrentGraph).mockRejectedValue(new Error('no api'));
    await expect(detectVersion()).resolves.toBe('v1');
  });
});

describe('getVersion', () => {
  beforeEach(() => {
    setVersionForTest(null);
  });

  it('returns v1 before detection has run', () => {
    expect(getVersion()).toBe('v1');
  });

  it('returns the cached detection result', async () => {
    setOverride('v2');
    await detectVersion();
    expect(getVersion()).toBe('v2');
  });

  it('re-detects when the override changes', async () => {
    setOverride('v2');
    await detectVersion();
    expect(getVersion()).toBe('v2');

    setOverride('v1');
    await detectVersion();
    expect(getVersion()).toBe('v1');
  });
});

describe('applyVersionAttribute', () => {
  beforeEach(() => {
    setVersionForTest(null);
    document.documentElement.removeAttribute(VERSION_ATTR);
  });

  it('writes the detected version onto the host <html>', () => {
    setVersionForTest('v2');
    applyVersionAttribute();
    expect(document.documentElement.getAttribute(VERSION_ATTR)).toBe('v2');
  });

  it('writes an explicitly passed version', () => {
    applyVersionAttribute('v1');
    expect(document.documentElement.getAttribute(VERSION_ATTR)).toBe('v1');
  });
});
