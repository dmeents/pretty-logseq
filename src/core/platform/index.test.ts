import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setVersionForTest } from '../version';
import { getPlatform, pickStyles, setPlatformForTest } from './index';
import type { Platform } from './types';

describe('getPlatform', () => {
  beforeEach(() => {
    setVersionForTest(null);
    setPlatformForTest(null);
  });

  afterEach(() => {
    setVersionForTest(null);
    setPlatformForTest(null);
  });

  it('defaults to the v1 platform before detection', () => {
    expect(getPlatform().version).toBe('v1');
    expect(getPlatform().selectors.observerRoot).toBe('#main-content-container');
  });

  it('selects the v2 platform when the detected version is v2', () => {
    setVersionForTest('v2');
    expect(getPlatform().version).toBe('v2');
  });

  it('v2 mirrors v1 selectors/api/theme until overridden', () => {
    setVersionForTest('v2');
    const v2 = getPlatform();
    setVersionForTest('v1');
    const v1 = getPlatform();

    expect(v2.selectors).toEqual(v1.selectors);
    expect(v2.theme).toEqual(v1.theme);
  });

  it('honors a test override regardless of version', () => {
    const fake = { version: 'v2', selectors: { observerRoot: '#fake' } } as unknown as Platform;
    setPlatformForTest(fake);
    expect(getPlatform()).toBe(fake);
  });
});

describe('pickStyles', () => {
  beforeEach(() => {
    setVersionForTest(null);
  });

  afterEach(() => {
    setVersionForTest(null);
  });

  it('returns v1 styles on v1', () => {
    setVersionForTest('v1');
    expect(pickStyles({ v1: 'V1', v2: 'V2' })).toBe('V1');
  });

  it('returns v2 styles on v2 when provided', () => {
    setVersionForTest('v2');
    expect(pickStyles({ v1: 'V1', v2: 'V2' })).toBe('V2');
  });

  it('falls back to v1 on v2 when v2 is empty/omitted', () => {
    setVersionForTest('v2');
    expect(pickStyles({ v1: 'V1', v2: '' })).toBe('V1');
    expect(pickStyles({ v1: 'V1' })).toBe('V1');
  });
});
