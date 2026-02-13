"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { CalendarDaysIcon, LayoutDashboardIcon, LogOutIcon, MenuIcon, XIcon } from "lucide-react"
import { getLastTenantSlug } from "@/components/admin-bar"

const navLinksConfig = [
  { href: "/#features", key: "features" },
  { href: "/#pricing", key: "pricing" },
  { href: "/#docs", key: "documentation" },
] as const

export function LandingNavbar() {
  const t = useTranslations("nav")
  const tCommon = useTranslations("common")
  const { data: session } = authClient.useSession()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [orgs, setOrgs] = useState<{ id: string; slug: string }[] | null>(null)

  useEffect(() => {
    if (!session) return
    authClient.organization
      .list()
      .then((res: unknown) => {
        const list = (res as { data?: { id: string; slug: string }[] })?.data ?? []
        setOrgs(list)
      })
      .catch(() => setOrgs([]))
  }, [session])

  const dashboardHref =
    orgs && orgs.length > 0
      ? `/tenant/${getLastTenantSlug() ?? orgs[0]?.slug ?? "default"}/dashboard`
      : "/onboarding"

  const appName = tCommon("appName")
  const name = session?.user?.name ?? ""
  const initials = name
    ? name.split(/\s+/).map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?"

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <CalendarDaysIcon className="size-6 text-primary" />
          <span className="hidden sm:inline">{appName}</span>
        </Link>

        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinksConfig.map(({ href, key }) => (
            <Link
              key={href}
              href={href}
              className="text-muted-foreground hover:text-foreground text-sm transition-colors"
            >
              {t(key)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="size-8">
                    <AvatarImage src={session.user?.image ?? undefined} alt={session.user?.name ?? ""} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {session.user?.name ?? session.user?.email ?? ""}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={dashboardHref} className="flex items-center gap-2">
                    <LayoutDashboardIcon className="size-4" />
                    {t("dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => authClient.signOut().then(() => (window.location.href = "/"))}
                  className="flex items-center gap-2 text-destructive focus:text-destructive"
                >
                  <LogOutIcon className="size-4" />
                  {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">{t("createAccount")}</Link>
              </Button>
            </>
          )}

          <ThemeToggle />
          <LocaleSwitcher />
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <XIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </Button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-t bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {navLinksConfig.map(({ href, key }) => (
              <Link
                key={href}
                href={href}
                className="text-muted-foreground hover:text-foreground py-2 text-sm"
                onClick={() => setMobileOpen(false)}
              >
                {t(key)}
              </Link>
            ))}
            {session ? (
              <>
                <Link
                  href={dashboardHref}
                  className="py-2 text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("dashboard")}
                </Link>
                <button
                  type="button"
                  className="py-2 text-left text-sm text-destructive"
                  onClick={() => {
                    setMobileOpen(false)
                    authClient.signOut().then(() => (window.location.href = "/"))
                  }}
                >
                  {t("signOut")}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="py-2 text-sm"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/signup"
                  className="py-2 font-medium text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  {t("createAccount")}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
