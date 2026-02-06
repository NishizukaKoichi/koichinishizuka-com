"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, ArrowLeft, CheckCircle2, XCircle, Building2, Briefcase, User } from "@/components/icons"
import Link from "next/link"
import { useAuth } from "@/lib/auth/context"

interface Message {
  id: string
  senderId: string
  senderName: string
  content: string
  timestamp: string
  isSystem?: boolean
}

interface ScoutConversation {
  id: string
  status: "pending" | "accepted" | "declined" | "in_discussion" | "completed" | "withdrawn"
  initiatorId: string
  initiatorName: string
  initiatorInfo: {
    organization?: string
    role?: string
    projectSummary?: string
  }
  targetId: string
  targetName: string
  messages: Message[]
  createdAt: string
  acceptedAt?: string
  completedAt?: string
}

interface EpochScoutConversationProps {
  conversationId: string
  isInitiator?: boolean
}

export function EpochScoutConversation({ conversationId, isInitiator = false }: EpochScoutConversationProps) {
  const { userId } = useAuth()
  const [conversation, setConversation] = useState<ScoutConversation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [conversation?.messages])

  useEffect(() => {
    if (!userId) {
      return
    }
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/epoch/scouts/${conversationId}`, {
          headers: undefined,
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || "スカウト会話の取得に失敗しました")
        }
        const data = (await response.json()) as { conversation: ScoutConversation }
        setConversation(data.conversation)
      } catch (err) {
        const message = err instanceof Error ? err.message : "スカウト会話の取得に失敗しました"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [conversationId, userId])

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return
    if (!userId) {
      setError("ログインが必要です")
      return
    }
    if (!conversation) {
      return
    }
    setIsSending(true)
    setError(null)
    try {
      const response = await fetch(`/api/epoch/scouts/${conversation.id}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({ content: newMessage.trim() }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "メッセージ送信に失敗しました")
      }
      const data = (await response.json()) as { conversation: ScoutConversation }
      setConversation(data.conversation)
      setNewMessage("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "メッセージ送信に失敗しました"
      setError(message)
    } finally {
      setIsSending(false)
    }
  }

  const handleComplete = async () => {
    if (!userId || !conversation) {
      setError("ログインが必要です")
      return
    }
    try {
      const response = await fetch(`/api/epoch/scouts/${conversation.id}/complete`, {
        method: "POST",
        headers: undefined,
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "完了処理に失敗しました")
      }
      const data = (await response.json()) as { conversation: ScoutConversation }
      setConversation(data.conversation)
    } catch (err) {
      const message = err instanceof Error ? err.message : "完了処理に失敗しました"
      setError(message)
    }
  }

  const handleWithdraw = async () => {
    if (!userId || !conversation) {
      setError("ログインが必要です")
      return
    }
    try {
      const response = await fetch(`/api/epoch/scouts/${conversation.id}/withdraw`, {
        method: "POST",
        headers: undefined,
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "取り下げに失敗しました")
      }
      const data = (await response.json()) as { conversation: ScoutConversation }
      setConversation(data.conversation)
    } catch (err) {
      const message = err instanceof Error ? err.message : "取り下げに失敗しました"
      setError(message)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: ScoutConversation["status"]) => {
    const statusConfig = {
      pending: { label: "承諾待ち", className: "border-amber-500/30 text-amber-400" },
      accepted: { label: "承諾済み", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      declined: { label: "辞退", className: "border-border text-muted-foreground" },
      in_discussion: { label: "擦り合わせ中", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      completed: { label: "完了", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      withdrawn: { label: "取り下げ", className: "border-border text-muted-foreground" },
    }
    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  const isConversationActive = conversation && ["accepted", "in_discussion"].includes(conversation.status)

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">読み込み中...</div>
  }

  if (error) {
    return <div className="py-12 text-center text-destructive">{error}</div>
  }

  if (!conversation) {
    return <div className="py-12 text-center text-muted-foreground">会話が見つかりません</div>
  }

  const isInitiatorView = isInitiator || (userId ? conversation.initiatorId === userId : false)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/epoch/scout">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            戻る
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-foreground">
            {isInitiatorView ? conversation.targetName : conversation.initiatorName}
          </h1>
          <p className="text-sm text-muted-foreground">スカウト会話</p>
        </div>
        {getStatusBadge(conversation.status)}
      </div>

      {/* Initiator Info Card */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-normal text-muted-foreground">
            {isInitiatorView ? "あなたの情報" : "スカウト送信者情報"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversation.initiatorInfo.organization && (
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{conversation.initiatorInfo.organization}</span>
            </div>
          )}
          {conversation.initiatorInfo.role && (
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{conversation.initiatorInfo.role}</span>
            </div>
          )}
          {conversation.initiatorInfo.projectSummary && (
            <div className="flex items-start gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <span className="text-foreground">{conversation.initiatorInfo.projectSummary}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {conversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.senderId === userId ? "justify-end" : "justify-start"}`}
                >
                  {message.isSystem ? (
                    <div className="w-full text-center py-2">
                      <span className="text-xs text-muted-foreground bg-secondary px-3 py-1 rounded-full">
                        {message.content}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.senderId === userId
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-foreground"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p
                      className={`text-xs mt-1 ${
                        message.senderId === userId ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                      >
                        {formatDate(message.timestamp)}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input Area */}
          {isConversationActive && (
            <div className="border-t border-border p-4">
              <div className="flex gap-2">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="メッセージを入力..."
                  className="bg-secondary border-border text-foreground resize-none min-h-[80px]"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {isConversationActive && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleWithdraw}
            className="flex-1 border-border text-muted-foreground hover:text-foreground bg-transparent"
          >
            <XCircle className="h-4 w-4 mr-2" />
            取り下げる
          </Button>
          <Button onClick={handleComplete} className="flex-1 bg-green-600 text-white hover:bg-green-700">
            <CheckCircle2 className="h-4 w-4 mr-2" />
            完了にする
          </Button>
        </div>
      )}

      {/* Status Messages */}
      {conversation.status === "completed" && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
          <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
          <p className="text-sm text-green-400">この会話は完了しました</p>
          <p className="text-xs text-muted-foreground mt-1">
            完了日時: {formatDate(conversation.completedAt || "")}
          </p>
        </div>
      )}

      {conversation.status === "withdrawn" && (
        <div className="p-4 bg-secondary border border-border rounded-lg text-center">
          <XCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">この会話は取り下げられました</p>
        </div>
      )}

      <div className="p-4 border border-dashed border-border rounded-lg text-xs text-muted-foreground">
        <p>この会話の内容はEpochには記録されません。</p>
        <p className="mt-1">記録されるのは: スカウト送信、承諾/辞退、完了/取り下げの事実のみです。</p>
      </div>
    </div>
  )
}
