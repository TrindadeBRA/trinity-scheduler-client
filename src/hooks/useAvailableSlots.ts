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
    queryKey: ["slots", professionalId, date],
    queryFn: () => getAvailableSlots(professionalId!, date!),
    enabled: !!professionalId && !!date,
  });

  const disabledDatesQuery = useQuery<string[]>({
    queryKey: ["disabledDates", professionalId],
    queryFn: () => getDisabledDates(professionalId!),
    enabled: !!professionalId,
  });

  return {
    slots: slotsQuery.data ?? [],
    disabledDates: disabledDatesQuery.data ?? [],
    isLoading: slotsQuery.isLoading || disabledDatesQuery.isLoading,
    isError: slotsQuery.isError || disabledDatesQuery.isError,
  };
}
