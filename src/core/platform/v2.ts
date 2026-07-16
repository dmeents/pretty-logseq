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
/**
 * Radix step-9 solid colors, keyed by the accent name v2 stores in `data-color`.
 * (Step 9 is Radix's designated "solid background" step — the vivid accent.)
 * Kept intentionally close to Logseq's own accent swatches; an unmapped name is a
 * safe no-op (theme.ts falls back to probing CSS vars).
 */
const V2_ACCENT_COLORS: Record<string, string> = {
  tomato: 'rgb(229, 77, 46)',
  red: 'rgb(229, 72, 77)',
  crimson: 'rgb(233, 61, 130)',
  pink: 'rgb(214, 64, 159)',
  plum: 'rgb(171, 74, 186)',
  purple: 'rgb(142, 78, 198)',
  violet: 'rgb(110, 86, 207)',
  indigo: 'rgb(62, 99, 221)',
  blue: 'rgb(0, 144, 255)',
  cyan: 'rgb(0, 162, 199)',
  teal: 'rgb(18, 165, 148)',
  green: 'rgb(48, 164, 108)',
  grass: 'rgb(70, 167, 88)',
  orange: 'rgb(247, 107, 21)',
  brown: 'rgb(173, 127, 88)',
  gold: 'rgb(151, 131, 101)',
  bronze: 'rgb(161, 128, 114)',
  gray: 'rgb(139, 141, 152)',
};

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

  theme: {
    ...v1Platform.theme,
    // v2's settings accent picker writes the chosen color name onto `<html>` as
    // `data-color` (e.g. `data-color="violet"`), so we can match the user's exact
    // choice instead of probing CSS vars. Values are Radix color names; map them
    // to their solid step-9 RGB. Unlisted names fall through to the var probe.
    accentAttr: 'data-color',
    accentColorMap: V2_ACCENT_COLORS,
  },
};
