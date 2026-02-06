/**
 * Tests for Popover Renderer Registry
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockPageData, mockPageWithProperties } from '../../../../test/mocks/logseq';
import { clearRenderers, getRenderer, type PopoverRenderer, registerRenderer } from './index';

describe('Renderer Registry', () => {
  let mockRenderer: PopoverRenderer;

  beforeEach(() => {
    // Clear renderers before each test
    clearRenderers();

    mockRenderer = {
      id: 'test-renderer',
      match: vi.fn(() => true),
      render: vi.fn(() => document.createElement('div')),
    };
  });

  describe('registerRenderer', () => {
    it('registers a new renderer', () => {
      registerRenderer(mockRenderer);

      const pageData = mockPageData();
      const renderer = getRenderer(pageData);

      expect(renderer.id).toBe('test-renderer');
    });

    it('allows multiple renderers', () => {
      const renderer2: PopoverRenderer = {
        id: 'renderer-2',
        match: () => false,
        render: () => document.createElement('div'),
      };

      registerRenderer(mockRenderer);
      registerRenderer(renderer2);

      // Should still get first renderer since it matches
      const pageData = mockPageData();
      const renderer = getRenderer(pageData);

      expect(renderer.id).toBe('test-renderer');
    });
  });

  describe('getRenderer', () => {
    it('returns first matching renderer', () => {
      const personRenderer: PopoverRenderer = {
        id: 'person',
        match: page => page.properties.type === 'Person',
        render: () => document.createElement('div'),
      };
      const resourceRenderer: PopoverRenderer = {
        id: 'resource',
        match: page => page.properties.type === 'Resource',
        render: () => document.createElement('div'),
      };

      registerRenderer(personRenderer);
      registerRenderer(resourceRenderer);

      const personPage = mockPageWithProperties({ type: 'Person' });
      const renderer = getRenderer(personPage);

      expect(renderer.id).toBe('person');
    });

    it('falls back to default renderer when no match', () => {
      const specificRenderer: PopoverRenderer = {
        id: 'specific',
        match: page => page.properties.type === 'Specific',
        render: () => document.createElement('div'),
      };

      registerRenderer(specificRenderer);

      const pageData = mockPageWithProperties({ type: 'Other' });
      const renderer = getRenderer(pageData);

      expect(renderer.id).toBe('default');
    });

    it('respects registration order (first match wins)', () => {
      const renderer1: PopoverRenderer = {
        id: 'first',
        match: () => true,
        render: () => document.createElement('div'),
      };
      const renderer2: PopoverRenderer = {
        id: 'second',
        match: () => true,
        render: () => document.createElement('div'),
      };

      registerRenderer(renderer1);
      registerRenderer(renderer2);

      const pageData = mockPageData();
      const renderer = getRenderer(pageData);

      expect(renderer.id).toBe('first');
    });

    it('calls match with page data', () => {
      const matchSpy = vi.fn(() => false);
      const testRenderer: PopoverRenderer = {
        id: 'test',
        match: matchSpy,
        render: () => document.createElement('div'),
      };

      registerRenderer(testRenderer);

      const pageData = mockPageData();
      getRenderer(pageData);

      expect(matchSpy).toHaveBeenCalledWith(pageData);
    });

    it('returns default renderer for empty renderers list', () => {
      // Don't register any renderers
      const pageData = mockPageData();
      const renderer = getRenderer(pageData);

      expect(renderer.id).toBe('default');
    });
  });

  describe('Renderer Selection', () => {
    it('selects person renderer for person pages', () => {
      const personRenderer: PopoverRenderer = {
        id: 'person',
        match: page => page.properties.type === 'Person',
        render: () => document.createElement('div'),
      };

      registerRenderer(personRenderer);

      const pageData = mockPageWithProperties({
        type: 'Person',
        title: 'Engineer',
      });

      const renderer = getRenderer(pageData);

      expect(renderer.id).toBe('person');
    });

    it('selects resource renderer for resource pages', () => {
      const resourceRenderer: PopoverRenderer = {
        id: 'resource',
        match: page => page.properties.type === 'Resource',
        render: () => document.createElement('div'),
      };

      registerRenderer(resourceRenderer);

      const pageData = mockPageWithProperties({
        type: 'Resource',
        url: 'https://example.com',
      });

      const renderer = getRenderer(pageData);

      expect(renderer.id).toBe('resource');
    });

    it('handles case-sensitive type matching', () => {
      const renderer: PopoverRenderer = {
        id: 'exact',
        match: page => page.properties.type === 'Person',
        render: () => document.createElement('div'),
      };

      registerRenderer(renderer);

      const lowerCasePage = mockPageWithProperties({ type: 'person' });
      const matchingRenderer = getRenderer(lowerCasePage);

      // Should fall back to default since case doesn't match
      expect(matchingRenderer.id).toBe('default');
    });
  });
});
