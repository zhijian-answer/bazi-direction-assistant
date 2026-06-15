import type { ActionCheckin, ActionCheckinStats } from "./types";

function dateText(date: Date) {
  return date.toISOString().slice(0, 10);
}

function shiftDateText(baseDateText: string, offsetDays: number) {
  const date = new Date(`${baseDateText}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + offsetDays);
  return dateText(date);
}

export function buildActionCheckinStats(
  checkins: ActionCheckin[],
  referenceDate = new Date(),
): ActionCheckinStats {
  const dates = new Set(checkins.map((checkin) => checkin.date));
  const today = dateText(referenceDate);
  const checkedToday = dates.has(today);
  const streakStart = checkedToday ? today : shiftDateText(today, -1);
  let currentStreak = 0;

  for (let index = 0; index < 366; index += 1) {
    const date = shiftDateText(streakStart, -index);
    if (!dates.has(date)) {
      break;
    }
    currentStreak += 1;
  }

  const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));
  const last7Days = Array.from({ length: 7 }, (_, index) => {
    const date = shiftDateText(today, index - 6);
    return {
      date,
      checked: dates.has(date),
    };
  });

  return {
    total: dates.size,
    currentStreak,
    checkedToday,
    lastCheckinDate: sortedDates[0] || null,
    last7Days,
  };
}
