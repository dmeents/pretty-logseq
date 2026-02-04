/**
 * Settings Management
 *
 * Handles plugin settings initialization and change detection.
 */

import { defaultSettings, type PluginSettings, settingsSchema } from './schema';

export type { PluginSettings };
export { defaultSettings, settingsSchema };

/**
 * Get current plugin settings with defaults applied
 */
export function getSettings(): PluginSettings {
  const settings = logseq.settings as Partial<PluginSettings> | undefined;
  return {
    ...defaultSettings,
    ...settings,
  };
}

/**
 * Initialize the settings schema
 */
export function initSettings(): void {
  logseq.useSettingsSchema(settingsSchema);
}

/**
 * Register a callback for when settings change
 */
export function onSettingsChanged(
  callback: (newSettings: PluginSettings, oldSettings: PluginSettings) => void,
): void {
  logseq.onSettingsChanged((newSettings, oldSettings) => {
    callback(
      { ...defaultSettings, ...newSettings } as PluginSettings,
      { ...defaultSettings, ...oldSettings } as PluginSettings,
    );
  });
}
