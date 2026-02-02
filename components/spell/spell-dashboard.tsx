"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Sparkles,
  Shield,
  Key,
  Webhook,
  ArrowRight,
  ArrowUpRight,
  Zap,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"

type Spell = { spellId: string }

type Scope = { scopeKey: string }

type Entitlement = { status: "active" | "revoked" }

type AuditEvent = {
  auditId: string
  eventName: string
  actorId?: string
  targetId?: string
  metadata: Record<string, unknown>
  createdAt: string
}

type Stat = {
  label: string
  value: string
  change?: string | null
  trend?: "up"
  icon: typeof Sparkles
}

const eventTypeLabels: Record<string, { label: string; color: string }> = {
  spell_created: { label: "Spell作成", color: "text-spell-primary" },
  spell_status_updated: { label: "状態更新", color: "text-muted-foreground" },
  scope_created: { label: "Scope作成", color: "text-spell-primary" },
  entitlement_granted: { label: "権利付与", color: "text-spell-primary" },
  entitlement_revoked: { label: "権利剥奪", color: "text-destructive" },
  stripe_event_processed: { label: "Webhook", color: "text-talisman-primary" },
  reconcile_executed: { label: "Reconcile", color: "text-muted-foreground" },
}

export function SpellDashboard() {
  const { t } = useI18n()
  const [stats, setStats] = useState<Stat[]>([])
  const [recentEvents, setRecentEvents] = useState<AuditEvent[]>([])

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const [spellsRes, scopesRes, entitlementsRes, auditRes] = await Promise.all([
          fetch("/api/v1/spell/spells"),
          fetch("/api/v1/spell/scopes"),
          fetch("/api/v1/spell/entitlements"),
          fetch("/api/v1/spell/audit?limit=5"),
        ])

        const spellsData = spellsRes.ok ? ((await spellsRes.json()) as { spells: Spell[] }) : { spells: [] }
        const scopesData = scopesRes.ok ? ((await scopesRes.json()) as { scopes: Scope[] }) : { scopes: [] }
        const entitlementsData = entitlementsRes.ok
          ? ((await entitlementsRes.json()) as { entitlements: Entitlement[] })
          : { entitlements: [] }
        const auditData = auditRes.ok ? ((await auditRes.json()) as { audit: AuditEvent[] }) : { audit: [] }

        const activeEntitlements = entitlementsData.entitlements.filter((entitlement) => entitlement.status === "active")
        const webhookEvents = auditData.audit.filter((event) => event.eventName === "stripe_event_processed")

        const nextStats: Stat[] = [
          {
            label: "Spells",
            value: String(spellsData.spells.length),
            change: null,
            icon: Sparkles,
          },
          {
            label: t("spell.stats.active_entitlements"),
            value: String(activeEntitlements.length),
            change: null,
            icon: Shield,
          },
          {
            label: "Scopes",
            value: String(scopesData.scopes.length),
            change: null,
            icon: Key,
          },
          {
            label: t("spell.stats.webhook_events"),
            value: String(webhookEvents.length),
            change: null,
            icon: Webhook,
          },
        ]

        if (!cancelled) {
          setStats(nextStats)
          setRecentEvents(auditData.audit)
        }
      } catch {
        if (!cancelled) {
          setStats([])
          setRecentEvents([])
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [t])

  const formattedEvents = useMemo(() => {
    return recentEvents.map((event) => {
      const scope = typeof event.metadata?.scope === "string" ? event.metadata.scope : null
      const sku = typeof event.metadata?.sku === "string" ? event.metadata.sku : null
      return {
        ...event,
        scope: scope ?? sku ?? "-",
      }
    })
  }, [recentEvents])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-foreground mb-2">
          {t("spell.dashboard")}
        </h1>
        <p className="text-sm text-muted-foreground">
          商品の定義、Scopeの設定、Entitlementの確認
        </p>
      </div>

      {/* Important Concept */}
      <div className="rounded-lg border border-spell-primary/30 bg-spell-primary/5 p-4 mb-8">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-spell-primary mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">Spell = 実行主権の判定装置</h3>
            <p className="text-sm text-muted-foreground">
              「この実行は、今、許可されているか？」にYes/Noを返すだけ。
              処理の中身は見ない。安全も正しさも判断しない。価格も知らない。
            </p>
            <div className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
              <strong className="text-foreground">第三者が自分のSpellを作りたい場合:</strong> 自分の環境にデプロイし、Spell APIに接続する
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {stat.change && (
                  <div className="flex items-center gap-1 text-xs text-spell-primary">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.change}
                  </div>
                )}
              </div>
              <div className="text-2xl font-light text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.label}
              </div>
            </div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Link href="/spell/spells/new">
          <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <Sparkles className="h-5 w-5 text-spell-primary" />
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
        <Link href="/spell/scopes">
          <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <Key className="h-5 w-5 text-spell-primary" />
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
        <Link href="/spell/entitlements">
          <div className="rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <Shield className="h-5 w-5 text-spell-primary" />
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
              <Link href="/spell/audit">
                <Button variant="ghost" size="sm" className="text-xs">
                  すべて見る
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
          <div className="divide-y divide-border">
            {formattedEvents.map((event) => {
              const eventInfo = eventTypeLabels[event.eventName] ?? { label: event.eventName, color: "text-muted-foreground" }
              return (
                <div key={event.auditId} className="px-4 py-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-mono ${eventInfo.color}`}>
                      {eventInfo.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.actorId ?? event.targetId ?? "system"} · {event.scope}
                  </div>
                </div>
              )
            })}
            {formattedEvents.length === 0 && (
              <div className="px-4 py-3 text-xs text-muted-foreground">イベントがありません</div>
            )}
          </div>
        </div>

        {/* Flow Summary */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border p-4">
            <h2 className="font-medium text-foreground">実行フロー</h2>
          </div>
          <div className="p-4 text-sm text-muted-foreground space-y-3">
            <p>1. Spell Runtime が Scope Check を送信</p>
            <p>2. Entitlement が有効なら allowed=true</p>
            <p>3. allowed=true の場合のみ実行</p>
            <p>4. allowed=false の場合は即終了</p>
          </div>
        </div>
      </div>
    </div>
  )
}
