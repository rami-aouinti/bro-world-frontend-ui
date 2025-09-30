<template>
  <v-container
    fluid
    class="ui-playground py-10"
  >
    <div class="ui-playground__header">
      <div class="ui-playground__intro">
        <h1 class="text-h4 font-weight-bold mb-2">{{ t("pages.playground.ui.title") }}</h1>
        <p class="text-body-1 text-medium-emphasis">{{ t("pages.playground.ui.description") }}</p>
      </div>
      <div class="ui-playground__actions">
        <BaseButton
          variant="tonal"
          size="sm"
          class="ui-playground__action"
          @click="expandAll"
        >
          {{ t("pages.playground.ui.controls.expandAll") }}
        </BaseButton>
        <BaseButton
          variant="tonal"
          size="sm"
          class="ui-playground__action"
          @click="collapseAll"
        >
          {{ t("pages.playground.ui.controls.collapseAll") }}
        </BaseButton>
      </div>
    </div>

    <v-card
      class="ui-playground__toolbar"
      rounded="lg"
      elevation="2"
    >
      <div class="ui-playground__toolbar-grid">
        <div class="ui-playground__toolbar-item">
          <span class="ui-playground__toolbar-label">{{
            t("pages.playground.ui.toggles.locale")
          }}</span>
          <v-btn-toggle
            v-model="selectedLocale"
            mandatory
            divided
          >
            <v-btn
              v-for="option in localeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </v-btn>
          </v-btn-toggle>
        </div>
        <div class="ui-playground__toolbar-item">
          <span class="ui-playground__toolbar-label">{{
            t("pages.playground.ui.toggles.direction")
          }}</span>
          <v-btn-toggle
            v-model="direction"
            mandatory
            divided
          >
            <v-btn value="ltr">{{ t("pages.playground.ui.directions.ltr") }}</v-btn>
            <v-btn value="rtl">{{ t("pages.playground.ui.directions.rtl") }}</v-btn>
          </v-btn-toggle>
        </div>
        <div class="ui-playground__toolbar-item">
          <span class="ui-playground__toolbar-label">{{
            t("pages.playground.ui.toggles.theme")
          }}</span>
          <v-btn-toggle
            v-model="themeMode"
            mandatory
            divided
          >
            <v-btn value="light">{{ t("pages.playground.ui.themes.light") }}</v-btn>
            <v-btn value="dark">{{ t("pages.playground.ui.themes.dark") }}</v-btn>
          </v-btn-toggle>
        </div>
        <div class="ui-playground__toolbar-item">
          <span class="ui-playground__toolbar-label">{{
            t("pages.playground.ui.toggles.density")
          }}</span>
          <v-btn-toggle
            v-model="activeSize"
            mandatory
            divided
          >
            <v-btn
              v-for="sizeOption in sizeOptions"
              :key="sizeOption"
              :value="sizeOption"
            >
              {{ t("pages.playground.ui.sizes." + sizeOption) }}
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </v-card>

    <v-expansion-panels
      v-model="expandedPanels"
      multiple
      class="ui-playground__panels"
    >
      <v-expansion-panel
        v-for="(group, groupIndex) in groups"
        :key="group.id"
        :value="groupIndex"
        elevation="1"
        rounded="lg"
        class="ui-playground__panel"
      >
        <v-expansion-panel-title
          expand-icon="mdi:chevron-down"
          collapse-icon="mdi:chevron-up"
        >
          <div class="ui-playground__panel-header">
            <div>
              <h2 class="text-h5 font-weight-semibold mb-1">{{ group.label }}</h2>
              <p class="text-body-2 text-medium-emphasis mb-0">{{ group.description }}</p>
            </div>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div
            v-for="section in group.sections"
            :key="section.id"
            class="ui-playground__section"
          >
            <div class="ui-playground__section-header">
              <h3 class="text-subtitle-1 font-weight-semibold mb-1">{{ section.label }}</h3>
              <p
                v-if="section.description"
                class="text-body-2 text-medium-emphasis mb-0"
              >
                {{ section.description }}
              </p>
            </div>
            <div class="ui-playground__examples">
              <article
                v-for="example in section.examples"
                :key="example.id"
                class="ui-playground__example"
              >
                <div class="ui-playground__example-header">
                  <span class="ui-playground__example-label">{{ example.label }}</span>
                  <code class="ui-playground__example-code">{{ formatExample(example) }}</code>
                  <p
                    v-if="example.notes"
                    class="ui-playground__example-notes text-caption"
                  >
                    {{ example.notes }}
                  </p>
                </div>
                <div class="ui-playground__example-preview">
                  <!-- Composant principal -->
                  <component
                    :is="componentRegistry[example.component]"
                    v-if="example.component"
                    v-bind="getExampleProps(example)"
                    :model-value="example.modelKey ? models[example.modelKey] : undefined"
                    @update:model-value="onUpdateModel(example.modelKey)"
                  >
                    <!-- Slots dynamiques de l'exemple -->
                    <template
                      v-for="(slotContent, slotName) in example.slots"
                      :key="slotName"
                      #[slotName]
                    >
                      <component
                        :is="componentRegistry[slotContent.component]"
                        v-if="isSlotComponentRef(slotContent)"
                        v-bind="slotProps(slotContent)"
                        :model-value="slotModelValue(slotContent)"
                        @update:model-value="onUpdateModel(slotContent.modelKey)"
                      />
                      <template v-else>{{ renderSlotContent(slotContent) }}</template>
                    </template>

                    <!-- Enfants -->
                    <template
                      v-if="example.children"
                      #default
                    >
                      <component
                        :is="componentRegistry[child.component]"
                        v-for="child in example.children"
                        :key="child.id"
                        v-bind="getExampleProps(child)"
                        :model-value="child.modelKey ? models[child.modelKey] : undefined"
                        @update:model-value="onUpdateModel(child.modelKey)"
                      >
                        <template
                          v-for="(slotContent, slotName) in child.slots"
                          :key="slotName"
                          #[slotName]
                        >
                          <component
                            :is="componentRegistry[slotContent.component]"
                            v-if="isSlotComponentRef(slotContent)"
                            v-bind="slotProps(slotContent)"
                            :model-value="slotModelValue(slotContent)"
                            @update:model-value="onUpdateModel(slotContent.modelKey)"
                          />
                          <template v-else>{{ renderSlotContent(slotContent) }}</template>
                        </template>
                      </component>
                    </template>

                    <!-- Slots par défaut alternatifs -->
                    <template
                      v-else-if="example.defaultSlot"
                      #default
                    >
                      {{ renderSlotContent(example.defaultSlot) }}
                    </template>
                    <template
                      v-else-if="
                        example.slots?.default && typeof example.slots.default === 'string'
                      "
                      #default
                    >
                      {{ example.slots.default }}
                    </template>
                  </component>

                  <!-- Rendu direct si pas de component -->
                  <component
                    :is="example.render"
                    v-else
                  />
                </div>
              </article>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </v-container>
