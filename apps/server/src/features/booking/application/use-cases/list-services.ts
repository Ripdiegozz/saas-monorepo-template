import type { ServiceRepository } from "../ports/service-repository";
import type { Service } from "../../domain/service";
import { ok, err, type Result } from "../../../../kernel/domain/result";
import { organizationRequired, type BookingError } from "../../domain/errors";

type ListServicesCommand = {
  organizationId: string | undefined;
};

export function createListServicesUseCase(repos: {
  service: ServiceRepository;
}) {
  return async (
    command: ListServicesCommand
  ): Promise<Result<Service[], BookingError>> => {
    if (!command.organizationId) {
      return err(organizationRequired());
    }
    const services = await repos.service.listByOrganization(
      command.organizationId
    );
    return ok(services);
  };
}
