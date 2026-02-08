/**
 * Style Management
 *
 * Handles aggregation and injection of all plugin styles.
 * Collects styles from base, content, and features into a single injection.
 * Supports conditional styles based on plugin settings.
 */

import { getSettings } from "../settings";
import headersStyles from "../styles/components/headers.scss?inline";
import pagePropertiesStyles from "../styles/components/page-properties.scss?inline";
import sidebarGraphBottomStyles from "../styles/components/sidebar-graph-bottom.scss?inline";
import sidebarHideCreateStyles from "../styles/components/sidebar-hide-create.scss?inline";
import sidebarNavStyles from "../styles/components/sidebar-nav.scss?inline";
import tablesStyles from "../styles/components/tables.scss?inline";
import templateBlocksStyles from "../styles/components/template-blocks.scss?inline";
import topbarHideHomeStyles from "../styles/components/topbar-hide-home.scss?inline";
import topbarHideSyncStyles from "../styles/components/topbar-hide-sync.scss?inline";
import typographyStyles from "../styles/components/typography.scss?inline";
import { registry } from "./registry";
import { generateThemeCSS } from "./theme";

const STYLE_KEY = "pretty-logseq-styles";

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

  if (settings.compactSidebarNav) {
    componentStyles.push(sidebarNavStyles);
  }

  if (settings.hideCreateButton) {
    componentStyles.push(sidebarHideCreateStyles);
  }

  if (settings.graphSelectorBottom) {
    componentStyles.push(sidebarGraphBottomStyles);
  }

  if (settings.hideHomeButton) {
    componentStyles.push(topbarHideHomeStyles);
  }

  if (settings.hideSyncIndicator) {
    componentStyles.push(topbarHideSyncStyles);
  }

  const aggregatedStyles = [
    generateThemeCSS(),
    ...componentStyles,
    registry.getAggregatedStyles(),
  ].join("\n");

  logseq.provideStyle({
    key: STYLE_KEY,
    style: aggregatedStyles,
  });
}

export function refreshStyles(): void {
  injectStyles();
}
