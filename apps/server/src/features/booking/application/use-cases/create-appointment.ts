import type { ServiceRepository } from "../ports/service-repository";
import type { AppointmentRepository } from "../ports/appointment-repository";
import type { Appointment } from "../../domain/appointment";
import { createAppointment } from "../../domain/appointment";
import { ok, err, type Result } from "../../../../kernel/domain/result";
import { organizationRequired, notFound, conflict, type BookingError } from "../../domain/errors";

type CreateAppointmentCommand = {
  organizationId: string | undefined;
  serviceId: string;
  startAt: Date;
  customerEmail: string;
  customerName?: string;
};

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createCreateAppointmentUseCase(repos: {
  service: ServiceRepository;
  appointment: AppointmentRepository;
}) {
  return async (
    command: CreateAppointmentCommand
  ): Promise<Result<Appointment, BookingError>> => {
    if (!command.organizationId) {
      return err(organizationRequired());
    }

    const service = await repos.service.findById(
      command.serviceId,
      command.organizationId
    );
    if (!service) {
      return err(notFound("Service not found"));
    }

    const startAt = command.startAt;
    const endAt = new Date(
      startAt.getTime() + service.durationMinutes * 60 * 1000
    );

    const overlapping = await repos.appointment.findOverlapping(
      command.organizationId,
      command.serviceId,
      startAt,
      endAt
    );
    if (overlapping.length > 0) {
      return err(conflict("Time slot is not available"));
    }

    const appointment = createAppointment({
      id: generateId("apt"),
      organizationId: command.organizationId,
      serviceId: command.serviceId,
      startAt,
      endAt,
      customerEmail: command.customerEmail,
      customerName: command.customerName ?? null,
    });
    await repos.appointment.save(appointment);
    return ok(appointment);
  };
}
