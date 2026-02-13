"use client"

import Link from "next/link"
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
  label: string
  icon: React.ComponentType<{ className?: string }>
}

export function TenantNav() {
  const { organization, isLoading } = useTenant()

  if (isLoading || !organization) return null

  const base = `/tenant/${organization.slug}`
  const items: NavItem[] = [
    { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboardIcon },
    { href: `${base}/services`, label: "Servicios", icon: Settings2Icon },
    { href: `${base}/team`, label: "Equipo", icon: UsersIcon },
    { href: `${base}/calendar`, label: "Calendario", icon: CalendarIcon },
  ]

  return (
    <nav className="flex flex-wrap items-center gap-2">
      {items.map(({ href, label, icon: Icon }) => (
        <Button key={href} variant="outline" size="sm" asChild>
          <Link href={href} className="flex items-center gap-2">
            <Icon className="size-4" />
            {label}
          </Link>
        </Button>
      ))}
    </nav>
  )
}
