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
import { injectStyles } from './core/styles';

// Import features
import { popoversFeature } from './features/popovers';
import { searchFeature } from './features/search';
import { sidebarFeature } from './features/sidebar';
import { topbarFeature } from './features/topbar';

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

  // 1. Register all features
  registerFeatures();

  // 2. Inject all styles (base + content + features)
  injectStyles();

  // 3. Initialize all features
  await registry.initializeAll();

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
