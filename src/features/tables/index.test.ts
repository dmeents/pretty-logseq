/**
 * Tests for Tables Feature
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import { tablesFeature } from './index';

vi.mock('../../settings', () => ({
	getSettings: vi.fn(() => ({
		enablePrettyTables: true,
	})),
}));

vi.mock('./styles.scss?inline', () => ({
	default: '.table-styles { }',
}));

describe('Tables Feature', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Feature Interface', () => {
		it('has correct id', () => {
			expect(tablesFeature.id).toBe('tables');
		});

		it('has correct name', () => {
			expect(tablesFeature.name).toBe('Pretty Tables');
		});

		it('has a description', () => {
			expect(tablesFeature.description).toBeTruthy();
		});
	});

	describe('getStyles', () => {
		it('returns styles when enabled', () => {
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePrettyTables: true,
			} as PluginSettings);

			expect(tablesFeature.getStyles()).toBe('.table-styles { }');
		});

		it('returns empty string when disabled', () => {
			vi.mocked(settingsModule.getSettings).mockReturnValue({
				enablePrettyTables: false,
			} as PluginSettings);

			expect(tablesFeature.getStyles()).toBe('');
		});
	});

	describe('init', () => {
		it('does not throw', () => {
			expect(() => tablesFeature.init()).not.toThrow();
		});
	});

	describe('destroy', () => {
		it('does not throw', () => {
			expect(() => tablesFeature.destroy()).not.toThrow();
		});
	});
});
