"use client"

import { useEffect, useState } from "react"
import { useTranslations, useLocale } from "next-intl"
import { useTenant } from "@/components/tenant-provider"
import { TenantNav } from "@/components/tenant-nav"
import {
  getAppointments,
  getServices,
  type Appointment,
  type Service,
} from "@/lib/api-client"
import { Button } from "@workspace/ui/components/button"
import { Link } from "@/i18n/navigation"
import {
  Card,
  CardContent,
} from "@workspace/ui/components/card"
import { CopyIcon, CheckIcon, LinkIcon } from "lucide-react"

export default function DashboardPage() {
  const t = useTranslations("tenant.dashboard")
  const locale = useLocale()
  const { organizationId, organization, isLoading, error } = useTenant()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [bookingLinkCopied, setBookingLinkCopied] = useState(false)

  const bookingUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${locale}/b/${organization?.slug ?? ""}`
      : ""

  const copyBookingLink = () => {
    if (!bookingUrl || !organization) return
    void navigator.clipboard.writeText(bookingUrl).then(() => {
      setBookingLinkCopied(true)
      setTimeout(() => setBookingLinkCopied(false), 2000)
    })
  }

  useEffect(() => {
    if (!organizationId) return
    Promise.all([getAppointments(organizationId), getServices(organizationId)])
      .then(([apts, svcs]) => {
        setAppointments(apts)
        setServices(svcs)
      })
      .finally(() => setLoading(false))
  }, [organizationId])

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
        <h1 className="text-2xl font-bold">{organization.name} – {t("title")}</h1>
        <TenantNav />
      </div>
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-muted-foreground mb-3">{t("manageBookings")}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
              <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
              <a
                href={`/b/${organization.slug}`}
                className="truncate text-primary underline hover:no-underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {bookingUrl || `/${locale}/b/${organization.slug}`}
              </a>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={copyBookingLink}
              className="shrink-0"
            >
              {bookingLinkCopied ? (
                <>
                  <CheckIcon className="mr-2 size-4 text-green-600" />
                  {t("copied")}
                </>
              ) : (
                <>
                  <CopyIcon className="mr-2 size-4" />
                  {t("copyLink")}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <p>{t("loadingAppointments")}</p>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">{t("appointments")}</h2>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground">{t("noAppointments")}</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {appointments.map((apt) => (
                <li
                  key={apt.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div>
                    <span className="font-medium">{apt.customerEmail}</span>
                    <span className="text-muted-foreground ml-2">
                      {new Date(apt.startAt).toLocaleString()} –{" "}
                      {new Date(apt.endAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <span
                    className={`rounded px-2 py-0.5 text-sm ${
                      apt.status === "scheduled"
                        ? "bg-green-100 text-green-800"
                        : apt.status === "canceled"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {apt.status === "scheduled" ? t("statusScheduled") : apt.status === "canceled" ? t("statusCanceled") : apt.status}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <h2 className="text-lg font-semibold mt-8">{t("services")}</h2>
          {services.length === 0 ? (
            <p className="text-muted-foreground">{t("noServices")}</p>
          ) : (
            <ul className="divide-y rounded-md border">
              {services.map((svc) => (
                <li
                  key={svc.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <span className="font-medium">{svc.name}</span>
                  <span className="text-muted-foreground">
                    {svc.durationMinutes} min
                  </span>
                </li>
              ))}
            </ul>
          )}

          <Button asChild>
            <Link href={`/tenant/${organization.slug}/services`}>{t("manageServices")}</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
