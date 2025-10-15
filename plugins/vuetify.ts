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
  VCardText,
  VCardTitle,
  VCheckbox,
  VChip,
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
  VIcon,
  VImg,
  VList,
  VListItem,
  VListItemSubtitle,
  VListItemTitle,
  VMain,
  VMenu,
  VNavigationDrawer,
  VPagination,
  VProgressCircular,
  VProgressLinear,
  VRadio,
  VRadioGroup,
  VRating,
  VRow,
  VSelect,
  VSheet,
  VSkeletonLoader,
  VSnackbar,
  VSpacer,
  VSwitch,
  VTextField,
  VTextarea,
  VTimeline,
  VTimelineItem,
  VToolbar,
  VTooltip,
} from "vuetify/components";
import { Ripple } from "vuetify/directives";
import { VDateInput } from "vuetify/labs/VDateInput";
import { createVuetify } from "vuetify";
import { ar, de, en, es, fr, it, ru } from "vuetify/locale";
import { aliases, mdi } from "vuetify/iconsets/mdi-svg";
import { normalizeHexColor } from "~/lib/theme/colors";
import {
  mdiAccountCog,
  mdiAccountGroup,
  mdiAccountGroupOutline,
  mdiAccountHeartOutline,
  mdiAccountKey,
  mdiAccountMultiple,
  mdiAccountMultipleCheckOutline,
  mdiAccountMultipleOutline,
  mdiAccountPlus,
  mdiAccountPlusOutline,
  mdiAlertDecagram,
  mdiApi,
  mdiArrowDown,
  mdiArrowDownBold,
  mdiArrowTopRight,
  mdiArrowUp,
  mdiArrowUpBold,
  mdiBasketball,
  mdiBellRing,
  mdiBookOpenPageVariant,
  mdiBookOpenPageVariantOutline,
  mdiBriefcaseOutline,
  mdiBriefcaseSearchOutline,
  mdiBugOutline,
  mdiBullhorn,
  mdiBullhornOutline,
  mdiCashSync,
  mdiChartAreaspline,
  mdiChartBoxOutline,
  mdiChartLineVariant,
  mdiChatOutline,
  mdiCheckDecagram,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClipboardCheck,
  mdiClipboardText,
  mdiClose,
  mdiCogOutline,
  mdiCompassOutline,
  mdiConnection,
  mdiContentSaveOutline,
  mdiControllerClassicOutline,
  mdiCreditCardCheckOutline,
  mdiCreditCardSync,
  mdiDatabase,
  mdiDelete,
  mdiDeleteOutline,
  mdiDotsGrid,
  mdiDotsHorizontal,
  mdiDownload,
  mdiEarth,
  mdiEmail,
  mdiEmailEditOutline,
  mdiEmailOutline,
  mdiEmoticonHappyOutline,
  mdiEye,
  mdiEyeOff,
  mdiEyeOutline,
  mdiFileChart,
  mdiFileDocumentEdit,
  mdiFileDocumentOutline,
  mdiFilmstripBoxMultiple,
  mdiFormatAlignJustify,
  mdiGamepadVariantOutline,
  mdiGavel,
  mdiGithub,
  mdiGoogle,
  mdiHistory,
  mdiHomeMapMarker,
  mdiImageFilterHdr,
  mdiImageMultiple,
  mdiImageOutline,
  mdiInformationOutline,
  mdiLabelOutline,
  mdiLifebuoy,
  mdiLightningBolt,
  mdiLinkVariant,
  mdiLinkedin,
  mdiLock,
  mdiMagnify,
  mdiMapMarker,
  mdiMapMarkerOutline,
  mdiMessage,
  mdiMessageProcessingOutline,
  mdiMicrosoft,
  mdiMonitorDashboard,
  mdiOpenInNew,
  mdiPalette,
  mdiPaletteOutline,
  mdiPencil,
  mdiPencilOutline,
  mdiPlayCircle,
  mdiPlaylistPlus,
  mdiPlus,
  mdiRadar,
  mdiRefresh,
  mdiRestore,
  mdiRhombusMedium,
  mdiRobotHappyOutline,
  mdiRobotOutline,
  mdiRocketLaunchOutline,
  mdiSchoolOutline,
  mdiSend,
  mdiShapeOutline,
  mdiShareOutline,
  mdiShieldAccount,
  mdiShieldAccountOutline,
  mdiShieldAlert,
  mdiShieldCheck,
  mdiShieldCrown,
  mdiShieldKey,
  mdiShieldLock,
  mdiStoreOutline,
  mdiStorefrontOutline,
  mdiSubdirectoryArrowRight,
  mdiTagMultipleOutline,
  mdiTextBoxMultiple,
  mdiThemeLightDark,
  mdiThumbUpOutline,
  mdiTimerOff,
  mdiTimerSand,
  mdiTools,
  mdiTrophyOutline,
  mdiTwitter,
  mdiUpdate,
  mdiWeatherNight,
  mdiWeatherSunny,
} from "@mdi/js";
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

