import { clientApi, getUnitId } from "../lib/api";

export async function getShopInfo(): Promise<{ name: string }> {
  const unitId = getUnitId();
  const params = new URLSearchParams();
  if (unitId) params.set("unitId", unitId);
  const query = params.toString();
  const response = await clientApi(`/shop/info${query ? `?${query}` : ""}`);
  return response.json();
}
