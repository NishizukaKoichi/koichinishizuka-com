"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Wand2,
  Shield,
  FileText,
  Settings,
  LayoutDashboard,
  Code,
  Sparkles,
  ChevronLeft,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/spell", icon: LayoutDashboard, labelKey: "spell.dashboard" },
  { href: "/spell/spells", icon: Sparkles, labelKey: "spell.products" },
  { href: "/spell/entitlements", icon: Shield, labelKey: "spell.entitlements" },
  { href: "/spell/audit", icon: FileText, labelKey: "spell.audit" },
  { href: "/spell/integration", icon: Code, labelKey: "spell.integration" },
  { href: "/spell/settings", icon: Settings, labelKey: "spell.settings" },
]

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/spell") {
    return pathname === "/spell"
  }
  return pathname.startsWith(href)
}

export function SpellHeader() {
  const { t } = useI18n()
  const { isLoggedIn } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const isLandingPage = pathname === "/spell/landing"
  const talismanLoginHref = `/talisman/login?next=${encodeURIComponent(pathname)}`
  
  if (isLandingPage) {
    return null
  }

  const isHomePage = pathname === "/spell"
  const showBackButton = !isHomePage

  const handleBack = () => {
    router.back()
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-4xl px-4">
        {/* Top bar */}
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <Link href="/spell/landing" className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-spell-primary" />
              <span className="font-semibold text-foreground">{t("spell.title")}</span>
            </Link>
          </div>
          {isLoggedIn ? (
            <Link href="/talisman">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Shield className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href={talismanLoginHref}>
              <Button variant="outline" size="sm" className="text-sm bg-transparent">
                {t("header.login")}
              </Button>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isNavActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-spell-primary/10 text-spell-primary"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.labelKey ? t(item.labelKey as Parameters<typeof t>[0]) : item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
