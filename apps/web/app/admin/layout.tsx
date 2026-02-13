"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { getAdminStatus, postAdminEnsureDefaultOrg } from "@/lib/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  LayoutDashboardIcon,
  Building2Icon,
  UsersIcon,
  PanelLeftCloseIcon,
  PanelLeftIcon,
  LogOutIcon,
} from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    if (isPending) return
    if (!session) {
      router.replace("/login")
      return
    }
    getAdminStatus()
      .then((status) => {
        if (status.needsBootstrap) {
          router.replace("/setup")
          return
        }
        if (!status.isSuperAdmin) {
          router.replace("/tenant/default/dashboard")
          return
        }
        void postAdminEnsureDefaultOrg()
      })
      .catch(() => router.replace("/login"))
  }, [session, isPending, router])

  if (isPending || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  const nav = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon },
    { href: "/tenant/default/dashboard", label: "Mi organización", icon: Building2Icon },
  ]

  return (
    <div className="min-h-svh bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="flex h-14 items-center gap-2 px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen((o) => !o)}
          >
            {sidebarOpen ? (
              <PanelLeftCloseIcon className="size-5" />
            ) : (
              <PanelLeftIcon className="size-5" />
            )}
          </Button>
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="hidden sm:inline">Platform Admin</span>
          </Link>
          <div className="flex flex-1 items-center justify-end gap-2">
            <span className="text-muted-foreground hidden max-w-[140px] truncate text-sm sm:inline">
              {session.user.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => authClient.signOut().then(() => router.push("/"))}
            >
              <LogOutIcon className="mr-1 size-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-56 border-r bg-card pt-14 transition-transform lg:static lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <nav className="flex flex-col gap-1 p-4">
            {nav.map(({ href, label, icon: Icon }) => (
              <Button
                key={href}
                variant="ghost"
                className="w-full justify-start gap-2"
                asChild
              >
                <Link href={href}>
                  <Icon className="size-4" />
                  {label}
                </Link>
              </Button>
            ))}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
