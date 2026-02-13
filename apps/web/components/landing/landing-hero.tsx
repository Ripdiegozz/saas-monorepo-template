import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import {
  CalendarCheckIcon,
  Building2Icon,
  UsersIcon,
  ArrowRightIcon,
} from "lucide-react"

export function LandingHero() {
  return (
    <section className="relative overflow-hidden border-b px-4 py-20 md:py-28">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-chart-2/5" />
      <div className="relative mx-auto max-w-4xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
          Reserva citas como{" "}
          <span className="text-primary">Calendly</span> o Google Calendar
        </h1>
        <p className="text-muted-foreground mt-6 text-lg md:text-xl">
          Boilerplate SaaS multi-tenant listo para producción. Crea tu negocio,
          invita empleados, deja que tus clientes reserven en línea.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/signup">
              Crear mi negocio
              <ArrowRightIcon className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/#features">Ver características</Link>
          </Button>
        </div>
        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Building2Icon className="text-muted-foreground size-5" />
            <span>Multi-tenant</span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon className="text-muted-foreground size-5" />
            <span>Invita empleados</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarCheckIcon className="text-muted-foreground size-5" />
            <span>Reservas públicas</span>
          </div>
        </div>
      </div>
    </section>
  )
}
