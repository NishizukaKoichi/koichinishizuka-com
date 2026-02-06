"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertTriangle, Building2, Briefcase, FileText, MessageSquare } from "@/components/icons"
import { useAuth } from "@/lib/auth/context"

interface ScoutInitiatorInfo {
  organization?: string
  role?: string
  projectSummary?: string
}

interface EpochScoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetUser: {
    displayName: string
    userId: string
  }
  mode: "send" | "receive"
  initiatorInfo?: ScoutInitiatorInfo
  scoutId?: string
  onCompleted?: () => void
}

// 固定文言 - 仕様書より
const SCOUT_MESSAGE = "一回来て、仕事を一緒にやってみませんか？"

export function EpochScoutDialog({
  open,
  onOpenChange,
  targetUser,
  mode,
  initiatorInfo,
  scoutId,
  onCompleted,
}: EpochScoutDialogProps) {
  const { userId } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [step, setStep] = useState<"info" | "confirm" | "response">(mode === "send" ? "info" : "response")
  const [responseComment, setResponseComment] = useState("")
  const [accepted, setAccepted] = useState<boolean | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Sender info state
  const [senderInfo, setSenderInfo] = useState<ScoutInitiatorInfo>({
    organization: "",
    role: "",
    projectSummary: "",
  })

  const handleSend = async () => {
    if (!userId) {
      setError("ログインが必要です")
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/epoch/scouts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({
          targetUserId: targetUser.userId,
          initiatorOrgName: senderInfo.organization || null,
          initiatorRole: senderInfo.role || null,
          projectSummary: senderInfo.projectSummary || null,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "スカウト送信に失敗しました")
      }
      setIsComplete(true)
      onCompleted?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "スカウト送信に失敗しました"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResponse = async (accept: boolean) => {
    setAccepted(accept)
    if (!userId) {
      setError("ログインが必要です")
      return
    }
    if (!scoutId) {
      setError("スカウトIDが見つかりません")
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const endpoint = accept ? "accept" : "decline"
      const response = await fetch(`/api/epoch/scouts/${scoutId}/${endpoint}`, {
        method: "POST",
        headers: undefined,
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "スカウト応答に失敗しました")
      }
      setIsComplete(true)
      onCompleted?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : "スカウト応答に失敗しました"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAndClose = () => {
    setIsComplete(false)
    setStep(mode === "send" ? "info" : "response")
    setResponseComment("")
    setAccepted(null)
    setSenderInfo({ organization: "", role: "", projectSummary: "" })
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="bg-card border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {mode === "send" ? "スカウトを送信" : "スカウトを受信"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            スカウトはEpoch外部イベントです。送信・受信・承諾・拒否は双方のEpochに事実として記録されます。
          </DialogDescription>
        </DialogHeader>

        {!isComplete ? (
          <div className="space-y-4 pt-4">
            {/* 固定メッセージ表示 */}
            <div className="p-4 bg-secondary border border-border rounded-md">
              <p className="text-sm text-foreground text-center leading-relaxed">
                「{SCOUT_MESSAGE}」
              </p>
            </div>

            {mode === "send" && step === "info" && (
              <>
                <p className="text-xs text-muted-foreground">送信先: {targetUser.displayName}</p>

                <div className="space-y-4 p-4 bg-muted/30 border border-border rounded-md">
                  <p className="text-xs text-muted-foreground mb-3">
                    以下の情報は相手に表示されます（任意）
                  </p>

                  <div className="space-y-2">
                    <Label htmlFor="organization" className="text-foreground flex items-center gap-2">
                      <Building2 className="h-3.5 w-3.5" />
                      組織名
                    </Label>
                    <Input
                      id="organization"
                      value={senderInfo.organization}
                      onChange={(e) =>
                        setSenderInfo((prev) => ({ ...prev, organization: e.target.value }))
                      }
                      placeholder="株式会社〇〇"
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-foreground flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5" />
                      役職
                    </Label>
                    <Input
                      id="role"
                      value={senderInfo.role}
                      onChange={(e) =>
                        setSenderInfo((prev) => ({ ...prev, role: e.target.value }))
                      }
                      placeholder="エンジニアリングマネージャー"
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="projectSummary" className="text-foreground flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5" />
                      プロジェクト概要
                    </Label>
                    <Textarea
                      id="projectSummary"
                      value={senderInfo.projectSummary}
                      onChange={(e) =>
                        setSenderInfo((prev) => ({ ...prev, projectSummary: e.target.value }))
                      }
                      placeholder="新規プロダクト開発チームのテックリード募集"
                      className="bg-secondary border-border text-foreground resize-none"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-background border border-border rounded-md">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    メッセージ本文は固定文言のみです。詳細は承諾後のチャットで擦り合わせできます。
                  </p>
                </div>

                <Button
                  onClick={() => setStep("confirm")}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  確認へ進む
                </Button>
              </>
            )}

            {mode === "send" && step === "confirm" && (
              <>
                <p className="text-xs text-muted-foreground">送信先: {targetUser.displayName}</p>

                {(senderInfo.organization || senderInfo.role || senderInfo.projectSummary) && (
                  <div className="p-3 bg-muted/30 border border-border rounded-md space-y-2 text-sm">
                    {senderInfo.organization && (
                      <div className="flex items-center gap-2">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">{senderInfo.organization}</span>
                      </div>
                    )}
                    {senderInfo.role && (
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-foreground">{senderInfo.role}</span>
                      </div>
                    )}
                    {senderInfo.projectSummary && (
                      <div className="flex items-start gap-2">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                        <span className="text-foreground">{senderInfo.projectSummary}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setStep("info")}
                    variant="outline"
                    className="flex-1 border-border text-foreground bg-transparent"
                  >
                    戻る
                  </Button>
                  <Button
                    onClick={handleSend}
                    disabled={isSubmitting}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isSubmitting ? "送信中..." : "スカウトを送信"}
                  </Button>
                </div>
              </>
            )}

            {mode === "receive" && step === "response" && (
              <>
                <p className="text-xs text-muted-foreground">送信者: {targetUser.displayName}</p>

                {initiatorInfo &&
                  (initiatorInfo.organization ||
                    initiatorInfo.role ||
                    initiatorInfo.projectSummary) && (
                    <div className="p-3 bg-muted/30 border border-border rounded-md space-y-2 text-sm">
                      <p className="text-xs text-muted-foreground mb-2">送信者情報</p>
                      {initiatorInfo.organization && (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-foreground">{initiatorInfo.organization}</span>
                        </div>
                      )}
                      {initiatorInfo.role && (
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-foreground">{initiatorInfo.role}</span>
                        </div>
                      )}
                      {initiatorInfo.projectSummary && (
                        <div className="flex items-start gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground mt-0.5" />
                          <span className="text-foreground">{initiatorInfo.projectSummary}</span>
                        </div>
                      )}
                    </div>
                  )}

                <div className="space-y-2">
                  <Label htmlFor="response-comment" className="text-foreground flex items-center gap-2">
                    <MessageSquare className="h-3.5 w-3.5" />
                    コメント（任意）
                  </Label>
                  <Textarea
                    id="response-comment"
                    value={responseComment}
                    onChange={(e) => setResponseComment(e.target.value)}
                    placeholder="承諾/辞退に一言添えることができます"
                    className="bg-secondary border-border text-foreground resize-none"
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    コメントは送信者に表示されますが、Epochには記録されません。
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => handleResponse(false)}
                    disabled={isSubmitting}
                    variant="outline"
                    className="flex-1 border-border text-foreground bg-transparent"
                  >
                    辞退する
                  </Button>
                  <Button
                    onClick={() => handleResponse(true)}
                    disabled={isSubmitting}
                    className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    承諾する
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  承諾すると、詳細を擦り合わせるチャットが開始されます。
                </p>
              </>
            )}
            {error && (
              <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4 pt-4 text-center">
            <div className="py-4">
              <p className="text-sm text-foreground">
                {mode === "send"
                  ? "スカウトを送信しました"
                  : accepted
                    ? "承諾しました"
                    : "辞退しました"}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                この事実は双方のEpochに記録されます。
              </p>
              {mode === "receive" && accepted && (
                <p className="text-xs text-muted-foreground mt-2">
                  チャットで詳細を擦り合わせできます。
                </p>
              )}
            </div>
            <Button
              onClick={resetAndClose}
              variant="outline"
              className="border-border text-foreground bg-transparent"
            >
              閉じる
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
