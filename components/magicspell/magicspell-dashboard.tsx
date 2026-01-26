"use client"

import Link from "next/link"
import {
  Sparkles,
  Shield,
  Key,
  Webhook,
  ArrowRight,
  ArrowUpRight,
  Code,
  ExternalLink,
  Zap,
  Package,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"

const mockStats = [
  {
    label: "Spells",
    value: "3",
    change: null,
    icon: Sparkles,
  },
  {
    labelKey: "magicspell.stats.active_entitlements",
    value: "128",
    change: "+12",
    trend: "up",
    icon: Shield,
  },
  {
    label: "Scopes",
    value: "4",
    change: null,
    icon: Key,
  },
  {
    labelKey: "magicspell.stats.webhook_events",
    value: "256",
    change: null,
    icon: Webhook,
  },
]

const recentEvents = [
  {
    type: "entitlement_granted",
    user: "user_abc123",
    scope: "pro:execute",
    timestamp: "2026-01-25T10:30:00Z",
  },
  {
    type: "entitlement_check",
    user: "user_def456",
    scope: "cli:download",
    result: "allowed",
    timestamp: "2026-01-25T10:25:00Z",
  },
  {
    type: "subscription_renewed",
    user: "user_ghi789",
    scope: "pro:execute",
    timestamp: "2026-01-25T10:20:00Z",
  },
  {
    type: "entitlement_revoked",
    user: "user_jkl012",
    scope: "starter:access",
    timestamp: "2026-01-25T10:15:00Z",
  },
  {
    type: "webhook_received",
    user: "stripe",
    scope: "checkout.session.completed",
    timestamp: "2026-01-25T10:10:00Z",
  },
]

const eventTypeLabels: Record<string, { label: string; color: string }> = {
  entitlement_granted: { label: "権利付与", color: "text-magicspell-primary" },
  entitlement_revoked: { label: "権利剥奪", color: "text-destructive" },
  entitlement_check: { label: "チェック", color: "text-muted-foreground" },
  subscription_renewed: { label: "更新", color: "text-magicspell-primary" },
  webhook_received: { label: "Webhook", color: "text-talisman-primary" },
}

export function MagicSpellDashboard() {
  const { t } = useI18n()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-foreground mb-2">
          {t("magicspell.dashboard")}
        </h1>
        <p className="text-sm text-muted-foreground">
          商品の定義、Scopeの設定、Entitlementの確認
        </p>
      </div>

      {/* Important Concept */}
      <div className="rounded-lg border border-magicspell-primary/30 bg-magicspell-primary/5 p-4 mb-8">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-magicspell-primary mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">MagicSpell = 実行主権の判定装置</h3>
            <p className="text-sm text-muted-foreground">
              「この実行は、今、許可されているか？」にYes/Noを返すだけ。
              処理の中身は見ない。安全も正しさも判断しない。価格も知らない。
            </p>
            <div className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
              <strong className="text-foreground">第三者が自分のSpellを作りたい場合:</strong> 自分の環境にデプロイし、MagicSpell APIに接続する
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {mockStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {stat.change && (
                  <div className="flex items-center gap-1 text-xs text-magicspell-primary">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.change}
                  </div>
                )}
              </div>
              <div className="text-2xl font-light text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.labelKey ? t(stat.labelKey) : stat.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Link href="/magicspell/spells/new">
          <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="h-5 w-5 text-magicspell-primary" />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-medium text-foreground mb-1">
              Spellを作成
            </h3>
            <p className="text-xs text-muted-foreground">
              実行権付き商品を定義
            </p>
          </div>
        </Link>
        <Link href="/magicspell/scopes">
          <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <Key className="h-5 w-5 text-magicspell-primary" />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-medium text-foreground mb-1">
              Scopeを定義
            </h3>
            <p className="text-xs text-muted-foreground">
              実行/取得の判定単位を設定
            </p>
          </div>
        </Link>
        <Link href="/magicspell/entitlements">
          <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-magicspell-primary" />
              <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <h3 className="font-medium text-foreground mb-1">
              Entitlementを確認
            </h3>
            <p className="text-xs text-muted-foreground">
              ユーザーの権利状態を確認
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Events & Flow */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Events */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium text-foreground">最近のイベント</h2>
              <Link href="/magicspell/audit">
                <Button variant="ghost" size="sm" className="text-xs">
                  すべて見る
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-border">
            {recentEvents.map((event, index) => {
              const eventInfo = eventTypeLabels[event.type]
              return (
                <div key={index} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-mono ${eventInfo.color}`}>
                      {eventInfo.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleTimeString("ja-JP", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground font-mono text-xs">
                      {event.user}
                    </span>
                    <span className="text-muted-foreground">→</span>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded text-foreground">
                      {event.scope}
                    </code>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* User Flow */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="font-medium text-foreground">ユーザー体験フロー</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-muted w-6 h-6 flex items-center justify-center text-xs font-mono text-muted-foreground">1</div>
              <div>
                <div className="font-medium text-foreground text-sm">まず試す</div>
                <p className="text-xs text-muted-foreground">ユーザーはあなたのプロダクトを普通に使う</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-muted w-6 h-6 flex items-center justify-center text-xs font-mono text-muted-foreground">2</div>
              <div>
                <div className="font-medium text-foreground text-sm">止まる</div>
                <p className="text-xs text-muted-foreground">権利が必要な操作に当たると、MagicSpellがNoを返す</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-muted w-6 h-6 flex items-center justify-center text-xs font-mono text-muted-foreground">3</div>
              <div>
                <div className="font-medium text-foreground text-sm">支払う</div>
                <p className="text-xs text-muted-foreground">Stripeで決済、Webhookで権利が即時付与</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-magicspell-primary/20 w-6 h-6 flex items-center justify-center text-xs font-mono text-magicspell-primary">4</div>
              <div>
                <div className="font-medium text-foreground text-sm">通る</div>
                <p className="text-xs text-muted-foreground">同じ操作をやり直すと、今度は通る</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <Link href="/magicspell/integration" className="text-sm text-magicspell-primary hover:underline flex items-center gap-1">
                統合ガイドを見る
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* API Example */}
      <div className="mt-6 rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4 flex items-center gap-2">
          <Code className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-medium text-foreground">API使用例</h2>
        </div>
        <div className="p-4">
          <div className="rounded border border-border bg-muted/30 p-4 font-mono text-xs overflow-x-auto">
            <pre className="text-muted-foreground">
              {`// あなたのプロダクト側で
const { entitled } = await fetch('https://api.magicspell.dev/v1/check', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer ' + API_KEY },
  body: JSON.stringify({ user_id: 'user_abc', scope: 'pro:execute' })
}).then(r => r.json());

if (!entitled) {
  throw new Error('Not entitled');  // 購入へ誘導
}

// 機能を実行...`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
