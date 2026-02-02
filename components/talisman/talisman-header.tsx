"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Shield, LayoutDashboard, Key, History, Settings, Plug, ChevronLeft, CreditCard, LogOut } from "@/components/icons"
import { useI18n } from "@/lib/i18n/context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { clearStoredPersonId, getStoredPersonId } from "@/lib/talisman/client"

const navItems = [
  { href: "/talisman", icon: LayoutDashboard, labelKey: "talisman.dashboard" },
  { href: "/talisman/credentials", icon: Key, labelKey: "talisman.credentials" },
  { href: "/talisman/events", icon: History, labelKey: "talisman.events" },
  { href: "/talisman/billing", icon: CreditCard, labelKey: "talisman.billing" },
  { href: "/talisman/integration", icon: Plug, labelKey: "talisman.integration" },
  { href: "/talisman/settings", icon: Settings, labelKey: "talisman.settings" },
]

export function TalismanHeader() {
  const { t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const isLoggedIn = Boolean(getStoredPersonId())

  const isLandingPage = pathname === "/talisman/landing"

  const isHomePage = pathname === "/talisman"
  const showBackButton = !isHomePage

  // Landing/Spec page doesn't need this header - GlobalNav is enough
  if (isLandingPage) {
    return null
  }

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
            <Link href="/talisman/landing" className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-cyan-400" />
              <span className="font-semibold text-foreground">{t("talisman.title")}</span>
            </Link>
          </div>
          {isLoggedIn && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                clearStoredPersonId()
                router.push("/talisman/landing")
              }}
              className="text-muted-foreground hover:text-foreground gap-1"
            >
              <LogOut className="h-4 w-4" />
              {t("talisman.logout")}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex gap-1 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
