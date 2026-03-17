import type { Professional } from "../lib/types";

export const mockProfessionals: Professional[] = [
  {
    id: "pro-1",
    name: "Carlos Mendes",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
    specialties: ["Corte Clássico", "Barba", "Pigmentação"],
  },
  {
    id: "pro-2",
    name: "Rafael Souza",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&crop=face",
    specialties: ["Corte Moderno", "Degradê", "Corte + Barba"],
  },
  {
    id: "pro-3",
    name: "Diego Lima",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face",
    specialties: ["Barba", "Hidratação Capilar", "Corte Infantil"],
  },
];
