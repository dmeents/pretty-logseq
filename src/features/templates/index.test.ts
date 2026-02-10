/**
 * Tests for Templates Feature
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import { templatesFeature } from './index';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    enablePrettyTemplates: true,
  })),
}));

vi.mock('./styles.scss?inline', () => ({
  default: '.template-styles { }',
}));

describe('Templates Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(templatesFeature.id).toBe('templates');
    });

    it('has correct name', () => {
      expect(templatesFeature.name).toBe('Pretty Templates');
    });

    it('has a description', () => {
      expect(templatesFeature.description).toBeTruthy();
    });
  });

  describe('getStyles', () => {
    it('returns styles when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTemplates: true,
      } as PluginSettings);

      expect(templatesFeature.getStyles()).toBe('.template-styles { }');
    });

    it('returns empty string when disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTemplates: false,
      } as PluginSettings);

      expect(templatesFeature.getStyles()).toBe('');
    });
  });

  describe('init', () => {
    it('does not throw', () => {
      expect(() => templatesFeature.init()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('does not throw', () => {
      expect(() => templatesFeature.destroy()).not.toThrow();
    });
  });
});
