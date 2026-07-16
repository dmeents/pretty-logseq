/**
 * Tests for Properties Feature
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setVersionForTest } from '../../core/version';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import { propertiesFeature } from './index';
import * as observerModule from './observer';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    enablePrettyProperties: true,
    showPropertyIcons: true,
  })),
}));

vi.mock('./observer', () => ({
  setupPropertyObserver: vi.fn(() => vi.fn()),
}));

vi.mock('./styles.scss?inline', () => ({
  default: '.properties-styles { }',
}));

describe('Properties Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(propertiesFeature.id).toBe('properties');
    });

    it('has correct name', () => {
      expect(propertiesFeature.name).toBe('Pretty Properties');
    });

    it('has a description', () => {
      expect(propertiesFeature.description).toBeTruthy();
    });
  });

  describe('version strategy', () => {
    afterEach(() => {
      setVersionForTest(null);
    });

    it('delegates to the v2 strategy on v2 (currently mirrors v1)', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyProperties: true,
      } as PluginSettings);
      setVersionForTest('v2');

      expect(propertiesFeature.getStyles()).toBe('.properties-styles { }');
    });
  });

  describe('getStyles', () => {
    it('returns styles when enablePrettyProperties is true', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyProperties: true,
      } as PluginSettings);

      expect(propertiesFeature.getStyles()).toBe('.properties-styles { }');
    });

    it('returns empty string when enablePrettyProperties is false', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyProperties: false,
      } as PluginSettings);

      expect(propertiesFeature.getStyles()).toBe('');
    });
  });

  describe('init', () => {
    it('sets up observer when both settings are enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyProperties: true,
        showPropertyIcons: true,
      } as PluginSettings);

      propertiesFeature.init();

      expect(observerModule.setupPropertyObserver).toHaveBeenCalledTimes(1);
    });

    it('does not set up observer when enablePrettyProperties is false', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyProperties: false,
        showPropertyIcons: true,
      } as PluginSettings);

      propertiesFeature.init();

      expect(observerModule.setupPropertyObserver).not.toHaveBeenCalled();
    });

    it('does not set up observer when showPropertyIcons is false', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyProperties: true,
        showPropertyIcons: false,
      } as PluginSettings);

      propertiesFeature.init();

      expect(observerModule.setupPropertyObserver).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('calls cleanup function', () => {
      const mockCleanup = vi.fn();
      vi.mocked(observerModule.setupPropertyObserver).mockReturnValue(mockCleanup);
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyProperties: true,
        showPropertyIcons: true,
      } as PluginSettings);

      propertiesFeature.init();
      propertiesFeature.destroy();

      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });

    it('does not throw when cleanup is null', () => {
      expect(() => propertiesFeature.destroy()).not.toThrow();
    });

    it('nullifies cleanup after calling', () => {
      const mockCleanup = vi.fn();
      vi.mocked(observerModule.setupPropertyObserver).mockReturnValue(mockCleanup);
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyProperties: true,
        showPropertyIcons: true,
      } as PluginSettings);

      propertiesFeature.init();
      propertiesFeature.destroy();
      propertiesFeature.destroy();

      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });
  });
});
