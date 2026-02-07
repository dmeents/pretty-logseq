/**
 * Resource Popover Renderer
 *
 * @deprecated Replaced by unified renderer (unified.ts).
 * Kept for reference and as a fallback escape hatch.
 * To re-enable: import and register in renderers/index.ts
 *
 * Renders a compact card-style popover for pages with type: Resource.
 * Shows icon, title, description, and property tags.
 */

import { cleanPropertyValue } from '../../../lib/api';
import type { PageData } from '../../../types';
import type { PopoverRenderer } from './types';

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

export const resourceRenderer: PopoverRenderer = {
  id: 'resource',

  match(pageData: PageData): boolean {
    const { type } = pageData.properties;
    if (!type) return false;
    return cleanPropertyValue(type).toLowerCase() === 'resource';
  },

  render(pageData: PageData): HTMLElement {
    const content = document.createElement('div');
    content.className = 'pretty-popover__content';

    content.appendChild(createTitle(pageData));

    if (pageData.properties.description) {
      content.appendChild(createDescription(pageData.properties.description));
    }

    const tags = createTags(pageData);
    if (tags) {
      content.appendChild(tags);
    }

    return content;
  },
};
