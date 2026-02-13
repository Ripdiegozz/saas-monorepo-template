"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
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
import { Loader2Icon } from "lucide-react"

export default function HomePage() {
  const t = useTranslations("home")
  const tCommon = useTranslations("common")
  const appName = useTranslations("common")("appName")
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
    if (welcomeLoading) return
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
        setWelcomeError(signUpError.message ?? t("errorCreateAccount"))
        setWelcomeLoading(false)
        return
      }
      const result = await postAdminBootstrap()
      if (result.success && result.isSuperAdmin) {
        router.push("/admin")
      } else {
        setWelcomeError(result.message ?? t("errorSetup"))
      }
    } catch (err) {
      setWelcomeError(err instanceof Error ? err.message : t("errorGeneric"))
    } finally {
      setWelcomeLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">{tCommon("loading")}</p>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">{tCommon("redirecting")}</p>
      </div>
    )
  }

  if (needsSetup === null) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">{tCommon("loading")}</p>
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
              <CardTitle>{t("welcomeTitle", { appName })}</CardTitle>
              <CardDescription>{t("welcomeDesc")}</CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateFirstAdmin}>
              <CardContent className="space-y-4">
                {welcomeError && (
                  <p className="text-destructive text-sm">{welcomeError}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="name">{t("name")}</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder={t("namePlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{tCommon("email")}</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{tCommon("password")}</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={t("passwordPlaceholder")}
                    required
                    minLength={8}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={welcomeLoading}>
                  {welcomeLoading ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      {t("creatingAdmin")}
                    </>
                  ) : (
                    t("createAdmin")
                  )}
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
        {t("footer", { appName })}
      </footer>
    </div>
  )
}
