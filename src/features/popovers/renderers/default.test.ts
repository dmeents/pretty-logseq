/**
 * Tests for Default Popover Renderer
 */

import { describe, expect, it } from 'vitest';
import { mockPageData, mockPageWithProperties } from '../../../../test/mocks/logseq';
import { defaultRenderer } from './default';

describe('Default Renderer', () => {
  it('has correct ID', () => {
    expect(defaultRenderer.id).toBe('default');
  });

  describe('match', () => {
    it('always returns true (fallback renderer)', () => {
      const anyPage = mockPageData();

      expect(defaultRenderer.match(anyPage)).toBe(true);
    });
  });

  describe('render', () => {
    it('renders page title', () => {
      const pageData = mockPageData({ name: 'Test Page' });
      const element = defaultRenderer.render(pageData);

      const title = element.querySelector('.pretty-popover__title');

      expect(title).toBeTruthy();
      expect(title?.textContent).toContain('Test Page');
    });

    it('makes title clickable with data attribute', () => {
      const pageData = mockPageData({ name: 'My Page' });
      const element = defaultRenderer.render(pageData);

      const title = element.querySelector('.pretty-popover__title') as HTMLElement;

      expect(title?.dataset.pageName).toBe('My Page');
    });

    it('renders snippet from first block', () => {
      const pageData = mockPageData({
        blocks: [{ content: 'This is the first block content.' }],
      });

      const element = defaultRenderer.render(pageData);
      const snippet = element.querySelector('.pretty-popover__snippet');

      expect(snippet?.textContent).toContain('This is the first block content.');
    });

    it('renders no snippet when no blocks', () => {
      const pageData = mockPageData({ blocks: [] });
      const element = defaultRenderer.render(pageData);

      const snippet = element.querySelector('.pretty-popover__snippet');

      expect(snippet).toBeNull();
    });

    it('cleans block content in snippet', () => {
      const pageData = mockPageData({
        blocks: [
          { content: 'title:: Test\ntype:: Note\nSee [[Other Page]] for **bold** details.' },
        ],
      });

      const element = defaultRenderer.render(pageData);
      const snippet = element.querySelector('.pretty-popover__snippet');
      const text = snippet?.textContent || '';

      expect(text).not.toContain('title::');
      expect(text).not.toContain('[[');
      expect(text).not.toContain('**');
      expect(text).toContain('Other Page');
    });

    it('renders property tags when properties exist', () => {
      const pageData = mockPageWithProperties({
        type: 'Note',
        status: 'Active',
        area: 'Backend',
      });

      const element = defaultRenderer.render(pageData);
      const tags = element.querySelectorAll('.pretty-popover__tag');

      expect(tags.length).toBeGreaterThan(0);
    });

    it('renders specific property tags (type, status, area)', () => {
      const pageData = mockPageWithProperties({
        type: 'Resource',
        status: 'In Progress',
        area: 'Frontend',
        otherProp: 'Should not appear',
      });

      const element = defaultRenderer.render(pageData);
      const tags = Array.from(element.querySelectorAll('.pretty-popover__tag'));
      const tagTexts = tags.map(tag => tag.textContent);

      expect(tagTexts).toContain('Resource');
      expect(tagTexts).toContain('In Progress');
      expect(tagTexts).toContain('Frontend');
      expect(tagTexts).not.toContain('Should not appear');
    });

    it('cleans property values (removes brackets)', () => {
      const pageData = mockPageWithProperties({
        type: ['[[Resource]]'],
      });

      const element = defaultRenderer.render(pageData);
      const tags = element.querySelectorAll('.pretty-popover__tag');
      const tagText = tags[0]?.textContent;

      expect(tagText).toBe('Resource');
      expect(tagText).not.toContain('[[');
    });

    it('does not render tags section when no relevant properties', () => {
      const pageData = mockPageData({
        properties: {
          customProp: 'value',
          anotherProp: '123',
        },
      });

      const element = defaultRenderer.render(pageData);
      const tags = element.querySelectorAll('.pretty-popover__tag');

      expect(tags.length).toBe(0);
    });

    it('renders complete popover structure', () => {
      const pageData = mockPageData({
        name: 'Complete Page',
        properties: {
          type: 'Note',
          status: 'Active',
          description: 'This is the description from properties.',
        },
        blocks: [{ content: 'This is the snippet from blocks.' }],
      });

      const element = defaultRenderer.render(pageData);

      expect(element.className).toBe('pretty-popover__content');
      expect(element.querySelector('.pretty-popover__title')).toBeTruthy();
      expect(element.querySelector('.pretty-popover__description')).toBeTruthy();
      expect(element.querySelector('.pretty-popover__snippet')).toBeTruthy();
      expect(element.querySelector('.pretty-popover__properties')).toBeTruthy();
    });

    it('handles missing page name gracefully', () => {
      const pageData = mockPageData({ name: '' });
      const element = defaultRenderer.render(pageData);

      const title = element.querySelector('.pretty-popover__title');

      expect(title).toBeTruthy();
      expect(title?.textContent).toBe('');
    });

    it('renders description from properties', () => {
      const pageData = mockPageWithProperties({
        description: 'This is a description from page properties.',
      });

      const element = defaultRenderer.render(pageData);
      const description = element.querySelector('.pretty-popover__description');

      expect(description?.textContent).toBe('This is a description from page properties.');
    });

    it('truncates long snippets', () => {
      const longContent = 'A'.repeat(600);
      const pageData = mockPageData({
        blocks: [{ content: longContent }],
      });

      const element = defaultRenderer.render(pageData);
      const snippet = element.querySelector('.pretty-popover__snippet');
      const text = snippet?.textContent || '';

      // Should be truncated (default maxLength is 560)
      expect(text.length).toBeLessThan(longContent.length);
      expect(text).toContain('…'); // Ellipsis character
    });

    it('skips empty blocks when extracting snippet', () => {
      const pageData = mockPageData({
        blocks: [
          { content: 'title:: Test\ntype:: Note' }, // Will be empty after cleaning
          { content: 'Actual content here.' },
        ],
      });

      const element = defaultRenderer.render(pageData);
      const snippet = element.querySelector('.pretty-popover__snippet');

      expect(snippet?.textContent).toBe('Actual content here.');
    });

    it('renders icon with title when icon property exists', () => {
      const pageData = mockPageData({
        name: 'Iconized Page',
        properties: {
          icon: '📝',
        },
      });

      const element = defaultRenderer.render(pageData);
      const title = element.querySelector('.pretty-popover__title');

      expect(title?.textContent).toBe('📝 Iconized Page');
    });
  });
});
