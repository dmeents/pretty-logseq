/**
 * Favorites Feature
 * Adds a star button next to page titles for one-click favorite toggling
 */

import { getSettings } from '../../../settings';
import type { Feature } from '../../../types';
import { clearFavoritesCache, refreshFavorites } from './api';
import { cleanupFavoriteObserver, setupFavoriteObserver } from './observer';
import styles from './styles.scss?inline';

/**
 * Adds a star button next to page titles for one-click favorite toggling
 */
export const favoritesFeature: Feature = {
  id: 'favorites',
  name: 'Favorite Star',
  description: 'Star button next to page titles for quick favorite toggling',

  getStyles() {
    return getSettings().enableFavoriteStar ? styles : '';
  },

  async init() {
    if (!getSettings().enableFavoriteStar) return;
    await refreshFavorites();
    setupFavoriteObserver();
  },

  destroy() {
    cleanupFavoriteObserver();
    clearFavoritesCache();
  },
};