</template>

<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
  type Component,
  type VNodeChild,
} from "vue";
import { createError, useHead } from "#imports";
import { useTheme } from "vuetify";

import BaseButton from "~/components/ui/BaseButton.vue";
import BaseCheckbox from "~/components/ui/BaseCheckbox.vue";
import BaseInput from "~/components/ui/BaseInput.vue";
import BaseRadioGroup from "~/components/ui/BaseRadioGroup.vue";
import BaseSelect from "~/components/ui/BaseSelect.vue";
import BaseSwitch from "~/components/ui/BaseSwitch.vue";
import BaseTextarea from "~/components/ui/BaseTextarea.vue";
import FormField from "~/components/ui/FormField.vue";

const { locale, t } = useI18n();
if (process.env.APP_ENV === "production") {
  throw createError({ statusCode: 404, statusMessage: "Not Found" });
}

definePageMeta({
  title: "ui-playground",
  breadcrumb: "disabled",
});

type ControlSize = "sm" | "md" | "lg";
const SUPPORTED_THEME_MODES = ["light", "dark"] as const;
type ThemeMode = (typeof SUPPORTED_THEME_MODES)[number];
type DirectionMode = "ltr" | "rtl";

const theme = useTheme();
const initialThemeName = SUPPORTED_THEME_MODES.includes(theme.global.name.value as ThemeMode)
  ? (theme.global.name.value as ThemeMode)
  : "light";
