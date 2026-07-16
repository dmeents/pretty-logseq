/**
 * Tests for the Logseq v2 (DB graph) data adapter.
 *
 * The fixtures mirror the real shape captured from a logseq-db instance (see
 * `.ai`/memory notes): `Editor.getPage` returns `:user.property/<name>-<8char>`
 * keys whose values are entity ids (or arrays of them), resolved to raw markdown
 * titles via a `:block/title` datascript query. The normalizer's contract is to
 * emit a flat `PageProperties` map of lowercased plain keys with `string |
 * string[]` values.
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { clearPageCacheV2, getPageBlocksV2, getPageV2, normalizeProperties } from './api.v2';

/** Mock the `:block/title` resolution query with an id → title table. */
function mockRefTitles(table: Record<number, string>): void {
  logseq.DB.datascriptQuery.mockImplementation(async (_query: string, input: string) => {
    const ids = (input.match(/\d+/g) ?? []).map(Number);
    return ids.filter(id => id in table).map(id => [id, table[id]]);
  });
}

describe('normalizeProperties', () => {
  beforeEach(() => {
    logseq.DB.datascriptQuery.mockReset();
    logseq.DB.datascriptQuery.mockResolvedValue([]);
  });

  it('strips the namespace and the 8-char id suffix, lowercasing the key', async () => {
    mockRefTitles({ 492: 'Active', 676: 'Code Base' });

    const props = await normalizeProperties({
      ':user.property/status-cnmlDIuA': [492],
      ':user.property/type-XLXzDmK8': [676],
    });

    expect(props).toEqual({ status: 'Active', type: 'Code Base' });
  });

  it('strips a suffix that itself contains a hyphen', async () => {
    mockRefTitles({ 1922: '[[POE2 Overlord]]' });

    // `initiative-g7dB4L-E` — the 8-char suffix includes a hyphen.
    const props = await normalizeProperties({
      ':user.property/initiative-g7dB4L-E': 1922,
    });

    expect(props).toHaveProperty('initiative');
  });

  it('resolves a bare entity-id value to its title', async () => {
    mockRefTitles({ 1927: '[[David Meents]]' });

    const props = await normalizeProperties({ ':user.property/owner-xEJFd0zo': 1927 });

    // Raw markdown is preserved — the renderer strips `[[ ]]` downstream.
    expect(props.owner).toBe('[[David Meents]]');
  });

  it('resolves an array value and collapses a single element to a scalar', async () => {
    mockRefTitles({ 1926: '[[Personal]]' });

    const props = await normalizeProperties({ ':user.property/area-c1xBUFxO': [1926] });

    expect(props.area).toBe('[[Personal]]');
  });

  it('preserves url markdown-link titles verbatim for the link section', async () => {
    mockRefTitles({ 1924: '[GitHub](https://github.com/dmeents/poe2-overlord)' });

    const props = await normalizeProperties({ ':user.property/url-O9mmxiVt': 1924 });

    expect(props.url).toBe('[GitHub](https://github.com/dmeents/poe2-overlord)');
  });

  it('splits a single node whose title is a multi-ref list into an array', async () => {
    mockRefTitles({ 1925: '[[TypeScript]], [[Tauri]], [[Rust]]' });

    const props = await normalizeProperties({ ':user.property/stack-T_fP0Srf': 1925 });

    expect(props.stack).toEqual(['TypeScript', 'Tauri', 'Rust']);
  });

  it('resolves all references in a single batched query', async () => {
    mockRefTitles({ 492: 'Active', 676: 'Code Base', 1927: '[[David Meents]]' });

    await normalizeProperties({
      ':user.property/status-cnmlDIuA': [492],
      ':user.property/type-XLXzDmK8': [676],
      ':user.property/owner-xEJFd0zo': 1927,
    });

    expect(logseq.DB.datascriptQuery).toHaveBeenCalledTimes(1);
  });

  it('ignores non-property (structural) top-level attributes', async () => {
    mockRefTitles({ 492: 'Active', 4: 'Page' });

    const props = await normalizeProperties({
      id: 1105,
      name: 'poe2-overlord',
      uuid: '6a58406a',
      title: 'poe2-overlord',
      fullTitle: 'poe2-overlord',
      content: 'poe2-overlord',
      tags: [4],
      refs: [4, 22, 492],
      createdAt: 1784168554295,
      updatedAt: 1784168554295,
      ':user.property/status-cnmlDIuA': [492],
    });

    expect(props).toEqual({ status: 'Active' });
  });

  it('drops references that fail to resolve rather than emitting raw ids', async () => {
    mockRefTitles({}); // nothing resolves

    const props = await normalizeProperties({ ':user.property/owner-xEJFd0zo': 1927 });

    expect(props).toEqual({});
  });
});

