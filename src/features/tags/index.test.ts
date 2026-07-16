/**
 * Tests for Pretty Tags Feature
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setVersionForTest } from '../../core/version';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import { tagsFeature } from './index';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    enablePrettyTags: true,
  })),
}));

vi.mock('./styles.scss?inline', () => ({
  default: '',
}));

vi.mock('./styles.v2.scss?inline', () => ({
  default: '.block-tag { }',
}));

describe('Tags Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(tagsFeature.id).toBe('tags');
    });

    it('has correct name', () => {
      expect(tagsFeature.name).toBe('Pretty Tags');
    });

    it('has a description', () => {
      expect(tagsFeature.description).toBeTruthy();
    });
  });

  describe('getStyles', () => {
    afterEach(() => {
      setVersionForTest(null);
    });

    it('injects nothing on v1 (no block-tag pill surface)', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTags: true,
      } as PluginSettings);
      setVersionForTest('v1');

      expect(tagsFeature.getStyles()).toBe('');
    });

    it('returns v2 pill styles when enabled on v2', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTags: true,
      } as PluginSettings);
      setVersionForTest('v2');

      expect(tagsFeature.getStyles()).toBe('.block-tag { }');
    });

    it('returns empty string when disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTags: false,
      } as PluginSettings);
      setVersionForTest('v2');

      expect(tagsFeature.getStyles()).toBe('');
    });
  });

  describe('init/destroy', () => {
    it('does not throw', () => {
      expect(() => tagsFeature.init()).not.toThrow();
      expect(() => tagsFeature.destroy()).not.toThrow();
    });
  });
});
