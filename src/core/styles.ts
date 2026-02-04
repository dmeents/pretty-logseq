/**
 * Style Management
 *
 * Handles aggregation and injection of all plugin styles.
 * Collects styles from base, content, and features into a single injection.
 * Supports conditional styles based on plugin settings.
 */

import { getSettings } from '../settings';
import headersStyles from '../styles/components/headers.scss?inline';
import pagePropertiesStyles from '../styles/components/page-properties.scss?inline';
import sidebarGraphBottomStyles from '../styles/components/sidebar-graph-bottom.scss?inline';
import sidebarHideCreateStyles from '../styles/components/sidebar-hide-create.scss?inline';
import sidebarNavStyles from '../styles/components/sidebar-nav.scss?inline';
import { registry } from './registry';
import { generateThemeCSS } from './theme';

const STYLE_KEY = 'pretty-logseq-styles';

/**
 * Inject all plugin styles into Logseq
 */
export function injectStyles(): void {
  const settings = getSettings();

  const componentStyles = [pagePropertiesStyles, headersStyles];

  // Conditionally include sidebar styles based on settings
  if (settings.compactSidebarNav) {
    componentStyles.push(sidebarNavStyles);
  }
  if (settings.hideCreateButton) {
    componentStyles.push(sidebarHideCreateStyles);
  }
  if (settings.graphSelectorBottom) {
    componentStyles.push(sidebarGraphBottomStyles);
  }

  const aggregatedStyles = [
    '/* ========================================',
    '   Pretty Logseq Plugin Styles',
    '   ======================================== */',
    '',
    '/* Theme Colors (auto-detected from Logseq) */',
    generateThemeCSS(),
    '',
    '/* Component Styles */',
    ...componentStyles,
    '',
    '/* Feature Styles */',
    registry.getAggregatedStyles(),
  ].join('\n');

  logseq.provideStyle({
    key: STYLE_KEY,
    style: aggregatedStyles,
  });
}

/**
 * Re-inject styles (for dynamic updates)
 */
export function refreshStyles(): void {
  injectStyles();
}
