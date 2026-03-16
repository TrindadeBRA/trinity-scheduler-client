/**
 * Merges class names, filtering out falsy values.
 * Simple implementation without clsx/tailwind-merge.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats a number as currency.
 * @param value - The numeric value to format
 * @param locale - BCP 47 locale string (default: "pt-BR")
 * @param currency - ISO 4217 currency code (default: "BRL")
 */
export function formatCurrency(
  value: number,
  locale: string = "pt-BR",
  currency: string = "BRL"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(value);
}

/**
 * Formats a date string (YYYY-MM-DD) to a localized display format.
 * @param date - Date string in YYYY-MM-DD format
 * @param locale - BCP 47 locale string (default: "pt-BR")
 */
export function formatDate(date: string, locale: string = "pt-BR"): string {
  // Parse as local date to avoid timezone offset issues
  const [year, month, day] = date.split("-").map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString(locale, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formats a time string (HH:MM) for display.
 * @param time - Time string in HH:MM format
 */
export function formatTime(time: string): string {
  return time;
}
