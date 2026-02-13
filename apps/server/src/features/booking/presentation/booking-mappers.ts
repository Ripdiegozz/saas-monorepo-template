import type { Service } from "../domain/service";
import type { Appointment } from "../domain/appointment";

export function toServiceResponse(s: Service) {
  return {
    id: s.id,
    organizationId: s.organizationId,
    name: s.name,
    description: s.description,
    durationMinutes: s.durationMinutes,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export function toAppointmentResponse(a: Appointment) {
  return {
    id: a.id,
    organizationId: a.organizationId,
    serviceId: a.serviceId,
    startAt: a.startAt.toISOString(),
    endAt: a.endAt.toISOString(),
    customerEmail: a.customerEmail,
    customerName: a.customerName,
    customerPhone: a.customerPhone ?? null,
    status: a.status,
    createdAt: a.createdAt.toISOString(),
    updatedAt: a.updatedAt.toISOString(),
  };
}
