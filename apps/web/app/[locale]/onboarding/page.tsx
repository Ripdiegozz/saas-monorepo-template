"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { useForm } from "@tanstack/react-form"
import { authClient } from "@/lib/auth-client"
import { isValidSlug, toSlugFormat } from "@/lib/validation"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Loader2Icon } from "lucide-react"

export default function OnboardingPage() {
  const t = useTranslations("onboarding")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [orgs, setOrgs] = useState<{ id: string; slug: string }[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { name: "", slug: "" },
    onSubmit: async ({ value }) => {
      if (creating) return
      setCreating(true)
      setError(null)
      try {
        const finalSlug =
          value.slug.trim() || toSlugFormat(value.name.trim())
        const result = await authClient.organization.create({
          name: value.name.trim(),
          slug: finalSlug,
        })
        if ((result as { error?: { message?: string } })?.error)
          throw new Error((result as { error: { message?: string } }).error.message)
        const org = (result as { data?: { id: string; slug: string } })?.data
        if (org) {
          router.push(`/tenant/${org.slug}/dashboard`)
        } else {
          const listRes = await authClient.organization.list()
          const list = (listRes as { data?: { id: string; slug: string }[] })?.data ?? []
          setOrgs(list)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t("errorCreate"))
      } finally {
        setCreating(false)
      }
    },
  })

  useEffect(() => {
    if (!session) return
    authClient.organization
      .list()
      .then((res) => {
        const list = (res as { data?: { id: string; slug: string }[] })?.data ?? []
        setOrgs(list)
      })
      .catch(() => setOrgs([]))
      .finally(() => setLoading(false))
  }, [session])

  useEffect(() => {
    if (!isPending && !session) router.replace("/login")
  }, [session, isPending, router])

  const handleSelectOrg = (slug: string) => {
    router.push(`/tenant/${slug}/dashboard`)
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2Icon className="text-muted-foreground size-8 animate-spin" />
      </div>
    )
  }

  if (loading && orgs === null) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2Icon className="text-muted-foreground size-8 animate-spin" />
      </div>
    )
  }

  if (orgs && orgs.length > 0) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("chooseBusiness")}</CardTitle>
            <CardDescription>{t("chooseDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {orgs.map((org) => (
              <Button
                key={org.id}
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleSelectOrg(org.slug)}
              >
                {org.slug}
              </Button>
            ))}
          </CardContent>
          <CardFooter>
            <Button variant="ghost" asChild>
              <Link href="/">{t("backToHome")}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("createFirst")}</CardTitle>
          <CardDescription>{t("createDesc")}</CardDescription>
        </CardHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (creating) return
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
                  <Label htmlFor="name">{t("businessName")}</Label>
                  <Input
                    id="name"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder={t("businessPlaceholder")}
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
              name="slug"
              validators={{
                onChange: ({ value }) => {
                  const v = (value ?? "").trim()
                  if (!v) return undefined
                  if (!isValidSlug(v)) return t("invalidSlug")
                  return undefined
                },
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor="slug">{t("slugLabel")}</Label>
                  <Input
                    id="slug"
                    value={field.state.value}
                    onChange={(e) =>
                      field.handleChange(toSlugFormat(e.target.value))
                    }
                    placeholder={t("slugPlaceholder")}
                    aria-invalid={!!field.state.meta.errors?.length}
                  />
                  <p className="text-muted-foreground text-xs">
                    {t("slugHint", {
                      slug: field.state.value || t("slugPlaceholder"),
                    })}
                  </p>
                  {field.state.meta.errors?.[0] && (
                    <p className="text-destructive text-xs">
                      {field.state.meta.errors[0]}
                    </p>
                  )}
                </div>
              )}
            </form.Field>
          </CardContent>
          <CardFooter className="flex gap-2">
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || creating}
                >
                  {creating || isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      {t("creating")}
                    </>
                  ) : (
                    t("createBusiness")
                  )}
                </Button>
              )}
            </form.Subscribe>
            <Button variant="ghost" asChild>
              <Link href="/">{tCommon("cancel")}</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
