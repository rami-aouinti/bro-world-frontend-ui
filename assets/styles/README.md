# Thème Vuetify

Ce dossier contient les variables du thème pour l'interface. Les tokens sont exposés via les thèmes `light` et `dark` de Vuetify (voir `plugins/vuetify.ts`). Ils sont disponibles en CSS grâce aux variables générées par Vuetify (`--v-theme-*` pour les couleurs, `--v-*` pour les autres valeurs).

## Couleurs

| Token                | Light                                           | Dark      | Usage                                                |
| -------------------- | ----------------------------------------------- | --------- | ---------------------------------------------------- |
| `primary`            | `#E91E63` (ou valeur du cookie `theme-primary`) | idem      | Couleur d'accent principale (boutons, liens actifs). |
| `on-primary`         | `#FFFFFF`                                       | `#1B0410` | Contenu posé sur les surfaces `primary`.             |
| `secondary`          | `#475569`                                       | `#9CA3AF` | Accent secondaire (fonds d'éléments, badges).        |
| `on-secondary`       | `#FFFFFF`                                       | `#111827` | Contenu sur `secondary`.                             |
| `success`            | `#2E7D32`                                       | `#81C784` | États positifs (validations, badges).                |
| `warning`            | `#ED6C02`                                       | `#FFB74D` | États d'avertissement.                               |
| `error`              | `#D32F2F`                                       | `#EF5350` | États d'erreur.                                      |
| `info`               | `#0288D1`                                       | `#4FC3F7` | Messages informatifs.                                |
| `background`         | `#F5F7FA`                                       | `#0F172A` | Fond général de l'app.                               |
| `surface`            | `#FFFFFF`                                       | `#111827` | Surfaces par défaut (cartes, feuilles).              |
| `surface-variant`    | `#E4E7EC`                                       | `#1F2937` | Surfaces alternatives (listes, séparateurs).         |
| `surface-bright`     | `#FDFEFF`                                       | `#1F2937` | Surfaces très claires/dégradées.                     |
| `surface-light`      | `#F7F9FC`                                       | `#1C2534` | Surfaces légèrement relevées.                        |
| `on-background`      | `#1F2933`                                       | `#E5E7EB` | Texte sur `background`.                              |
| `on-surface`         | `#1F2933`                                       | `#F9FAFB` | Texte principal sur `surface`.                       |
| `on-surface-variant` | `#52616B`                                       | `#CBD5F5` | Texte secondaire.                                    |
| `outline`            | `#CBD2D9`                                       | `#374151` | Bordures, séparateurs.                               |
| `outline-variant`    | `#E4E7EC`                                       | `#1F2937` | Bordures légères.                                    |
| `shadow`             | `#0B1526`                                       | `#000000` | Ombres.                                              |
| `scrim`              | `#000000`                                       | `#000000` | Overlays opaques.                                    |
| `inverse-surface`    | `#1F2933`                                       | `#F9FAFB` | Surfaces inversées (snackbars, overlays).            |
| `inverse-on-surface` | `#F5F7FA`                                       | `#0F172A` | Contenu sur `inverse-surface`.                       |
| `inverse-primary`    | `#FFB0C5`                                       | `#FFB0C5` | Accent primaire inversé.                             |

Les autres alias (`primary-container`, `on-primary-container`, etc.) sont exposés pour les composants qui en ont besoin.

Pour consommer ces couleurs, utilisez `rgb(var(--v-theme-<token>))` dans vos styles.

> ℹ️ **Changer la couleur primaire**
>
> Les utilitaires Tailwind (`text-primary`, `bg-primary`, etc.) lisent la variable CSS `--primary` injectée côté client par `useThemes`.
> Cette valeur provient en priorité du cookie `theme-primary`, puis des réglages du site et enfin du thème par défaut (`FALLBACK_PRIMARY_HEX`).
>
> Après avoir modifié la couleur par défaut dans les sources, pensez donc à :
>
> - supprimer ou mettre à jour le cookie `theme-primary` (ex. via les outils développeur du navigateur) ;
> - ajuster la valeur appliquée au chargement via `useThemes` (`composables/useThemes.ts`).
>
> Tant que le cookie contient l'ancien rose (`#E91E63`), la variable `--primary` restera rose et `text-primary` suivra cette couleur.

## Espacements

Une échelle cohérente est exposée via `--v-space-n` (en rem) :

| Token     | Valeur    |
| --------- | --------- |
| `space-0` | `0rem`    |
| `space-1` | `0.25rem` |
| `space-2` | `0.5rem`  |
| `space-3` | `0.75rem` |
| `space-4` | `1rem`    |
| `space-5` | `1.5rem`  |
| `space-6` | `2rem`    |
| `space-7` | `2.5rem`  |
| `space-8` | `3rem`    |

Utilisez-les pour les marges et paddings : `padding: var(--v-space-4);`.

Des alias sont disponibles pour les composants UI :

| Variable         | Alias Vuetify      | Valeur par défaut |
| ---------------- | ------------------ | ----------------- |
| `--ui-spacing-0` | `var(--v-space-0)` | `0rem`            |
| `--ui-spacing-1` | `var(--v-space-1)` | `0.25rem`         |
| `--ui-spacing-2` | `var(--v-space-2)` | `0.5rem`          |
| `--ui-spacing-3` | `var(--v-space-3)` | `0.75rem`         |
| `--ui-spacing-4` | `var(--v-space-4)` | `1rem`            |
| `--ui-spacing-5` | `var(--v-space-5)` | `1.5rem`          |
| `--ui-spacing-6` | `var(--v-space-6)` | `2rem`            |
| `--ui-spacing-7` | `var(--v-space-7)` | `2.5rem`          |
| `--ui-spacing-8` | `var(--v-space-8)` | `3rem`            |

Des raccourcis (`--ui-spacing-xs`, `--ui-spacing-sm`, `--ui-spacing-md`, `--ui-spacing-lg`, `--ui-spacing-xl`) pointent respectivement vers `1`, `2`, `3`, `4` et `6`. Ils facilitent l'écriture de styles : `padding: var(--ui-spacing-lg);`.

## Rayons

Les rayons sont accessibles via `--v-radius-*` : `none`, `xs`, `sm`, `md`, `lg`, `xl`, `pill`. Exemple : `border-radius: var(--v-radius-md);`.

Pour simplifier la consommation des tokens dans nos composants, des alias globaux sont exposés dans `assets/styles/index.css` :

| Variable           | Alias Vuetify          | Usage                           |
| ------------------ | ---------------------- | ------------------------------- |
| `--ui-radius`      | `var(--v-radius-md)`   | Rayon par défaut des contrôles. |
| `--ui-radius-none` | `var(--v-radius-none)` | Rayon nul.                      |
| `--ui-radius-xs`   | `var(--v-radius-xs)`   | Très petits éléments.           |
| `--ui-radius-sm`   | `var(--v-radius-sm)`   | Inputs compacts.                |
| `--ui-radius-md`   | `var(--v-radius-md)`   | Rayon standard.                 |
| `--ui-radius-lg`   | `var(--v-radius-lg)`   | Cartes, modales.                |
| `--ui-radius-xl`   | `var(--v-radius-xl)`   | Surfaces généreuses.            |
| `--ui-radius-pill` | `var(--v-radius-pill)` | Boutons pill ou badges.         |

Utilisez ces variables pour garantir la cohérence même en dehors des composants Vuetify : `border-radius: var(--ui-radius);`.

Une ombre de focus harmonisée est également disponible via `--ui-focus` (`0 0 0 3px rgba(var(--v-theme-primary), 0.35))`.

## Typographie

- Police par défaut (`$body-font-family` / `var(--v-font-family-base)`) : pile système (`system-ui`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Helvetica Neue`, `Arial`, `sans-serif`).
- Police display (`var(--v-font-family-display)`) : identique à la pile système pour garantir un rendu cohérent sans chargement externe.
- Les fontes système sont utilisées par défaut et évitent tout aller-retour réseau critique au chargement initial.

### Échelle commune Vuetify ↔ Tailwind

Les tokens Vuetify sont repris tels quels côté Tailwind via des utilitaires (`text-h1`, `text-body-1`, etc.). Utilisez-les pour aligner tout le contenu typographique, quelle que soit la techno utilisée.

| Rôle             | Token Vuetify       | Classe Tailwind | Taille   | Line-height | Letter-spacing | Poids |
| ---------------- | ------------------- | --------------- | -------- | ----------- | -------------- | ----- |
| Affichage XL     | `--v-text-h1-*`     | `text-h1`       | 3.25rem  | 1.2         | -0.02em        | 600   |
| Affichage LG     | `--v-text-h2-*`     | `text-h2`       | 2.5rem   | 1.25        | -0.015em       | 600   |
| Affichage MD     | `--v-text-h3-*`     | `text-h3`       | 2rem     | 1.3         | -0.01em        | 600   |
| Affichage SM     | `--v-text-h4-*`     | `text-h4`       | 1.5rem   | 1.35        | -0.005em       | 600   |
| Affichage XS     | `--v-text-h5-*`     | `text-h5`       | 1.25rem  | 1.4         | -0.0025em      | 600   |
| Sur-titre        | `--v-text-h6-*`     | `text-h6`       | 1rem     | 1.45        | 0              | 600   |
| Corps            | `--v-text-body-1-*` | `text-body-1`   | 1rem     | 1.6         | 0              | 400   |
| Corps secondaire | `--v-text-body-2-*` | `text-body-2`   | 0.875rem | 1.6         | 0              | 400   |

Les variables `var(--v-text-*-letter-spacing)` et `var(--v-text-*-weight)` sont injectées dans la configuration Tailwind afin de rester synchronisées même si les valeurs évoluent dans le thème.

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
