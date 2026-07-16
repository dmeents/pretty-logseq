/**
 * Logseq version detection.
 *
 * Logseq ships as two apps that install plugins from the same store: the classic
 * file/markdown app ("v1") and the DB app ("v2"). One Pretty Logseq build must
 * serve both, so we detect the active version at runtime and expose it as a cheap
 * synchronous accessor (mirroring `getSettings()`), letting features branch on it.
 */

import { getParentDoc } from '../lib/dom';
import { getSettings } from '../settings';

export type LogseqVersion = 'v1' | 'v2';

/** Attribute written onto the host `<html>` so feature SCSS can scope on version. */
export const VERSION_ATTR = 'data-pl-version';

let cachedVersion: LogseqVersion | null = null;

/**
 * Test seam: force the cached version (or clear it with `null`) without probing.
 */
export function setVersionForTest(version: LogseqVersion | null): void {
  cachedVersion = version;
}

/**
 * Detect whether we're running in the DB (v2) or file/markdown (v1) app.
 *
 * Resolution order:
 *   1. Explicit `logseqVersion` override setting (`v1`/`v2`) — used verbatim.
 *   2. Graph URL heuristic — DB graphs use a `logseq_db_` prefix, file graphs
 *      `logseq_local_`. (Primary signal; verify against a real DB graph.)
 *   3. DOM feature-probe on the host document (positive markers for each shell).
 *   4. Default to `v1` (preserves existing behavior when signals are inconclusive).
 *
 * The result is cached and only re-computed when `detectVersion()` is called
 * again (currently just the `logseqVersion` settings-change path). Switching
 * graphs across versions at runtime without that would not re-detect.
 */
export async function detectVersion(): Promise<LogseqVersion> {
  const override = getSettings().logseqVersion;
  if (override === 'v1' || override === 'v2') {
    cachedVersion = override;
    return override;
  }

  let version: LogseqVersion | null = null;

  try {
    const graph = await logseq.App.getCurrentGraph();
    const identifier = `${graph?.url ?? ''} ${graph?.name ?? ''}`;
    if (/logseq_db_/i.test(identifier)) {
      version = 'v2';
    } else if (/logseq_local_/i.test(identifier)) {
      version = 'v1';
    }
  } catch {
    // getCurrentGraph unavailable; fall through to the DOM probe.
  }

  if (version === null) {
    version = probeDomVersion();
  }

  cachedVersion = version ?? 'v1';
  return cachedVersion;
}

/**
 * Synchronous accessor for the last detected version. Returns `v1` if
 * `detectVersion()` has not resolved yet (safe default).
 */
export function getVersion(): LogseqVersion {
  return cachedVersion ?? 'v1';
}

/**
 * Best-effort DOM probe using version-distinctive sidebar shells (`#head` is NOT
 * a signal — both apps render it). v2's DB shell wraps the left sidebar in
 * `.cp__sidebar-left-layout` and renders nav under `.sidebar-navigations`;
 * v1 renders a `.nav-header` inside `#left-sidebar`. Returns `null` when neither
 * is present so callers can apply the safe default.
 */
function probeDomVersion(): LogseqVersion | null {
  try {
    const doc = getParentDoc();
    if (doc.querySelector('.cp__sidebar-left-layout, .sidebar-navigations')) {
      return 'v2';
    }
    if (doc.querySelector('#left-sidebar .nav-header')) {
      return 'v1';
    }
  } catch {
    // parent document not reachable
  }
  return null;
}

/**
 * Write the detected version onto the host `<html>` element so feature SCSS can
 * scope divergent rules with `[data-pl-version='v2'] …`.
 */
export function applyVersionAttribute(version: LogseqVersion = getVersion()): void {
  try {
    getParentDoc().documentElement.setAttribute(VERSION_ATTR, version);
  } catch {
    // parent document not reachable (e.g. non-iframe test context)
  }
}