const themeMode = ref<ThemeMode>(initialThemeName);

const componentRegistry = {
  BaseButton,
  BaseCheckbox,
  BaseInput,
  BaseRadioGroup,
  BaseSelect,
  BaseSwitch,
  BaseTextarea,
  FormField,
} as const;

type ComponentName = keyof typeof componentRegistry;

const componentsWithSizeProp: ComponentName[] = [
  "BaseButton",
  "BaseInput",
  "BaseTextarea",
  "BaseSelect",
  "BaseRadioGroup",
];

interface SlotComponentReference {
  component: ComponentName;
  props?: Record<string, unknown>;
  modelKey?: string;
}

type SlotContent = string | number | (() => VNodeChild) | SlotComponentReference;

interface PlaygroundExample {
  id: string;
  label: string;
  component?: ComponentName;
  props?: Record<string, unknown>;
  modelKey?: string;
  slots?: Record<string, SlotContent>;
  notes?: string;
  captionOverride?: string;
  children?: PlaygroundExample[];
  render?: Component;
  defaultSlot?: () => VNodeChild;
}

interface PlaygroundSection {
  id: string;
  label: string;
  description?: string;
  examples: PlaygroundExample[];
}

interface PlaygroundGroup {
  id: string;
  label: string;
  description: string;
  sections: PlaygroundSection[];
}

const sizeOptions: ControlSize[] = ["sm", "md", "lg"];
const buttonVariants = ["filled", "tonal", "outline", "text", "plain"] as const;

const initialLocale = locale.value;
const localeOptions = computed(() => [
  {
    value: "en",
    label: t("pages.playground.ui.locales.en"),
  },
  {
    value: "ar",
    label: t("pages.playground.ui.locales.ar"),
  },
]);

const selectedLocale = ref(
  localeOptions.value.some((option) => option.value === locale.value) ? locale.value : "en",
);

const initialDirection = ref<DirectionMode>("ltr");
const direction = ref<DirectionMode>("ltr");

onMounted(() => {
  const docDirection = document.documentElement.getAttribute("dir") as DirectionMode | null;
  initialDirection.value = docDirection ?? "ltr";
  direction.value = docDirection ?? "ltr";
});

watch(
  themeMode,
  (value) => {
    theme.global.name.value = value;
    if (import.meta.client) {
      document.documentElement.classList.toggle("theme--dark", value === "dark");
    }
  },
  { immediate: true },
);

watch(direction, (value) => {
  if (!import.meta.client) return;
  document.documentElement.setAttribute("dir", value);
});

watch(selectedLocale, (value) => {
  locale.value = value;
  const defaultDirection = value === "ar" ? "rtl" : "ltr";
  direction.value = defaultDirection;
});

useHead(() => ({
  htmlAttrs: {
    dir: direction.value,
  },
}));

onBeforeUnmount(() => {
  if (import.meta.client) {
    document.documentElement.setAttribute("dir", initialDirection.value);
    document.documentElement.classList.toggle("theme--dark", initialThemeName === "dark");
  }
  theme.global.name.value = initialThemeName;
  locale.value = initialLocale;
});

const models = reactive<Record<string, unknown>>({
  "input-text": t("pages.playground.ui.sample.textValue"),
  "input-email": "qa@example.com",
  "input-password": "Secret123!",
  "input-number": 42,
  "input-search": "",
  "input-url": "https://bro.world",
  "input-error": "",
  "input-success": "Looks good!",
  "textarea-default": t("pages.playground.ui.sample.multiline"),
  "textarea-autogrow": t("pages.playground.ui.sample.longerText"),
  "checkbox-default": true,
  "checkbox-indeterminate": false,
  "checkbox-disabled": false,
  "switch-default": true,
  "switch-disabled": false,
  "select-single": "email",
  "select-multiple": ["figma", "slack"],
  "select-disabled-option": "beta",
  "radio-vertical": "weekly",
  "radio-horizontal": "card",
});

