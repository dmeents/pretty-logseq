/**
 * Favorites Observer
 * Injects star buttons next to page titles for quick favorite toggling
 */

import { getParentDoc } from '../../../lib/dom';
import { isFavorited, refreshFavorites, toggleFavorite } from './api';

const STAR_MARKER = 'data-pl-favorite-resolved';
const STAR_BUTTON_CLASS = 'pl-favorite-star';
const STAR_ACTIVE_CLASS = 'pl-favorite-star--active';

let observer: MutationObserver | null = null;
let rafId: number | null = null;
let routeUnsubscribe: (() => void) | null = null;

/**
 * Create a star button element
 */
function createStarButton(pageName: string): HTMLButtonElement {
  const doc = getParentDoc();
  const button = doc.createElement('button');
  button.className = STAR_BUTTON_CLASS;
  button.title = 'Toggle favorite';
  button.setAttribute('aria-label', 'Toggle favorite');

  // Star SVG icon
  button.innerHTML = `
		<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
			<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
		</svg>
	`;

  // Set initial state
  if (isFavorited(pageName)) {
    button.classList.add(STAR_ACTIVE_CLASS);
  }

  // Click handler
  button.addEventListener('click', async e => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleFavorite(pageName);
      button.classList.toggle(STAR_ACTIVE_CLASS);
    } catch (error) {
      console.error('[Pretty Logseq] Failed to toggle favorite:', error);
    }
  });

  return button;
}

/**
 * Scan for page titles and inject star buttons
 */
async function scanAndInject(): Promise<void> {
  const doc = getParentDoc();
  const titles = doc.querySelectorAll<HTMLHeadingElement>(`h1.title:not([${STAR_MARKER}])`);

  if (titles.length === 0) return;

  // Get current page name
  let pageName: string | null = null;
  try {
    const currentPage = await logseq.Editor.getCurrentPage();
    pageName = currentPage?.name || currentPage?.originalName || null;
  } catch (_error) {
    // Silently fail if we can't get current page (e.g., on home screen)
    return;
  }

  if (!pageName) return;

  console.log(
    '[Pretty Logseq] Injecting favorite star for page:',
    pageName,
    'found titles:',
    titles.length,
  );

  for (const title of titles) {
    // Mark as processed
    title.setAttribute(STAR_MARKER, 'true');

    // Create and insert star button inside the title (h1 is already flex)
    const starButton = createStarButton(pageName);
    title.appendChild(starButton);
    console.log('[Pretty Logseq] Star button injected inside title');
  }
}

/**
 * Handle mutations with RAF batching
 */
function handleMutations(): void {
  if (rafId !== null) return;

  rafId = requestAnimationFrame(() => {
    rafId = null;
    scanAndInject();
  });
}

/**
 * Setup MutationObserver and route listener
 */
export function setupFavoriteObserver(): void {
  const doc = getParentDoc();
  console.log('[Pretty Logseq] Setting up favorite observer...');

  // Observe DOM changes - fallback to body if main container not found
  const root = doc.getElementById('main-content-container') ?? doc.body;
  console.log('[Pretty Logseq] Observing element:', root);

  observer = new MutationObserver(handleMutations);
  observer.observe(root, {
    childList: true,
    subtree: true,
  });

  // Listen for route changes to refresh favorites cache
  routeUnsubscribe = logseq.App.onRouteChanged(() => {
    console.log('[Pretty Logseq] Route changed, refreshing favorites');
    refreshFavorites();
    // Trigger a rescan on next frame
    setTimeout(scanAndInject, 100);
  });

  console.log('[Pretty Logseq] Observer set up, running initial scan');
  // Initial scan
  scanAndInject();
}

/**
 * Cleanup observer and remove all injected elements
 */
export function cleanupFavoriteObserver(): void {
  // Disconnect observer
  if (observer) {
    observer.disconnect();
    observer = null;
  }

  // Cancel pending RAF
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  // Unsubscribe from route changes
  if (routeUnsubscribe) {
    routeUnsubscribe();
    routeUnsubscribe = null;
  }

  // Remove all injected elements
  const doc = getParentDoc();
  doc.querySelectorAll(`.${STAR_BUTTON_CLASS}`).forEach(el => {
    el.remove();
  });

  // Remove all markers
  doc.querySelectorAll(`[${STAR_MARKER}]`).forEach(el => {
    el.removeAttribute(STAR_MARKER);
  });
}
