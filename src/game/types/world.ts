export type EnvironmentTheme =
  | "battlefield"
  | "hall-of-wisdom"
  | "village"
  | "sanctuary"
  | "valley"
  | "forest"
  | "celestial"
  | "cosmic"
  | "palace"
  | "garden"
  | "mountain"
  | "citadel"
  | "sacred-tree";

export interface WorldDefinition {
  id: string;
  chapter: number;
  displayName: string;
  displayNameHindi?: string;
  sanskritName: string;
  subtitle: string;
  subtitleHindi?: string;
  theme: EnvironmentTheme;
  levelRange: {
    startGlobal: number;
    endGlobal: number;
    startVerse: number;
    endVerse: number;
  };
  primaryColor: string;
  accentColor: string;
  description: string;
  descriptionHindi?: string;
}
