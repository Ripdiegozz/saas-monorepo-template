"use client"

import { useLocale } from "next-intl"
import { usePathname, Link } from "@/i18n/navigation"
import { routing } from "@/i18n/routing"
import { Button } from "@workspace/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { LanguagesIcon } from "lucide-react"

const localeLabels: Record<string, string> = {
  en: "English",
  es: "Español",
}

export function LocaleSwitcher() {
  const locale = useLocale()
  const pathname = usePathname()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" title="Language">
          <LanguagesIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem key={loc} asChild>
            <Link href={pathname} locale={loc} className={locale === loc ? "font-medium" : ""}>
              {localeLabels[loc] ?? loc}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
