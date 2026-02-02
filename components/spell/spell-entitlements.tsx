"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Shield,
  Search,
  Plus,
  RefreshCw,
  Trash2,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useI18n } from "@/lib/i18n/context"

type SpellSummary = {
  spellId: string
  name: string
}

type Entitlement = {
  entitlementId: string
  spellId: string
  userIdentifier: string
  status: "active" | "revoked"
  grantedAt: string
  revokedAt?: string
  sourceEventId?: string
}

export function SpellEntitlements() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false)
  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = useState(false)
  const [entitlements, setEntitlements] = useState<Entitlement[]>([])
  const [spells, setSpells] = useState<SpellSummary[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [grantUserId, setGrantUserId] = useState("")
  const [grantSpellId, setGrantSpellId] = useState("")

  const spellNameMap = useMemo(() => {
    return spells.reduce<Record<string, string>>((acc, spell) => {
      acc[spell.spellId] = spell.name
      return acc
    }, {})
  }, [spells])

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [spellsRes, entitlementsRes] = await Promise.all([
        fetch("/api/v1/spell/spells"),
        fetch("/api/v1/spell/entitlements"),
      ])

      if (!spellsRes.ok) {
        throw new Error("Spellの取得に失敗しました")
      }
      if (!entitlementsRes.ok) {
        throw new Error("Entitlementの取得に失敗しました")
      }

      const spellsData = (await spellsRes.json()) as {
        spells: Array<{ spellId: string; name: string }>
      }
      const entitlementsData = (await entitlementsRes.json()) as {
        entitlements: Array<{
          entitlementId: string
          spellId: string
          userIdentifier: string
          status: "active" | "revoked"
          grantedAt: string
          revokedAt?: string
          sourceEventId?: string
        }>
      }

      setSpells(spellsData.spells ?? [])
      setEntitlements(entitlementsData.entitlements ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "データ取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const filteredEntitlements = useMemo(() => {
    return entitlements.filter((ent) => {
      const spellName = spellNameMap[ent.spellId] ?? ent.spellId
      const matchesSearch =
        ent.userIdentifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spellName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus =
        statusFilter === "all" || ent.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [entitlements, searchQuery, statusFilter, spellNameMap])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return {
          label: "有効",
          icon: CheckCircle2,
          color: "text-spell-primary",
          bgColor: "bg-spell-primary/10",
        }
      case "revoked":
        return {
          label: "剥奪済み",
          icon: XCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
        }
      default:
        return {
          label: status,
          icon: Shield,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
        }
    }
  }

  const getSourceLabel = (sourceEventId?: string) => {
    if (!sourceEventId) return "Manual"
    if (sourceEventId.startsWith("evt_")) return "Webhook"
    return "Manual"
  }

  const handleReconcile = async () => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/v1/spell/reconcile", { method: "POST" })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error ?? "Reconcileに失敗しました")
      }
      await load()
      setIsReconcileDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reconcileに失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGrant = async () => {
    if (!grantUserId || !grantSpellId) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/v1/spell/entitlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spell_id: grantSpellId,
          user_identifier: grantUserId,
          status: "active",
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error ?? "Entitlementの付与に失敗しました")
      }
      await load()
      setGrantUserId("")
      setGrantSpellId("")
      setIsGrantDialogOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Entitlementの付与に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRevoke = async (entitlement: Entitlement) => {
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/v1/spell/entitlements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          spell_id: entitlement.spellId,
          user_identifier: entitlement.userIdentifier,
          status: "revoked",
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error ?? "Entitlementの剥奪に失敗しました")
      }
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Entitlementの剥奪に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-1">
            {t("spell.entitlements.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("spell.entitlements.desc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isReconcileDialogOpen} onOpenChange={setIsReconcileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                {t("spell.entitlements.reconcile")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reconcile</DialogTitle>
                <DialogDescription>
                  Stripeの状態と同期して不整合を修正します。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="mb-2">この操作は以下を行います:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Stripeのサブスクリプション状態を確認</li>
                    <li>Entitlementを最新化</li>
                    <li>不整合があれば修正</li>
                    <li>すべての変更は監査ログに記録</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReconcileDialogOpen(false)} className="bg-transparent">
                  キャンセル
                </Button>
                <Button onClick={handleReconcile} disabled={isSubmitting}>
                  Reconcileを実行
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("spell.entitlements.grant")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("spell.entitlements.grant")}</DialogTitle>
                <DialogDescription>
                  ユーザーに手動で権利を付与します。この操作は監査ログに記録されます。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>{t("spell.entitlements.user_id")}</Label>
                  <Input
                    placeholder="user_..."
                    className="font-mono"
                    value={grantUserId}
                    onChange={(event) => setGrantUserId(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("spell.entitlements.product")}</Label>
                  <Select value={grantSpellId} onValueChange={setGrantSpellId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Spellを選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {spells.map((spell) => (
                        <SelectItem key={spell.spellId} value={spell.spellId}>
                          {spell.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGrantDialogOpen(false)} className="bg-transparent">
                  キャンセル
                </Button>
                <Button onClick={handleGrant} disabled={isSubmitting || !grantUserId || !grantSpellId}>
                  権利を付与
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {error && <div className="text-sm text-destructive mb-4">{error}</div>}

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("spell.entitlements.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="active">有効</SelectItem>
            <SelectItem value="revoked">剥奪済み</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entitlements Table */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          読み込み中...
        </div>
      ) : filteredEntitlements.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t("spell.entitlements.empty")}
          </h3>
          <p className="text-sm text-muted-foreground">
            検索条件に一致するEntitlementが見つかりませんでした
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("spell.entitlements.user_id")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("spell.entitlements.product")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("spell.products.status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("spell.entitlements.granted_at")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("spell.entitlements.expires_at")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("spell.entitlements.source")}
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredEntitlements.map((ent) => {
                const statusInfo = getStatusInfo(ent.status)
                const StatusIcon = statusInfo.icon
                const spellName = spellNameMap[ent.spellId] ?? ent.spellId
                return (
                  <tr
                    key={ent.entitlementId}
                    className="hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-foreground">
                        {ent.userIdentifier}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {spellName}
                    </td>
                    <td className="px-4 py-4">
                      <Badge
                        variant="outline"
                        className={`${statusInfo.bgColor} ${statusInfo.color} border-transparent gap-1`}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground font-mono">
                      {formatDate(ent.grantedAt)}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground font-mono">
                      {ent.revokedAt ? formatDate(ent.revokedAt) : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="text-xs">
                        {getSourceLabel(ent.sourceEventId)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {ent.status === "active" && (
                            <DropdownMenuItem className="text-destructive" onClick={() => handleRevoke(ent)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("spell.entitlements.revoke")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setIsReconcileDialogOpen(true)}>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t("spell.entitlements.reconcile")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* API Example */}
      <div className="mt-6 rounded-lg border border-border bg-card p-4">
        <h3 className="font-medium text-foreground mb-3">API Check Example</h3>
        <div className="rounded border border-border bg-muted/30 p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-muted-foreground">
            {`POST /api/v1/spell/check\n\nRequest:\n{\n  "spell_id": "spell_...",\n  "runtime_id": "runtime_...",\n  "user_identifier": "user_...",\n  "requested_scope": "scope_key"\n}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
