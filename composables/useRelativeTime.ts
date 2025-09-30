import { computed } from "vue";
import { useI18n } from "#imports";

type RelativeUnit = Intl.RelativeTimeFormatUnit;

type RelativeTimeStyle = NonNullable<Intl.RelativeTimeFormatOptions["style"]>;

type RelativeNumeric = NonNullable<Intl.RelativeTimeFormatOptions["numeric"]>;

export interface UseRelativeTimeOptions {
  /**
   * Number of days after which the formatter should fall back to an absolute date.
   * Set to `null` or `undefined` to always return a relative value.
   */
  fallbackToDateAfterDays?: number | null;
  /**
   * Style passed to `Intl.RelativeTimeFormat` (defaults to `short`).
   */
  style?: RelativeTimeStyle;
  /**
   * Numeric option passed to `Intl.RelativeTimeFormat` (defaults to `auto`).
   */
  numeric?: RelativeNumeric;
}

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30.44 * DAY;
const YEAR = 365.25 * DAY;

const THRESHOLDS: Array<{ limit: number; divisor: number; unit: RelativeUnit }> = [
  { limit: MINUTE, divisor: SECOND, unit: "second" },
  { limit: HOUR, divisor: MINUTE, unit: "minute" },
  { limit: DAY, divisor: HOUR, unit: "hour" },
  { limit: WEEK, divisor: DAY, unit: "day" },
  { limit: MONTH, divisor: WEEK, unit: "week" },
  { limit: YEAR, divisor: MONTH, unit: "month" },
  { limit: Number.POSITIVE_INFINITY, divisor: YEAR, unit: "year" },
];

function toDate(value: Date | string | number): Date | null {
  const date = value instanceof Date ? value : new Date(value);

  return Number.isNaN(date.valueOf()) ? null : date;
}

export function useRelativeTime(options?: UseRelativeTimeOptions) {
  const { locale } = useI18n();

  const resolvedLocale = computed(() => locale.value || "en-US");

  const relativeFormatter = computed(
    () =>
      new Intl.RelativeTimeFormat(resolvedLocale.value, {
        numeric: options?.numeric ?? "auto",
        style: options?.style ?? "short",
      }),
  );

  const dateFormatter = computed(
    () =>
      new Intl.DateTimeFormat(resolvedLocale.value, {
        dateStyle: "medium",
        timeStyle: "short",
      }),
  );

  function formatRelative(value: Date | string | number): string {
    const date = toDate(value);

    if (!date) {
      return "";
    }

    const diffSeconds = (date.getTime() - Date.now()) / 1000;
    const absSeconds = Math.abs(diffSeconds);

    for (const { limit, divisor, unit } of THRESHOLDS) {
      if (absSeconds < limit) {
        const relativeValue = Math.round(diffSeconds / divisor) || 0;

        return relativeFormatter.value.format(relativeValue, unit);
      }
    }

    return relativeFormatter.value.format(Math.round(diffSeconds / YEAR) || 0, "year");
  }

  function format(value: Date | string | number): string {
    const date = toDate(value);

    if (!date) {
      return "";
    }

    if (
      typeof options?.fallbackToDateAfterDays === "number" &&
      options.fallbackToDateAfterDays >= 0
    ) {
      const diffDays = Math.abs((date.getTime() - Date.now()) / (DAY * 1000));

      if (diffDays > options.fallbackToDateAfterDays) {
        return dateFormatter.value.format(date);
      }
    }

    return formatRelative(date);
  }

  function formatAbsolute(value: Date | string | number): string {
    const date = toDate(value);

    return date ? dateFormatter.value.format(date) : "";
  }

  return {
    formatRelativeTime: format,
    formatAbsoluteTime: formatAbsolute,
  };
}
