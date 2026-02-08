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
import tablesStyles from '../styles/components/tables.scss?inline';
import templateBlocksStyles from '../styles/components/template-blocks.scss?inline';
import typographyStyles from '../styles/components/typography.scss?inline';
import { registry } from './registry';
import { generateThemeCSS } from './theme';

const STYLE_KEY = 'pretty-logseq-styles';

export function injectStyles(): void {
  const settings = getSettings();

  const componentStyles = [pagePropertiesStyles, headersStyles];

  if (settings.enablePrettyTypography) {
    componentStyles.push(typographyStyles);
  }

  if (settings.enablePrettyTables) {
    componentStyles.push(tablesStyles);
  }

  if (settings.enablePrettyTemplates) {
    componentStyles.push(templateBlocksStyles);
  }

  const aggregatedStyles = [
    generateThemeCSS(),
    ...componentStyles,
    registry.getAggregatedStyles(),
  ].join('\n');

  logseq.provideStyle({
    key: STYLE_KEY,
    style: aggregatedStyles,
  });
}

export function refreshStyles(): void {
  injectStyles();
}
