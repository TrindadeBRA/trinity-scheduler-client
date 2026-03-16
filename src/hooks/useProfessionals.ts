import { useQuery } from "@tanstack/react-query";
import type { Professional } from "../lib/types";
import { getProfessionals } from "../services/professionalService";

export function useProfessionals() {
  const { data, isLoading, isError } = useQuery<Professional[]>({
    queryKey: ["professionals"],
    queryFn: () => getProfessionals(),
  });

  return {
    professionals: data ?? [],
    isLoading,
    isError,
  };
}
