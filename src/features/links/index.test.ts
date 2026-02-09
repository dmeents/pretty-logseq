/**
 * Tests for Links Feature
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import * as faviconsModule from './favicons';
import { linksFeature } from './index';
import * as observerModule from './observer';
import * as popoverModule from './popover';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    enablePrettyLinks: true,
  })),
}));

vi.mock('./observer', () => ({
  setupLinkObserver: vi.fn(() => vi.fn()),
}));

vi.mock('./popover', () => ({
  setupLinkPopovers: vi.fn(() => vi.fn()),
}));

vi.mock('./favicons', () => ({
  decorateLink: vi.fn(),
  cleanupAllLinks: vi.fn(),
  getFaviconUrl: vi.fn(),
  FALLBACK_ICON: 'data:mock',
}));

vi.mock('./styles.scss?inline', () => ({
  default: '.link-styles { }',
}));

describe('Links Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(linksFeature.id).toBe('links');
    });

    it('has correct name', () => {
      expect(linksFeature.name).toBe('Pretty Links');
    });

    it('has a description', () => {
      expect(linksFeature.description).toBeTruthy();
    });
  });

  describe('getStyles', () => {
    it('returns styles when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyLinks: true,
      } as PluginSettings);

      const styles = linksFeature.getStyles();

      expect(styles).toBe('.link-styles { }');
    });

    it('returns empty string when disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyLinks: false,
      } as PluginSettings);

      const styles = linksFeature.getStyles();

      expect(styles).toBe('');
    });
  });

  describe('init', () => {
    it('sets up observer and popovers when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyLinks: true,
      } as PluginSettings);

      linksFeature.init();

      expect(observerModule.setupLinkObserver).toHaveBeenCalledTimes(1);
      expect(popoverModule.setupLinkPopovers).toHaveBeenCalledTimes(1);
    });

    it('does not set up when disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyLinks: false,
      } as PluginSettings);

      linksFeature.init();

      expect(observerModule.setupLinkObserver).not.toHaveBeenCalled();
      expect(popoverModule.setupLinkPopovers).not.toHaveBeenCalled();
    });

    it('passes decorateLink as callback to observer', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyLinks: true,
      } as PluginSettings);

      linksFeature.init();

      // Get the callback passed to setupLinkObserver
      const callback = vi.mocked(observerModule.setupLinkObserver).mock.calls[0][0];
      const mockLinks = [document.createElement('a'), document.createElement('a')];
      callback(mockLinks as HTMLAnchorElement[]);

      expect(faviconsModule.decorateLink).toHaveBeenCalledTimes(2);
    });
  });

  describe('destroy', () => {
    it('calls cleanup functions', () => {
      const observerCleanup = vi.fn();
      const popoverCleanup = vi.fn();
      vi.mocked(observerModule.setupLinkObserver).mockReturnValue(observerCleanup);
      vi.mocked(popoverModule.setupLinkPopovers).mockReturnValue(popoverCleanup);
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyLinks: true,
      } as PluginSettings);

      linksFeature.init();
      linksFeature.destroy();

      expect(observerCleanup).toHaveBeenCalledTimes(1);
      expect(popoverCleanup).toHaveBeenCalledTimes(1);
    });

    it('calls cleanupAllLinks', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyLinks: true,
      } as PluginSettings);

      linksFeature.init();
      linksFeature.destroy();

      expect(faviconsModule.cleanupAllLinks).toHaveBeenCalledTimes(1);
    });

    it('does not throw when cleanup is null', () => {
      expect(() => linksFeature.destroy()).not.toThrow();
    });

    it('nullifies cleanup after calling', () => {
      const observerCleanup = vi.fn();
      const popoverCleanup = vi.fn();
      vi.mocked(observerModule.setupLinkObserver).mockReturnValue(observerCleanup);
      vi.mocked(popoverModule.setupLinkPopovers).mockReturnValue(popoverCleanup);
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyLinks: true,
      } as PluginSettings);

      linksFeature.init();
      linksFeature.destroy();
      linksFeature.destroy(); // Second call

      expect(observerCleanup).toHaveBeenCalledTimes(1);
      expect(popoverCleanup).toHaveBeenCalledTimes(1);
    });
  });
});
