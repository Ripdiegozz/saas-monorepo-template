"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useTenant } from "@/components/tenant-provider"
import { TenantNav } from "@/components/tenant-nav"
import { authClient } from "@/lib/auth-client"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { UserPlusIcon, CopyIcon, CheckIcon, Loader2Icon } from "lucide-react"

export default function TeamPage() {
  const t = useTranslations("tenant.team")
  const { organizationId, organization, isLoading, error } = useTenant()
  const [email, setEmail] = useState("")
  const [inviting, setInviting] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteLink, setInviteLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inviting) return
    if (!organizationId || !email.trim()) return
    setInviting(true)
    setInviteError(null)
    setInviteLink(null)
    try {
      const res = await authClient.organization.inviteMember({
        email: email.trim(),
        role: "member",
        organizationId,
      })
      if ((res as { error?: { message?: string } })?.error) {
        throw new Error((res as { error: { message?: string } }).error.message)
      }
      const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
      const inv = (res as { data?: { id: string } })?.data
      if (inv?.id) {
        setInviteLink(`${baseUrl}/accept-invitation/${inv.id}`)
      }
      setEmail("")
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : t("errorInvite"))
    } finally {
      setInviting(false)
    }
  }

  const copyLink = () => {
    if (!inviteLink) return
    void navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  if (isLoading || !organization) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {isLoading ? t("loading") : error ?? t("orgNotFound")}
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{organization.name} – {t("title")}</h1>
        <TenantNav />
      </div>
      <p className="text-muted-foreground mb-6">{t("subtitle")}</p>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlusIcon className="size-5" />
            {t("inviteEmployee")}
          </CardTitle>
          <CardDescription>{t("inviteDesc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleInvite} className="space-y-4">
            {inviteError && (
              <p className="text-destructive text-sm">{inviteError}</p>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">{t("employeeEmail")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("emailPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={inviting}>
              {inviting ? (
                <>
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                  {t("sending")}
                </>
              ) : (
                t("sendInvitation")
              )}
            </Button>
          </form>

          {inviteLink && (
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <p className="text-sm font-medium">{t("inviteLink")}</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <div className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2">
                  <p className="break-all text-muted-foreground text-xs">
                    {inviteLink}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <CheckIcon className="mr-2 size-4 text-green-600" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <CopyIcon className="mr-2 size-4" />
                      {t("copyLink")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
