/**
 * Favorites Observer
 * Injects star buttons next to page titles for quick favorite toggling
 */

import { getObserverRoot, getPlatform } from '../../../core/platform';
import { getVersion } from '../../../core/version';
import { getParentDoc } from '../../../lib/dom';
import { isFavorited, refreshFavorites, toggleFavorite } from './api';

const STAR_MARKER = 'data-pl-favorite-resolved';
const STAR_BUTTON_CLASS = 'pl-favorite-star';
const STAR_ACTIVE_CLASS = 'pl-favorite-star--active';
const STAR_PAGE_ATTR = 'plFavoritePage';

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

  // Remember which page this star belongs to so its state can be re-synced when
  // the favorites cache refreshes (e.g. the star may have been injected before an
  // async refresh completed on navigation).
  button.dataset[STAR_PAGE_ATTR] = pageName;

  // Set initial state
  applyStarState(button, pageName);

  // Click handler
  button.addEventListener('click', async e => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleFavorite(pageName);
      applyStarState(button, pageName);
    } catch (error) {
      console.error('[Pretty Logseq] Failed to toggle favorite:', error);
    }
  });

  return button;
}

/**
 * Reflect the current favorite state of `pageName` onto a star button.
 */
function applyStarState(button: HTMLElement, pageName: string): void {
  button.classList.toggle(STAR_ACTIVE_CLASS, isFavorited(pageName));
}

/**
 * Re-sync every injected star against the (possibly just-refreshed) favorites
 * cache. Cheap, and it corrects stars that were injected before a route-change
 * refresh resolved — the cause of stale/empty stars on revisiting a page.
 */
function updateAllStarStates(): void {
  const doc = getParentDoc();
  doc.querySelectorAll<HTMLElement>(`.${STAR_BUTTON_CLASS}`).forEach(button => {
    const pageName = button.dataset[STAR_PAGE_ATTR];
    if (pageName) applyStarState(button, pageName);
  });
}

/**
 * Scan for page titles and inject star buttons
 */
/** A page title still needs a star if it doesn't already contain one. */
function needsStar(title: Element): boolean {
  return !title.querySelector(`.${STAR_BUTTON_CLASS}`);
}

async function scanAndInject(): Promise<void> {
  const doc = getParentDoc();
  // Select every title and filter to those still missing a star (rather than
  // gating on the marker). This self-heals: if the v2 title block re-renders and
  // drops the in-block star, the next scan re-injects it — the marker alone would
  // suppress that forever.
  const titles = [...doc.querySelectorAll<HTMLElement>(getPlatform().selectors.pageTitle)].filter(
    needsStar,
  );

  if (titles.length === 0) return;

  // Get current page name
  let pageName: string | null = null;
  try {
    const currentPage = await logseq.Editor.getCurrentPage();
    if (currentPage) {
      // Cast to string since PageEntity/BlockEntity have string name/originalName
      pageName = (currentPage.name as string) || (currentPage.originalName as string) || null;
    }
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

  const isV2 = getVersion() === 'v2';

  for (const title of titles) {
    // Re-check after the async gap — a concurrent scanAndInject call may have
    // already injected a star while we were awaiting getCurrentPage().
    if (!needsStar(title)) continue;

    // Mark as processed (used for cleanup); star-presence is what actually gates.
    title.setAttribute(STAR_MARKER, 'true');

    const starButton = createStarButton(pageName);

    if (isV2) {
      // v2 renders the title as an editable block. Inject the star at the START of
      // the title — right before the title text (`.block-content`) inside its
      // `.block-content-wrapper` — so it reads "★ Title". (The old placement, a
      // sibling of `.ls-page-title` pushed to the row's right edge, collided with
      // the DB app's own page-tag pill, which renders on the right in
      // `.ls-block-right`.) Sitting in the title's own row also keeps the star
      // vertically aligned and stops it from stealing width from the
      // page-properties block nested lower in the same title. Fall back through
      // the wrapper / title element if the inner structure isn't there yet.
      const wrapper = title.querySelector('.block-content-wrapper');
      const text = wrapper?.querySelector('.block-content');
      if (text) text.before(starButton);
      else if (wrapper) wrapper.prepend(starButton);
      else title.prepend(starButton);
    } else {
      // v1 title is an `h1.title` flex container — append the star inside it.
      title.appendChild(starButton);
    }
    console.log('[Pretty Logseq] Star button injected for title');
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
  // Guard against double-setup: clean up any existing observers/listeners first
  cleanupFavoriteObserver();

  console.log('[Pretty Logseq] Setting up favorite observer...');

  // Observe DOM changes - fallback to body if main container not found
  const root = getObserverRoot();
  console.log('[Pretty Logseq] Observing element:', root);

  observer = new MutationObserver(handleMutations);
  observer.observe(root, {
    childList: true,
    subtree: true,
  });

  // On navigation, refresh the favorites cache BEFORE (re)scanning so stars are
  // created with the right state, then re-sync any star the MutationObserver may
  // have already injected against the stale cache. Ordering matters: the observer
  // marks a title as resolved on injection, so a star built mid-refresh would
  // otherwise keep its stale (empty) state forever.
  routeUnsubscribe = logseq.App.onRouteChanged(() => {
    console.log('[Pretty Logseq] Route changed, refreshing favorites');
    refreshFavorites()
      .then(async () => {
        await scanAndInject();
        updateAllStarStates();
      })
      .catch(error => {
        console.error('[Pretty Logseq] Failed to sync favorites on route change:', error);
      });
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
