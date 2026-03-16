import type { Appointment } from "../lib/types";

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().split("T")[0];
}

function pastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

export const mockAppointments: Appointment[] = [
  // Upcoming appointments
  {
    id: "apt-1",
    clientId: "client-mock-001",
    serviceId: "svc-1",
    serviceName: "Corte de Cabelo",
    professionalId: "pro-1",
    professionalName: "Carlos Mendes",
    date: futureDate(3),
    time: "10:00",
    duration: 30,
    price: 45,
    status: "confirmed",
  },
  {
    id: "apt-2",
    clientId: "client-mock-001",
    serviceId: "svc-3",
    serviceName: "Corte + Barba",
    professionalId: "pro-2",
    professionalName: "Rafael Souza",
    date: futureDate(7),
    time: "14:30",
    duration: 50,
    price: 70,
    status: "confirmed",
  },
  // Past appointments
  {
    id: "apt-3",
    clientId: "client-mock-001",
    serviceId: "svc-2",
    serviceName: "Barba",
    professionalId: "pro-3",
    professionalName: "Diego Lima",
    date: pastDate(10),
    time: "11:00",
    duration: 20,
    price: 30,
    status: "completed",
  },
  {
    id: "apt-4",
    clientId: "client-mock-001",
    serviceId: "svc-4",
    serviceName: "Pigmentação",
    professionalId: "pro-1",
    professionalName: "Carlos Mendes",
    date: pastDate(25),
    time: "09:30",
    duration: 40,
    price: 55,
    status: "completed",
  },
];
