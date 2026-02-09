/**
 * Sidebar Feature
 *
 * Customizations for Logseq's left sidebar navigation.
 */

import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import compactNavStyles from './compact-nav.scss?inline';
import graphBottomStyles from './graph-bottom.scss?inline';
import hideCreateStyles from './hide-create.scss?inline';

export const sidebarFeature: Feature = {
  id: 'sidebar',
  name: 'Left Sidebar',
  description: 'Customizations for the left sidebar navigation',

  getStyles() {
    const settings = getSettings();
    const styles: string[] = [];

    if (settings.compactSidebarNav) styles.push(compactNavStyles);
    if (settings.hideCreateButton) styles.push(hideCreateStyles);
    if (settings.graphSelectorBottom) styles.push(graphBottomStyles);

    if (settings.graphSelectorBottom && !settings.hideCreateButton) {
      styles.push(
        '#left-sidebar > div > div > footer { padding-bottom: 56px; }',
      );
    }

    return styles.join('\n');
  },

  init() { },

  destroy() { },
};
