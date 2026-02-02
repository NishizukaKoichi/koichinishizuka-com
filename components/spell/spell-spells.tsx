"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Search,
  Zap,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n/context"

type Spell = {
  spellId: string
  name: string
  sku: string
  type: "one_time" | "subscription"
  status: "active" | "inactive"
  createdAt: string
  scopes: string[]
  entitlementsCount: number
}

export function SpellSpells() {
  const { t, language } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [spells, setSpells] = useState<Spell[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setError(null)
      try {
        const res = await fetch("/api/v1/spell/spells")
        if (!res.ok) {
          throw new Error("Spellの取得に失敗しました")
        }
        const data = (await res.json()) as { spells: Array<{ spellId: string; name: string; sku: string; type: "one_time" | "subscription"; status: "active" | "inactive"; createdAt: string }> }

        const enriched = await Promise.all(
          (data.spells ?? []).map(async (spell) => {
            const detailRes = await fetch(`/api/v1/spell/spells/${spell.spellId}`)
            const detailData = detailRes.ok
              ? ((await detailRes.json()) as { spell: { scopes?: string[] } })
              : { spell: { scopes: [] } }

            const entitlementsRes = await fetch(`/api/v1/spell/entitlements?spell_id=${spell.spellId}`)
            const entitlementsData = entitlementsRes.ok
              ? ((await entitlementsRes.json()) as { entitlements: Array<{ status: "active" | "revoked" }> })
              : { entitlements: [] }

            return {
              spellId: spell.spellId,
              name: spell.name,
              sku: spell.sku,
              type: spell.type,
              status: spell.status,
              createdAt: spell.createdAt,
              scopes: detailData.spell.scopes ?? [],
              entitlementsCount: entitlementsData.entitlements?.length ?? 0,
            }
          })
        )

        if (!cancelled) {
          setSpells(enriched)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "データ取得に失敗しました")
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredSpells = useMemo(() => {
    return spells.filter(
      (spell) =>
        spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spell.sku.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [spells, searchQuery])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-1 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-spell-primary" />
            {language === "ja" ? "Spells" : "Spells"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === "ja" ? "実行権付き商品の定義" : "Define execution-rights products"}
          </p>
        </div>
        <Link href="/spell/spells/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {language === "ja" ? "Spellを追加" : "Add Spell"}
          </Button>
        </Link>
      </div>

      {error && <div className="text-sm text-red-500 mb-4">{error}</div>}

      {/* Explanation */}
      <div className="mb-6 rounded-lg border border-spell-primary/20 bg-spell-primary/5 p-4">
        <div className="text-sm text-muted-foreground">
          <Zap className="inline h-4 w-4 text-spell-primary mr-1" />
          {language === "ja" 
            ? "あなたが第三者に提供する実行権の定義。購入者はこのSpellを従量課金で利用します。"
            : "Execution rights you provide to third parties. Buyers use these Spells on a pay-per-use basis."}
        </div>
        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
          {language === "ja"
            ? "※ 第三者が自分専用のSpellを作りたい場合は、自分の環境にデプロイしてSpell APIに接続します。Spellのカタログ機能は別プロダクトになります。"
            : "* If third parties want to create their own Spells, they deploy to their own environment and connect to the Spell API. A Spell catalog would be a separate product."}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={language === "ja" ? "Spell名またはSKUで検索..." : "Search by name or SKU..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Spells Table */}
      {filteredSpells.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Sparkles className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {language === "ja" ? "Spellがありません" : "No Spells"}
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {language === "ja" ? "最初のSpellを作成して販売を開始しましょう" : "Create your first Spell to start selling"}
          </p>
          <Link href="/spell/spells/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {language === "ja" ? "Spellを追加" : "Add Spell"}
            </Button>
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Spell
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Scopes
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {language === "ja" ? "タイプ" : "Type"}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {language === "ja" ? "価格" : "Price"}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {language === "ja" ? "状態" : "Status"}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Entitlements
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {language === "ja" ? "操作" : "Actions"}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSpells.map((spell) => (
                <tr
                  key={spell.spellId}
                  className="hover:bg-accent/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-spell-primary" />
                      {spell.name}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {spell.sku}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {spell.scopes.length === 0 ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        spell.scopes.map((scope) => (
                          <code key={scope} className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                            {scope}
                          </code>
                        ))
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="secondary">
                      {spell.type === "subscription" ? "Subscription" : "One-time"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">—</td>
                  <td className="px-4 py-4">
                    <Badge variant={spell.status === "active" ? "default" : "secondary"}>
                      {spell.status === "active" ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted-foreground">
                    {spell.entitlementsCount}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/spell/spells/${spell.spellId}`} className="flex items-center gap-2">
                            <Pencil className="h-4 w-4" />
                            詳細
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
