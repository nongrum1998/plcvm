export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

export function daysBetween(start: Date, end: Date): number {
  const msPerDay = 86_400_000;
  const diff = end.getTime() - start.getTime();
  return Math.round(diff / msPerDay);
}

export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

export function formatISODate(date: Date): string {
  return date.toISOString();
}

export const parseYYYYMMDD = (value: string): Date | null => {
  const [year, month, day] = value.split('-').map(Number);

  const date = new Date(year, month - 1, day);

  // Ensure the date is valid (e.g. reject 2026-02-31)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  date.setHours(0, 0, 0, 0);
  return date;
};

export const parseDDMMYYYY = (value: string): Date | null => {
  const match = /^(\d{2})-(\d{2})-(\d{4})$/.exec(value);

  if (!match) {
    return null;
  }

  const [, dayStr, monthStr, yearStr] = match;

  const day = Number(dayStr);
  const month = Number(monthStr);
  const year = Number(yearStr);

  const date = new Date(year, month - 1, day);

  // Ensure the date is actually valid (e.g. reject 31-02-2026)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  date.setHours(0, 0, 0, 0);

  return date;
};

export function isRealCalendarDate(value: string): boolean {
  const [day, month, year] = value.split('/').map(Number);
  const date = new Date(year, month - 1, day);

  // `Date` silently rolls over out-of-range components (month 13 becomes January
  // of the next year), so compare the round-tripped parts to catch that.
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

export function isFutureDate(value: string): boolean {
  const [day, month, year] = value.split('/').map(Number);

  const date = new Date(year, month - 1, day);

  // Reject invalid dates such as 31/02/2026.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  return date > today;
}

export function formatDate2(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 2) return digits;
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}
