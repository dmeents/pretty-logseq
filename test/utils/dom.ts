/**
 * DOM Testing Utilities
 *
 * Helper functions for creating test DOM elements and waiting for async updates.
 */

/**
 * Create a mock page reference element
 */
export function createPageRef(pageName: string): HTMLElement {
  const ref = document.createElement('a');
  ref.className = 'page-ref';
  ref.setAttribute('data-ref', pageName);
  ref.textContent = pageName;
  return ref;
}

/**
 * Wait for an element to appear in the DOM
 */
export function waitForElement(selector: string, timeout = 1000): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const check = () => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        resolve(element);
      } else if (Date.now() - startTime >= timeout) {
        reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
      } else {
        setTimeout(check, 50);
      }
    };

    check();
  });
}

/**
 * Wait for the popover to appear
 */
export function waitForPopover(timeout = 1000): Promise<HTMLElement> {
  return waitForElement('#pretty-logseq-popover', timeout);
}

/**
 * Create a mock anchor element with getBoundingClientRect
 */
export function createMockAnchor(rect: Partial<DOMRect> = {}): HTMLElement {
  const element = document.createElement('div');
  const defaultRect = {
    top: 100,
    left: 200,
    bottom: 120,
    right: 300,
    width: 100,
    height: 20,
    x: 200,
    y: 100,
    toJSON: () => ({}),
  };

  element.getBoundingClientRect = vi.fn(() => ({
    ...defaultRect,
    ...rect,
  })) as () => DOMRect;

  return element;
}

/**
 * Set viewport dimensions for testing
 */
export function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
}
