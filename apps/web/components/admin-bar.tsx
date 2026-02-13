"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Link, usePathname } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { getAdminStatus } from "@/lib/api-client"
import { LayoutDashboardIcon, Building2Icon } from "lucide-react"

const LAST_TENANT_KEY = "admin-last-tenant-slug"

export function getLastTenantSlug(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem(LAST_TENANT_KEY)
}

export function setLastTenantSlug(slug: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(LAST_TENANT_KEY, slug)
}

export function AdminBar() {
  const t = useTranslations("nav")
  const pathname = usePathname()
  const showPanelLink = !pathname.includes("/admin")
  const { data: session, isPending } = authClient.useSession()
  const [isAdmin, setIsAdmin] = useState(false)
  const [lastSlug, setLastSlug] = useState<string | null>(null)

  useEffect(() => {
    if (!session || isPending) return
    getAdminStatus()
      .then((status) => setIsAdmin(status.isSuperAdmin))
      .catch(() => setIsAdmin(false))
  }, [session, isPending])

  useEffect(() => {
    setLastSlug(getLastTenantSlug())
  }, [pathname])

  if (!session || !isAdmin) return null
  if (!showPanelLink && !lastSlug) return null

  return (
    <div className="border-b bg-muted/50 px-4 py-1.5">
      <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 text-sm">
        {showPanelLink && (
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <LayoutDashboardIcon className="size-4" />
            {t("adminPanel")}
          </Link>
        )}
        {lastSlug && (
          <Link
            href={`/tenant/${lastSlug}/dashboard`}
            className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Building2Icon className="size-4" />
            {t("lastOrganization")}
          </Link>
        )}
      </div>
    </div>
  )
}
