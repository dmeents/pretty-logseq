/**
 * Tests for Favorites Observer
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { clearFavoritesCache, refreshFavorites } from './api';
import { cleanupFavoriteObserver, setupFavoriteObserver } from './observer';

describe('setupFavoriteObserver', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    clearFavoritesCache();
    logseq.App.getCurrentGraphFavorites.mockResolvedValue([]);
    logseq.Editor.getCurrentPage.mockResolvedValue({
      name: 'test-page',
      originalName: 'Test Page',
    });
  });

  function createTitleElement(): HTMLHeadingElement {
    const h1 = document.createElement('h1');
    h1.className = 'title';
    h1.textContent = 'Test Page';
    return h1;
  }

  function createContainer(): HTMLDivElement {
    const container = document.createElement('div');
    container.id = 'main-content-container';
    return container;
  }

  it('performs initial scan and injects star buttons', async () => {
    const container = createContainer();
    const title = createTitleElement();
    container.appendChild(title);
    document.body.appendChild(container);

    setupFavoriteObserver();

    // Wait for initial scan
    await new Promise(resolve => setTimeout(resolve, 0));

    const starButton = title.querySelector('.pl-favorite-star');
    expect(starButton).not.toBeNull();
    expect(starButton?.tagName).toBe('BUTTON');

    cleanupFavoriteObserver();
  });

  it('marks processed titles to avoid duplicate injection', async () => {
    const container = createContainer();
    const title = createTitleElement();
    container.appendChild(title);
    document.body.appendChild(container);

    setupFavoriteObserver();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(title.getAttribute('data-pl-favorite-resolved')).toBe('true');
    const firstButton = title.querySelector('.pl-favorite-star');

    // Trigger another scan (shouldn't add another button)
    await new Promise(resolve => setTimeout(resolve, 0));

    const buttons = title.querySelectorAll('.pl-favorite-star');
    expect(buttons.length).toBe(1);
    expect(buttons[0]).toBe(firstButton);

    cleanupFavoriteObserver();
  });

  it('detects new titles added via mutation', async () => {
    const container = createContainer();
    document.body.appendChild(container);

    setupFavoriteObserver();
    await new Promise(resolve => setTimeout(resolve, 0));

    // Add title after observer is set up
    const title = createTitleElement();
    container.appendChild(title);

    // Wait for mutation observer + RAF
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    const starButton = title.querySelector('.pl-favorite-star');
    expect(starButton).not.toBeNull();

    cleanupFavoriteObserver();
  });

  it('sets initial star state based on favorites cache', async () => {
    // Set up favorites before observer
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['test-page']);
    await refreshFavorites();

    const container = createContainer();
    const title = createTitleElement();
    container.appendChild(title);
    document.body.appendChild(container);

    setupFavoriteObserver();
    await new Promise(resolve => setTimeout(resolve, 0));

    const starButton = title.querySelector('.pl-favorite-star') as HTMLButtonElement;
    expect(starButton).not.toBeNull();
    expect(starButton.classList.contains('pl-favorite-star--active')).toBe(true);

    cleanupFavoriteObserver();
  });

  it('toggles star state on click', async () => {
    await refreshFavorites();
    logseq.App.getCurrentGraphFavorites.mockResolvedValue([]);
    logseq.App.setCurrentGraphConfigs.mockResolvedValue(undefined);

    const container = createContainer();
    const title = createTitleElement();
    container.appendChild(title);
    document.body.appendChild(container);

    setupFavoriteObserver();
    await new Promise(resolve => setTimeout(resolve, 0));

    const starButton = title.querySelector('.pl-favorite-star') as HTMLButtonElement;
    expect(starButton.classList.contains('pl-favorite-star--active')).toBe(false);

    // Click to favorite - wait for the async operation
    const clickPromise = new Promise<void>(resolve => {
      starButton.addEventListener('click', () => {
        setTimeout(resolve, 10);
      });
    });
    starButton.click();
    await clickPromise;

    expect(starButton.classList.contains('pl-favorite-star--active')).toBe(true);
    // The mock returns name: 'test-page', so that's what gets passed to toggleFavorite
    expect(logseq.App.setCurrentGraphConfigs).toHaveBeenCalledWith({
      favorites: ['test-page'],
    });

    cleanupFavoriteObserver();
  });

  it('prevents event propagation on star click', async () => {
    const container = createContainer();
    const title = createTitleElement();
    container.appendChild(title);
    document.body.appendChild(container);

    const clickHandler = vi.fn();
    title.addEventListener('click', clickHandler);

    setupFavoriteObserver();
    await new Promise(resolve => setTimeout(resolve, 0));

    const starButton = title.querySelector('.pl-favorite-star') as HTMLButtonElement;
    starButton.click();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(clickHandler).not.toHaveBeenCalled();

    cleanupFavoriteObserver();
  });

  it('handles getCurrentPage errors gracefully', async () => {
    logseq.Editor.getCurrentPage.mockRejectedValue(new Error('No page'));

    const container = createContainer();
    const title = createTitleElement();
    container.appendChild(title);
    document.body.appendChild(container);

    setupFavoriteObserver();
    await new Promise(resolve => setTimeout(resolve, 0));

    // Should not inject star button
    const starButton = title.querySelector('.pl-favorite-star');
    expect(starButton).toBeNull();

    cleanupFavoriteObserver();
  });

  it('handles null currentPage gracefully', async () => {
    logseq.Editor.getCurrentPage.mockResolvedValue(null);

    const container = createContainer();
    const title = createTitleElement();
    container.appendChild(title);
    document.body.appendChild(container);

    setupFavoriteObserver();
    await new Promise(resolve => setTimeout(resolve, 0));

    // Should not inject star button
    const starButton = title.querySelector('.pl-favorite-star');
    expect(starButton).toBeNull();

    cleanupFavoriteObserver();
  });

  it('sets up route change listener', () => {
    setupFavoriteObserver();

    expect(logseq.App.onRouteChanged).toHaveBeenCalled();

    cleanupFavoriteObserver();
  });

  it('refreshes favorites on route change', async () => {
    let routeCallback: (() => void) | null = null;
    logseq.App.onRouteChanged.mockImplementation(cb => {
      routeCallback = cb;
      return () => {};
    });

    setupFavoriteObserver();
    expect(routeCallback).not.toBeNull();

    // Trigger route change
    logseq.App.getCurrentGraphFavorites.mockResolvedValue(['new-favorites']);
    routeCallback?.();

    await new Promise(resolve => setTimeout(resolve, 150)); // Wait for route change delay

    expect(logseq.App.getCurrentGraphFavorites).toHaveBeenCalled();

    cleanupFavoriteObserver();
  });

  it('falls back to document.body if main-content-container not found', () => {
    // Don't add main-content-container
    setupFavoriteObserver();

    // Should not throw error
    expect(() => cleanupFavoriteObserver()).not.toThrow();
  });

  it('batches multiple mutations with requestAnimationFrame', async () => {
    const container = createContainer();
    document.body.appendChild(container);

    let scanCount = 0;
    logseq.Editor.getCurrentPage.mockImplementation(async () => {
      scanCount++;
      return {
        name: 'test-page',
        originalName: 'Test Page',
      };
    });

    setupFavoriteObserver();

    // Add multiple titles rapidly
    for (let i = 0; i < 5; i++) {
      const title = createTitleElement();
      container.appendChild(title);
    }

    // Wait for batched processing
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    // Should batch into fewer scans than titles added
    // RAF batching means multiple DOM changes trigger only one scan
    expect(scanCount).toBeLessThan(5);

    cleanupFavoriteObserver();
  });
});

describe('cleanupFavoriteObserver', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    logseq.Editor.getCurrentPage.mockResolvedValue({
      name: 'test-page',
      originalName: 'Test Page',
    });
  });

  it('removes all injected star buttons', async () => {
    const container = document.createElement('div');
    container.id = 'main-content-container';
    const title = document.createElement('h1');
    title.className = 'title';
    container.appendChild(title);
    document.body.appendChild(container);

    setupFavoriteObserver();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(title.querySelector('.pl-favorite-star')).not.toBeNull();

    cleanupFavoriteObserver();

    expect(title.querySelector('.pl-favorite-star')).toBeNull();
  });

  it('removes all data-pl-favorite-resolved markers', async () => {
    const container = document.createElement('div');
    container.id = 'main-content-container';
    const title = document.createElement('h1');
    title.className = 'title';
    container.appendChild(title);
    document.body.appendChild(container);

    setupFavoriteObserver();
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(title.getAttribute('data-pl-favorite-resolved')).toBe('true');

    cleanupFavoriteObserver();

    expect(title.getAttribute('data-pl-favorite-resolved')).toBeNull();
  });

  it('disconnects mutation observer', async () => {
    const container = document.createElement('div');
    container.id = 'main-content-container';
    document.body.appendChild(container);

    setupFavoriteObserver();
    await new Promise(resolve => setTimeout(resolve, 0));

    cleanupFavoriteObserver();

    // Add title after cleanup - should not inject button
    const title = document.createElement('h1');
    title.className = 'title';
    container.appendChild(title);

    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    expect(title.querySelector('.pl-favorite-star')).toBeNull();
  });

  it('cancels pending requestAnimationFrame', async () => {
    const container = document.createElement('div');
    container.id = 'main-content-container';
    document.body.appendChild(container);

    setupFavoriteObserver();

    // Add title but cleanup before RAF processes
    const title = document.createElement('h1');
    title.className = 'title';
    container.appendChild(title);

    cleanupFavoriteObserver();

    await new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });

    expect(title.querySelector('.pl-favorite-star')).toBeNull();
  });

  it('unsubscribes from route changes', () => {
    const unsubscribe = vi.fn();
    logseq.App.onRouteChanged.mockReturnValue(unsubscribe);

    setupFavoriteObserver();
    cleanupFavoriteObserver();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it('can be called multiple times safely', () => {
    setupFavoriteObserver();
    cleanupFavoriteObserver();
    cleanupFavoriteObserver();
    cleanupFavoriteObserver();

    expect(() => cleanupFavoriteObserver()).not.toThrow();
  });

  it('can be called without prior setup', () => {
    expect(() => cleanupFavoriteObserver()).not.toThrow();
  });
});
