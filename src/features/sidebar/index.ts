/**
 * Sidebar Feature
 *
 * Customizations for Logseq's left sidebar navigation.
 */

import { pickStyles } from '../../core/platform';
import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import compactNavStyles from './compact-nav.scss?inline';
import compactNavStylesV2 from './compact-nav.v2.scss?inline';
import graphBottomStyles from './graph-bottom.scss?inline';
import graphBottomStylesV2 from './graph-bottom.v2.scss?inline';
import hideCreateStyles from './hide-create.scss?inline';

export const sidebarFeature: Feature = {
  id: 'sidebar',
  name: 'Left Sidebar',
  description: 'Customizations for the left sidebar navigation',

  getStyles() {
    const settings = getSettings();
    const styles: string[] = [];

    if (settings.compactSidebarNav)
      styles.push(pickStyles({ v1: compactNavStyles, v2: compactNavStylesV2 }));
    // hide-create targets v1's `.create` element; it's a harmless no-op in v2.
    if (settings.hideCreateButton) styles.push(hideCreateStyles);
    if (settings.graphSelectorBottom)
      styles.push(pickStyles({ v1: graphBottomStyles, v2: graphBottomStylesV2 }));

    if (settings.graphSelectorBottom && !settings.hideCreateButton) {
      styles.push('#left-sidebar > div > div > footer { padding-bottom: 56px; }');
    }

    return styles.join('\n');
  },

  init() {},

  destroy() {},
};
