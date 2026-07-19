/**
 * Tests for the Sidebar Page Tags feature.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setVersionForTest } from '../../core/version';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import { sidebarTagsFeature } from './index';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({ sidebarPageTags: 'subtle' })),
}));

vi.mock('./hide.scss?inline', () => ({ default: '.hide-tag { }' }));
vi.mock('./subtle.scss?inline', () => ({ default: '.subtle-tag { }' }));

function mockMode(mode: PluginSettings['sidebarPageTags']): void {
  vi.mocked(settingsModule.getSettings).mockReturnValue({
    sidebarPageTags: mode,
  } as PluginSettings);
}

describe('Sidebar Page Tags Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  afterEach(() => {
    sidebarTagsFeature.destroy();
    setVersionForTest(null);
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(sidebarTagsFeature.id).toBe('sidebar-tags');
    });

    it('has a name and description', () => {
      expect(sidebarTagsFeature.name).toBeTruthy();
      expect(sidebarTagsFeature.description).toBeTruthy();
    });
  });

  describe('getStyles', () => {
    it('returns nothing on v1 regardless of mode', () => {
      setVersionForTest('v1');
      mockMode('subtle');
      expect(sidebarTagsFeature.getStyles()).toBe('');
    });

    it('returns nothing when off', () => {
      setVersionForTest('v2');
      mockMode('off');
      expect(sidebarTagsFeature.getStyles()).toBe('');
    });

    it('returns hide styles in hide mode', () => {
      setVersionForTest('v2');
      mockMode('hide');
      expect(sidebarTagsFeature.getStyles()).toContain('.hide-tag');
    });

    it('returns subtle styles in subtle mode', () => {
      setVersionForTest('v2');
      mockMode('subtle');
      expect(sidebarTagsFeature.getStyles()).toContain('.subtle-tag');
    });
  });

  describe('init', () => {
    it('does not set up the observer on v1', () => {
      setVersionForTest('v1');
      mockMode('subtle');
      const sidebar = document.createElement('div');
      sidebar.id = 'left-sidebar';
      sidebar.innerHTML =
        '<a class="link-item"><span class="page-title">Next.JS #Technology</span></a>';
      document.body.appendChild(sidebar);

      sidebarTagsFeature.init();

      expect(sidebar.querySelector('.pl-nav-tag')).toBeNull();
    });

    it('does not set up the observer when off', () => {
      setVersionForTest('v2');
      mockMode('off');
      const sidebar = document.createElement('div');
      sidebar.id = 'left-sidebar';
      sidebar.innerHTML =
        '<a class="link-item"><span class="page-title">Next.JS #Technology</span></a>';
      document.body.appendChild(sidebar);

      sidebarTagsFeature.init();

      expect(sidebar.querySelector('.pl-nav-tag')).toBeNull();
    });

    it('wraps sidebar tags on v2 when active', () => {
      setVersionForTest('v2');
      mockMode('subtle');
      const sidebar = document.createElement('div');
      sidebar.id = 'left-sidebar';
      sidebar.innerHTML =
        '<a class="link-item"><span class="page-title">Next.JS #Technology</span></a>';
      document.body.appendChild(sidebar);

      sidebarTagsFeature.init();

      expect(sidebar.querySelector('.pl-nav-tag')?.textContent).toBe('#Technology');
    });
  });

  describe('destroy', () => {
    it('does not throw when never initialized', () => {
      expect(() => sidebarTagsFeature.destroy()).not.toThrow();
    });

    it('unwraps tags on destroy', () => {
      setVersionForTest('v2');
      mockMode('subtle');
      const sidebar = document.createElement('div');
      sidebar.id = 'left-sidebar';
      sidebar.innerHTML =
        '<a class="link-item"><span class="page-title">Next.JS #Technology</span></a>';
      document.body.appendChild(sidebar);

      sidebarTagsFeature.init();
      sidebarTagsFeature.destroy();

      expect(sidebar.querySelector('.pl-nav-tag')).toBeNull();
      expect(sidebar.querySelector('.page-title')?.textContent).toBe('Next.JS #Technology');
    });
  });
});
