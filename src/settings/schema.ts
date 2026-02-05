/**
 * Plugin Settings Schema
 *
 * Defines the settings UI shown in Logseq's plugin settings panel.
 * Uses Logseq's useSettingsSchema API.
 */

import type { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin';

export interface PluginSettings {
  enablePopovers: boolean;
  enablePrettyTables: boolean;
  enablePrettyTemplates: boolean;
  compactSidebarNav: boolean;
  hideCreateButton: boolean;
  graphSelectorBottom: boolean;
  hideHomeButton: boolean;
  hideSyncIndicator: boolean;
  navArrowsLeft: boolean;
}

export const defaultSettings: PluginSettings = {
  enablePopovers: true,
  enablePrettyTables: true,
  enablePrettyTemplates: true,
  compactSidebarNav: true,
  hideCreateButton: false,
  graphSelectorBottom: false,
  hideHomeButton: false,
  hideSyncIndicator: false,
  navArrowsLeft: false,
};

export const settingsSchema: SettingSchemaDesc[] = [
  {
    key: 'featuresHeading',
    title: 'Features',
    description: '',
    type: 'heading',
    default: null,
  },
  {
    key: 'enablePopovers',
    title: 'Custom Popovers',
    description: 'Show custom hover previews for page references with page properties.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'enablePrettyTables',
    title: 'Pretty Tables',
    description:
      'Style query result tables with accent borders, refined headers, and hover states.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'enablePrettyTemplates',
    title: 'Pretty Templates',
    description: 'Style template blocks as dimmed, contained cards.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'leftSidebarHeading',
    title: 'Left Sidebar',
    description: '',
    type: 'heading',
    default: null,
  },
  {
    key: 'compactSidebarNav',
    title: 'Compact Navigation',
    description: 'Display navigation items as inline icons instead of a vertical list.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'hideCreateButton',
    title: 'Hide Create Button',
    description: "Hide the 'New page' create button in the sidebar.",
    type: 'boolean',
    default: false,
  },
  {
    key: 'graphSelectorBottom',
    title: 'Graph Selector at Bottom',
    description: 'Move the graph/vault selection menu to the bottom of the sidebar.',
    type: 'boolean',
    default: false,
  },
  {
    key: 'topBarHeading',
    title: 'Top Bar',
    description: '',
    type: 'heading',
    default: null,
  },
  {
    key: 'hideHomeButton',
    title: 'Hide Home Button',
    description: 'Hide the Home button from the top navigation bar.',
    type: 'boolean',
    default: false,
  },
  {
    key: 'hideSyncIndicator',
    title: 'Hide Sync Indicator',
    description: 'Hide the sync/cloud status indicator from the top navigation bar.',
    type: 'boolean',
    default: false,
  },
  {
    key: 'navArrowsLeft',
    title: 'Navigation Arrows on Left',
    description:
      'Move the back/forward navigation arrows to the left side of the top bar, next to the sidebar toggle.',
    type: 'boolean',
    default: false,
  },
];
