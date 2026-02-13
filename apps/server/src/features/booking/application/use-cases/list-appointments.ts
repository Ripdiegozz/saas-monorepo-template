import type { AppointmentRepository } from "../ports/appointment-repository";
import type { Appointment } from "../../domain/appointment";
import { ok, err, type Result } from "../../../../kernel/domain/result";
import { organizationRequired, type BookingError } from "../../domain/errors";

type ListAppointmentsCommand = {
  organizationId: string | undefined;
};

export function createListAppointmentsUseCase(repos: {
  appointment: AppointmentRepository;
}) {
  return async (
    command: ListAppointmentsCommand
  ): Promise<Result<Appointment[], BookingError>> => {
    if (!command.organizationId) {
      return err(organizationRequired());
    }
    const appointments = await repos.appointment.listByOrganization(
      command.organizationId
    );
    return ok(appointments);
  };
}
