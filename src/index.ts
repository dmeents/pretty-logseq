import '@logseq/libs';

import { registry } from './core/registry';
import { injectStyles, refreshStyles } from './core/styles';
import { setupThemeObserver } from './core/theme';
import { applyVersionAttribute, detectVersion, getVersion } from './core/version';
import { contentFeature } from './features/content';
import { linksFeature } from './features/links';
import { popoversFeature } from './features/popovers';
import { propertiesFeature } from './features/properties';
import { sidebarFeature } from './features/sidebar';
import { tablesFeature } from './features/tables';
import { templatesFeature } from './features/templates';
import { todosFeature } from './features/todos';
import { applyNavArrowsSetting, topbarFeature } from './features/topbar';
import { typographyFeature } from './features/typography';
import { buildSettingsSchema, getSettings, initSettings, onSettingsChanged } from './settings';

/**
 * Re-register the settings schema with the detected version, so the read-only
 * "Active: …" status row reflects it. Called after detection and on version
 * change. (Logseq only re-reads the schema when the panel is reopened, so this
 * isn't used for live per-toggle updates.)
 */
function registerSchema(): void {
  const source = getSettings().logseqVersion === 'auto' ? 'auto' : 'manual';
  logseq.useSettingsSchema(buildSettingsSchema({ active: getVersion(), source }));
}

function registerFeatures(): void {
  registry.register(contentFeature);
  registry.register(popoversFeature);
  registry.register(propertiesFeature);
  registry.register(linksFeature);
  registry.register(todosFeature);
  registry.register(topbarFeature);
  registry.register(sidebarFeature);
  registry.register(tablesFeature);
  registry.register(templatesFeature);
  registry.register(typographyFeature);
}

async function main(): Promise<void> {
  console.log('[Pretty Logseq] Plugin loading...');

  initSettings();
  registerFeatures();

  const version = await detectVersion();
  applyVersionAttribute(version);
  registerSchema();
  console.log(`[Pretty Logseq] Detected Logseq ${version}`);

  injectStyles();
  setupThemeObserver(refreshStyles);

  await registry.initializeAll();

  onSettingsChanged(async (newSettings, oldSettings) => {
    // Version override changed: everything can differ, so treat it as a full
    // reload — re-detect, update the scope attribute, then destroy + re-init all.
    if (newSettings.logseqVersion !== oldSettings.logseqVersion) {
      await registry.destroyAll();
      applyVersionAttribute(await detectVersion());
      registerSchema();
      await registry.initializeAll();
      refreshStyles();
      return;
    }

    const styleSettings = [
      'enablePrettyTypography',
      'enablePrettyTables',
      'enablePrettyTemplates',
      'enablePrettyProperties',
      'showPropertyIcons',
      'enablePrettyLinks',
      'enablePrettyTodos',
      'enableFavoriteStar',
      'enableBulletThreading',
      'compactSidebarNav',
      'hideCreateButton',
      'graphSelectorBottom',
      'hideHomeButton',
      'hideSyncIndicator',
      'styleTopbarIcons',
      'topbarGradient',
      'hideWindowControls',
    ] as const;

    const styleSettingChanged = styleSettings.some(key => newSettings[key] !== oldSettings[key]);

    if (styleSettingChanged) {
      refreshStyles();
    }

    // Handle popovers feature toggle
    if (newSettings.enablePopovers !== oldSettings.enablePopovers) {
      if (newSettings.enablePopovers) {
        registry.initializeFeature('popovers');
      } else {
        registry.destroyFeature('popovers');
      }
      refreshStyles();
    }

    // Handle pretty links feature toggle
    if (newSettings.enablePrettyLinks !== oldSettings.enablePrettyLinks) {
      if (newSettings.enablePrettyLinks) {
        registry.initializeFeature('links');
      } else {
        registry.destroyFeature('links');
      }
      refreshStyles();
    }

    // Handle properties feature toggle
    if (
      newSettings.enablePrettyProperties !== oldSettings.enablePrettyProperties ||
      newSettings.showPropertyIcons !== oldSettings.showPropertyIcons
    ) {
      registry.destroyFeature('properties');
      if (newSettings.enablePrettyProperties) {
        registry.initializeFeature('properties');
      }
      refreshStyles();
    }

    // Handle pretty todos feature toggle
    if (newSettings.enablePrettyTodos !== oldSettings.enablePrettyTodos) {
      if (newSettings.enablePrettyTodos) {
        registry.initializeFeature('todos');
      } else {
        registry.destroyFeature('todos');
      }
      refreshStyles();
    }

    // Handle content feature settings (bullet threading, favorite star)
    if (
      newSettings.enableBulletThreading !== oldSettings.enableBulletThreading ||
      newSettings.enableFavoriteStar !== oldSettings.enableFavoriteStar
    ) {
      registry.destroyFeature('content');
      registry.initializeFeature('content');
      refreshStyles();
    }

    // Handle typography feature toggle (font link injection)
    if (newSettings.enablePrettyTypography !== oldSettings.enablePrettyTypography) {
      if (newSettings.enablePrettyTypography) {
        registry.initializeFeature('typography');
      } else {
        registry.destroyFeature('typography');
      }
      refreshStyles();
    }

    // Handle DOM manipulation settings (also refresh styles for layout CSS)
    if (newSettings.navArrowsLeft !== oldSettings.navArrowsLeft) {
      applyNavArrowsSetting();
      refreshStyles();
    }
  });

  console.log('[Pretty Logseq] Plugin loaded');
}

logseq.beforeunload(async () => {
  console.log('[Pretty Logseq] Plugin unloading...');
  await registry.destroyAll();
});

logseq.ready(main).catch(console.error);
