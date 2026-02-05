/**
 * Extended Logseq types for Pretty Logseq plugin
 */

/**
 * Page properties commonly used in the knowledge graph
 */
export interface PageProperties {
  type?: string;
  status?: string;
  description?: string;
  icon?: string;
  area?: string;
  [key: string]: unknown;
}

/**
 * Minimal block data for popover content snippets
 */
export interface BlockData {
  content: string;
  children?: BlockData[];
}

/**
 * Page data returned from Logseq API with typed properties
 */
export interface PageData {
  name: string;
  originalName?: string;
  properties: PageProperties;
  blocks?: BlockData[];
}

/**
 * Theme mode for Logseq
 */
export type ThemeMode = 'light' | 'dark';
