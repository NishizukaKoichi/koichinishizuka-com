"use client"

import { useState } from "react"
import {
  FileText,
  Search,
  Filter,
  Shield,
  Download,
  Package,
  Webhook,
  RefreshCw,
  User,
  ChevronDown,
  ChevronRight,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n/context"

type AuditEvent = {
  id: string
  event_type: string
  actor: string
  actor_type: "user" | "system" | "webhook"
  target_type: string
  target_id: string
  details: Record<string, unknown>
  timestamp: string
}

type LedgerEntry = {
  id: string
  stripe_event_id: string
  event_type: string
  processed_at: string
  idempotency_key: string
  status: "processed" | "duplicate" | "failed"
  payload_summary: string
}

const mockAuditEvents: AuditEvent[] = [
  {
    id: "aud_001",
    event_type: "entitlement.granted",
    actor: "stripe_webhook",
    actor_type: "webhook",
    target_type: "entitlement",
    target_id: "ent_001",
    details: { user_id: "user_abc123", product_id: "prod_001" },
    timestamp: "2026-01-25T10:30:00Z",
  },
  {
    id: "aud_002",
    event_type: "entitlement.revoked",
    actor: "admin@example.com",
    actor_type: "user",
    target_type: "entitlement",
    target_id: "ent_005",
    details: { user_id: "user_mno345", reason: "subscription_cancelled" },
    timestamp: "2026-01-25T10:25:00Z",
  },
  {
    id: "aud_003",
    event_type: "distribution.downloaded",
    actor: "user_def456",
    actor_type: "user",
    target_type: "distribution",
    target_id: "dist_001",
    details: { file_name: "cli-tool-v2.1.0-darwin-arm64.tar.gz" },
    timestamp: "2026-01-25T10:20:00Z",
  },
  {
    id: "aud_004",
    event_type: "product.created",
    actor: "admin@example.com",
    actor_type: "user",
    target_type: "product",
    target_id: "prod_003",
    details: { name: "CLI Tool Lifetime", sku: "CLI_LIFETIME" },
    timestamp: "2026-01-25T10:15:00Z",
  },
  {
    id: "aud_005",
    event_type: "reconcile.executed",
    actor: "admin@example.com",
    actor_type: "user",
    target_type: "system",
    target_id: "reconcile_001",
    details: { affected_entitlements: 3 },
    timestamp: "2026-01-25T10:10:00Z",
  },
  {
    id: "aud_006",
    event_type: "webhook.received",
    actor: "stripe",
    actor_type: "webhook",
    target_type: "webhook",
    target_id: "evt_abc123",
    details: { type: "checkout.session.completed" },
    timestamp: "2026-01-25T10:05:00Z",
  },
]

const mockLedgerEntries: LedgerEntry[] = [
  {
    id: "led_001",
    stripe_event_id: "evt_1abc2def3ghi",
    event_type: "checkout.session.completed",
    processed_at: "2026-01-25T10:30:00Z",
    idempotency_key: "evt_1abc2def3ghi",
    status: "processed",
    payload_summary: "customer: cus_xyz, amount: ¥2,980",
  },
  {
    id: "led_002",
    stripe_event_id: "evt_2abc3def4ghi",
    event_type: "customer.subscription.updated",
    processed_at: "2026-01-25T10:25:00Z",
    idempotency_key: "evt_2abc3def4ghi",
    status: "processed",
    payload_summary: "subscription: sub_abc, status: active",
  },
  {
    id: "led_003",
    stripe_event_id: "evt_3abc4def5ghi",
    event_type: "customer.subscription.deleted",
    processed_at: "2026-01-25T10:20:00Z",
    idempotency_key: "evt_3abc4def5ghi",
    status: "processed",
    payload_summary: "subscription: sub_def, cancellation_reason: user_request",
  },
  {
    id: "led_004",
    stripe_event_id: "evt_1abc2def3ghi",
    event_type: "checkout.session.completed",
    processed_at: "2026-01-25T10:30:01Z",
    idempotency_key: "evt_1abc2def3ghi",
    status: "duplicate",
    payload_summary: "Duplicate event, skipped",
  },
  {
    id: "led_005",
    stripe_event_id: "evt_4abc5def6ghi",
    event_type: "invoice.payment_failed",
    processed_at: "2026-01-25T10:15:00Z",
    idempotency_key: "evt_4abc5def6ghi",
    status: "processed",
    payload_summary: "invoice: in_xyz, reason: card_declined",
  },
]

const eventTypeIcons: Record<string, typeof Shield> = {
  "entitlement.granted": Shield,
  "entitlement.revoked": Shield,
  "distribution.downloaded": Download,
  "product.created": Package,
  "product.updated": Package,
  "reconcile.executed": RefreshCw,
  "webhook.received": Webhook,
}

export function MagicSpellAudit() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [eventFilter, setEventFilter] = useState<string>("all")
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  const filteredAuditEvents = mockAuditEvents.filter((event) => {
    const matchesSearch =
      event.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.target_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter =
      eventFilter === "all" || event.event_type.startsWith(eventFilter)
    return matchesSearch && matchesFilter
  })

  const formatTimestamp = (dateString: string) => {
    return new Date(dateString).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedEvents(newExpanded)
  }

  const getActorIcon = (actorType: string) => {
    switch (actorType) {
      case "webhook":
        return Webhook
      case "system":
        return RefreshCw
      default:
        return User
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "processed":
        return (
          <Badge
            variant="outline"
            className="bg-magicspell-primary/10 text-magicspell-primary border-transparent"
          >
            処理済み
          </Badge>
        )
      case "duplicate":
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground border-transparent">
            重複
          </Badge>
        )
      case "failed":
        return (
          <Badge
            variant="outline"
            className="bg-destructive/10 text-destructive border-transparent"
          >
            失敗
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-light text-foreground mb-1">
          {t("magicspell.audit.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          {t("magicspell.audit.desc")}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList>
          <TabsTrigger value="audit" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("magicspell.audit.title")}
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-2">
            <Webhook className="h-4 w-4" />
            {t("magicspell.ledger.title")}
          </TabsTrigger>
        </TabsList>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          {/* Search & Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="イベント、アクター、ターゲットで検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={eventFilter} onValueChange={setEventFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのイベント</SelectItem>
                <SelectItem value="entitlement">Entitlement</SelectItem>
                <SelectItem value="distribution">Distribution</SelectItem>
                <SelectItem value="product">Product</SelectItem>
                <SelectItem value="reconcile">Reconcile</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audit Events */}
          <div className="rounded-lg border border-border bg-card divide-y divide-border">
            {filteredAuditEvents.map((event) => {
              const EventIcon = eventTypeIcons[event.event_type] || FileText
              const ActorIcon = getActorIcon(event.actor_type)
              const isExpanded = expandedEvents.has(event.id)

              return (
                <div key={event.id} className="p-4">
                  <div
                    className="flex items-start gap-4 cursor-pointer"
                    onClick={() => toggleExpand(event.id)}
                  >
                    <div className="rounded bg-muted p-2">
                      <EventIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <code className="text-sm font-mono text-foreground">
                          {event.event_type}
                        </code>
                        <Badge variant="outline" className="text-xs">
                          {event.target_type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <ActorIcon className="h-3 w-3" />
                          <span className="font-mono">{event.actor}</span>
                        </div>
                        <span>→</span>
                        <span className="font-mono">{event.target_id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatTimestamp(event.timestamp)}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="mt-3 ml-12 rounded border border-border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground mb-2">
                        {t("magicspell.audit.details")}
                      </p>
                      <pre className="text-xs font-mono text-foreground overflow-x-auto">
                        {JSON.stringify(event.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </TabsContent>

        {/* Ledger Tab */}
        <TabsContent value="ledger" className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 mb-4">
            <p className="text-sm text-muted-foreground">
              {t("magicspell.ledger.desc")} - 
              Stripe Webhookから受信したすべてのイベントが記録されます。冪等性キーにより重複処理を防止しています。
            </p>
          </div>

          {/* Ledger Table */}
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("magicspell.ledger.event_id")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("magicspell.ledger.type")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("magicspell.products.status")}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    概要
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    {t("magicspell.ledger.processed_at")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {mockLedgerEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <code className="text-xs font-mono text-foreground">
                        {entry.stripe_event_id}
                      </code>
                    </td>
                    <td className="px-4 py-4">
                      <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-foreground">
                        {entry.event_type}
                      </code>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(entry.status)}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {entry.payload_summary}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground font-mono">
                      {formatTimestamp(entry.processed_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Idempotency Note */}
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="flex items-start gap-3">
              <div className="rounded bg-muted p-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-1">
                  {t("magicspell.ledger.idempotency")}
                </h3>
                <p className="text-sm text-muted-foreground">
                  同一のStripe Event IDを持つイベントは一度だけ処理されます。
                  重複イベントは"duplicate"としてマークされ、再処理は行われません。
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
