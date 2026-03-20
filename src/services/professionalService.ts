import type { Professional } from "../lib/types";
import { clientApi, getUnitId } from "../lib/api";

export async function getProfessionals(): Promise<Professional[]> {
  const unitId = getUnitId();
  const params = new URLSearchParams();
  if (unitId) params.set("unitId", unitId);
  const query = params.toString();
  const response = await clientApi(`/professionals${query ? `?${query}` : ""}`);
  return response.json();
}
