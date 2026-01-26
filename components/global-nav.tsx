"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, Clock, Shield, Sparkles, FileSignature, Wand2 } from "@/components/icons"
import { EpochLanguageSelector } from "@/components/epoch-language-selector"
import { useAuth } from "@/lib/auth/context"

// Products under Koichinishizuka.com
// landingHref: 未ログインまたはCredential不足時
// appHref: ログイン済み + Credential 3つ以上の時
const products = [
  {
    id: "sigil",
    name: "Sigil",
    description: "術式の事前開示",
    landingHref: "/sigil/landing",
    appHref: "/sigil",
    icon: Sparkles,
    disabled: false,
    productType: "sigil",
  },
  {
    id: "epoch",
    name: "Epoch",
    description: "不可逆な時間の記録",
    landingHref: "/landing",
    appHref: "/",
    icon: Clock,
    disabled: false,
    productType: "epoch",
  },
  {
    id: "talisman",
    name: "Talisman",
    description: "同一人物性の観測基盤",
    landingHref: "/talisman/landing",
    appHref: "/talisman",
    icon: Shield,
    disabled: false,
    productType: "talisman",
  },
  {
    id: "pact",
    name: "Pact",
    description: "雇用・報酬・契約状態遷移",
    landingHref: "/pact/landing",
    appHref: "/pact",
    icon: FileSignature,
    disabled: false,
    productType: "pact",
  },
  {
    id: "magicspell",
    name: "MagicSpell",
    description: "権利付与・配布制御",
    landingHref: "/magicspell/landing",
    appHref: "/magicspell",
    icon: Wand2,
    disabled: false,
    productType: "magicspell",
  },
]

export function GlobalNav() {
  const pathname = usePathname()
  const { isLoggedIn, hasMinimumCredentials } = useAuth()
  
  // ログイン済み + Credential 3つ以上なら直接アプリへ
  const canAccessApp = isLoggedIn && hasMinimumCredentials
  
  // Determine which product is currently active
  const isEpochActive = pathname === "/" || 
    pathname.startsWith("/landing") || 
    pathname.startsWith("/browse") || 
    pathname.startsWith("/scout") || 
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/org") ||
    pathname.startsWith("/user")
  
  const isTalismanActive = pathname.startsWith("/talisman")
  
  const isSigilActive = pathname.startsWith("/sigil")
  
  const isPactActive = pathname.startsWith("/pact")
  
  const isMagicSpellActive = pathname.startsWith("/magicspell")
  
  const isSiteActive = pathname.startsWith("/site")

  return (
    <div className="border-b border-border bg-muted/30">
      <div className="mx-auto flex h-10 max-w-4xl items-center justify-between px-4">
        {/* Origin link */}
        <Link
          href="/site"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-medium">Koichi Nishizuka</span>
        </Link>

        {/* Language + Product switcher */}
        <div className="flex items-center gap-3">
          <EpochLanguageSelector />
          <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors outline-none">
            <span>Products</span>
            <ChevronDown className="h-3 w-3" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-card border-border">
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Koichinishizuka.com
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            
            {products.map((product) => {
              const Icon = product.icon
              const isCurrent = product.productType === "epoch" ? isEpochActive : product.productType === "talisman" ? isTalismanActive : product.productType === "sigil" ? isSigilActive : product.productType === "pact" ? isPactActive : product.productType === "magicspell" ? isMagicSpellActive : false
              
              if (product.disabled) {
                return (
                  <DropdownMenuItem
                    key={product.id}
                    disabled
                    className="flex items-center gap-3 opacity-50 cursor-not-allowed"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.description}</p>
                    </div>
                  </DropdownMenuItem>
                )
              }
              
              const href = canAccessApp ? product.appHref : product.landingHref
              
              return (
                <DropdownMenuItem key={product.id} asChild>
                  <Link
                    href={href}
                    className={`flex items-center gap-3 cursor-pointer ${
                      isCurrent ? "bg-secondary/50" : ""
                    }`}
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.description}</p>
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
              <Link
                href="/site"
                className="flex items-center gap-2 cursor-pointer text-muted-foreground"
              >
                <span className="text-sm">Koichinishizuka.com へ</span>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
