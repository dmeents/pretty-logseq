import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import { clearFavoritesCache, refreshFavorites } from './favorites/api';
import { cleanupFavoriteObserver, setupFavoriteObserver } from './favorites/observer';
import favoritesStyles from './favorites/styles.scss?inline';
import styles from './styles.scss?inline';
import threadingStyles from './threading.scss?inline';

export const contentFeature: Feature = {
  id: 'content',
  name: 'Content',
  description: 'Content block styling and enhancements',

  getStyles() {
    const settings = getSettings();
    const parts: string[] = [styles];
    if (settings.enableBulletThreading) parts.push(threadingStyles);
    if (settings.enableFavoriteStar) parts.push(favoritesStyles);
    return parts.join('\n');
  },

  async init() {
    const settings = getSettings();
    if (settings.enableFavoriteStar) {
      await refreshFavorites();
      setupFavoriteObserver();
    }
  },

  destroy() {
    cleanupFavoriteObserver();
    clearFavoritesCache();
  },
};
