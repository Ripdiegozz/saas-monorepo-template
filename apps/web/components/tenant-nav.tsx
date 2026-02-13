"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { useTenant } from "@/components/tenant-provider"
import { Button } from "@workspace/ui/components/button"
import {
  CalendarIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react"

type NavItem = {
  href: string
  key: string
  icon: React.ComponentType<{ className?: string }>
}

export function TenantNav() {
  const t = useTranslations("nav")
  const { organization, isLoading } = useTenant()

  if (isLoading || !organization) return null

  const base = `/tenant/${organization.slug}`
  const items: NavItem[] = [
    { href: `${base}/dashboard`, key: "dashboard", icon: LayoutDashboardIcon },
    { href: `${base}/services`, key: "services", icon: Settings2Icon },
    { href: `${base}/team`, key: "team", icon: UsersIcon },
    { href: `${base}/calendar`, key: "calendar", icon: CalendarIcon },
  ]

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {items.map(({ href, key, icon: Icon }) => (
        <Button key={href} variant="outline" size="sm" asChild>
          <Link href={href} className="flex items-center gap-2">
            <Icon className="size-4" />
            {t(key)}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
