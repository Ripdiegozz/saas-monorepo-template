import { z } from "zod";
import type { AppointmentRepository } from "../../application/ports/appointment-repository";
import type { Appointment } from "../../domain/appointment";
import { db, appointment as appointmentTable } from "@workspace/db";
import { and, eq, lt, gt } from "drizzle-orm";

const statusSchema = z.enum(["scheduled", "canceled", "completed"]);

function toDomain(row: {
  id: string;
  organizationId: string;
  serviceId: string;
  startAt: Date;
  endAt: Date;
  customerEmail: string;
  customerName: string | null;
  customerPhone: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}): Appointment {
  return {
    id: row.id,
    organizationId: row.organizationId,
    serviceId: row.serviceId,
    startAt: row.startAt,
    endAt: row.endAt,
    customerEmail: row.customerEmail,
    customerName: row.customerName,
    customerPhone: row.customerPhone ?? null,
    status: statusSchema.parse(row.status),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function appointmentDrizzleRepository(): AppointmentRepository {
  return {
    async listByOrganization(organizationId) {
      const rows = await db
        .select()
        .from(appointmentTable)
        .where(eq(appointmentTable.organizationId, organizationId));
      return rows.map(toDomain);
    },
    async findOverlapping(
      organizationId,
      serviceId,
      startAt,
      endAt
    ) {
      const rows = await db
        .select()
        .from(appointmentTable)
        .where(
          and(
            eq(appointmentTable.organizationId, organizationId),
            eq(appointmentTable.serviceId, serviceId),
            eq(appointmentTable.status, "scheduled"),
            lt(appointmentTable.startAt, endAt),
            gt(appointmentTable.endAt, startAt)
          )
        );
      return rows.map(toDomain);
    },
    async save(apt) {
      await db.insert(appointmentTable).values({
        id: apt.id,
        organizationId: apt.organizationId,
        serviceId: apt.serviceId,
        startAt: apt.startAt,
        endAt: apt.endAt,
        customerEmail: apt.customerEmail,
        customerName: apt.customerName,
        customerPhone: apt.customerPhone,
        status: apt.status,
        createdAt: apt.createdAt,
        updatedAt: apt.updatedAt,
      });
    },
  };
}
