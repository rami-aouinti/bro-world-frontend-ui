import type { VDataTable } from "vuetify/components";
import {
  VAlert,
  VApp,
  VAppBar,
  VAvatar,
  VBadge,
  VBtn,
  VBtnToggle,
  VCard,
  VCardActions,
  VCardItem,
  VCardSubtitle,
  VCardText,
  VCardTitle,
  VCheckbox,
  VChip,
  VChipGroup,
  VCombobox,
  VCol,
  VContainer,
  VDataTable as VDataTableComponent,
  VDialog,
  VDivider,
  VExpansionPanel,
  VExpansionPanelText,
  VExpansionPanelTitle,
  VExpansionPanels,
  VForm,
  VHover,
  VIcon,
  VItem,
  VItemGroup,
  VImg,
  VList,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VListSubheader,
  VMain,
  VMenu,
  VNavigationDrawer,
  VOverlay,
  VPagination,
  VProgressCircular,
  VProgressLinear,
  VRangeSlider,
  VRadio,
  VRadioGroup,
  VRating,
  VRow,
  VSlider,
  VSelect,
  VSheet,
  VSkeletonLoader,
  VSnackbar,
  VStepper,
  VStepperHeader,
  VStepperItem,
  VStepperWindow,
  VStepperWindowItem,
  VSpacer,
  VTable,
  VSwitch,
  VTextField,
  VTextarea,
  VTimeline,
  VTimelineItem,
  VToolbar,
  VTooltip,
} from "vuetify/components";
import { defineComponent, h } from "vue";
import { Ripple } from "vuetify/directives";
import { VCalendar } from "vuetify/labs/VCalendar";
import { VDateInput } from "vuetify/labs/VDateInput";
import { createVuetify } from "vuetify";
import { ar, de, en, es, fr, it, ru } from "vuetify/locale";
import { aliases } from "vuetify/iconsets/mdi-svg";
import { VSvgIcon, makeIconProps, type IconValue } from "vuetify/lib/composables/icons";
import { normalizeHexColor } from "~/lib/theme/colors";
import { projectMdiIcons } from "~/lib/vuetify/projectMdiIcons";
import DateFnsAdapter from "@date-io/date-fns";
import enUSLocale from "date-fns/locale/en-US";
import frLocale from "date-fns/locale/fr";
import deLocale from "date-fns/locale/de";
import itLocale from "date-fns/locale/it";
import esLocale from "date-fns/locale/es";
import ruLocale from "date-fns/locale/ru";
import arLocale from "date-fns/locale/ar-SA";
import { withSecureCookieOptions } from "~/lib/cookies";
import { ensureVuetifyLoading } from "~/lib/vuetify/loading";

function withSvgPrefix(path: string): string {
  return path.startsWith("svg:") ? path : `svg:${path}`;
}

function createMdiAliasVariants(iconMap: Record<string, string>) {
  const extendedAliases = { ...iconMap };

  for (const [name, value] of Object.entries(iconMap)) {
    if (name.startsWith("mdi-")) {
      const colonName = `mdi:${name.slice(4)}`;

      if (!(colonName in extendedAliases)) {
        extendedAliases[colonName] = value;
      }
    }

    if (name.startsWith("mdi:")) {
      const hyphenName = `mdi-${name.slice(4)}`;

      if (!(hyphenName in extendedAliases)) {
        extendedAliases[hyphenName] = value;
      }
    }
  }

  return extendedAliases;
}

const projectMdiAliasEntries = Object.fromEntries(
  Object.entries(projectMdiIcons).map(([name, value]) => [name, withSvgPrefix(value)]),
);

const minimalAliases = createMdiAliasVariants({
  ...aliases,
  ...projectMdiAliasEntries,
});

function stripSvgPrefix(value: string): string {
  return value.startsWith("svg:") ? value.slice(4) : value;
}

function resolveMdiIconValue(value: IconValue): IconValue {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim();

  if (!normalized) {
    return normalized;
  }

  const lookupKeys = new Set<string>([normalized]);

  if (normalized.startsWith("mdi:")) {
    const suffix = normalized.slice(4);
    lookupKeys.add(`mdi-${suffix}`);
    lookupKeys.add(suffix);
  } else if (normalized.startsWith("mdi-")) {
    const suffix = normalized.slice(4);
    lookupKeys.add(`mdi:${suffix}`);
    lookupKeys.add(suffix);
  } else {
    lookupKeys.add(`mdi:${normalized}`);
    lookupKeys.add(`mdi-${normalized}`);
  }

  for (const key of lookupKeys) {
    const alias = minimalAliases[key];

    if (alias == null) {
      continue;
    }

    if (typeof alias === "string") {
      return stripSvgPrefix(alias);
    }

    if (Array.isArray(alias)) {
      return alias.map((entry) =>
        Array.isArray(entry) ? [stripSvgPrefix(entry[0]), entry[1]] : stripSvgPrefix(entry),
      );
    }

    return alias;
  }

  return stripSvgPrefix(normalized);
}

