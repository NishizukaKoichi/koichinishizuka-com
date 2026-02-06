"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EpochHeader } from "@/components/epoch-header"
import { EpochFooter } from "@/components/epoch-footer"
import { EpochDepartmentTree } from "@/components/epoch-department-tree"
import {
  Building2,
  Users,
  Settings,
  FolderTree,
  Activity,
  ChevronRight,
} from "@/components/icons"
import { useAuth } from "@/lib/auth/context"
import { ROLE_LABELS } from "@/lib/types/organization"

interface EpochOrgDashboardProps {
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

type OrgStats = {
  totalMembers: number
  totalRecords: number
  activeToday: number
  departments: number
}

type OrgDepartment = {
  id: string
  organizationId: string
  name: string
  parentId: string | null
  order: number
  createdAt: string
}

type OrgMember = {
  id: string
  userId: string
  displayName: string | null
  departmentId: string | null
  role: "owner" | "admin" | "manager" | "member" | null
  joinedAt: string | null
}

type OrgActivity = {
  recordId: string
  userId: string
  displayName: string | null
  recordType: string
  recordedAt: string
}

const emptyStats: OrgStats = {
  totalMembers: 0,
  totalRecords: 0,
  activeToday: 0,
  departments: 0,
}

function formatRelativeTime(value: string): string {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) {
    return "不明"
  }
  const diffMs = Date.now() - timestamp
  const minutes = Math.floor(diffMs / 60000)
  if (minutes < 1) return "たった今"
  if (minutes < 60) return `${minutes}分前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}時間前`
  const days = Math.floor(hours / 24)
  return `${days}日前`
}

