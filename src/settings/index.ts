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
  const settings = logseq.settings as
    | (Partial<PluginSettings> & { disabled?: boolean })
    | undefined;

  // Filter out Logseq internal properties (like 'disabled')
  const { disabled, ...userSettings } = settings || {};

  return {
    ...defaultSettings,
    ...userSettings,
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
    // Filter out Logseq internal properties (like 'disabled')
    const { disabled: _newDisabled, ...newUserSettings } =
      (newSettings as Partial<PluginSettings> & { disabled?: boolean }) || {};
    const { disabled: _oldDisabled, ...oldUserSettings } =
      (oldSettings as Partial<PluginSettings> & { disabled?: boolean }) || {};

    callback(
      { ...defaultSettings, ...newUserSettings } as PluginSettings,
      { ...defaultSettings, ...oldUserSettings } as PluginSettings,
    );
  });
}
