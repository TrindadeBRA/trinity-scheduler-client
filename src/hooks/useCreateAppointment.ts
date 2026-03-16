import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateAppointmentPayload } from "../lib/types";
import { createAppointment } from "../services/appointmentService";

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: CreateAppointmentPayload) =>
      createAppointment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
}
