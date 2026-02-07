/**
 * Type Configuration Map
 *
 * Defines per-type popover behavior: subtitle derivation, which properties
 * to display as detail rows, extra tags, photo support, array properties,
 * and whether to show a content snippet.
 */

import { cleanPropertyValue } from '../../../lib/api';
import type { PageData } from '../../../types';

export type SubtitleStrategy =
  | { kind: 'template'; parts: { property: string; joinWith?: string }[] }
  | { kind: 'property'; name: string };

export interface TypeConfig {
  /** Subtitle strategies tried in order — first non-empty wins */
  subtitle: SubtitleStrategy[];
  /** Properties to display as key-value detail rows, in display order */
  detailProperties: string[];
  /** Additional tag pills beyond type/status/area */
  extraTags: string[];
  /** Property name containing a photo/image URL */
  photoProperty?: string;
  /** Properties whose values render as pill arrays (e.g. stack) */
  arrayProperties: string[];
  /** Whether to show a content snippet from page blocks */
  showSnippet: boolean;
}

const DEFAULT_CONFIG: TypeConfig = {
  subtitle: [],
  detailProperties: [],
  extraTags: [],
  arrayProperties: [],
  showSnippet: true,
};

const TYPE_CONFIGS: Record<string, TypeConfig> = {
  person: {
    subtitle: [
      {
        kind: 'template',
        parts: [{ property: 'role' }, { property: 'organization', joinWith: ' at ' }],
      },
    ],
    detailProperties: ['location', 'email', 'phone'],
    extraTags: ['relationship'],
    photoProperty: 'photo',
    arrayProperties: [],
    showSnippet: false,
  },
  'code base': {
    subtitle: [{ kind: 'property', name: 'owner' }],
    detailProperties: [],
    extraTags: [],
    arrayProperties: ['stack'],
    showSnippet: false,
  },
  book: {
    subtitle: [{ kind: 'property', name: 'author' }],
    detailProperties: ['rating'],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
  game: {
    subtitle: [{ kind: 'property', name: 'platform' }],
    detailProperties: ['rating', 'genre'],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
  restaurant: {
    subtitle: [{ kind: 'property', name: 'cuisine' }],
    detailProperties: ['rating', 'location', 'address'],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
  recipe: {
    subtitle: [{ kind: 'property', name: 'cuisine' }],
    detailProperties: ['rating', 'source', 'author'],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
  event: {
    subtitle: [{ kind: 'property', name: 'date' }],
    detailProperties: ['location', 'address'],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
  company: {
    subtitle: [],
    detailProperties: ['location', 'address'],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
  documentation: {
    subtitle: [{ kind: 'property', name: 'author' }],
    detailProperties: ['repository'],
    extraTags: ['initiative'],
    arrayProperties: [],
    showSnippet: false,
  },
  project: {
    subtitle: [],
    detailProperties: ['repository', 'platform'],
    extraTags: ['initiative'],
    arrayProperties: [],
    showSnippet: false,
  },
  software: {
    subtitle: [{ kind: 'property', name: 'platform' }],
    detailProperties: ['rating', 'repository'],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
  website: {
    subtitle: [{ kind: 'property', name: 'source' }],
    detailProperties: ['rating'],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
  meeting: {
    subtitle: [],
    detailProperties: [],
    extraTags: ['initiative'],
    arrayProperties: [],
    showSnippet: false,
  },
  resource: {
    subtitle: [],
    detailProperties: [],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
  system: {
    subtitle: [],
    detailProperties: [],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
  technology: {
    subtitle: [],
    detailProperties: [],
    extraTags: [],
    arrayProperties: [],
    showSnippet: false,
  },
};

/** Look up the config for a page's type. Falls back to DEFAULT_CONFIG. */
export function getTypeConfig(pageData: PageData): TypeConfig {
  const { type } = pageData.properties;
  if (!type) return DEFAULT_CONFIG;
  const key = cleanPropertyValue(type).toLowerCase();
  return TYPE_CONFIGS[key] ?? DEFAULT_CONFIG;
}

/**
 * Resolve the subtitle string from an ordered list of strategies.
 * Returns null if no strategy produces a non-empty result.
 */
export function resolveSubtitle(pageData: PageData, strategies: SubtitleStrategy[]): string | null {
  for (const strategy of strategies) {
    const result = applyStrategy(pageData, strategy);
    if (result) return result;
  }
  return null;
}

function applyStrategy(pageData: PageData, strategy: SubtitleStrategy): string | null {
  switch (strategy.kind) {
    case 'property': {
      const val = pageData.properties[strategy.name];
      return val ? cleanPropertyValue(val) : null;
    }
    case 'template': {
      const parts: string[] = [];
      for (const part of strategy.parts) {
        const val = pageData.properties[part.property];
        if (!val) continue;
        const cleaned = cleanPropertyValue(val);
        if (!cleaned) continue;
        if (part.joinWith && parts.length > 0) {
          parts.push(part.joinWith + cleaned);
        } else {
          parts.push(cleaned);
        }
      }
      return parts.length > 0 ? parts.join('') : null;
    }
  }
}
