"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { authClient } from "@/lib/auth-client"
import { postAdminBootstrap } from "@/lib/api-client"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Loader2Icon } from "lucide-react"

export default function SetupPage() {
  const t = useTranslations("auth.setup")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isPending && !session) router.replace("/login")
  }, [session, isPending, router])

  async function handleBootstrap() {
    if (loading) return
    setError(null)
    setLoading(true)
    try {
      const result = await postAdminBootstrap()
      if (result.success && result.isSuperAdmin) {
        router.push("/admin")
      } else {
        setError(result.message ?? t("bootstrapFailed"))
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : tCommon("errorGeneric"))
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/")
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">{tCommon("loading")}</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="text-destructive text-sm">{error}</p>}
          <p className="text-muted-foreground text-sm">{t("superAdminNote")}</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleBootstrap}
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                {t("settingUp")}
              </>
            ) : (
              t("complete")
            )}
          </Button>
          <Button variant="ghost" onClick={handleSignOut} className="w-full">
            {t("signOut")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
