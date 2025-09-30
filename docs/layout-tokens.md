# Layout Design Tokens

The BroWorld application shell uses a small set of design tokens to keep the new layout consistent across breakpoints.

> 📌 Consultez également la [Design System Styleguide](./design-system-styleguide.md) (`/styleguide`) pour visualiser l'implémentation concrète des composants et vérifier leur rendu aux différents breakpoints.

| Token              | Value                                                                                               | Notes                                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `--app-bar-height` | `72px`                                                                                              | Shared by the sticky top app bar and column offsets.                                                                            |
| `--pink-shadow`    | Light: `0px 20px 45px rgba(243, 126, 205, 0.28)` \\ Dark: `0px 16px 32px rgba(243, 126, 205, 0.18)` | Applied to sidebar and widget cards for the soft neumorphic glow. The layout switches automatically based on the Vuetify theme. |
| Card radius        | `24px`                                                                                              | Global rounding for navigation, widget, and drawer cards.                                                                       |
| Column gap         | `24px`                                                                                              | Gap between layout columns on desktop/tablet.                                                                                   |
| Horizontal padding | `clamp(16px, 3vw, 40px)`                                                                            | Responsive gutter padding for the shell container.                                                                              |

These values are controlled inside `layouts/default.vue` and reused by the sidebar and widget components through CSS variables.
