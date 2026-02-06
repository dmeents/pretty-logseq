/**
 * Feature Registry
 *
 * Manages feature registration, lifecycle, and coordination.
 * Features register themselves and the registry handles initialization
 * and cleanup in the proper order.
 */

import type { Feature } from '../types';

interface RegisteredFeature {
  feature: Feature;
  initialized: boolean;
}

export class FeatureRegistry {
  private features = new Map<string, RegisteredFeature>();
  private initOrder: string[] = [];

  /**
   * Register a feature with the registry
   */
  register(feature: Feature): void {
    if (this.features.has(feature.id)) {
      console.warn(`[Pretty Logseq] Feature "${feature.id}" already registered`);
      return;
    }

    this.features.set(feature.id, {
      feature,
      initialized: false,
    });
  }

  /**
   * Get a registered feature by ID
   */
  get(id: string): Feature | undefined {
    return this.features.get(id)?.feature;
  }

  /**
   * Get all registered features
   */
  getAll(): Feature[] {
    return Array.from(this.features.values()).map(r => r.feature);
  }

  /**
   * Initialize all registered features
   */
  async initializeAll(): Promise<void> {
    for (const [id, registered] of this.features) {
      if (!registered.initialized) {
        try {
          await registered.feature.init();
          registered.initialized = true;
          this.initOrder.push(id);
          console.log(`[Pretty Logseq] Feature "${id}" initialized`);
        } catch (err) {
          console.error(`[Pretty Logseq] Failed to initialize feature "${id}":`, err);
        }
      }
    }
  }

  /**
   * Initialize a single feature by ID
   */
  async initializeFeature(id: string): Promise<void> {
    const registered = this.features.get(id);
    if (!registered) {
      console.warn(`[Pretty Logseq] Feature "${id}" not found`);
      return;
    }
    if (registered.initialized) return;

    try {
      await registered.feature.init();
      registered.initialized = true;
      this.initOrder.push(id);
      console.log(`[Pretty Logseq] Feature "${id}" initialized`);
    } catch (err) {
      console.error(`[Pretty Logseq] Failed to initialize feature "${id}":`, err);
    }
  }

  /**
   * Destroy a single feature by ID
   */
  destroyFeature(id: string): void {
    const registered = this.features.get(id);
    if (!registered?.initialized) return;

    try {
      registered.feature.destroy();
      registered.initialized = false;
      this.initOrder = this.initOrder.filter(i => i !== id);
      console.log(`[Pretty Logseq] Feature "${id}" destroyed`);
    } catch (err) {
      console.error(`[Pretty Logseq] Failed to destroy feature "${id}":`, err);
    }
  }

  /**
   * Check if a feature is currently initialized
   */
  isInitialized(id: string): boolean {
    return this.features.get(id)?.initialized ?? false;
  }

  /**
   * Cleanup all features in reverse initialization order
   */
  async destroyAll(): Promise<void> {
    for (const id of [...this.initOrder].reverse()) {
      const registered = this.features.get(id);
      if (registered?.initialized) {
        try {
          registered.feature.destroy();
          registered.initialized = false;
          console.log(`[Pretty Logseq] Feature "${id}" destroyed`);
        } catch (err) {
          console.error(`[Pretty Logseq] Failed to destroy feature "${id}":`, err);
        }
      }
    }
    this.initOrder = [];
  }

  /**
   * Get aggregated styles from all registered features
   */
  getAggregatedStyles(): string {
    const styles: string[] = [];

    for (const registered of this.features.values()) {
      const featureStyles = registered.feature.getStyles();
      if (featureStyles) {
        styles.push(`/* Feature: ${registered.feature.id} */`);
        styles.push(featureStyles);
      }
    }

    return styles.join('\n\n');
  }
}

// Singleton instance
export const registry = new FeatureRegistry();
