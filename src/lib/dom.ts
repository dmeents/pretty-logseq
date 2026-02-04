/**
 * DOM Utilities
 *
 * Helper functions for DOM manipulation, positioning, and element creation.
 */

export interface Position {
  top: number;
  left: number;
}

export type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface PositionOptions {
  placement?: Placement;
  offset?: number;
}

/**
 * Calculate position for an element relative to an anchor
 */
export function calculatePosition(anchor: HTMLElement, options: PositionOptions = {}): Position {
  const { placement = 'bottom', offset = 8 } = options;
  const rect = anchor.getBoundingClientRect();

  let top: number;
  let left: number;

  switch (placement) {
    case 'top':
      top = rect.top - offset;
      left = rect.left;
      break;
    case 'bottom':
      top = rect.bottom + offset;
      left = rect.left;
      break;
    case 'left':
      top = rect.top;
      left = rect.left - offset;
      break;
    case 'right':
      top = rect.top;
      left = rect.right + offset;
      break;
    default:
      top = rect.bottom + offset;
      left = rect.left;
  }

  return { top, left };
}

/**
 * Adjust position to keep element within viewport
 */
export function adjustForViewport(
  position: Position,
  elementWidth: number,
  elementHeight: number,
  padding = 16,
): Position {
  const { innerWidth, innerHeight } = window;
  let { top, left } = position;

  // Adjust horizontal position
  if (left + elementWidth > innerWidth - padding) {
    left = innerWidth - elementWidth - padding;
  }
  if (left < padding) {
    left = padding;
  }

  // Adjust vertical position
  if (top + elementHeight > innerHeight - padding) {
    top = innerHeight - elementHeight - padding;
  }
  if (top < padding) {
    top = padding;
  }

  return { top, left };
}

/**
 * Position an element relative to an anchor with viewport adjustment
 */
export function positionElement(
  element: HTMLElement,
  anchor: HTMLElement,
  options: PositionOptions = {},
): void {
  const position = calculatePosition(anchor, options);
  const rect = element.getBoundingClientRect();

  const adjusted = adjustForViewport(position, rect.width, rect.height);

  element.style.left = `${adjusted.left}px`;
  element.style.top = `${adjusted.top}px`;
}

/**
 * Create an HTML element with attributes
 */
export function createElement<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string>,
  innerHTML?: string,
): HTMLElementTagNameMap[K] {
  const element = document.createElement(tag);

  if (attrs) {
    for (const [key, value] of Object.entries(attrs)) {
      element.setAttribute(key, value);
    }
  }

  if (innerHTML) {
    element.innerHTML = innerHTML;
  }

  return element;
}

/**
 * Remove an element by ID if it exists
 */
export function removeElementById(id: string): void {
  document.getElementById(id)?.remove();
}
