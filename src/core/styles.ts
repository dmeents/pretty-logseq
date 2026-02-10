/**
 * Style Management
 *
 * Handles aggregation and injection of all plugin styles.
 * Collects styles from base, content, and features into a single injection.
 * Supports conditional styles based on plugin settings.
 */

import { registry } from './registry';
import { generateThemeCSS } from './theme';

const STYLE_KEY = 'pretty-logseq-styles';

export function injectStyles(): void {
  const aggregatedStyles = [generateThemeCSS(), registry.getAggregatedStyles()].join('\n');

  logseq.provideStyle({
    key: STYLE_KEY,
    style: aggregatedStyles,
  });
}

export function refreshStyles(): void {
  injectStyles();
}
