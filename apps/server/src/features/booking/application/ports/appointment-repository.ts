import type { Appointment } from "../../domain/appointment";

export interface AppointmentRepository {
  listByOrganization(organizationId: string): Promise<Appointment[]>;
  findOverlapping(
    organizationId: string,
    serviceId: string,
    startAt: Date,
    endAt: Date
  ): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
}
