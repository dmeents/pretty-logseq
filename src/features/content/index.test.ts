/**
 * Tests for Content Feature
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import { contentFeature } from './index';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    enableBulletThreading: false,
  })),
}));

vi.mock('./styles.scss?inline', () => ({
  default: '.content-styles { }',
}));

vi.mock('./threading.scss?inline', () => ({
  default: '.threading-styles { }',
}));

describe('Content Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(contentFeature.id).toBe('content');
    });

    it('has correct name', () => {
      expect(contentFeature.name).toBe('Content');
    });

    it('has a description', () => {
      expect(contentFeature.description).toBeTruthy();
    });
  });

  describe('getStyles', () => {
    it('always includes base content styles', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableBulletThreading: false,
      } as PluginSettings);

      expect(contentFeature.getStyles()).toContain('.content-styles');
    });

    it('includes threading styles when enableBulletThreading is true', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableBulletThreading: true,
      } as PluginSettings);

      const styles = contentFeature.getStyles();
      expect(styles).toContain('.content-styles');
      expect(styles).toContain('.threading-styles');
    });

    it('excludes threading styles when enableBulletThreading is false', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableBulletThreading: false,
      } as PluginSettings);

      const styles = contentFeature.getStyles();
      expect(styles).toContain('.content-styles');
      expect(styles).not.toContain('.threading-styles');
    });
  });

  describe('init', () => {
    it('does not throw', () => {
      expect(() => contentFeature.init()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('does not throw', () => {
      expect(() => contentFeature.destroy()).not.toThrow();
    });
  });
});
