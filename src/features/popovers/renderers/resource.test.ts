/**
 * Tests for Resource Renderer
 */

import { describe, expect, it } from 'vitest';
import type { PageData } from '../../../types';
import { resourceRenderer } from './resource';

describe('Resource Renderer', () => {
  describe('match', () => {
    it('matches pages with type: Resource', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: { type: 'Resource' },
      };

      expect(resourceRenderer.match(pageData)).toBe(true);
    });

    it('matches case-insensitively', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: { type: 'RESOURCE' },
      };

      expect(resourceRenderer.match(pageData)).toBe(true);
    });

    it('does not match pages without type', () => {
      const pageData: PageData = {
        name: 'Some Page',
        properties: {},
      };

      expect(resourceRenderer.match(pageData)).toBe(false);
    });

    it('does not match pages with different type', () => {
      const pageData: PageData = {
        name: 'Some Project',
        properties: { type: 'Project' },
      };

      expect(resourceRenderer.match(pageData)).toBe(false);
    });

    it('handles type with brackets', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: { type: '[[Resource]]' },
      };

      expect(resourceRenderer.match(pageData)).toBe(true);
    });
  });

  describe('render', () => {
    it('renders resource name as clickable title', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: { type: 'Resource' },
      };

      const result = resourceRenderer.render(pageData);

      const title = result.querySelector('.pretty-popover__title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('API Documentation');
      expect(title?.getAttribute('data-page-name')).toBe('API Documentation');
    });

    it('includes icon in title when present', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: { type: 'Resource', icon: '📚' },
      };

      const result = resourceRenderer.render(pageData);

      const title = result.querySelector('.pretty-popover__title');
      expect(title?.textContent).toBe('📚 API Documentation');
    });

    it('renders description when present', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: {
          type: 'Resource',
          description: 'Comprehensive API reference documentation',
        },
      };

      const result = resourceRenderer.render(pageData);

      const desc = result.querySelector('.pretty-popover__description');
      expect(desc).toBeTruthy();
      expect(desc?.textContent).toBe('Comprehensive API reference documentation');
    });

    it('does not render description when not present', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: { type: 'Resource' },
      };

      const result = resourceRenderer.render(pageData);

      const desc = result.querySelector('.pretty-popover__description');
      expect(desc).toBeNull();
    });

    it('renders property tags', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: {
          type: 'Resource',
          status: 'Active',
          area: 'Development',
        },
      };

      const result = resourceRenderer.render(pageData);

      const tags = result.querySelectorAll('.pretty-popover__tag');
      expect(tags).toHaveLength(3);
      expect(Array.from(tags).map(t => t.textContent)).toEqual([
        'Resource',
        'Active',
        'Development',
      ]);
    });

    it('renders only available tags', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: {
          type: 'Resource',
          status: 'Active',
        },
      };

      const result = resourceRenderer.render(pageData);

      const tags = result.querySelectorAll('.pretty-popover__tag');
      expect(tags).toHaveLength(2);
      expect(Array.from(tags).map(t => t.textContent)).toEqual(['Resource', 'Active']);
    });

    it('does not render tags when none available', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: {},
      };

      const result = resourceRenderer.render(pageData);

      const tagsContainer = result.querySelector('.pretty-popover__properties');
      expect(tagsContainer).toBeNull();
    });

    it('renders complete resource card', () => {
      const pageData: PageData = {
        name: 'GraphQL API Guide',
        properties: {
          type: 'Resource',
          icon: '🚀',
          description: 'Complete guide to using our GraphQL API endpoints',
          status: 'Published',
          area: 'Backend',
        },
      };

      const result = resourceRenderer.render(pageData);

      expect(result.querySelector('.pretty-popover__title')?.textContent).toBe(
        '🚀 GraphQL API Guide',
      );
      expect(result.querySelector('.pretty-popover__description')?.textContent).toBe(
        'Complete guide to using our GraphQL API endpoints',
      );

      const tags = result.querySelectorAll('.pretty-popover__tag');
      expect(tags).toHaveLength(3);
    });

    it('cleans property values (removes brackets)', () => {
      const pageData: PageData = {
        name: 'API Documentation',
        properties: {
          type: '[[Resource]]',
          status: '[[Active]]',
          area: '[[Development]]',
        },
      };

      const result = resourceRenderer.render(pageData);

      const tags = result.querySelectorAll('.pretty-popover__tag');
      expect(Array.from(tags).map(t => t.textContent)).toEqual([
        'Resource',
        'Active',
        'Development',
      ]);
    });
  });
});
