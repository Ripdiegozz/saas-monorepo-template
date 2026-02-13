"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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

export default function SetupPage() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isPending && !session) router.replace("/login")
  }, [session, isPending, router])

  async function handleBootstrap() {
    setError(null)
    setLoading(true)
    try {
      const result = await postAdminBootstrap()
      if (result.success && result.isSuperAdmin) {
        router.push("/admin")
      } else {
        setError(result.message ?? "Bootstrap failed")
        setLoading(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
      setLoading(false)
    }
  }

  async function handleSignOut() {
    await authClient.signOut()
    router.push("/login")
  }

  if (isPending || !session) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete setup</CardTitle>
          <CardDescription>
            You&apos;re the first user. Complete setup to become the super admin
            and access the admin panel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <p className="text-destructive text-sm">{error}</p>
          )}
          <p className="text-muted-foreground text-sm">
            As super admin you&apos;ll be able to manage organizations, users,
            and tenant settings.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            onClick={handleBootstrap}
            className="w-full"
            disabled={loading}
          >
            {loading ? "Setting up…" : "Complete setup"}
          </Button>
          <Button
            variant="ghost"
            onClick={handleSignOut}
            className="w-full"
          >
            Sign out
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
