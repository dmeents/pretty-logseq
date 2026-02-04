/**
 * Popover Event Handlers
 *
 * Manages hover events on page references and popover display.
 */

import { cleanPropertyValue, getPage } from '../../lib/api';
import { createElement, positionElement, removeElementById } from '../../lib/dom';
import type { PageData } from '../../types';

const POPOVER_ID = 'pretty-logseq-popover';
const HOVER_DELAY = 300;

/**
 * Build HTML content for the popover
 */
function buildPopoverHtml(pageData: PageData): string {
  const { name, properties } = pageData;
  const { icon, description, type, status, area } = properties;

  let html = '';

  // Title with optional icon
  const displayIcon = icon ? `${icon} ` : '';
  html += `<div class="pretty-popover__title">${displayIcon}${name}</div>`;

  // Description if available
  if (description) {
    html += `<div class="pretty-popover__description">${description}</div>`;
  }

  // Property tags
  const tags: string[] = [];
  if (type) tags.push(cleanPropertyValue(type));
  if (status) tags.push(cleanPropertyValue(status));
  if (area) tags.push(cleanPropertyValue(area));

  if (tags.length > 0) {
    html += '<div class="pretty-popover__properties">';
    tags.forEach(tag => {
      html += `<span class="pretty-popover__tag">${tag}</span>`;
    });
    html += '</div>';
  }

  return html;
}

/**
 * Show popover near the anchor element
 */
function showPopover(anchor: HTMLElement, pageData: PageData): void {
  hidePopover();

  const html = buildPopoverHtml(pageData);

  const popover = createElement(
    'div',
    {
      id: POPOVER_ID,
      class: 'pretty-popover',
    },
    html,
  );

  document.body.appendChild(popover);

  // Position after appending (so we can measure)
  positionElement(popover, anchor, { placement: 'bottom', offset: 8 });
}

/**
 * Hide and remove the popover
 */
function hidePopover(): void {
  removeElementById(POPOVER_ID);
}

/**
 * Extract page name from a .page-ref element
 */
function getPageNameFromRef(element: HTMLElement): string | null {
  const dataRef = element.getAttribute('data-ref');
  if (dataRef) return dataRef;

  return element.textContent?.trim() || null;
}

/**
 * Set up hover event listeners using event delegation
 * Returns a cleanup function
 */
export function setupHoverListeners(): () => void {
  let hoverTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleMouseOver = async (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const pageRef = target.closest('.page-ref') as HTMLElement | null;

    if (!pageRef) return;

    // Clear any existing timeout
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }

    // Delay before showing popover
    hoverTimeout = setTimeout(async () => {
      const pageName = getPageNameFromRef(pageRef);
      if (!pageName) return;

      const pageData = await getPage(pageName);
      if (pageData) {
        showPopover(pageRef, pageData);
      }
    }, HOVER_DELAY);
  };

  const handleMouseOut = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const pageRef = target.closest('.page-ref');

    if (pageRef) {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      hidePopover();
    }
  };

  // Attach listeners
  document.addEventListener('mouseover', handleMouseOver);
  document.addEventListener('mouseout', handleMouseOut);

  // Return cleanup function
  return () => {
    document.removeEventListener('mouseover', handleMouseOver);
    document.removeEventListener('mouseout', handleMouseOut);
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
    }
    hidePopover();
  };
}