const activeSize = ref<ControlSize>("md");

const buttonVariantExamples = computed<PlaygroundExample[]>(() => {
  const examples: PlaygroundExample[] = [];
  for (const variant of buttonVariants) {
    for (const size of sizeOptions) {
      examples.push({
        id: `button-${variant}-${size}`,
        label: `${t(`pages.playground.ui.variants.${variant}`)} · ${t(`pages.playground.ui.sizes.${size}`)}`,
        component: "BaseButton",
        props: {
          variant,
          size,
          ariaLabel: t("pages.playground.ui.examples.buttonLabel"),
        },
        slots: {
          default: t("pages.playground.ui.examples.buttonLabel"),
        },
      });
    }
  }
  return examples;
});

const buttonStateExamples = computed<PlaygroundExample[]>(() => [
  {
    id: "button-state-default",
    label: t("pages.playground.ui.states.default"),
    component: "BaseButton",
    props: {
      variant: "filled",
      size: activeSize.value,
    },
    slots: {
      default: t("pages.playground.ui.examples.buttonLabel"),
    },
  },
  {
    id: "button-state-disabled",
    label: t("pages.playground.ui.states.disabled"),
    component: "BaseButton",
    props: {
      variant: "tonal",
      size: activeSize.value,
      disabled: true,
    },
    slots: {
      default: t("pages.playground.ui.examples.buttonLabel"),
    },
  },
  {
    id: "button-state-loading",
    label: t("pages.playground.ui.states.loading"),
    component: "BaseButton",
    props: {
      variant: "outline",
      size: activeSize.value,
      loading: true,
    },
    slots: {
      default: t("pages.playground.ui.examples.loading"),
    },
  },
  {
    id: "button-state-leading",
    label: t("pages.playground.ui.states.leadingIcon"),
    component: "BaseButton",
    props: {
      variant: "filled",
      size: activeSize.value,
      icon: "mdi:lightning-bolt",
    },
    slots: {
      default: t("pages.playground.ui.examples.primaryAction"),
    },
  },
  {
    id: "button-state-trailing",
    label: t("pages.playground.ui.states.trailingIcon"),
    component: "BaseButton",
    props: {
      variant: "text",
      size: activeSize.value,
      trailingIcon: "mdi:arrow-right",
    },
    slots: {
      default: t("pages.playground.ui.examples.secondaryAction"),
    },
  },
  {
    id: "button-state-block",
    label: t("pages.playground.ui.states.block"),
    component: "BaseButton",
    props: {
      variant: "plain",
      size: activeSize.value,
      block: true,
    },
    slots: {
      default: t("pages.playground.ui.examples.fullWidth"),
    },
  },
]);

const inputTypeExamples = computed<PlaygroundExample[]>(() => {
  const types: Array<{ type: string; key: string }> = [
    { type: "text", key: "input-text" },
    { type: "email", key: "input-email" },
    { type: "password", key: "input-password" },
    { type: "number", key: "input-number" },
    { type: "search", key: "input-search" },
    { type: "url", key: "input-url" },
  ];

  return types.map((item) => ({
    id: `input-${item.type}`,
    label: t("pages.playground.ui.examples.inputType", {
      type: t(`pages.playground.ui.inputTypes.${item.type}`),
    }),
    component: "BaseInput",
    modelKey: item.key,
    props: {
      type: item.type,
      placeholder: t("pages.playground.ui.placeholders.generic"),
      size: activeSize.value,
      clearable: item.type !== "password",
      autocomplete: item.type === "password" ? "current-password" : undefined,
    },
  }));
});

