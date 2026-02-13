"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useTenant } from "@/components/tenant-provider"
import { TenantNav } from "@/components/tenant-nav"
import {
  getServices,
  createService,
  type Service,
} from "@/lib/api-client"
import { Button } from "@workspace/ui/components/button"
import { Loader2Icon } from "lucide-react"

export default function ServicesPage() {
  const t = useTranslations("tenant.services")
  const { organizationId, organization, isLoading, error } = useTenant()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [durationMinutes, setDurationMinutes] = useState(30)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadServices = () => {
    if (!organizationId) return
    getServices(organizationId)
      .then(setServices)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!organizationId) return
    getServices(organizationId)
      .then(setServices)
      .finally(() => setLoading(false))
  }, [organizationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!organizationId) return
    setSubmitting(true)
    setFormError(null)
    try {
      await createService(organizationId, {
        name,
        description: description || undefined,
        durationMinutes,
      })
      setName("")
      setDescription("")
      setDurationMinutes(30)
      setFormOpen(false)
      loadServices()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : t("errorCreate"))
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading || !organization) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {isLoading ? t("loading") : error ?? t("orgNotFound")}
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{organization.name} – {t("title")}</h1>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <TenantNav />
      </div>

      <div className="flex justify-between items-center mb-6">
        <Button onClick={() => setFormOpen(!formOpen)}>
          {formOpen ? t("cancel") : t("addService")}
        </Button>
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-md border p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">{t("name")}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("description")}</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded border px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("duration")}</label>
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
            {submitting ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                {t("creating")}
              </>
            ) : (
              t("create")
            )}
          </Button>
        </form>
      )}

      {loading ? (
        <p>{t("loading")}</p>
      ) : services.length === 0 ? (
        <p className="text-muted-foreground">{t("none")}</p>
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
  )
}
