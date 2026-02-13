import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { HTTPException } from "hono/http-exception";
import { registerRoute } from "../../../kernel/openapi";
import {
  serviceSchema,
  createServiceBodySchema,
  appointmentSchema,
  createAppointmentBodySchema,
} from "./booking-schemas";
import { toServiceResponse, toAppointmentResponse } from "./booking-mappers";
import type { BookingError } from "../domain/errors";
import type { createListServicesUseCase } from "../application/use-cases/list-services";
import type { createCreateServiceUseCase } from "../application/use-cases/create-service";
import type { createListAppointmentsUseCase } from "../application/use-cases/list-appointments";
import type { createCreateAppointmentUseCase } from "../application/use-cases/create-appointment";

type Variables = { organizationId?: string };

type UseCases = {
  listServices: ReturnType<typeof createListServicesUseCase>;
  createService: ReturnType<typeof createCreateServiceUseCase>;
  listAppointments: ReturnType<typeof createListAppointmentsUseCase>;
  createAppointment: ReturnType<typeof createCreateAppointmentUseCase>;
};

const errorResponseSchema = z.object({ error: z.string() });

function throwBookingError(error: BookingError): never {
  const status = error.code === "ORGANIZATION_REQUIRED" ? 401
    : error.code === "NOT_FOUND" ? 404
    : error.code === "CONFLICT" ? 409
    : 500;
  const message = status === 500 ? "Unknown error" : error.message;
  throw new HTTPException(status, {
    res: Response.json({ error: message }, { status }),
  });
}

type ErrorResponseEntry = {
  description: string;
  content: { "application/json": { schema: typeof errorResponseSchema } };
};

const errorResponses: Record<401 | 404 | 409 | 500, ErrorResponseEntry> = {
  401: { description: "Unauthorized", content: { "application/json": { schema: errorResponseSchema } } },
  404: { description: "Not found", content: { "application/json": { schema: errorResponseSchema } } },
  409: { description: "Conflict", content: { "application/json": { schema: errorResponseSchema } } },
  500: { description: "Server error", content: { "application/json": { schema: errorResponseSchema } } },
};

export function createBookingRoutes(useCases: UseCases) {
  const api = new OpenAPIHono<{ Variables: Variables }>();

  const listServicesRoute = createRoute({
    method: "get",
    path: "/services",
    request: {},
    responses: {
      200: {
        description: "List of services",
        content: {
          "application/json": {
            schema: z.array(serviceSchema),
          },
        },
      },
      ...errorResponses,
    },
  });

  registerRoute(api, listServicesRoute, async (c) => {
    const organizationId = c.get("organizationId");
    const result = await useCases.listServices({ organizationId });
    if (!result.isOk) throwBookingError(result.error);
    return c.json(result.value.map(toServiceResponse));
  });

  const createServiceRoute = createRoute({
    method: "post",
    path: "/services",
    request: {
      body: {
        content: {
          "application/json": {
            schema: createServiceBodySchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Created service",
        content: {
          "application/json": {
            schema: serviceSchema,
          },
        },
      },
      ...errorResponses,
    },
  });

  registerRoute(api, createServiceRoute, async (c) => {
    const organizationId = c.get("organizationId");
    const body = createServiceBodySchema.parse(await c.req.json());
    const result = await useCases.createService({
      organizationId,
      name: body.name,
      description: body.description,
      durationMinutes: body.durationMinutes,
    });
    if (!result.isOk) throwBookingError(result.error);
    return c.json(toServiceResponse(result.value), 201);
  });

  const listAppointmentsRoute = createRoute({
    method: "get",
    path: "/appointments",
    request: {},
    responses: {
      200: {
        description: "List of appointments",
        content: {
          "application/json": {
            schema: z.array(appointmentSchema),
          },
        },
      },
      ...errorResponses,
    },
  });

  registerRoute(api, listAppointmentsRoute, async (c) => {
    const organizationId = c.get("organizationId");
    const result = await useCases.listAppointments({ organizationId });
    if (!result.isOk) throwBookingError(result.error);
    return c.json(result.value.map(toAppointmentResponse));
  });

  const createAppointmentRoute = createRoute({
    method: "post",
    path: "/appointments",
    request: {
      body: {
        content: {
          "application/json": {
            schema: createAppointmentBodySchema,
          },
        },
      },
    },
    responses: {
      201: {
        description: "Created appointment",
        content: {
          "application/json": {
            schema: appointmentSchema,
          },
        },
      },
      409: {
        description: "Conflict",
        content: {
          "application/json": {
            schema: errorResponseSchema,
          },
        },
      },
      401: errorResponses[401],
      404: errorResponses[404],
      500: errorResponses[500],
    },
  });

  registerRoute(api, createAppointmentRoute, async (c) => {
    const organizationId = c.get("organizationId");
    const body = createAppointmentBodySchema.parse(await c.req.json());
    const result = await useCases.createAppointment({
      organizationId,
      serviceId: body.serviceId,
      startAt: new Date(body.startAt),
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
    });
    if (!result.isOk) throwBookingError(result.error);
    return c.json(toAppointmentResponse(result.value), 201);
  });

  return api;
}
