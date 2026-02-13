"use client"

import { useTranslations } from "next-intl"
import { Link as I18nLink } from "@/i18n/navigation"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { CheckIcon } from "lucide-react"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export function LandingPricing() {
  const t = useTranslations("pricing")

  const plans = [
    {
      id: "free",
      name: t("free.name"),
      price: t("free.price"),
      period: t("free.period"),
      features: [
        t("free.features.0"),
        t("free.features.1"),
        t("free.features.2"),
        t("free.features.3"),
      ],
      cta: t("free.cta"),
      href: "/signup",
      highlighted: false,
    },
    {
      id: "pro",
      name: t("pro.name"),
      price: t("pro.price"),
      period: t("pro.period"),
      features: [
        t("pro.features.0"),
        t("pro.features.1"),
        t("pro.features.2"),
        t("pro.features.3"),
      ],
      cta: t("pro.cta"),
      href: `${apiUrl}/api/billing/checkout`,
      highlighted: true,
    },
    {
      id: "enterprise",
      name: t("enterprise.name"),
      price: t("enterprise.price"),
      period: t("enterprise.period"),
      features: [
        t("enterprise.features.0"),
        t("enterprise.features.1"),
        t("enterprise.features.2"),
        t("enterprise.features.3"),
      ],
      cta: t("enterprise.cta"),
      href: "mailto:sales@example.com",
      highlighted: false,
    },
  ]

  return (
    <section id="pricing" className="border-t bg-muted/30 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          {t("title")}
        </h2>
        <p className="text-muted-foreground mt-4 text-center text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.highlighted ? "border-primary ring-2 ring-primary/20" : ""}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.id === "free" && "1 business · 3 employees · 100 customers"}
                  {plan.id === "pro" && "3 businesses · 15 employees · 1,000 customers"}
                  {plan.id === "enterprise" &&
                    `${t("enterprise.businesses")} · ${t("enterprise.employees")} · ${t("enterprise.customers")}`}
                </CardDescription>
                <p className="mt-2 text-3xl font-bold">
                  {plan.price}
                  <span className="text-muted-foreground text-sm font-normal">
                    {plan.period}
                  </span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckIcon className="text-primary size-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  {plan.href.startsWith("http") || plan.href.startsWith("mailto") ? (
                    <a
                      href={
                        plan.id === "pro" && plan.href.includes("billing")
                          ? `${plan.href}?productId=pro`
                          : plan.href
                      }
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <I18nLink
                      href={
                        plan.id === "pro" && plan.href.includes("billing")
                          ? `${plan.href}?productId=pro`
                          : plan.href
                      }
                    >
                      {plan.cta}
                    </I18nLink>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
