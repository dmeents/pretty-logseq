/**
 * Logseq API Helpers
 *
 * Wrapper functions around Logseq's Plugin API with caching and error handling.
 */

import type { PageData, PageProperties } from '../types';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const pageCache = new Map<string, CacheEntry<PageData>>();
const CACHE_TTL = 30000; // 30 seconds

/**
 * Get page data with optional caching
 */
export async function getPage(
  pageName: string,
  options: { useCache?: boolean } = {},
): Promise<PageData | null> {
  const { useCache = true } = options;
  const cacheKey = pageName.toLowerCase();

  // Check cache
  if (useCache) {
    const cached = pageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
  }

  try {
    const page = await logseq.Editor.getPage(pageName);
    if (!page) return null;

    const pageData: PageData = {
      name: page.originalName || page.name,
      originalName: page.originalName,
      properties: (page.properties || {}) as PageProperties,
    };

    // Update cache
    pageCache.set(cacheKey, {
      data: pageData,
      timestamp: Date.now(),
    });

    return pageData;
  } catch (err) {
    console.error(`[Pretty Logseq] Failed to fetch page "${pageName}":`, err);
    return null;
  }
}

/**
 * Clear the page cache
 */
export function clearPageCache(pageName?: string): void {
  if (pageName) {
    pageCache.delete(pageName.toLowerCase());
  } else {
    pageCache.clear();
  }
}

/**
 * Get the current theme mode
 */
export async function getThemeMode(): Promise<'light' | 'dark'> {
  try {
    const configs = await logseq.App.getUserConfigs();
    return configs.preferredThemeMode === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Clean property value by removing [[ ]] brackets
 */
export function cleanPropertyValue(value: string): string {
  return value.replace(/^\[\[|\]\]$/g, '').trim();
}
