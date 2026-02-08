import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import { createNavArrowsInLeft } from './handlers';
import navArrowsStyles from './styles.scss?inline';

let navArrowsCleanup: (() => void) | null = null;

/**
 * Apply or remove nav arrows repositioning based on current settings.
 * Idempotent — safe to call multiple times.
 */
export function applyNavArrowsSetting(): void {
  const settings = getSettings();

  if (settings.navArrowsLeft) {
    if (!navArrowsCleanup) navArrowsCleanup = createNavArrowsInLeft();
  } else {
    if (navArrowsCleanup) {
      navArrowsCleanup();
      navArrowsCleanup = null;
    }
  }
}

export const topbarFeature: Feature = {
  id: 'topbar',
  name: 'Top Navigation',
  description: 'Customizations for the top navigation bar',

  getStyles() {
    const settings = getSettings();
    return settings.navArrowsLeft ? navArrowsStyles : '';
  },

  init() {
    applyNavArrowsSetting();
  },

  destroy() {
    if (navArrowsCleanup) {
      navArrowsCleanup();
      navArrowsCleanup = null;
    }
  },
};
