/**
 * Favorites API
 * Handles reading/writing favorite pages via Logseq API with caching
 */

let favoritesCache = new Set<string>();

/**
 * Refresh favorites from Logseq graph config
 */
export async function refreshFavorites(): Promise<void> {
  try {
    const favorites = await logseq.App.getCurrentGraphFavorites();
    favoritesCache = new Set((favorites || []).map(name => name.toLowerCase()));
  } catch (error) {
    console.error('[Pretty Logseq] Failed to refresh favorites:', error);
    favoritesCache = new Set();
  }
}

/**
 * Check if a page is favorited (case-insensitive)
 */
export function isFavorited(pageName: string): boolean {
  return favoritesCache.has(pageName.toLowerCase());
}

/**
 * Toggle favorite status for a page
 */
export async function toggleFavorite(pageName: string): Promise<void> {
  const lowerName = pageName.toLowerCase();
  const wasFavorited = favoritesCache.has(lowerName);

  // Optimistic update
  if (wasFavorited) {
    favoritesCache.delete(lowerName);
  } else {
    favoritesCache.add(lowerName);
  }

  try {
    // Read current favorites to preserve original case
    const currentFavorites = (await logseq.App.getCurrentGraphFavorites()) || [];

    let newFavorites: string[];
    if (wasFavorited) {
      // Remove from favorites (case-insensitive)
      newFavorites = currentFavorites.filter(name => name.toLowerCase() !== lowerName);
    } else {
      // Add to favorites (preserve user's input case)
      newFavorites = [...currentFavorites, pageName];
    }

    // Write back to config
    await logseq.App.setCurrentGraphConfigs({ favorites: newFavorites });
  } catch (error) {
    console.error('[Pretty Logseq] Failed to toggle favorite:', error);

    // Rollback optimistic update
    if (wasFavorited) {
      favoritesCache.add(lowerName);
    } else {
      favoritesCache.delete(lowerName);
    }

    throw error;
  }
}

/**
 * Clear favorites cache (cleanup)
 */
export function clearFavoritesCache(): void {
  favoritesCache.clear();
}
