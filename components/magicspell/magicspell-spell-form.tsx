"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, Sparkles, Plus, X, Zap } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n/context"

const availableScopes = [
  { id: "premium:execute", name: "premium:execute", desc: "プレミアム機能の実行" },
  { id: "premium:export", name: "premium:export", desc: "エクスポート機能" },
  { id: "basic:execute", name: "basic:execute", desc: "基本機能の実行" },
  { id: "cli:execute", name: "cli:execute", desc: "CLIコマンドの実行" },
  { id: "cli:download", name: "cli:download", desc: "CLIツールのダウンロード" },
]

export function MagicSpellSpellForm() {
  const { t, language } = useI18n()
  const router = useRouter()
  const [spellType, setSpellType] = useState<"one_time" | "subscription">("subscription")
  const [interval, setInterval] = useState<"month" | "year">("month")
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddScope = (scopeId: string) => {
    if (!selectedScopes.includes(scopeId)) {
      setSelectedScopes([...selectedScopes, scopeId])
    }
  }

  const handleRemoveScope = (scopeId: string) => {
    setSelectedScopes(selectedScopes.filter((id) => id !== scopeId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    router.push("/magicspell/spells")
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="mb-4 gap-1 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {t("common.back")}
        </Button>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-magicspell-primary/10 p-2">
            <Sparkles className="h-6 w-6 text-magicspell-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-light text-foreground">
              {language === "ja" ? "Spellを作成" : "Create Spell"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === "ja" ? "実行権付き商品を定義します" : "Define a product with execution rights"}
            </p>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mb-6 rounded-lg border border-magicspell-primary/20 bg-magicspell-primary/5 p-4">
        <p className="text-sm text-muted-foreground">
          <Zap className="inline h-4 w-4 text-magicspell-primary mr-1" />
          {language === "ja"
            ? "Spell = Stripe Product + Scopes。購入者はこのSpellを買うことで、選択したScopeへの実行権を得ます。"
            : "Spell = Stripe Product + Scopes. Buyers gain execution rights to selected Scopes by purchasing this Spell."}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-medium text-foreground mb-4">
            {language === "ja" ? "基本情報" : "Basic Info"}
          </h2>

          <div className="space-y-2">
            <Label htmlFor="name">{language === "ja" ? "Spell名" : "Spell Name"}</Label>
            <Input
              id="name"
              placeholder={language === "ja" ? "例: Pro Execution" : "e.g., Pro Execution"}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              placeholder={language === "ja" ? "例: PRO_EXEC" : "e.g., PRO_EXEC"}
              className="font-mono"
              required
            />
            <p className="text-xs text-muted-foreground">
              {language === "ja"
                ? "一意の識別子。英数字とアンダースコアのみ。"
                : "Unique identifier. Alphanumeric and underscores only."}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{language === "ja" ? "説明（任意）" : "Description (optional)"}</Label>
            <Input
              id="description"
              placeholder={language === "ja" ? "購入者向けの説明" : "Description for buyers"}
            />
          </div>
        </div>

        {/* Scopes */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-medium text-foreground mb-4">
            {language === "ja" ? "付与するScope" : "Granted Scopes"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {language === "ja"
              ? "このSpellを購入すると、以下のScopeへの実行権が付与されます。"
              : "Purchasing this Spell grants execution rights to the following Scopes."}
          </p>

          {/* Selected Scopes */}
          {selectedScopes.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {selectedScopes.map((scopeId) => (
                <Badge
                  key={scopeId}
                  variant="outline"
                  className="border-magicspell-primary text-magicspell-primary gap-1"
                >
                  {scopeId}
                  <button
                    type="button"
                    onClick={() => handleRemoveScope(scopeId)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Available Scopes */}
          <div className="space-y-2">
            <Label>{language === "ja" ? "Scopeを追加" : "Add Scope"}</Label>
            <div className="grid gap-2">
              {availableScopes
                .filter((s) => !selectedScopes.includes(s.id))
                .map((scope) => (
                  <button
                    key={scope.id}
                    type="button"
                    onClick={() => handleAddScope(scope.id)}
                    className="flex items-center justify-between rounded-lg border border-border bg-background p-3 text-left hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <code className="text-sm font-mono text-foreground">{scope.name}</code>
                      <p className="text-xs text-muted-foreground mt-0.5">{scope.desc}</p>
                    </div>
                    <Plus className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
            </div>
          </div>

          {selectedScopes.length === 0 && (
            <p className="text-xs text-destructive">
              {language === "ja"
                ? "※ 少なくとも1つのScopeを選択してください"
                : "* Select at least one Scope"}
            </p>
          )}
        </div>

        {/* Pricing */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-medium text-foreground mb-4">
            {language === "ja" ? "価格設定" : "Pricing"}
          </h2>

          <div className="space-y-3">
            <Label>{language === "ja" ? "タイプ" : "Type"}</Label>
            <RadioGroup
              value={spellType}
              onValueChange={(v) => setSpellType(v as "one_time" | "subscription")}
              className="grid grid-cols-2 gap-4"
            >
              <div className="relative">
                <RadioGroupItem
                  value="subscription"
                  id="subscription"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="subscription"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 hover:bg-accent/50 peer-data-[state=checked]:border-magicspell-primary cursor-pointer"
                >
                  <span className="font-medium text-foreground">
                    {language === "ja" ? "サブスクリプション" : "Subscription"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {language === "ja" ? "定期課金" : "Recurring"}
                  </span>
                </Label>
              </div>
              <div className="relative">
                <RadioGroupItem
                  value="one_time"
                  id="one_time"
                  className="peer sr-only"
                />
                <Label
                  htmlFor="one_time"
                  className="flex flex-col items-center justify-center rounded-lg border-2 border-border bg-card p-4 hover:bg-accent/50 peer-data-[state=checked]:border-magicspell-primary cursor-pointer"
                >
                  <span className="font-medium text-foreground">
                    {language === "ja" ? "買い切り" : "One-time"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {language === "ja" ? "一回払い" : "Single payment"}
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">{language === "ja" ? "価格" : "Price"}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ¥
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="2980"
                  className="pl-8 font-mono"
                  required
                />
              </div>
            </div>

            {spellType === "subscription" && (
              <div className="space-y-2">
                <Label>{language === "ja" ? "請求サイクル" : "Billing Cycle"}</Label>
                <Select value={interval} onValueChange={(v) => setInterval(v as "month" | "year")}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">{language === "ja" ? "月額" : "Monthly"}</SelectItem>
                    <SelectItem value="year">{language === "ja" ? "年額" : "Yearly"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        {/* Stripe Integration */}
        <div className="rounded-lg border border-border bg-card p-6 space-y-4">
          <h2 className="font-medium text-foreground mb-4">
            {language === "ja" ? "Stripe連携（任意）" : "Stripe Integration (optional)"}
          </h2>
          <p className="text-sm text-muted-foreground mb-4">
            {language === "ja"
              ? "既存のStripe ProductとPriceをリンクする場合は入力してください。空の場合は自動で作成されます。"
              : "Enter to link existing Stripe Product and Price. If empty, they will be created automatically."}
          </p>

          <div className="space-y-2">
            <Label htmlFor="stripe_product_id">Stripe Product ID</Label>
            <Input
              id="stripe_product_id"
              placeholder="prod_..."
              className="font-mono"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe_price_id">Stripe Price ID</Label>
            <Input
              id="stripe_price_id"
              placeholder="price_..."
              className="font-mono"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="bg-transparent"
          >
            {language === "ja" ? "キャンセル" : "Cancel"}
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || selectedScopes.length === 0}
          >
            {isSubmitting
              ? (language === "ja" ? "作成中..." : "Creating...")
              : (language === "ja" ? "Spellを作成" : "Create Spell")}
          </Button>
        </div>
      </form>
    </div>
  )
}
