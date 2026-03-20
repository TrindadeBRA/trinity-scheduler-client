import { clientApi } from "../lib/api";

export async function getShopInfo(): Promise<{ name: string }> {
  const response = await clientApi("/shop/info");
  return response.json();
}
