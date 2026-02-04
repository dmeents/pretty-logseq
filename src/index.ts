/**
 * Pretty Logseq
 *
 * A Logseq plugin for frontend customizations including custom popovers,
 * navigation styling, sidebar modifications, and content styling.
 *
 * See docs/RESEARCH.md for implementation details and API reference.
 */

import '@logseq/libs';

import { registry } from './core/registry';
import { injectStyles, refreshStyles } from './core/styles';
import { setupThemeObserver } from './core/theme';
// Import features
import { popoversFeature } from './features/popovers';
import { searchFeature } from './features/search';
import { sidebarFeature } from './features/sidebar';
import { topbarFeature } from './features/topbar';
import { initSettings, onSettingsChanged } from './settings';

/**
 * Register all features with the registry
 */
function registerFeatures(): void {
  registry.register(popoversFeature);
  registry.register(topbarFeature);
  registry.register(sidebarFeature);
  registry.register(searchFeature);
}

/**
 * Main plugin entry point
 */
async function main(): Promise<void> {
  console.log('[Pretty Logseq] Plugin loading...');

  // 1. Initialize settings schema
  initSettings();

  // 2. Register all features
  registerFeatures();

  // 3. Inject all styles (includes auto-detected theme colors)
  injectStyles();

  // 4. Setup theme observer to refresh styles when theme changes
  setupThemeObserver(refreshStyles);

  // 5. Initialize all features
  await registry.initializeAll();

  // 6. Listen for settings changes
  onSettingsChanged((newSettings, oldSettings) => {
    // Refresh styles when any style-related setting changes
    const styleSettings = ['compactSidebarNav', 'hideCreateButton', 'graphSelectorBottom'] as const;

    const styleSettingChanged = styleSettings.some(key => newSettings[key] !== oldSettings[key]);

    if (styleSettingChanged) {
      refreshStyles();
    }
  });

  console.log('[Pretty Logseq] Plugin loaded');
}

/**
 * Cleanup before plugin unloads
 */
logseq.beforeunload(async () => {
  console.log('[Pretty Logseq] Plugin unloading...');
  await registry.destroyAll();
});

// Bootstrap the plugin
logseq.ready(main).catch(console.error);
