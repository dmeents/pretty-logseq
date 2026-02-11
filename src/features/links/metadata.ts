import { getFaviconUrl } from './favicons';
import type { LinkMetadata } from './types';

interface CacheEntry {
  data: LinkMetadata;
  timestamp: number;
}

const metadataCache = new Map<string, CacheEntry>();
const failedUrls = new Map<string, number>();
const CACHE_TTL = 300_000; // 5 minutes
const FAILED_TTL = 60_000; // 1 minute retry
const FETCH_TIMEOUT = 5_000;

function getMetaContent(doc: Document, selectors: string[]): string | null {
  for (const selector of selectors) {
    const el = doc.querySelector(selector);
    if (el) {
      const content = el.getAttribute('content');
      if (content?.trim()) return content.trim();
    }
  }
  return null;
}

function resolveUrl(relative: string, base: string): string {
  try {
    return new URL(relative, base).href;
  } catch {
    return relative;
  }
}

export async function fetchMetadata(url: string): Promise<LinkMetadata | null> {
  // Check cache
  const cached = metadataCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // Check failed URLs
  const failedAt = failedUrls.get(url);
  if (failedAt && Date.now() - failedAt < FAILED_TTL) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'text/html' },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      const metadata: LinkMetadata = {
        url,
        title: null,
        description: null,
        image: null,
        siteName: null,
        domain: hostname,
        faviconUrl: getFaviconUrl(hostname),
        error: `This page returned ${response.status} (${response.statusText})`,
      };
      metadataCache.set(url, { data: metadata, timestamp: Date.now() });
      return metadata;
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const title =
      getMetaContent(doc, [
        'meta[property="og:title"]',
        'meta[name="twitter:title"]',
        'meta[name="title"]',
      ]) ??
      doc.querySelector('title')?.textContent?.trim() ??
      null;

    const description = getMetaContent(doc, [
      'meta[property="og:description"]',
      'meta[name="twitter:description"]',
      'meta[name="description"]',
    ]);

    let image = getMetaContent(doc, ['meta[property="og:image"]', 'meta[name="twitter:image"]']);
    if (image) {
      image = resolveUrl(image, url);
    }

    const siteName = getMetaContent(doc, ['meta[property="og:site_name"]']);

    const hostname = new URL(url).hostname.replace(/^www\./, '');
    const metadata: LinkMetadata = {
      url,
      title,
      description,
      image,
      siteName,
      domain: hostname,
      faviconUrl: getFaviconUrl(hostname),
      error: null,
    };

    metadataCache.set(url, { data: metadata, timestamp: Date.now() });
    failedUrls.delete(url);
    return metadata;
  } catch (err) {
    console.error(`[Pretty Logseq] Failed to fetch metadata for "${url}":`, err);
    failedUrls.set(url, Date.now());
    return null;
  }
}

export function clearMetadataCache(): void {
  metadataCache.clear();
  failedUrls.clear();
}
