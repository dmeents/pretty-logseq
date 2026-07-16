/**
 * Tests for Sidebar Feature
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setVersionForTest } from '../../core/version';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import { sidebarFeature } from './index';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    compactSidebarNav: false,
    hideCreateButton: false,
    graphSelectorBottom: false,
  })),
}));

vi.mock('./compact-nav.scss?inline', () => ({
  default: '.compact-nav { }',
}));

vi.mock('./compact-nav.v2.scss?inline', () => ({
  default: '.compact-nav-v2 { }',
}));

vi.mock('./hide-create.scss?inline', () => ({
  default: '.hide-create { }',
}));

vi.mock('./graph-bottom.scss?inline', () => ({
  default: '.graph-bottom { }',
}));

vi.mock('./graph-bottom.v2.scss?inline', () => ({
  default: '.graph-bottom-v2 { }',
}));

describe('Sidebar Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    setVersionForTest(null);
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(sidebarFeature.id).toBe('sidebar');
    });

    it('has correct name', () => {
      expect(sidebarFeature.name).toBe('Left Sidebar');
    });

    it('has a description', () => {
      expect(sidebarFeature.description).toBeTruthy();
    });
  });

  describe('getStyles', () => {
    it('returns empty when all settings disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        compactSidebarNav: false,
        hideCreateButton: false,
        graphSelectorBottom: false,
      } as PluginSettings);

      expect(sidebarFeature.getStyles()).toBe('');
    });

    it('includes compact nav styles when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        compactSidebarNav: true,
        hideCreateButton: false,
        graphSelectorBottom: false,
      } as PluginSettings);

      expect(sidebarFeature.getStyles()).toContain('.compact-nav');
    });

    it('includes hide create styles when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        compactSidebarNav: false,
        hideCreateButton: true,
        graphSelectorBottom: false,
      } as PluginSettings);

      expect(sidebarFeature.getStyles()).toContain('.hide-create');
    });

    it('includes graph bottom styles when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        compactSidebarNav: false,
        hideCreateButton: false,
        graphSelectorBottom: true,
      } as PluginSettings);

      expect(sidebarFeature.getStyles()).toContain('.graph-bottom');
    });

    it('combines all styles when all enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        compactSidebarNav: true,
        hideCreateButton: true,
        graphSelectorBottom: true,
      } as PluginSettings);

      const styles = sidebarFeature.getStyles();
      expect(styles).toContain('.compact-nav');
      expect(styles).toContain('.hide-create');
      expect(styles).toContain('.graph-bottom');
    });

    it('only includes styles for enabled settings', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        compactSidebarNav: true,
        hideCreateButton: false,
        graphSelectorBottom: true,
      } as PluginSettings);

      const styles = sidebarFeature.getStyles();
      expect(styles).toContain('.compact-nav');
      expect(styles).not.toContain('.hide-create');
      expect(styles).toContain('.graph-bottom');
    });

    it('emits v1 stylesheets when v1 is active', () => {
      setVersionForTest('v1');
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        compactSidebarNav: true,
        hideCreateButton: false,
        graphSelectorBottom: true,
      } as PluginSettings);

      const styles = sidebarFeature.getStyles();
      expect(styles).toContain('.compact-nav {');
      expect(styles).not.toContain('.compact-nav-v2');
      expect(styles).toContain('.graph-bottom {');
      expect(styles).not.toContain('.graph-bottom-v2');
    });

    it('emits v2 stylesheets when v2 is active', () => {
      setVersionForTest('v2');
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        compactSidebarNav: true,
        hideCreateButton: false,
        graphSelectorBottom: true,
      } as PluginSettings);

      const styles = sidebarFeature.getStyles();
      expect(styles).toContain('.compact-nav-v2');
      expect(styles).toContain('.graph-bottom-v2');
    });

    it('still emits the (no-op) hide-create styles in v2', () => {
      setVersionForTest('v2');
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        compactSidebarNav: false,
        hideCreateButton: true,
        graphSelectorBottom: false,
      } as PluginSettings);

      expect(sidebarFeature.getStyles()).toContain('.hide-create');
    });
  });

  describe('init', () => {
    it('does not throw', () => {
      expect(() => sidebarFeature.init()).not.toThrow();
    });
  });

  describe('destroy', () => {
    it('does not throw', () => {
      expect(() => sidebarFeature.destroy()).not.toThrow();
    });
  });
});
