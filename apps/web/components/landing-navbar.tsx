"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { LocaleSwitcher } from "@/components/locale-switcher"
import { Button } from "@workspace/ui/components/button"
import { CalendarDaysIcon, MenuIcon, XIcon } from "lucide-react"
import { useState } from "react"

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

  const appName = tCommon("appName")

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
            <Button asChild size="sm">
              <Link href="/onboarding">{t("myDashboard")}</Link>
            </Button>
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
            {!session && (
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
