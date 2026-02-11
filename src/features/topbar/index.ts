import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import gradientStyles from './gradient.scss?inline';
import { createNavArrowsInLeft } from './handlers';
import hideHomeStyles from './hide-home.scss?inline';
import hideSyncStyles from './hide-sync.scss?inline';
import hideWindowControlsStyles from './hide-window-controls.scss?inline';
import iconStylingStyles from './icon-styling.scss?inline';
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
    const styles: string[] = [];

    if (settings.navArrowsLeft) styles.push(navArrowsStyles);
    if (settings.hideHomeButton) styles.push(hideHomeStyles);
    if (settings.hideSyncIndicator) styles.push(hideSyncStyles);
    if (settings.styleTopbarIcons) styles.push(iconStylingStyles);
    if (settings.topbarGradient) styles.push(gradientStyles);
    if (settings.hideWindowControls) styles.push(hideWindowControlsStyles);

    return styles.join('\n');
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
