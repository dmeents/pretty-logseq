import { getVersion } from '../version';

/**
 * Returns the compiled CSS for the active Logseq version. Features import their
 * v1 (and, where it differs, v2) SCSS with `?inline` and pass both here.
 *
 * A missing or empty `v2` falls back to `v1`, so v2 renders with v1 styles until
 * its version-specific SCSS is authored during triage.
 */
export function pickStyles(styles: { v1: string; v2?: string }): string {
  if (getVersion() === 'v2' && styles.v2) {
    return styles.v2;
  }
  return styles.v1;
}
