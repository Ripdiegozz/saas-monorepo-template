"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
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

const chartConfig = {
  orgs: { label: "Organizaciones", color: "var(--chart-1)" },
  users: { label: "Usuarios", color: "var(--chart-2)" },
  bookings: { label: "Reservas", color: "var(--chart-3)" },
} satisfies ChartConfig

const MONTH_LABELS: Record<string, string> = {
  "01": "Ene", "02": "Feb", "03": "Mar", "04": "Abr", "05": "May", "06": "Jun",
  "07": "Jul", "08": "Ago", "09": "Sep", "10": "Oct", "11": "Nov", "12": "Dic",
}

function formatMonth(ym: string) {
  const [, m] = ym.split("-")
  return (m && MONTH_LABELS[m]) ?? ym
}

export default function AdminPage() {
  const [orgs, setOrgs] = useState<AdminOrganization[]>([])
  const [users, setUsers] = useState<AdminUser[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resetUser, setResetUser] = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

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
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Error al cargar")
      )
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
      if (err) throw new Error(err.message ?? "Error al restablecer contraseña")
      setResetUser(null)
      setNewPassword("")
    } catch (e) {
      setResetError(
        e instanceof Error ? e.message : "Error al restablecer contraseña"
      )
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
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
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
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Platform Admin
        </h1>
        <p className="text-muted-foreground mt-1">
          Administra organizaciones, usuarios y reservas de la plataforma
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Organizaciones
            </CardTitle>
            <Building2Icon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalOrgs ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <UsersIcon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalUsers ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservas</CardTitle>
            <CalendarIcon className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats?.totalBookings ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Actividad últimos 6 meses</CardTitle>
            <CardDescription>
              Nuevas organizaciones, usuarios y reservas por mes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="min-h-[240px] w-full">
              <BarChart
                data={chartData}
                accessibilityLayer
                margin={{ left: 0, right: 0 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="monthLabel"
                  tickLine={false}
                  tickMargin={8}
                  axisLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="orgs"
                  fill="var(--color-orgs)"
                  radius={4}
                />
                <Bar
                  dataKey="users"
                  fill="var(--color-users)"
                  radius={4}
                />
                <Bar
                  dataKey="bookings"
                  fill="var(--color-bookings)"
                  radius={4}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Tabs: Orgs & Users */}
      <Tabs defaultValue="orgs" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="orgs">Organizaciones</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>
        <TabsContent value="orgs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Organizaciones</CardTitle>
              <CardDescription>
                Todas las organizaciones en la plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orgs.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No hay organizaciones aún
                </p>
              ) : (
                <ScrollArea className="h-[320px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="hidden sm:table-cell">Slug</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orgs.map((org) => (
                        <TableRow key={org.id}>
                          <TableCell className="font-medium">{org.name}</TableCell>
                          <TableCell className="hidden sm:table-cell">
                            {org.slug}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={`/tenant/${org.slug}/dashboard`}>
                                <ExternalLinkIcon className="mr-1 size-3" />
                                Ver
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
              <CardTitle>Usuarios</CardTitle>
              <CardDescription>
                Todos los usuarios registrados. Puedes restablecer contraseñas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {users.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">
                  No hay usuarios aún
                </p>
              ) : (
                <ScrollArea className="h-[320px] w-full rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead className="hidden md:table-cell">Email</TableHead>
                        <TableHead className="hidden lg:table-cell">Registro</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u.id}>
                          <TableCell className="font-medium">{u.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {u.email}
                          </TableCell>
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
                                <DropdownMenuItem
                                  onClick={() => setResetUser(u)}
                                >
                                  <KeyRoundIcon className="mr-2 size-4" />
                                  Restablecer contraseña
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

      {/* Reset password dialog */}
      <Dialog open={!!resetUser} onOpenChange={(open) => !open && setResetUser(null)}>
        <DialogContent showClose={true}>
          <DialogHeader>
            <DialogTitle>Restablecer contraseña</DialogTitle>
            <DialogDescription>
              Nueva contraseña para {resetUser?.name} ({resetUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">Nueva contraseña</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            {resetError && (
              <p className="text-destructive text-sm">{resetError}</p>
            )}
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
              Cancelar
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
              Restablecer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