describe('getPageV2', () => {
  beforeEach(() => {
    clearPageCacheV2();
    logseq.DB.datascriptQuery.mockReset();
    logseq.DB.datascriptQuery.mockResolvedValue([]);
  });

  it('fetches a DB page and produces the rich, normalized property map', async () => {
    mockRefTitles({
      492: 'Active',
      676: 'Code Base',
      1921: 'A powerful game overlay for Path of Exile 2',
      1924: '[GitHub](https://github.com/dmeents/poe2-overlord)',
      1926: '[[Personal]]',
      1927: '[[David Meents]]',
    });
    logseq.Editor.getPage.mockResolvedValue({
      id: 1105,
      name: 'poe2-overlord',
      title: 'poe2-overlord',
      tags: [4],
      ':user.property/status-cnmlDIuA': [492],
      ':user.property/type-XLXzDmK8': [676],
      ':user.property/area-c1xBUFxO': [1926],
      ':user.property/owner-xEJFd0zo': 1927,
      ':user.property/url-O9mmxiVt': 1924,
      ':user.property/description-L4iXvb1J': 1921,
    });

    const result = await getPageV2('poe2-overlord');

    expect(result).toEqual({
      name: 'poe2-overlord',
      originalName: 'poe2-overlord',
      properties: {
        status: 'Active',
        type: 'Code Base',
        area: '[[Personal]]',
        owner: '[[David Meents]]',
        url: '[GitHub](https://github.com/dmeents/poe2-overlord)',
        description: 'A powerful game overlay for Path of Exile 2',
      },
    });
  });

  it('resolves the display name from the title attribute', async () => {
    logseq.Editor.getPage.mockResolvedValue({ name: 'david meents', title: 'David Meents' });

    const result = await getPageV2('david meents');

    expect(result?.name).toBe('David Meents');
  });

  it('caches within the TTL', async () => {
    logseq.Editor.getPage.mockResolvedValue({ title: 'Page' });

    await getPageV2('page');
    await getPageV2('page');

    expect(logseq.Editor.getPage).toHaveBeenCalledTimes(1);
  });

  it('bypasses the cache when useCache is false', async () => {
    logseq.Editor.getPage.mockResolvedValue({ title: 'Page' });

    await getPageV2('page');
    await getPageV2('page', { useCache: false });

    expect(logseq.Editor.getPage).toHaveBeenCalledTimes(2);
  });

  it('uses case-insensitive cache keys', async () => {
    logseq.Editor.getPage.mockResolvedValue({ title: 'Page' });

    await getPageV2('Page');
    await getPageV2('page');
    await getPageV2('PAGE');

    expect(logseq.Editor.getPage).toHaveBeenCalledTimes(1);
  });

  it('returns null when the page does not exist', async () => {
    logseq.Editor.getPage.mockResolvedValue(null);

    expect(await getPageV2('missing')).toBeNull();
  });

  it('returns null on error', async () => {
    logseq.Editor.getPage.mockRejectedValue(new Error('boom'));

    expect(await getPageV2('boom')).toBeNull();
  });
});

describe('clearPageCacheV2', () => {
  beforeEach(() => {
    logseq.Editor.getPage.mockResolvedValue({ title: 'Page' });
    logseq.DB.datascriptQuery.mockResolvedValue([]);
  });

  it('clears a specific page', async () => {
    await getPageV2('page1');
    await getPageV2('page2');

    clearPageCacheV2('page1');

    await getPageV2('page1'); // refetch
    await getPageV2('page2'); // cached

    expect(logseq.Editor.getPage).toHaveBeenCalledTimes(3);
  });

  it('clears the entire cache when no page is specified', async () => {
    await getPageV2('page1');
    await getPageV2('page2');
    const calls = logseq.Editor.getPage.mock.calls.length;

    clearPageCacheV2();

    await getPageV2('page1');
    await getPageV2('page2');

    expect(logseq.Editor.getPage.mock.calls.length).toBe(calls + 2);
  });
});

describe('getPageBlocksV2', () => {
  it('maps the block tree (delegating to the shared mapper)', async () => {
    logseq.Editor.getPageBlocksTree.mockResolvedValue([
      { content: 'Parent', children: [{ content: 'Child', children: [] }] },
    ]);

    const result = await getPageBlocksV2('page');

    expect(result).toEqual([{ content: 'Parent', children: [{ content: 'Child', children: [] }] }]);
  });
});
