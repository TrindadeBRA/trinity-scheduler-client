import type { Appointment, CreateAppointmentPayload } from "../lib/types";
import { clientApi, getUnitId } from "../lib/api";
import { centsToReais } from "../lib/price";

export async function getAppointments(clientId: string): Promise<Appointment[]> {
  const response = await clientApi(`/appointments?clientId=${clientId}`);
  const data: Appointment[] = await response.json();
  return data.map((a) => ({ ...a, price: centsToReais(a.price) }));
}

export async function createAppointment(
  payload: CreateAppointmentPayload
): Promise<Appointment> {
  const unitId = payload.unitId || getUnitId();
  const response = await clientApi("/appointments", {
    method: "POST",
    body: JSON.stringify({ ...payload, unitId }),
  });
  const data: Appointment = await response.json();
  return { ...data, price: centsToReais(data.price) };
}

export async function cancelAppointment(
  appointmentId: string,
  reason?: string
): Promise<void> {
  const body = reason !== undefined ? JSON.stringify({ reason }) : undefined;
  await clientApi(`/appointments/${appointmentId}/cancel`, {
    method: "PATCH",
    body,
  });
}
