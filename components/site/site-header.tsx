"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import { Menu, X, ChevronLeft } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { cn } from "@/lib/utils"

const navItems = [
  { key: "site.nav.library", href: "/site/library" },
  { key: "site.nav.developers", href: "/site/developers" },
  { key: "site.nav.notes", href: "/site/notes" },
  { key: "site.nav.about", href: "/site/about" },
  { key: "site.nav.contact", href: "/site/contact" },
] as const

export function SiteHeader() {
  const { t } = useI18n()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isHomePage = pathname === "/site"

  const handleBack = () => {
    router.back()
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
        {/* Back button + Site name */}
        <div className="flex items-center gap-1">
          {!isHomePage && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Link 
            href="/site" 
            className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
          >
            {t("site.name")}
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm transition-colors",
                pathname.startsWith(item.href)
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t(item.key as Parameters<typeof t>[0])}
            </Link>
          ))}
        </nav>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <nav className="border-t border-border bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm py-2 transition-colors",
                  pathname.startsWith(item.href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(item.key as Parameters<typeof t>[0])}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
