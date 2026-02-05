const doc = top?.document ?? parent.document;

export function setupLinkObserver(onLinksFound: (links: HTMLAnchorElement[]) => void): () => void {
  // Initial scan
  const initialLinks = Array.from(
    doc.querySelectorAll('a.external-link:not([data-pl-favicon])'),
  ) as HTMLAnchorElement[];
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

        if (el.matches?.('a.external-link:not([data-pl-favicon])')) {
          pendingLinks.push(el as HTMLAnchorElement);
        }

        const descendants = el.querySelectorAll?.('a.external-link:not([data-pl-favicon])');
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

  const root = doc.getElementById('main-content-container') ?? doc.body;
  observer.observe(root, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
    }
  };
}
