/**
 * Popover Configuration — Property-Driven Inference
 *
 * Instead of a per-type config map, the popover layout is inferred from
 * the page's actual properties. Property names are classified into roles
 * (subtitle, detail row, tag pill, etc.) using priority-ordered lists.
 * Adding a new page type or property requires zero config changes —
 * the renderer automatically surfaces whatever is available.
 */

import { cleanPropertyValue } from '../../../lib/api';
import type { PageData } from '../../../types';

export interface PopoverConfig {
  /** Pre-resolved subtitle text (e.g. "Engineer at Acme") */
  subtitleText: string | null;
  /** Property name containing a photo URL, if present */
  photoProperty?: string;
  /** Properties to display as key-value detail rows, in display order */
  detailProperties: string[];
  /** Additional tag pill values beyond type/status/area */
  extraTags: string[];
  /** Property names whose values are arrays, rendered as pill groups */
  arrayProperties: string[];
  /** Whether to show a content snippet from page blocks */
  showSnippet: boolean;
}

/**
 * Subtitle priority — first property found on the page wins.
 * `role` is special: if `organization` also exists, they combine
 * as "Role at Organization".
 */
const SUBTITLE_PRIORITY = ['role', 'cuisine', 'author', 'platform', 'owner', 'source', 'date'];

/**
 * Detail row priority — properties shown as labeled key-value rows,
 * in this display order. Only properties that exist on the page are shown.
 * The subtitle property is automatically excluded to avoid duplication.
 */
const DETAIL_PRIORITY = [
  'rating',
  'location',
  'address',
  'email',
  'phone',
  'genre',
  'cuisine',
  'repository',
  'source',
  'platform',
  'author',
  'owner',
  'date',
];

/** Properties rendered as extra tag pills (beyond type/status/area). */
const TAG_PROPERTIES = ['relationship', 'initiative'];

/**
 * Properties that are displayed in their own dedicated sections and
 * should not appear as detail rows or array pills.
 */
const MANAGED_PROPERTIES = new Set([
  'type',
  'icon',
  'status',
  'area',
  'description',
  'created',
  'url',
  'photo',
  'role',
  'organization',
]);

/**
 * Analyze a page's properties and return a PopoverConfig that drives
 * the unified renderer. No per-type lookup — everything is inferred
 * from what properties actually exist on the page.
 */
export function resolveConfig(pageData: PageData): PopoverConfig {
  const props = pageData.properties;

  // 1. Photo: check if a photo property exists with a URL value
  const photoProperty = props.photo ? 'photo' : undefined;

  // 2. Subtitle: walk priority list, special-case role+organization
  const { text: subtitleText, consumed: subtitleConsumed } = resolveSubtitle(props);

  // 3. Detail rows: walk priority list, exclude consumed properties
  const excluded = new Set([...MANAGED_PROPERTIES, ...subtitleConsumed, ...TAG_PROPERTIES]);
  const detailProperties = DETAIL_PRIORITY.filter(p => props[p] && !excluded.has(p));

  // 4. Array properties: auto-detect multi-value properties not shown elsewhere
  const detailSet = new Set(detailProperties);
  const arrayProperties: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    if (excluded.has(key) || detailSet.has(key)) continue;
    if (Array.isArray(value)) {
      arrayProperties.push(key);
    }
  }

  // 5. Extra tags: tag-worthy properties that exist on the page
  const extraTags = TAG_PROPERTIES.filter(p => props[p]);

  // 6. Snippet: show when no rich structured content was found
  const hasRichContent =
    detailProperties.length > 0 || arrayProperties.length > 0 || Boolean(props.url);
  const showSnippet = !hasRichContent;

  return {
    subtitleText,
    photoProperty,
    detailProperties,
    extraTags,
    arrayProperties,
    showSnippet,
  };
}

/**
 * Resolve subtitle text from page properties using a priority list.
 * Special case: `role` and `organization` combine as "Role at Org".
 * Returns the resolved text and which properties were consumed.
 */
function resolveSubtitle(props: Record<string, unknown>): {
  text: string | null;
  consumed: string[];
} {
  for (const prop of SUBTITLE_PRIORITY) {
    if (prop === 'role') {
      // Special template: role + organization
      const role = props.role ? cleanPropertyValue(props.role) : null;
      const org = props.organization ? cleanPropertyValue(props.organization) : null;

      if (role && org) {
        return { text: `${role} at ${org}`, consumed: ['role', 'organization'] };
      }
      if (role) {
        return { text: role, consumed: ['role'] };
      }
      if (org) {
        return { text: org, consumed: ['organization'] };
      }
      continue;
    }

    const val = props[prop];
    if (val) {
      return { text: cleanPropertyValue(val), consumed: [prop] };
    }
  }

  return { text: null, consumed: [] };
}
