/**
 * Tests for Tables Feature
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setVersionForTest } from '../../core/version';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import { tablesFeature } from './index';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    enablePrettyTables: true,
  })),
}));

vi.mock('./styles.scss?inline', () => ({
  default: '.table-styles { }',
}));

vi.mock('./styles.v2.scss?inline', () => ({
  default: '.table-styles-v2 { }',
}));

describe('Tables Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(tablesFeature.id).toBe('tables');
    });

    it('has correct name', () => {
      expect(tablesFeature.name).toBe('Pretty Tables');
    });

    it('has a description', () => {
      expect(tablesFeature.description).toBeTruthy();
    });
  });

  describe('getStyles', () => {
    afterEach(() => {
      setVersionForTest(null);
    });

    it('returns v1 styles when enabled on v1', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTables: true,
      } as PluginSettings);
      setVersionForTest('v1');

      expect(tablesFeature.getStyles()).toBe('.table-styles { }');
    });

    it('returns v2 styles when enabled on v2', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTables: true,
      } as PluginSettings);
      setVersionForTest('v2');

      expect(tablesFeature.getStyles()).toBe('.table-styles-v2 { }');
    });

    it('returns empty string when disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTables: false,
      } as PluginSettings);

      expect(tablesFeature.getStyles()).toBe('');
    });
  });

  describe('init', () => {
    it('does not throw', () => {
      expect(() => tablesFeature.init()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('does not throw', () => {
      expect(() => tablesFeature.destroy()).not.toThrow();
    });
  });
});
