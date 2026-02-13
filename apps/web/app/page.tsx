"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { getAdminStatus, getNeedsSetup, postAdminBootstrap } from "@/lib/api-client"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"

const APP_NAME = "Booking SaaS"

export default function HomePage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [needsSetup, setNeedsSetup] = useState<boolean | null>(null)
  const [welcomeLoading, setWelcomeLoading] = useState(false)
  const [welcomeError, setWelcomeError] = useState<string | null>(null)

  useEffect(() => {
    if (isPending) return
    if (!session) return
    getAdminStatus()
      .then((status) => {
        if (status.needsBootstrap) {
          router.replace("/setup")
        } else if (status.isSuperAdmin) {
          router.replace("/admin")
        } else {
          router.replace("/tenant/default/dashboard")
        }
      })
      .catch(() => {})
  }, [session, isPending, router])

  useEffect(() => {
    if (session) return
    getNeedsSetup()
      .then((r) => setNeedsSetup(r.needsSetup))
      .catch(() => setNeedsSetup(false))
  }, [session])

  async function handleCreateFirstAdmin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const name = (form.elements.namedItem("name") as HTMLInputElement).value
    const email = (form.elements.namedItem("email") as HTMLInputElement).value
    const password = (form.elements.namedItem("password") as HTMLInputElement).value
    setWelcomeError(null)
    setWelcomeLoading(true)
    try {
      const { error: signUpError } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/",
        fetchOptions: { redirect: "manual" },
      })
      if (signUpError) {
        setWelcomeError(signUpError.message ?? "Failed to create account")
        setWelcomeLoading(false)
        return
      }
      const result = await postAdminBootstrap()
      if (result.success && result.isSuperAdmin) {
        router.push("/admin")
      } else {
        setWelcomeError(result.message ?? "Setup failed")
      }
    } catch (err) {
      setWelcomeError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setWelcomeLoading(false)
    }
  }

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Redirecting…</p>
      </div>
    )
  }

  if (needsSetup === null) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  if (needsSetup) {
    return (
      <div className="flex min-h-svh items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Welcome to {APP_NAME}</CardTitle>
            <CardDescription>
              As this is your first login, you need to create an admin with email
              and password.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleCreateFirstAdmin}>
            <CardContent className="space-y-4">
              {welcomeError && (
                <p className="text-destructive text-sm">{welcomeError}</p>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  required
                  minLength={8}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={welcomeLoading}>
                {welcomeLoading ? "Creating admin…" : "Create admin"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">{APP_NAME}</h1>
      <p className="text-muted-foreground text-center">
        Sign in or create an account to get started
      </p>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/login">Log in</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/signup">Sign up</Link>
        </Button>
      </div>
      <p className="text-muted-foreground text-sm">
        Or{" "}
        <Link href="/tenant/default/dashboard" className="text-primary underline">
          browse as guest
        </Link>
      </p>
    </div>
  )
}
