"use client"

import Link from "next/link"

import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { FileSignature, LayoutDashboard, Users, Settings, BarChart3, FileText, ChevronLeft, Database, GitBranch, User, Shield } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"

const navItems = [
  { href: "/pact", icon: LayoutDashboard, labelKey: "pact.dashboard" },
  { href: "/pact/employees", icon: Users, labelKey: "pact.employees" },
  { href: "/pact/ledger", icon: Database, labelKey: "pact.ledger" },
  { href: "/pact/thresholds", icon: BarChart3, labelKey: "pact.thresholds" },
  { href: "/pact/transitions", icon: GitBranch, labelKey: "pact.transitions" },
  { href: "/pact/reports", icon: FileText, labelKey: "pact.reports" },
  { href: "/pact/my", icon: User, labelKey: "pact.my" },
  { href: "/pact/settings", icon: Settings, labelKey: "pact.settings" },
]

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/pact") {
    return pathname === "/pact"
  }
  return pathname.startsWith(href)
}

export function PactHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useI18n()
  const { isLoggedIn } = useAuth()
  
  const isHomePage = pathname === "/pact"
  const showBackButton = !isHomePage
  const isDetailPage = pathname !== "/pact" && pathname !== "/pact/landing" // Declare isDetailPage variable

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-4xl">
        {/* Top bar with logo */}
        <div className="flex h-12 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            {showBackButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => router.back()}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <Link href="/pact/landing" className="flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-violet-500" />
              <span className="font-semibold text-foreground">Pact</span>
            </Link>
          </div>
          
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
        
        {/* Navigation tabs */}
        <nav className="flex items-center gap-1 px-4 pb-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = isNavActive(pathname, item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-violet-500/10 text-violet-500"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.labelKey as Parameters<typeof t>[0])}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
