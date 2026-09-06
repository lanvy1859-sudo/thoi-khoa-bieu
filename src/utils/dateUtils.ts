/**
 * Date utility functions for weekly schedule calculation
 */

export function parseDateString(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  return null;
}

export function formatDateToYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateToDM(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${d}/${m}`;
}

export function getDayDateStr(startDateStr: string | undefined, dayIndex: number): string {
  if (!startDateStr) return '';
  const base = parseDateString(startDateStr);
  if (!base) return '';
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + dayIndex);
  return formatDateToDM(d);
}

export function getDayFullDateStr(startDateStr: string | undefined, dayIndex: number): string {
  if (!startDateStr) return '';
  const base = parseDateString(startDateStr);
  if (!base) return '';
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + dayIndex);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yy = d.getFullYear();
  return `${dd}/${mm}/${yy}`;
}

export function isDateToday(startDateStr: string | undefined, dayIndex: number): boolean {
  if (!startDateStr) return false;
  const base = parseDateString(startDateStr);
  if (!base) return false;
  const d = new Date(base.getTime());
  d.setDate(d.getDate() + dayIndex);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/**
 * Given the last week or current week, calculate the next sequential week dates.
 * Adds 7 days to the previous start date.
 */
export function getNextSequentialWeek(
  lastWeekStartDateStr: string,
  weekNumber: number
): { startDate: string; endDate: string; name: string } {
  const base = parseDateString(lastWeekStartDateStr) || new Date(2026, 8, 7); // fallback 07/09/2026
  const nextStart = new Date(base.getTime());
  nextStart.setDate(nextStart.getDate() + 7);

  const nextEnd = new Date(nextStart.getTime());
  nextEnd.setDate(nextEnd.getDate() + 6);

  const startDM = formatDateToDM(nextStart);
  const endDM = formatDateToDM(nextEnd);

  return {
    startDate: formatDateToYMD(nextStart),
    endDate: formatDateToYMD(nextEnd),
    name: `Tuần ${weekNumber} (${startDM} - ${endDM})`,
  };
}
