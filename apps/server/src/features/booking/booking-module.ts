/**
 * Composition root for the booking feature.
 * Wires infrastructure (repos) with application (use cases) and exports routes.
 */
import { createListServicesUseCase } from "./application/use-cases/list-services";
import { createCreateServiceUseCase } from "./application/use-cases/create-service";
import { createListAppointmentsUseCase } from "./application/use-cases/list-appointments";
import { createCreateAppointmentUseCase } from "./application/use-cases/create-appointment";
import { serviceDrizzleRepository } from "./infrastructure/repositories/service-drizzle-repository";
import { appointmentDrizzleRepository } from "./infrastructure/repositories/appointment-drizzle-repository";
import { createBookingRoutes } from "./presentation/booking-routes";

export function createBookingModule() {
  const serviceRepo = serviceDrizzleRepository();
  const appointmentRepo = appointmentDrizzleRepository();

  const listServices = createListServicesUseCase({ service: serviceRepo });
  const createService = createCreateServiceUseCase({ service: serviceRepo });
  const listAppointments = createListAppointmentsUseCase({
    appointment: appointmentRepo,
  });
  const createAppointment = createCreateAppointmentUseCase({
    service: serviceRepo,
    appointment: appointmentRepo,
  });

  return createBookingRoutes({
    listServices,
    createService,
    listAppointments,
    createAppointment,
  });
}
