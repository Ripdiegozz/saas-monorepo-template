"use client";

import { useEffect, useState } from "react";
import { useTenant } from "@/components/tenant-provider";
import {
  getServices,
  createService,
  type Service,
} from "@/lib/api-client";
import { Button } from "@workspace/ui/components/button";

export default function ServicesPage() {
  const { organizationId, organization, isLoading, error } = useTenant();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadServices = () => {
    if (!organizationId) return;
    getServices(organizationId)
      .then(setServices)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!organizationId) return;
    getServices(organizationId)
      .then(setServices)
      .finally(() => setLoading(false));
  }, [organizationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organizationId) return;
    setSubmitting(true);
    setFormError(null);
    try {
      await createService(organizationId, {
        name,
        description: description || undefined,
        durationMinutes,
      });
      setName("");
      setDescription("");
      setDurationMinutes(30);
      setFormOpen(false);
      loadServices();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || !organization) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {isLoading ? "Loading..." : error ?? "Organization not found"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold">{organization.name} – Services</h1>
      <p className="text-muted-foreground mb-6">
        Manage your bookable services
      </p>

      <div className="flex justify-between items-center mb-6">
        <Button asChild variant="outline">
          <a href={`/tenant/${organization.slug}/dashboard`}>Back to Dashboard</a>
        </Button>
        <Button onClick={() => setFormOpen(!formOpen)}>
          {formOpen ? "Cancel" : "Add Service"}
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-md border p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min={5}
              step={5}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          {formError && (
            <p className="text-sm text-red-600">{formError}</p>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Service"}
          </Button>
        </form>
      )}

      {loading ? (
        <p>Loading services...</p>
      ) : services.length === 0 ? (
        <p className="text-muted-foreground">No services yet. Add one above.</p>
      ) : (
        <ul className="divide-y rounded-md border">
          {services.map((svc) => (
            <li
              key={svc.id}
              className="flex items-center justify-between px-4 py-3"
            >
              <div>
                <span className="font-medium">{svc.name}</span>
                {svc.description && (
                  <span className="text-muted-foreground ml-2">
                    – {svc.description}
                  </span>
                )}
              </div>
              <span className="text-muted-foreground">
                {svc.durationMinutes} min
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
