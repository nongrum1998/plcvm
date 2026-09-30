export function isWithinProcessingPeriod(
  appDate: string | null | undefined,
  appExp: string | null | undefined
): boolean {
  const now = new Date();

  if (!appDate || !appExp) {
    return false;
  }

  const start = new Date(appDate);
  const expiry = new Date(appExp);

  if (Number.isNaN(start.getTime()) || Number.isNaN(expiry.getTime())) {
    return false;
  }

  return now >= start && now <= expiry;
}
