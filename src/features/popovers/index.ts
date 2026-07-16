import { pickStyles } from '../../core/platform';
import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import { setupPopovers } from './manager';
import popoverStyles from './styles.scss?inline';
import popoverStylesV2 from './styles.v2.scss?inline';

let cleanup: (() => void) | null = null;

// Custom hover previews for page references that display
// page properties in a rich, styled popover.
export const popoversFeature: Feature = {
  id: 'popovers',
  name: 'Page Popovers',
  description: 'Custom hover previews for page references',

  getStyles() {
    return getSettings().enablePopovers
      ? pickStyles({ v1: popoverStyles, v2: popoverStylesV2 })
      : '';
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
