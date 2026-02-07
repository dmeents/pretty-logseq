/**
 * Unified Popover Renderer
 *
 * Intelligently formats popovers for all page types based on a per-type
 * configuration map. Uses available page properties to build contextual
 * layouts with sections for header, description, details, links, and tags.
 */

import { cleanPropertyValue } from '../../../lib/api';
import type { PageData } from '../../../types';
import {
  cleanAllValues,
  createDescription,
  createDetailRow,
  createTagPills,
  createTitle,
  extractSnippet,
  extractUrl,
  formatUrlLabel,
  renderPropertyValue,
} from './helpers';
import { getTypeConfig, resolveSubtitle, type TypeConfig } from './type-config';

/**
 * Render popover content for a page.
 * Selects the appropriate layout based on the page's type property.
 */
export function renderPopover(pageData: PageData): HTMLElement {
  const config = getTypeConfig(pageData);
  const content = document.createElement('div');
  content.className = 'pretty-popover__content';

  // 1. Header (photo card or simple title + subtitle)
  content.appendChild(buildHeader(pageData, config));

  // 2. Description
  if (pageData.properties.description) {
    content.appendChild(createDescription(cleanPropertyValue(pageData.properties.description)));
  }

  // 3. Content snippet (for types without rich properties)
  if (config.showSnippet) {
    const snippet = extractSnippet(pageData);
    if (snippet) {
      const el = document.createElement('div');
      el.className = 'pretty-popover__snippet';
      el.textContent = snippet;
      content.appendChild(el);
    }
  }

  // 4. Detail rows (key-value pairs)
  const details = buildDetails(pageData, config);
  if (details) content.appendChild(details);

  // 5. Array properties (pill groups like stack)
  for (const prop of config.arrayProperties) {
    const items = cleanAllValues(pageData.properties[prop]);
    if (items.length > 0) {
      const group = createTagPills(items, 'pretty-popover__array-tags');
      if (group) content.appendChild(group);
    }
  }

  // 6. Link section (prominent url if not already in details)
  const linkSection = buildLinkSection(pageData, config);
  if (linkSection) content.appendChild(linkSection);

  // 7. Tags (type, status, area + extras)
  const tags = buildTags(pageData, config);
  if (tags) content.appendChild(tags);

  return content;
}

function buildHeader(pageData: PageData, config: TypeConfig): HTMLElement {
  const photoUrl = config.photoProperty
    ? extractUrl(pageData.properties[config.photoProperty])
    : null;

  if (photoUrl) {
    // Photo card layout
    const card = document.createElement('div');
    card.className = 'pretty-popover__photo-card';

    const photoWrapper = document.createElement('div');
    photoWrapper.className = 'pretty-popover__photo';
    const img = document.createElement('img');
    img.src = photoUrl;
    img.alt = 'Photo';
    img.loading = 'lazy';
    photoWrapper.appendChild(img);
    card.appendChild(photoWrapper);

    const info = document.createElement('div');
    info.className = 'pretty-popover__header-info';
    info.appendChild(createTitle(pageData));
    appendSubtitle(info, pageData, config);
    card.appendChild(info);

    return card;
  }

  // Simple header
  const header = document.createElement('div');
  header.className = 'pretty-popover__header';
  header.appendChild(createTitle(pageData));
  appendSubtitle(header, pageData, config);

  return header;
}

function appendSubtitle(parent: HTMLElement, pageData: PageData, config: TypeConfig): void {
  const subtitle = resolveSubtitle(pageData, config.subtitle);
  if (!subtitle) return;

  const el = document.createElement('div');
  el.className = 'pretty-popover__subtitle';
  el.textContent = subtitle;
  parent.appendChild(el);
}

function buildDetails(pageData: PageData, config: TypeConfig): HTMLElement | null {
  const rows: HTMLElement[] = [];

  for (const prop of config.detailProperties) {
    const value = pageData.properties[prop];
    if (!value) continue;

    const valueEl = renderPropertyValue(prop, value);
    const label = prop.charAt(0).toUpperCase() + prop.slice(1);
    rows.push(createDetailRow(label, valueEl));
  }

  if (rows.length === 0) return null;

  const container = document.createElement('div');
  container.className = 'pretty-popover__details';
  for (const row of rows) {
    container.appendChild(row);
  }
  return container;
}

function buildLinkSection(pageData: PageData, config: TypeConfig): HTMLElement | null {
  // Skip if url is already shown as a detail row
  if (config.detailProperties.includes('url')) return null;

  const url = extractUrl(pageData.properties.url);
  if (!url) return null;

  const container = document.createElement('div');
  container.className = 'pretty-popover__link-section';

  const link = document.createElement('a');
  link.className = 'pretty-popover__external-link';
  link.href = url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = formatUrlLabel(url);
  container.appendChild(link);

  return container;
}

function buildTags(pageData: PageData, config: TypeConfig): HTMLElement | null {
  const values: string[] = [];
  const { type, status, area } = pageData.properties;

  if (type) values.push(cleanPropertyValue(type));
  if (status) values.push(cleanPropertyValue(status));
  if (area) values.push(cleanPropertyValue(area));

  for (const prop of config.extraTags) {
    const val = pageData.properties[prop];
    if (val) values.push(cleanPropertyValue(val));
  }

  return createTagPills(values);
}
