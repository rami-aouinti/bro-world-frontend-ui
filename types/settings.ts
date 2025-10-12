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

export type SiteThemeMode = "light" | "dark" | "system";

export interface SiteProfileSettings {
  allowCustomization: boolean;
  allowAvatarUploads: boolean;
  allowCoverUploads: boolean;
  allowThemeSelection: boolean;
  showContactSection: boolean;
  showDetailsSection: boolean;
  showSocialSection: boolean;
  defaultBio?: string | null;
}

export interface SiteUiSettings {
  allowThemeSwitching: boolean;
  defaultThemeMode: SiteThemeMode;
}

export interface SiteContentBlock {
  title: string;
  subtitle?: string | null;
  body?: string | null;
  updatedAt: string;
}

export interface SiteSettings {
  siteName: string;
  tagline?: string | null;
  activeThemeId: string;
  themes: SiteThemeDefinition[];
  menus: SiteMenuItem[];
  profile: SiteProfileSettings;
  ui: SiteUiSettings;
  pages: {
    about: SiteContentBlock;
    contact: SiteContentBlock;
    help: SiteContentBlock;
  };
  updatedAt: string;
}
