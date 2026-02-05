/**
 * Popovers Feature
 *
 * Custom hover previews for page references that display
 * page properties in a rich, styled popover.
 */

import type { Feature } from '../../types';
import { setupPopovers } from './manager';
import popoverStyles from './styles.scss?inline';

let cleanup: (() => void) | null = null;

export const popoversFeature: Feature = {
  id: 'popovers',
  name: 'Page Popovers',
  description: 'Custom hover previews for page references',

  getStyles() {
    return popoverStyles;
  },

  init() {
    cleanup = setupPopovers();
  },

  destroy() {
    cleanup?.();
    cleanup = null;
  },
};
