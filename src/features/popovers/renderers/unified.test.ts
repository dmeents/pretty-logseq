/**
 * Tests for Unified Popover Renderer
 */

import { describe, expect, it } from 'vitest';
import type { PageData } from '../../../types';
import { renderPopover } from './unified';

function makePage(
  name: string,
  properties: Record<string, unknown> = {},
  blocks?: { content: string }[],
): PageData {
  return { name, properties, blocks };
}

describe('renderPopover', () => {
  describe('container', () => {
    it('returns an element with popover content class', () => {
      const el = renderPopover(makePage('Test'));
      expect(el.className).toBe('pretty-popover__content');
    });

    it('returns a div element', () => {
      const el = renderPopover(makePage('Test'));
      expect(el.tagName).toBe('DIV');
    });
  });

  describe('header', () => {
    it('renders title with page name', () => {
      const el = renderPopover(makePage('My Page'));
      const title = el.querySelector('.pretty-popover__title');
      expect(title).not.toBeNull();
      expect(title?.textContent).toBe('My Page');
    });

    it('renders title with icon when present', () => {
      const el = renderPopover(makePage('My Page', { icon: '📄' }));
      const title = el.querySelector('.pretty-popover__title');
      expect(title?.textContent).toBe('📄 My Page');
    });

    it('renders simple header when no photo', () => {
      const el = renderPopover(makePage('Page', { type: 'Note' }));
      expect(el.querySelector('.pretty-popover__header')).not.toBeNull();
      expect(el.querySelector('.pretty-popover__photo-card')).toBeNull();
    });

    it('renders photo card when photo property exists', () => {
      const el = renderPopover(makePage('Person', { photo: 'https://example.com/photo.jpg' }));
      const card = el.querySelector('.pretty-popover__photo-card');
      expect(card).not.toBeNull();

      const img = card?.querySelector('img');
      expect(img?.src).toBe('https://example.com/photo.jpg');
      expect(img?.loading).toBe('lazy');
    });

    it('renders title inside photo card header info', () => {
      const el = renderPopover(makePage('John', { photo: 'https://example.com/photo.jpg' }));
      const info = el.querySelector('.pretty-popover__header-info');
      expect(info).not.toBeNull();
      const title = info?.querySelector('.pretty-popover__title');
      expect(title?.textContent).toBe('John');
    });
  });

  describe('subtitle', () => {
    it('renders subtitle when a subtitle property exists', () => {
      const el = renderPopover(makePage('Person', { role: 'Engineer' }));
      const subtitle = el.querySelector('.pretty-popover__subtitle');
      expect(subtitle?.textContent).toBe('Engineer');
    });

    it('renders combined role at organization subtitle', () => {
      const el = renderPopover(makePage('Person', { role: 'CTO', organization: 'Startup Inc' }));
      const subtitle = el.querySelector('.pretty-popover__subtitle');
      expect(subtitle?.textContent).toBe('CTO at Startup Inc');
    });

    it('does not render subtitle when no subtitle property exists', () => {
      const el = renderPopover(makePage('Page', { type: 'Note' }));
      expect(el.querySelector('.pretty-popover__subtitle')).toBeNull();
    });
  });

  describe('aliases', () => {
    it('renders aliases when alias property exists', () => {
      const el = renderPopover(makePage('Page', { alias: ['Alt1', 'Alt2'] }));
      const aliases = el.querySelector('.pretty-popover__aliases');
      expect(aliases).not.toBeNull();
      expect(aliases?.textContent).toContain('aka');
      expect(aliases?.textContent).toContain('Alt1');
      expect(aliases?.textContent).toContain('Alt2');
    });

    it('does not render aliases when alias property is missing', () => {
      const el = renderPopover(makePage('Page'));
      expect(el.querySelector('.pretty-popover__aliases')).toBeNull();
    });

    it('joins aliases with dot separator', () => {
      const el = renderPopover(makePage('Page', { alias: ['A', 'B', 'C'] }));
      const aliases = el.querySelector('.pretty-popover__aliases');
      expect(aliases?.textContent).toBe('aka A \u00B7 B \u00B7 C');
    });
  });

  describe('description', () => {
    it('renders description when present', () => {
      const el = renderPopover(makePage('Page', { description: 'A useful page' }));
      const desc = el.querySelector('.pretty-popover__description');
      expect(desc?.textContent).toBe('A useful page');
    });

    it('does not render description when absent', () => {
      const el = renderPopover(makePage('Page'));
      expect(el.querySelector('.pretty-popover__description')).toBeNull();
    });
  });

  describe('snippet', () => {
    it('renders snippet when page has no rich properties', () => {
      const el = renderPopover(
        makePage('Page', { type: 'Note' }, [{ content: 'Some block content here' }]),
      );
      const snippet = el.querySelector('.pretty-popover__snippet');
      expect(snippet).not.toBeNull();
      expect(snippet?.textContent).toBe('Some block content here');
    });

    it('does not render snippet when page has detail properties', () => {
      const el = renderPopover(makePage('Page', { rating: 4 }, [{ content: 'Block content' }]));
      expect(el.querySelector('.pretty-popover__snippet')).toBeNull();
    });

    it('does not render snippet when page has url', () => {
      const el = renderPopover(
        makePage('Page', { url: 'https://example.com' }, [{ content: 'Content' }]),
      );
      expect(el.querySelector('.pretty-popover__snippet')).toBeNull();
    });

    it('does not render snippet section when blocks are empty', () => {
      const el = renderPopover(makePage('Page', { type: 'Note' }, []));
      expect(el.querySelector('.pretty-popover__snippet')).toBeNull();
    });
  });

  describe('detail rows', () => {
    it('renders detail rows for detail properties', () => {
      const el = renderPopover(makePage('Page', { rating: 4, location: 'NYC' }));
      const details = el.querySelector('.pretty-popover__details');
      expect(details).not.toBeNull();
      const rows = details?.querySelectorAll('.pretty-popover__detail-row');
      expect(rows?.length).toBe(2);
    });

    it('renders rating as stars in detail row', () => {
      const el = renderPopover(makePage('Page', { rating: 3 }));
      const rating = el.querySelector('.pretty-popover__rating');
      expect(rating?.textContent).toBe('★★★☆☆');
    });

    it('renders email as mailto link in detail row', () => {
      const el = renderPopover(makePage('Page', { email: 'test@example.com' }));
      const link = el.querySelector('.pretty-popover__detail-link') as HTMLAnchorElement;
      expect(link).not.toBeNull();
      expect(link.href).toBe('mailto:test@example.com');
    });

    it('capitalizes detail labels', () => {
      const el = renderPopover(makePage('Page', { location: 'NYC' }));
      const label = el.querySelector('.pretty-popover__detail-label');
      expect(label?.textContent).toBe('Location');
    });

    it('does not render details section when no detail properties', () => {
      const el = renderPopover(makePage('Page', { type: 'Note' }));
      expect(el.querySelector('.pretty-popover__details')).toBeNull();
    });
  });

  describe('array properties', () => {
    it('renders array properties as tag pills', () => {
      const el = renderPopover(makePage('Page', { stack: ['React', 'Node', 'TS'] }));
      const pills = el.querySelector('.pretty-popover__array-tags');
      expect(pills).not.toBeNull();
      const tags = pills?.querySelectorAll('.pretty-popover__tag');
      expect(tags?.length).toBe(3);
    });

    it('does not render array section for non-array properties', () => {
      const el = renderPopover(makePage('Page', { type: 'Note' }));
      expect(el.querySelector('.pretty-popover__array-tags')).toBeNull();
    });
  });

  describe('link section', () => {
    it('renders link section when url property exists', () => {
      const el = renderPopover(makePage('Page', { url: 'https://github.com/user/repo' }));
      const linkSection = el.querySelector('.pretty-popover__link-section');
      expect(linkSection).not.toBeNull();

      const link = linkSection?.querySelector(
        '.pretty-popover__external-link',
      ) as HTMLAnchorElement;
      expect(link.href).toBe('https://github.com/user/repo');
      expect(link.target).toBe('_blank');
      expect(link.rel).toBe('noopener noreferrer');
      expect(link.textContent).toBe('user/repo');
    });

    it('does not render link section when no url', () => {
      const el = renderPopover(makePage('Page'));
      expect(el.querySelector('.pretty-popover__link-section')).toBeNull();
    });

    it('does not render link section when url is not a valid URL', () => {
      const el = renderPopover(makePage('Page', { url: 'not-a-url' }));
      expect(el.querySelector('.pretty-popover__link-section')).toBeNull();
    });
  });

  describe('tags', () => {
    it('renders type, status, area as tag pills', () => {
      const el = renderPopover(
        makePage('Page', {
          type: 'Person',
          status: 'Active',
          area: 'Engineering',
        }),
      );
      const tags = el.querySelector('.pretty-popover__properties');
      expect(tags).not.toBeNull();
      const pills = tags?.querySelectorAll('.pretty-popover__tag');
      expect(pills?.length).toBe(3);
      expect(pills?.[0].textContent).toBe('Person');
      expect(pills?.[1].textContent).toBe('Active');
      expect(pills?.[2].textContent).toBe('Engineering');
    });

    it('includes extra tags like relationship', () => {
      const el = renderPopover(makePage('Page', { type: 'Person', relationship: 'Friend' }));
      const pills = el.querySelectorAll('.pretty-popover__tag');
      const texts = Array.from(pills).map(p => p.textContent);
      expect(texts).toContain('Friend');
    });

    it('does not render tags section when no type/status/area', () => {
      const el = renderPopover(makePage('Page'));
      expect(el.querySelector('.pretty-popover__properties')).toBeNull();
    });

    it('cleans bracket syntax from tag values', () => {
      const el = renderPopover(makePage('Page', { type: '[[Person]]' }));
      const pill = el.querySelector('.pretty-popover__tag');
      expect(pill?.textContent).toBe('Person');
    });
  });

  describe('section ordering', () => {
    it('renders sections in the correct order', () => {
      const el = renderPopover(
        makePage(
          'Full Page',
          {
            icon: '📄',
            type: 'Person',
            role: 'Engineer',
            description: 'A great engineer',
            email: 'eng@co.com',
            status: 'Active',
            url: 'https://example.com',
          },
          [{ content: 'First block' }],
        ),
      );

      const children = Array.from(el.children);
      const classNames = children.map(c => c.className);

      // Header should be first
      expect(classNames[0]).toBe('pretty-popover__header');

      // Find indices for sections that exist
      const descIdx = classNames.indexOf('pretty-popover__description');
      const detailIdx = classNames.indexOf('pretty-popover__details');
      const linkIdx = classNames.indexOf('pretty-popover__link-section');
      const tagsIdx = classNames.indexOf('pretty-popover__properties');

      // Description before details
      expect(descIdx).toBeLessThan(detailIdx);
      // Details before link section
      expect(detailIdx).toBeLessThan(linkIdx);
      // Link section before tags
      expect(linkIdx).toBeLessThan(tagsIdx);
    });
  });

  describe('full page scenarios', () => {
    it('renders a minimal page with just a title', () => {
      const el = renderPopover(makePage('Minimal'));
      const title = el.querySelector('.pretty-popover__title');
      expect(title?.textContent).toBe('Minimal');
      // Only header should exist
      expect(el.children.length).toBe(1);
    });

    it('renders a rich person page', () => {
      const el = renderPopover(
        makePage('Alice', {
          icon: '👩',
          type: 'Person',
          role: 'Designer',
          organization: 'Design Co',
          photo: 'https://example.com/alice.jpg',
          description: 'UI designer',
          email: 'alice@design.co',
          status: 'Active',
          area: 'Design',
          relationship: 'Colleague',
        }),
      );

      // Photo card header
      expect(el.querySelector('.pretty-popover__photo-card')).not.toBeNull();
      expect(el.querySelector('.pretty-popover__title')?.textContent).toBe('👩 Alice');

      // Subtitle
      expect(el.querySelector('.pretty-popover__subtitle')?.textContent).toBe(
        'Designer at Design Co',
      );

      // Description
      expect(el.querySelector('.pretty-popover__description')?.textContent).toBe('UI designer');

      // Detail rows (email)
      expect(el.querySelector('.pretty-popover__detail-link')).not.toBeNull();

      // Tags
      const tags = el.querySelectorAll('.pretty-popover__tag');
      const tagTexts = Array.from(tags).map(t => t.textContent);
      expect(tagTexts).toContain('Person');
      expect(tagTexts).toContain('Active');
      expect(tagTexts).toContain('Design');
      expect(tagTexts).toContain('Colleague');
    });

    it('renders a codebase page with repository link', () => {
      const el = renderPopover(
        makePage('my-project', {
          type: 'Code Base',
          platform: 'GitHub',
          repository: 'https://github.com/user/my-project',
          status: 'In Progress',
          stack: ['TypeScript', 'React', 'Node'],
        }),
      );

      // Subtitle
      expect(el.querySelector('.pretty-popover__subtitle')?.textContent).toBe('GitHub');

      // Repository detail row as link
      const repoLink = el.querySelector('.pretty-popover__detail-link') as HTMLAnchorElement;
      expect(repoLink).not.toBeNull();
      expect(repoLink.textContent).toBe('user/my-project');

      // Stack array pills
      const arrayTags = el.querySelector('.pretty-popover__array-tags');
      expect(arrayTags).not.toBeNull();
    });
  });
});
