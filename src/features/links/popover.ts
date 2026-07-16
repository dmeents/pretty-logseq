import { getParentDoc, positionElement, removeElementById } from '../../lib/dom';
import { createGlobeSvg, getFaviconUrl } from './favicons';
import { fetchMetadata } from './metadata';
import type { LinkMetadata } from './types';

const LINK_POPOVER_ID = 'pretty-logseq-link-popover';
const SHOW_DELAY = 400;
const HIDE_DELAY = 150;

let showTimer: ReturnType<typeof setTimeout> | null = null;
let hideTimer: ReturnType<typeof setTimeout> | null = null;
let currentAnchor: HTMLElement | null = null;
let popoverListenersCleanup: (() => void) | null = null;

function clearShowTimer(): void {
  if (showTimer) {
    clearTimeout(showTimer);
    showTimer = null;
  }
}

function clearHideTimer(): void {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
}

function getPopover(): HTMLElement | null {
  return getParentDoc().getElementById(LINK_POPOVER_ID);
}

function cleanupPopoverListeners(): void {
  popoverListenersCleanup?.();
  popoverListenersCleanup = null;
}

function hidePopover(): void {
  clearShowTimer();
  clearHideTimer();
  cleanupPopoverListeners();
  removeElementById(LINK_POPOVER_ID);
  currentAnchor = null;
}

function scheduleHide(): void {
  clearHideTimer();
  hideTimer = setTimeout(hidePopover, HIDE_DELAY);
}

function attachPopoverListeners(popover: HTMLElement): void {
  const onEnter = () => clearHideTimer();
  const onLeave = () => scheduleHide();

  popover.addEventListener('mouseenter', onEnter);
  popover.addEventListener('mouseleave', onLeave);

  popoverListenersCleanup = () => {
    popover.removeEventListener('mouseenter', onEnter);
    popover.removeEventListener('mouseleave', onLeave);
  };
}

const POPOVER_FAVICON_STYLE = 'width:14px;height:14px;flex-shrink:0;margin:0;padding:0;border:none';

function createFavicon(src: string): HTMLImageElement {
  const favicon = getParentDoc().createElement('img');
  favicon.src = src;
  favicon.className = 'pretty-link-popover__favicon';
  favicon.width = 14;
  favicon.height = 14;
  favicon.style.cssText = POPOVER_FAVICON_STYLE;
  // Swap to the CSP-safe inline globe if the favicon can't load (offline, 404,
  // or blocked by CSP img-src — which is why v2 showed a blank icon).
  favicon.onerror = () => {
    const globe = createGlobeSvg(14);
    globe.setAttribute('class', 'pretty-link-popover__favicon');
    globe.style.cssText = POPOVER_FAVICON_STYLE;
    favicon.replaceWith(globe);
  };
  return favicon;
}

/**
 * Build a minimal, URL-derived metadata object so the popover can render even
 * when the metadata fetch is blocked (CSP `connect-src` / CORS in v2).
 */
function createFallbackMetadata(url: string): LinkMetadata {
  let domain = url;
  try {
    domain = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    // Leave `domain` as the raw url if it can't be parsed.
  }
  return {
    url,
    title: null,
    description: null,
    image: null,
    siteName: null,
    domain,
    faviconUrl: getFaviconUrl(domain),
    error: null,
  };
}

/**
 * Critical container styles applied inline.
 *
 * The rest of the popover is styled via `provideStyle()` CSS, but that CSS
 * doesn't reliably reach `top.document` elements (see styles.scss), so these
 * base styles are inlined to guarantee the popover is visible and positioned.
 */
function applyPopoverBaseStyles(popover: HTMLElement): void {
  popover.style.cssText = [
    'position:fixed',
    'z-index:9999',
    'max-width:380px',
    'min-width:280px',
    'overflow:hidden',
    'border-radius:6px',
    'pointer-events:auto',
    'background:var(--ls-primary-background-color,#fff)',
    'border:1px solid var(--pl-accent-border,var(--ls-border-color,rgba(0,0,0,0.1)))',
    'border-left:3px solid var(--pl-accent,#8b5cf6)',
    'box-shadow:0 4px 6px -1px rgba(0,0,0,0.08),0 10px 15px -3px rgba(0,0,0,0.1)',
  ].join(';');
}

