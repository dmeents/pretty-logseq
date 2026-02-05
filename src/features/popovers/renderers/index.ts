/**
 * Renderer Registry
 *
 * Manages popover renderers and dispatches to the correct one
 * based on page data. The default renderer is always the fallback.
 */

import type { PageData } from '../../../types';
import { defaultRenderer } from './default';
import { personRenderer } from './person';
import { resourceRenderer } from './resource';
import type { PopoverRenderer } from './types';

const renderers: PopoverRenderer[] = [];

// Register built-in renderers (checked before default fallback)
registerRenderer(personRenderer);
registerRenderer(resourceRenderer);

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

export type { PopoverRenderer } from './types';
