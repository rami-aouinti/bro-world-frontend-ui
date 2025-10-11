---
title: UI Kit
description: Usage guidelines for the reusable UI form controls.
---

## Overview

The reusable UI kit previously documented in this section has been removed from the codebase because none of the production pages depended on it. If you need tailored form controls, start from the standard Vuetify components used throughout the app (for example `v-text-field`, `v-textarea`, and `v-select`) and wrap them locally to match your requirements.

## Migration notes

- Replace `<BaseButton>` usages with native `<v-btn>` elements or inline `<button>` tags styled with Tailwind utilities.
- Swap `<BaseInput>`, `<BaseTextarea>`, `<BaseSelect>`, and related wrappers for the equivalent Vuetify form components.
- Remove any `FormField` imports—the layout and accessibility concerns are handled by the surrounding Vuetify components in existing pages.
- Delete references to `DeleteConfirmModal` and reuse the shared `AlertPanel` or build a lightweight dialog with `v-dialog` when confirmation flows are required.

With these adjustments, the application now depends solely on the components that ship with Vuetify or are explicitly used by live pages, keeping maintenance overhead low.
