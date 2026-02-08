/**
 * Tests for Popover Type Config (Property-Driven Inference)
 */

import { describe, expect, it } from 'vitest';
import type { PageData } from '../../../types';
import { resolveConfig } from './type-config';

function makePage(properties: Record<string, unknown> = {}): PageData {
  return { name: 'Test Page', properties };
}

describe('resolveConfig', () => {
  describe('subtitle resolution', () => {
    it('returns null subtitle when no subtitle properties exist', () => {
      const config = resolveConfig(makePage({ type: 'Resource' }));
      expect(config.subtitleText).toBeNull();
    });

    it('uses role as subtitle', () => {
      const config = resolveConfig(makePage({ role: 'Engineer' }));
      expect(config.subtitleText).toBe('Engineer');
    });

    it('combines role and organization as "Role at Org"', () => {
      const config = resolveConfig(makePage({ role: 'Engineer', organization: 'Acme Corp' }));
      expect(config.subtitleText).toBe('Engineer at Acme Corp');
    });

    it('uses organization alone when only org exists', () => {
      const config = resolveConfig(makePage({ organization: 'Acme Corp' }));
      expect(config.subtitleText).toBe('Acme Corp');
    });

    it('uses cuisine as subtitle', () => {
      const config = resolveConfig(makePage({ cuisine: 'Italian' }));
      expect(config.subtitleText).toBe('Italian');
    });

    it('uses author as subtitle', () => {
      const config = resolveConfig(makePage({ author: '[[Jane Smith]]' }));
      expect(config.subtitleText).toBe('Jane Smith');
    });

    it('uses platform as subtitle', () => {
      const config = resolveConfig(makePage({ platform: 'Steam' }));
      expect(config.subtitleText).toBe('Steam');
    });

    it('uses owner as subtitle', () => {
      const config = resolveConfig(makePage({ owner: '[[John]]' }));
      expect(config.subtitleText).toBe('John');
    });

    it('uses source as subtitle', () => {
      const config = resolveConfig(makePage({ source: 'GitHub' }));
      expect(config.subtitleText).toBe('GitHub');
    });

    it('uses date as subtitle', () => {
      const config = resolveConfig(makePage({ date: '2024-01-15' }));
      expect(config.subtitleText).toBe('2024-01-15');
    });

    it('respects priority order — role wins over cuisine', () => {
      const config = resolveConfig(makePage({ cuisine: 'Italian', role: 'Chef' }));
      expect(config.subtitleText).toBe('Chef');
    });

    it('respects priority order — cuisine wins over author', () => {
      const config = resolveConfig(makePage({ author: 'Someone', cuisine: 'Mexican' }));
      expect(config.subtitleText).toBe('Mexican');
    });

    it('cleans bracket syntax from subtitle values', () => {
      const config = resolveConfig(makePage({ author: ['[[John Doe]]'] }));
      expect(config.subtitleText).toBe('John Doe');
    });
  });

  describe('photo detection', () => {
    it('detects photo property when present', () => {
      const config = resolveConfig(makePage({ photo: 'https://example.com/photo.jpg' }));
      expect(config.photoProperty).toBe('photo');
    });

    it('returns undefined when no photo property', () => {
      const config = resolveConfig(makePage({ type: 'Person' }));
      expect(config.photoProperty).toBeUndefined();
    });
  });

  describe('detail properties', () => {
    it('includes rating as a detail property', () => {
      const config = resolveConfig(makePage({ rating: 4 }));
      expect(config.detailProperties).toContain('rating');
    });

    it('includes location as a detail property', () => {
      const config = resolveConfig(makePage({ location: 'NYC' }));
      expect(config.detailProperties).toContain('location');
    });

    it('includes email as a detail property', () => {
      const config = resolveConfig(makePage({ email: 'test@example.com' }));
      expect(config.detailProperties).toContain('email');
    });

    it('includes phone as a detail property', () => {
      const config = resolveConfig(makePage({ phone: '555-1234' }));
      expect(config.detailProperties).toContain('phone');
    });

    it('excludes managed properties from details', () => {
      const config = resolveConfig(
        makePage({ type: 'Person', status: 'Active', description: 'A person' }),
      );
      expect(config.detailProperties).not.toContain('type');
      expect(config.detailProperties).not.toContain('status');
      expect(config.detailProperties).not.toContain('description');
    });

    it('excludes the consumed subtitle property from details', () => {
      const config = resolveConfig(makePage({ cuisine: 'Italian', rating: 4 }));
      // cuisine is used as subtitle, so it should not appear in details
      expect(config.subtitleText).toBe('Italian');
      expect(config.detailProperties).not.toContain('cuisine');
      expect(config.detailProperties).toContain('rating');
    });

    it('preserves detail priority order', () => {
      const config = resolveConfig(makePage({ email: 'a@b.com', rating: 5, location: 'NYC' }));
      const ratingIdx = config.detailProperties.indexOf('rating');
      const locationIdx = config.detailProperties.indexOf('location');
      const emailIdx = config.detailProperties.indexOf('email');
      expect(ratingIdx).toBeLessThan(locationIdx);
      expect(locationIdx).toBeLessThan(emailIdx);
    });

    it('excludes tag properties from details', () => {
      const config = resolveConfig(makePage({ relationship: 'Friend', initiative: 'Project X' }));
      expect(config.detailProperties).not.toContain('relationship');
      expect(config.detailProperties).not.toContain('initiative');
    });

    it('only includes properties that exist on the page', () => {
      const config = resolveConfig(makePage({ rating: 3 }));
      expect(config.detailProperties).toEqual(['rating']);
    });
  });

  describe('array properties', () => {
    it('detects array-valued properties', () => {
      const config = resolveConfig(makePage({ stack: ['React', 'Node'], genre: 'Rock' }));
      expect(config.arrayProperties).toContain('stack');
    });

    it('excludes managed properties from array detection', () => {
      const config = resolveConfig(makePage({ alias: ['Alt Name'], type: ['Resource'] }));
      expect(config.arrayProperties).not.toContain('alias');
      expect(config.arrayProperties).not.toContain('type');
    });

    it('excludes detail properties from array detection', () => {
      const config = resolveConfig(makePage({ genre: ['Rock', 'Pop'] }));
      // genre is in DETAIL_PRIORITY, so it should be a detail, not array
      expect(config.detailProperties).toContain('genre');
      expect(config.arrayProperties).not.toContain('genre');
    });

    it('returns empty array when no array properties exist', () => {
      const config = resolveConfig(makePage({ rating: 5 }));
      expect(config.arrayProperties).toEqual([]);
    });
  });

  describe('extra tags', () => {
    it('includes relationship as an extra tag when present', () => {
      const config = resolveConfig(makePage({ relationship: 'Friend' }));
      expect(config.extraTags).toContain('relationship');
    });

    it('includes initiative as an extra tag when present', () => {
      const config = resolveConfig(makePage({ initiative: 'Project X' }));
      expect(config.extraTags).toContain('initiative');
    });

    it('returns empty array when no tag properties exist', () => {
      const config = resolveConfig(makePage({ rating: 5 }));
      expect(config.extraTags).toEqual([]);
    });
  });

  describe('showSnippet', () => {
    it('shows snippet when no rich content exists', () => {
      const config = resolveConfig(makePage({ type: 'Note' }));
      expect(config.showSnippet).toBe(true);
    });

    it('hides snippet when detail properties exist', () => {
      const config = resolveConfig(makePage({ rating: 4 }));
      expect(config.showSnippet).toBe(false);
    });

    it('hides snippet when array properties exist', () => {
      const config = resolveConfig(makePage({ stack: ['React', 'Node'] }));
      expect(config.showSnippet).toBe(false);
    });

    it('hides snippet when url property exists', () => {
      const config = resolveConfig(makePage({ url: 'https://example.com' }));
      expect(config.showSnippet).toBe(false);
    });

    it('shows snippet when only managed properties exist', () => {
      const config = resolveConfig(makePage({ type: 'Person', status: 'Active', icon: '👤' }));
      expect(config.showSnippet).toBe(true);
    });
  });

  describe('full page scenarios', () => {
    it('handles a person page', () => {
      const config = resolveConfig(
        makePage({
          type: 'Person',
          icon: '👤',
          role: 'Engineer',
          organization: 'Acme',
          email: 'eng@acme.com',
          phone: '555-0100',
          status: 'Active',
          area: 'Engineering',
          relationship: 'Colleague',
        }),
      );

      expect(config.subtitleText).toBe('Engineer at Acme');
      expect(config.detailProperties).toContain('email');
      expect(config.detailProperties).toContain('phone');
      expect(config.extraTags).toContain('relationship');
      expect(config.showSnippet).toBe(false);
    });

    it('handles a restaurant page', () => {
      const config = resolveConfig(
        makePage({
          type: 'Restaurant',
          icon: '🍕',
          cuisine: 'Italian',
          rating: 4,
          location: 'Downtown',
          url: 'https://example.com',
        }),
      );

      expect(config.subtitleText).toBe('Italian');
      expect(config.detailProperties).toContain('rating');
      expect(config.detailProperties).toContain('location');
      expect(config.detailProperties).not.toContain('cuisine');
      expect(config.showSnippet).toBe(false);
    });

    it('handles a bare page with no properties', () => {
      const config = resolveConfig(makePage({}));

      expect(config.subtitleText).toBeNull();
      expect(config.photoProperty).toBeUndefined();
      expect(config.detailProperties).toEqual([]);
      expect(config.arrayProperties).toEqual([]);
      expect(config.extraTags).toEqual([]);
      expect(config.showSnippet).toBe(true);
    });
  });
});