const inputStateExamples = computed<PlaygroundExample[]>(() => [
  {
    id: "input-state-focus",
    label: t("pages.playground.ui.states.focus"),
    component: "BaseInput",
    modelKey: "input-text",
    props: {
      size: activeSize.value,
      autofocus: true,
      placeholder: t("pages.playground.ui.placeholders.focus"),
    },
    notes: t("pages.playground.ui.notes.autofocus"),
  },
  {
    id: "input-state-error",
    label: t("pages.playground.ui.states.error"),
    component: "BaseInput",
    modelKey: "input-error",
    props: {
      size: activeSize.value,
      error: true,
      errorMessages: [t("pages.playground.ui.feedback.error")],
      placeholder: t("pages.playground.ui.placeholders.error"),
    },
  },
  {
    id: "input-state-success",
    label: t("pages.playground.ui.states.success"),
    component: "BaseInput",
    modelKey: "input-success",
    props: {
      size: activeSize.value,
      success: true,
      placeholder: t("pages.playground.ui.placeholders.success"),
    },
  },
  {
    id: "input-state-disabled",
    label: t("pages.playground.ui.states.disabled"),
    component: "BaseInput",
    props: {
      size: activeSize.value,
      modelValue: t("pages.playground.ui.examples.disabledValue"),
      disabled: true,
    },
  },
]);

const textareaExamples = computed<PlaygroundExample[]>(() => [
  {
    id: "textarea-default",
    label: t("pages.playground.ui.examples.textareaDefault"),
    component: "BaseTextarea",
    modelKey: "textarea-default",
    props: {
      rows: 4,
      size: activeSize.value,
      hint: t("pages.playground.ui.hints.characterLimit"),
    },
  },
  {
    id: "textarea-autogrow",
    label: t("pages.playground.ui.examples.textareaAutoGrow"),
    component: "BaseTextarea",
    modelKey: "textarea-autogrow",
    props: {
      autoGrow: true,
      size: activeSize.value,
      placeholder: t("pages.playground.ui.placeholders.autogrow"),
    },
  },
  {
    id: "textarea-disabled",
    label: t("pages.playground.ui.states.disabled"),
    component: "BaseTextarea",
    props: {
      size: activeSize.value,
      rows: 3,
      modelValue: t("pages.playground.ui.examples.disabledValue"),
      disabled: true,
    },
  },
]);

const checkboxExamples = computed<PlaygroundExample[]>(() => [
  {
    id: "checkbox-default",
    label: t("pages.playground.ui.states.checked"),
    component: "BaseCheckbox",
    modelKey: "checkbox-default",
    props: {
      label: t("pages.playground.ui.examples.checkboxPrimary"),
      hint: t("pages.playground.ui.hints.checkbox"),
      required: true,
    },
  },
  {
    id: "checkbox-indeterminate",
    label: t("pages.playground.ui.states.indeterminate"),
    component: "BaseCheckbox",
    modelKey: "checkbox-indeterminate",
    props: {
      label: t("pages.playground.ui.examples.checkboxIndeterminate"),
      indeterminate: true,
    },
  },
  {
    id: "checkbox-disabled",
    label: t("pages.playground.ui.states.disabled"),
    component: "BaseCheckbox",
    modelKey: "checkbox-disabled",
    props: {
      label: t("pages.playground.ui.examples.checkboxDisabled"),
      disabled: true,
    },
  },
]);

const switchExamples = computed<PlaygroundExample[]>(() => [
  {
    id: "switch-default",
    label: t("pages.playground.ui.states.checked"),
    component: "BaseSwitch",
    modelKey: "switch-default",
    props: {
      label: t("pages.playground.ui.examples.switchNotifications"),
      hint: t("pages.playground.ui.hints.switch"),
    },
  },
  {
    id: "switch-disabled",
    label: t("pages.playground.ui.states.disabled"),
    component: "BaseSwitch",
    modelKey: "switch-disabled",
    props: {
      label: t("pages.playground.ui.examples.switchDisabled"),
      disabled: true,
    },
  },
]);

