import type { Platform } from './types';
import { v1Platform } from './v1';

/**
 * Logseq v2 (DB) platform.
 *
 * Starts as a mirror of v1 — a safe baseline so v2 behaves as it does today —
 * and is overridden field-by-field as the DB DOM/API is confirmed against a real
 * instance (see `.ai/processes/capture-v2-dom.md` and `.ai/findings/v2-*`).
 *
 * To override, spread the parts that change, e.g.:
 *   selectors: { ...v1Platform.selectors, observerRoot: '#new-root' }
 *
 * Values not set below still inherit v1 and NEED VERIFICATION for v2.
 */
export const v2Platform: Platform = {
  ...v1Platform,
  version: 'v2',
  selectors: {
    ...v1Platform.selectors,
    // v2 renders page properties in `.ls-page-properties` with key labels in
    // `a.property-k` (the v1 `.page-properties .page-property-key` is gone).
    propertyKey: '.ls-page-properties .property-k',
  },
};
