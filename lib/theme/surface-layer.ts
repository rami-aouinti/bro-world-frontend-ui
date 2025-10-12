export interface SurfaceLayerTokens {
  backgroundImage: string;
  surfaceColor: string;
  borderColor: string;
  shadowColor: string;
}

export function createSurfaceLayerTokens(isDark: boolean): SurfaceLayerTokens {
  const surfaceOpacity = isDark ? 0.82 : 0.92;
  const gradientOpacity = isDark ? 0.62 : 0.82;
  const primaryStopOpacity = isDark ? 0.55 : 0.35;
  const variantStopOpacity = isDark ? 0.48 : 0.28;
  const borderOpacity = isDark ? 0.35 : 0.22;
  const shadowOpacity = isDark ? 0.45 : 0.15;

  return {
    backgroundImage: `linear-gradient(135deg, rgba(var(--v-theme-surface), ${gradientOpacity}), rgba(var(--v-theme-primary), ${primaryStopOpacity}), rgba(var(--v-theme-surface-variant), ${variantStopOpacity}))`,
    surfaceColor: `rgba(var(--v-theme-surface), ${surfaceOpacity})`,
    borderColor: `rgba(var(--v-theme-outline-variant), ${borderOpacity})`,
    shadowColor: `rgba(var(--v-theme-on-surface), ${shadowOpacity})`,
  } satisfies SurfaceLayerTokens;
}
