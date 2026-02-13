/**
 * Service domain entity. No framework or infrastructure dependencies.
 */
export type Service = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
  createdAt: Date;
  updatedAt: Date;
};

export function createService(params: {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  durationMinutes: number;
}): Service {
  const now = new Date();
  return {
    ...params,
    createdAt: now,
    updatedAt: now,
  };
}
