import type { Service } from "../lib/types";

export const mockServices: Service[] = [
  {
    id: "svc-1",
    name: "Corte de Cabelo",
    duration: 30,
    price: 45,
    description: "Corte masculino clássico ou moderno, com acabamento na navalha.",
    icon: "scissors",
  },
  {
    id: "svc-2",
    name: "Barba",
    duration: 20,
    price: 30,
    description: "Modelagem e aparagem de barba com toalha quente e produtos premium.",
    icon: "user",
  },
  {
    id: "svc-3",
    name: "Corte + Barba",
    duration: 50,
    price: 70,
    description: "Combo completo: corte de cabelo e barba com acabamento perfeito.",
    icon: "star",
  },
  {
    id: "svc-4",
    name: "Pigmentação",
    duration: 40,
    price: 55,
    description: "Pigmentação capilar para disfarçar falhas e uniformizar o visual.",
    icon: "zap",
  },
  {
    id: "svc-5",
    name: "Hidratação Capilar",
    duration: 45,
    price: 60,
    description: "Tratamento intensivo de hidratação para cabelos ressecados ou danificados.",
    icon: "droplets",
  },
];
