import { useQuery } from "@tanstack/react-query";
import type { TimeSlot } from "../lib/types";
import {
  getAvailableSlots,
  getDisabledDates,
} from "../services/availabilityService";

export function useAvailableSlots(
  professionalId: string | null | undefined,
  date: string | null | undefined
) {
  const slotsQuery = useQuery<TimeSlot[]>({
    queryKey: ["slots", professionalId ?? "any", date],
    queryFn: () => getAvailableSlots(professionalId ?? null, date!),
    enabled: !!date,
  });

  const disabledDatesQuery = useQuery<string[]>({
    queryKey: ["disabledDates", professionalId ?? "any"],
    queryFn: () => getDisabledDates(professionalId ?? null),
  });

  return {
    slots: slotsQuery.data ?? [],
    disabledDates: disabledDatesQuery.data ?? [],
    isLoading: slotsQuery.isLoading || disabledDatesQuery.isLoading,
    isError: slotsQuery.isError || disabledDatesQuery.isError,
  };
}
