import Link from "next/link"
import { LandingNavbar } from "@/components/landing-navbar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react"

const docs = [
  {
    title: "Arquitectura",
    description: "Visión general del monorepo, multi-tenant y estructura.",
    href: "https://github.com/your-repo/saas-monorepo-template/blob/main/docs/ARCHITECTURE.md",
  },
  {
    title: "Deploy con Coolify",
    description: "Despliega en Coolify paso a paso.",
    href: "https://github.com/your-repo/saas-monorepo-template/blob/main/docs/DEPLOY_COOLIFY.md",
  },
  {
    title: "Deploy con Dokploy",
    description: "Despliega en Dokploy.",
    href: "https://github.com/your-repo/saas-monorepo-template/blob/main/docs/DEPLOY_DOKPLOY.md",
  },
  {
    title: "Self-hosted",
    description: "Guía para hostear en tu propio servidor.",
    href: "https://github.com/your-repo/saas-monorepo-template/blob/main/docs/DEPLOY_SELFHOST.md",
  },
  {
    title: "Polar.sh",
    description: "Documentación de facturación con Polar.",
    href: "https://polar.sh/docs",
  },
  {
    title: "Better Auth",
    description: "Autenticación, organizations e invitations.",
    href: "https://www.better-auth.com/docs",
  },
]

export default function DocsPage() {
  return (
    <div className="min-h-svh flex flex-col">
      <LandingNavbar />
    <div className="mx-auto flex-1 max-w-4xl px-4 py-12">
      <Button variant="ghost" asChild>
        <Link href="/">
          <ArrowLeftIcon className="mr-2 size-4" />
          Volver
        </Link>
      </Button>
      <h1 className="mt-8 text-3xl font-bold">Documentación</h1>
      <p className="text-muted-foreground mt-2">
        Guías y referencias para el boilerplate
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {docs.map((doc) => (
          <Link key={doc.title} href={doc.href} target="_blank">
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  {doc.title}
                  <ExternalLinkIcon className="size-4" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{doc.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
    </div>
  )
}
