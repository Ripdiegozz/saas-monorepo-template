import {
  ShieldIcon,
  CreditCardIcon,
  MailIcon,
  CalendarIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"

const features = [
  {
    icon: ShieldIcon,
    title: "Multi-tenant",
    description: "Cada negocio tiene su propio espacio aislado con datos seguros.",
  },
  {
    icon: CreditCardIcon,
    title: "Polar.sh + planes",
    description: "Free, Pro y Enterprise. Facturación lista con límites por plan.",
  },
  {
    icon: MailIcon,
    title: "Invitations por email",
    description: "Invita empleados por correo. Ellos se registran y ven su calendario.",
  },
  {
    icon: CalendarIcon,
    title: "Reservas públicas",
    description: "Página estilo Calendly para que clientes reserven con email y teléfono.",
  },
  {
    icon: UsersIcon,
    title: "Roles: Admin y empleado",
    description: "Admin gestiona el negocio. Empleados ven su panel de citas.",
  },
  {
    icon: ZapIcon,
    title: "Stack moderno",
    description: "Next.js, Hono, Drizzle, Better Auth, monorepo con Turborepo.",
  },
]

export function LandingFeatures() {
  return (
    <section id="features" className="px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          Todo lo que incluye el boilerplate
        </h2>
        <p className="text-muted-foreground mt-4 text-center text-lg">
          Un punto de partida sólido para tu app de reservas
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border bg-card p-6 transition-shadow hover:shadow-md"
            >
              <f.icon className="text-primary size-10" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
