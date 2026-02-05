/**
 * Pretty Links Feature
 *
 * Enhances external links with inline favicons and
 * hover preview cards showing page metadata.
 */

import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import { cleanupAllLinks, decorateLink } from './favicons';
import { setupLinkObserver } from './observer';
import { setupLinkPopovers } from './popover';
import linkStyles from './styles.scss?inline';

let observerCleanup: (() => void) | null = null;
let popoverCleanup: (() => void) | null = null;

export const linksFeature: Feature = {
  id: 'links',
  name: 'Pretty Links',
  description: 'Enhanced external links with favicons and hover preview cards',

  getStyles() {
    return getSettings().enablePrettyLinks ? linkStyles : '';
  },

  init() {
    if (!getSettings().enablePrettyLinks) return;

    observerCleanup = setupLinkObserver(links => {
      for (const link of links) {
        decorateLink(link);
      }
    });

    popoverCleanup = setupLinkPopovers();
  },

  destroy() {
    observerCleanup?.();
    observerCleanup = null;
    popoverCleanup?.();
    popoverCleanup = null;

    const doc = top?.document ?? parent.document;
    cleanupAllLinks(doc);
  },
};
