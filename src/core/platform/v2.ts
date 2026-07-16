import { getThemeMode } from '../../lib/api';
import { clearPageCacheV2, getPageBlocksV2, getPageV2 } from '../../lib/api.v2';
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

  // v2 uses the DB data model (`:block/title` + namespaced `:logseq.property/*`),
  // so page/property reads route through the v2 adapter, which normalizes back to
  // the shared `PageData` shape. Theme + favorites are App-level and version-
  // agnostic, so they reuse v1's implementations.
  api: {
    ...v1Platform.api,
    getPageData: (name, options) => getPageV2(name, options),
    getPageBlocks: name => getPageBlocksV2(name),
    getThemeMode: () => getThemeMode(),
    clearPageCache: name => clearPageCacheV2(name),
  },
};
