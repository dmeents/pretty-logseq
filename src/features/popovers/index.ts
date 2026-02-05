/**
 * Popovers Feature
 *
 * Custom hover previews for page references that display
 * page properties in a rich, styled popover.
 */

import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import { setupPopovers } from './manager';
import popoverStyles from './styles.scss?inline';

let cleanup: (() => void) | null = null;

export const popoversFeature: Feature = {
  id: 'popovers',
  name: 'Page Popovers',
  description: 'Custom hover previews for page references',

  getStyles() {
    return getSettings().enablePopovers ? popoverStyles : '';
  },

  init() {
    if (!getSettings().enablePopovers) return;
    cleanup = setupPopovers();
  },

  destroy() {
    cleanup?.();
    cleanup = null;
  },
};
