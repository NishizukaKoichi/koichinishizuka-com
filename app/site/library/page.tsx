"use client"

import Link from "next/link"
import { Settings } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"
import { LibraryCard } from "@/components/site/library-card"

// All products (fixed order per spec: Sigil, Epoch, Talisman, Pact, then others)
const allProducts = [
  {
    id: "sigil",
    nameKey: "product.sigil.name",
    definitionKey: "product.sigil.definition",
    handlesKey: "product.sigil.handles",
    notHandlesKey: "product.sigil.not_handles",
    status: "draft" as const,
    hasSpec: true,
    hasValue: false,
    hasMvp: false,
  },
  {
    id: "epoch",
    nameKey: "product.epoch.name",
    definitionKey: "product.epoch.definition",
    handlesKey: "product.epoch.handles",
    notHandlesKey: "product.epoch.not_handles",
    status: "final" as const,
    hasSpec: true,
    hasValue: true,
    hasMvp: true,
    specHref: "/landing",
  },
  {
    id: "talisman",
    nameKey: "product.talisman.name",
    definitionKey: "product.talisman.definition",
    handlesKey: "product.talisman.handles",
    notHandlesKey: "product.talisman.not_handles",
    status: "draft" as const,
    hasSpec: true,
    hasValue: false,
    hasMvp: false,
  },
  {
    id: "pact",
    nameKey: "product.pact.name",
    definitionKey: "product.pact.definition",
    handlesKey: "product.pact.handles",
    notHandlesKey: "product.pact.not_handles",
    status: "draft" as const,
    hasSpec: true,
    hasValue: false,
    hasMvp: false,
  },
  {
    id: "magicspell",
    nameKey: "product.magicspell.name",
    definitionKey: "product.magicspell.definition",
    handlesKey: "product.magicspell.handles",
    notHandlesKey: "product.magicspell.not_handles",
    status: "draft" as const,
    hasSpec: true,
    hasValue: false,
    hasMvp: false,
    specHref: "/magicspell/landing",
  },
]

export default function LibraryPage() {
  const { t } = useI18n()
  const { isAdmin } = useAuth()

  return (
    <div className="mx-auto max-w-4xl px-4 py-16">
      {/* Header */}
      <div className="mb-12 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground mb-2">
            {t("site.library_title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("site.library_desc")}
          </p>
        </div>
        {isAdmin && (
          <Link href="/site/library/admin">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Settings className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {allProducts.map((product) => (
          <LibraryCard
            key={product.id}
            id={product.id}
            name={t(product.nameKey as Parameters<typeof t>[0])}
            definition={t(product.definitionKey as Parameters<typeof t>[0])}
            handles={t(product.handlesKey as Parameters<typeof t>[0])}
            notHandles={t(product.notHandlesKey as Parameters<typeof t>[0])}
            status={product.status}
            hasSpec={product.hasSpec}
            hasValue={product.hasValue}

            specHref={product.specHref}
          />
        ))}
      </div>
    </div>
  )
}
