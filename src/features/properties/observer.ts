import { getObserverRoot, getPlatform } from '../../core/platform';
import { cleanPropertyValue } from '../../lib/api';
import { getParentDoc } from '../../lib/dom';

const ICON_CLASS = 'pl-property-icon';
const RESOLVED_ATTR = 'data-pl-icon-resolved';

async function processPropertyKey(keyEl: Element): Promise<void> {
  if (keyEl.hasAttribute(RESOLVED_ATTR)) return;
  keyEl.setAttribute(RESOLVED_ATTR, '');

  const keyName = keyEl.textContent?.trim();
  if (!keyName) return;

  const page = await getPlatform().api.getPageData(keyName);
  if (!page?.properties?.icon) return;

  const icon = cleanPropertyValue(page.properties.icon);
  if (!icon) return;

  const span = getParentDoc().createElement('span');
  span.className = ICON_CLASS;
  span.textContent = icon;
  keyEl.prepend(span);
}

function scanProperties(): void {
  const doc = getParentDoc();
  const keys = doc.querySelectorAll(getPlatform().selectors.propertyKey);
  for (const key of keys) {
    processPropertyKey(key);
  }
}

function cleanupAll(): void {
  const doc = getParentDoc();
  for (const el of doc.querySelectorAll(`.${ICON_CLASS}`)) {
    el.remove();
  }
  for (const el of doc.querySelectorAll(`[${RESOLVED_ATTR}]`)) {
    el.removeAttribute(RESOLVED_ATTR);
  }
}

export function setupPropertyObserver(): () => void {
  scanProperties();

  let rafId: number | null = null;

  const observer = new MutationObserver(() => {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        scanProperties();
        rafId = null;
      });
    }
  });

  observer.observe(getObserverRoot(), { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    if (rafId !== null) cancelAnimationFrame(rafId);
    cleanupAll();
  };
}
