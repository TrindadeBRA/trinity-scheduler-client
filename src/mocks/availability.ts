import type { DayAvailability, TimeSlot } from "../lib/types";

// Generate time slots from 09:00 to 18:00 every 30 minutes
function generateSlots(unavailableTimes: string[] = []): TimeSlot[] {
  const slots: TimeSlot[] = [];
  for (let hour = 9; hour < 18; hour++) {
    for (const minute of [0, 30]) {
      const time = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      slots.push({ time, available: !unavailableTimes.includes(time) });
    }
  }
  return slots;
}

// Format a Date as "YYYY-MM-DD"
function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Build availability for the next 30 days for a given professional
function buildAvailability(
  professionalId: string,
  unavailableTimesPattern: (dayIndex: number) => string[],
  noAvailabilityDays: number[] // day indices (0-based) that have no slots at all
): DayAvailability[] {
  const result: DayAvailability[] = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i + 1); // start from tomorrow
    const dateStr = formatDate(date);

    if (noAvailabilityDays.includes(i)) {
      // Day with no available slots (all marked unavailable)
      result.push({
        date: dateStr,
        slots: generateSlots().map((s) => ({ ...s, available: false })),
      });
    } else {
      result.push({
        date: dateStr,
        slots: generateSlots(unavailableTimesPattern(i)),
      });
    }
  }

  return result;
}

// pro-1: busy in the mornings on even days, no slots on days 5, 12, 19
const pro1Availability = buildAvailability(
  "pro-1",
  (i) =>
    i % 2 === 0
      ? ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]
      : ["14:00", "14:30"],
  [5, 12, 19]
);

// pro-2: busy in the afternoons on odd days, no slots on days 3, 10, 25
const pro2Availability = buildAvailability(
  "pro-2",
  (i) =>
    i % 2 !== 0
      ? ["15:00", "15:30", "16:00", "16:30", "17:00", "17:30"]
      : ["09:00", "09:30"],
  [3, 10, 25]
);

// pro-3: scattered unavailability, no slots on days 7, 14, 21, 28 (weekly)
const pro3Availability = buildAvailability(
  "pro-3",
  (i) => {
    const busy: string[] = [];
    if (i % 3 === 0) busy.push("09:00", "09:30", "10:00");
    if (i % 3 === 1) busy.push("13:00", "13:30", "14:00", "14:30");
    if (i % 3 === 2) busy.push("16:00", "16:30", "17:00", "17:30");
    return busy;
  },
  [7, 14, 21, 28]
);

// Map keyed by professionalId
export const availabilityByProfessional: Record<string, DayAvailability[]> = {
  "pro-1": pro1Availability,
  "pro-2": pro2Availability,
  "pro-3": pro3Availability,
};

export function getAvailabilityForProfessional(
  professionalId: string,
  date: string
): DayAvailability | undefined {
  const days = availabilityByProfessional[professionalId];
  if (!days) return undefined;
  return days.find((d) => d.date === date);
}
