"use client"

import { useEffect, useMemo, useState } from "react"
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  Loader2Icon,
} from "lucide-react"

function getDaysInMonth(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const start = new Date(first)
  start.setDate(start.getDate() - start.getDay())
  const days: Date[] = []
  for (let i = 0; i < 42; i++) {
    const d = new Date(start)
    d.setDate(d.getDate() + i)
    days.push(d)
  }
  return days
}

function groupAppointmentsByDay(
  appointments: Appointment[],
  year: number,
  month: number
): Map<string, Appointment[]> {
  const map = new Map<string, Appointment[]>()
  for (const apt of appointments) {
    const d = new Date(apt.startAt)
    if (d.getFullYear() !== year || d.getMonth() !== month) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    const list = map.get(key) ?? []
    list.push(apt)
    map.set(key, list)
  }
  for (const list of map.values()) {
    list.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
  }
  return map
}

export default function CalendarPage() {
  const t = useTranslations("tenant.calendar")
  const locale = useLocale()
  const { organizationId, organization, isLoading, error } = useTenant()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [viewDate, setViewDate] = useState(() => new Date())
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)

  const weekdays = t.raw("weekdays") as string[]

  useEffect(() => {
    if (!organizationId) return
    Promise.all([getAppointments(organizationId), getServices(organizationId)])
      .then(([apts, svcs]) => {
        setAppointments(apts)
        setServices(svcs)
      })
      .finally(() => setLoading(false))
  }, [organizationId])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const days = useMemo(() => getDaysInMonth(year, month), [year, month])
  const byDay = useMemo(
    () => groupAppointmentsByDay(appointments, year, month),
    [appointments, year, month]
  )

  const serviceMap = useMemo(() => {
    const m = new Map<string, Service>()
    for (const s of services) m.set(s.id, s)
    return m
  }, [services])

  const prevMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  const nextMonth = () => setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))

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

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>
              {viewDate.toLocaleDateString(locale, {
                month: "long",
                year: "numeric",
              })}
            </CardTitle>
            <CardDescription>{t("clickToNavigate")}</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={prevMonth}>
              <ChevronLeftIcon className="size-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={nextMonth}>
              <ChevronRightIcon className="size-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2Icon className="size-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[600px] grid grid-cols-7 gap-px rounded-lg border bg-muted/30">
                {weekdays.map((day) => (
                  <div
                    key={day}
                    className="bg-muted/50 px-2 py-2 text-center text-sm font-medium"
                  >
                    {day}
                  </div>
                ))}
                {days.map((d) => {
                  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
                  const isCurrentMonth = d.getMonth() === month
                  const apts = byDay.get(key) ?? []
                  return (
                    <div
                      key={d.toISOString()}
                      className={`min-h-24 flex flex-col gap-1 bg-background p-2 ${
                        !isCurrentMonth ? "text-muted-foreground/60" : ""
                      }`}
                    >
                      <span
                        className={`text-sm ${
                          !isCurrentMonth ? "opacity-60" : "font-medium"
                        }`}
                      >
                        {d.getDate()}
                      </span>
                      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
                        {apts.slice(0, 3).map((apt) => {
                          const svc = serviceMap.get(apt.serviceId)
                          const time = new Date(apt.startAt).toLocaleTimeString(locale, {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          return (
                            <button
                              key={apt.id}
                              type="button"
                              onClick={() => setSelectedAppointment(apt)}
                              className="w-full truncate rounded bg-primary/15 px-1.5 py-0.5 text-left text-xs transition-colors hover:bg-primary/25 focus:outline-none focus:ring-2 focus:ring-ring"
                              title={`${time} – ${apt.customerEmail} – ${svc?.name ?? apt.serviceId}`}
                            >
                              <span className="font-medium">{time}</span>
                              <span className="text-muted-foreground ml-1">
                                {apt.customerName ?? apt.customerEmail}
                              </span>
                            </button>
                          )
                        })}
                        {apts.length > 3 && (
                          <span className="text-muted-foreground text-xs">
                            {t("more", { count: apts.length - 3 })}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedAppointment} onOpenChange={(o) => !o && setSelectedAppointment(null)}>
        <DialogContent>
          {selectedAppointment && (
            <>
              <DialogHeader>
                <DialogTitle>{t("appointmentDetail")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="text-muted-foreground font-medium">{t("customer")}</span>
                  <p className="mt-1">
                    {selectedAppointment.customerName ?? "—"}
                    <br />
                    <a
                      href={`mailto:${selectedAppointment.customerEmail}`}
                      className="text-primary hover:underline"
                    >
                      {selectedAppointment.customerEmail}
                    </a>
                    {selectedAppointment.customerPhone && (
                      <>
                        <br />
                        <a
                          href={`tel:${selectedAppointment.customerPhone}`}
                          className="text-primary hover:underline"
                        >
                          {selectedAppointment.customerPhone}
                        </a>
                      </>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">{t("service")}</span>
                  <p className="mt-1">
                    {serviceMap.get(selectedAppointment.serviceId)?.name ?? selectedAppointment.serviceId}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">{t("dateTime")}</span>
                  <p className="mt-1">
                    {new Date(selectedAppointment.startAt).toLocaleString(locale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    –{" "}
                    {new Date(selectedAppointment.endAt).toLocaleTimeString(locale, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">{t("status")}</span>
                  <p className="mt-1 capitalize">{selectedAppointment.status}</p>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
