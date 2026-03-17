import type { Service } from "../lib/types";

export const mockServices: Service[] = [
  {
    id: "svc-1",
    name: "Corte de Cabelo",
    duration: 30,
    price: 45,
    description: "Corte masculino clássico ou moderno, com acabamento na navalha.",
    icon: "scissors",
    image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400&h=300&fit=crop",
  },
  {
    id: "svc-2",
    name: "Barba",
    duration: 20,
    price: 30,
    description: "Modelagem e aparagem de barba com toalha quente e produtos premium.",
    icon: "user",
    image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?w=400&h=300&fit=crop",
  },
  {
    id: "svc-3",
    name: "Corte + Barba",
    duration: 50,
    price: 70,
    description: "Combo completo: corte de cabelo e barba com acabamento perfeito.",
    icon: "star",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&h=300&fit=crop",
  },
  {
    id: "svc-4",
    name: "Pigmentação",
    duration: 40,
    price: 55,
    description: "Pigmentação capilar para disfarçar falhas e uniformizar o visual.",
    icon: "zap",
    image: "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=400&h=300&fit=crop",
  },
  {
    id: "svc-5",
    name: "Hidratação Capilar",
    duration: 45,
    price: 60,
    description: "Tratamento intensivo de hidratação para cabelos ressecados ou danificados.",
    icon: "droplets",
    image: "https://images.unsplash.com/photo-1560869713-7d0a29430803?w=400&h=300&fit=crop",
  },
];
