"use client"

import Link from "next/link"
import { ArrowRight } from "@/components/icons"
import { useI18n } from "@/lib/i18n/context"
import { LibraryCard } from "@/components/site/library-card"

// Featured products (fixed order per spec)
const featuredProducts = [
  {
    id: "sigil",
    nameKey: "product.sigil.name",
    definitionKey: "product.sigil.definition",
    handlesKey: "product.sigil.handles",
    notHandlesKey: "product.sigil.not_handles",
    status: "final" as const,
    hasSpec: true,
    hasValue: false,
    hasMvp: true,
    specHref: "/sigil/landing",
    mvpHref: "/sigil",
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
    status: "final" as const,
    hasSpec: true,
    hasValue: false,
    hasMvp: true,
    specHref: "/talisman/landing",
    mvpHref: "/talisman",
  },
  {
    id: "pact",
    nameKey: "product.pact.name",
    definitionKey: "product.pact.definition",
    handlesKey: "product.pact.handles",
    notHandlesKey: "product.pact.not_handles",
    status: "final" as const,
    hasSpec: true,
    hasValue: false,
    hasMvp: true,
    specHref: "/pact/landing",
    mvpHref: "/pact",
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
    hasMvp: true,
    specHref: "/magicspell/landing",
    mvpHref: "/magicspell",
  },
]

// Recent notes (placeholder data)
const recentNotes = [
  {
    id: "note-1",
    title: "なぜ「履歴を削除できない」を原則にしたか",
    date: "2025-01-15",
  },
  {
    id: "note-2",
    title: "Sigilの設計意図について",
    date: "2025-01-10",
  },
  {
    id: "note-3",
    title: "プロダクト間の境界線",
    date: "2025-01-05",
  },
]

export default function SiteHomePage() {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-4xl px-4">
      {/* Hero Section */}
      <section className="py-24 sm:py-32">
        <h1 className="text-2xl sm:text-3xl font-medium text-foreground mb-4">
          {t("site.hero_title")}
        </h1>
        <p className="text-muted-foreground mb-8 max-w-xl">
          {t("site.hero_subtitle")}
        </p>
        <Link
          href="/site/library"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
        >
          {t("site.go_to_library")}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      {/* Featured Libraries */}
      <section className="pb-16">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-6">
          {t("site.featured_title")}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product) => (
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
              hasMvp={product.hasMvp}
              specHref={product.specHref}
              compact
            />
          ))}
        </div>
      </section>

      {/* Recent Notes */}
      <section className="pb-24 border-t border-border pt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground">
            {t("site.recent_notes")}
          </h2>
          <Link
            href="/site/notes"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {t("site.view_all_notes")}
          </Link>
        </div>
        <div className="space-y-4">
          {recentNotes.map((note) => (
            <Link
              key={note.id}
              href={`/site/notes/${note.id}`}
              className="block group"
            >
              <article className="flex items-center justify-between py-3 border-b border-border/50 hover:border-border transition-colors">
                <span className="text-sm text-foreground group-hover:text-foreground/80 transition-colors">
                  {note.title}
                </span>
                <time className="text-xs text-muted-foreground shrink-0 ml-4">
                  {note.date}
                </time>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
