import type { ServiceRepository } from "../ports/service-repository";
import type { Service } from "../../domain/service";
import { createService } from "../../domain/service";
import { ok, err, type Result } from "../../../../kernel/domain/result";
import { organizationRequired, type BookingError } from "../../domain/errors";

type CreateServiceCommand = {
  organizationId: string | undefined;
  name: string;
  description?: string;
  durationMinutes: number;
};

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function createCreateServiceUseCase(repos: {
  service: ServiceRepository;
}) {
  return async (
    command: CreateServiceCommand
  ): Promise<Result<Service, BookingError>> => {
    if (!command.organizationId) {
      return err(organizationRequired());
    }
    const service = createService({
      id: generateId("svc"),
      organizationId: command.organizationId,
      name: command.name,
      description: command.description ?? null,
      durationMinutes: command.durationMinutes,
    });
    await repos.service.save(service);
    return ok(service);
  };
}
