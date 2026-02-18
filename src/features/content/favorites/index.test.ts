/**
 * Tests for Favorites Feature
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the submodules BEFORE imports
vi.mock('./api', async () => {
  const actual = await vi.importActual('./api');
  return {
    ...actual,
    refreshFavorites: vi.fn(),
    clearFavoritesCache: vi.fn(),
  };
});

vi.mock('./observer', async () => {
  const actual = await vi.importActual('./observer');
  return {
    ...actual,
    setupFavoriteObserver: vi.fn(),
    cleanupFavoriteObserver: vi.fn(),
  };
});

// Mock the settings module
vi.mock('../../../settings', () => ({
  getSettings: vi.fn(() => ({ enableFavoriteStar: true })),
}));

// Mock SCSS import
vi.mock('./styles.scss?inline', () => ({
  default: '.pl-favorite-star { display: inline-block; }',
}));

// Now import after mocks are set up
import * as settingsModule from '../../../settings';
import * as api from './api';
import { favoritesFeature } from './index';
import * as observer from './observer';

describe('favoritesFeature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset settings to defaults
    vi.mocked(settingsModule.getSettings).mockReturnValue({
      enableFavoriteStar: true,
    } as never);
  });

  it('has correct metadata', () => {
    expect(favoritesFeature.id).toBe('favorites');
    expect(favoritesFeature.name).toBe('Favorite Star');
    expect(favoritesFeature.description).toContain('Star button');
  });

  describe('getStyles', () => {
    it('returns styles when feature is enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableFavoriteStar: true,
      } as never);

      const styles = favoritesFeature.getStyles();

      expect(typeof styles).toBe('string');
      expect(styles.length).toBeGreaterThan(0);
    });

    it('returns empty string when feature is disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableFavoriteStar: false,
      } as never);

      const styles = favoritesFeature.getStyles();

      expect(styles).toBe('');
    });
  });

  describe('init', () => {
    it('initializes when feature is enabled', async () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableFavoriteStar: true,
      } as never);

      await favoritesFeature.init();

      expect(api.refreshFavorites).toHaveBeenCalledTimes(1);
      expect(observer.setupFavoriteObserver).toHaveBeenCalledTimes(1);
    });

    it('does not initialize when feature is disabled', async () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableFavoriteStar: false,
      } as never);

      await favoritesFeature.init();

      expect(api.refreshFavorites).not.toHaveBeenCalled();
      expect(observer.setupFavoriteObserver).not.toHaveBeenCalled();
    });

    it('refreshes favorites before setting up observer', async () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableFavoriteStar: true,
      } as never);

      const callOrder: string[] = [];

      vi.mocked(api.refreshFavorites).mockImplementation(async () => {
        callOrder.push('refresh');
      });

      vi.mocked(observer.setupFavoriteObserver).mockImplementation(() => {
        callOrder.push('setup');
      });

      await favoritesFeature.init();

      expect(callOrder).toEqual(['refresh', 'setup']);
    });

    it('handles refreshFavorites errors gracefully', async () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableFavoriteStar: true,
      } as never);

      vi.mocked(api.refreshFavorites).mockRejectedValue(new Error('Refresh failed'));

      await expect(favoritesFeature.init()).rejects.toThrow('Refresh failed');
    });
  });

  describe('destroy', () => {
    it('cleans up observer and cache', () => {
      favoritesFeature.destroy();

      expect(observer.cleanupFavoriteObserver).toHaveBeenCalledTimes(1);
      expect(api.clearFavoritesCache).toHaveBeenCalledTimes(1);
    });

    it('cleans up observer before clearing cache', () => {
      const callOrder: string[] = [];

      vi.mocked(observer.cleanupFavoriteObserver).mockImplementation(() => {
        callOrder.push('cleanup');
      });

      vi.mocked(api.clearFavoritesCache).mockImplementation(() => {
        callOrder.push('clear');
      });

      favoritesFeature.destroy();

      expect(callOrder).toEqual(['cleanup', 'clear']);
    });

    it('can be called multiple times safely', () => {
      favoritesFeature.destroy();
      favoritesFeature.destroy();
      favoritesFeature.destroy();

      expect(observer.cleanupFavoriteObserver).toHaveBeenCalledTimes(3);
      expect(api.clearFavoritesCache).toHaveBeenCalledTimes(3);
    });

    it('can be called without prior init', () => {
      expect(() => favoritesFeature.destroy()).not.toThrow();
    });
  });

  describe('lifecycle', () => {
    it('handles full init -> destroy cycle', async () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableFavoriteStar: true,
      } as never);

      // Reset mocks to resolve properly
      vi.mocked(api.refreshFavorites).mockResolvedValue(undefined);

      // Initialize
      await favoritesFeature.init();
      expect(api.refreshFavorites).toHaveBeenCalled();
      expect(observer.setupFavoriteObserver).toHaveBeenCalled();

      // Destroy
      favoritesFeature.destroy();
      expect(observer.cleanupFavoriteObserver).toHaveBeenCalled();
      expect(api.clearFavoritesCache).toHaveBeenCalled();
    });

    it('handles init -> destroy -> init cycle', async () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enableFavoriteStar: true,
      } as never);

      // Reset mocks to resolve properly
      vi.mocked(api.refreshFavorites).mockResolvedValue(undefined);

      // First cycle
      await favoritesFeature.init();
      favoritesFeature.destroy();

      vi.clearAllMocks();
      vi.mocked(api.refreshFavorites).mockResolvedValue(undefined);

      // Second cycle
      await favoritesFeature.init();
      expect(api.refreshFavorites).toHaveBeenCalled();
      expect(observer.setupFavoriteObserver).toHaveBeenCalled();

      favoritesFeature.destroy();
    });
  });
});
