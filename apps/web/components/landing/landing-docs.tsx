import Link from "next/link"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { ExternalLinkIcon } from "lucide-react"

const docs = [
  {
    title: "Arquitectura",
    description: "Visión general del monorepo, multi-tenant y estructura.",
    href: "/docs",
    external: false,
  },
  {
    title: "Polar.sh",
    description: "Documentación de facturación con Polar.",
    href: "https://polar.sh/docs",
    external: true,
  },
  {
    title: "Better Auth",
    description: "Autenticación, organizations e invitations.",
    href: "https://www.better-auth.com/docs",
    external: true,
  },
]

export function LandingDocs() {
  return (
    <section id="docs" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          Documentación
        </h2>
        <p className="text-muted-foreground mt-4 text-center text-lg">
          Guías de deploy y referencias del stack
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {docs.map((doc) => (
            <Link key={doc.title} href={doc.href} target={doc.external ? "_blank" : undefined}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {doc.title}
                    {doc.external && <ExternalLinkIcon className="size-4" />}
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
    </section>
  )
}
