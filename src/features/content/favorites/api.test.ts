/**
 * Tests for Favorites API
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { clearFavoritesCache, isFavorited, refreshFavorites, toggleFavorite } from './api';

describe('refreshFavorites', () => {
  beforeEach(() => {
    clearFavoritesCache();
  });

  it('loads favorites from Logseq API', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Page One', 'Page Two', 'Another Page']);

    await refreshFavorites();

    expect(isFavorited('Page One')).toBe(true);
    expect(isFavorited('Page Two')).toBe(true);
    expect(isFavorited('Another Page')).toBe(true);
    expect(isFavorited('Not Favorited')).toBe(false);
  });

  it('handles case-insensitive favorites', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Test Page']);

    await refreshFavorites();

    expect(isFavorited('Test Page')).toBe(true);
    expect(isFavorited('test page')).toBe(true);
    expect(isFavorited('TEST PAGE')).toBe(true);
    expect(isFavorited('TeSt PaGe')).toBe(true);
  });

  it('handles null favorites gracefully', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(null);

    await refreshFavorites();

    expect(isFavorited('anything')).toBe(false);
  });

  it('handles empty favorites list', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue([]);

    await refreshFavorites();

    expect(isFavorited('anything')).toBe(false);
  });

  it('handles API errors gracefully', async () => {
    logseq.App.getCurrentGraphFavorites.mockRejectedValue(new Error('API Error'));

    await refreshFavorites();

    expect(isFavorited('anything')).toBe(false);
  });

  it('replaces existing cache on refresh', async () => {
    // First refresh
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Old Page']);
    await refreshFavorites();
    expect(isFavorited('Old Page')).toBe(true);

    // Second refresh with different data
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['New Page']);
    await refreshFavorites();
    expect(isFavorited('Old Page')).toBe(false);
    expect(isFavorited('New Page')).toBe(true);
  });
});

describe('isFavorited', () => {
  beforeEach(async () => {
    clearFavoritesCache();
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Favorite One', 'Favorite Two']);
    await refreshFavorites();
  });

  it('returns true for favorited pages', () => {
    expect(isFavorited('Favorite One')).toBe(true);
    expect(isFavorited('Favorite Two')).toBe(true);
  });

  it('returns false for non-favorited pages', () => {
    expect(isFavorited('Not Favorite')).toBe(false);
    expect(isFavorited('Random Page')).toBe(false);
  });

  it('is case-insensitive', () => {
    expect(isFavorited('favorite one')).toBe(true);
    expect(isFavorited('FAVORITE TWO')).toBe(true);
    expect(isFavorited('FaVoRiTe OnE')).toBe(true);
  });

  it('returns false before refreshFavorites is called', () => {
    clearFavoritesCache();
    expect(isFavorited('anything')).toBe(false);
  });
});

describe('toggleFavorite', () => {
  beforeEach(async () => {
    clearFavoritesCache();
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Already Favorited']);
    await refreshFavorites();
  });

  it('adds a page to favorites', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Already Favorited']);
    logseq.App.setCurrentGraphConfigs.mockResolvedValue(undefined);

    expect(isFavorited('New Page')).toBe(false);

    await toggleFavorite('New Page');

    expect(isFavorited('New Page')).toBe(true);
    expect(logseq.App.setCurrentGraphConfigs).toHaveBeenCalledWith({
      favorites: ['Already Favorited', 'New Page'],
    });
  });

  it('removes a page from favorites', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Already Favorited']);
    logseq.App.setCurrentGraphConfigs.mockResolvedValue(undefined);

    expect(isFavorited('Already Favorited')).toBe(true);

    await toggleFavorite('Already Favorited');

    expect(isFavorited('Already Favorited')).toBe(false);
    expect(logseq.App.setCurrentGraphConfigs).toHaveBeenCalledWith({
      favorites: [],
    });
  });

  it('preserves original case when adding favorites', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue([]);
    logseq.App.setCurrentGraphConfigs.mockResolvedValue(undefined);

    await toggleFavorite('My Cool Page');

    expect(logseq.App.setCurrentGraphConfigs).toHaveBeenCalledWith({
      favorites: ['My Cool Page'],
    });
  });

  it('is case-insensitive when removing favorites', async () => {
    // Initial setup and refresh
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Test Page']);
    await refreshFavorites();

    // Mock for the toggle call - returns the current state again
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Test Page']);
    logseq.App.setCurrentGraphConfigs.mockResolvedValue(undefined);

    // Try to remove with different case
    await toggleFavorite('test page');

    expect(logseq.App.setCurrentGraphConfigs).toHaveBeenCalledWith({
      favorites: [],
    });
  });

  it('optimistically updates cache', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Already Favorited']);
    logseq.App.setCurrentGraphConfigs.mockResolvedValue(undefined);

    expect(isFavorited('New Page')).toBe(false);

    // Don't await - check optimistic update
    const promise = toggleFavorite('New Page');
    expect(isFavorited('New Page')).toBe(true);

    await promise;
  });

  it('rolls back optimistic update on error when adding', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue([]);
    logseq.App.setCurrentGraphConfigs.mockRejectedValue(new Error('Write failed'));

    expect(isFavorited('New Page')).toBe(false);

    try {
      await toggleFavorite('New Page');
    } catch {
      // Expected error
    }

    expect(isFavorited('New Page')).toBe(false);
  });

  it('rolls back optimistic update on error when removing', async () => {
    // Initial setup and refresh
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Existing Page']);
    await refreshFavorites();

    expect(isFavorited('Existing Page')).toBe(true);

    // Mock error on setCurrentGraphConfigs
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Existing Page']);
    logseq.App.setCurrentGraphConfigs.mockRejectedValue(new Error('Write failed'));

    try {
      await toggleFavorite('Existing Page');
    } catch {
      // Expected error
    }

    expect(isFavorited('Existing Page')).toBe(true);
  });

  it('rethrows errors after rollback', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue([]);
    const error = new Error('API Error');
    logseq.App.setCurrentGraphConfigs.mockRejectedValue(error);

    await expect(toggleFavorite('Test')).rejects.toThrow('API Error');
  });

  it('handles multiple pages with similar names', async () => {
    // Initial setup and refresh
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Test', 'Test Page', 'Test Page Two']);
    await refreshFavorites();

    // Mock for toggle call
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Test', 'Test Page', 'Test Page Two']);
    logseq.App.setCurrentGraphConfigs.mockResolvedValue(undefined);

    await toggleFavorite('Test Page');

    expect(logseq.App.setCurrentGraphConfigs).toHaveBeenCalledWith({
      favorites: ['Test', 'Test Page Two'],
    });
  });
});

describe('clearFavoritesCache', () => {
  it('clears the favorites cache', async () => {
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['Test Page']);
    await refreshFavorites();

    expect(isFavorited('Test Page')).toBe(true);

    clearFavoritesCache();

    expect(isFavorited('Test Page')).toBe(false);
  });

  it('can be called multiple times safely', () => {
    clearFavoritesCache();
    clearFavoritesCache();
    clearFavoritesCache();

    expect(isFavorited('anything')).toBe(false);
  });

  it('clears cache without errors even if empty', () => {
    expect(() => clearFavoritesCache()).not.toThrow();
  });
});
