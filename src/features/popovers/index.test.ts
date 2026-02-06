/**
 * Tests for Popovers Feature
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import * as managerModule from './manager';
import { popoversFeature } from './index';

// Mock dependencies
vi.mock('../../settings', () => ({
	getSettings: vi.fn(() => ({
		enablePopovers: true,
	})),
}));

vi.mock('./manager', () => ({
	setupPopovers: vi.fn(() => vi.fn()), // Returns cleanup function
}));

vi.mock('./styles.scss?inline', () => ({
	default: '.popover { display: block; }',
}));

describe('Popovers Feature', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Feature Interface', () => {
		it('has correct id', () => {
			expect(popoversFeature.id).toBe('popovers');
		});

		it('has correct name', () => {
			expect(popoversFeature.name).toBe('Page Popovers');
		});

		it('has correct description', () => {
			expect(popoversFeature.description).toBe('Custom hover previews for page references');
		});
	});

	describe('getStyles', () => {
		it('returns styles when popovers enabled', () => {
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePopovers: true,
			} as PluginSettings);

			const styles = popoversFeature.getStyles();

			expect(styles).toBe('.popover { display: block; }');
		});

		it('returns empty string when popovers disabled', () => {
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePopovers: false,
			} as PluginSettings);

			const styles = popoversFeature.getStyles();

			expect(styles).toBe('');
		});
	});

	describe('init', () => {
		it('calls setupPopovers when popovers enabled', () => {
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePopovers: true,
			} as PluginSettings);

			popoversFeature.init();

			expect(managerModule.setupPopovers).toHaveBeenCalledTimes(1);
		});

		it('does not call setupPopovers when popovers disabled', () => {
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePopovers: false,
			} as PluginSettings);

			popoversFeature.init();

			expect(managerModule.setupPopovers).not.toHaveBeenCalled();
		});

		it('stores cleanup function', () => {
			const mockCleanup = vi.fn();
			vi.mocked(managerModule.setupPopovers).mockReturnValue(mockCleanup);
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePopovers: true,
			} as PluginSettings);

			popoversFeature.init();
			popoversFeature.destroy();

			expect(mockCleanup).toHaveBeenCalledTimes(1);
		});
	});

	describe('destroy', () => {
		it('calls cleanup function when it exists', () => {
			const mockCleanup = vi.fn();
			vi.mocked(managerModule.setupPopovers).mockReturnValue(mockCleanup);
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePopovers: true,
			} as PluginSettings);

			popoversFeature.init();
			popoversFeature.destroy();

			expect(mockCleanup).toHaveBeenCalledTimes(1);
		});

		it('does not throw when cleanup is null', () => {
			expect(() => popoversFeature.destroy()).not.toThrow();
		});

		it('does not call cleanup multiple times', () => {
			const mockCleanup = vi.fn();
			vi.mocked(managerModule.setupPopovers).mockReturnValue(mockCleanup);
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePopovers: true,
			} as PluginSettings);

			popoversFeature.init();
			popoversFeature.destroy();
			popoversFeature.destroy(); // Second call

			expect(mockCleanup).toHaveBeenCalledTimes(1);
		});

		it('nullifies cleanup after calling it', () => {
			const mockCleanup = vi.fn();
			vi.mocked(managerModule.setupPopovers).mockReturnValue(mockCleanup);
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePopovers: true,
			} as PluginSettings);

			popoversFeature.init();
			popoversFeature.destroy();

			// Init again should create new cleanup
			const mockCleanup2 = vi.fn();
			vi.mocked(managerModule.setupPopovers).mockReturnValue(mockCleanup2);

			popoversFeature.init();
			popoversFeature.destroy();

			expect(mockCleanup2).toHaveBeenCalledTimes(1);
		});
	});

	describe('Lifecycle', () => {
		it('handles full init/destroy cycle', () => {
			const mockCleanup = vi.fn();
			vi.mocked(managerModule.setupPopovers).mockReturnValue(mockCleanup);
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePopovers: true,
			} as PluginSettings);

			// Init
			popoversFeature.init();
			expect(managerModule.setupPopovers).toHaveBeenCalledTimes(1);

			// Destroy
			popoversFeature.destroy();
			expect(mockCleanup).toHaveBeenCalledTimes(1);

			// Re-init
			popoversFeature.init();
			expect(managerModule.setupPopovers).toHaveBeenCalledTimes(2);
		});

		it('init without destroy does not create multiple setups', () => {
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePopovers: true,
			} as PluginSettings);

			popoversFeature.init();
			popoversFeature.init(); // Second init

			// Should only setup once (second init overwrites cleanup reference)
			expect(managerModule.setupPopovers).toHaveBeenCalledTimes(2);
		});
	});
});
