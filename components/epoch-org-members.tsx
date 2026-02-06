"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EpochHeader } from "@/components/epoch-header"
import { EpochFooter } from "@/components/epoch-footer"
import {
  Search,
  UserPlus,
  MoreHorizontal,
  ChevronRight,
  Mail,
  Shield,
  UserMinus,
  Building2,
  ArrowLeft,
} from "@/components/icons"
import { useAuth } from "@/lib/auth/context"
import type { Department, OrganizationRole } from "@/lib/types/organization"

interface EpochOrgMembersProps {
  orgId: string
}

type OrgMember = {
  id: string
  userId: string
  departmentId: string | null
  role: OrganizationRole | null
  joinedAt: string | null
  displayName: string | null
}

type OrgDepartment = Department

const ROLE_LABELS: Record<OrganizationRole, string> = {
  owner: "オーナー",
  admin: "管理者",
  manager: "マネージャー",
  member: "メンバー",
}

export function EpochOrgMembers({ orgId }: EpochOrgMembersProps) {
  const { userId } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [filterDepartment, setFilterDepartment] = useState<string | null>(null)
  const [filterRole, setFilterRole] = useState<OrganizationRole | null>(null)
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState<OrganizationRole>("member")
  const [inviteDepartment, setInviteDepartment] = useState<string | null>(null)
  const [members, setMembers] = useState<OrgMember[]>([])
  const [departments, setDepartments] = useState<OrgDepartment[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isInviting, setIsInviting] = useState(false)

  useEffect(() => {
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/epoch/orgs/${orgId}/members`, {
          headers: undefined,
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || "メンバー情報の取得に失敗しました")
        }
        const data = (await response.json()) as { members: OrgMember[]; departments: OrgDepartment[] }
        setMembers(data.members ?? [])
        setDepartments(data.departments ?? [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "メンバー情報の取得に失敗しました"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [orgId, userId])

  const filteredMembers = members.filter((member) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!(member.displayName ?? member.userId).toLowerCase().includes(query)) {
        return false
      }
    }
    if (filterDepartment && member.departmentId !== filterDepartment) {
      return false
    }
    if (filterRole && member.role !== filterRole) {
      return false
    }
    return true
  })

  const handleInvite = async () => {
    if (!userId) {
      setError("認証情報がありません")
      return
    }
    setIsInviting(true)
    setError(null)
    try {
      const response = await fetch(`/api/epoch/orgs/${orgId}/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          departmentId: inviteDepartment,
        }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "招待の送信に失敗しました")
      }
      setInviteDialogOpen(false)
      setInviteEmail("")
      setInviteRole("member")
      setInviteDepartment(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "招待の送信に失敗しました"
      setError(message)
    } finally {
      setIsInviting(false)
    }
  }

  const getDepartmentName = (deptId: string | null) => {
    if (!deptId) return "未配属"
    return departments.find((d) => d.id === deptId)?.name || "不明"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EpochHeader />

      <main className="flex-1 container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/epoch/org/${orgId}`}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            組織ダッシュボードに戻る
          </Link>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-foreground">メンバー管理</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {members.length} 名のメンバー
            </p>
          </div>

          <Button
            onClick={() => setInviteDialogOpen(true)}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            招待
          </Button>
        </div>

        <Card className="bg-card border-border mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="名前で検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-secondary border-border text-foreground"
                />
              </div>

              <Select
                value={filterDepartment || "all"}
                onValueChange={(v) => setFilterDepartment(v === "all" ? null : v)}
              >
                <SelectTrigger className="w-40 bg-secondary border-border text-foreground">
                  <SelectValue placeholder="部門" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-foreground">すべての部門</SelectItem>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id} className="text-foreground">
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={filterRole || "all"}
                onValueChange={(v) => setFilterRole(v === "all" ? null : (v as OrganizationRole))}
              >
                <SelectTrigger className="w-40 bg-secondary border-border text-foreground">
                  <SelectValue placeholder="役割" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-foreground">すべての役割</SelectItem>
                  <SelectItem value="owner" className="text-foreground">オーナー</SelectItem>
                  <SelectItem value="admin" className="text-foreground">管理者</SelectItem>
                  <SelectItem value="manager" className="text-foreground">マネージャー</SelectItem>
                  <SelectItem value="member" className="text-foreground">メンバー</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {error && (
                <div className="px-4 py-3 text-xs text-destructive">
                  {error}
                </div>
              )}
              {isLoading && (
                <div className="px-4 py-3 text-xs text-muted-foreground">
                  読み込み中...
                </div>
              )}
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors"
                >
                  <Link href={`/epoch/user/${member.userId}`} className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-sm text-muted-foreground">
                        {(member.displayName ?? member.userId).slice(0, 1)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.displayName ?? member.userId}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {getDepartmentName(member.departmentId)}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
                          {ROLE_LABELS[member.role ?? "member"]}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-card border-border">
                      <DropdownMenuItem className="text-foreground">
                        <Mail className="h-4 w-4 mr-2" />
                        メッセージ
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-foreground">
                        <Shield className="h-4 w-4 mr-2" />
                        権限変更
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-border" />
                      <DropdownMenuItem className="text-destructive">
                        <UserMinus className="h-4 w-4 mr-2" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">メンバーを招待</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                メールアドレスに招待を送信します。
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="invite-email" className="text-foreground">メールアドレス</Label>
                <Input
                  id="invite-email"
                  placeholder="example@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="bg-secondary border-border text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-role" className="text-foreground">役割</Label>
                <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as OrganizationRole)}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="admin" className="text-foreground">管理者</SelectItem>
                    <SelectItem value="manager" className="text-foreground">マネージャー</SelectItem>
                    <SelectItem value="member" className="text-foreground">メンバー</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite-dept" className="text-foreground">配属部門</Label>
                <Select value={inviteDepartment || "later"} onValueChange={(v) => setInviteDepartment(v === "later" ? null : v)}>
                  <SelectTrigger className="bg-secondary border-border text-foreground">
                    <SelectValue placeholder="未配属" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="later" className="text-foreground">未配属</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id} className="text-foreground">
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
                className="border-border bg-transparent"
              >
                キャンセル
              </Button>
              <Button
                onClick={handleInvite}
                disabled={!inviteEmail || isInviting}
                className="bg-primary text-primary-foreground"
              >
                {isInviting ? "送信中..." : "招待を送信"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>

      <EpochFooter />
    </div>
  )
}
