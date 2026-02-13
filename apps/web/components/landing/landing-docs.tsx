"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ExternalLinkIcon } from "lucide-react"

const docsConfig = [
  {
    key: "architecture",
    href: "/docs",
    external: false,
  },
  {
    key: "polar",
    href: "https://polar.sh/docs",
    external: true,
  },
  {
    key: "betterAuth",
    href: "https://www.better-auth.com/docs",
    external: true,
  },
] as const

export function LandingDocs() {
  const t = useTranslations("docs")

  return (
    <section id="docs" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          {t("title")}
        </h2>
        <p className="text-muted-foreground mt-4 text-center text-lg">
          {t("subtitle")}
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docsConfig.map(({ key, href, external }) => {
            const card = (
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {t(`${key}.title`)}
                    {external && <ExternalLinkIcon className="size-4" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t(`${key}.desc`)}</CardDescription>
                </CardContent>
              </Card>
            )
            return external ? (
              <a key={key} href={href} target="_blank" rel="noopener noreferrer">
                {card}
              </a>
            ) : (
              <Link key={key} href={href}>
                {card}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
