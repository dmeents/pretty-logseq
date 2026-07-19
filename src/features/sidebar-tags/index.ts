/**
 * Sidebar Page Tags Feature (v2 / DB app only)
 *
 * The DB app renders a tagged page's tag inline in the left sidebar
 * (e.g. "Next.JS #Technology" in Favorites/Recent). This feature either hides
 * that tag suffix or restyles it (right-aligned, smaller, accent-tinted),
 * controlled by the `sidebarPageTags` setting: 'off' | 'hide' | 'subtle'.
 *
 * v1 (the file app) has no tag suffix in sidebar page names, so this is purely
 * additive — `getStyles`/`init` no-op there.
 */

import { getVersion } from '../../core/version';
import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import hideStyles from './hide.scss?inline';
import { setupSidebarTagObserver } from './observer';
import subtleStyles from './subtle.scss?inline';

let cleanup: (() => void) | null = null;

export const sidebarTagsFeature: Feature = {
  id: 'sidebar-tags',
  name: 'Sidebar Page Tags',
  description:
    "Hide or restyle the tag suffix on tagged pages in the left sidebar's Favorites/Recent lists.",

  getStyles() {
    if (getVersion() !== 'v2') return '';
    switch (getSettings().sidebarPageTags) {
      case 'hide':
        return hideStyles;
      case 'subtle':
        return subtleStyles;
      default:
        return '';
    }
  },

  init() {
    if (getVersion() !== 'v2') return;
    if (getSettings().sidebarPageTags === 'off') return;
    cleanup = setupSidebarTagObserver();
  },

  destroy() {
    cleanup?.();
    cleanup = null;
  },
};