const selectExamples = computed<PlaygroundExample[]>(() => [
  {
    id: "select-single",
    label: t("pages.playground.ui.examples.selectSingle"),
    component: "BaseSelect",
    modelKey: "select-single",
    props: {
      size: activeSize.value,
      items: [
        { label: t("pages.playground.ui.selectOptions.email"), value: "email" },
        { label: t("pages.playground.ui.selectOptions.sms"), value: "sms" },
        { label: t("pages.playground.ui.selectOptions.push"), value: "push" },
      ],
      placeholder: t("pages.playground.ui.placeholders.select"),
      clearable: true,
    },
  },
  {
    id: "select-multiple",
    label: t("pages.playground.ui.examples.selectMultiple"),
    component: "BaseSelect",
    modelKey: "select-multiple",
    props: {
      size: activeSize.value,
      multiple: true,
      clearable: true,
      items: [
        { label: "Figma", value: "figma" },
        { label: "Slack", value: "slack" },
        { label: "Linear", value: "linear" },
        { label: "GitHub", value: "github" },
      ],
      placeholder: t("pages.playground.ui.placeholders.selectMultiple"),
    },
  },
  {
    id: "select-disabled-option",
    label: t("pages.playground.ui.examples.selectDisabledOptions"),
    component: "BaseSelect",
    modelKey: "select-disabled-option",
    props: {
      size: activeSize.value,
      items: [
        { label: t("pages.playground.ui.selectOptions.alpha"), value: "alpha", disabled: true },
        { label: t("pages.playground.ui.selectOptions.beta"), value: "beta" },
        { label: t("pages.playground.ui.selectOptions.release"), value: "release" },
      ],
      hint: t("pages.playground.ui.hints.disabledOption"),
    },
  },
]);

const radioExamples = computed<PlaygroundExample[]>(() => [
  {
    id: "radio-vertical",
    label: t("pages.playground.ui.examples.radioVertical"),
    component: "BaseRadioGroup",
    modelKey: "radio-vertical",
    props: {
      size: activeSize.value,
      direction: "vertical",
      options: [
        { label: t("pages.playground.ui.radioOptions.daily"), value: "daily" },
        { label: t("pages.playground.ui.radioOptions.weekly"), value: "weekly" },
        { label: t("pages.playground.ui.radioOptions.monthly"), value: "monthly" },
      ],
      hint: t("pages.playground.ui.hints.radio"),
    },
  },
  {
    id: "radio-horizontal",
    label: t("pages.playground.ui.examples.radioHorizontal"),
    component: "BaseRadioGroup",
    modelKey: "radio-horizontal",
    props: {
      size: activeSize.value,
      direction: "horizontal",
      options: [
        { label: t("pages.playground.ui.radioOptions.card"), value: "card" },
        { label: t("pages.playground.ui.radioOptions.paypal"), value: "paypal" },
        { label: t("pages.playground.ui.radioOptions.bank"), value: "bank", disabled: true },
      ],
      error: true,
      errorMessages: [t("pages.playground.ui.feedback.selectMethod")],
    },
    notes: t("pages.playground.ui.notes.disabledChoice"),
  },
]);

const formFieldExamples = computed<PlaygroundExample[]>(() => [
  {
    id: "form-field-basic",
    label: t("pages.playground.ui.examples.formFieldBasic"),
    component: "FormField",
    props: {
      label: t("pages.playground.ui.labels.fullName"),
      hint: t("pages.playground.ui.hints.required"),
      required: true,
    },
    children: [
      {
        id: "form-field-basic-input",
        label: "",
        component: "BaseInput",
        modelKey: "input-text",
        props: {
          size: activeSize.value,
          placeholder: t("pages.playground.ui.placeholders.fullName"),
        },
      },
    ],
  },
  {
    id: "form-field-error",
    label: t("pages.playground.ui.examples.formFieldError"),
    component: "FormField",
    props: {
      label: t("pages.playground.ui.labels.email"),
      error: true,
      errorMessages: [t("pages.playground.ui.feedback.invalidEmail")],
    },
    children: [
      {
        id: "form-field-error-input",
        label: "",
        component: "BaseInput",
        modelKey: "input-email",
        props: {
          size: activeSize.value,
          type: "email",
          placeholder: "qa@example.com",
        },
      },
    ],
  },
  {
    id: "form-field-checkbox",
    label: t("pages.playground.ui.examples.formFieldCheckbox"),
    component: "FormField",
    props: {
      label: t("pages.playground.ui.labels.preferences"),
      hint: t("pages.playground.ui.hints.checkbox"),
    },
    children: [
      {
        id: "form-field-checkbox-control",
        label: "",
        component: "BaseCheckbox",
        modelKey: "checkbox-default",
        props: {
          label: t("pages.playground.ui.examples.checkboxPrimary"),
        },
      },
    ],
  },
]);

