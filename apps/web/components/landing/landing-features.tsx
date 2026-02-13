"use client"

import { useTranslations } from "next-intl"
import {
  ShieldIcon,
  CreditCardIcon,
  MailIcon,
  CalendarIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"

const featureKeys = [
  "multiTenant",
  "polar",
  "invitations",
  "bookings",
  "roles",
  "stack",
] as const

export function LandingFeatures() {
  const t = useTranslations("features")
  const icons = [
    ShieldIcon,
    CreditCardIcon,
    MailIcon,
    CalendarIcon,
    UsersIcon,
    ZapIcon,
  ]

  const features = featureKeys.map((key, i) => ({
    icon: icons[i],
    title: t(`${key}.title`),
    description: t(`${key}.desc`),
  }))

  return (
    <section id="features" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          {t("title")}
        </h2>
        <p className="text-muted-foreground mt-4 text-center text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <f.icon className="text-primary size-10" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
