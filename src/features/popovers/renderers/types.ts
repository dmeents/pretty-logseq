/**
 * Popover Renderer Types
 *
 * Interface for pluggable popover renderers that produce
 * different layouts based on page properties.
 */

import type { PageData } from '../../../types';

export interface PopoverRenderer {
  id: string;

  /** Return true if this renderer should handle this page */
  match(pageData: PageData): boolean;

  /** Build the popover content as a DOM element */
  render(pageData: PageData): HTMLElement;
}
