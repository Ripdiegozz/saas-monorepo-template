"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useSearchParams } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { useForm } from "@tanstack/react-form"
import { getNeedsSetup } from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"
import { getAdminStatus } from "@/lib/api-client"
import { isValidEmail } from "@/lib/validation"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ArrowLeftIcon, Loader2Icon } from "lucide-react"

export default function SignupPage() {
  const t = useTranslations("auth.signup")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    defaultValues: { name: "", email: "", password: "" },
    onSubmit: async ({ value }) => {
      if (loading) return
      setError(null)
      setLoading(true)
      try {
        const { error: signUpError } = await authClient.signUp.email({
          name: value.name,
          email: value.email,
          password: value.password,
          callbackURL: "/",
          fetchOptions: { redirect: "manual" },
        })
        if (signUpError) {
          setError(signUpError.message ?? t("failed"))
          setLoading(false)
          return
        }
        if (callbackUrl && callbackUrl.startsWith("/")) {
          router.push(callbackUrl)
          return
        }
        const status = await getAdminStatus()
        if (status.needsBootstrap) {
          router.push("/setup")
        } else if (status.isSuperAdmin) {
          router.push("/admin")
        } else {
          router.push("/onboarding")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : tCommon("errorGeneric"))
      } finally {
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    getNeedsSetup()
      .then((r) => {
        if (r.needsSetup) router.replace("/")
      })
      .catch(() => {})
  }, [router])

  const loginHref = callbackUrl
    ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
    : "/login"

  return (
    <div className="relative flex min-h-svh items-center justify-center p-4">
      <Button variant="ghost" size="lg" className="absolute top-4 left-4" asChild>
        <Link href="/">
          <ArrowLeftIcon className="mr-2 size-5" />
          {tCommon("back")}
        </Link>
      </Button>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("desc")}</CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (loading) return
            form.handleSubmit()
          }}
        >
          <CardContent className="space-y-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <form.Field
              name="name"
              validators={{
                onChange: ({ value }) =>
                  !value?.trim() ? tCommon("fieldRequired") : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="name">{tCommon("name")}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={tCommon("namePlaceholder")}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={!!field.state.meta.errors?.length}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-xs">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  if (!value?.trim()) return tCommon("fieldRequired")
                  if (!isValidEmail(value)) return t("invalidEmail")
                  return undefined
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="email">{tCommon("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={!!field.state.meta.errors?.length}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-xs">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  if (!value?.trim()) return tCommon("fieldRequired")
                  if (value.length < 8) return t("passwordMin")
                  return undefined
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="password">{tCommon("password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={!!field.state.meta.errors?.length}
                  />
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-xs">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit || isSubmitting || loading}
                >
                  {loading || isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      {t("creating")}
                    </>
                  ) : (
                    t("submit")
                  )}
                </Button>
              )}
            </form.Subscribe>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">{tCommon("or")}</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled
              title={tCommon("comingSoon")}
            >
              {t("signUpGoogle")}
            </Button>
            <p className="text-muted-foreground text-center text-sm">
              {t("hasAccount")}{" "}
              <Link href={loginHref} className="text-primary underline">
                {t("logIn")}
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
