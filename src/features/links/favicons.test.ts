/**
 * Tests for Link Favicons
 */

import { describe, expect, it } from 'vitest';
import {
  cleanupAllLinks,
  cleanupLink,
  decorateLink,
  FALLBACK_ICON,
  getFaviconUrl,
} from './favicons';

describe('getFaviconUrl', () => {
  it('returns favicon.ico URL for a domain', () => {
    expect(getFaviconUrl('example.com')).toBe('https://example.com/favicon.ico');
  });

  it('works with subdomains', () => {
    expect(getFaviconUrl('docs.example.com')).toBe('https://docs.example.com/favicon.ico');
  });
});

describe('FALLBACK_ICON', () => {
  it('is a data URI SVG', () => {
    expect(FALLBACK_ICON).toMatch(/^data:image\/svg\+xml/);
  });
});

describe('decorateLink', () => {
  function createExternalLink(href: string): HTMLAnchorElement {
    const anchor = document.createElement('a');
    anchor.className = 'external-link';
    anchor.href = href;
    anchor.textContent = 'Link text';
    return anchor;
  }

  it('inserts a favicon image before link text', () => {
    const anchor = createExternalLink('https://example.com');

    decorateLink(anchor);

    const favicon = anchor.querySelector('.pretty-link__favicon') as HTMLImageElement;
    expect(favicon).not.toBeNull();
    expect(favicon.src).toBe(FALLBACK_ICON);
    expect(favicon.width).toBe(16);
    expect(favicon.height).toBe(16);
  });

  it('sets data-pl-favicon attribute', () => {
    const anchor = createExternalLink('https://example.com');

    decorateLink(anchor);

    expect(anchor.getAttribute('data-pl-favicon')).toBe('true');
  });

  it('does not process already-decorated links', () => {
    const anchor = createExternalLink('https://example.com');
    anchor.setAttribute('data-pl-favicon', 'true');

    decorateLink(anchor);

    const favicons = anchor.querySelectorAll('.pretty-link__favicon');
    expect(favicons.length).toBe(0);
  });

  it('skips links with empty href', () => {
    const anchor = document.createElement('a');
    anchor.className = 'external-link';

    decorateLink(anchor);

    expect(anchor.querySelector('.pretty-link__favicon')).toBeNull();
    expect(anchor.hasAttribute('data-pl-favicon')).toBe(false);
  });

  it('skips non-http(s) links', () => {
    const anchor = document.createElement('a');
    anchor.className = 'external-link';
    anchor.href = 'mailto:test@example.com';

    decorateLink(anchor);

    expect(anchor.querySelector('.pretty-link__favicon')).toBeNull();
  });

  it('accepts http links', () => {
    const anchor = createExternalLink('http://example.com');

    decorateLink(anchor);

    expect(anchor.querySelector('.pretty-link__favicon')).not.toBeNull();
  });

  it('favicon is inserted before existing content', () => {
    const anchor = createExternalLink('https://example.com');

    decorateLink(anchor);

    expect(anchor.firstChild).toBe(anchor.querySelector('.pretty-link__favicon'));
  });
});

describe('cleanupLink', () => {
  it('removes favicon and attribute from a decorated link', () => {
    const anchor = document.createElement('a');
    anchor.className = 'external-link';
    anchor.href = 'https://example.com';
    anchor.textContent = 'Link';

    decorateLink(anchor);
    expect(anchor.querySelector('.pretty-link__favicon')).not.toBeNull();

    cleanupLink(anchor);

    expect(anchor.querySelector('.pretty-link__favicon')).toBeNull();
    expect(anchor.hasAttribute('data-pl-favicon')).toBe(false);
  });

  it('does not throw on undecorated link', () => {
    const anchor = document.createElement('a');
    anchor.href = 'https://example.com';

    expect(() => cleanupLink(anchor)).not.toThrow();
  });
});

describe('cleanupAllLinks', () => {
  it('cleans up all decorated links in a container', () => {
    const container = document.createElement('div');

    for (let i = 0; i < 3; i++) {
      const anchor = document.createElement('a');
      anchor.className = 'external-link';
      anchor.href = `https://example${i}.com`;
      anchor.textContent = `Link ${i}`;
      container.appendChild(anchor);
      decorateLink(anchor);
    }

    expect(container.querySelectorAll('[data-pl-favicon]').length).toBe(3);

    cleanupAllLinks(container);

    expect(container.querySelectorAll('[data-pl-favicon]').length).toBe(0);
    expect(container.querySelectorAll('.pretty-link__favicon').length).toBe(0);
  });

  it('does not affect undecorated links', () => {
    const container = document.createElement('div');
    const anchor = document.createElement('a');
    anchor.className = 'external-link';
    anchor.href = 'https://example.com';
    anchor.textContent = 'Not decorated';
    container.appendChild(anchor);

    cleanupAllLinks(container);

    expect(anchor.textContent).toBe('Not decorated');
  });
});
