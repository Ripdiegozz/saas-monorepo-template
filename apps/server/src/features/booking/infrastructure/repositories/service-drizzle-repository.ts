import type { ServiceRepository } from "../../application/ports/service-repository";
import type { Service } from "../../domain/service";
import { db, service as serviceTable } from "@workspace/db";
import { eq } from "drizzle-orm";

function toDomain(row: {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
}): Service {
  return {
    id: row.id,
    organizationId: row.organizationId,
    name: row.name,
    description: row.description,
    durationMinutes: row.durationMinutes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function serviceDrizzleRepository(): ServiceRepository {
  return {
    async listByOrganization(organizationId) {
      const rows = await db
        .select()
        .from(serviceTable)
        .where(eq(serviceTable.organizationId, organizationId));
      return rows.map(toDomain);
    },
    async findById(id, organizationId) {
      const rows = await db
        .select()
        .from(serviceTable)
        .where(eq(serviceTable.id, id));
      const row = rows[0];
      if (!row || row.organizationId !== organizationId) return null;
      return toDomain(row);
    },
    async save(svc) {
      await db.insert(serviceTable).values({
        id: svc.id,
        organizationId: svc.organizationId,
        name: svc.name,
        description: svc.description,
        durationMinutes: svc.durationMinutes,
        createdAt: svc.createdAt,
        updatedAt: svc.updatedAt,
      });
    },
  };
}
