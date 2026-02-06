"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { EpochHeader } from "@/components/epoch-header"
import { EpochFooter } from "@/components/epoch-footer"
import { ArrowLeft, Building2, Shield, Trash2, AlertTriangle } from "@/components/icons"
import { useAuth } from "@/lib/auth/context"

interface EpochOrgSettingsProps {
  orgId: string
}

type OrgDetail = {
  id: string
  name: string
  slug: string
  createdAt: string
  settings: {
    allowMemberEpochAccess: boolean
    requireApprovalForJoin: boolean
  }
}

export function EpochOrgSettings({ orgId }: EpochOrgSettingsProps) {
  const { userId } = useAuth()
  const [orgName, setOrgName] = useState("")
  const [orgSlug, setOrgSlug] = useState("")
  const [allowMemberAccess, setAllowMemberAccess] = useState(false)
  const [requireApproval, setRequireApproval] = useState(true)
  const [createdAt, setCreatedAt] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    const load = async () => {
      setError(null)
      try {
        const response = await fetch(`/api/epoch/orgs/${orgId}`, {
          headers: undefined,
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || "組織情報の取得に失敗しました")
        }
        const data = (await response.json()) as { org: OrgDetail }
        if (!data.org) return
        setOrgName(data.org.name)
        setOrgSlug(data.org.slug)
        setAllowMemberAccess(data.org.settings.allowMemberEpochAccess)
        setRequireApproval(data.org.settings.requireApprovalForJoin)
        setCreatedAt(data.org.createdAt)
      } catch (err) {
        const message = err instanceof Error ? err.message : "組織情報の取得に失敗しました"
        setError(message)
      }
    }
    load()
  }, [orgId, userId])

  const handleSave = async () => {
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    setIsSaving(true)
    setError(null)
    try {
      const response = await fetch(`/api/epoch/orgs/${orgId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({
          name: orgName,
          slug: orgSlug,
          allowMemberEpochAccess: allowMemberAccess,
          requireApprovalForJoin: requireApproval,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "組織設定の更新に失敗しました")
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "組織設定の更新に失敗しました"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteOrg = async () => {
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    setIsDeleting(true)
    setError(null)
    try {
      const response = await fetch(`/api/epoch/orgs/${orgId}`, {
        method: "DELETE",
        headers: undefined,
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "組織の削除に失敗しました")
      }
      window.location.href = "/epoch/org"
    } catch (err) {
      const message = err instanceof Error ? err.message : "組織の削除に失敗しました"
      setError(message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EpochHeader />

      <main className="flex-1 container max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/epoch/org/${orgId}`}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            組織ダッシュボードに戻る
          </Link>
        </div>

        <h1 className="text-xl font-semibold text-foreground mb-6">組織設定</h1>

        {error && (
          <div className="mb-4 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                基本情報
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org-name" className="text-foreground">組織名</Label>
                <Input
                  id="org-name"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="bg-secondary border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-slug" className="text-foreground">スラッグ（URL用）</Label>
                <Input
                  id="org-slug"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  className="bg-secondary border-border text-foreground font-mono"
                />
                <p className="text-xs text-muted-foreground">
                  URL: epoch.app/org/{orgSlug}
                </p>
              </div>

              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  作成日: {createdAt ? new Date(createdAt).toLocaleDateString("ja-JP") : "不明"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base text-foreground flex items-center gap-2">
                <Shield className="h-4 w-4" />
                アクセス設定
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                組織内でのEpoch閲覧権限を設定します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="member-access" className="text-foreground">
                    メンバー間のEpoch閲覧
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    有効にすると、組織メンバーは互いのEpochを閲覧できます（課金不要）
                  </p>
                </div>
                <Switch
                  id="member-access"
                  checked={allowMemberAccess}
                  onCheckedChange={setAllowMemberAccess}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="require-approval" className="text-foreground">
                    参加承認制
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    有効にすると、招待を受けたユーザーの参加に管理者の承認が必要になります
                  </p>
                </div>
                <Switch
                  id="require-approval"
                  checked={requireApproval}
                  onCheckedChange={setRequireApproval}
                />
              </div>

              <div className="p-3 bg-secondary/50 border border-border rounded-md">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  注意: 組織設定を変更しても、過去のRecordには影響しません。
                  すべてのRecordは不可逆であり、設定変更によって削除・編集されることはありません。
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={!orgName || !orgSlug || isSaving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSaving ? "保存中..." : "変更を保存"}
            </Button>
          </div>

          <Card className="bg-card border-destructive/50">
            <CardHeader>
              <CardTitle className="text-base text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                危険な操作
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-sm text-foreground">組織を削除</p>
                  <p className="text-xs text-muted-foreground">
                    組織を削除すると、メンバーの組織への所属は解除されます。
                    ただし、各メンバーのEpochは削除されません。
                  </p>
                </div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="h-4 w-4 mr-2" />
                      削除
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-card border-border">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">
                        組織を削除しますか？
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-muted-foreground">
                        この操作は取り消せません。組織「{orgName}」を削除すると：
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>すべてのメンバーの組織への所属が解除されます</li>
                          <li>部門構造が削除されます</li>
                          <li>組織内の閲覧権限が無効になります</li>
                        </ul>
                        <p className="mt-2">
                          なお、個々のEpoch Recordは削除されません。
                        </p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>キャンセル</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteOrg} disabled={isDeleting}>
                        {isDeleting ? "削除中..." : "削除する"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <EpochFooter />
    </div>
  )
}
