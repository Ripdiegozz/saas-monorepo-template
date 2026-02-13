"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
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
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")

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

  const handleCreateOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setError(null)
    try {
      const result = await authClient.organization.create({
        name: name.trim(),
        slug: slug.trim() || name.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
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
  }

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
        <form onSubmit={handleCreateOrg}>
          <CardContent className="space-y-4">
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="space-y-2">
              <Label htmlFor="name">{t("businessName")}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (!slug || slug === name.toLowerCase().replace(/\s+/g, "-"))
                    setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))
                }}
                placeholder={t("businessPlaceholder")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">{t("slugLabel")}</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""))}
                placeholder={t("slugPlaceholder")}
              />
              <p className="text-muted-foreground text-xs">
                {t("slugHint", { slug: slug || t("slugPlaceholder") })}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button type="submit" disabled={creating}>
              {creating ? t("creating") : t("createBusiness")}
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/">{tCommon("cancel")}</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
