"use client"

import { useEffect, useState } from "react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import {
  getAdminOrganizations,
  getAdminUsers,
  getAdminStats,
  type AdminOrganization,
  type AdminUser,
  type AdminStats,
} from "@/lib/api-client"
import { authClient } from "@/lib/auth-client"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { ScrollArea, ScrollBar } from "@workspace/ui/components/scroll-area"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@workspace/ui/components/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import {
  Building2Icon,
  UsersIcon,
  CalendarIcon,
  MoreVerticalIcon,
  KeyRoundIcon,
  ExternalLinkIcon,
  Loader2Icon,
} from "lucide-react"
import { Bar, BarChart, XAxis, CartesianGrid } from "recharts"

export default function AdminPage() {
  const t = useTranslations("admin")
  const tCommon = useTranslations("common")
  const [orgs, setOrgs] = useState<AdminOrganization[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resetUser, setResetUser] = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const chartConfig = {
    orgs: { label: t("organizations"), color: "var(--chart-1)" },
    users: { label: t("users"), color: "var(--chart-2)" },
    bookings: { label: t("bookings"), color: "var(--chart-3)" },
  } satisfies ChartConfig

  function formatMonth(ym: string) {
    const [, m] = ym.split("-")
    return (m && t(`months.${m}`)) ?? ym
  }

  useEffect(() => {
    Promise.all([
      getAdminOrganizations(),
      getAdminUsers(),
      getAdminStats(),
    ])
      .then(([o, u, s]) => {
        setOrgs(o)
        setUsers(u)
        setStats(s)
      })
      .catch((err) => setError(err instanceof Error ? err.message : t("errorLoad")))
      .finally(() => setLoading(false))
  }, [])

  const handleResetPassword = async () => {
    if (!resetUser || !newPassword.trim()) return
    setResetting(true)
    setResetError(null)
    try {
      const { error: err } = await authClient.admin.setUserPassword({
        userId: resetUser.id,
        newPassword: newPassword.trim(),
      })
      if (err) throw new Error(err.message ?? t("errorReset"))
      setResetUser(null)
      setNewPassword("")
    } catch (e) {
      setResetError(e instanceof Error ? e.message : t("errorReset"))
    } finally {
      setResetting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2Icon className="text-muted-foreground size-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("dashboardTitle")}</h1>
        <p className="text-destructive">{error}</p>
      </div>
    )
  }

  const chartData =
    stats?.chartData.map((d) => ({
      ...d,
      monthLabel: formatMonth(d.month),
    })) ?? []

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{t("title")}</h1>
        <p className="text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("organizations")}</CardTitle>
            <Building2Icon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalOrgs ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("users")}</CardTitle>
            <UsersIcon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("bookings")}</CardTitle>
            <CalendarIcon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalBookings ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("activityTitle")}</CardTitle>
            <CardDescription>{t("activityDesc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
              <BarChart data={chartData} accessibilityLayer margin={{ left: 0, right: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="monthLabel" tickLine={false} tickMargin={8} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="orgs" fill="var(--color-orgs)" radius={4} />
                <Bar dataKey="users" fill="var(--color-users)" radius={4} />
                <Bar dataKey="bookings" fill="var(--color-bookings)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="orgs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="orgs">{t("organizations")}</TabsTrigger>
          <TabsTrigger value="users">{t("users")}</TabsTrigger>
        </TabsList>
        <TabsContent value="orgs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("organizations")}</CardTitle>
              <CardDescription>{t("allOrgs")}</CardDescription>
            </CardHeader>
            <CardContent>
              {orgs.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">{t("noOrgs")}</p>
              ) : (
                <ScrollArea className="h-[320px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tCommon("name")}</TableHead>
                        <TableHead className="hidden sm:table-cell">{tCommon("slug")}</TableHead>
                        <TableHead className="text-right">{tCommon("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orgs.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell className="hidden sm:table-cell">{org.slug}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/tenant/${org.slug}/dashboard`}>
                                <ExternalLinkIcon className="mr-1 size-3" />
                                {tCommon("view")}
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("users")}</CardTitle>
              <CardDescription>{t("allUsers")}</CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">{t("noUsers")}</p>
              ) : (
                <ScrollArea className="h-[320px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tCommon("name")}</TableHead>
                        <TableHead className="hidden md:table-cell">{tCommon("email")}</TableHead>
                        <TableHead className="hidden lg:table-cell">{t("registered")}</TableHead>
                        <TableHead className="text-right">{tCommon("actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="hidden md:table-cell">{u.email}</TableCell>
                          <TableCell className="text-muted-foreground hidden text-sm lg:table-cell">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVerticalIcon className="size-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setResetUser(u)}>
                                  <KeyRoundIcon className="mr-2 size-4" />
                                  {t("resetPassword")}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <ScrollBar orientation="vertical" />
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!resetUser} onOpenChange={(open) => !open && setResetUser(null)}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>{t("resetPassword")}</DialogTitle>
            <DialogDescription>
              {resetUser && t("resetPasswordFor", { name: resetUser.name, email: resetUser.email })}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">{t("newPassword")}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
              />
            </div>
            {resetError && <p className="text-destructive text-sm">{resetError}</p>}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetUser(null)
                setNewPassword("")
                setResetError(null)
              }}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={!newPassword.trim() || newPassword.length < 8 || resetting}
            >
              {resetting ? (
                <Loader2Icon className="mr-2 size-4 animate-spin" />
              ) : (
                <KeyRoundIcon className="mr-2 size-4" />
              )}
              {t("reset")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
