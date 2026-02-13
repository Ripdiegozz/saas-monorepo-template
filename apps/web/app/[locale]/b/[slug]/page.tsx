"use client"

import { useEffect, useRef, useState } from "react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { Link } from "@/i18n/navigation"
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
import { isValidEmail } from "@/lib/validation"
import { useForm } from "@tanstack/react-form"
import { CalendarDaysIcon, CheckCircleIcon, Loader2Icon } from "lucide-react"

function isValidPhone(s: string): boolean {
  return s.replace(/\D/g, "").length >= 6
}

export default function PublicBookingPage() {
  const t = useTranslations("booking")
  const tCommon = useTranslations("common")
  const params = useParams()
  const slug = params.slug as string
  const [org, setOrg] = useState<{ id: string; name: string; slug: string } | null>(null)
  const [services, setServices] = useState<{ id: string; name: string; durationMinutes: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<"service" | "form" | "done">("service")
  const [selectedService, setSelectedService] = useState<{ id: string; name: string; durationMinutes: number } | null>(null)
  const [submittedEmail, setSubmittedEmail] = useState("")
  const [submitError, setSubmitError] = useState<string | null>(null)
  const submitInProgressRef = useRef(false)

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      date: "",
      time: "",
    },
    onSubmit: async ({ value }) => {
      if (submitInProgressRef.current) return
      if (!org || !selectedService) return
      submitInProgressRef.current = true
      setSubmitError(null)
      const startAt = new Date(`${value.date}T${value.time}`)
      if (isNaN(startAt.getTime())) {
        setSubmitError(t("invalidDateTime"))
        return
      }
      try {
        await createAppointment(org.id, {
          serviceId: selectedService.id,
          startAt: startAt.toISOString(),
          customerEmail: value.email,
          customerName: value.name,
          customerPhone: value.phone,
        })
        setSubmittedEmail(value.email)
        setStep("done")
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : t("errorBook"))
        throw e
      } finally {
        submitInProgressRef.current = false
      }
    },
  })

  useEffect(() => {
    if (!slug) return
    getOrganizationBySlug(slug)
      .then((o) => {
        setOrg(o)
        return getServices(o.id)
      })
      .then(setServices)
      .catch((e) => setError(e instanceof Error ? e.message : t("notFound")))
      .finally(() => setLoading(false))
  }, [slug])

  const handleSelectService = (s: { id: string; name: string; durationMinutes: number }) => {
    setSelectedService(s)
    setStep("form")
  }

  if (loading || !slug) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    )
  }

  if (error || !org) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive">{error ?? t("notFound")}</p>
        <Button asChild variant="outline">
          <Link href="/">{tCommon("backToHome")}</Link>
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
          <h1 className="text-2xl font-bold">{t("confirmed")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("confirmedEmail", { email: submittedEmail })}
          </p>
        </div>
        <Button asChild>
          <Link href={`/b/${slug}`}>{t("bookAnother")}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-muted/20">
      <div className="mx-auto max-w-lg px-4 py-12">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <CalendarDaysIcon className="size-4" />
            {org.name}
          </Link>
        </div>

        {step === "service" ? (
          <Card>
            <CardHeader>
              <CardTitle>{t("chooseService")}</CardTitle>
              <CardDescription>{t("chooseServiceDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {services.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  {t("noServices")}
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
                      {s.durationMinutes} {tCommon("min")}
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
                {t("changeService")}
              </Button>
              <CardTitle>{selectedService?.name}</CardTitle>
              <CardDescription>{t("formDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (submitInProgressRef.current) return
                  form.handleSubmit()
                }}
                className="space-y-4"
              >
                {submitError && (
                  <p className="text-destructive text-sm">{submitError}</p>
                )}
                <form.Field
                  name="name"
                  validators={{
                    onChange: ({ value }) =>
                      !value?.trim() ? tCommon("fieldRequired") : undefined,
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("nameRequired")}</Label>
                      <Input
                        id="name"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={t("namePlaceholder")}
                        aria-invalid={!!field.state.meta.errors?.length}
                      />
                      {field.state.meta.errors?.[0] && (
                        <p className="text-destructive text-xs">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
                <form.Field
                  name="email"
                    validators={{
                    onChange: ({ value }) => {
                      if (!value?.trim()) return tCommon("fieldRequired")
                      if (!isValidEmail(value)) return t("invalidEmail")
                      return undefined
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="email">{t("emailRequired")}</Label>
                      <Input
                        id="email"
                        type="email"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={t("emailPlaceholder")}
                        aria-invalid={!!field.state.meta.errors?.length}
                      />
                      {field.state.meta.errors?.[0] && (
                        <p className="text-destructive text-xs">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
                <form.Field
                  name="phone"
                    validators={{
                    onChange: ({ value }) => {
                      if (!value?.trim()) return tCommon("fieldRequired")
                      if (!isValidPhone(value)) return t("invalidPhone")
                      return undefined
                    },
                  }}
                >
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor="phone">{t("phoneRequired")}</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder={t("phonePlaceholder")}
                        aria-invalid={!!field.state.meta.errors?.length}
                      />
                      {field.state.meta.errors?.[0] && (
                        <p className="text-destructive text-xs">
                          {field.state.meta.errors[0]}
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
                <div className="grid grid-cols-2 gap-4">
                  <form.Field
                    name="date"
                    validators={{
                      onChange: ({ value }) =>
                        !value?.trim() ? tCommon("fieldRequired") : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="date">{t("date")}</Label>
                        <Input
                          id="date"
                          type="date"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          min={new Date().toISOString().slice(0, 10)}
                          aria-invalid={!!field.state.meta.errors?.length}
                        />
                        {field.state.meta.errors?.[0] && (
                          <p className="text-destructive text-xs">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                  <form.Field
                    name="time"
                    validators={{
                      onChange: ({ value }) =>
                        !value?.trim() ? tCommon("fieldRequired") : undefined,
                    }}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor="time">{t("time")}</Label>
                        <Input
                          id="time"
                          type="time"
                          value={field.state.value}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={!!field.state.meta.errors?.length}
                        />
                        {field.state.meta.errors?.[0] && (
                          <p className="text-destructive text-xs">
                            {field.state.meta.errors[0]}
                          </p>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>
                <form.Subscribe
                  selector={(state) => [state.canSubmit, state.isSubmitting]}
                >
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={!canSubmit || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2Icon className="mr-2 size-4 animate-spin" />
                          {t("booking")}
                        </>
                      ) : (
                        t("confirm")
                      )}
                    </Button>
                  )}
                </form.Subscribe>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
