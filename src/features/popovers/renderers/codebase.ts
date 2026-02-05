/**
 * Code Base Popover Renderer
 *
 * Renders a repository-focused popover for pages with type: Code Base.
 * Prominently displays the repository URL as a clickable link alongside
 * the title, description, and property tags.
 */

import { cleanPropertyValue } from '../../../lib/api';
import type { PageData } from '../../../types';
import type { PopoverRenderer } from './types';

/**
 * Extract a URL from a Logseq property value.
 * Handles markdown link format [text](url), plain URLs, and bracketed values.
 */
function extractUrl(value: unknown): string | null {
  const raw = cleanPropertyValue(value);
  if (!raw) return null;

  // Markdown link: [text](url)
  const mdMatch = raw.match(/\[.*?\]\((.*?)\)/);
  if (mdMatch) return mdMatch[1];

  // Plain URL
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  return null;
}

/**
 * Derive a display label from a repository URL.
 * e.g. "https://github.com/user/repo" -> "user/repo"
 */
function formatRepoLabel(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/^\/|\/$/g, '');
    if (path) return path;
    return parsed.hostname;
  } catch {
    return url;
  }
}

function createTitle(pageData: PageData): HTMLElement {
  const { name, properties } = pageData;

  const title = document.createElement('a');
  title.className = 'pretty-popover__title';
  title.textContent = properties.icon ? `${properties.icon} ${name}` : name;
  title.dataset.pageName = name;

  return title;
}

function createDescription(description: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'pretty-popover__description';
  el.textContent = description;
  return el;
}

function createRepoLink(url: string): HTMLElement {
  const container = document.createElement('div');
  container.className = 'pretty-popover__codebase-repo';

  const link = document.createElement('a');
  link.className = 'pretty-popover__codebase-link';
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = formatRepoLabel(url);

  container.appendChild(link);
  return container;
}

function cleanAllValues(value: unknown): string[] {
  if (!Array.isArray(value)) {
    const cleaned = cleanPropertyValue(value);
    return cleaned ? [cleaned] : [];
  }
  return value.map(v => cleanPropertyValue(v)).filter(v => v.length > 0);
}

function createStack(pageData: PageData): HTMLElement | null {
  const items = cleanAllValues(pageData.properties.stack);
  if (items.length === 0) return null;

  const container = document.createElement('div');
  container.className = 'pretty-popover__codebase-stack';

  for (const item of items) {
    const tag = document.createElement('span');
    tag.className = 'pretty-popover__codebase-stack-tag';
    tag.textContent = item;
    container.appendChild(tag);
  }

  return container;
}

function createTags(pageData: PageData): HTMLElement | null {
  const { type, status, area } = pageData.properties;

  const values: string[] = [];
  if (type) values.push(cleanPropertyValue(type));
  if (status) values.push(cleanPropertyValue(status));
  if (area) values.push(cleanPropertyValue(area));

  if (values.length === 0) return null;

  const container = document.createElement('div');
  container.className = 'pretty-popover__properties';

  for (const value of values) {
    const tag = document.createElement('span');
    tag.className = 'pretty-popover__tag';
    tag.textContent = value;
    container.appendChild(tag);
  }

  return container;
}

export const codebaseRenderer: PopoverRenderer = {
  id: 'codebase',

  match(pageData: PageData): boolean {
    const { type } = pageData.properties;
    if (!type) return false;
    return cleanPropertyValue(type).toLowerCase() === 'code base';
  },

  render(pageData: PageData): HTMLElement {
    const content = document.createElement('div');
    content.className = 'pretty-popover__content';

    content.appendChild(createTitle(pageData));

    if (pageData.properties.description) {
      content.appendChild(createDescription(pageData.properties.description as string));
    }

    const stack = createStack(pageData);
    if (stack) {
      content.appendChild(stack);
    }

    const repoUrl = extractUrl(pageData.properties.url);
    if (repoUrl) {
      content.appendChild(createRepoLink(repoUrl));
    }

    const tags = createTags(pageData);
    if (tags) {
      content.appendChild(tags);
    }

    return content;
  },
};
