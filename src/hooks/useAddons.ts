import { useQuery } from "@tanstack/react-query";
import type { AddonService } from "../lib/types";
import { getAddons } from "../services/addonService";

export function useAddons() {
  const { data, isLoading, isError } = useQuery<AddonService[]>({
    queryKey: ["addons"],
    queryFn: () => getAddons(),
  });

  return {
    addons: data ?? [],
    isLoading: isLoading,
    isError,
  };
}
