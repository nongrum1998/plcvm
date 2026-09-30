/**
 * @file Formatting utilities for currency, dates, slugs, and order IDs.
 *
 * Provides consistent formatting helpers for common display concerns
 * such as prices, dates, URL slugs, and human-readable identifiers.
 */

/** Options for {@link formatCurrency}. */
export interface FormatCurrencyOptions {
  /** ISO 4217 currency code (default `"INR"`). */
  currency?: string;
  /** BCP 47 locale tag (default uses system locale). */
  locale?: string;
  /** Minimum number of fraction digits (default `2`). */
  minimumFractionDigits?: number;
  /** Maximum number of fraction digits (default `2`). */
  maximumFractionDigits?: number;
}

/**
 * Formats a number or numeric string as a currency value using `Intl.NumberFormat`.
 *
 * @param amount - The numeric value to format.
 * @param options - Formatting options (currency, locale, fraction digits).
 * @returns Formatted currency string.
 *
 * @example
 * ```ts
 * formatCurrency(1234.5)                    // "₹1,234.50"
 * formatCurrency("99.99", { currency: "USD" }) // "$99.99"
 * ```
 */
export const formatCurrency = (
  amount: number | string,
  {
    currency = 'INR',
    locale,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  }: FormatCurrencyOptions = {}
) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(Number(amount));

/**
 * Formats an order ID by taking the last 6 characters and uppercasing with a `#` prefix.
 *
 * @param orderId - The raw order identifier.
 * @returns Formatted order ID (e.g. `"#A3B2C1"`).
 */
export const formatOrderId = (orderId: string) => `#${orderId.trim().slice(-6).toUpperCase()}`;

/**
 * Formats an order number — alias for {@link formatOrderId}.
 *
 * @param orderId - The raw order identifier.
 * @returns Formatted order number (e.g. `"#A3B2C1"`).
 */
export const formatOrderNumber = (orderId: string) => `#${orderId.trim().slice(-6).toUpperCase()}`;

/**
 * Converts a string to a URL-safe slug.
 *
 * Lowercases, trims, replaces non-alphanumeric runs with hyphens,
 * and strips leading/trailing hyphens.
 *
 * @param value - The string to slugify.
 * @returns URL-safe slug.
 *
 * @example
 * ```ts
 * slugify("Hello World!") // "hello-world"
 * ```
 */
export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** Shared date formatter instance for {@link formatDate}. */
const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

/**
 * Formats a date value into a human-readable string.
 *
 * Returns `"-"` for null, undefined, or invalid dates.
 *
 * @param date - A date string, `Date` object, or null/undefined.
 * @returns Formatted date string or `"-"`.
 *
 * @example
 * ```ts
 * formatDate("2024-01-15") // "January 15, 2024, 12:00:00 AM"
 * ```
 */
export const formatDate = (date: string | Date | null | undefined) => {
  if (!date) return '-';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';
  return formatter.format(d);
};

/**
 * Formats an amount as a whole-number Indian Rupee currency string.
 *
 * Uses `en-IN` locale for Indian number grouping (lakhs/crores) with zero fraction digits.
 *
 * @param amount   - The numeric value to format.
 * @param currency - ISO 4217 currency code (default `"INR"`).
 * @returns Formatted currency string without decimals.
 *
 * @example
 * ```ts
 * formattedAmount(150000) // "₹1,50,000"
 * ```
 */
export const formattedAmount = (amount: number, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Returns the abbreviated month name for a given month number.
 *
 * @param month - Month number (1 = January, 12 = December).
 * @returns Abbreviated month name or empty string if invalid.
 *
 * @example
 * ```ts
 * getMonthName(1)  // "Jan"
 * getMonthName(12) // "Dec"
 * ```
 */
export const getMonthName = (month: number) => {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  return months[month - 1] || '';
};

/** Options for the truncation position and ellipsis character. */
type TruncateOptionsT = {
  /** Where to apply the ellipsis: start, middle, or end (default `"end"`). */
  position?: 'end' | 'middle' | 'start';
  /** Ellipsis character(s) to append (default `"..."`). */
  ellipsis?: string;
};

/** Input properties for {@link truncateText}. */
type TruncateProps = {
  /** The text to truncate. */
  text: string;
  /** Maximum length including the ellipsis (default `20`). */
  maxLength?: number;
  /** Truncation behaviour options. */
  options?: TruncateOptionsT;
};

/**
 * Truncates text based on length and position.
 *
 * Supports truncation at the start, middle, or end of the string,
 * with a configurable ellipsis character.
 *
 * @returns The truncated string.
 *
 * @example
 * ```ts
 * truncateText({ text: "Hello World", maxLength: 8 })            // "Hello..."
 * truncateText({ text: "Hello World", maxLength: 8, options: { position: 'middle' } }) // "He...rld"
 * ```
 */
export const truncateText = ({ text, maxLength = 20, options }: TruncateProps): string => {
  const { position = 'end', ellipsis = '...' } = { ...options };

  const ellipsisLength = ellipsis.length;
  const displayLength = maxLength - ellipsisLength;

  if (text.length <= maxLength) return text;
  if (displayLength <= 0) return ellipsis;

  const half = Math.floor(displayLength / 2);

  switch (position) {
    case 'start':
      return ellipsis + text.slice(-displayLength);
    case 'middle':
      return text.slice(0, half) + ellipsis + text.slice(-half);
    case 'end':
    default:
      return text.slice(0, displayLength) + ellipsis;
  }
};
