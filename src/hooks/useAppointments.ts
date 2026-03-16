import { useQuery } from "@tanstack/react-query";
import type { Appointment } from "../lib/types";
import { getAppointments } from "../services/appointmentService";

export function useAppointments(clientId: string | null | undefined) {
  const { data, isLoading, isError } = useQuery<Appointment[]>({
    queryKey: ["appointments", clientId],
    queryFn: () => getAppointments(clientId!),
    enabled: !!clientId,
  });

  const today = new Date().toISOString().split("T")[0];
  const all = data ?? [];

  const upcoming = all.filter(
    (a) => a.date >= today && a.status !== "cancelled"
  );
  const past = all.filter(
    (a) => a.date < today || a.status === "cancelled"
  );

  return {
    upcoming,
    past,
    isLoading,
    isError,
  };
}
