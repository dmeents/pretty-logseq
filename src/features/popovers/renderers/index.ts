/**
 * Renderer Registry
 *
 * Manages popover renderers and dispatches to the correct one
 * based on page data. The default renderer is always the fallback.
 */

import type { PageData } from '../../../types';
// import { codebaseRenderer } from './codebase';
import { defaultRenderer } from './default';
import type { PopoverRenderer } from './types';
// import { personRenderer } from './person';
// import { resourceRenderer } from './resource';
import { unifiedRenderer } from './unified';

const renderers: PopoverRenderer[] = [];

// Register the unified renderer (handles all types)
registerRenderer(unifiedRenderer);

// Previous specialized renderers (disabled in favor of unified):
// registerRenderer(personRenderer);
// registerRenderer(resourceRenderer);
// registerRenderer(codebaseRenderer);

/**
 * Register a renderer. Registered renderers are checked
 * before the default, in registration order (first match wins).
 */
export function registerRenderer(renderer: PopoverRenderer): void {
  renderers.push(renderer);
}

/**
 * Get the appropriate renderer for a page.
 * Returns the first registered renderer whose match() returns true,
 * or the default renderer as fallback.
 */
export function getRenderer(pageData: PageData): PopoverRenderer {
  for (const renderer of renderers) {
    if (renderer.match(pageData)) {
      return renderer;
    }
  }
  return defaultRenderer;
}

/**
 * Clear all registered renderers (for testing)
 */
export function clearRenderers(): void {
  renderers.length = 0;
}

export type { PopoverRenderer } from './types';
