"use client"

import { useState } from "react"
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

type Entitlement = {
  id: string
  user_id: string
  product_id: string
  product_name: string
  granted_at: string
  expires_at: string | null
  source: "webhook" | "manual" | "reconcile"
  status: "active" | "expired" | "revoked"
}

const mockEntitlements: Entitlement[] = [
  {
    id: "ent_001",
    user_id: "user_abc123",
    product_id: "prod_001",
    product_name: "Pro Plan",
    granted_at: "2026-01-01T00:00:00Z",
    expires_at: "2026-02-01T00:00:00Z",
    source: "webhook",
    status: "active",
  },
  {
    id: "ent_002",
    user_id: "user_def456",
    product_id: "prod_001",
    product_name: "Pro Plan",
    granted_at: "2025-12-15T00:00:00Z",
    expires_at: "2026-01-15T00:00:00Z",
    source: "webhook",
    status: "active",
  },
  {
    id: "ent_003",
    user_id: "user_ghi789",
    product_id: "prod_003",
    product_name: "CLI Tool Lifetime",
    granted_at: "2025-11-20T00:00:00Z",
    expires_at: null,
    source: "webhook",
    status: "active",
  },
  {
    id: "ent_004",
    user_id: "user_jkl012",
    product_id: "prod_002",
    product_name: "Starter Plan",
    granted_at: "2025-10-01T00:00:00Z",
    expires_at: "2025-11-01T00:00:00Z",
    source: "manual",
    status: "expired",
  },
  {
    id: "ent_005",
    user_id: "user_mno345",
    product_id: "prod_001",
    product_name: "Pro Plan",
    granted_at: "2025-09-01T00:00:00Z",
    expires_at: "2025-10-01T00:00:00Z",
    source: "webhook",
    status: "revoked",
  },
]

const mockProducts = [
  { id: "prod_001", name: "Pro Plan" },
  { id: "prod_002", name: "Starter Plan" },
  { id: "prod_003", name: "CLI Tool Lifetime" },
]

export function MagicSpellEntitlements() {
  const { t } = useI18n()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isGrantDialogOpen, setIsGrantDialogOpen] = useState(false)
  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = useState(false)

  const filteredEntitlements = mockEntitlements.filter((ent) => {
    const matchesSearch =
      ent.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ent.product_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus =
      statusFilter === "all" || ent.status === statusFilter
    return matchesSearch && matchesStatus
  })

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
          color: "text-magicspell-primary",
          bgColor: "bg-magicspell-primary/10",
        }
      case "expired":
        return {
          label: "期限切れ",
          icon: Clock,
          color: "text-muted-foreground",
          bgColor: "bg-muted",
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

  const getSourceLabel = (source: string) => {
    switch (source) {
      case "webhook":
        return "Webhook"
      case "manual":
        return "手動"
      case "reconcile":
        return "Reconcile"
      default:
        return source
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-1">
            {t("magicspell.entitlements.title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("magicspell.entitlements.desc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isReconcileDialogOpen} onOpenChange={setIsReconcileDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                {t("magicspell.entitlements.reconcile")}
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
                    <li>期限切れのEntitlementを自動更新</li>
                    <li>不整合があれば修正</li>
                    <li>すべての変更は監査ログに記録</li>
                  </ul>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsReconcileDialogOpen(false)} className="bg-transparent">
                  キャンセル
                </Button>
                <Button onClick={() => setIsReconcileDialogOpen(false)}>
                  Reconcileを実行
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isGrantDialogOpen} onOpenChange={setIsGrantDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {t("magicspell.entitlements.grant")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("magicspell.entitlements.grant")}</DialogTitle>
                <DialogDescription>
                  ユーザーに手動で権利を付与します。この操作は監査ログに記録されます。
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>{t("magicspell.entitlements.user_id")}</Label>
                  <Input placeholder="user_..." className="font-mono" />
                </div>
                <div className="space-y-2">
                  <Label>{t("magicspell.entitlements.product")}</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="商品を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockProducts.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("magicspell.entitlements.expires_at")}（任意）</Label>
                  <Input type="datetime-local" />
                  <p className="text-xs text-muted-foreground">
                    空の場合は無期限
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsGrantDialogOpen(false)} className="bg-transparent">
                  キャンセル
                </Button>
                <Button onClick={() => setIsGrantDialogOpen(false)}>
                  権利を付与
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("magicspell.entitlements.search")}
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
            <SelectItem value="expired">期限切れ</SelectItem>
            <SelectItem value="revoked">剥奪済み</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Entitlements Table */}
      {filteredEntitlements.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            {t("magicspell.entitlements.empty")}
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
                  {t("magicspell.entitlements.user_id")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("magicspell.entitlements.product")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("magicspell.products.status")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("magicspell.entitlements.granted_at")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("magicspell.entitlements.expires_at")}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  {t("magicspell.entitlements.source")}
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
                return (
                  <tr
                    key={ent.id}
                    className="hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <code className="rounded bg-muted px-2 py-1 text-xs font-mono text-foreground">
                        {ent.user_id}
                      </code>
                    </td>
                    <td className="px-4 py-4 text-foreground">
                      {ent.product_name}
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
                      {formatDate(ent.granted_at)}
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground font-mono">
                      {ent.expires_at ? formatDate(ent.expires_at) : "無期限"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="outline" className="text-xs">
                        {getSourceLabel(ent.source)}
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
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              {t("magicspell.entitlements.revoke")}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            {t("magicspell.entitlements.reconcile")}
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
            {`GET /v1/entitlements/check?user_id=user_abc123&product_id=prod_001

Response:
{
  "entitled": true,
  "product_id": "prod_001",
  "expires_at": "2026-02-01T00:00:00Z"
}`}
          </pre>
        </div>
      </div>
    </div>
  )
}
