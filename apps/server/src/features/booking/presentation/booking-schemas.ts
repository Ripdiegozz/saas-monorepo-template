import { z } from "@hono/zod-openapi";

export const serviceSchema = z
  .object({
    id: z.string().openapi({ example: "svc_01" }),
    organizationId: z.string().openapi({ example: "org_01" }),
    name: z.string().openapi({ example: "Haircut" }),
    description: z.string().nullable().openapi({ example: "30 min cut" }),
    durationMinutes: z.number().int().positive().openapi({ example: 30 }),
    createdAt: z.string().openapi({ example: "2025-01-01T00:00:00Z" }),
    updatedAt: z.string().openapi({ example: "2025-01-01T00:00:00Z" }),
  })
  .openapi("Service");

export const createServiceBodySchema = z
  .object({
    name: z.string().min(1).openapi({ example: "Haircut" }),
    description: z.string().optional().openapi({ example: "30 min cut" }),
    durationMinutes: z.number().int().positive().openapi({ example: 30 }),
  })
  .openapi("CreateServiceBody");

export const appointmentSchema = z
  .object({
    id: z.string().openapi({ example: "apt_01" }),
    organizationId: z.string().openapi({ example: "org_01" }),
    serviceId: z.string().openapi({ example: "svc_01" }),
    startAt: z.string().openapi({ example: "2025-01-15T10:00:00Z" }),
    endAt: z.string().openapi({ example: "2025-01-15T10:30:00Z" }),
    customerEmail: z.string().email().openapi({ example: "user@example.com" }),
    customerName: z.string().nullable().openapi({ example: "Jane Doe" }),
    status: z.enum(["scheduled", "canceled", "completed"]).openapi({ example: "scheduled" }),
    createdAt: z.string().openapi({ example: "2025-01-01T00:00:00Z" }),
    updatedAt: z.string().openapi({ example: "2025-01-01T00:00:00Z" }),
  })
  .openapi("Appointment");

export const createAppointmentBodySchema = z
  .object({
    serviceId: z.string().min(1).openapi({ example: "svc_01" }),
    startAt: z.string().openapi({ example: "2025-01-15T10:00:00Z" }),
    customerEmail: z.string().email().openapi({ example: "user@example.com" }),
    customerName: z.string().optional().openapi({ example: "Jane Doe" }),
  })
  .openapi("CreateAppointmentBody");
