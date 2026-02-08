import { cleanBlockContent, cleanPropertyValue } from '../../../lib/api';
import type { PageData } from '../../../types';

/**
 * Extract a URL from a Logseq property value.
 * Handles markdown link format [text](url) and plain URLs.
 */
export function extractUrl(value: unknown): string | null {
  const raw = cleanPropertyValue(value);
  if (!raw) return null;

  const mdMatch = raw.match(/\[.*?\]\((.*?)\)/);
  if (mdMatch) return mdMatch[1];

  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  return null;
}

/**
 * Derive a display label from a URL.
 * e.g. "https://github.com/user/repo" → "user/repo"
 */
export function formatUrlLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/|\/$/g, '');
    if (path) return path;
    return parsed.hostname;
  } catch {
    return url;
  }
}

/**
 * Parse a property value into an array of cleaned strings.
 * Handles both single values and Logseq array properties.
 */
export function cleanAllValues(value: unknown): string[] {
  if (!Array.isArray(value)) {
    const cleaned = cleanPropertyValue(value);
    return cleaned ? [cleaned] : [];
  }
  return value.map(v => cleanPropertyValue(v)).filter(v => v.length > 0);
}

/**
 * Create the standard clickable title element (icon + name).
 */
export function createTitle(pageData: PageData): HTMLElement {
  const { name, properties } = pageData;

  const title = document.createElement('a');
  title.className = 'pretty-popover__title';
  title.textContent = properties.icon ? `${properties.icon} ${name}` : name;
  title.dataset.pageName = name;

  return title;
}

/**
 * Create a description element with line clamping via CSS.
 */
export function createDescription(description: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'pretty-popover__description';
  el.textContent = description;
  return el;
}

/**
 * Create a container of tag pill elements from an array of strings.
 * Returns null if the array is empty.
 */
export function createTagPills(
  values: string[],
  containerClass = 'pretty-popover__properties',
): HTMLElement | null {
  if (values.length === 0) return null;

  const container = document.createElement('div');
  container.className = containerClass;

  for (const value of values) {
    const tag = document.createElement('span');
    tag.className = 'pretty-popover__tag';
    tag.textContent = value;
    container.appendChild(tag);
  }

  return container;
}

/**
 * Create a key-value detail row.
 */
export function createDetailRow(label: string, valueEl: HTMLElement): HTMLElement {
  const row = document.createElement('div');
  row.className = 'pretty-popover__detail-row';

  const labelEl = document.createElement('span');
  labelEl.className = 'pretty-popover__detail-label';
  labelEl.textContent = label;

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  return row;
}

/**
 * Render a property value with smart formatting based on the property name.
 * email → mailto link, phone → tel link, url/repository → external link,
 * rating → star display, everything else → plain text.
 */
export function renderPropertyValue(key: string, value: unknown): HTMLElement {
  const cleaned = cleanPropertyValue(value);

  switch (key) {
    case 'rating':
      return createRatingDisplay(value);

    case 'email': {
      const link = document.createElement('a');
      link.href = `mailto:${cleaned}`;
      link.textContent = cleaned;
      link.className = 'pretty-popover__detail-link';
      return link;
    }

    case 'phone': {
      const link = document.createElement('a');
      link.href = `tel:${cleaned}`;
      link.textContent = cleaned;
      link.className = 'pretty-popover__detail-link';
      return link;
    }

    case 'url':
    case 'repository': {
      const url = extractUrl(value);
      if (url) {
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = formatUrlLabel(url);
        link.className = 'pretty-popover__detail-link';
        return link;
      }
      const span = document.createElement('span');
      span.className = 'pretty-popover__detail-value';
      span.textContent = cleaned;
      return span;
    }

    default: {
      const span = document.createElement('span');
      span.className = 'pretty-popover__detail-value';
      span.textContent = cleaned;
      return span;
    }
  }
}

/**
 * Create a star rating display. e.g. 3 → "★★★☆☆"
 * Falls back to plain text for non-numeric values.
 */
export function createRatingDisplay(value: unknown): HTMLElement {
  const container = document.createElement('span');
  container.className = 'pretty-popover__rating';

  const num = Number.parseFloat(cleanPropertyValue(value));
  if (Number.isNaN(num)) {
    container.textContent = cleanPropertyValue(value);
    return container;
  }

  const maxStars = 5;
  const clamped = Math.max(0, Math.min(maxStars, num));
  const full = Math.floor(clamped);
  const empty = maxStars - full;

  container.textContent = '\u2605'.repeat(full) + '\u2606'.repeat(empty);
  container.title = `${num} / ${maxStars}`;

  return container;
}

/**
 * Extract a content snippet from page blocks.
 * Cleans each block's content, skips empty/property-only blocks,
 * and truncates to a character limit at a word boundary.
 */
export function extractSnippet(pageData: PageData, maxLength = 560): string | null {
  const { blocks } = pageData;
  if (!blocks || blocks.length === 0) return null;

  const textParts: string[] = [];

  for (const block of blocks) {
    const cleaned = cleanBlockContent(block.content);
    if (!cleaned) continue;
    textParts.push(cleaned);
  }

  if (textParts.length === 0) return null;

  const joined = textParts.join(' ');
  if (joined.length <= maxLength) return joined;

  const truncated = joined.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const cutoff = lastSpace > maxLength * 0.6 ? lastSpace : maxLength;
  return `${truncated.slice(0, cutoff)}\u2026`;
}
