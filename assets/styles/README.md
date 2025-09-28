# Thème Vuetify

Ce dossier contient les variables du thème pour l'interface. Les tokens sont exposés via les thèmes `light` et `dark` de Vuetify (voir `plugins/vuetify.ts`). Ils sont disponibles en CSS grâce aux variables générées par Vuetify (`--v-theme-*` pour les couleurs, `--v-*` pour les autres valeurs).

## Couleurs

| Token | Light | Dark | Usage |
| --- | --- | --- | --- |
| `primary` | `#E91E63` (ou valeur du cookie `theme-primary`) | idem | Couleur d'accent principale (boutons, liens actifs).
| `on-primary` | `#FFFFFF` | `#1B0410` | Contenu posé sur les surfaces `primary`.
| `secondary` | `#475569` | `#9CA3AF` | Accent secondaire (fonds d'éléments, badges).
| `on-secondary` | `#FFFFFF` | `#111827` | Contenu sur `secondary`.
| `success` | `#2E7D32` | `#81C784` | États positifs (validations, badges).
| `warning` | `#ED6C02` | `#FFB74D` | États d'avertissement.
| `error` | `#D32F2F` | `#EF5350` | États d'erreur.
| `info` | `#0288D1` | `#4FC3F7` | Messages informatifs.
| `background` | `#F5F7FA` | `#0F172A` | Fond général de l'app.
| `surface` | `#FFFFFF` | `#111827` | Surfaces par défaut (cartes, feuilles).
| `surface-variant` | `#E4E7EC` | `#1F2937` | Surfaces alternatives (listes, séparateurs).
| `surface-bright` | `#FDFEFF` | `#1F2937` | Surfaces très claires/dégradées.
| `surface-light` | `#F7F9FC` | `#1C2534` | Surfaces légèrement relevées.
| `on-background` | `#1F2933` | `#E5E7EB` | Texte sur `background`.
| `on-surface` | `#1F2933` | `#F9FAFB` | Texte principal sur `surface`.
| `on-surface-variant` | `#52616B` | `#CBD5F5` | Texte secondaire.
| `outline` | `#CBD2D9` | `#374151` | Bordures, séparateurs.
| `outline-variant` | `#E4E7EC` | `#1F2937` | Bordures légères.
| `shadow` | `#0B1526` | `#000000` | Ombres.
| `scrim` | `#000000` | `#000000` | Overlays opaques.
| `inverse-surface` | `#1F2933` | `#F9FAFB` | Surfaces inversées (snackbars, overlays).
| `inverse-on-surface` | `#F5F7FA` | `#0F172A` | Contenu sur `inverse-surface`.
| `inverse-primary` | `#FFB0C5` | `#FFB0C5` | Accent primaire inversé.

Les autres alias (`primary-container`, `on-primary-container`, etc.) sont exposés pour les composants qui en ont besoin.

Pour consommer ces couleurs, utilisez `rgb(var(--v-theme-<token>))` dans vos styles.

## Espacements

Une échelle cohérente est exposée via `--v-space-n` (en rem) :

| Token | Valeur |
| --- | --- |
| `space-0` | `0rem`
| `space-1` | `0.25rem`
| `space-2` | `0.5rem`
| `space-3` | `0.75rem`
| `space-4` | `1rem`
| `space-5` | `1.5rem`
| `space-6` | `2rem`
| `space-7` | `2.5rem`
| `space-8` | `3rem`

Utilisez-les pour les marges et paddings : `padding: var(--v-space-4);`.

## Rayons

Les rayons sont accessibles via `--v-radius-*` : `none`, `xs`, `sm`, `md`, `lg`, `xl`, `pill`. Exemple : `border-radius: var(--v-radius-md);`.

## Typographie

- Police par défaut (`$body-font-family`) : `var(--v-font-family-base)` → `Inter` (fallback systèmes).
- Police display (`var(--v-font-family-display)`) pour les titres : `Plus Jakarta Sans`.
- Tailles :
  - `h1` → `var(--v-text-h1-size)` (3.25rem), line-height 1.2.
  - `h2` → `var(--v-text-h2-size)` (2.5rem), line-height 1.25.
  - `h3` → `var(--v-text-h3-size)` (2rem), line-height 1.3.
  - `h4` → `var(--v-text-h4-size)` (1.5rem), line-height 1.35.
  - `h5` → `var(--v-text-h5-size)` (1.25rem), line-height 1.4.
  - `h6` → `var(--v-text-h6-size)` (1rem), line-height 1.45.
  - Corps (`body-1`) → `var(--v-text-body-1-size)` (1rem), line-height 1.6.
  - Corps secondaire (`body-2`) → `var(--v-text-body-2-size)` (0.875rem), line-height 1.6.

Les lettres-spacing et poids (`var(--v-text-*-letter-spacing|weight)`) sont également exposés.

## Formulaires et boutons

- Boutons :
  - `border-radius` → `var(--v-radius-pill)` pour les actions principales.
  - `padding-x` → `var(--v-btn-padding-x)` (`var(--v-space-4)` par défaut).
  - `height` → `var(--v-btn-height)` (2.75rem).
- Champs de saisie :
  - `font-size` → `var(--v-input-font-size)` (15px).
  - `line-height` → `var(--v-input-line-height)` (1.4).
  - `min-height` → `var(--v-input-min-height)` (44px).
  - `border-radius` → `var(--v-field-border-radius)` (`var(--v-radius-md)`).

Ces tokens sont destinés à être réutilisés dans les composants personnalisés pour garantir une cohérence visuelle entre le design system et Vuetify.
