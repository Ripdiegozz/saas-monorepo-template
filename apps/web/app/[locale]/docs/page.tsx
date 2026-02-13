import { getTranslations } from "next-intl/server"
import { LandingNavbar } from "@/components/landing-navbar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Button } from "@workspace/ui/components/button"
import { Link } from "@/i18n/navigation"
import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react"

const docsConfig = [
  { key: "architecture", href: "https://github.com/your-repo/saas-monorepo-template/blob/main/docs/ARCHITECTURE.md" },
  { key: "deployCoolify", href: "https://github.com/your-repo/saas-monorepo-template/blob/main/docs/DEPLOY_COOLIFY.md" },
  { key: "deployDokploy", href: "https://github.com/your-repo/saas-monorepo-template/blob/main/docs/DEPLOY_DOKPLOY.md" },
  { key: "selfHosted", href: "https://github.com/your-repo/saas-monorepo-template/blob/main/docs/DEPLOY_SELFHOST.md" },
  { key: "polar", href: "https://polar.sh/docs" },
  { key: "betterAuth", href: "https://www.better-auth.com/docs" },
] as const

export default async function DocsPage() {
  const t = await getTranslations("docsPage")
  const tCommon = await getTranslations("common")

  return (
    <div className="min-h-svh flex flex-col">
      <LandingNavbar />
      <div className="mx-auto flex-1 max-w-4xl px-4 py-12">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeftIcon className="mr-2 size-4" />
            {tCommon("back")}
          </Link>
        </Button>
        <h1 className="mt-8 text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("subtitle")}</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {docsConfig.map(({ key, href }) => (
            <a key={key} href={href} target="_blank" rel="noopener noreferrer">
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {t(`${key}.title`)}
                    <ExternalLinkIcon className="size-4" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t(`${key}.desc`)}</CardDescription>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
