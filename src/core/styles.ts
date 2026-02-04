/**
 * Style Management
 *
 * Handles aggregation and injection of all plugin styles.
 * Collects styles from base, content, and features into a single injection.
 */

import baseStyles from '../styles/base.scss?inline';
import contentStyles from '../styles/content.scss?inline';
import { registry } from './registry';

const STYLE_KEY = 'pretty-logseq-styles';

/**
 * Inject all plugin styles into Logseq
 */
export function injectStyles(): void {
  const aggregatedStyles = [
    '/* ========================================',
    '   Pretty Logseq Plugin Styles',
    '   ======================================== */',
    '',
    '/* Base Styles */',
    baseStyles,
    '',
    '/* Content Styles */',
    contentStyles,
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
