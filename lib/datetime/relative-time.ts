export function formatRelativeTime(
  value: string | null | undefined,
  locale: string,
): string {
  if (!value) {
    return "";
  }

  const timestamp = Date.parse(value);

  if (Number.isNaN(timestamp)) {
    return "";
  }

  const diff = timestamp - Date.now();
  const seconds = Math.round(diff / 1000);
  const absolute = Math.abs(seconds);

  const table: Array<{ limit: number; divisor: number; unit: Intl.RelativeTimeFormatUnit }> = [
    { limit: 60, divisor: 1, unit: "second" },
    { limit: 3600, divisor: 60, unit: "minute" },
    { limit: 86_400, divisor: 3600, unit: "hour" },
    { limit: 604_800, divisor: 86_400, unit: "day" },
    { limit: 2_629_746, divisor: 604_800, unit: "week" },
    { limit: 31_556_952, divisor: 2_629_746, unit: "month" },
    { limit: Number.POSITIVE_INFINITY, divisor: 31_556_952, unit: "year" },
  ];

  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  for (const entry of table) {
    if (absolute < entry.limit) {
      const value = Math.round(seconds / entry.divisor);
      return formatter.format(value, entry.unit);
    }
  }

  return formatter.format(0, "second");
}
