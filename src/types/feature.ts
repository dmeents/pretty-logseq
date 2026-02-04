/**
 * Feature interface for Pretty Logseq plugin modules
 *
 * Each feature is a self-contained customization that can be
 * registered with the plugin and managed through its lifecycle.
 */

/**
 * Core feature interface that all features must implement
 */
export interface Feature {
  /** Unique identifier for the feature */
  id: string;

  /** Display name for the feature */
  name: string;

  /** Brief description of what the feature does */
  description: string;

  /**
   * Returns CSS styles for this feature
   * Called during style aggregation
   */
  getStyles(): string;

  /**
   * Initialize the feature
   * Called when plugin loads and feature is enabled
   */
  init(): void | Promise<void>;

  /**
   * Cleanup the feature
   * Called when plugin unloads or feature is disabled
   */
  destroy(): void;
}

/**
 * Feature setting definition for future settings UI
 */
export interface FeatureSetting {
  key: string;
  type: 'boolean' | 'string' | 'number' | 'enum';
  default: unknown;
  title: string;
  description: string;
  enumChoices?: string[];
}

/**
 * Extended feature interface with optional settings support
 */
export interface ConfigurableFeature extends Feature {
  /** Feature-specific settings schema */
  settings?: FeatureSetting[];

  /** Called when settings change */
  onSettingsChange?(settings: Record<string, unknown>): void;
}
