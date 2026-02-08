export interface Feature {
  id: string;
  name: string;
  description: string;
  getStyles(): string;
  init(): void | Promise<void>;
  destroy(): void;
}

export interface FeatureSetting {
  key: string;
  type: "boolean" | "string" | "number" | "enum";
  default: unknown;
  title: string;
  description: string;
  enumChoices?: string[];
}

export interface ConfigurableFeature extends Feature {
  settings?: FeatureSetting[];
  onSettingsChange?(settings: Record<string, unknown>): void;
}