const MdiSvgIcon = defineComponent({
  name: "AppMdiSvgIcon",
  props: makeIconProps(),
  setup(props, { attrs, slots }) {
    return () =>
      h(
        VSvgIcon,
        {
          ...attrs,
          tag: props.tag,
          icon: resolveMdiIconValue(props.icon ?? ""),
        },
        slots,
      );
  },
});

const vuetifyLocaleMessages = {
  en,
  fr,
  de,
  ar,
  it,
  es,
  ru,
} as const;

const normalizedVuetifyLocaleMessages = Object.fromEntries(
  Object.entries(vuetifyLocaleMessages).map(([code, messages]) => [
    code,
    {
      ...messages,
      loading: ensureVuetifyLoading(code, (messages as { loading?: unknown }).loading),
    },
  ]),
) as typeof vuetifyLocaleMessages;

export type DataTableHeaders = VDataTable["$props"]["headers"];

const FALLBACK_PRIMARY_HEX = "#091b2d";

export default defineNuxtPlugin((nuxtApp) => {
  const primaryCookie = useCookie<string | null>(
    "theme-primary",
    withSecureCookieOptions({
      sameSite: "lax",
      watch: false,
    }),
  );
  const primary = normalizeHexColor(primaryCookie.value ?? undefined) ?? FALLBACK_PRIMARY_HEX;

  const localeCookie = useCookie<string | null>(
    "i18n_redirected",
    withSecureCookieOptions({
      sameSite: "lax",
      watch: false,
    }),
  );
  const localeCookieValue = localeCookie.value ?? "en";
  const rtlLocaleCodes = ["ar"] as const;
  const rtlLocaleMap = Object.fromEntries(
    rtlLocaleCodes.map((code) => [code, true] as const),
  ) as Record<string, boolean>;
  const i18n = nuxtApp.$i18n as { locale?: { value?: string | undefined } } | undefined;
  const initialLocale = i18n?.locale?.value ?? localeCookieValue;

  const sharedVariables = {
    "font-family-base":
      "'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    "font-family-display":
      "'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
    "font-size-root": "16px",
    "line-height-base": 1.5,
    "text-h1-size": "3.25rem",
    "text-h1-line-height": 1.2,
    "text-h1-letter-spacing": "-0.02em",
    "text-h1-weight": 600,
    "text-h2-size": "2.5rem",
    "text-h2-line-height": 1.25,
    "text-h2-letter-spacing": "-0.015em",
    "text-h2-weight": 600,
    "text-h3-size": "2rem",
    "text-h3-line-height": 1.3,
    "text-h3-letter-spacing": "-0.01em",
    "text-h3-weight": 600,
    "text-h4-size": "1.5rem",
    "text-h4-line-height": 1.35,
    "text-h4-letter-spacing": "-0.005em",
    "text-h4-weight": 600,
    "text-h5-size": "1.25rem",
    "text-h5-line-height": 1.4,
    "text-h5-letter-spacing": "-0.0025em",
    "text-h5-weight": 600,
    "text-h6-size": "1rem",
    "text-h6-line-height": 1.45,
    "text-h6-letter-spacing": "0",
    "text-h6-weight": 600,
    "text-body-1-size": "1rem",
    "text-body-1-line-height": 1.6,
    "text-body-2-size": "0.875rem",
    "text-body-2-line-height": 1.6,
    "btn-letter-spacing": "0.02em",
    "btn-height": "2.75rem",
    "btn-padding-x": "var(--v-space-4)",
    "input-font-size": "0.9375rem",
    "input-line-height": 1.4,
    "input-min-height": "2.75rem",
    "field-border-radius": "var(--v-radius-md)",
    "space-0": "0rem",
    "space-1": "0.25rem",
    "space-2": "0.5rem",
    "space-3": "0.75rem",
    "space-4": "1rem",
    "space-5": "1.5rem",
    "space-6": "2rem",
    "space-7": "2.5rem",
    "space-8": "3rem",
    "radius-none": "0",
    "radius-xs": "0.125rem",
    "radius-sm": "0.25rem",
    "radius-md": "0.5rem",
    "radius-lg": "0.75rem",
    "radius-xl": "1rem",
    "radius-pill": "9999px",
    "border-width": "1px",
  } as const;

  const lightTheme: {
    variables: {
      readonly "radius-xl": "1rem";
      readonly "text-body-1-size": "1rem";
      readonly "text-body-1-line-height": 1.6;
      readonly "text-body-2-line-height": 1.6;
      readonly "text-h5-size": "1.25rem";
      "elevation-shadow": string;
      readonly "text-h5-letter-spacing": "-0.0025em";
      readonly "border-width": "1px";
      readonly "text-h6-size": "1rem";
      readonly "radius-xs": "0.125rem";
      readonly "radius-lg": "0.75rem";
      readonly "text-h6-letter-spacing": "0";
      readonly "space-7": "2.5rem";
      readonly "text-h1-letter-spacing": "-0.02em";
      readonly "text-h6-weight": 600;
      readonly "space-8": "3rem";
      readonly "btn-letter-spacing": "0.02em";
      readonly "btn-height": "2.75rem";
      readonly "text-h2-weight": 600;
      readonly "text-h4-weight": 600;
      readonly "btn-padding-x": "var(--v-space-4)";
      readonly "line-height-base": 1.5;
      readonly "input-font-size": "0.9375rem";
      readonly "text-h4-line-height": 1.35;
      readonly "space-0": "0rem";
      readonly "space-1": "0.25rem";
      readonly "text-h3-line-height": 1.3;
      readonly "space-2": "0.5rem";
      readonly "field-border-radius": "var(--v-radius-md)";
      readonly "space-3": "0.75rem";
      readonly "space-4": "1rem";
      readonly "space-5": "1.5rem";
      readonly "text-h2-line-height": 1.25;
      readonly "space-6": "2rem";
      readonly "radius-md": "0.5rem";
      readonly "font-family-base": "'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
      readonly "text-h1-line-height": 1.2;
      readonly "input-line-height": 1.4;
      readonly "text-h4-letter-spacing": "-0.005em";
      readonly "text-h5-line-height": 1.4;
      readonly "text-h2-size": "2.5rem";
      readonly "text-h6-line-height": 1.45;
      readonly "font-size-root": "16px";
      readonly "font-family-display": "'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
      readonly "text-h3-size": "2rem";
      readonly "input-min-height": "2.75rem";
      readonly "text-body-2-size": "0.875rem";
      readonly "text-h3-weight": 600;
      "border-color": string;
      readonly "text-h1-weight": 600;
      readonly "text-h2-letter-spacing": "-0.015em";
      readonly "text-h5-weight": 600;
      readonly "text-h4-size": "1.5rem";
      readonly "radius-pill": "9999px";
      readonly "radius-none": "0";
      readonly "text-h1-size": "3.25rem";
      readonly "radius-sm": "0.25rem";
      readonly "text-h3-letter-spacing": "-0.01em";
    };
    dark: boolean;
    colors: {
      "primary-container": string;
      "on-error": string;
      shadow: string;
      "on-primary": string;
      scrim: string;
      "on-surface-variant": string;
      "inverse-primary": string;
      error: string;
      "surface-bright": string;
      outline: string;
      "inverse-on-surface": string;
      warning: string;
      "surface-light": string;
      "on-success": string;
      "secondary-container": string;
      info: string;
      "on-surface": string;
      "on-secondary-container": string;
      surface: string;
      "outline-variant": string;
      "on-info": string;
      "inverse-surface": string;
      "surface-variant": string;
      "on-background": string;
      secondary: string;
      "on-warning": string;
      "on-primary-container": string;
      success: string;
      background: string;
      "on-secondary": string;
      primary: string;
    };
  } = {
    dark: false,
    colors: {
      primary,
      "on-primary": "#FFFFFF",
      "primary-container": "#FFD9E2",
      "on-primary-container": "#400019",
      secondary: "#475569",
      "on-secondary": "#FFFFFF",
      "secondary-container": "#E2E8F0",
      "on-secondary-container": "#0F172A",
      success: "#2E7D32",
      "on-success": "#FFFFFF",
      warning: "#ED6C02",
      "on-warning": "#1F1300",
      error: "#D32F2F",
      "on-error": "#FFFFFF",
      info: "#0288D1",
      "on-info": "#FFFFFF",
      background: "#F5F7FA",
      "on-background": "#1F2933",
      surface: "#FFFFFF",
      "on-surface": "#1F2933",
      "surface-bright": "#FDFEFF",
      "surface-light": "#F7F9FC",
      "surface-variant": "#E4E7EC",
      "on-surface-variant": "#52616B",
      outline: "#CBD2D9",
      "outline-variant": "#E4E7EC",
      shadow: "#0B1526",
      scrim: "#000000",
      "inverse-surface": "#1F2933",
      "inverse-on-surface": "#F5F7FA",
      "inverse-primary": "#FFB0C5",
    },
    variables: {
      ...sharedVariables,
      "elevation-shadow": "0px 1px 2px rgba(15, 23, 42, 0.08)",
      "border-color": "#E4E7EC",
    },
  };

  const darkTheme: {
    variables: {
      readonly "radius-xl": "1rem";
      readonly "text-body-1-size": "1rem";
      readonly "text-body-1-line-height": 1.6;
      readonly "text-body-2-line-height": 1.6;
      readonly "text-h5-size": "1.25rem";
      "elevation-shadow": string;
      readonly "text-h5-letter-spacing": "-0.0025em";
      readonly "border-width": "1px";
      readonly "text-h6-size": "1rem";
      readonly "radius-xs": "0.125rem";
      readonly "radius-lg": "0.75rem";
      readonly "text-h6-letter-spacing": "0";
      readonly "space-7": "2.5rem";
      readonly "text-h1-letter-spacing": "-0.02em";
      readonly "text-h6-weight": 600;
      readonly "space-8": "3rem";
      readonly "btn-letter-spacing": "0.02em";
      readonly "btn-height": "2.75rem";
      readonly "text-h2-weight": 600;
      readonly "text-h4-weight": 600;
      readonly "btn-padding-x": "var(--v-space-4)";
      readonly "line-height-base": 1.5;
      readonly "input-font-size": "0.9375rem";
      readonly "text-h4-line-height": 1.35;
      readonly "space-0": "0rem";
      readonly "space-1": "0.25rem";
      readonly "text-h3-line-height": 1.3;
      readonly "space-2": "0.5rem";
      readonly "field-border-radius": "var(--v-radius-md)";
      readonly "space-3": "0.75rem";
      readonly "space-4": "1rem";
      readonly "space-5": "1.5rem";
      readonly "text-h2-line-height": 1.25;
      readonly "space-6": "2rem";
      readonly "radius-md": "0.5rem";
      readonly "font-family-base": "'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
      readonly "text-h1-line-height": 1.2;
      readonly "input-line-height": 1.4;
      readonly "text-h4-letter-spacing": "-0.005em";
      readonly "text-h5-line-height": 1.4;
      readonly "text-h2-size": "2.5rem";
      readonly "text-h6-line-height": 1.45;
      readonly "font-size-root": "16px";
      readonly "font-family-display": "'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";
      readonly "text-h3-size": "2rem";
      readonly "input-min-height": "2.75rem";
      readonly "text-body-2-size": "0.875rem";
      readonly "text-h3-weight": 600;
      "border-color": string;
      readonly "text-h1-weight": 600;
      readonly "text-h2-letter-spacing": "-0.015em";
      readonly "text-h5-weight": 600;
      readonly "text-h4-size": "1.5rem";
      readonly "radius-pill": "9999px";
      readonly "radius-none": "0";
      readonly "text-h1-size": "3.25rem";
      readonly "radius-sm": "0.25rem";
      readonly "text-h3-letter-spacing": "-0.01em";
    };
    dark: boolean;
    colors: {
      "primary-container": string;
      "on-error": string;
      shadow: string;
      "on-primary": string;
      scrim: string;
      "on-surface-variant": string;
      "inverse-primary": string;
      error: string;
      "surface-bright": string;
      outline: string;
      "inverse-on-surface": string;
      warning: string;
      "surface-light": string;
      "on-success": string;
      "secondary-container": string;
      info: string;
      "on-surface": string;
      "on-secondary-container": string;
      surface: string;
      "outline-variant": string;
      "on-info": string;
      "inverse-surface": string;
      "surface-variant": string;
      "on-background": string;
      secondary: string;
      "on-warning": string;
      "on-primary-container": string;
      success: string;
      background: string;
      "on-secondary": string;
      primary: string;
    };
  } = {
    dark: true,
    colors: {
      primary,
      "on-primary": "#1B0410",
      "primary-container": "#930039",
      "on-primary-container": "#FFD9E2",
      secondary: "#9CA3AF",
      "on-secondary": "#111827",
      "secondary-container": "#1F2937",
      "on-secondary-container": "#E5E7EB",
      success: "#81C784",
      "on-success": "#0F2610",
      warning: "#FFB74D",
      "on-warning": "#301800",
      error: "#EF5350",
      "on-error": "#2B0A0A",
      info: "#4FC3F7",
      "on-info": "#062434",
      background: "#0F172A",
      "on-background": "#E5E7EB",
      surface: "#111827",
      "on-surface": "#F9FAFB",
      "surface-bright": "#1F2937",
      "surface-light": "#1C2534",
      "surface-variant": "#1F2937",
      "on-surface-variant": "#CBD5F5",
      outline: "#374151",
      "outline-variant": "#1F2937",
      shadow: "#000000",
      scrim: "#000000",
      "inverse-surface": "#F9FAFB",
      "inverse-on-surface": "#0F172A",
      "inverse-primary": "#FFB0C5",
    },
    variables: {
      ...sharedVariables,
      "elevation-shadow": "0px 1px 2px rgba(15, 23, 42, 0.35)",
      "border-color": "#1F2937",
    },
  };

  const vuetify = createVuetify({
    ssr: true,
    display: {
      mobileBreakpoint: "md",
      thresholds: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1280,
        xl: 1920,
      },
      ssr: {
        width: 1280,
        height: 720,
      },
    },
    components: {
      VAlert,
      VApp,
      VAppBar,
      VAvatar,
      VBadge,
      VBtn,
      VBtnToggle,
      VCard,
      VCardActions,
      VCardItem,
      VCardSubtitle,
      VCardText,
      VCardTitle,
      VCheckbox,
      VChip,
      VChipGroup,
      VCombobox,
      VCol,
      VContainer,
      VDataTable: VDataTableComponent,
      VDialog,
      VDivider,
      VExpansionPanel,
      VExpansionPanelText,
      VExpansionPanelTitle,
      VExpansionPanels,
      VForm,
      VIcon,
      VHover,
      VImg,
      VItem,
      VItemGroup,
      VList,
      VListItem,
      VListItemSubtitle,
      VListItemTitle,
      VListSubheader,
      VMain,
      VMenu,
      VNavigationDrawer,
      VOverlay,
      VPagination,
      VProgressCircular,
      VProgressLinear,
      VRangeSlider,
      VRadio,
      VRadioGroup,
      VRating,
      VRow,
      VSlider,
      VSelect,
      VSheet,
      VSkeletonLoader,
      VSnackbar,
      VStepper,
      VStepperHeader,
      VStepperItem,
      VStepperWindow,
      VStepperWindowItem,
      VSpacer,
      VTable,
      VSwitch,
      VTextField,
      VTextarea,
      VTimeline,
      VTimelineItem,
      VToolbar,
      VTooltip,
      VCalendar,
      VDateInput,
    },
    directives: {
      Ripple,
    },
    theme: {
      defaultTheme: "light",
      themes: {
        light: lightTheme,
        dark: darkTheme,
      },
    },
    locale: {
      locale: initialLocale,
      fallback: "en",
      messages: normalizedVuetifyLocaleMessages,
      rtl: rtlLocaleMap,
    },
    date: {
      adapter: DateFnsAdapter,
      locale: {
        en: enUSLocale,
        fr: frLocale,
        de: deLocale,
        ar: arLocale,
        it: itLocale,
        es: esLocale,
        ru: ruLocale,
      },
    },
    defaults: {
      VBtn: {
        ripple: false,
      },
    },
    icons: {
      defaultSet: "mdi",
      aliases: minimalAliases,
      sets: {
        mdi: {
          component: MdiSvgIcon,
        },
      },
    },
  });

  if (initialLocale) {
    vuetify.locale.current.value = initialLocale;
  }

  nuxtApp.hook("i18n:localeSwitched", (context) => {
    const nextLocale = context?.newLocale;

    if (typeof nextLocale === "string" && nextLocale.length > 0) {
      vuetify.locale.current.value = nextLocale;
    }
  });

  nuxtApp.vueApp.use(vuetify);
});