export function EpochOrgDashboard({ orgId }: EpochOrgDashboardProps) {
  const { userId } = useAuth()
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null)
  const [org, setOrg] = useState<OrgDetail | null>(null)
  const [stats, setStats] = useState<OrgStats>(emptyStats)
  const [departments, setDepartments] = useState<OrgDepartment[]>([])
  const [members, setMembers] = useState<OrgMember[]>([])
  const [activities, setActivities] = useState<OrgActivity[]>([])
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
        const [orgRes, membersRes, activityRes] = await Promise.all([
          fetch(`/api/epoch/orgs/${orgId}`, { headers: undefined }),
          fetch(`/api/epoch/orgs/${orgId}/members`, { headers: undefined }),
          fetch(`/api/epoch/orgs/${orgId}/activity`, { headers: undefined }),
        ])

        if (!orgRes.ok) {
          const payload = await orgRes.json().catch(() => null)
          throw new Error(payload?.error || "組織情報の取得に失敗しました")
        }
        if (!membersRes.ok) {
          const payload = await membersRes.json().catch(() => null)
          throw new Error(payload?.error || "メンバー情報の取得に失敗しました")
        }
        if (!activityRes.ok) {
          const payload = await activityRes.json().catch(() => null)
          throw new Error(payload?.error || "アクティビティの取得に失敗しました")
        }

        const orgData = (await orgRes.json()) as { org: OrgDetail; stats: OrgStats; departments: OrgDepartment[] }
        const membersData = (await membersRes.json()) as { members: OrgMember[]; departments: OrgDepartment[] }
        const activityData = (await activityRes.json()) as { activities: OrgActivity[] }

        setOrg(orgData.org)
        setStats(orgData.stats ?? emptyStats)
        setDepartments(orgData.departments ?? membersData.departments ?? [])
        setMembers(membersData.members ?? [])
        setActivities(activityData.activities ?? [])
      } catch (err) {
        const message = err instanceof Error ? err.message : "組織情報の取得に失敗しました"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [orgId, userId])

  const selectedDepartmentName = useMemo(() => {
    if (!selectedDepartment) return null
    return departments.find((dept) => dept.id === selectedDepartment)?.name ?? null
  }, [departments, selectedDepartment])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EpochHeader />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-4 rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </div>
        )}

        {isLoading && (
          <p className="text-sm text-muted-foreground mb-4">読み込み中...</p>
        )}

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{org?.name ?? "組織"}</h1>
              <p className="text-sm text-muted-foreground font-mono">/{org?.slug ?? orgId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/epoch/org/${orgId}/members`}>
              <Button variant="outline" className="border-border bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                メンバー
              </Button>
            </Link>
            <Link href={`/epoch/org/${orgId}/settings`}>
              <Button variant="outline" className="border-border bg-transparent">
                <Settings className="h-4 w-4 mr-2" />
                設定
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.totalMembers}</p>
                  <p className="text-xs text-muted-foreground">メンバー</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.totalRecords}</p>
                  <p className="text-xs text-muted-foreground">総Record数</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.activeToday}</p>
                  <p className="text-xs text-muted-foreground">本日のアクティブ</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <FolderTree className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-semibold text-foreground">{stats.departments}</p>
                  <p className="text-xs text-muted-foreground">部門数</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                  <FolderTree className="h-4 w-4" />
                  部門構造
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EpochDepartmentTree
                  departments={departments}
                  selectedId={selectedDepartment}
                  onSelect={setSelectedDepartment}
                  onDepartmentsChange={setDepartments}
                  orgId={orgId}
                />
              </CardContent>
            </Card>
          </div>

          <div className="col-span-2">
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-foreground">
                  {selectedDepartmentName ? `${selectedDepartmentName} のメンバー` : "最近のアクティビティ"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDepartment ? (
                  <DepartmentMembersList
                    departmentId={selectedDepartment}
                    members={members}
                    departments={departments}
                  />
                ) : (
                  <RecentOrgActivity activities={activities} />
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 p-4 bg-secondary/50 border border-border rounded-md">
          <p className="text-xs text-muted-foreground leading-relaxed">
            組織内のRecordは各メンバーの個人Epochとして記録されます。
            組織設定により、メンバー間での閲覧権限を制御できます。
            すべてのRecordは不可逆であり、組織管理者であっても削除・編集はできません。
          </p>
        </div>
      </main>

      <EpochFooter />
    </div>
  )
}

function DepartmentMembersList({
  departmentId,
  members,
  departments,
}: {
  departmentId: string
  members: OrgMember[]
  departments: OrgDepartment[]
}) {
  const departmentName =
    departments.find((dept) => dept.id === departmentId)?.name ?? "未配属"
  const filteredMembers = members.filter((member) => member.departmentId === departmentId)

  if (filteredMembers.length === 0) {
    return <p className="text-sm text-muted-foreground">メンバーがいません。</p>
  }

  return (
    <div className="space-y-2">
      {filteredMembers.map((member) => (
        <Link key={member.id} href={`/epoch/user/${member.userId}`}>
          <div className="flex items-center justify-between p-3 rounded-md hover:bg-secondary/50 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-xs text-muted-foreground">
                  {(member.displayName ?? member.userId).slice(0, 1)}
                </span>
              </div>
              <div>
                <p className="text-sm text-foreground">{member.displayName ?? member.userId}</p>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABELS[member.role ?? "member"]} ・ {departmentName}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  )
}

function RecentOrgActivity({ activities }: { activities: OrgActivity[] }) {
  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground">最近のアクティビティはありません。</p>
  }

  return (
    <div className="space-y-2">
      {activities.map((activity) => (
        <div
          key={activity.recordId}
          className="flex items-center justify-between p-3 border-b border-border last:border-0"
        >
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
              <span className="text-xs text-muted-foreground">
                {(activity.displayName ?? activity.userId).slice(0, 1)}
              </span>
            </div>
            <div>
              <p className="text-sm text-foreground">
                <span className="font-medium">{activity.displayName ?? activity.userId}</span>
                <span className="text-muted-foreground ml-2">
                  {activity.recordType === "revised" ? "改訂を追加" : "Recordを作成"}
                </span>
              </p>
            </div>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(activity.recordedAt)}
          </span>
        </div>
      ))}
    </div>
  )
}
