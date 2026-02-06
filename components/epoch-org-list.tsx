"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EpochHeader } from "@/components/epoch-header"
import { EpochFooter } from "@/components/epoch-footer"
import { Building2, Plus, Users, ChevronRight } from "@/components/icons"
import { useAuth } from "@/lib/auth/context"
import type { OrganizationMember } from "@/lib/types/organization"

type UserOrg = {
  id: string
  name: string
  slug: string
  role: OrganizationMember["role"] | null
  memberCount: number
}

const ROLE_LABELS = {
  owner: "オーナー",
  admin: "管理者",
  manager: "マネージャー",
  member: "メンバー",
}

export function EpochOrgList() {
  const { userId } = useAuth()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newOrgName, setNewOrgName] = useState("")
  const [newOrgSlug, setNewOrgSlug] = useState("")
  const [orgs, setOrgs] = useState<UserOrg[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/epoch/orgs/mine", {
          headers: undefined,
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || "組織情報の取得に失敗しました")
        }
        const data = (await response.json()) as { orgs: UserOrg[] }
        setOrgs(data.orgs ?? [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "組織情報の取得に失敗しました"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  const handleCreateOrg = async () => {
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    setIsCreating(true)
    setError(null)
    try {
      const response = await fetch("/api/epoch/orgs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({ name: newOrgName, slug: newOrgSlug }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "組織の作成に失敗しました")
      }
      const data = (await response.json()) as { org: UserOrg }
      if (data.org) {
        setOrgs((prev) => [data.org, ...prev])
      }
      setCreateDialogOpen(false)
      setNewOrgName("")
      setNewOrgSlug("")
    } catch (err) {
      const message = err instanceof Error ? err.message : "組織の作成に失敗しました"
      setError(message)
    } finally {
      setIsCreating(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EpochHeader />

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-semibold text-foreground">組織</h1>
            <p className="text-sm text-muted-foreground mt-1">
              所属する組織の管理と新規作成
            </p>
          </div>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                組織を作成
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">新しい組織を作成</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  組織を作成すると、メンバーを招待し、部門構造を定義できます。
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name" className="text-foreground">組織名</Label>
                  <Input
                    id="org-name"
                    placeholder="株式会社サンプル"
                    value={newOrgName}
                    onChange={(e) => {
                      setNewOrgName(e.target.value)
                      setNewOrgSlug(generateSlug(e.target.value))
                    }}
                    className="bg-secondary border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-slug" className="text-foreground">
                    スラッグ（URL用）
                  </Label>
                  <Input
                    id="org-slug"
                    placeholder="sample-corp"
                    value={newOrgSlug}
                    onChange={(e) => setNewOrgSlug(e.target.value)}
                    className="bg-secondary border-border text-foreground font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    URL: epoch.app/org/{newOrgSlug || "..."}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  className="border-border bg-transparent"
                >
                  キャンセル
                </Button>
                <Button
                  onClick={handleCreateOrg}
                  disabled={!newOrgName || !newOrgSlug || isCreating}
                  className="bg-primary text-primary-foreground"
                >
                  {isCreating ? "作成中..." : "作成"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="mb-4 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        ) : orgs.length === 0 ? (
          <Card className="bg-card border-border">
            <CardContent className="py-12 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">所属している組織がありません</p>
              <p className="text-sm text-muted-foreground mt-1">
                新しい組織を作成するか、招待を待ってください
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {orgs.map((org) => (
              <Link key={org.id} href={`/epoch/org/${org.id}`}>
                <Card className="bg-card border-border hover:border-muted-foreground/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary">
                          <Building2 className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-foreground font-medium">{org.name}</h3>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-xs text-muted-foreground font-mono">
                              /{org.slug || org.id}
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {org.memberCount}
                            </span>
                            <span className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
                              {ROLE_LABELS[org.role ?? "member"]}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-secondary/50 border border-border rounded-md">
          <p className="text-xs text-muted-foreground leading-relaxed">
            組織機能により、会社や部門単位でメンバーのEpochを管理できます。
            組織内での閲覧権限は設定で制御でき、Epochの不可逆性は個人利用時と同様に保証されます。
          </p>
        </div>
      </main>

      <EpochFooter />
    </div>
  )
}
