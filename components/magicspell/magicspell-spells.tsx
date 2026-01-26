"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ExternalLink,
  Search,
  Zap,
  Package,
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
  id: string
  name: string
  sku: string
  price: number
  currency: string
  type: "one_time" | "subscription"
  interval?: "month" | "year"
  status: "active" | "inactive"
  stripe_product_id: string
  stripe_price_id: string
  created_at: string
  entitlements_count: number
  scopes: string[]
}

const mockSpells: Spell[] = [
  {
    id: "spell_001",
    name: "Pro Execution",
    sku: "PRO_EXEC",
    price: 2980,
    currency: "JPY",
    type: "subscription",
    interval: "month",
    status: "active",
    stripe_product_id: "prod_abc123",
    stripe_price_id: "price_def456",
    created_at: "2025-06-01T00:00:00Z",
    entitlements_count: 89,
    scopes: ["premium:execute", "premium:export"],
  },
  {
    id: "spell_002",
    name: "Starter Access",
    sku: "STARTER_ACCESS",
    price: 980,
    currency: "JPY",
    type: "subscription",
    interval: "month",
    status: "active",
    stripe_product_id: "prod_ghi789",
    stripe_price_id: "price_jkl012",
    created_at: "2025-06-01T00:00:00Z",
    entitlements_count: 39,
    scopes: ["basic:execute"],
  },
  {
    id: "spell_003",
    name: "CLI Tool Lifetime",
    sku: "CLI_LIFETIME",
    price: 9800,
    currency: "JPY",
    type: "one_time",
    status: "active",
    stripe_product_id: "prod_mno345",
    stripe_price_id: "price_pqr678",
    created_at: "2025-08-15T00:00:00Z",
    entitlements_count: 24,
    scopes: ["cli:execute", "cli:download"],
  },
]

export function MagicSpellSpells() {
  const { t, language } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const filteredSpells = mockSpells.filter(
    (spell) =>
      spell.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spell.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency,
    }).format(price)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-1 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-magicspell-primary" />
            {language === "ja" ? "Spells" : "Spells"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {language === "ja" ? "実行権付き商品の定義" : "Define execution-rights products"}
          </p>
        </div>
        <Link href="/magicspell/spells/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {language === "ja" ? "Spellを追加" : "Add Spell"}
          </Button>
        </Link>
      </div>

      {/* Explanation */}
      <div className="mb-6 rounded-lg border border-magicspell-primary/20 bg-magicspell-primary/5 p-4">
        <div className="text-sm text-muted-foreground">
          <Zap className="inline h-4 w-4 text-magicspell-primary mr-1" />
          {language === "ja" 
            ? "あなたが第三者に提供する実行権の定義。購入者はこのSpellを従量課金で利用します。"
            : "Execution rights you provide to third parties. Buyers use these Spells on a pay-per-use basis."}
        </div>
        <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
          {language === "ja"
            ? "※ 第三者が自分専用のSpellを作りたい場合は、自分の環境にデプロイしてMagicSpell APIに接続します。Spellのカタログ機能は別プロダクトになります。"
            : "* If third parties want to create their own Spells, they deploy to their own environment and connect to the MagicSpell API. A Spell catalog would be a separate product."}
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
          <Link href="/magicspell/spells/new">
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
                  key={spell.id}
                  className="hover:bg-accent/30 transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="font-medium text-foreground flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-magicspell-primary" />
                      {spell.name}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {spell.sku}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1">
                      {spell.scopes.map((scope) => (
                        <code key={scope} className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground">
                          {scope}
                        </code>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={
                        spell.type === "subscription"
                          ? "border-magicspell-primary text-magicspell-primary"
                          : ""
                      }
                    >
                      {spell.type === "subscription"
                        ? `${language === "ja" ? "サブスク" : "Subscription"}`
                        : language === "ja" ? "買い切り" : "One-time"}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 font-mono text-foreground">
                    {formatPrice(spell.price, spell.currency)}
                    {spell.type === "subscription" && (
                      <span className="text-muted-foreground text-xs">
                        /{spell.interval === "month" ? (language === "ja" ? "月" : "mo") : (language === "ja" ? "年" : "yr")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <Badge
                      variant={
                        spell.status === "active" ? "default" : "secondary"
                      }
                      className={
                        spell.status === "active"
                          ? "bg-magicspell-primary/20 text-magicspell-primary border-magicspell-primary/30"
                          : ""
                      }
                    >
                      {spell.status === "active"
                        ? (language === "ja" ? "有効" : "Active")
                        : (language === "ja" ? "無効" : "Inactive")}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-foreground">
                    {spell.entitlements_count}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          編集
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Stripeで開く
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Important Note */}
      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <div className="flex items-start gap-3">
          <div className="rounded bg-muted p-2">
            <ExternalLink className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground mb-1">
              {language === "ja" ? "MagicSpellの責任範囲" : "MagicSpell's Responsibility"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "ja"
                ? "MagicSpellは「この実行を許可するか」にYes/Noを返すだけ。処理の中身、安全性、正しさ、価格は一切関与しません。"
                : "MagicSpell only returns Yes/No to 'is this execution allowed?'. It has no involvement in the processing itself, safety, correctness, or pricing."}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
