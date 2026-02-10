import '@logseq/libs';

import { registry } from './core/registry';
import { injectStyles, refreshStyles } from './core/styles';
import { setupThemeObserver } from './core/theme';
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
import { initSettings, onSettingsChanged } from './settings';

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
  injectStyles();
  setupThemeObserver(refreshStyles);

  await registry.initializeAll();

  onSettingsChanged((newSettings, oldSettings) => {
    const styleSettings = [
      'enablePrettyTypography',
      'enablePrettyTables',
      'enablePrettyTemplates',
      'enablePrettyProperties',
      'showPropertyIcons',
      'enablePrettyLinks',
      'enablePrettyTodos',
      'compactSidebarNav',
      'hideCreateButton',
      'graphSelectorBottom',
      'hideHomeButton',
      'hideSyncIndicator',
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
