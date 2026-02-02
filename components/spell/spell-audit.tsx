"use client"

import { useEffect, useMemo, useState } from "react"
import {
  FileText,
  Search,
  Filter,
  Shield,
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
  auditId: string
  eventName: string
  actorId?: string
  targetId?: string
  metadata: Record<string, unknown>
  createdAt: string
}

type LedgerEntry = {
  stripeEventId: string
  payloadHash: string
  receivedAt: string
  processedAt?: string
}

const eventTypeIcons: Record<string, typeof Shield> = {
  entitlement_granted: Shield,
  entitlement_revoked: Shield,
  spell_created: Shield,
  spell_status_updated: Shield,
  scope_created: Shield,
  stripe_event_processed: Webhook,
  reconcile_executed: RefreshCw,
}

const eventLabels: Record<string, string> = {
  entitlement_granted: "Entitlement付与",
  entitlement_revoked: "Entitlement剥奪",
  spell_created: "Spell作成",
  spell_status_updated: "Spell状態変更",
  scope_created: "Scope作成",
  stripe_event_processed: "Stripeイベント処理",
  reconcile_executed: "Reconcile実行",
}

export function SpellAudit() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [eventFilter, setEventFilter] = useState<string>("all")
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([])
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [auditRes, ledgerRes] = await Promise.all([
        fetch("/api/v1/spell/audit?limit=200"),
        fetch("/api/v1/spell/ledger?limit=200"),
      ])

      if (!auditRes.ok) {
        throw new Error("Auditログの取得に失敗しました")
      }
      if (!ledgerRes.ok) {
        throw new Error("Stripeイベントの取得に失敗しました")
      }

      const auditData = (await auditRes.json()) as { audit: AuditEvent[] }
      const ledgerData = (await ledgerRes.json()) as { entries: LedgerEntry[] }

      setAuditEvents(auditData.audit ?? [])
      setLedgerEntries(ledgerData.entries ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "データ取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const eventCategory = (eventName: string) => {
    if (eventName.startsWith("entitlement_")) return "entitlement"
    if (eventName.startsWith("spell_")) return "spell"
    if (eventName.startsWith("scope_")) return "scope"
    if (eventName.startsWith("stripe_")) return "stripe"
    if (eventName.startsWith("reconcile_")) return "reconcile"
    return "other"
  }

  const filteredAuditEvents = useMemo(() => {
    return auditEvents.filter((event) => {
      const matchesSearch =
        event.eventName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.actorId ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (event.targetId ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter =
        eventFilter === "all" || eventCategory(event.eventName) === eventFilter
      return matchesSearch && matchesFilter
    })
  }, [auditEvents, searchQuery, eventFilter])

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

  const getActorLabel = (event: AuditEvent) => {
    if (event.eventName === "stripe_event_processed") return "stripe"
    return event.actorId ?? "system"
  }

  const getActorIcon = (event: AuditEvent) => {
    if (event.eventName === "stripe_event_processed") return Webhook
    if (event.actorId) return User
    return RefreshCw
  }

  const getStatusBadge = (processedAt?: string) => {
    if (processedAt) {
      return (
        <Badge
          variant="outline"
          className="bg-spell-primary/10 text-spell-primary border-transparent"
        >
          処理済み
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="bg-muted text-muted-foreground border-transparent">
        未処理
      </Badge>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-1">{t("spell.audit.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("spell.audit.desc")}</p>
        </div>
        <Button variant="outline" className="gap-2 bg-transparent" onClick={load}>
          <RefreshCw className="h-4 w-4" />
          再読み込み
        </Button>
      </div>

      {error && <div className="text-sm text-destructive mb-4">{error}</div>}

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="audit">監査ログ</TabsTrigger>
          <TabsTrigger value="ledger">Stripe Ledger</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="検索..."
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
                <SelectItem value="all">すべて</SelectItem>
                <SelectItem value="entitlement">Entitlement</SelectItem>
                <SelectItem value="spell">Spell</SelectItem>
                <SelectItem value="scope">Scope</SelectItem>
                <SelectItem value="stripe">Stripe</SelectItem>
                <SelectItem value="reconcile">Reconcile</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audit Events */}
          {isLoading ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              読み込み中...
            </div>
          ) : filteredAuditEvents.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">ログがありません</h3>
              <p className="text-sm text-muted-foreground">まだ監査ログが記録されていません</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredAuditEvents.map((event) => {
                const Icon = eventTypeIcons[event.eventName] || Shield
                const isExpanded = expandedEvents.has(event.auditId)
                const ActorIcon = getActorIcon(event)
                return (
                  <div
                    key={event.auditId}
                    className="rounded-lg border border-border bg-card overflow-hidden"
                  >
                    <button
                      type="button"
                      className="w-full p-4 text-left hover:bg-accent/30 transition-colors"
                      onClick={() => toggleExpand(event.auditId)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-lg bg-spell-primary/10">
                            <Icon className="h-4 w-4 text-spell-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-foreground">
                                {eventLabels[event.eventName] ?? event.eventName}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {event.eventName}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                              <span>{formatTimestamp(event.createdAt)}</span>
                              {event.targetId && <span>Target: {event.targetId}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <ActorIcon className="h-3 w-3" />
                            <span>{getActorLabel(event)}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t border-border bg-muted/20 p-4">
                        <div className="grid gap-4 text-sm">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Event ID</p>
                            <code className="text-xs font-mono text-foreground">
                              {event.auditId}
                            </code>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Metadata</p>
                            <pre className="text-xs font-mono text-muted-foreground whitespace-pre-wrap">
                              {JSON.stringify(event.metadata, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Ledger Tab */}
        <TabsContent value="ledger">
          {isLoading ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
              読み込み中...
            </div>
          ) : ledgerEntries.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-12 text-center">
              <Webhook className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Stripe Ledgerがありません</h3>
              <p className="text-sm text-muted-foreground">Webhookの受信が発生すると記録されます</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Stripe Event ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Received
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Processed
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Payload Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {ledgerEntries.map((entry) => (
                    <tr key={entry.stripeEventId} className="hover:bg-accent/30 transition-colors">
                      <td className="px-4 py-4 text-sm font-mono text-foreground">
                        {entry.stripeEventId}
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(entry.processedAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {formatTimestamp(entry.receivedAt)}
                      </td>
                      <td className="px-4 py-4 text-sm text-muted-foreground">
                        {entry.processedAt ? formatTimestamp(entry.processedAt) : "—"}
                      </td>
                      <td className="px-4 py-4 text-xs font-mono text-muted-foreground">
                        {entry.payloadHash.slice(0, 12)}...
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
