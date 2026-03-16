import type { Professional } from "../lib/types";

export const mockProfessionals: Professional[] = [
  {
    id: "pro-1",
    name: "Carlos Mendes",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=carlos",
    specialties: ["Corte Clássico", "Barba", "Pigmentação"],
  },
  {
    id: "pro-2",
    name: "Rafael Souza",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=rafael",
    specialties: ["Corte Moderno", "Degradê", "Corte + Barba"],
  },
  {
    id: "pro-3",
    name: "Diego Lima",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=diego",
    specialties: ["Barba", "Hidratação Capilar", "Corte Infantil"],
  },
];
