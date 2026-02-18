import type { SettingSchemaDesc } from '@logseq/libs/dist/LSPlugin';

export interface PluginSettings {
  enablePopovers: boolean;
  enablePrettyTypography: boolean;
  enablePrettyTables: boolean;
  enablePrettyTemplates: boolean;
  enablePrettyProperties: boolean;
  showPropertyIcons: boolean;
  enablePrettyLinks: boolean;
  enablePrettyTodos: boolean;
  enableFavoriteStar: boolean;
  enableBulletThreading: boolean;
  compactSidebarNav: boolean;
  hideCreateButton: boolean;
  graphSelectorBottom: boolean;
  hideHomeButton: boolean;
  hideSyncIndicator: boolean;
  navArrowsLeft: boolean;
  styleTopbarIcons: boolean;
  topbarGradient: boolean;
  hideWindowControls: boolean;
}

export const defaultSettings: PluginSettings = {
  enablePopovers: true,
  enablePrettyTypography: true,
  enablePrettyTables: true,
  enablePrettyTemplates: true,
  enablePrettyProperties: true,
  showPropertyIcons: true,
  enablePrettyLinks: true,
  enablePrettyTodos: true,
  enableFavoriteStar: true,
  enableBulletThreading: true,
  compactSidebarNav: true,
  hideCreateButton: true,
  graphSelectorBottom: true,
  hideHomeButton: true,
  hideSyncIndicator: true,
  navArrowsLeft: true,
  styleTopbarIcons: true,
  topbarGradient: true,
  hideWindowControls: false,
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
    key: 'enablePrettyTypography',
    title: 'Pretty Typography',
    description:
      'Improve text legibility with antialiasing, tighter heading spacing, refined font weights, and a modern monospace code font stack.',
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
    key: 'enablePrettyLinks',
    title: 'Pretty Links',
    description:
      'Enhance external links with favicons and hover preview cards showing page metadata.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'enablePrettyTodos',
    title: 'Pretty Todos',
    description:
      'Restyle task blocks with visual indicators for status, priority, and past-due dates.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'contentHeading',
    title: 'Content',
    description: '',
    type: 'heading',
    default: null,
  },
  {
    key: 'enableBulletThreading',
    title: 'Bullet Threading',
    description: 'Show visual hierarchy lines connecting parent blocks to children on hover.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'enableFavoriteStar',
    title: 'Favorite Star',
    description: 'Show a star button next to page titles for one-click favorite toggling.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'propertiesHeading',
    title: 'Properties',
    description: '',
    type: 'heading',
    default: null,
  },
  {
    key: 'enablePrettyProperties',
    title: 'Pretty Properties',
    description:
      'Style page property blocks with accent borders, refined key formatting, and pipe-separated values.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'showPropertyIcons',
    title: 'Show Property Icons',
    description: "Display each property key's page icon to the left of the key label.",
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
    key: 'styleTopbarIcons',
    title: 'Style Top Bar Icons',
    description: 'Apply theme-consistent colors and hover effects to top bar icon buttons.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'topbarGradient',
    title: 'Top Bar Gradient',
    description:
      'Apply a subtle gradient from the background color to the accent color across the top bar.',
    type: 'boolean',
    default: true,
  },
  {
    key: 'hideWindowControls',
    title: 'Hide Window Controls',
    description: 'Hide the minimize, maximize, and close buttons from the top bar.',
    type: 'boolean',
    default: false,
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
