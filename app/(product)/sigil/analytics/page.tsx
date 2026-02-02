"use client"

import { useEffect, useMemo, useState } from "react"
import { Eye, Users, Download, CheckCircle2, Info } from "@/components/icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"

type Space = {
  spaceId: string
  title: string
}

type Analytics = {
  spaceId: string
  chapters: number
  adoptionsAccepted: number
  adoptionsDeclined: number
}

type SpaceStat = {
  name: string
  chapters: number
  adoptionsAccepted: number
  adoptionsDeclined: number
}

export default function SigilAnalyticsPage() {
  const { t } = useI18n()
  const { userId } = useAuth()
  const [spaceStats, setSpaceStats] = useState<SpaceStat[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setError("ログインが必要です")
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const spacesRes = await fetch("/api/v1/sigil/spaces", {
          headers: { "x-user-id": userId },
        })
        if (!spacesRes.ok) {
          throw new Error("スペースの取得に失敗しました")
        }
        const spacesData = (await spacesRes.json()) as { spaces: Space[] }

        const stats = await Promise.all(
          (spacesData.spaces ?? []).map(async (space) => {
            const res = await fetch(`/api/v1/sigil/analytics/${space.spaceId}`, {
              headers: { "x-user-id": userId },
            })
            if (!res.ok) {
              return {
                name: space.title,
                chapters: 0,
                adoptionsAccepted: 0,
                adoptionsDeclined: 0,
              }
            }
            const data = (await res.json()) as { analytics: Analytics }
            return {
              name: space.title,
              chapters: data.analytics.chapters,
              adoptionsAccepted: data.analytics.adoptionsAccepted,
              adoptionsDeclined: data.analytics.adoptionsDeclined,
            }
          })
        )

        if (!cancelled) {
          setSpaceStats(stats)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "データ取得に失敗しました")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const totals = useMemo(() => {
    return spaceStats.reduce(
      (acc, space) => {
        acc.spaces += 1
        acc.chapters += space.chapters
        acc.adoptionsAccepted += space.adoptionsAccepted
        acc.adoptionsDeclined += space.adoptionsDeclined
        return acc
      },
      { spaces: 0, chapters: 0, adoptionsAccepted: 0, adoptionsDeclined: 0 }
    )
  }, [spaceStats])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">分析</h1>
          <p className="text-sm text-muted-foreground mt-1">
            術式の章数と採用状況
          </p>
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-amber-500/10">
                <Eye className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.spaces}</p>
                <p className="text-xs text-muted-foreground">スペース数</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.chapters}</p>
                <p className="text-xs text-muted-foreground">章数合計</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-green-500/10">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.adoptionsAccepted}</p>
                <p className="text-xs text-muted-foreground">採用（accepted）</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-md bg-cyan-500/10">
                <Download className="h-5 w-5 text-cyan-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totals.adoptionsDeclined}</p>
                <p className="text-xs text-muted-foreground">採用（declined）</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Space Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">スペース別</CardTitle>
          <CardDescription>章数と採用状況</CardDescription>
        </CardHeader>
        <CardContent>
          {spaceStats.length === 0 ? (
            <p className="text-sm text-muted-foreground">{loading ? "読み込み中..." : "スペースがありません"}</p>
          ) : (
            <div className="space-y-4">
              {spaceStats.map((space, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{space.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        {space.chapters} 章
                      </span>
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        採用: {space.adoptionsAccepted}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="h-3 w-3" />
                        辞退: {space.adoptionsDeclined}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
