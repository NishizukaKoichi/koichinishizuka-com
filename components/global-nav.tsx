"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { EpochLanguageSelector } from "@/components/epoch-language-selector"
import { ProductSwitcher } from "@/components/product-switcher"

export function GlobalNav() {
  const pathname = usePathname()
  return (
    <div className="border-b border-border bg-muted/30">
      <div className="mx-auto flex h-10 max-w-4xl items-center justify-between px-4">
        {/* Origin link */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-medium">Koichi Nishizuka</span>
        </Link>

        {/* Language + Product switcher */}
        <div className="flex items-center gap-3">
          <EpochLanguageSelector />
<ProductSwitcher />
        </div>
      </div>
    </div>
  )
}
