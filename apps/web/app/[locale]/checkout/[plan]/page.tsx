"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter, useParams } from "next/navigation"
import { Link } from "@/i18n/navigation"
import { LandingNavbar } from "@/components/landing-navbar"
import { authClient } from "@/lib/auth-client"
import { getInvalidNameChars, toSlugFormat } from "@/lib/validation"
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

export default function CheckoutPlanPage() {
  const t = useTranslations("checkout")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const params = useParams()
  const plan = params.plan as string
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [status, setStatus] = useState<"loading" | "redirecting" | "create_org" | "error">("loading")
  const [error, setError] = useState<string | null>(null)
  const [orgs, setOrgs] = useState<{ id: string; slug: string }[] | null>(null)
  const [createName, setCreateName] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (sessionPending) return
    if (!session) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(`/checkout/${plan}`)}`)
      return
    }
    loadOrgsAndCheckout()
  }, [session, sessionPending, plan, router])

  async function loadOrgsAndCheckout() {
    if (plan !== "pro") {
      setError(t("planNotFound"))
      setStatus("error")
      return
    }

    try {
      const orgsRes = await authClient.organization.list()
      const list = (orgsRes as { data?: { id: string; slug: string }[] })?.data ?? []
      setOrgs(list)

      const firstOrg = list[0]
      if (firstOrg) {
        setStatus("redirecting")
        const organizationId = firstOrg.id
        const result = await authClient.checkout({
          slug: "pro",
          referenceId: organizationId,
        })
        const res = result as { error?: { code?: string; message?: string }; code?: string; message?: string }
        const err = res.error ?? (res.code ? { code: res.code, message: res.message } : null)
        if (err) {
          const e = new Error(err.message ?? "Checkout failed") as Error & { code?: string }
          e.code = err.code
          throw e
        }
        setStatus("loading")
      } else {
        setStatus("create_org")
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tCommon("errorGeneric")
      const code = err instanceof Error && "code" in err ? (err as { code?: string }).code : null
      const isBillingDisabled =
        typeof msg === "string" &&
        (msg.toLowerCase().includes("billing") ||
          msg.toLowerCase().includes("not configured") ||
          msg.toLowerCase().includes("polar") ||
          msg.includes("503"))
      const isCheckoutFailed = code === "CHECKOUT_CREATION_FAILED" || msg.toLowerCase().includes("checkout creation failed")
      setError(
        isBillingDisabled ? t("billingNotConfigured") : isCheckoutFailed ? t("checkoutCreationFailed") : msg
      )
      setStatus("error")
    }
  }

  async function handleCreateAndCheckout(e: React.FormEvent) {
    e.preventDefault()
    if (creating || status !== "create_org") return
    const name = createName.trim()
    const slug = toSlugFormat(name)
    if (!name || getInvalidNameChars(name).length > 0) return
    setCreating(true)
    setError(null)
    try {
      const result = await authClient.organization.create({ name, slug })
      if ((result as { error?: { message?: string } })?.error) {
        throw new Error((result as { error: { message?: string } }).error.message)
      }
      const org = (result as { data?: { id: string; slug: string } })?.data
      if (org) {
        setStatus("redirecting")
        const checkoutResult = await authClient.checkout({
          slug: "pro",
          referenceId: org.id,
        })
        const res = checkoutResult as { error?: { code?: string; message?: string }; code?: string; message?: string }
        const err = res.error ?? (res.code ? { code: res.code, message: res.message } : null)
        if (err) {
          const e = new Error(err.message ?? "Checkout failed") as Error & { code?: string }
          e.code = err.code
          throw e
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : tCommon("errorGeneric")
      const code = err instanceof Error && "code" in err ? (err as { code?: string }).code : null
      const isBillingDisabled =
        typeof msg === "string" &&
        (msg.toLowerCase().includes("billing") ||
          msg.toLowerCase().includes("not configured") ||
          msg.toLowerCase().includes("polar") ||
          msg.includes("503"))
      const isCheckoutFailed = code === "CHECKOUT_CREATION_FAILED" || msg.toLowerCase().includes("checkout creation failed")
      setError(isBillingDisabled ? t("billingNotConfigured") : isCheckoutFailed ? t("checkoutCreationFailed") : msg)
    } finally {
      setCreating(false)
    }
  }

  if (status === "error") {
    return (
      <div className="min-h-svh flex flex-col">
        <LandingNavbar />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
          <p className="text-destructive text-center">{error}</p>
          <Link href="/" className="text-primary underline">
            {tCommon("backToHome")}
          </Link>
        </div>
      </div>
    )
  }

  if (status === "create_org") {
    return (
      <div className="min-h-svh flex flex-col">
        <LandingNavbar />
        <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t("createWorkspaceTitle")}</CardTitle>
            <CardDescription>{t("createWorkspaceDesc")}</CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateAndCheckout}>
            <CardContent className="space-y-4">
              {error && <p className="text-destructive text-sm">{error}</p>}
              <div className="space-y-2">
                <Label htmlFor="org-name">{t("businessName")}</Label>
                <Input
                  id="org-name"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={t("businessPlaceholder")}
                  required
                  aria-invalid={getInvalidNameChars(createName).length > 0}
                />
                {createName.trim() && (
                  <p className="text-muted-foreground text-xs">
                    {t("slugPreview", { slug: toSlugFormat(createName) || "…" })}
                  </p>
                )}
                {getInvalidNameChars(createName).length > 0 && (
                  <p className="text-destructive text-xs font-medium">
                    {t("invalidChars", { chars: getInvalidNameChars(createName).join(" ") })}
                  </p>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                type="submit"
                className="flex-1"
                disabled={
                  creating ||
                  !createName.trim() ||
                  getInvalidNameChars(createName).length > 0 ||
                  !toSlugFormat(createName)
                }
              >
                {creating ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    {t("creating")}
                  </>
                ) : (
                  t("continueToPayment")
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/">{tCommon("cancel")}</Link>
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4">
        <Loader2Icon className="text-primary size-10 animate-spin" />
        <p className="text-muted-foreground text-center">
          {status === "redirecting" ? t("redirectingToCheckout") : tCommon("loading")}
        </p>
      </div>
    </div>
  )
}
