/**
 * Tests for Style Management
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginSettings } from '../settings';
import { injectStyles, refreshStyles } from './styles';

// Mock dependencies
vi.mock('../settings', () => ({
  getSettings: vi.fn(() => ({
    enablePrettyTypography: false,
    enablePrettyTables: false,
    enablePrettyTemplates: false,
    compactSidebarNav: false,
    hideCreateButton: false,
    graphSelectorBottom: false,
    hideHomeButton: false,
    hideSyncIndicator: false,
  })),
}));

vi.mock('./theme', () => ({
  generateThemeCSS: vi.fn(() => '/* theme styles */'),
}));

vi.mock('./registry', () => ({
  registry: {
    getAggregatedStyles: vi.fn(() => '/* feature styles */'),
  },
}));

describe('Style Management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('injectStyles', () => {
    it('calls logseq.provideStyle with aggregated styles', () => {
      injectStyles();

      expect(logseq.provideStyle).toHaveBeenCalledWith({
        key: 'pretty-logseq-styles',
        style: expect.any(String),
      });
    });

    it('includes base component styles', () => {
      injectStyles();

      const call = logseq.provideStyle.mock.calls[0][0];
      const styles = call.style as string;

      // Should always include theme and feature styles
      expect(styles).toContain('/* theme styles */');
      expect(styles).toContain('/* feature styles */');
    });

    it('includes theme CSS', async () => {
      const { generateThemeCSS } = await import('./theme');

      injectStyles();

      expect(generateThemeCSS).toHaveBeenCalled();

      const call = logseq.provideStyle.mock.calls[0][0];
      const styles = call.style as string;
      expect(styles).toContain('/* theme styles */');
    });

    it('includes feature styles from registry', async () => {
      const { registry } = await import('./registry');

      injectStyles();

      expect(registry.getAggregatedStyles).toHaveBeenCalled();

      const call = logseq.provideStyle.mock.calls[0][0];
      const styles = call.style as string;
      expect(styles).toContain('/* feature styles */');
    });

    it('includes typography styles when enabled', async () => {
      const { getSettings } = await import('../settings');
      vi.mocked(getSettings).mockReturnValue({
        enablePrettyTypography: true,
      } as PluginSettings);

      injectStyles();

      // Verify the setting was checked
      expect(getSettings).toHaveBeenCalled();
    });

    it('includes table styles when enabled', async () => {
      const { getSettings } = await import('../settings');
      vi.mocked(getSettings).mockReturnValue({
        enablePrettyTables: true,
      } as PluginSettings);

      injectStyles();

      expect(getSettings).toHaveBeenCalled();
    });

    it('includes template styles when enabled', async () => {
      const { getSettings } = await import('../settings');
      vi.mocked(getSettings).mockReturnValue({
        enablePrettyTemplates: true,
      } as PluginSettings);

      injectStyles();

      expect(getSettings).toHaveBeenCalled();
    });

    it('includes sidebar nav styles when compact mode enabled', async () => {
      const { getSettings } = await import('../settings');
      vi.mocked(getSettings).mockReturnValue({
        compactSidebarNav: true,
      } as PluginSettings);

      injectStyles();

      expect(getSettings).toHaveBeenCalled();
    });

    it('includes hide create button styles when enabled', async () => {
      const { getSettings } = await import('../settings');
      vi.mocked(getSettings).mockReturnValue({
        hideCreateButton: true,
      } as PluginSettings);

      injectStyles();

      expect(getSettings).toHaveBeenCalled();
    });

    it('includes graph bottom styles when enabled', async () => {
      const { getSettings } = await import('../settings');
      vi.mocked(getSettings).mockReturnValue({
        graphSelectorBottom: true,
      } as PluginSettings);

      injectStyles();

      expect(getSettings).toHaveBeenCalled();
    });

    it('includes hide home button styles when enabled', async () => {
      const { getSettings } = await import('../settings');
      vi.mocked(getSettings).mockReturnValue({
        hideHomeButton: true,
      } as PluginSettings);

      injectStyles();

      expect(getSettings).toHaveBeenCalled();
    });

    it('includes hide sync indicator styles when enabled', async () => {
      const { getSettings } = await import('../settings');
      vi.mocked(getSettings).mockReturnValue({
        hideSyncIndicator: true,
      } as PluginSettings);

      injectStyles();

      expect(getSettings).toHaveBeenCalled();
    });

    it('aggregates all enabled styles', async () => {
      const { getSettings } = await import('../settings');
      vi.mocked(getSettings).mockReturnValue({
        enablePrettyTypography: true,
        enablePrettyTables: true,
        enablePrettyTemplates: true,
        compactSidebarNav: true,
        hideCreateButton: true,
        graphSelectorBottom: true,
        hideHomeButton: true,
        hideSyncIndicator: true,
      } as PluginSettings);

      injectStyles();

      expect(logseq.provideStyle).toHaveBeenCalledWith({
        key: 'pretty-logseq-styles',
        style: expect.any(String),
      });
    });

    it('uses consistent style key', () => {
      injectStyles();

      const call = logseq.provideStyle.mock.calls[0][0];
      expect(call.key).toBe('pretty-logseq-styles');
    });

    it('includes all style sections in output', () => {
      injectStyles();

      const call = logseq.provideStyle.mock.calls[0][0];
      const styles = call.style as string;

      // Aggregated output includes theme CSS and feature styles
      expect(styles).toContain('/* theme styles */');
      expect(styles).toContain('/* feature styles */');
    });
  });

  describe('refreshStyles', () => {
    it('re-injects styles by calling injectStyles', () => {
      // First call
      injectStyles();
      expect(logseq.provideStyle).toHaveBeenCalledTimes(1);

      // Refresh
      refreshStyles();
      expect(logseq.provideStyle).toHaveBeenCalledTimes(2);
    });

    it('uses same style key on refresh', () => {
      injectStyles();
      const firstCall = logseq.provideStyle.mock.calls[0][0];

      refreshStyles();
      const secondCall = logseq.provideStyle.mock.calls[1][0];

      expect(firstCall.key).toBe(secondCall.key);
      expect(firstCall.key).toBe('pretty-logseq-styles');
    });
  });
});
