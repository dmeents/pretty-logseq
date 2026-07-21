/**
 * Tests for Link Popover rendering (LinkMetadata -> DOM)
 */

import { describe, expect, it } from 'vitest';
import { applyPopoverBaseStyles, createFallbackMetadata, renderLinkPopover } from './render';
import type { LinkMetadata } from './types';

function baseMetadata(overrides: Partial<LinkMetadata> = {}): LinkMetadata {
  return {
    url: 'https://example.com/page',
    title: 'Example Title',
    description: 'A description',
    image: null,
    siteName: 'Example',
    domain: 'example.com',
    faviconUrl: 'https://example.com/favicon.ico',
    error: null,
    ...overrides,
  };
}

describe('createFallbackMetadata', () => {
  it('derives the domain from the url and strips a leading www.', () => {
    const meta = createFallbackMetadata('https://www.example.com/some/path');
    expect(meta.domain).toBe('example.com');
    expect(meta.url).toBe('https://www.example.com/some/path');
    expect(meta.faviconUrl).toBe('https://example.com/favicon.ico');
  });

  it('leaves title/description/image empty so it renders as a minimal card', () => {
    const meta = createFallbackMetadata('https://example.com');
    expect(meta.title).toBeNull();
    expect(meta.description).toBeNull();
    expect(meta.image).toBeNull();
    expect(meta.error).toBeNull();
  });

  it('falls back to the raw url as the domain when it cannot be parsed', () => {
    const meta = createFallbackMetadata('not a url');
    expect(meta.domain).toBe('not a url');
  });
});

describe('renderLinkPopover', () => {
  it('renders the content, header, title and footer structure', () => {
    const content = renderLinkPopover(baseMetadata());

    expect(content.className).toBe('pretty-link-popover__content');
    expect(content.querySelector('.pretty-link-popover__header')).not.toBeNull();
    expect(content.querySelector('.pretty-link-popover__favicon')).not.toBeNull();

    const title = content.querySelector('.pretty-link-popover__title');
    expect(title?.textContent).toBe('Example Title');

    const footer = content.querySelector('.pretty-link-popover__footer');
    expect(footer?.textContent).toBe('https://example.com/page');
  });

  it('renders an image wrapper only when metadata has an image', () => {
    const withImage = renderLinkPopover(baseMetadata({ image: 'https://example.com/hero.png' }));
    const wrapper = withImage.querySelector('.pretty-link-popover__image');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.querySelector('img')?.getAttribute('src')).toBe('https://example.com/hero.png');

    const withoutImage = renderLinkPopover(baseMetadata());
    expect(withoutImage.querySelector('.pretty-link-popover__image')).toBeNull();
  });

  it('falls back to siteName then domain for the title', () => {
    const siteName = renderLinkPopover(baseMetadata({ title: null }));
    expect(siteName.querySelector('.pretty-link-popover__title')?.textContent).toBe('Example');

    const domain = renderLinkPopover(baseMetadata({ title: null, siteName: null }));
    expect(domain.querySelector('.pretty-link-popover__title')?.textContent).toBe('example.com');
  });

  it('renders the error message and omits the description when error is set', () => {
    const content = renderLinkPopover(baseMetadata({ error: 'Failed to load' }));
    expect(content.querySelector('.pretty-link-popover__error')?.textContent).toBe(
      'Failed to load',
    );
    expect(content.querySelector('.pretty-link-popover__description')).toBeNull();
  });

  it('renders the description when there is no error', () => {
    const content = renderLinkPopover(baseMetadata());
    expect(content.querySelector('.pretty-link-popover__description')?.textContent).toBe(
      'A description',
    );
    expect(content.querySelector('.pretty-link-popover__error')).toBeNull();
  });
});

describe('applyPopoverBaseStyles', () => {
  it('applies the critical inline positioning styles', () => {
    const el = document.createElement('div');
    applyPopoverBaseStyles(el);
    expect(el.style.position).toBe('fixed');
    expect(el.style.cssText).toContain('z-index: 9999');
  });
});
