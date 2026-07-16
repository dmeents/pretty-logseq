import { getObserverRoot, getPlatform } from '../../core/platform';
import { getParentDoc } from '../../lib/dom';

export function setupLinkObserver(onLinksFound: (links: HTMLAnchorElement[]) => void): () => void {
  const doc = getParentDoc();
  const linkSelector = `${getPlatform().selectors.externalLink}:not([data-pl-favicon])`;

  // Initial scan
  const initialLinks = Array.from(doc.querySelectorAll(linkSelector)) as HTMLAnchorElement[];
  if (initialLinks.length > 0) {
    onLinksFound(initialLinks);
  }

  // Batch mutations via requestAnimationFrame
  let pendingLinks: HTMLAnchorElement[] = [];
  let rafId: number | null = null;

  const flushPending = () => {
    if (pendingLinks.length > 0) {
      onLinksFound(pendingLinks);
      pendingLinks = [];
    }
    rafId = null;
  };

  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        // Use nodeType check instead of instanceof — works across iframe boundaries
        if (node.nodeType !== 1) continue;
        const el = node as Element;

        if (el.matches?.(linkSelector)) {
          pendingLinks.push(el as HTMLAnchorElement);
        }

        const descendants = el.querySelectorAll?.(linkSelector);
        if (descendants) {
          for (const link of descendants) {
            pendingLinks.push(link as HTMLAnchorElement);
          }
        }
      }
    }

    if (pendingLinks.length > 0 && rafId === null) {
      rafId = requestAnimationFrame(flushPending);
    }
  });

  observer.observe(getObserverRoot(), { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
}
