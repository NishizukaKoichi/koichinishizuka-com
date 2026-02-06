"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, User } from "@/components/icons"
import { useAuth } from "@/lib/auth/context"

interface AuditEntry {
  id: string
  action: string
  timestamp: string
  details?: string
  actor: "user" | "operator"
  operatorId?: string
  operatorReason?: string
}

export function EpochAuditLog() {
  const [filter, setFilter] = useState<"all" | "user" | "operator">("all")
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { userId } = useAuth()

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      record_created: "Record作成",
      visibility_changed: "可視性変更",
      auth_login: "ログイン",
      auth_logout: "ログアウト",
      auth_recovered: "アカウント復旧",
      billing_session_started: "課金セッション開始",
      billing_session_ended: "課金セッション終了",
      epoch_viewed: "Epoch閲覧",
      attachment_added: "添付追加",
      profile_updated: "プロフィール更新",
      operator_data_export: "運営: データ開示",
      operator_account_review: "運営: アカウント監査",
      operator_system_maintenance: "運営: システム保守",
    }
    return labels[action] || action
  }

  useEffect(() => {
    if (!userId) {
      setEntries([])
      return
    }
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/epoch/audit?filter=${filter}`, {
          headers: undefined,
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || "監査ログの取得に失敗しました")
        }
        const data = (await response.json()) as { logs: AuditEntry[] }
        setEntries(data.logs ?? [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "監査ログの取得に失敗しました"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [filter, userId])

  const renderEntry = (entry: AuditEntry) => (
    <div
      key={entry.id}
      className={`flex items-start gap-4 py-3 border-b border-border last:border-0 ${
        entry.actor === "operator" ? "bg-secondary/30" : ""
      }`}
    >
      <span className="text-xs font-mono text-muted-foreground shrink-0 w-32">
        {formatTimestamp(entry.timestamp)}
      </span>
      <div className="flex items-center gap-2 shrink-0">
        {entry.actor === "operator" ? (
          <Shield className="h-3.5 w-3.5 text-muted-foreground" />
        ) : (
          <User className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-foreground">{getActionLabel(entry.action)}</span>
        {entry.details && (
          <span className="text-xs text-muted-foreground ml-2 font-mono">{entry.details}</span>
        )}
        {entry.actor === "operator" && entry.operatorReason && (
          <div className="mt-1 text-xs text-muted-foreground">
            <span className="font-mono">理由: {entry.operatorReason}</span>
            {entry.operatorId && (
              <span className="ml-2 font-mono">操作者: {entry.operatorId}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">監査ログ</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="mb-4">
          <TabsList className="bg-secondary">
            <TabsTrigger value="all" className="text-xs">すべて</TabsTrigger>
            <TabsTrigger value="user" className="text-xs">
              <User className="h-3 w-3 mr-1" />
              ユーザー操作
            </TabsTrigger>
            <TabsTrigger value="operator" className="text-xs">
              <Shield className="h-3 w-3 mr-1" />
              運営者操作
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <ScrollArea className="h-96">
          <div className="space-y-1">
            {isLoading && <div className="text-xs text-muted-foreground">読み込み中...</div>}
            {error && (
              <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
            {entries.map(renderEntry)}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t border-border text-xs text-muted-foreground space-y-1">
          <p>すべての操作は監査ログに記録されます。</p>
          <p>運営者の操作も同一形式で記録され、理由と操作者IDが付与されます。</p>
          <p className="flex items-center gap-2">
            <Shield className="h-3 w-3" />
            <span>運営者の操作は背景色で区別されます。</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
