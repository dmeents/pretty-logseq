/**
 * Popover Manager
 *
 * Handles the popover lifecycle: hover detection on .page-ref elements,
 * interactive hover behavior (popover stays open when hovered), positioning,
 * and renderer dispatch.
 *
 * Uses top.document since plugins run in an iframe.
 */

import { getPage } from '../../lib/api';
import { positionElement, removeElementById } from '../../lib/dom';
import { getRenderer } from './renderers';

const doc = top?.document ?? parent.document;

const POPOVER_ID = 'pretty-logseq-popover';
const SHOW_DELAY = 300;
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
  return doc.getElementById(POPOVER_ID);
}

function cleanupPopoverListeners(): void {
  popoverListenersCleanup?.();
  popoverListenersCleanup = null;
}

function hidePopover(): void {
  clearShowTimer();
  clearHideTimer();
  cleanupPopoverListeners();
  removeElementById(POPOVER_ID);
  currentAnchor = null;
}

function scheduleHide(): void {
  clearHideTimer();
  hideTimer = setTimeout(hidePopover, HIDE_DELAY);
}

function attachPopoverListeners(popover: HTMLElement): void {
  const onEnter = () => clearHideTimer();
  const onLeave = () => scheduleHide();

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const titleLink = target.closest('.pretty-popover__title') as HTMLElement | null;
    if (titleLink?.dataset.pageName) {
      e.preventDefault();
      hidePopover();
      logseq.App.pushState('page', { name: titleLink.dataset.pageName });
    }
  };

  popover.addEventListener('mouseenter', onEnter);
  popover.addEventListener('mouseleave', onLeave);
  popover.addEventListener('click', onClick);

  popoverListenersCleanup = () => {
    popover.removeEventListener('mouseenter', onEnter);
    popover.removeEventListener('mouseleave', onLeave);
    popover.removeEventListener('click', onClick);
  };
}

async function showPopover(anchor: HTMLElement, pageName: string): Promise<void> {
  const pageData = await getPage(pageName);
  if (!pageData) return;

  // If anchor changed while we were fetching, abort
  if (currentAnchor !== anchor) return;

  // Remove any existing popover
  cleanupPopoverListeners();
  removeElementById(POPOVER_ID);

  const renderer = getRenderer(pageData);
  const content = renderer.render(pageData);

  const popover = doc.createElement('div');
  popover.id = POPOVER_ID;
  popover.className = 'pretty-popover';
  popover.appendChild(content);

  doc.body.appendChild(popover);
  positionElement(popover, anchor, { placement: 'bottom', offset: 8 });
  attachPopoverListeners(popover);
}

function getPageNameFromRef(element: HTMLElement): string | null {
  return element.getAttribute('data-ref') || element.textContent?.trim() || null;
}

/**
 * Set up hover event listeners for page reference popovers.
 * Uses capturing phase mouseenter to intercept events before
 * Logseq's own preview handlers.
 * Returns a cleanup function that removes all listeners.
 */
export function setupPopovers(): () => void {
  let anchorLeaveCleanup: (() => void) | null = null;

  const cleanupAnchorLeave = () => {
    anchorLeaveCleanup?.();
    anchorLeaveCleanup = null;
  };

  const handleEnter = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const pageRef = target.closest?.('.page-ref') as HTMLElement | null;
    if (!pageRef) return;

    // If already showing for this anchor, just cancel any pending hide
    if (currentAnchor === pageRef && getPopover()) {
      clearHideTimer();
      return;
    }

    clearShowTimer();
    clearHideTimer();
    cleanupAnchorLeave();
    currentAnchor = pageRef;

    // Attach mouseleave to this specific anchor
    const onAnchorLeave = () => {
      clearShowTimer();
      if (getPopover()) {
        scheduleHide();
      } else {
        currentAnchor = null;
      }
      anchorLeaveCleanup = null;
    };
    pageRef.addEventListener('mouseleave', onAnchorLeave, { once: true });
    anchorLeaveCleanup = () => pageRef.removeEventListener('mouseleave', onAnchorLeave);

    showTimer = setTimeout(() => {
      const pageName = getPageNameFromRef(pageRef);
      if (pageName && currentAnchor === pageRef) {
        showPopover(pageRef, pageName);
      }
    }, SHOW_DELAY);
  };

  // Capturing phase intercepts before Logseq's own handlers
  doc.addEventListener('mouseenter', handleEnter, true);

  return () => {
    doc.removeEventListener('mouseenter', handleEnter, true);
    cleanupAnchorLeave();
    hidePopover();
  };
}
