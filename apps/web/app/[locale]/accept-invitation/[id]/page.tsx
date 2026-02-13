"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useParams } from "next/navigation"
import { useRouter } from "@/i18n/navigation"
import { Link } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Loader2Icon, CheckCircleIcon, XCircleIcon } from "lucide-react"
export default function AcceptInvitationPage() {
  const t = useTranslations("invitation")
  const tCommon = useTranslations("common")
  const params = useParams()
  const router = useRouter()
  const invitationId = params.id as string
  const { data: session, isPending } = authClient.useSession()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    if (!invitationId) return

    const run = async () => {
      if (isPending) return
      if (!session) {
        router.replace(`/login?callbackUrl=${encodeURIComponent(`/accept-invitation/${invitationId}`)}`)
        return
      }

      try {
        const { data, error } = await authClient.organization.acceptInvitation({
          invitationId,
        })
        if (error) {
          throw new Error(error.message ?? t("errorAccept"))
        }
        const slug = (data as { organization?: { slug: string } } | undefined)?.organization?.slug
        setStatus("success")
        if (slug) {
          router.replace(`/tenant/${slug}/dashboard`)
        } else {
          router.replace("/onboarding")
        }
      } catch (err) {
        setStatus("error")
        setMessage(err instanceof Error ? err.message : t("errorAccept"))
      }
    }

    void run()
  }, [invitationId, session, isPending, router])

  if (isPending || status === "loading") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
        <Loader2Icon className="size-10 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">{t("processing")}</p>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-4">
        <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
          <XCircleIcon className="size-12 text-red-600 dark:text-red-400" />
        </div>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{t("invalid")}</CardTitle>
            <CardDescription>{message}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">{tCommon("backToHome")}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-4">
      <CheckCircleIcon className="size-10 text-green-600" />
      <p className="text-muted-foreground">{t("redirecting")}</p>
    </div>
  )
}
