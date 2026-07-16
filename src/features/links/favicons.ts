import { getParentDoc } from '../../lib/dom';

const FAVICON_CLASS = 'pretty-link__favicon';
const PROCESSED_ATTR = 'data-pl-favicon';
const SVG_NS = 'http://www.w3.org/2000/svg';

// Shared inline styles for the inline favicon (img or svg fallback).
const ICON_STYLE =
  'display:inline-block;vertical-align:middle;margin-right:4px;margin-top:-2px;width:16px;height:16px;flex-shrink:0';

// Wireframe globe as a data URI. Kept for reference/back-compat; the rendered
// fallback uses `createGlobeSvg()` below, which is not subject to CSP img-src.
const FALLBACK_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/%3E%3C/svg%3E";

export { FALLBACK_ICON };

// Path data for the wireframe globe (matches FALLBACK_ICON).
const GLOBE_PATHS = [
  'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71',
  'M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
];

export function getFaviconUrl(domain: string): string {
  return `https://${domain}/favicon.ico`;
}

// Real per-site favicon via Google's favicon service — a plain https image
// request (governed by CSP img-src, not CORS). Falls back to the inline globe
// on error, so it degrades gracefully when the network or CSP blocks it.
function getRemoteFaviconUrl(domain: string): string {
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`;
}

/**
 * Build the fallback globe as an inline `<svg>` element.
 *
 * Unlike `<img src="data:image/svg+xml,…">`, an inline SVG DOM node is NOT
 * subject to the host app's CSP `img-src` directive, so it always renders — this
 * is why the v2 (DB) app showed an empty icon: it blocks `data:` image sources.
 */
export function createGlobeSvg(size = 16): SVGSVGElement {
  const doc = getParentDoc();
  const svg = doc.createElementNS(SVG_NS, 'svg') as SVGSVGElement;
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');

  for (const d of GLOBE_PATHS) {
    const path = doc.createElementNS(SVG_NS, 'path');
    path.setAttribute('d', d);
    svg.appendChild(path);
  }

  return svg;
}

function isValidHttpUrl(href: string): boolean {
  try {
    const url = new URL(href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function decorateLink(anchor: HTMLAnchorElement): void {
  if (anchor.hasAttribute(PROCESSED_ATTR)) return;

  const href = anchor.href;
  if (!href || !isValidHttpUrl(href)) return;

  const doc = getParentDoc();
  const domain = new URL(href).hostname;

  // Try the real favicon first; swap to the CSP-safe inline globe on failure.
  const favicon = doc.createElement('img');
  favicon.setAttribute('class', FAVICON_CLASS);
  favicon.src = getRemoteFaviconUrl(domain);
  favicon.width = 16;
  favicon.height = 16;
  favicon.style.cssText = ICON_STYLE;
  favicon.onerror = () => {
    const globe = createGlobeSvg(16);
    globe.setAttribute('class', FAVICON_CLASS);
    globe.style.cssText = ICON_STYLE;
    favicon.replaceWith(globe);
  };

  anchor.insertBefore(favicon, anchor.firstChild);
  anchor.setAttribute(PROCESSED_ATTR, 'true');
}

export function cleanupLink(anchor: HTMLAnchorElement): void {
  const favicon = anchor.querySelector(`.${FAVICON_CLASS}`);
  favicon?.remove();
  anchor.removeAttribute(PROCESSED_ATTR);
}

export function cleanupAllLinks(root: Element | Document): void {
  const links = root.querySelectorAll(`a.external-link[${PROCESSED_ATTR}]`);
  for (const link of links) {
    cleanupLink(link as HTMLAnchorElement);
  }
}
