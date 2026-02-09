/**
 * Tests for Topbar Feature
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import * as handlersModule from './handlers';
import { applyNavArrowsSetting, topbarFeature } from './index';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    navArrowsLeft: false,
    hideHomeButton: false,
    hideSyncIndicator: false,
  })),
}));

vi.mock('./handlers', () => ({
  createNavArrowsInLeft: vi.fn(() => vi.fn()),
}));

vi.mock('./styles.scss?inline', () => ({
  default: '.nav-arrows { }',
}));

vi.mock('./hide-home.scss?inline', () => ({
  default: '.hide-home { }',
}));

vi.mock('./hide-sync.scss?inline', () => ({
  default: '.hide-sync { }',
}));

describe('Topbar Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset module-level state by destroying then re-initializing
    topbarFeature.destroy();
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(topbarFeature.id).toBe('topbar');
    });

    it('has correct name', () => {
      expect(topbarFeature.name).toBe('Top Navigation');
    });

    it('has a description', () => {
      expect(topbarFeature.description).toBeTruthy();
    });
  });

  describe('getStyles', () => {
    it('returns empty when all settings disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        navArrowsLeft: false,
        hideHomeButton: false,
        hideSyncIndicator: false,
      } as PluginSettings);

      expect(topbarFeature.getStyles()).toBe('');
    });

    it('includes nav arrows styles when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        navArrowsLeft: true,
        hideHomeButton: false,
        hideSyncIndicator: false,
      } as PluginSettings);

      expect(topbarFeature.getStyles()).toContain('.nav-arrows');
    });

    it('includes hide home styles when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        navArrowsLeft: false,
        hideHomeButton: true,
        hideSyncIndicator: false,
      } as PluginSettings);

      expect(topbarFeature.getStyles()).toContain('.hide-home');
    });

    it('includes hide sync styles when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        navArrowsLeft: false,
        hideHomeButton: false,
        hideSyncIndicator: true,
      } as PluginSettings);

      expect(topbarFeature.getStyles()).toContain('.hide-sync');
    });

    it('combines all styles when all enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        navArrowsLeft: true,
        hideHomeButton: true,
        hideSyncIndicator: true,
      } as PluginSettings);

      const styles = topbarFeature.getStyles();
      expect(styles).toContain('.nav-arrows');
      expect(styles).toContain('.hide-home');
      expect(styles).toContain('.hide-sync');
    });
  });

  describe('init', () => {
    it('calls applyNavArrowsSetting', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        navArrowsLeft: true,
      } as PluginSettings);

      topbarFeature.init();

      expect(handlersModule.createNavArrowsInLeft).toHaveBeenCalledTimes(1);
    });

    it('does not create nav arrows when disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        navArrowsLeft: false,
      } as PluginSettings);

      topbarFeature.init();

      expect(handlersModule.createNavArrowsInLeft).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('calls nav arrows cleanup when active', () => {
      const mockCleanup = vi.fn();
      vi.mocked(handlersModule.createNavArrowsInLeft).mockReturnValue(mockCleanup);
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        navArrowsLeft: true,
      } as PluginSettings);

      topbarFeature.init();
      topbarFeature.destroy();

      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });

    it('does not throw when cleanup is null', () => {
      expect(() => topbarFeature.destroy()).not.toThrow();
    });
  });
});

describe('applyNavArrowsSetting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    topbarFeature.destroy();
  });

  it('creates nav arrows when setting is enabled', () => {
    vi.mocked(settingsModule.getSettings).mockReturnValue({
      navArrowsLeft: true,
    } as PluginSettings);

    applyNavArrowsSetting();

    expect(handlersModule.createNavArrowsInLeft).toHaveBeenCalledTimes(1);
  });

  it('is idempotent — does not create twice', () => {
    vi.mocked(settingsModule.getSettings).mockReturnValue({
      navArrowsLeft: true,
    } as PluginSettings);

    applyNavArrowsSetting();
    applyNavArrowsSetting();

    expect(handlersModule.createNavArrowsInLeft).toHaveBeenCalledTimes(1);
  });

  it('removes nav arrows when setting is disabled', () => {
    const mockCleanup = vi.fn();
    vi.mocked(handlersModule.createNavArrowsInLeft).mockReturnValue(mockCleanup);
    vi.mocked(settingsModule.getSettings).mockReturnValue({
      navArrowsLeft: true,
    } as PluginSettings);

    applyNavArrowsSetting(); // Enable

    vi.mocked(settingsModule.getSettings).mockReturnValue({
      navArrowsLeft: false,
    } as PluginSettings);

    applyNavArrowsSetting(); // Disable

    expect(mockCleanup).toHaveBeenCalledTimes(1);
  });
});
