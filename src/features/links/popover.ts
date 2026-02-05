import { positionElement, removeElementById } from '../../lib/dom';
import { FALLBACK_ICON } from './favicons';
import { fetchMetadata } from './metadata';
import type { LinkMetadata } from './types';

const doc = top?.document ?? parent.document;

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
  return doc.getElementById(LINK_POPOVER_ID);
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

function createFavicon(src: string): HTMLImageElement {
  const favicon = doc.createElement('img');
  favicon.src = src;
  favicon.className = 'pretty-link-popover__favicon';
  favicon.width = 14;
  favicon.height = 14;
  favicon.style.cssText = 'width:14px;height:14px;flex-shrink:0;margin:0;padding:0;border:none';
  favicon.onerror = () => {
    favicon.src = FALLBACK_ICON;
    favicon.onerror = null;
  };
  return favicon;
}

function renderLinkPopover(metadata: LinkMetadata): HTMLElement {
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

async function showLinkPopover(anchor: HTMLAnchorElement): Promise<void> {
  const url = anchor.href;
  if (!url) return;

  const metadata = await fetchMetadata(url);
  if (!metadata) return;
  if (currentAnchor !== anchor) return;

  cleanupPopoverListeners();
  removeElementById(LINK_POPOVER_ID);

  const content = renderLinkPopover(metadata);
  const popover = doc.createElement('div');
  popover.id = LINK_POPOVER_ID;
  popover.className = 'pretty-link-popover';
  popover.appendChild(content);

  doc.body.appendChild(popover);
  positionElement(popover, anchor, { placement: 'bottom', offset: 8 });
  attachPopoverListeners(popover);
}

export function setupLinkPopovers(): () => void {
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
