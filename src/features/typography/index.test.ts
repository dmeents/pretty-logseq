/**
 * Tests for Typography Feature
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';

// Mock parent/top document for font link injection
const mockLinkElement = { id: '', rel: '', href: '', remove: vi.fn() };
const mockHead = { appendChild: vi.fn() };
const mockDocument = {
  head: mockHead,
  createElement: vi.fn(() => ({ ...mockLinkElement })),
  getElementById: vi.fn(() => null),
};

vi.stubGlobal('top', { document: mockDocument });
vi.stubGlobal('parent', { document: mockDocument });

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    enablePrettyTypography: true,
  })),
}));

vi.mock('./headers.scss?inline', () => ({
  default: '.header-styles { }',
}));

vi.mock('./styles.scss?inline', () => ({
  default: '.typography-styles { }',
}));

vi.mock('./prose.scss?inline', () => ({
  default: '.prose-styles { }',
}));

// Import after mocks are set up
const { typographyFeature } = await import('./index');

describe('Typography Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDocument.getElementById.mockReturnValue(null);
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(typographyFeature.id).toBe('typography');
    });

    it('has correct name', () => {
      expect(typographyFeature.name).toBe('Pretty Typography');
    });

    it('has a description', () => {
      expect(typographyFeature.description).toBeTruthy();
    });
  });

  describe('getStyles', () => {
    it('always includes header styles', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTypography: false,
      } as PluginSettings);

      expect(typographyFeature.getStyles()).toContain('.header-styles');
    });

    it('includes typography and prose styles when enablePrettyTypography is true', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTypography: true,
      } as PluginSettings);

      const styles = typographyFeature.getStyles();
      expect(styles).toContain('.header-styles');
      expect(styles).toContain('.typography-styles');
      expect(styles).toContain('.prose-styles');
    });

    it('excludes typography and prose styles when enablePrettyTypography is false', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTypography: false,
      } as PluginSettings);

      const styles = typographyFeature.getStyles();
      expect(styles).toContain('.header-styles');
      expect(styles).not.toContain('.typography-styles');
      expect(styles).not.toContain('.prose-styles');
    });
  });

  describe('init', () => {
    it('injects font link when enablePrettyTypography is true', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTypography: true,
      } as PluginSettings);

      typographyFeature.init();

      expect(mockDocument.createElement).toHaveBeenCalledWith('link');
      expect(mockHead.appendChild).toHaveBeenCalled();
    });

    it('does not inject font link when enablePrettyTypography is false', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTypography: false,
      } as PluginSettings);

      typographyFeature.init();

      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(mockHead.appendChild).not.toHaveBeenCalled();
    });

    it('does not inject duplicate font link', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTypography: true,
      } as PluginSettings);
      mockDocument.getElementById.mockReturnValue(mockLinkElement);

      typographyFeature.init();

      expect(mockDocument.createElement).not.toHaveBeenCalled();
      expect(mockHead.appendChild).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('removes font link element', () => {
      const removable = { remove: vi.fn() };
      mockDocument.getElementById.mockReturnValue(removable);

      typographyFeature.destroy();

      expect(removable.remove).toHaveBeenCalled();
    });

    it('does not throw when font link does not exist', () => {
      mockDocument.getElementById.mockReturnValue(null);

      expect(() => typographyFeature.destroy()).not.toThrow();
    });
  });
});
