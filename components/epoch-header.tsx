"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Clock, LayoutDashboard, Users, Settings, ChevronLeft, Shield, Compass, Bell, User } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { cn } from "@/lib/utils"
import { EpochPrinciplesDialog } from "@/components/epoch-principles-dialog"
import { EpochContextSwitcher } from "@/components/epoch-context-switcher"

// Mock data - 現在従事している組織（兼業・副業で複数可）
const mockCurrentOrganizations = [
  { id: "org_001", name: "株式会社テクノロジー", role: "エンジニア" },
]

const navItems = [
  { href: "/", icon: LayoutDashboard, labelKey: "header.timeline" },
  { href: "/browse", icon: Compass, labelKey: "header.browse" },
  { href: "/scout", icon: Bell, labelKey: "header.scout" },
  { href: "/profile", icon: User, labelKey: "header.profile" },
  { href: "/settings", icon: Settings, labelKey: "header.settings" },
]

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/" || pathname.startsWith("/user/") || pathname.startsWith("/org/")
  }
  return pathname.startsWith(href)
}

export function EpochHeader() {
  const [showPrinciples, setShowPrinciples] = useState(false)
  const [currentContext, setCurrentContext] = useState<"personal" | { orgId: string; orgName: string }>("personal")
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useI18n()
  const { isLoggedIn } = useAuth()

  const pendingScouts = 1

  // ホーム（/）以外では戻るボタンを表示
  const isHomePage = pathname === "/"
  const showBackButton = !isHomePage

  const handleBack = () => {
    router.back()
  }

  const handleContextSwitch = (context: "personal" | string) => {
    if (context === "personal") {
      setCurrentContext("personal")
      router.push("/")
    } else {
      const org = mockCurrentOrganizations.find((o) => o.id === context)
      if (org) {
        setCurrentContext({ orgId: org.id, orgName: org.name })
        router.push(`/org/${org.id}`)
      }
    }
  }

  return (
    <>
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
              <Link href="/" className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-foreground">Epoch</span>
              </Link>
              <div className="h-5 w-px bg-border mx-1" />
              <EpochContextSwitcher
                currentContext={currentContext}
                currentOrganizations={mockCurrentOrganizations}
                onSwitch={handleContextSwitch}
              />
              <button
                onClick={() => setShowPrinciples(true)}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground ml-2"
              >
                {t("header.principles")}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mr-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                <span className="hidden sm:inline">{t("header.recording")}</span>
              </div>
              {pendingScouts > 0 && (
                <Link href="/scout">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 text-[10px] font-medium text-background flex items-center justify-center">
                      {pendingScouts}
                    </span>
                  </Button>
                </Link>
              )}
              {isLoggedIn ? (
                <Link href="/talisman">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Shield className="h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/talisman/landing">
                  <Button variant="outline" size="sm" className="text-sm bg-transparent">
                    {t("header.login")}
                  </Button>
                </Link>
              )}
            </div>
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
                      ? "bg-green-500/10 text-green-500"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t(item.labelKey as Parameters<typeof t>[0])}
                </Link>
              )
            })}
          </nav>
        </div>
      </header>

      <EpochPrinciplesDialog open={showPrinciples} onOpenChange={setShowPrinciples} />
    </>
  )
}