const minimalAliases = {
  ...aliases,
  "mdi-account-cog": mdiAccountCog,
  "mdi-account-group": mdiAccountGroup,
  "mdi-account-group-outline": mdiAccountGroupOutline,
  "mdi-account-heart-outline": mdiAccountHeartOutline,
  "mdi-account-key": mdiAccountKey,
  "mdi-account-multiple": mdiAccountMultiple,
  "mdi-account-multiple-check-outline": mdiAccountMultipleCheckOutline,
  "mdi-account-multiple-outline": mdiAccountMultipleOutline,
  "mdi-account-plus": mdiAccountPlus,
  "mdi-account-plus-outline": mdiAccountPlusOutline,
  "mdi-alert-decagram": mdiAlertDecagram,
  "mdi-api": mdiApi,
  "mdi-arrow-down": mdiArrowDown,
  "mdi-arrow-down-bold": mdiArrowDownBold,
  "mdi-arrow-top-right": mdiArrowTopRight,
  "mdi-arrow-up": mdiArrowUp,
  "mdi-arrow-up-bold": mdiArrowUpBold,
  "mdi-basketball": mdiBasketball,
  "mdi-bell-ring": mdiBellRing,
  "mdi-book-open-page-variant": mdiBookOpenPageVariant,
  "mdi-book-open-page-variant-outline": mdiBookOpenPageVariantOutline,
  "mdi-briefcase-outline": mdiBriefcaseOutline,
  "mdi-briefcase-search-outline": mdiBriefcaseSearchOutline,
  "mdi-bug-outline": mdiBugOutline,
  "mdi-bullhorn": mdiBullhorn,
  "mdi-bullhorn-outline": mdiBullhornOutline,
  "mdi-cash-sync": mdiCashSync,
  "mdi-chart-areaspline": mdiChartAreaspline,
  "mdi-chart-box-outline": mdiChartBoxOutline,
  "mdi-chart-line-variant": mdiChartLineVariant,
  "mdi-chat-outline": mdiChatOutline,
  "mdi-check-decagram": mdiCheckDecagram,
  "mdi-chevron-down": mdiChevronDown,
  "mdi-chevron-left": mdiChevronLeft,
  "mdi-chevron-right": mdiChevronRight,
  "mdi-clipboard-check": mdiClipboardCheck,
  "mdi-clipboard-text": mdiClipboardText,
  "mdi-close": mdiClose,
  "mdi-cog-outline": mdiCogOutline,
  "mdi-compass-outline": mdiCompassOutline,
  "mdi-connection": mdiConnection,
  "mdi-content-save-outline": mdiContentSaveOutline,
  "mdi-controller-classic-outline": mdiControllerClassicOutline,
  "mdi-credit-card-check-outline": mdiCreditCardCheckOutline,
  "mdi-credit-card-sync": mdiCreditCardSync,
  "mdi-database": mdiDatabase,
  "mdi-delete": mdiDelete,
  "mdi-delete-outline": mdiDeleteOutline,
  "mdi-dots-grid": mdiDotsGrid,
  "mdi-dots-horizontal": mdiDotsHorizontal,
  "mdi-download": mdiDownload,
  "mdi-earth": mdiEarth,
  "mdi-email": mdiEmail,
  "mdi-email-edit-outline": mdiEmailEditOutline,
  "mdi-email-outline": mdiEmailOutline,
  "mdi-emoticon-happy-outline": mdiEmoticonHappyOutline,
  "mdi-eye": mdiEye,
  "mdi-eye-off": mdiEyeOff,
  "mdi-eye-outline": mdiEyeOutline,
  "mdi-file-chart": mdiFileChart,
  "mdi-file-document-edit": mdiFileDocumentEdit,
  "mdi-file-document-outline": mdiFileDocumentOutline,
  "mdi-filmstrip-box-multiple": mdiFilmstripBoxMultiple,
  "mdi-format-align-justify": mdiFormatAlignJustify,
  "mdi-gamepad-variant-outline": mdiGamepadVariantOutline,
  "mdi-gavel": mdiGavel,
  "mdi-github": mdiGithub,
  "mdi-google": mdiGoogle,
  "mdi-history": mdiHistory,
  "mdi-home-map-marker": mdiHomeMapMarker,
  "mdi-image-filter-hdr": mdiImageFilterHdr,
  "mdi-image-multiple": mdiImageMultiple,
  "mdi-image-outline": mdiImageOutline,
  "mdi-information-outline": mdiInformationOutline,
  "mdi-label-outline": mdiLabelOutline,
  "mdi-lifebuoy": mdiLifebuoy,
  "mdi-lightning-bolt": mdiLightningBolt,
  "mdi-link-variant": mdiLinkVariant,
  "mdi-linkedin": mdiLinkedin,
  "mdi-lock": mdiLock,
  "mdi-magnify": mdiMagnify,
  "mdi-map-marker": mdiMapMarker,
  "mdi-map-marker-outline": mdiMapMarkerOutline,
  "mdi-message": mdiMessage,
  "mdi-message-processing-outline": mdiMessageProcessingOutline,
  "mdi-microsoft": mdiMicrosoft,
  "mdi-monitor-dashboard": mdiMonitorDashboard,
  "mdi-open-in-new": mdiOpenInNew,
  "mdi-palette": mdiPalette,
  "mdi-palette-outline": mdiPaletteOutline,
  "mdi-pencil": mdiPencil,
  "mdi-pencil-outline": mdiPencilOutline,
  "mdi-play-circle": mdiPlayCircle,
  "mdi-playlist-plus": mdiPlaylistPlus,
  "mdi-plus": mdiPlus,
  "mdi-radar": mdiRadar,
  "mdi-refresh": mdiRefresh,
  "mdi-restore": mdiRestore,
  "mdi-rhombus-medium": mdiRhombusMedium,
  "mdi-robot-happy-outline": mdiRobotHappyOutline,
  "mdi-robot-outline": mdiRobotOutline,
  "mdi-rocket-launch-outline": mdiRocketLaunchOutline,
  "mdi-school-outline": mdiSchoolOutline,
  "mdi-send": mdiSend,
  "mdi-shape-outline": mdiShapeOutline,
  "mdi-share-outline": mdiShareOutline,
  "mdi-shield-account": mdiShieldAccount,
  "mdi-shield-account-outline": mdiShieldAccountOutline,
  "mdi-shield-alert": mdiShieldAlert,
  "mdi-shield-check": mdiShieldCheck,
  "mdi-shield-crown": mdiShieldCrown,
  "mdi-shield-key": mdiShieldKey,
  "mdi-shield-lock": mdiShieldLock,
  "mdi-store-outline": mdiStoreOutline,
  "mdi-storefront-outline": mdiStorefrontOutline,
  "mdi-subdirectory-arrow-right": mdiSubdirectoryArrowRight,
  "mdi-tag-multiple-outline": mdiTagMultipleOutline,
  "mdi-text-box-multiple": mdiTextBoxMultiple,
  "mdi-theme-light-dark": mdiThemeLightDark,
  "mdi-thumb-up-outline": mdiThumbUpOutline,
  "mdi-timer-off": mdiTimerOff,
  "mdi-timer-sand": mdiTimerSand,
  "mdi-tools": mdiTools,
  "mdi-trophy-outline": mdiTrophyOutline,
  "mdi-twitter": mdiTwitter,
  "mdi-update": mdiUpdate,
  "mdi-weather-night": mdiWeatherNight,
  "mdi-weather-sunny": mdiWeatherSunny,
};

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
  const locale = localeCookie.value ?? "en";

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
      VCardText,
      VCardTitle,
      VCheckbox,
      VChip,
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
      VImg,
      VList,
      VListItem,
      VListItemTitle,
      VMain,
      VMenu,
      VNavigationDrawer,
      VPagination,
      VProgressCircular,
      VProgressLinear,
      VRadio,
      VRadioGroup,
      VRating,
      VRow,
      VSelect,
      VSheet,
      VSkeletonLoader,
      VSnackbar,
      VSpacer,
      VSwitch,
      VTextField,
      VTextarea,
      VTimeline,
      VTimelineItem,
      VToolbar,
      VTooltip,
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
      locale,
      fallback: "en",
      messages: normalizedVuetifyLocaleMessages,
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
        mdi,
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
