---
title: UI Kit
description: Usage guidelines for the reusable UI form controls.
---

## Overview

The UI kit under `components/ui` provides accessible, theme-aware building blocks for forms. Each component wraps Vuetify primitives and integrates tightly with `FormField.vue`, ensuring labels, hints and error messaging are wired automatically. All components support `v-model` and expose consistent events: `update:modelValue`, `focus`, `blur`, and `change`. Validation state is controlled by passing `error`, `errorMessages`, `success`, and `hint` props from parent logic (VeeValidate, zod, etc.).

## FormField Wrapper

Use `<FormField>` to render labels, hints and inline error messages. When a control is placed in the default slot, `FormField` provides generated `id`, `aria-labelledby`, and `aria-describedby` attributes, so controls do not need manual wiring.

```vue
<FormField :label="$t('form.email')" :error="Boolean(errors.email)" :error-messages="errors.email">
  <BaseInput v-model="form.email" type="email" autocomplete="email" />
</FormField>
```

## Buttons

`BaseButton` mirrors Vuetify variants (`filled`, `tonal`, `outline`, `text`, `plain`) and sizes (`sm`, `md`, `lg`). Loading state disables clicks and shows an indeterminate spinner. Icons can be provided via `icon`, `trailingIcon`, or the `icon`/`trailing` slots.

```vue
<BaseButton type="submit" variant="tonal" :loading="isSubmitting">
  {{ $t('common.save') }}
</BaseButton>
```

## Text Inputs & Textareas

`BaseInput` and `BaseTextarea` inherit label and error context from `FormField`. They expose `prefix`/`suffix` props, `prepend`/`append` slots, `clearable`, and an adaptive `size`. Textareas support `autoGrow` and `rows` props.

```vue
<FormField :label="$t('form.bio')" :hint="$t('form.optional')">
  <BaseTextarea v-model="form.bio" auto-grow />
</FormField>
```

## Checkbox, Switch, and Radio Group

Toggle controls display inline labels and hints, and respect keyboard activation (space/enter). `BaseRadioGroup` supports horizontal or vertical layouts, option hints, and arrow-key navigation.

```vue
<FormField :label="$t('form.plan')">
  <BaseRadioGroup v-model="form.plan" :options="planOptions" direction="horizontal" />
</FormField>
```

## Select

`BaseSelect` supports single or multiple selection, optional chips, and `clearable`. Items accept `{ label, value, disabled }` objects. Clearing emits `clear` and resets the model to `null` (single) or `[]` (multiple).

```vue
<FormField :label="$t('form.languages')">
  <BaseSelect v-model="form.languages" :items="languageItems" multiple clearable />
</FormField>
```

## Validation & i18n

Validation errors are surfaced by passing translated strings from parent logic to `errorMessages`. Because components do not render hard-coded copy, they work seamlessly with Nuxt i18n. Focus states and spacing derive from Vuetify design tokens and adapt to dark/light themes automatically.

## Modals

`BaseModal` wraps Vuetify's dialog with a consistent header, body padding, and primary/secondary footer actions. The component exposes a `primaryLabel` prop (`Save` by default) and emits `primary` along with `close` when the user dismisses the modal via the Close button, overlay, or the <kbd>Esc</kbd> key. Slots for `title`, default content, and `footer` enable form layouts or fully custom actions.

```vue
<BaseModal
  v-model="isEditing"
  title="Edit profile"
  primary-label="Update"
  :loading="isSaving"
  @primary="onSave"
>
  <FormField label="Display name">
    <BaseInput v-model="form.name" />
  </FormField>
</BaseModal>
```

`DeleteConfirmModal` builds on `BaseModal` to provide a lightweight destructive confirmation with Cancel/Delete actions. It emits `confirm`, `cancel`, and forwards `update:modelValue` when closed so parent components can handle removal logic or analytics hooks.

```vue
<DeleteConfirmModal
  v-model="showDelete"
  title="Delete post?"
  message="This action cannot be undone."
  @confirm="removePost"
  @cancel="showDelete = false"
/>
```

## Testing & Stories

Unit tests live in `components/ui/tests` and cover v-model, accessibility wiring, disabled interactions, and keyboard navigation. Playground stories under `components/ui/stories` provide interactive examples for designers and developers.
