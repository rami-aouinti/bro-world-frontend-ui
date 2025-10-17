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
import {
  VSvgIcon,
  makeIconProps,
  type IconValue,
} from "vuetify/lib/composables/icons";
import { normalizeHexColor } from "~/lib/theme/colors";
import {
  mdiAccountCog,
  mdiAccountCogOutline,
  mdiAccountGroup,
  mdiAccountGroupOutline,
  mdiAccountHeartOutline,
  mdiAccountKey,
  mdiAccountMultiple,
  mdiAccountMultipleCheckOutline,
  mdiAccountMultipleOutline,
  mdiAccountPlus,
  mdiAccountPlusOutline,
  mdiAccountVoice,
  mdiAlertDecagram,
  mdiAlertDecagramOutline,
  mdiApi,
  mdiArrowDown,
  mdiArrowDownBold,
  mdiArrowTopRight,
  mdiArrowUp,
  mdiArrowUpBold,
  mdiBasketball,
  mdiCalendar,
  mdiCalendarBlank,
  mdiBellRing,
  mdiBookOpenPageVariant,
  mdiBookOpenPageVariantOutline,
  mdiBriefcaseOutline,
  mdiBriefcaseSearch,
  mdiBriefcaseSearchOutline,
  mdiBugOutline,
  mdiBullhorn,
  mdiBullhornOutline,
  mdiCardAccountDetailsOutline,
  mdiCashMultiple,
  mdiCashSync,
  mdiChartAreaspline,
  mdiChartBellCurve,
  mdiChartBoxOutline,
  mdiChartLineVariant,
  mdiChartTimelineVariant,
  mdiChatOutline,
  mdiCheckCircle,
  mdiCheckCircleOutline,
  mdiCheckDecagram,
  mdiClockFast,
  mdiClockOutline,
  mdiChevronDown,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClipboardCheck,
  mdiClipboardText,
  mdiClipboardTextClockOutline,
  mdiClose,
  mdiCogOutline,
  mdiCompassOutline,
  mdiConnection,
  mdiContentSaveOutline,
  mdiControllerClassicOutline,
  mdiCreditCardCheckOutline,
  mdiCreditCardSync,
  mdiCropSquare,
  mdiCurrencyUsd,
  mdiDatabase,
  mdiDatabaseOutline,
  mdiDelete,
  mdiDeleteOutline,
  mdiDotsGrid,
  mdiDotsHorizontal,
  mdiDownload,
  mdiEarth,
  mdiEarthPlus,
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
  mdiFileDownloadOutline,
  mdiFilmstripBoxMultiple,
  mdiFlash,
  mdiFormatAlignJustify,
  mdiGamepadVariantOutline,
  mdiGavel,
  mdiGithub,
  mdiGoogle,
  mdiHistory,
  mdiHomeMapMarker,
  mdiImageFilterHdr,
  mdiImageMultiple,
  mdiImageMultipleOutline,
  mdiImageOutline,
  mdiInformationOutline,
  mdiLabelOutline,
  mdiLifebuoy,
  mdiLightbulbOnOutline,
  mdiLightningBolt,
  mdiLinkVariant,
  mdiLinkedin,
  mdiLock,
  mdiLogin,
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
  mdiScriptTextPlayOutline,
  mdiSend,
  mdiShapeOutline,
  mdiShareOutline,
  mdiShieldAccount,
  mdiShieldAccountOutline,
  mdiShieldAlert,
  mdiShieldCheck,
  mdiShieldCheckOutline,
  mdiShieldCrown,
  mdiShieldKey,
  mdiShieldLock,
  mdiSpeedometer,
  mdiSpeedometerMedium,
  mdiStoreOutline,
  mdiStorefrontOutline,
  mdiSubdirectoryArrowRight,
  mdiTableArrowDown,
  mdiTagMultipleOutline,
  mdiTextBoxMultiple,
  mdiThemeLightDark,
  mdiThumbUpOutline,
  mdiTimerOff,
  mdiTimerSand,
  mdiTools,
  mdiTune,
  mdiTrophyOutline,
  mdiTwitter,
  mdiUpdate,
  mdiViewDashboardOutline,
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
};

