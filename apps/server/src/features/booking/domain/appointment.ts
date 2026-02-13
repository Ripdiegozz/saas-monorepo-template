/**
 * Appointment domain entity. No framework or infrastructure dependencies.
 */
export type AppointmentStatus = "scheduled" | "canceled" | "completed";

export type Appointment = {
  id: string;
  organizationId: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
};

export function createAppointment(params: {
  id: string;
  organizationId: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  customerEmail: string;
  customerName: string | null;
  customerPhone?: string | null;
}): Appointment {
  const now = new Date();
  return {
    ...params,
    customerPhone: params.customerPhone ?? null,
    status: "scheduled",
    createdAt: now,
    updatedAt: now,
  };
}
