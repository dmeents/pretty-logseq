import { getParentDoc } from '../../lib/dom';

/**
 * Sidebar page-tag observer (v2 / DB app).
 *
 * In the DB app a tagged page shows its tag inline in the left sidebar's
 * Favorites/Recent lists — the whole `"Next.JS #Technology"` string is a single
 * text node inside `.link-item .page-title`, with no element wrapping the tag.
 * CSS alone therefore can't target the tag, so this observer splits the text and
 * wraps the two parts:
 *
 *   <span class="page-title">
 *     <span class="pl-nav-name">Next.JS</span>
 *     <span class="pl-nav-tag">#Technology</span>
 *   </span>
 *
 * The `hide.scss` / `subtle.scss` stylesheets (picked by the feature per the
 * `sidebarPageTags` setting) then act on `.pl-nav-tag`. Wrapping is idempotent
 * and shared by both modes; only the styling differs.
 */

const NAME_CLASS = 'pl-nav-name';
const TAG_CLASS = 'pl-nav-tag';

const SIDEBAR_SELECTOR = '#left-sidebar';
const TITLE_SELECTOR = '.link-item .page-title';

/**
 * A page name followed by a space-prefixed tag suffix. The name is non-greedy so
 * the split falls on the *first* tag (covering multi-tag titles like
 * `"Foo #A #B"`), and the `\S` after `#` keeps the tag portion from starting on a
 * stray `"# "`. A `#` with no leading space (e.g. `"C#"`) never matches.
 */
const TITLE_TAG_RE = /^(.*?\S)(\s#\S.*)$/;

function processTitle(el: Element): void {
  // Already wrapped, or holds markup we shouldn't rewrite — leave it be.
  if (el.querySelector(`.${TAG_CLASS}`)) return;
  if (el.children.length > 0) return;

  const match = (el.textContent ?? '').match(TITLE_TAG_RE);
  if (!match) return;

  const [, name, tag] = match;
  const doc = getParentDoc();

  const nameSpan = doc.createElement('span');
  nameSpan.className = NAME_CLASS;
  nameSpan.textContent = name;

  const tagSpan = doc.createElement('span');
  tagSpan.className = TAG_CLASS;
  // Drop the leading space so the tag reads as "#Technology"; the space is
  // restored on cleanup.
  tagSpan.textContent = tag.replace(/^\s+/, '');

  el.textContent = '';
  el.append(nameSpan, tagSpan);
}

function scanTitles(): void {
  const sidebar = getParentDoc().querySelector(SIDEBAR_SELECTOR);
  if (!sidebar) return;
  for (const el of sidebar.querySelectorAll(TITLE_SELECTOR)) processTitle(el);
}

/** Restore each wrapped title back to its original `"Name #Tag"` text. */
function unwrapAll(): void {
  for (const tagEl of getParentDoc().querySelectorAll(`.${TAG_CLASS}`)) {
    const title = tagEl.closest('.page-title');
    if (!title) continue;
    const name = title.querySelector(`.${NAME_CLASS}`)?.textContent ?? '';
    const tag = tagEl.textContent ?? '';
    title.textContent = tag ? `${name} ${tag}` : name;
  }
}

export function setupSidebarTagObserver(): () => void {
  scanTitles();

  let rafId: number | null = null;
  const observer = new MutationObserver(() => {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        scanTitles();
        rafId = null;
      });
    }
  });

  const doc = getParentDoc();
  const root = doc.querySelector(SIDEBAR_SELECTOR) ?? doc.body;
  observer.observe(root, { childList: true, subtree: true, characterData: true });

  return () => {
    observer.disconnect();
    if (rafId !== null) cancelAnimationFrame(rafId);
    unwrapAll();
  };
}
