"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter, useParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { Loader2Icon } from "lucide-react"

export default function CheckoutPlanPage() {
  const t = useTranslations("checkout")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const params = useParams()
  const plan = params.plan as string
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [status, setStatus] = useState<"loading" | "redirecting" | "error">("loading")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionPending) return
    if (!session) {
      router.replace(`/login?callbackUrl=${encodeURIComponent(`/checkout/${plan}`)}`)
      return
    }
    startCheckout()
  }, [session, sessionPending, plan, router])

  async function startCheckout() {
    if (plan !== "pro") {
      setError(t("planNotFound"))
      setStatus("error")
      return
    }

    setStatus("redirecting")
    try {
      const orgsRes = await authClient.organization.list()
      const orgs = (orgsRes as { data?: { id: string; slug: string }[] })?.data ?? []

      if (orgs.length === 0) {
        router.replace(`/onboarding?callbackUrl=${encodeURIComponent(`/checkout/${plan}`)}`)
        return
      }

      const organizationId = orgs[0].id
      const result = await authClient.checkout({
        slug: "pro",
        referenceId: organizationId,
      })

      if ((result as { error?: { message?: string } })?.error) {
        throw new Error((result as { error: { message?: string } }).error.message)
      }

      // checkout() typically redirects to Polar - if we get here without redirect, show message
      setStatus("loading")
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("errorGeneric"))
      setStatus("error")
    }
  }

  if (status === "error") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
        <p className="text-destructive text-center">{error}</p>
        <a href="/" className="text-primary underline">
          {tCommon("backToHome")}
        </a>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <Loader2Icon className="text-primary size-10 animate-spin" />
      <p className="text-muted-foreground text-center">
        {status === "redirecting" ? t("redirectingToCheckout") : tCommon("loading")}
      </p>
    </div>
  )
}
