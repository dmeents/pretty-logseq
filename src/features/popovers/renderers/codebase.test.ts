/**
 * Tests for Codebase Renderer
 */

import { describe, expect, it } from 'vitest';
import type { PageData } from '../../../types';
import { codebaseRenderer } from './codebase';

describe('Codebase Renderer', () => {
  describe('match', () => {
    it('matches pages with type: Code Base', () => {
      const pageData: PageData = {
        name: 'My Project',
        properties: { type: 'Code Base' },
      };

      expect(codebaseRenderer.match(pageData)).toBe(true);
    });

    it('matches case-insensitively', () => {
      const pageData: PageData = {
        name: 'My Project',
        properties: { type: 'CODE BASE' },
      };

      expect(codebaseRenderer.match(pageData)).toBe(true);
    });

    it('does not match pages without type', () => {
      const pageData: PageData = {
        name: 'Some Page',
        properties: {},
      };

      expect(codebaseRenderer.match(pageData)).toBe(false);
    });

    it('does not match pages with different type', () => {
      const pageData: PageData = {
        name: 'Some Project',
        properties: { type: 'Project' },
      };

      expect(codebaseRenderer.match(pageData)).toBe(false);
    });

    it('handles type with brackets', () => {
      const pageData: PageData = {
        name: 'My Project',
        properties: { type: '[[Code Base]]' },
      };

      expect(codebaseRenderer.match(pageData)).toBe(true);
    });
  });

  describe('render', () => {
    it('renders codebase name as clickable title', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: { type: 'Code Base' },
      };

      const result = codebaseRenderer.render(pageData);

      const title = result.querySelector('.pretty-popover__title');
      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('Pretty Logseq');
      expect(title?.getAttribute('data-page-name')).toBe('Pretty Logseq');
    });

    it('includes icon in title when present', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: { type: 'Code Base', icon: '🎨' },
      };

      const result = codebaseRenderer.render(pageData);

      const title = result.querySelector('.pretty-popover__title');
      expect(title?.textContent).toBe('🎨 Pretty Logseq');
    });

    it('renders description when present', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: 'Code Base',
          description: 'A Logseq plugin for beautiful page previews',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const desc = result.querySelector('.pretty-popover__description');
      expect(desc).toBeTruthy();
      expect(desc?.textContent).toBe('A Logseq plugin for beautiful page previews');
    });

    it('renders repository link from plain URL', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: 'Code Base',
          url: 'https://github.com/user/pretty-logseq',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const link = result.querySelector('.pretty-popover__codebase-link') as HTMLAnchorElement;
      expect(link).toBeTruthy();
      expect(link?.href).toBe('https://github.com/user/pretty-logseq');
      expect(link?.target).toBe('_blank');
      expect(link?.rel).toBe('noopener noreferrer');
    });

    it('extracts URL from markdown link format', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: 'Code Base',
          url: '[GitHub](https://github.com/user/pretty-logseq)',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const link = result.querySelector('.pretty-popover__codebase-link') as HTMLAnchorElement;
      expect(link?.href).toBe('https://github.com/user/pretty-logseq');
    });

    it('formats GitHub repo label from URL', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: 'Code Base',
          url: 'https://github.com/user/pretty-logseq',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const link = result.querySelector('.pretty-popover__codebase-link');
      expect(link?.textContent).toBe('user/pretty-logseq');
    });

    it('formats GitLab repo label from URL', () => {
      const pageData: PageData = {
        name: 'My Project',
        properties: {
          type: 'Code Base',
          url: 'https://gitlab.com/org/project',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const link = result.querySelector('.pretty-popover__codebase-link');
      expect(link?.textContent).toBe('org/project');
    });

    it('uses hostname when path is empty', () => {
      const pageData: PageData = {
        name: 'My Project',
        properties: {
          type: 'Code Base',
          url: 'https://example.com',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const link = result.querySelector('.pretty-popover__codebase-link');
      expect(link?.textContent).toBe('example.com');
    });

    it('falls back to raw URL for invalid URLs', () => {
      const pageData: PageData = {
        name: 'My Project',
        properties: {
          type: 'Code Base',
          url: 'not-a-url',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const link = result.querySelector('.pretty-popover__codebase-link');
      expect(link).toBeNull(); // extractUrl returns null for invalid URLs
    });

    it('renders tech stack tags', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: 'Code Base',
          stack: ['TypeScript', 'React', 'Vite'],
        },
      };

      const result = codebaseRenderer.render(pageData);

      const tags = result.querySelectorAll('.pretty-popover__codebase-stack-tag');
      expect(tags).toHaveLength(3);
      expect(Array.from(tags).map(t => t.textContent)).toEqual(['TypeScript', 'React', 'Vite']);
    });

    it('renders single tech stack item', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: 'Code Base',
          stack: 'TypeScript',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const tags = result.querySelectorAll('.pretty-popover__codebase-stack-tag');
      expect(tags).toHaveLength(1);
      expect(tags[0].textContent).toBe('TypeScript');
    });

    it('cleans brackets from stack items', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: 'Code Base',
          stack: ['[[TypeScript]]', '[[React]]'],
        },
      };

      const result = codebaseRenderer.render(pageData);

      const tags = result.querySelectorAll('.pretty-popover__codebase-stack-tag');
      expect(Array.from(tags).map(t => t.textContent)).toEqual(['TypeScript', 'React']);
    });

    it('does not render stack when not present', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: { type: 'Code Base' },
      };

      const result = codebaseRenderer.render(pageData);

      const stack = result.querySelector('.pretty-popover__codebase-stack');
      expect(stack).toBeNull();
    });

    it('renders property tags', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: 'Code Base',
          status: 'Active',
          area: 'Frontend',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const tags = result.querySelectorAll('.pretty-popover__tag');
      expect(tags).toHaveLength(3);
      expect(Array.from(tags).map(t => t.textContent)).toEqual(['Code Base', 'Active', 'Frontend']);
    });

    it('renders only available property tags', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: 'Code Base',
          status: 'Active',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const tags = result.querySelectorAll('.pretty-popover__tag');
      expect(tags).toHaveLength(2);
      expect(Array.from(tags).map(t => t.textContent)).toEqual(['Code Base', 'Active']);
    });

    it('does not render property tags when none available', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {},
      };

      const result = codebaseRenderer.render(pageData);

      const tagsContainer = result.querySelector('.pretty-popover__properties');
      expect(tagsContainer).toBeNull();
    });

    it('renders complete codebase card', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: 'Code Base',
          icon: '🎨',
          description: 'A Logseq plugin for beautiful page previews',
          url: 'https://github.com/user/pretty-logseq',
          stack: ['TypeScript', 'Vite', 'SCSS'],
          status: 'Active',
          area: 'Frontend',
        },
      };

      const result = codebaseRenderer.render(pageData);

      expect(result.querySelector('.pretty-popover__title')?.textContent).toBe('🎨 Pretty Logseq');
      expect(result.querySelector('.pretty-popover__description')).toBeTruthy();
      expect(result.querySelectorAll('.pretty-popover__codebase-stack-tag')).toHaveLength(3);
      expect(result.querySelector('.pretty-popover__codebase-link')).toBeTruthy();
      expect(result.querySelectorAll('.pretty-popover__tag')).toHaveLength(3);
    });

    it('cleans property values (removes brackets)', () => {
      const pageData: PageData = {
        name: 'Pretty Logseq',
        properties: {
          type: '[[Code Base]]',
          status: '[[Active]]',
          area: '[[Frontend]]',
        },
      };

      const result = codebaseRenderer.render(pageData);

      const tags = result.querySelectorAll('.pretty-popover__tag');
      expect(Array.from(tags).map(t => t.textContent)).toEqual(['Code Base', 'Active', 'Frontend']);
    });
  });
});
