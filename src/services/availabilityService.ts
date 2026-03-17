import type { TimeSlot } from "../lib/types";
import {
  availabilityByProfessional,
  getAvailabilityForProfessional,
} from "../mocks/availability";

const simulateDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getAvailableSlots(
  professionalId: string | null,
  date: string,
  delay = 800
): Promise<TimeSlot[]> {
  await simulateDelay(delay);

  if (!professionalId) {
    // "Sem preferência": slot is available if ANY professional has it available
    const allPros = Object.keys(availabilityByProfessional);
    const slotsByPro = allPros.map((pid) => getAvailabilityForProfessional(pid, date)?.slots ?? []);
    if (slotsByPro.length === 0) return [];
    return slotsByPro[0].map((slot, i) => ({
      time: slot.time,
      available: slotsByPro.some((proSlots) => proSlots[i]?.available),
    }));
  }

  const day = getAvailabilityForProfessional(professionalId, date);
  const slots = day?.slots ?? [];
  console.log("[availabilityService] getAvailableSlots", { professionalId, date, slots });
  return slots;
}

export async function getDisabledDates(
  professionalId: string | null,
  delay = 800
): Promise<string[]> {
  await simulateDelay(delay);

  if (!professionalId) {
    // "Sem preferência": a date is disabled only if ALL professionals are unavailable
    const allPros = Object.keys(availabilityByProfessional);
    const allDates = new Set<string>();
    for (const pid of allPros) {
      for (const day of availabilityByProfessional[pid]) {
        allDates.add(day.date);
      }
    }
    const disabled: string[] = [];
    for (const date of allDates) {
      const allUnavailable = allPros.every((pid) => {
        const day = availabilityByProfessional[pid]?.find((d) => d.date === date);
        return !day || day.slots.every((s) => !s.available);
      });
      if (allUnavailable) disabled.push(date);
    }
    return disabled;
  }

  const days = availabilityByProfessional[professionalId] ?? [];
  const disabled = days
    .filter((d) => d.slots.every((s) => !s.available))
    .map((d) => d.date);
  console.log("[availabilityService] getDisabledDates", { professionalId, disabled });
  return disabled;
}
