import { buildSettingsSchema, defaultSettings, type PluginSettings } from './schema';

export type { PluginSettings, VersionInfo } from './schema';
export { buildSettingsSchema, defaultSettings };

export function getSettings(): PluginSettings {
  const settings = logseq.settings as
    | (Partial<PluginSettings> & { disabled?: boolean })
    | undefined;

  const { disabled, ...userSettings } = settings || {};

  return {
    ...defaultSettings,
    ...userSettings,
  };
}

export function initSettings(): void {
  // Registered before version detection, so no status row yet; index.ts
  // re-registers with version info once detection resolves.
  logseq.useSettingsSchema(buildSettingsSchema());
}

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
