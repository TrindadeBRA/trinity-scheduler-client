import type { Professional } from "../lib/types";
import { mockProfessionals } from "../mocks/professionals";

const simulateDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getProfessionals(delay = 800): Promise<Professional[]> {
  await simulateDelay(delay);
  console.log("[professionalService] getProfessionals", mockProfessionals);
  return mockProfessionals;
}
