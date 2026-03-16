import type { Service } from "../lib/types";
import { mockServices } from "../mocks/services";

const simulateDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getServices(delay = 800): Promise<Service[]> {
  await simulateDelay(delay);
  console.log("[serviceService] getServices", mockServices);
  return mockServices;
}
