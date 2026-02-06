"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar } from "@/components/icons"
import { useAuth } from "@/lib/auth/context"

interface BillingSession {
  id: string
  type: "time_window" | "read_session"
  targetUser: string
  startedAt: string
  endedAt?: string
  status: "active" | "expired" | "completed"
  amount: number
}

export function EpochBillingHistory() {
  const { userId } = useAuth()
  const [sessions, setSessions] = useState<BillingSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/epoch/billing/history", {
          headers: undefined,
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || "課金履歴の取得に失敗しました")
        }
        const data = (await response.json()) as { sessions: BillingSession[] }
        setSessions(data.sessions ?? [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "課金履歴の取得に失敗しました"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: BillingSession["status"]) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">有効</Badge>
      case "expired":
        return (
          <Badge variant="outline" className="border-border text-muted-foreground">
            期限切れ
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="border-border text-muted-foreground">
            完了
          </Badge>
        )
    }
  }

  const getTypeLabel = (type: BillingSession["type"]) => {
    return type === "time_window" ? "Time Window" : "Read Session"
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-lg text-foreground">課金履歴</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">課金履歴はまだありません。</p>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="p-4 border border-border rounded-lg bg-muted/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {session.type === "time_window" ? (
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium text-foreground">{getTypeLabel(session.type)}</span>
                  </div>
                  {getStatusBadge(session.status)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">対象ユーザー</span>
                    <span className="font-mono text-xs text-foreground">{session.targetUser}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">開始</span>
                    <span className="text-foreground">{formatDate(session.startedAt)}</span>
                  </div>
                  {session.endedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">終了</span>
                      <span className="text-foreground">{formatDate(session.endedAt)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border">
                    <span className="text-muted-foreground">金額</span>
                    <span className="text-foreground font-medium">¥{session.amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 border border-dashed border-border rounded-lg text-center text-sm text-muted-foreground">
          <p>課金は「他人のEpochを判断材料として読む行為」にのみ発生します</p>
          <p className="mt-1">Record単体課金・評価連動課金は存在しません</p>
        </div>
      </CardContent>
    </Card>
  )
}
