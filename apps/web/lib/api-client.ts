const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ApiClientOptions = {
  organizationId?: string;
  credentials?: RequestCredentials;
};

function parseErrorBody(body: unknown): string {
  if (body !== null && typeof body === "object" && "error" in body) {
    // Parsing unknown error shape - need to narrow for property access
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const errObj = body as Record<string, unknown>;
    return typeof errObj.error === "string" ? errObj.error : "Request failed";
  }
  return "Request failed";
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(parseErrorBody(err) ?? "Request failed");
  }
  const data: unknown = await res.json();
  // Fetch Response.json() returns unknown; T is caller's type contract. Use schema validation for runtime safety.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- fetch API limitation
  return data as T;
}

export async function apiGet<T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.organizationId) {
    headers["x-organization-id"] = options.organizationId;
  }
  const res = await fetch(`${getBaseUrl()}${path}`, {
    headers,
    credentials: options.credentials ?? "same-origin",
  });
  return handleResponse<T>(res);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options: ApiClientOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (options.organizationId) {
    headers["x-organization-id"] = options.organizationId;
  }
  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    credentials: options.credentials ?? "same-origin",
  });
  return handleResponse<T>(res);
}

/* --- Admin API (requires session cookies) --- */

export type AdminStatus = {
  isSuperAdmin: boolean;
  needsBootstrap: boolean;
};

export type AdminBootstrapResult = {
  success: boolean;
  isSuperAdmin: boolean;
  message: string;
};

export type AdminOrganization = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

const adminOpts: { credentials: RequestCredentials } = { credentials: "include" };

/** Public - no auth. Returns true when no super admins exist (first-time setup). */
export async function getNeedsSetup(): Promise<{ needsSetup: boolean }> {
  return apiGet<{ needsSetup: boolean }>("/api/admin/needs-setup");
}

export async function getAdminStatus(): Promise<AdminStatus> {
  return apiGet<AdminStatus>("/api/admin/status", adminOpts);
}

export async function postAdminBootstrap(): Promise<AdminBootstrapResult> {
  return apiPost<AdminBootstrapResult>("/api/admin/bootstrap", {}, adminOpts);
}

export async function postAdminEnsureDefaultOrg(): Promise<{ created: boolean }> {
  return apiPost<{ created: boolean }>("/api/admin/ensure-default-org", {}, adminOpts);
}

export async function getAdminOrganizations(): Promise<AdminOrganization[]> {
  return apiGet<AdminOrganization[]>("/api/admin/organizations", adminOpts);
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  return apiGet<AdminUser[]>("/api/admin/users", adminOpts);
}

export type AdminStats = {
  totalOrgs: number;
  totalUsers: number;
  totalBookings: number;
  chartData: { month: string; orgs: number; users: number; bookings: number }[];
};

export async function getAdminStats(): Promise<AdminStats> {
  return apiGet<AdminStats>("/api/admin/stats", adminOpts);
}

export type Service = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type Appointment = {
  id: string;
  organizationId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  customerEmail: string;
  customerName: string | null;
  customerPhone?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
};

export type Profile = {
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  member: {
    role: string;
    isOwner: boolean;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
    createdAt: string;
  };
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
  } | null;
};

export async function getProfile(organizationId: string): Promise<Profile> {
  return apiGet<Profile>("/api/profile", {
    organizationId,
    credentials: "include",
  });
}

export async function getOrganizationBySlug(
  slug: string
): Promise<Organization> {
  return apiGet<Organization>(`/api/organizations/by-slug?slug=${encodeURIComponent(slug)}`);
}

export async function getServices(
  organizationId: string
): Promise<Service[]> {
  return apiGet<Service[]>("/api/services", { organizationId });
}

export async function createService(
  organizationId: string,
  body: { name: string; description?: string; durationMinutes: number }
): Promise<Service> {
  return apiPost<Service>("/api/services", body, { organizationId });
}

export async function getAppointments(
  organizationId: string
): Promise<Appointment[]> {
  return apiGet<Appointment[]>("/api/appointments", { organizationId });
}

export async function createAppointment(
  organizationId: string,
  body: {
    serviceId: string;
    startAt: string;
    customerEmail: string;
    customerName?: string;
    customerPhone?: string;
  }
): Promise<Appointment> {
  return apiPost<Appointment>("/api/appointments", body, { organizationId });
}
