/**
 * Booking domain/application errors. No framework dependencies.
 */
export type BookingError =
  | { code: "ORGANIZATION_REQUIRED"; message: string }
  | { code: "NOT_FOUND"; message: string }
  | { code: "CONFLICT"; message: string };

export const organizationRequired = (): BookingError => ({
  code: "ORGANIZATION_REQUIRED",
  message: "Organization context required",
});

export const notFound = (message: string): BookingError => ({
  code: "NOT_FOUND",
  message,
});

export const conflict = (message: string): BookingError => ({
  code: "CONFLICT",
  message,
});