const groups = computed<PlaygroundGroup[]>(() => [
  {
    id: "buttons",
    label: t("pages.playground.ui.groups.buttons.title"),
    description: t("pages.playground.ui.groups.buttons.description"),
    sections: [
      {
        id: "button-variants",
        label: t("pages.playground.ui.sections.buttonVariants"),
        description: t("pages.playground.ui.sections.buttonVariantsDescription"),
        examples: buttonVariantExamples.value,
      },
      {
        id: "button-states",
        label: t("pages.playground.ui.sections.buttonStates"),
        description: t("pages.playground.ui.sections.buttonStatesDescription"),
        examples: buttonStateExamples.value,
      },
    ],
  },
  {
    id: "inputs",
    label: t("pages.playground.ui.groups.inputs.title"),
    description: t("pages.playground.ui.groups.inputs.description"),
    sections: [
      {
        id: "input-types",
        label: t("pages.playground.ui.sections.inputTypes"),
        description: t("pages.playground.ui.sections.inputTypesDescription"),
        examples: inputTypeExamples.value,
      },
      {
        id: "input-states",
        label: t("pages.playground.ui.sections.inputStates"),
        description: t("pages.playground.ui.sections.inputStatesDescription"),
        examples: inputStateExamples.value,
      },
      {
        id: "textarea",
        label: t("pages.playground.ui.sections.textareaStates"),
        description: t("pages.playground.ui.sections.textareaStatesDescription"),
        examples: textareaExamples.value,
      },
    ],
  },
  {
    id: "toggles",
    label: t("pages.playground.ui.groups.toggles.title"),
    description: t("pages.playground.ui.groups.toggles.description"),
    sections: [
      {
        id: "checkboxes",
        label: t("pages.playground.ui.sections.checkboxes"),
        description: t("pages.playground.ui.sections.checkboxesDescription"),
        examples: checkboxExamples.value,
      },
      {
        id: "switches",
        label: t("pages.playground.ui.sections.switches"),
        description: t("pages.playground.ui.sections.switchesDescription"),
        examples: switchExamples.value,
      },
    ],
  },
  {
    id: "selectors",
    label: t("pages.playground.ui.groups.selectors.title"),
    description: t("pages.playground.ui.groups.selectors.description"),
    sections: [
      {
        id: "selects",
        label: t("pages.playground.ui.sections.selects"),
        description: t("pages.playground.ui.sections.selectsDescription"),
        examples: selectExamples.value,
      },
      {
        id: "radios",
        label: t("pages.playground.ui.sections.radios"),
        description: t("pages.playground.ui.sections.radiosDescription"),
        examples: radioExamples.value,
      },
    ],
  },
  {
    id: "wrappers",
    label: t("pages.playground.ui.groups.wrappers.title"),
    description: t("pages.playground.ui.groups.wrappers.description"),
    sections: [
      {
        id: "form-field",
        label: t("pages.playground.ui.sections.formFields"),
        description: t("pages.playground.ui.sections.formFieldsDescription"),
        examples: formFieldExamples.value,
      },
    ],
  },
]);

const expandedPanels = ref<number[]>([]);

watch(
  () => groups.value.length,
  (length) => {
    expandedPanels.value = Array.from({ length }, (_, index) => index);
  },
  { immediate: true },
);

