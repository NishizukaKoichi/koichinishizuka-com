"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Clock, LayoutDashboard, Users, Settings, ChevronLeft, Shield, Compass, Bell, User } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { cn } from "@/lib/utils"
import { EpochPrinciplesDialog } from "@/components/epoch-principles-dialog"
import { EpochContextSwitcher } from "@/components/epoch-context-switcher"

const navItems = [
  { href: "/epoch", icon: LayoutDashboard, labelKey: "header.timeline" },
  { href: "/epoch/browse", icon: Compass, labelKey: "header.browse" },
  { href: "/epoch/scout", icon: Bell, labelKey: "header.scout" },
  { href: "/epoch/profile", icon: User, labelKey: "header.profile" },
  { href: "/epoch/settings", icon: Settings, labelKey: "header.settings" },
]

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/epoch") {
    return pathname === "/epoch" || pathname.startsWith("/epoch/user/") || pathname.startsWith("/epoch/org/")
  }
  return pathname.startsWith(href)
}

export function EpochHeader() {
  const [showPrinciples, setShowPrinciples] = useState(false)
  const [currentContext, setCurrentContext] = useState<"personal" | { orgId: string; orgName: string }>("personal")
  const [currentOrganizations, setCurrentOrganizations] = useState<
    { id: string; name: string; role?: string | null }[]
  >([])
  const [pendingScouts, setPendingScouts] = useState(0)
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useI18n()
  const { isLoggedIn, userId } = useAuth()

  // ホーム（/epoch）以外では戻るボタンを表示
  const isHomePage = pathname === "/epoch"
  const showBackButton = !isHomePage
  const resolvedOrganizations = userId ? currentOrganizations : []
  const resolvedPendingScouts = userId ? pendingScouts : 0
  const resolvedContext = userId ? currentContext : "personal"

  const handleBack = () => {
    router.back()
  }

  const handleContextSwitch = (context: "personal" | string) => {
    if (context === "personal") {
      setCurrentContext("personal")
      router.push("/epoch")
    } else {
      const org = resolvedOrganizations.find((o) => o.id === context)
      if (org) {
        setCurrentContext({ orgId: org.id, orgName: org.name })
        router.push(`/epoch/org/${org.id}`)
      }
    }
  }

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      try {
        const [orgResponse, scoutResponse] = await Promise.all([
          fetch("/api/epoch/orgs/mine", {
            headers: undefined,
          }),
          fetch("/api/epoch/scouts", {
            headers: undefined,
          }),
        ])

        if (orgResponse.ok) {
          const payload = (await orgResponse.json()) as { orgs: { id: string; name: string; role?: string }[] }
          setCurrentOrganizations(payload.orgs ?? [])
        }

        if (scoutResponse.ok) {
          const payload = (await scoutResponse.json()) as { received?: { status: string }[] }
          const pending = (payload.received ?? []).filter((scout) => scout.status === "pending").length
          setPendingScouts(pending)
        }
      } catch {
        // silence errors; header should remain usable even if data is unavailable
      }
    }
    load()
  }, [userId])

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
              <Link href="/epoch" className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-500" />
                <span className="font-semibold text-foreground">Epoch</span>
              </Link>
              <div className="h-5 w-px bg-border mx-1" />
              <EpochContextSwitcher
                currentContext={resolvedContext}
                currentOrganizations={resolvedOrganizations}
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
              {resolvedPendingScouts > 0 && (
                <Link href="/epoch/scout">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 text-[10px] font-medium text-background flex items-center justify-center">
                      {resolvedPendingScouts}
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
