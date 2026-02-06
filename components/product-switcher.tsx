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
import { ChevronDown, Clock, FileSignature, Shield, Sparkles, Wand2 } from "@/components/icons"
import { useAuth } from "@/lib/auth/context"

type Product = {
  id: string
  name: string
  description: string
  landingHref: string
  appHref: string
  productType: "sigil" | "epoch" | "talisman" | "pact" | "spell"
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const products: Product[] = [
  {
    id: "sigil",
    name: "Sigil",
    description: "術式の事前開示",
    landingHref: "/sigil/landing",
    appHref: "/sigil",
    icon: Sparkles,
    productType: "sigil",
  },
  {
    id: "epoch",
    name: "Epoch",
    description: "不可逆な時間の記録",
    landingHref: "/epoch/landing",
    appHref: "/epoch",
    icon: Clock,
    productType: "epoch",
  },
  {
    id: "talisman",
    name: "Talisman",
    description: "同一人物性の観測基盤",
    landingHref: "/talisman/landing",
    appHref: "/talisman",
    icon: Shield,
    productType: "talisman",
  },
  {
    id: "pact",
    name: "Pact",
    description: "雇用・報酬・契約状態遷移",
    landingHref: "/pact/landing",
    appHref: "/pact",
    icon: FileSignature,
    productType: "pact",
  },
  {
    id: "spell",
    name: "Spell",
    description: "権利付与・配布制御",
    landingHref: "/spell/landing",
    appHref: "/spell",
    icon: Wand2,
    productType: "spell",
  },
]

export function ProductSwitcher() {
  const pathname = usePathname()
  const { isLoggedIn, hasMinimumCredentials } = useAuth()
  const canAccessApp = isLoggedIn && hasMinimumCredentials

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors outline-none">
        <span>Products</span>
        <ChevronDown className="h-3 w-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-[70vh] overflow-y-auto bg-card border-border">
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
                  <p className="text-xs text-muted-foreground truncate">{product.description}</p>
                </div>
                {isCurrent && (
                  <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">
                    現在
                  </span>
                )}
              </Link>
            </DropdownMenuItem>
          )
        })}

        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem asChild>
          <Link href="/" className="flex items-center gap-2 cursor-pointer text-muted-foreground">
            <span className="text-sm">Koichinishizuka.com へ</span>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
