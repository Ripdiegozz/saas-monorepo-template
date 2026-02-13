"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { useLocale } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useTenant } from "@/components/tenant-provider"
import { TenantNav } from "@/components/tenant-nav"
import { authClient } from "@/lib/auth-client"
import { getProfile, type Profile } from "@/lib/api-client"
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
import { UserIcon, Building2Icon, CreditCardIcon, KeyRoundIcon, Loader2Icon } from "lucide-react"

export default function ProfilePage() {
  const t = useTranslations("tenant.profile")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const router = useRouter()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const { organizationId, organization, isLoading, error } = useTenant()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [changingPassword, setChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  useEffect(() => {
    if (sessionPending || !organizationId) return
    if (!session) {
      router.replace("/login")
      return
    }
    getProfile(organizationId)
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false))
  }, [session, sessionPending, organizationId, router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (changingPassword || !newPassword || !currentPassword) return
    setChangingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(false)
    try {
      const result = await authClient.changePassword({
        currentPassword,
        newPassword,
      })
      if ((result as { error?: { message?: string } })?.error) {
        throw new Error((result as { error: { message?: string } }).error.message)
      }
      setPasswordSuccess(true)
      setCurrentPassword("")
      setNewPassword("")
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : t("errorChangePassword"))
    } finally {
      setChangingPassword(false)
    }
  }

  const openBillingPortal = async () => {
    try {
      await authClient.customer.portal()
    } catch {
      // Portal may redirect; ignore errors
    }
  }

  if (isLoading || !organization) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">
          {isLoading ? tCommon("loading") : error ?? t("orgNotFound")}
        </p>
      </div>
    )
  }

  if (loading || !profile) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex min-h-[200px] items-center justify-center">
          <p className="text-muted-foreground">{tCommon("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{organization.name} – {t("title")}</h1>
        <TenantNav />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User info - visible to all */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="size-5" />
              {t("yourData")}
            </CardTitle>
            <CardDescription>{t("yourDataDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">{tCommon("name")}</Label>
              <p className="text-lg font-medium">{profile.user.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{tCommon("email")}</Label>
              <p className="text-lg font-medium">{profile.user.email}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("role")}</Label>
              <p className="text-lg font-medium capitalize">{profile.member.role}</p>
            </div>
          </CardContent>
        </Card>

        {/* Business info - visible to all */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2Icon className="size-5" />
              {t("business")}
            </CardTitle>
            <CardDescription>{t("businessDesc")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">{t("businessName")}</Label>
              <p className="text-lg font-medium">{profile.organization.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">{t("bookingUrl")}</Label>
              <p className="break-all text-muted-foreground text-sm">
                {typeof window !== "undefined"
                  ? `${window.location.origin}/${locale}/b/${profile.organization.slug}`
                  : `/${locale}/b/${profile.organization.slug}`}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Owner-only: Plan & Password */}
      {profile.member.isOwner && (
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          {/* Plan - owner only */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCardIcon className="size-5" />
                {t("plan")}
              </CardTitle>
              <CardDescription>{t("planDesc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-muted-foreground">{t("currentPlan")}</Label>
                <p className="text-lg font-medium capitalize">{profile.subscription?.plan ?? "free"}</p>
              </div>
              {profile.subscription?.currentPeriodEnd && (
                <div>
                  <Label className="text-muted-foreground">{t("periodEnd")}</Label>
                  <p className="text-muted-foreground text-sm">
                    {new Date(profile.subscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              )}
              <Button variant="outline" onClick={openBillingPortal}>
                {t("manageBilling")}
              </Button>
            </CardContent>
          </Card>

          {/* Change password - owner (and we could show to all, but user asked for owner) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <KeyRoundIcon className="size-5" />
                {t("changePassword")}
              </CardTitle>
              <CardDescription>{t("changePasswordDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {passwordError && (
                  <p className="text-destructive text-sm">{passwordError}</p>
                )}
                {passwordSuccess && (
                  <p className="text-green-600 text-sm">{t("passwordChanged")}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t("currentPassword")}</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder={tCommon("password")}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t("newPassword")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder={t("newPasswordPlaceholder")}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                  />
                </div>
                <Button type="submit" disabled={changingPassword}>
                  {changingPassword ? (
                    <>
                      <Loader2Icon className="mr-2 size-4 animate-spin" />
                      {t("changing")}
                    </>
                  ) : (
                    t("changePasswordSubmit")
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Employee: show change password option too - they may want to change their own */}
      {!profile.member.isOwner && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRoundIcon className="size-5" />
              {t("changePassword")}
            </CardTitle>
            <CardDescription>{t("changePasswordDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {passwordError && (
                <p className="text-destructive text-sm">{passwordError}</p>
              )}
              {passwordSuccess && (
                <p className="text-green-600 text-sm">{t("passwordChanged")}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="currentPasswordEmp">{t("currentPassword")}</Label>
                <Input
                  id="currentPasswordEmp"
                  type="password"
                  placeholder={tCommon("password")}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPasswordEmp">{t("newPassword")}</Label>
                <Input
                  id="newPasswordEmp"
                  type="password"
                  placeholder={t("newPasswordPlaceholder")}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <Button type="submit" disabled={changingPassword}>
                {changingPassword ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    {t("changing")}
                  </>
                ) : (
                  t("changePasswordSubmit")
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
