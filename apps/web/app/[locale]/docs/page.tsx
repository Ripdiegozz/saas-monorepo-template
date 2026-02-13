"use client"

import { useTranslations } from "next-intl"
import { LandingNavbar } from "@/components/landing-navbar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Link } from "@/i18n/navigation"
import { ArrowLeftIcon, CheckIcon, SquareIcon } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"
import { useEffect, useState } from "react"

const CHECKLIST_STORAGE_KEY = "production-checklist"

const checklistIds = [
  "envDatabase",
  "envAuthSecret",
  "envAuthOrigins",
  "envPublicUrls",
  "migrations",
  "superAdmin",
  "sslProxy",
  "polarConfig",
  "polarWebhook",
] as const

type ChecklistState = Record<(typeof checklistIds)[number], boolean>

function loadChecklist(): ChecklistState {
  if (typeof window === "undefined") {
    return Object.fromEntries(checklistIds.map((id) => [id, false])) as ChecklistState
  }
  try {
    const raw = localStorage.getItem(CHECKLIST_STORAGE_KEY)
    if (!raw) return Object.fromEntries(checklistIds.map((id) => [id, false])) as ChecklistState
    const parsed = JSON.parse(raw) as Partial<ChecklistState>
    return {
      ...Object.fromEntries(checklistIds.map((id) => [id, false])),
      ...parsed,
    } as ChecklistState
  } catch {
    return Object.fromEntries(checklistIds.map((id) => [id, false])) as ChecklistState
  }
}

function saveChecklist(state: ChecklistState) {
  if (typeof window === "undefined") return
  localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(state))
}

export default function ProductionChecklistPage() {
  const t = useTranslations("docsPage")
  const tCommon = useTranslations("common")
  const [state, setState] = useState<ChecklistState>(loadChecklist)

  useEffect(() => {
    setState(loadChecklist())
  }, [])

  const handleToggle = (id: (typeof checklistIds)[number]) => {
    const next = { ...state, [id]: !state[id] }
    setState(next)
    saveChecklist(next)
  }

  const completed = checklistIds.filter((id) => state[id]).length
  const total = checklistIds.length

  return (
    <div className="min-h-svh flex flex-col">
      <LandingNavbar />
      <div className="mx-auto flex-1 max-w-2xl px-4 py-12">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeftIcon className="mr-2 size-4" />
            {tCommon("back")}
          </Link>
        </Button>
        <h1 className="mt-8 text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        <p className="text-muted-foreground mt-1 text-sm">
          {t("progress", { completed, total })}
        </p>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("checklistTitle")}</CardTitle>
            <CardDescription>{t("checklistDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checklistIds.map((id) => (
              <label
                key={id}
                className="flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                onClick={() => handleToggle(id)}
              >
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={state[id]}
                  className={cn(
                    "mt-0.5 flex shrink-0 items-center justify-center rounded border transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    state[id]
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-input hover:bg-muted"
                  )}
                >
                  {state[id] ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <SquareIcon className="size-4 text-muted-foreground" />
                  )}
                </button>
                <div>
                  <span className="font-medium">{t(`checklist.${id}.title`)}</span>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {t(`checklist.${id}.desc`)}
                  </p>
                </div>
                {state[id] && (
                  <CheckIcon className="ml-auto size-5 shrink-0 text-green-600 dark:text-green-400" />
                )}
              </label>
            ))}
          </CardContent>
        </Card>

        <div className="mt-8 space-y-2 text-sm">
          <p className="text-muted-foreground">{t("referencesTitle")}</p>
          <div className="flex flex-wrap gap-2">
            <a
              href="https://github.com/Ripdiegozz/saas-monorepo-template/blob/main/docs/ARCHITECTURE.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {t("refArchitecture")}
            </a>
            <span className="text-muted-foreground">·</span>
            <a
              href="https://github.com/Ripdiegozz/saas-monorepo-template/blob/main/docs/DEPLOY_SELFHOST.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {t("refSelfHost")}
            </a>
            <span className="text-muted-foreground">·</span>
            <a
              href="https://github.com/Ripdiegozz/saas-monorepo-template/blob/main/docs/DEPLOY_DOKPLOY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {t("refDokploy")}
            </a>
            <span className="text-muted-foreground">·</span>
            <a
              href="https://github.com/Ripdiegozz/saas-monorepo-template/blob/main/docs/DEPLOY_COOLIFY.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              {t("refCoolify")}
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
