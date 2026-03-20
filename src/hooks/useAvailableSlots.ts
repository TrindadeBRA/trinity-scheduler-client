import { useQuery } from "@tanstack/react-query";
import type { TimeSlot } from "../lib/types";
import {
  getAvailableSlots,
  getDisabledDates,
} from "../services/availabilityService";

function getDateRange() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() + 1);
  const end = new Date(today);
  end.setDate(today.getDate() + 30);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  return { startDate: fmt(start), endDate: fmt(end) };
}

export function useAvailableSlots(
  professionalId: string | null | undefined,
  date: string | null | undefined,
  serviceDuration?: number
) {
  const { startDate, endDate } = getDateRange();

  const slotsQuery = useQuery<TimeSlot[]>({
    queryKey: ["slots", professionalId ?? "any", date, serviceDuration],
    queryFn: () =>
      getAvailableSlots(professionalId ?? null, date!, serviceDuration),
    enabled: !!date,
  });

  const disabledDatesQuery = useQuery<string[]>({
    queryKey: ["disabledDates", professionalId ?? "any", startDate, endDate],
    queryFn: () =>
      getDisabledDates(professionalId ?? null, startDate, endDate),
  });

  return {
    slots: slotsQuery.data ?? [],
    disabledDates: disabledDatesQuery.data ?? [],
    isLoading: slotsQuery.isLoading || disabledDatesQuery.isLoading,
    isError: slotsQuery.isError || disabledDatesQuery.isError,
  };
}
