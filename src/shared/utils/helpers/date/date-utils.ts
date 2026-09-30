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
