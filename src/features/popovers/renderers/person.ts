/**
 * Person Popover Renderer
 *
 * @deprecated Replaced by unified renderer (unified.ts).
 * Kept for reference and as a fallback escape hatch.
 * To re-enable: import and register in renderers/index.ts
 *
 * Renders a contact-card style popover for pages with type: Person.
 * Prominently displays the person's photo alongside their name,
 * role, organization, and contact details.
 */

import { cleanPropertyValue } from '../../../lib/api';
import type { PageData } from '../../../types';
import type { PopoverRenderer } from './types';

/**
 * Extract an image URL from a Logseq property value.
 * Handles markdown link format: [alt text](url)
 * Also handles plain URLs.
 */
function extractImageUrl(value: unknown): string | null {
  const raw = cleanPropertyValue(value);
  if (!raw) return null;

  // Markdown link: [text](url)
  const mdMatch = raw.match(/\[.*?\]\((.*?)\)/);
  if (mdMatch) return mdMatch[1];

  // Plain URL
  if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;

  return null;
}

function createPhoto(url: string): HTMLElement {
  const wrapper = document.createElement('div');
  wrapper.className = 'pretty-popover__person-photo';

  const img = document.createElement('img');
  img.src = url;
  img.alt = 'Photo';
  img.loading = 'lazy';
  wrapper.appendChild(img);

  return wrapper;
}

function createTitle(pageData: PageData): HTMLElement {
  const { name, properties } = pageData;

  const title = document.createElement('a');
  title.className = 'pretty-popover__title';
  title.textContent = properties.icon ? `${properties.icon} ${name}` : name;
  title.dataset.pageName = name;

  return title;
}

function createSubtitle(pageData: PageData): HTMLElement | null {
  const { role, organization } = pageData.properties;
  const rolePart = role ? cleanPropertyValue(role) : null;
  const orgPart = organization ? cleanPropertyValue(organization) : null;

  if (!rolePart && !orgPart) return null;

  const el = document.createElement('div');
  el.className = 'pretty-popover__person-subtitle';

  if (rolePart && orgPart) {
    el.textContent = `${rolePart} at ${orgPart}`;
  } else {
    el.textContent = (rolePart || orgPart) as string;
  }

  return el;
}

function createDetails(pageData: PageData): HTMLElement | null {
  const { location, email, phone } = pageData.properties;

  const items: { label: string; value: string }[] = [];

  if (location) items.push({ label: 'Location', value: cleanPropertyValue(location) });
  if (email) items.push({ label: 'Email', value: cleanPropertyValue(email) });
  if (phone) items.push({ label: 'Phone', value: cleanPropertyValue(phone) });

  if (items.length === 0) return null;

  const container = document.createElement('div');
  container.className = 'pretty-popover__person-details';

  for (const item of items) {
    const row = document.createElement('div');
    row.className = 'pretty-popover__person-detail';

    const label = document.createElement('span');
    label.className = 'pretty-popover__person-label';
    label.textContent = item.label;

    const value = document.createElement('span');
    value.className = 'pretty-popover__person-value';
    value.textContent = item.value;

    row.appendChild(label);
    row.appendChild(value);
    container.appendChild(row);
  }

  return container;
}

function createTags(pageData: PageData): HTMLElement | null {
  const { relationship } = pageData.properties;

  const values: string[] = [];
  values.push('Person');
  if (relationship) values.push(cleanPropertyValue(relationship));

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

export const personRenderer: PopoverRenderer = {
  id: 'person',

  match(pageData: PageData): boolean {
    const { type } = pageData.properties;
    if (!type) return false;
    return cleanPropertyValue(type).toLowerCase() === 'person';
  },

  render(pageData: PageData): HTMLElement {
    const content = document.createElement('div');
    content.className = 'pretty-popover__content';

    const photoUrl = extractImageUrl(pageData.properties.photo);

    if (photoUrl) {
      const card = document.createElement('div');
      card.className = 'pretty-popover__person-card';

      card.appendChild(createPhoto(photoUrl));

      const info = document.createElement('div');
      info.className = 'pretty-popover__person-info';

      info.appendChild(createTitle(pageData));

      const subtitle = createSubtitle(pageData);
      if (subtitle) info.appendChild(subtitle);

      card.appendChild(info);
      content.appendChild(card);
    } else {
      content.appendChild(createTitle(pageData));

      const subtitle = createSubtitle(pageData);
      if (subtitle) content.appendChild(subtitle);
    }

    if (pageData.properties.description) {
      const desc = document.createElement('div');
      desc.className = 'pretty-popover__description';
      desc.textContent = pageData.properties.description as string;
      content.appendChild(desc);
    }

    const details = createDetails(pageData);
    if (details) content.appendChild(details);

    const tags = createTags(pageData);
    if (tags) content.appendChild(tags);

    return content;
  },
};
