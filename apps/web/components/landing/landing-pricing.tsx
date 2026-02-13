import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { CheckIcon } from "lucide-react"

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "/mes",
    businesses: 1,
    employees: "3",
    customers: "100",
    features: ["1 negocio", "3 empleados", "100 clientes registrados", "Panel admin y empleados"],
    cta: "Empezar gratis",
    href: "/signup",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$29",
    period: "/mes",
    businesses: 3,
    employees: "15",
    customers: "1.000",
    features: ["3 negocios", "15 empleados", "1.000 clientes", "Todo Free + soporte prioritario"],
    cta: "Probar Pro",
    href: `${apiUrl}/api/billing/checkout`,
    highlighted: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    businesses: -1,
    employees: "Ilimitado",
    customers: "Ilimitado",
    features: ["Negocios ilimitados", "Empleados ilimitados", "Clientes ilimitados", "SLA y onboarding"],
    cta: "Contactar ventas",
    href: "mailto:sales@example.com",
    highlighted: false,
  },
]

export function LandingPricing() {
  return (
    <section id="pricing" className="border-t bg-muted/30 px-4 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-3xl font-bold md:text-4xl">
          Planes que escalan con tu negocio
        </h2>
        <p className="text-muted-foreground mt-4 text-center text-lg">
          Free, Pro y Enterprise. Polar.sh para facturación.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.highlighted ? "border-primary ring-2 ring-primary/20" : ""}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>
                  {plan.businesses === -1 ? "Ilimitados" : plan.businesses} negocio
                  {plan.businesses !== 1 ? "s" : ""} · {plan.employees} empleados ·{" "}
                  {plan.customers} clientes
                </CardDescription>
                <p className="mt-2 text-3xl font-bold">
                  {plan.price}
                  <span className="text-muted-foreground text-sm font-normal">{plan.period}</span>
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckIcon className="text-primary size-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link
                    href={
                      plan.id === "pro" && plan.href.includes("billing")
                        ? `${plan.href}?productId=pro`
                        : plan.href
                    }
                  >
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
