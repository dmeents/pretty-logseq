import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import { setupPropertyObserver } from './observer';
import styles from './styles.scss?inline';

/** The version-specific slice of a feature (everything but its identity). */
export type PropertiesStrategy = Pick<Feature, 'getStyles' | 'init' | 'destroy'>;

let cleanup: (() => void) | null = null;

/**
 * Logseq v1 (file/markdown) properties: styles the `.page-properties` block and,
 * when enabled, runs the icon observer.
 */
export const propertiesV1: PropertiesStrategy = {
  getStyles() {
    return getSettings().enablePrettyProperties ? styles : '';
  },

  init() {
    const settings = getSettings();
    if (!settings.enablePrettyProperties) return;
    if (settings.showPropertyIcons) cleanup = setupPropertyObserver();
  },

  destroy() {
    cleanup?.();
    cleanup = null;
  },
};
