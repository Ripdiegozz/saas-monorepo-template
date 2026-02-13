"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  getOrganizationBySlug,
  getServices,
  createAppointment,
} from "@/lib/api-client"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { CalendarDaysIcon, CheckCircleIcon } from "lucide-react"

export default function PublicBookingPage() {
  const params = useParams()
  const slug = params.slug as string
  const [org, setOrg] = useState<{ id: string; name: string; slug: string } | null>(null)
  const [services, setServices] = useState<{ id: string; name: string; durationMinutes: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"service" | "form" | "done">("service")
  const [selectedService, setSelectedService] = useState<{ id: string; name: string; durationMinutes: number } | null>(null)
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    getOrganizationBySlug(slug)
      .then((o) => {
        setOrg(o)
        return getServices(o.id)
      })
      .then(setServices)
      .catch((e) => setError(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false))
  }, [slug])

  const handleSelectService = (s: { id: string; name: string; durationMinutes: number }) => {
    setSelectedService(s)
    setStep("form")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!org || !selectedService || !date || !time) return
    const startAt = new Date(`${date}T${time}`)
    if (isNaN(startAt.getTime())) {
      setSubmitError("Fecha u hora inválida")
      return
    }
    setSubmitting(true)
    setSubmitError(null)
    try {
      await createAppointment(org.id, {
        serviceId: selectedService.id,
        startAt: startAt.toISOString(),
        customerEmail: email,
        customerName: name || undefined,
        customerPhone: phone,
      })
      setStep("done")
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Error al reservar")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !slug) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    )
  }

  if (error || !org) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive">{error ?? "No encontrado"}</p>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </div>
    )
  }

  if (step === "done") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
        <div className="rounded-full bg-green-100 p-4 dark:bg-green-900/30">
          <CheckCircleIcon className="size-12 text-green-600 dark:text-green-400" />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-bold">¡Reserva confirmada!</h1>
          <p className="text-muted-foreground mt-2">
            Te hemos enviado un correo de confirmación a {email}
          </p>
        </div>
        <Button asChild>
          <Link href={`/b/${slug}`}>Hacer otra reserva</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-muted/20">
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <CalendarDaysIcon className="size-4" />
            {org.name}
          </Link>
        </div>

        {step === "service" ? (
          <Card>
            <CardHeader>
              <CardTitle>Elige un servicio</CardTitle>
              <CardDescription>
                Selecciona el servicio que deseas reservar
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {services.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No hay servicios disponibles
                </p>
              ) : (
                services.map((s) => (
                  <Button
                    key={s.id}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => handleSelectService(s)}
                  >
                    <span>{s.name}</span>
                    <span className="text-muted-foreground text-sm">
                      {s.durationMinutes} min
                    </span>
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 mb-2 w-fit"
                onClick={() => setStep("service")}
              >
                ← Cambiar servicio
              </Button>
              <CardTitle>{selectedService?.name}</CardTitle>
              <CardDescription>
                Completa tus datos. Email y teléfono son requeridos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {submitError && (
                  <p className="text-destructive text-sm">{submitError}</p>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Fecha</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      min={new Date().toISOString().slice(0, 10)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Hora</Label>
                    <Input
                      id="time"
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 612 345 678"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre (opcional)</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tu nombre"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Reservando…" : "Confirmar reserva"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
