"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Clock, FileSignature, Grid, Shield, Sparkles, Wand2 } from "@/components/icons"
import { useAuth } from "@/lib/auth/context"
import { useI18n } from "@/lib/i18n/context"

type ProductDescriptionKey =
  | "switcher.product.sigil.desc"
  | "switcher.product.epoch.desc"
  | "switcher.product.talisman.desc"
  | "switcher.product.pact.desc"
  | "switcher.product.spell.desc"

type Product = {
  id: string
  name: string
  descriptionKey: ProductDescriptionKey
  landingHref: string
  appHref: string
  productType: "sigil" | "epoch" | "talisman" | "pact" | "spell"
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const products: Product[] = [
  {
    id: "sigil",
    name: "Sigil",
    descriptionKey: "switcher.product.sigil.desc",
    landingHref: "/sigil/landing",
    appHref: "/sigil",
    icon: Sparkles,
    productType: "sigil",
  },
  {
    id: "epoch",
    name: "Epoch",
    descriptionKey: "switcher.product.epoch.desc",
    landingHref: "/epoch/landing",
    appHref: "/epoch",
    icon: Clock,
    productType: "epoch",
  },
  {
    id: "talisman",
    name: "Talisman",
    descriptionKey: "switcher.product.talisman.desc",
    landingHref: "/talisman/landing",
    appHref: "/talisman",
    icon: Shield,
    productType: "talisman",
  },
  {
    id: "pact",
    name: "Pact",
    descriptionKey: "switcher.product.pact.desc",
    landingHref: "/pact/landing",
    appHref: "/pact",
    icon: FileSignature,
    productType: "pact",
  },
  {
    id: "spell",
    name: "Spell",
    descriptionKey: "switcher.product.spell.desc",
    landingHref: "/spell/landing",
    appHref: "/spell",
    icon: Wand2,
    productType: "spell",
  },
]

export function ProductSwitcher() {
  const pathname = usePathname()
  const { t } = useI18n()
  const { isLoggedIn, hasMinimumCredentials } = useAuth()
  const canAccessApp = isLoggedIn && hasMinimumCredentials

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors outline-none">
        <Grid className="h-4 w-4" />
        <span className="hidden sm:inline">{t("switcher.products")}</span>
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Koichinishizuka.com
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border" />

        {products.map((product) => {
          const Icon = product.icon
          const isCurrent = pathname === product.appHref || pathname.startsWith(`${product.appHref}/`)
          const href = canAccessApp ? product.appHref : product.landingHref

          return (
            <DropdownMenuItem key={product.id} asChild>
              <Link
                href={href}
                className={`flex items-center gap-3 cursor-pointer ${isCurrent ? "bg-secondary/50" : ""}`}
              >
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{t(product.descriptionKey)}</p>
                </div>
                {isCurrent && (
                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    {t("switcher.current")}
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center gap-2 cursor-pointer text-muted-foreground">
            <span className="text-sm">{t("switcher.back_home")}</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
