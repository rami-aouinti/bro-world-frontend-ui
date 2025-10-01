export interface SiteThemeDefinition {
  id: string;
  name: string;
  description?: string | null;
  primaryColor: string;
  accentColor: string;
  surfaceColor: string;
}

export interface SiteMenuItem {
  id: string;
  label: string;
  icon?: string | null;
  to?: string | null;
  requiresAdmin?: boolean;
  translate?: boolean;
  order: number;
  isVisible?: boolean;
  children?: SiteMenuItem[];
}

export interface SiteSettings {
  siteName: string;
  tagline?: string | null;
  activeThemeId: string;
  themes: SiteThemeDefinition[];
  menus: SiteMenuItem[];
  updatedAt: string;
}