const minimalAliases = createMdiAliasVariants({
  ...aliases,
  "mdi-account-cog": withSvgPrefix(mdiAccountCog),
  "mdi-account-cog-outline": withSvgPrefix(mdiAccountCogOutline),
  "mdi-account-group": withSvgPrefix(mdiAccountGroup),
  "mdi-account-group-outline": withSvgPrefix(mdiAccountGroupOutline),
  "mdi-account-heart-outline": withSvgPrefix(mdiAccountHeartOutline),
  "mdi-account-key": withSvgPrefix(mdiAccountKey),
  "mdi-account-multiple": withSvgPrefix(mdiAccountMultiple),
  "mdi-account-multiple-check-outline": withSvgPrefix(mdiAccountMultipleCheckOutline),
  "mdi-account-multiple-outline": withSvgPrefix(mdiAccountMultipleOutline),
  "mdi-account-plus": withSvgPrefix(mdiAccountPlus),
  "mdi-account-plus-outline": withSvgPrefix(mdiAccountPlusOutline),
  "mdi-account-voice": withSvgPrefix(mdiAccountVoice),
  "mdi-alert-decagram": withSvgPrefix(mdiAlertDecagram),
  "mdi-alert-decagram-outline": withSvgPrefix(mdiAlertDecagramOutline),
  "mdi-api": withSvgPrefix(mdiApi),
  "mdi-arrow-down": withSvgPrefix(mdiArrowDown),
  "mdi-arrow-down-bold": withSvgPrefix(mdiArrowDownBold),
  "mdi-arrow-top-right": withSvgPrefix(mdiArrowTopRight),
  "mdi-arrow-up": withSvgPrefix(mdiArrowUp),
  "mdi-arrow-up-bold": withSvgPrefix(mdiArrowUpBold),
  "mdi-basketball": withSvgPrefix(mdiBasketball),
  "mdi-calendar": withSvgPrefix(mdiCalendar),
  "mdi-calendar-blank": withSvgPrefix(mdiCalendarBlank),
  "mdi-bell-ring": withSvgPrefix(mdiBellRing),
  "mdi-book-open-page-variant": withSvgPrefix(mdiBookOpenPageVariant),
  "mdi-book-open-page-variant-outline": withSvgPrefix(mdiBookOpenPageVariantOutline),
  "mdi-briefcase-outline": withSvgPrefix(mdiBriefcaseOutline),
  "mdi-briefcase-search": withSvgPrefix(mdiBriefcaseSearch),
  "mdi-briefcase-search-outline": withSvgPrefix(mdiBriefcaseSearchOutline),
  "mdi-bug-outline": withSvgPrefix(mdiBugOutline),
  "mdi-bullhorn": withSvgPrefix(mdiBullhorn),
  "mdi-bullhorn-outline": withSvgPrefix(mdiBullhornOutline),
  "mdi-card-account-details-outline": withSvgPrefix(mdiCardAccountDetailsOutline),
  "mdi-cash-multiple": withSvgPrefix(mdiCashMultiple),
  "mdi-cash-sync": withSvgPrefix(mdiCashSync),
  "mdi-chart-areaspline": withSvgPrefix(mdiChartAreaspline),
  "mdi-chart-bell-curve": withSvgPrefix(mdiChartBellCurve),
  "mdi-chart-box-outline": withSvgPrefix(mdiChartBoxOutline),
  "mdi-chart-line-variant": withSvgPrefix(mdiChartLineVariant),
  "mdi-chart-timeline-variant": withSvgPrefix(mdiChartTimelineVariant),
  "mdi-chat-outline": withSvgPrefix(mdiChatOutline),
  "mdi-check-circle": withSvgPrefix(mdiCheckCircle),
  "mdi-check-circle-outline": withSvgPrefix(mdiCheckCircleOutline),
  "mdi-check-decagram": withSvgPrefix(mdiCheckDecagram),
  "mdi-clock-fast": withSvgPrefix(mdiClockFast),
  "mdi-clock-outline": withSvgPrefix(mdiClockOutline),
  "mdi-chevron-down": withSvgPrefix(mdiChevronDown),
  "mdi-chevron-left": withSvgPrefix(mdiChevronLeft),
  "mdi-chevron-right": withSvgPrefix(mdiChevronRight),
  "mdi-clipboard-check": withSvgPrefix(mdiClipboardCheck),
  "mdi-clipboard-text": withSvgPrefix(mdiClipboardText),
  "mdi-clipboard-text-clock-outline": withSvgPrefix(mdiClipboardTextClockOutline),
  "mdi-close": withSvgPrefix(mdiClose),
  "mdi-cog-outline": withSvgPrefix(mdiCogOutline),
  "mdi-compass-outline": withSvgPrefix(mdiCompassOutline),
  "mdi-connection": withSvgPrefix(mdiConnection),
  "mdi-content-save-outline": withSvgPrefix(mdiContentSaveOutline),
  "mdi-controller-classic-outline": withSvgPrefix(mdiControllerClassicOutline),
  "mdi-credit-card-check-outline": withSvgPrefix(mdiCreditCardCheckOutline),
  "mdi-credit-card-sync": withSvgPrefix(mdiCreditCardSync),
  "mdi-crop-square": withSvgPrefix(mdiCropSquare),
  "mdi-currency-usd": withSvgPrefix(mdiCurrencyUsd),
  "mdi-database": withSvgPrefix(mdiDatabase),
  "mdi-database-outline": withSvgPrefix(mdiDatabaseOutline),
  "mdi-delete": withSvgPrefix(mdiDelete),
  "mdi-delete-outline": withSvgPrefix(mdiDeleteOutline),
  "mdi-dots-grid": withSvgPrefix(mdiDotsGrid),
  "mdi-dots-horizontal": withSvgPrefix(mdiDotsHorizontal),
  "mdi-download": withSvgPrefix(mdiDownload),
  "mdi-earth": withSvgPrefix(mdiEarth),
  "mdi-earth-plus": withSvgPrefix(mdiEarthPlus),
  "mdi-email": withSvgPrefix(mdiEmail),
  "mdi-email-edit-outline": withSvgPrefix(mdiEmailEditOutline),
  "mdi-email-outline": withSvgPrefix(mdiEmailOutline),
  "mdi-emoticon-happy-outline": withSvgPrefix(mdiEmoticonHappyOutline),
  "mdi-eye": withSvgPrefix(mdiEye),
  "mdi-eye-off": withSvgPrefix(mdiEyeOff),
  "mdi-eye-outline": withSvgPrefix(mdiEyeOutline),
  "mdi-file-chart": withSvgPrefix(mdiFileChart),
  "mdi-file-document-edit": withSvgPrefix(mdiFileDocumentEdit),
  "mdi-file-document-outline": withSvgPrefix(mdiFileDocumentOutline),
  "mdi-file-download-outline": withSvgPrefix(mdiFileDownloadOutline),
  "mdi-filmstrip-box-multiple": withSvgPrefix(mdiFilmstripBoxMultiple),
  "mdi-flash": withSvgPrefix(mdiFlash),
  "mdi-format-align-justify": withSvgPrefix(mdiFormatAlignJustify),
  "mdi-gamepad-variant-outline": withSvgPrefix(mdiGamepadVariantOutline),
  "mdi-gavel": withSvgPrefix(mdiGavel),
  "mdi-github": withSvgPrefix(mdiGithub),
  "mdi-google": withSvgPrefix(mdiGoogle),
  "mdi-history": withSvgPrefix(mdiHistory),
  "mdi-home-map-marker": withSvgPrefix(mdiHomeMapMarker),
  "mdi-image-filter-hdr": withSvgPrefix(mdiImageFilterHdr),
  "mdi-image-multiple": withSvgPrefix(mdiImageMultiple),
  "mdi-image-multiple-outline": withSvgPrefix(mdiImageMultipleOutline),
  "mdi-image-outline": withSvgPrefix(mdiImageOutline),
  "mdi-information-outline": withSvgPrefix(mdiInformationOutline),
  "mdi-label-outline": withSvgPrefix(mdiLabelOutline),
  "mdi-lifebuoy": withSvgPrefix(mdiLifebuoy),
  "mdi-lightbulb-on-outline": withSvgPrefix(mdiLightbulbOnOutline),
  "mdi-lightning-bolt": withSvgPrefix(mdiLightningBolt),
  "mdi-link-variant": withSvgPrefix(mdiLinkVariant),
  "mdi-linkedin": withSvgPrefix(mdiLinkedin),
  "mdi-lock": withSvgPrefix(mdiLock),
  "mdi-login": withSvgPrefix(mdiLogin),
  "mdi-magnify": withSvgPrefix(mdiMagnify),
  "mdi-map-marker": withSvgPrefix(mdiMapMarker),
  "mdi-map-marker-outline": withSvgPrefix(mdiMapMarkerOutline),
  "mdi-message": withSvgPrefix(mdiMessage),
  "mdi-message-processing-outline": withSvgPrefix(mdiMessageProcessingOutline),
  "mdi-microsoft": withSvgPrefix(mdiMicrosoft),
  "mdi-monitor-dashboard": withSvgPrefix(mdiMonitorDashboard),
  "mdi-open-in-new": withSvgPrefix(mdiOpenInNew),
  "mdi-palette": withSvgPrefix(mdiPalette),
  "mdi-palette-outline": withSvgPrefix(mdiPaletteOutline),
  "mdi-pencil": withSvgPrefix(mdiPencil),
  "mdi-pencil-outline": withSvgPrefix(mdiPencilOutline),
  "mdi-play-circle": withSvgPrefix(mdiPlayCircle),
  "mdi-playlist-plus": withSvgPrefix(mdiPlaylistPlus),
  "mdi-plus": withSvgPrefix(mdiPlus),
  "mdi-radar": withSvgPrefix(mdiRadar),
  "mdi-refresh": withSvgPrefix(mdiRefresh),
  "mdi-restore": withSvgPrefix(mdiRestore),
  "mdi-rhombus-medium": withSvgPrefix(mdiRhombusMedium),
  "mdi-robot-happy-outline": withSvgPrefix(mdiRobotHappyOutline),
  "mdi-robot-outline": withSvgPrefix(mdiRobotOutline),
  "mdi-rocket-launch-outline": withSvgPrefix(mdiRocketLaunchOutline),
  "mdi-school-outline": withSvgPrefix(mdiSchoolOutline),
  "mdi-script-text-play-outline": withSvgPrefix(mdiScriptTextPlayOutline),
  "mdi-send": withSvgPrefix(mdiSend),
  "mdi-shape-outline": withSvgPrefix(mdiShapeOutline),
  "mdi-share-outline": withSvgPrefix(mdiShareOutline),
  "mdi-shield-account": withSvgPrefix(mdiShieldAccount),
  "mdi-shield-account-outline": withSvgPrefix(mdiShieldAccountOutline),
  "mdi-shield-alert": withSvgPrefix(mdiShieldAlert),
  "mdi-shield-check": withSvgPrefix(mdiShieldCheck),
  "mdi-shield-check-outline": withSvgPrefix(mdiShieldCheckOutline),
  "mdi-shield-crown": withSvgPrefix(mdiShieldCrown),
  "mdi-shield-key": withSvgPrefix(mdiShieldKey),
  "mdi-shield-lock": withSvgPrefix(mdiShieldLock),
  "mdi-speedometer": withSvgPrefix(mdiSpeedometer),
  "mdi-speedometer-medium": withSvgPrefix(mdiSpeedometerMedium),
  "mdi-store-outline": withSvgPrefix(mdiStoreOutline),
  "mdi-storefront-outline": withSvgPrefix(mdiStorefrontOutline),
  "mdi-subdirectory-arrow-right": withSvgPrefix(mdiSubdirectoryArrowRight),
  "mdi-table-arrow-down": withSvgPrefix(mdiTableArrowDown),
  "mdi-tag-multiple-outline": withSvgPrefix(mdiTagMultipleOutline),
  "mdi-text-box-multiple": withSvgPrefix(mdiTextBoxMultiple),
  "mdi-theme-light-dark": withSvgPrefix(mdiThemeLightDark),
  "mdi-thumb-up-outline": withSvgPrefix(mdiThumbUpOutline),
  "mdi-timer-off": withSvgPrefix(mdiTimerOff),
  "mdi-timer-sand": withSvgPrefix(mdiTimerSand),
  "mdi-tools": withSvgPrefix(mdiTools),
  "mdi-tune": withSvgPrefix(mdiTune),
  "mdi-trophy-outline": withSvgPrefix(mdiTrophyOutline),
  "mdi-twitter": withSvgPrefix(mdiTwitter),
  "mdi-update": withSvgPrefix(mdiUpdate),
  "mdi-view-dashboard-outline": withSvgPrefix(mdiViewDashboardOutline),
  "mdi-weather-night": withSvgPrefix(mdiWeatherNight),
  "mdi-weather-sunny": withSvgPrefix(mdiWeatherSunny),
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
        Array.isArray(entry)
          ? [stripSvgPrefix(entry[0]), entry[1]]
          : stripSvgPrefix(entry),
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
        mdi: {
          component: MdiSvgIcon,
        },
      },
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
