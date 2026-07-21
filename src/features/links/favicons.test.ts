/**
 * Tests for Link Favicons
 */

import { describe, expect, it } from 'vitest';
import {
  cleanupAllLinks,
  cleanupLink,
  createFaviconImg,
  createGlobeSvg,
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

describe('createGlobeSvg', () => {
  it('builds an inline <svg> element (not an <img> data URI)', () => {
    const svg = createGlobeSvg(16);
    expect(svg.tagName.toLowerCase()).toBe('svg');
    expect(svg.getAttribute('width')).toBe('16');
    expect(svg.getAttribute('height')).toBe('16');
    // Inline SVG is not subject to CSP img-src, unlike <img src="data:…">.
    expect(svg.querySelectorAll('path').length).toBe(2);
  });

  it('respects a custom size', () => {
    const svg = createGlobeSvg(14);
    expect(svg.getAttribute('width')).toBe('14');
    expect(svg.getAttribute('height')).toBe('14');
  });
});

describe('createFaviconImg', () => {
  const style = 'width:14px;height:14px';

  it('builds an <img> with the given src, size, class and inline style', () => {
    const img = createFaviconImg({
      src: 'https://example.com/favicon.ico',
      size: 14,
      className: 'my-favicon',
      style,
    });

    expect(img.tagName.toLowerCase()).toBe('img');
    expect(img.src).toContain('example.com/favicon.ico');
    expect(img.getAttribute('class')).toBe('my-favicon');
    expect(img.width).toBe(14);
    expect(img.height).toBe(14);
    expect(img.style.cssText).toContain('width: 14px');
  });

  it('swaps to an inline globe svg (same class/size) when the image errors', () => {
    const container = document.createElement('div');
    const img = createFaviconImg({
      src: 'https://example.com/favicon.ico',
      size: 14,
      className: 'my-favicon',
      style,
    });
    container.appendChild(img);

    // Simulate the real favicon failing (offline / 404 / CSP img-src block).
    img.onerror?.(new Event('error'));

    expect(container.querySelector('img.my-favicon')).toBeNull();
    const globe = container.querySelector('svg.my-favicon') as SVGSVGElement | null;
    expect(globe).not.toBeNull();
    expect(globe?.getAttribute('width')).toBe('14');
    expect(globe?.getAttribute('height')).toBe('14');
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

  it('inserts a real favicon image before link text', () => {
    const anchor = createExternalLink('https://example.com');

    decorateLink(anchor);

    const favicon = anchor.querySelector('.pretty-link__favicon') as HTMLImageElement;
    expect(favicon).not.toBeNull();
    expect(favicon.tagName.toLowerCase()).toBe('img');
    // Loads the real per-site favicon; the domain is passed to the service.
    expect(favicon.src).toContain('example.com');
    expect(favicon.width).toBe(16);
    expect(favicon.height).toBe(16);
  });

  it('falls back to an inline globe svg when the favicon fails to load', () => {
    const anchor = createExternalLink('https://example.com');

    decorateLink(anchor);

    const img = anchor.querySelector('img.pretty-link__favicon') as HTMLImageElement;
    expect(img).not.toBeNull();

    // Simulate the real favicon failing (offline / 404 / CSP img-src block).
    img.onerror?.(new Event('error'));

    expect(anchor.querySelector('img.pretty-link__favicon')).toBeNull();
    const globe = anchor.querySelector('svg.pretty-link__favicon');
    expect(globe).not.toBeNull();
    // The swapped-in icon is still the first child, before the link text.
    expect(anchor.firstChild).toBe(globe);
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
