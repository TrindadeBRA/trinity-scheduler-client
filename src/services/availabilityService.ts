import type { TimeSlot } from "../lib/types";
import {
  availabilityByProfessional,
  getAvailabilityForProfessional,
} from "../mocks/availability";

const simulateDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getAvailableSlots(
  professionalId: string,
  date: string,
  delay = 800
): Promise<TimeSlot[]> {
  await simulateDelay(delay);
  const day = getAvailabilityForProfessional(professionalId, date);
  const slots = day?.slots ?? [];
  console.log("[availabilityService] getAvailableSlots", { professionalId, date, slots });
  return slots;
}

export async function getDisabledDates(
  professionalId: string,
  delay = 800
): Promise<string[]> {
  await simulateDelay(delay);
  const days = availabilityByProfessional[professionalId] ?? [];
  const disabled = days
    .filter((d) => d.slots.every((s) => !s.available))
    .map((d) => d.date);
  console.log("[availabilityService] getDisabledDates", { professionalId, disabled });
  return disabled;
}
