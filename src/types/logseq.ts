export interface PageProperties {
  type?: string;
  status?: string;
  description?: string;
  icon?: string;
  area?: string;
  [key: string]: unknown;
}

export interface BlockData {
  content: string;
  children?: BlockData[];
}

export interface PageData {
  name: string;
  originalName?: string;
  properties: PageProperties;
  blocks?: BlockData[];
}

export type ThemeMode = 'light' | 'dark';
