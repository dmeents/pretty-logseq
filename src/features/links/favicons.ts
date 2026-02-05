const doc = top?.document ?? parent.document;
const FAVICON_CLASS = 'pretty-link__favicon';
const PROCESSED_ATTR = 'data-pl-favicon';

// Simple wireframe globe SVG as fallback when favicon fails to load
const FALLBACK_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71'/%3E%3Cpath d='M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71'/%3E%3C/svg%3E";

export { FALLBACK_ICON };

export function getFaviconUrl(domain: string): string {
  return `https://${domain}/favicon.ico`;
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

  const favicon = doc.createElement('img');
  favicon.className = FAVICON_CLASS;
  favicon.src = FALLBACK_ICON;
  favicon.width = 16;
  favicon.height = 16;
  favicon.style.cssText =
    'display:inline-block;vertical-align:middle;margin-right:4px;margin-top:-2px;width:16px;height:16px';

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
