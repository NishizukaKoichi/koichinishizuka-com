"use client"

import { useCallback, useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EpochScoutDialog } from "./epoch-scout-dialog"
import { Send, Inbox, CheckCircle2, MessageSquare, Building2, Briefcase } from "@/components/icons"
import Link from "next/link"
import { useAuth } from "@/lib/auth/context"

interface ScoutInitiatorInfo {
  organization?: string
  role?: string
  projectSummary?: string
}

interface ScoutMessage {
  id: string
  fromUserId?: string
  fromDisplayName?: string
  toUserId?: string
  toDisplayName?: string
  status: "pending" | "accepted" | "declined" | "in_discussion" | "completed" | "withdrawn"
  sentAt: string
  respondedAt?: string
  initiatorInfo?: ScoutInitiatorInfo
  hasConversation?: boolean
}

export function EpochScoutInbox() {
  const { userId } = useAuth()
  const [showDialog, setShowDialog] = useState(false)
  const [dialogMode, setDialogMode] = useState<"send" | "receive">("send")
  const [selectedUser, setSelectedUser] = useState<{ displayName: string; userId: string } | null>(null)
  const [selectedScoutId, setSelectedScoutId] = useState<string | null>(null)
  const [received, setReceived] = useState<ScoutMessage[]>([])
  const [sent, setSent] = useState<ScoutMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadScouts = useCallback(async () => {
    if (!userId) {
      setReceived([])
      setSent([])
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/epoch/scouts", {
        headers: undefined,
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "スカウトの取得に失敗しました")
      }
      const data = (await response.json()) as { received: ScoutMessage[]; sent: ScoutMessage[] }
      setReceived(data.received ?? [])
      setSent(data.sent ?? [])
    } catch (err) {
      const message = err instanceof Error ? err.message : "スカウトの取得に失敗しました"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadScouts()
  }, [loadScouts])

  const handleOpenSendDialog = () => {
    setDialogMode("send")
    setSelectedUser({ displayName: "", userId: "" })
    setSelectedScoutId(null)
    setShowDialog(true)
  }

  const handleOpenReceiveDialog = (scout: ScoutMessage) => {
    setDialogMode("receive")
    setSelectedScoutId(scout.id)
    setSelectedUser({
      displayName: scout.fromDisplayName || scout.fromUserId || "Unknown",
      userId: scout.fromUserId || "",
    })
    setShowDialog(true)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: ScoutMessage["status"]) => {
    const statusConfig: Record<
      ScoutMessage["status"],
      { label: string; className: string }
    > = {
      pending: { label: "未応答", className: "border-amber-500/30 text-amber-400" },
      accepted: {
        label: "承諾",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
      },
      declined: { label: "辞退", className: "border-border text-muted-foreground" },
      in_discussion: {
        label: "擦り合わせ中",
        className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      },
      completed: {
        label: "完了",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
      },
      withdrawn: { label: "取り下げ", className: "border-border text-muted-foreground" },
    }
    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const ScoutCard = ({ scout, type }: { scout: ScoutMessage; type: "received" | "sent" }) => (
    <div className="p-4 border border-border rounded-lg bg-muted/20">
      <div className="flex items-start justify-between mb-3">
        <div className="font-mono text-xs text-muted-foreground">
          {type === "received"
            ? `from: ${scout.fromDisplayName || scout.fromUserId}`
            : `to: ${scout.toDisplayName || scout.toUserId}`}
        </div>
        {getStatusBadge(scout.status)}
      </div>

      {/* Initiator Info */}
      {type === "received" && scout.initiatorInfo && (
        <div className="mb-3 p-2 bg-muted/30 border border-border rounded text-xs space-y-1">
          {scout.initiatorInfo.organization && (
            <div className="flex items-center gap-2 text-foreground">
              <Building2 className="h-3 w-3 text-muted-foreground" />
              {scout.initiatorInfo.organization}
            </div>
          )}
          {scout.initiatorInfo.role && (
            <div className="flex items-center gap-2 text-foreground">
              <Briefcase className="h-3 w-3 text-muted-foreground" />
              {scout.initiatorInfo.role}
            </div>
          )}
          {scout.initiatorInfo.projectSummary && (
            <p className="text-muted-foreground mt-1">{scout.initiatorInfo.projectSummary}</p>
          )}
        </div>
      )}

      <div className="p-3 border border-border rounded bg-card mb-3">
        <p className="text-sm text-foreground">「一回来て、仕事を一緒にやってみませんか？」</p>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>送信: {formatDate(scout.sentAt)}</span>
        {scout.respondedAt && <span>応答: {formatDate(scout.respondedAt)}</span>}
      </div>

      {/* Action buttons */}
      <div className="mt-4 flex gap-2">
        {type === "received" && scout.status === "pending" && (
          <Button
            size="sm"
            className="flex-1 bg-foreground text-background hover:bg-foreground/90"
            onClick={() => handleOpenReceiveDialog(scout)}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            応答する
          </Button>
        )}

        {scout.hasConversation && ["accepted", "in_discussion", "completed"].includes(scout.status) && (
          <Link href={`/epoch/scout/${scout.id}`} className="flex-1">
            <Button
              size="sm"
              variant={scout.status === "in_discussion" ? "default" : "outline"}
              className={`w-full ${
                scout.status === "in_discussion"
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "border-border text-foreground bg-transparent"
              }`}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              {scout.status === "in_discussion" ? "会話を続ける" : "会話を見る"}
            </Button>
          </Link>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">スカウト</h1>
        <Button onClick={handleOpenSendDialog} className="bg-foreground text-background hover:bg-foreground/90">
          <Send className="h-4 w-4 mr-2" />
          スカウトを送る
        </Button>
      </div>

      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">固定文言</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">「一回来て、仕事を一緒にやってみませんか？」</p>
          <p className="text-xs text-muted-foreground mt-2">
            スカウトではこの文言のみ送信可能です。自由記述は禁止されています。
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="received" className="space-y-4">
        <TabsList className="bg-muted border border-border">
          <TabsTrigger value="received" className="data-[state=active]:bg-background gap-2">
            <Inbox className="h-4 w-4" />
            受信 ({received.length})
          </TabsTrigger>
          <TabsTrigger value="sent" className="data-[state=active]:bg-background gap-2">
            <Send className="h-4 w-4" />
            送信 ({sent.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="received" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : received.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">受信したスカウトはありません</div>
          ) : (
            received.map((scout) => <ScoutCard key={scout.id} scout={scout} type="received" />)
          )}
        </TabsContent>

        <TabsContent value="sent" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12 text-muted-foreground">読み込み中...</div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">{error}</div>
          ) : sent.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">送信したスカウトはありません</div>
          ) : (
            sent.map((scout) => <ScoutCard key={scout.id} scout={scout} type="sent" />)
          )}
        </TabsContent>
      </Tabs>

      <div className="p-4 border border-dashed border-border rounded-lg text-sm text-muted-foreground">
        <p>送信、受信、承諾、辞退はすべて双方のEpochに事実として記録されます。</p>
        <p className="mt-1">スカウトはEpoch外部イベントとして扱われます。</p>
      </div>

      {selectedUser && (
        <EpochScoutDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          targetUser={selectedUser}
          mode={dialogMode}
          scoutId={selectedScoutId ?? undefined}
          initiatorInfo={
            dialogMode === "receive"
              ? received.find((scout) => scout.id === selectedScoutId)?.initiatorInfo
              : undefined
          }
          onCompleted={loadScouts}
        />
      )}
    </div>
  )
}