function expandAll() {
  expandedPanels.value = Array.from({ length: groups.value.length }, (_, index) => index);
}

function collapseAll() {
  expandedPanels.value = [];
}

function updateModel(key: string, value: unknown) {
  models[key] = value;
}

function formatExample(example: PlaygroundExample) {
  if (example.captionOverride) return example.captionOverride;
  if (!example.component) return "";
  const props: Record<string, unknown> & { "v-model"?: string } = {
    ...(example.props ?? {}),
  };

  if (example.modelKey) {
    props["v-model"] = example.modelKey;
  }

  const entries = Object.entries(props).filter(
    ([, value]) => value !== undefined && value !== false,
  );
  const propList = entries
    .map(([key, value]) => {
      if (key === "v-model") {
        return "v-model";
      }
      if (typeof value === "string") {
        return `${key}="${value.replace(/"/g, "&quot;")}"`;
      }
      if (typeof value === "boolean") {
        return value ? key : "";
      }
      return `${key}='${JSON.stringify(value)}'`;
    })
    .filter(Boolean)
    .join(" ");

  return `<${example.component}${propList ? ` ${propList}` : ""} />`;
}

function getExampleProps(example: PlaygroundExample) {
  const props: Record<string, unknown> = { ...(example.props ?? {}) };

  if (example.component && componentsWithSizeProp.includes(example.component)) {
    props.size = props.size ?? activeSize.value;
  }

  return props;
}

function renderSlotContent(content: SlotContent | undefined): VNodeChild {
  if (typeof content === "function") {
    return content();
  }
  if (typeof content === "string" || typeof content === "number") {
    return content;
  }
  return "";
}

/** ===== Helpers sans TS dans le template ===== */

function isSlotComponentRef(x: unknown): x is SlotComponentReference {
  if (!x || typeof x !== "object") {
    return false;
  }

  const candidate = x as Record<string, unknown>;
  return "component" in candidate && typeof candidate.component === "string";
}

function slotProps(x: SlotComponentReference | undefined) {
  return x?.props ?? {};
}

function slotModelValue(x: SlotComponentReference | undefined) {
  return x?.modelKey ? models[x.modelKey] : undefined;
}

function onUpdateModel(key?: string) {
  return key ? (v: unknown) => updateModel(key, v) : undefined;
}
</script>

<style scoped>
.ui-playground {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.ui-playground__header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.ui-playground__intro {
  max-width: 600px;
}

.ui-playground__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ui-playground__toolbar {
  padding: 1.5rem;
}

.ui-playground__toolbar-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.ui-playground__toolbar-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ui-playground__toolbar-label {
  font-weight: 600;
  font-size: 0.875rem;
  color: rgb(var(--v-theme-on-surface-variant));
}

.ui-playground__panels {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ui-playground__panel {
  border-radius: 1rem;
}

.ui-playground__panel-header {
  display: flex;
  justify-content: space-between;
  width: 100%;
}

.ui-playground__section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-block: 1rem 2rem;
}

.ui-playground__section-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ui-playground__examples {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.ui-playground__example {
  background: rgb(var(--v-theme-surface-variant), 0.2);
  border: 1px solid rgba(var(--v-border-color), 0.2);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.ui-playground__example-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.ui-playground__example-label {
  font-weight: 600;
  font-size: 0.9rem;
}

.ui-playground__example-code {
  font-family:
    "JetBrains Mono", ui-monospace, SFMono-Regular, SFMono-Regular, Menlo, Monaco, Consolas,
    "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: rgba(var(--v-theme-surface-variant), 0.35);
  border-radius: 0.5rem;
  word-break: break-all;
}

.ui-playground__example-notes {
  color: rgb(var(--v-theme-on-surface-variant));
  margin: 0;
}

.ui-playground__example-preview {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 0.75rem;
}

@media (max-width: 600px) {
  .ui-playground {
    padding-inline: 0.5rem;
  }

  .ui-playground__toolbar {
    padding: 1rem;
  }
}
</style>
