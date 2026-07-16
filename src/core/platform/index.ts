import { getParentDoc } from '../../lib/dom';
import { getVersion, type LogseqVersion } from '../version';
import type { Platform } from './types';
import { v1Platform } from './v1';
import { v2Platform } from './v2';

export { pickStyles } from './styles';
export type { Platform, PlatformApi, PlatformSelectors, PlatformTheme } from './types';

const PLATFORMS: Record<LogseqVersion, Platform> = {
  v1: v1Platform,
  v2: v2Platform,
};

let testOverride: Platform | null = null;

/**
 * The active version's platform adapter. Selected by `getVersion()` (defaults to
 * v1 before detection resolves), so it's safe to call synchronously anywhere.
 */
export function getPlatform(): Platform {
  return testOverride ?? PLATFORMS[getVersion()];
}

/** Test seam: force a platform (or clear with `null`). */
export function setPlatformForTest(platform: Platform | null): void {
  testOverride = platform;
}

/**
 * The element the content MutationObservers should attach to, per the active
 * platform's `observerRoot` selector, falling back to `<body>`.
 */
export function getObserverRoot(): Element {
  const doc = getParentDoc();
  return doc.querySelector(getPlatform().selectors.observerRoot) ?? doc.body;
}
