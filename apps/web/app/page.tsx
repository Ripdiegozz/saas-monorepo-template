"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { getAdminStatus, getNeedsSetup, postAdminBootstrap } from "@/lib/api-client"
import { LandingNavbar } from "@/components/landing-navbar"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingPricing } from "@/components/landing/landing-pricing"
import { LandingDocs } from "@/components/landing/landing-docs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"

const APP_NAME = "Booking SaaS"

export default function HomePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)
  const [welcomeLoading, setWelcomeLoading] = useState(false)
  const [welcomeError, setWelcomeError] = useState<string | null>(null)

  useEffect(() => {
    if (isPending) return
    if (!session) return
    getAdminStatus()
      .then((status) => {
        if (status.needsBootstrap) {
          router.replace("/setup")
        } else if (status.isSuperAdmin) {
          router.replace("/admin")
        } else {
          router.replace("/onboarding")
        }
      })
      .catch(() => {})
  }, [session, isPending, router])

  useEffect(() => {
    if (session) return
    getNeedsSetup()
      .then((r) => setNeedsSetup(r.needsSetup))
      .catch(() => setNeedsSetup(false))
  }, [session])

  async function handleCreateFirstAdmin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem("name") as HTMLInputElement).value
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    setWelcomeError(null)
    setWelcomeLoading(true)
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/",
        fetchOptions: { redirect: "manual" },
      })
      if (signUpError) {
        setWelcomeError(signUpError.message ?? "Error al crear cuenta")
        setWelcomeLoading(false)
        return
      }
      const result = await postAdminBootstrap()
      if (result.success && result.isSuperAdmin) {
        router.push("/admin")
      } else {
        setWelcomeError(result.message ?? "Error en el setup")
      }
    } catch (err) {
      setWelcomeError(err instanceof Error ? err.message : "Algo salió mal")
    } finally {
      setWelcomeLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Redirigiendo…</p>
      </div>
    )
  }

  if (needsSetup === null) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Cargando…</p>
      </div>
    )
  }

  if (needsSetup) {
    return (
      <div className="min-h-svh flex flex-col">
        <LandingNavbar />
        <div className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Bienvenido a {APP_NAME}</CardTitle>
              <CardDescription>
                Es la primera vez. Crea el admin inicial con email y contraseña.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateFirstAdmin}>
              <CardContent className="space-y-4">
                {welcomeError && (
                  <p className="text-destructive text-sm">{welcomeError}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="admin@ejemplo.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    required
                    minLength={8}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={welcomeLoading}>
                  {welcomeLoading ? "Creando admin…" : "Crear admin"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh flex flex-col">
      <LandingNavbar />
      <LandingHero />
      <LandingFeatures />
      <LandingPricing />
      <LandingDocs />
      <footer className="border-t px-4 py-8 text-center text-sm text-muted-foreground">
        {APP_NAME} · Boilerplate multi-tenant con Polar.sh
      </footer>
    </div>
  )
}
