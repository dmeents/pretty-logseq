import { getParentDoc } from '../../lib/dom';

const PAST_DUE_CLASS = 'pl-past-due';
const CANCELLED_LABEL_CLASS = 'pl-cancelled-label';

function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Find the first .block-content-wrapper belonging to this block
 * (not from a nested child block).
 */
function getOwnContentWrapper(block: Element): Element | null {
  return block.querySelector('.block-content-wrapper');
}

/**
 * Check if a block has a past-due SCHEDULED or DEADLINE date.
 */
function isPastDue(block: Element, today: string): boolean {
  const wrapper = getOwnContentWrapper(block);
  if (!wrapper) return false;

  const text = wrapper.textContent ?? '';
  if (!text.includes('SCHEDULED') && !text.includes('DEADLINE')) return false;

  const matches = text.matchAll(/(?:SCHEDULED|DEADLINE)\S*\s*<?(\d{4}-\d{2}-\d{2})/g);
  for (const match of matches) {
    if (match[1] < today) return true;
  }

  return false;
}

/**
 * Check whether a block has an active (incomplete) task marker.
 */
function hasActiveTaskMarker(block: Element): boolean {
  const content = getOwnContentWrapper(block);
  if (!content) return false;
  return (
    (content.querySelector('.todo') !== null ||
      content.querySelector('.doing') !== null ||
      content.querySelector('.now') !== null) &&
    content.querySelector('.done') === null &&
    content.querySelector('.canceled') === null &&
    content.querySelector('.cancelled') === null
  );
}

/**
 * Check if a block is a cancelled task and inject/remove the label.
 */
function processCancelledLabel(block: Element): void {
  const wrapper = getOwnContentWrapper(block);
  if (!wrapper) return;

  const isCancelled =
    wrapper.querySelector('.canceled') !== null || wrapper.querySelector('.cancelled') !== null;

  const existingLabel = wrapper.querySelector(`.${CANCELLED_LABEL_CLASS}`);

  if (isCancelled && !existingLabel) {
    const label = getParentDoc().createElement('span');
    label.className = CANCELLED_LABEL_CLASS;
    label.textContent = 'CANCELLED ';

    // The .canceled/.cancelled span wraps the entire task content,
    // so prepend inside it to place the label before the task text
    const marker = wrapper.querySelector('.canceled, .cancelled');
    if (marker) marker.prepend(label);
  } else if (!isCancelled && existingLabel) existingLabel.remove();
}

function processBlock(block: Element, today: string): void {
  // Past-due detection
  if (hasActiveTaskMarker(block) && isPastDue(block, today)) {
    block.classList.add(PAST_DUE_CLASS);
  } else {
    block.classList.remove(PAST_DUE_CLASS);
  }

  // Cancelled label injection
  processCancelledLabel(block);
}

function scanBlocks(today: string): void {
  const doc = getParentDoc();
  const blocks = doc.querySelectorAll('.ls-block');
  for (const block of blocks) {
    processBlock(block, today);
  }
}

/**
 * Remove all classes and injected elements added by this observer.
 */
function cleanupAll(): void {
  const doc = getParentDoc();
  for (const el of doc.querySelectorAll(`.${PAST_DUE_CLASS}`)) {
    el.classList.remove(PAST_DUE_CLASS);
  }
  for (const el of doc.querySelectorAll(`.${CANCELLED_LABEL_CLASS}`)) {
    el.remove();
  }
}

/**
 * Setup the MutationObserver for task block enhancements.
 * Returns a cleanup function.
 *
 * Uses a MutationObserver to:
 * 1. Detect task blocks with past-due SCHEDULED/DEADLINE dates
 * 2. Inject a "CANCELLED" label into cancelled task blocks
 */
export function setupTodoObserver(): () => void {
  const doc = getParentDoc();
  scanBlocks(getTodayString());

  // Batch mutations via requestAnimationFrame
  let rafId: number | null = null;

  const observer = new MutationObserver(() => {
    if (rafId === null) {
      rafId = requestAnimationFrame(() => {
        scanBlocks(getTodayString());
        rafId = null;
      });
    }
  });

  const root = doc.getElementById('main-content-container') ?? doc.body;
  observer.observe(root, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    if (rafId !== null) cancelAnimationFrame(rafId);
    cleanupAll();
  };
}
