import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import { setupPropertyObserver } from './observer';
import styles from './styles.scss?inline';

let cleanup: (() => void) | null = null;

/**
 * Styles page property blocks with accent borders, refined keys,
 * and pipe-separated values. Optionally displays icons for property
 * keys that have an icon:: property on their page.
 */
export const propertiesFeature: Feature = {
  id: 'properties',
  name: 'Pretty Properties',
  description: 'Style page property blocks with accent borders and refined formatting',

  getStyles() {
    return getSettings().enablePrettyProperties ? styles : '';
  },

  init() {
    const settings = getSettings();
    if (!settings.enablePrettyProperties) return;
    if (settings.showPropertyIcons) {
      cleanup = setupPropertyObserver();
    }
  },

  destroy() {
    cleanup?.();
    cleanup = null;
  },
};
