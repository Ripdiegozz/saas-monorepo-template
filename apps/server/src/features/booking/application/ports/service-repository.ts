import type { Service } from "../../domain/service";

export interface ServiceRepository {
  listByOrganization(organizationId: string): Promise<Service[]>;
  findById(id: string, organizationId: string): Promise<Service | null>;
  save(service: Service): Promise<void>;
}
