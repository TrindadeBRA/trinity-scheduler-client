import type { Appointment, CreateAppointmentPayload } from "../lib/types";
import { mockAppointments } from "../mocks/appointments";
import { mockServices } from "../mocks/services";
import { mockProfessionals } from "../mocks/professionals";

const simulateDelay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function getAppointments(
  clientId: string,
  delay = 800
): Promise<Appointment[]> {
  await simulateDelay(delay);
  const result = mockAppointments.filter((a) => a.clientId === clientId);
  console.log("[appointmentService] getAppointments", { clientId, result });
  return result;
}

export async function createAppointment(
  payload: CreateAppointmentPayload,
  delay = 800
): Promise<Appointment> {
  await simulateDelay(delay);
  console.log("[appointmentService] createAppointment", payload);

  const service = mockServices.find((s) => s.id === payload.serviceId);
  const professional = payload.professionalId
    ? mockProfessionals.find((p) => p.id === payload.professionalId)
    : null;

  const appointment: Appointment = {
    id: `apt-${Date.now()}`,
    clientId: payload.clientId,
    serviceId: payload.serviceId,
    serviceName: service?.name ?? payload.serviceId,
    professionalId: payload.professionalId ?? "any",
    professionalName: professional?.name ?? "Sem preferência",
    date: payload.date,
    time: payload.time,
    duration: service?.duration ?? 30,
    price: service?.price ?? 0,
    status: "confirmed",
  };

  return appointment;
}

export async function cancelAppointment(
  appointmentId: string,
  delay = 800
): Promise<void> {
  await simulateDelay(delay);
  console.log("[appointmentService] cancelAppointment", { appointmentId });
}
