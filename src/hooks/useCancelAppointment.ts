import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelAppointment } from "../services/appointmentService";

export function useCancelAppointment() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(appointmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return {
    mutate: mutation.mutate,
    isPending: mutation.isPending,
    isError: mutation.isError,
  };
}
