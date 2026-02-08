/**
 * Topbar DOM Handlers
 *
 * Manages DOM manipulation for topbar customizations.
 * Uses parent.document since plugins run in an iframe.
 *
 * We clone nav elements instead of moving them, because moving
 * React-managed DOM nodes causes reconciliation errors when other
 * plugins trigger header re-renders (e.g. registerUIItem).
 */

const doc = parent.document;
const NAV_CLONE_ID = "pl-nav-arrows";

/**
 * Clone the navigation arrows and place them in the left section of the top bar.
 * The originals are hidden via CSS (in styles.scss).
 *
 * Returns a cleanup function that removes the clones, or null if elements weren't found.
 */
export function createNavArrowsInLeft(): (() => void) | null {
  const headLeft = doc.querySelector("#head .l");
  const originalNavPanel = doc.querySelector(".r .flex.flex-row");

  if (!headLeft) {
    console.warn("[Pretty Logseq] Could not find #head .l");
    return null;
  }

  if (!originalNavPanel) {
    console.warn("[Pretty Logseq] Could not find navigation panel");
    return null;
  }

  // Remove any existing clone first
  doc.getElementById(NAV_CLONE_ID)?.remove();

  // Deep clone preserves the visual structure (icons, classes, styles)
  const clone = originalNavPanel.cloneNode(true) as HTMLElement;
  clone.id = NAV_CLONE_ID;

  // Wire up click handlers (cloneNode doesn't copy event listeners)
  const backBtn = clone.querySelector(".nav-left") as HTMLElement | null;
  const fwdBtn = clone.querySelector(".nav-right") as HTMLElement | null;

  if (backBtn) {
    backBtn.addEventListener("click", () => parent.window.history.back());
  }

  if (fwdBtn) {
    fwdBtn.addEventListener("click", () => parent.window.history.forward());
  }

  // Insert after the sidebar toggler (first child of left section)
  const sidebarToggler = headLeft.firstElementChild;

  if (sidebarToggler) {
    sidebarToggler.insertAdjacentElement("afterend", clone);
  } else {
    headLeft.prepend(clone);
  }

  return () => {
    clone.remove();
  };
}