function renderLinkPopover(metadata: LinkMetadata): HTMLElement {
  const doc = getParentDoc();
  const content = doc.createElement('div');
  content.className = 'pretty-link-popover__content';

  if (metadata.image) {
    const imgWrapper = doc.createElement('div');
    imgWrapper.className = 'pretty-link-popover__image';
    const img = doc.createElement('img');
    img.src = metadata.image;
    img.alt = metadata.title ?? '';
    img.loading = 'lazy';
    img.onerror = () => imgWrapper.remove();
    imgWrapper.appendChild(img);
    content.appendChild(imgWrapper);
  }

  // Header: favicon + title/site name
  const header = doc.createElement('div');
  header.className = 'pretty-link-popover__header';
  header.appendChild(createFavicon(metadata.faviconUrl));

  const titleText = metadata.title ?? metadata.siteName ?? metadata.domain;
  const title = doc.createElement('span');
  title.className = 'pretty-link-popover__title';
  title.textContent = titleText;
  header.appendChild(title);
  content.appendChild(header);

  if (metadata.error) {
    const error = doc.createElement('div');
    error.className = 'pretty-link-popover__error';
    error.textContent = metadata.error;
    content.appendChild(error);
  } else if (metadata.description) {
    const desc = doc.createElement('div');
    desc.className = 'pretty-link-popover__description';
    desc.textContent = metadata.description;
    content.appendChild(desc);
  }

  // Footer: full-width URL
  const footer = doc.createElement('div');
  footer.className = 'pretty-link-popover__footer';
  footer.textContent = metadata.url;
  content.appendChild(footer);

  return content;
}

function renderAndShow(anchor: HTMLAnchorElement, metadata: LinkMetadata): void {
  cleanupPopoverListeners();
  removeElementById(LINK_POPOVER_ID);

  const doc = getParentDoc();
  const content = renderLinkPopover(metadata);
  const popover = doc.createElement('div');
  popover.id = LINK_POPOVER_ID;
  popover.className = 'pretty-link-popover';
  applyPopoverBaseStyles(popover);
  popover.appendChild(content);

  doc.body.appendChild(popover);
  positionElement(popover, anchor, { placement: 'bottom', offset: 8 });
  attachPopoverListeners(popover);
}

async function showLinkPopover(anchor: HTMLAnchorElement): Promise<void> {
  const url = anchor.href;
  if (!url) return;

  // Show immediately with URL-derived data so the popover always appears, even
  // when the metadata fetch is blocked (CSP/CORS in v2).
  renderAndShow(anchor, createFallbackMetadata(url));

  // Enrich once metadata resolves — unless the user has moved on.
  const metadata = await fetchMetadata(url);
  if (metadata && currentAnchor === anchor && getPopover()) {
    renderAndShow(anchor, metadata);
  }
}

export function setupLinkPopovers(): () => void {
  const doc = getParentDoc();
  let anchorLeaveCleanup: (() => void) | null = null;

  const cleanupAnchorLeave = () => {
    anchorLeaveCleanup?.();
    anchorLeaveCleanup = null;
  };

  const handleEnter = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const externalLink = target.closest?.('a.external-link') as HTMLAnchorElement | null;
    if (!externalLink) return;

    if (currentAnchor === externalLink && getPopover()) {
      clearHideTimer();
      return;
    }

    clearShowTimer();
    clearHideTimer();
    cleanupAnchorLeave();
    currentAnchor = externalLink;

    const onAnchorLeave = () => {
      clearShowTimer();
      if (getPopover()) {
        scheduleHide();
      } else {
        currentAnchor = null;
      }
      anchorLeaveCleanup = null;
    };
    externalLink.addEventListener('mouseleave', onAnchorLeave, { once: true });
    anchorLeaveCleanup = () => externalLink.removeEventListener('mouseleave', onAnchorLeave);

    showTimer = setTimeout(() => {
      if (currentAnchor === externalLink) {
        showLinkPopover(externalLink);
      }
    }, SHOW_DELAY);
  };

  const handleClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest?.('a.external-link')) {
      hidePopover();
    }
  };

  doc.addEventListener('mouseenter', handleEnter, true);
  doc.addEventListener('click', handleClick, true);

  return () => {
    doc.removeEventListener('mouseenter', handleEnter, true);
    doc.removeEventListener('click', handleClick, true);
    cleanupAnchorLeave();
    hidePopover();
  };
}
