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
import { ExternalLinkIcon, GithubIcon, FileTextIcon } from "lucide-react"

const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
const REPO_URL = "https://github.com/Ripdiegozz/saas-monorepo-template"
const scalarUrl = `${apiUrl.replace(/\/$/, "")}/scalar`

const otherDocsConfig = [
  { key: "polar", href: "https://polar.sh/docs" },
  { key: "betterAuth", href: "https://www.better-auth.com/docs" },
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

        <div className="mt-12 flex flex-col gap-4">
          <Card className="flex-1 min-w-0 border-primary/30 bg-primary/5 transition-shadow hover:shadow-lg hover:border-primary/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                {t("architecture.title")}
              </CardTitle>
              <CardDescription className="text-base">
                {t("architecture.desc")}
                {" "}
                {t("architecture.extra")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
              <Link
                href="/docs"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <FileTextIcon className="size-4 shrink-0" />
                {t("architecture.docsLink")}
              </Link>
              <a
                href={scalarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <ExternalLinkIcon className="size-4 shrink-0" />
                {t("architecture.apiDocLink")}
              </a>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <GithubIcon className="size-4 shrink-0" />
                {t("architecture.repoLink")}
              </a>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            {otherDocsConfig.map(({ key, href }) => {
              const card = (
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {t(`${key}.title`)}
                      <ExternalLinkIcon className="size-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{t(`${key}.desc`)}</CardDescription>
                  </CardContent>
                </Card>
              )
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {card}
                </a>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
