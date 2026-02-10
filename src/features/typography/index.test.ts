/**
 * Tests for Typography Feature
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import { typographyFeature } from './index';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    enablePrettyTypography: true,
  })),
}));

vi.mock('./headers.scss?inline', () => ({
  default: '.header-styles { }',
}));

vi.mock('./styles.scss?inline', () => ({
  default: '.typography-styles { }',
}));

describe('Typography Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(typographyFeature.id).toBe('typography');
    });

    it('has correct name', () => {
      expect(typographyFeature.name).toBe('Pretty Typography');
    });

    it('has a description', () => {
      expect(typographyFeature.description).toBeTruthy();
    });
  });

  describe('getStyles', () => {
    it('always includes header styles', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTypography: false,
      } as PluginSettings);

      expect(typographyFeature.getStyles()).toContain('.header-styles');
    });

    it('includes typography styles when enablePrettyTypography is true', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTypography: true,
      } as PluginSettings);

      const styles = typographyFeature.getStyles();
      expect(styles).toContain('.header-styles');
      expect(styles).toContain('.typography-styles');
    });

    it('excludes typography styles when enablePrettyTypography is false', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTypography: false,
      } as PluginSettings);

      const styles = typographyFeature.getStyles();
      expect(styles).toContain('.header-styles');
      expect(styles).not.toContain('.typography-styles');
    });
  });

  describe('init', () => {
    it('does not throw', () => {
      expect(() => typographyFeature.init()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('does not throw', () => {
      expect(() => typographyFeature.destroy()).not.toThrow();
    });
  });
});
