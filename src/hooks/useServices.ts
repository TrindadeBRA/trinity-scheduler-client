import { useQuery } from "@tanstack/react-query";
import type { Service } from "../lib/types";
import { getServices } from "../services/serviceService";

export function useServices() {
  const { data, isLoading, isError } = useQuery<Service[]>({
    queryKey: ["services"],
    queryFn: () => getServices(),
  });

  return {
    services: data ?? [],
    isLoading,
    isError,
  };
}
