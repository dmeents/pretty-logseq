/**
 * Tests for Settings Management
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { defaultSettings, getSettings, initSettings, onSettingsChanged } from './index';

describe('Settings Management', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getSettings', () => {
		it('returns default settings when logseq.settings is undefined', () => {
			logseq.settings = undefined;

			const settings = getSettings();

			expect(settings).toEqual(defaultSettings);
		});

		it('returns default settings when logseq.settings is empty', () => {
			logseq.settings = {};

			const settings = getSettings();

			expect(settings).toEqual(defaultSettings);
		});

		it('merges user settings with defaults', () => {
			logseq.settings = {
				enablePopovers: false,
				enablePrettyTypography: false,
			};

			const settings = getSettings();

			expect(settings).toEqual({
				...defaultSettings,
				enablePopovers: false,
				enablePrettyTypography: false,
			});
		});

		it('user settings override defaults', () => {
			logseq.settings = {
				compactSidebarNav: false,
				hideCreateButton: false,
			};

			const settings = getSettings();

			expect(settings.compactSidebarNav).toBe(false);
			expect(settings.hideCreateButton).toBe(false);
			// Other defaults should remain
			expect(settings.enablePopovers).toBe(true);
			expect(settings.enablePrettyTypography).toBe(true);
		});

		it('includes all expected properties', () => {
			const settings = getSettings();

			expect(settings).toHaveProperty('enablePopovers');
			expect(settings).toHaveProperty('enablePrettyTypography');
			expect(settings).toHaveProperty('enablePrettyTables');
			expect(settings).toHaveProperty('enablePrettyTemplates');
			expect(settings).toHaveProperty('enablePrettyLinks');
			expect(settings).toHaveProperty('enablePrettyTodos');
			expect(settings).toHaveProperty('compactSidebarNav');
			expect(settings).toHaveProperty('hideCreateButton');
			expect(settings).toHaveProperty('graphSelectorBottom');
			expect(settings).toHaveProperty('hideHomeButton');
			expect(settings).toHaveProperty('hideSyncIndicator');
			expect(settings).toHaveProperty('navArrowsLeft');
		});

		it('handles partial settings objects', () => {
			logseq.settings = {
				enablePopovers: false,
			};

			const settings = getSettings();

			// Should have the override
			expect(settings.enablePopovers).toBe(false);
			// Should have all other defaults
			expect(Object.keys(settings)).toHaveLength(Object.keys(defaultSettings).length);
		});
	});

	describe('initSettings', () => {
		it('calls logseq.useSettingsSchema with schema', () => {
			initSettings();

			expect(logseq.useSettingsSchema).toHaveBeenCalledTimes(1);
			expect(logseq.useSettingsSchema).toHaveBeenCalledWith(expect.any(Array));
		});

		it('passes schema with correct structure', () => {
			initSettings();

			const schema = logseq.useSettingsSchema.mock.calls[0][0];
			expect(Array.isArray(schema)).toBe(true);
			expect(schema.length).toBeGreaterThan(0);

			// Check first setting (after heading)
			const firstSetting = schema.find((item) => item.key === 'enablePopovers');
			expect(firstSetting).toBeDefined();
			expect(firstSetting?.type).toBe('boolean');
			expect(firstSetting?.default).toBe(true);
		});
	});

	describe('onSettingsChanged', () => {
		it('registers callback with logseq.onSettingsChanged', () => {
			const callback = vi.fn();

			onSettingsChanged(callback);

			expect(logseq.onSettingsChanged).toHaveBeenCalledTimes(1);
			expect(logseq.onSettingsChanged).toHaveBeenCalledWith(expect.any(Function));
		});

		it('callback receives merged settings with defaults', () => {
			const callback = vi.fn();
			let registeredCallback: ((newSettings: unknown, oldSettings: unknown) => void) | null =
				null;

			// Capture the callback
			logseq.onSettingsChanged.mockImplementation((cb) => {
				registeredCallback = cb;
			});

			onSettingsChanged(callback);

			// Simulate settings change
			const newSettings = { enablePopovers: false };
			const oldSettings = { enablePopovers: true };

			registeredCallback?.(newSettings, oldSettings);

			expect(callback).toHaveBeenCalledTimes(1);

			// Check that defaults were merged
			const [receivedNew, receivedOld] = callback.mock.calls[0];
			expect(receivedNew).toEqual({ ...defaultSettings, enablePopovers: false });
			expect(receivedOld).toEqual({ ...defaultSettings, enablePopovers: true });
		});

		it('merges both new and old settings with defaults', () => {
			const callback = vi.fn();
			let registeredCallback: ((newSettings: unknown, oldSettings: unknown) => void) | null =
				null;

			logseq.onSettingsChanged.mockImplementation((cb) => {
				registeredCallback = cb;
			});

			onSettingsChanged(callback);

			const newSettings = {
				enablePopovers: false,
				compactSidebarNav: false,
			};
			const oldSettings = {
				enablePopovers: true,
				compactSidebarNav: true,
			};

			registeredCallback?.(newSettings, oldSettings);

			const [receivedNew, receivedOld] = callback.mock.calls[0];

			// New settings should have overrides plus defaults
			expect(receivedNew.enablePopovers).toBe(false);
			expect(receivedNew.compactSidebarNav).toBe(false);
			expect(receivedNew.enablePrettyTypography).toBe(defaultSettings.enablePrettyTypography);

			// Old settings should have overrides plus defaults
			expect(receivedOld.enablePopovers).toBe(true);
			expect(receivedOld.compactSidebarNav).toBe(true);
			expect(receivedOld.enablePrettyTypography).toBe(defaultSettings.enablePrettyTypography);
		});

		it('handles empty settings objects', () => {
			const callback = vi.fn();
			let registeredCallback: ((newSettings: unknown, oldSettings: unknown) => void) | null =
				null;

			logseq.onSettingsChanged.mockImplementation((cb) => {
				registeredCallback = cb;
			});

			onSettingsChanged(callback);

			registeredCallback?.({}, {});

			const [receivedNew, receivedOld] = callback.mock.calls[0];

			// Should be all defaults
			expect(receivedNew).toEqual(defaultSettings);
			expect(receivedOld).toEqual(defaultSettings);
		});
	});
});
