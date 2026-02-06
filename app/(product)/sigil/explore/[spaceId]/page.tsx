"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { 
  ChevronLeft, 
  Globe, 
  BookOpen, 
  Users, 
  Download, 
  Calendar,
  Building2,
  Target,
  CheckCircle2
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"

type Space = {
  spaceId: string
  title: string
  purpose: string
  visibility: "public" | "unlisted" | "private"
  createdAt: string
}

type Chapter = {
  chapterId: string
  title: string
}

type Analytics = {
  chapters: number
  adoptionsAccepted: number
  adoptionsDeclined: number
}

export default function SigilExploreDetailPage() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useParams()
  const { userId } = useAuth()
  const spaceId = params.spaceId as string
  
  const [adoptDialog, setAdoptDialog] = useState(false)
  const [adopted, setAdopted] = useState(false)
  const [space, setSpace] = useState<Space | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const readerRes = await fetch(`/api/v1/sigil/reader/${spaceId}`, {
          headers: undefined,
        })
        if (!readerRes.ok) {
          throw new Error("術式の取得に失敗しました")
        }
        const readerData = (await readerRes.json()) as { space: Space; chapters: Chapter[] }

        let analyticsData: Analytics | null = null
        if (userId) {
          const analyticsRes = await fetch(`/api/v1/sigil/analytics/${spaceId}`, {
            headers: undefined,
          })
          if (analyticsRes.ok) {
            const analyticsJson = (await analyticsRes.json()) as { analytics: Analytics }
            analyticsData = analyticsJson.analytics
          }
        }

        if (!cancelled) {
          setSpace(readerData.space)
          setChapters(readerData.chapters ?? [])
          setAnalytics(analyticsData)
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
  }, [spaceId, userId])

  const decisions = useMemo(() => ["未設定"], [])
  const responsibility = "未設定"
  const strictnessLabel = "未設定"

  const handleAdopt = async () => {
    if (!userId) {
      return
    }
    try {
      const res = await fetch(`/api/v1/sigil/spaces/${spaceId}/adopt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ status: "accepted" }),
      })
      if (!res.ok) {
        throw new Error("採用の記録に失敗しました")
      }
      setAdopted(true)
      setAdoptDialog(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "採用に失敗しました")
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">読み込み中...</div>
  }

  if (error || !space) {
    return <div className="text-sm text-red-500">{error ?? "術式が見つかりません"}</div>
  }

  const adoptedCount = analytics?.adoptionsAccepted ?? 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">{space.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Public Sigil
          </p>
        </div>
        <Button
          onClick={() => adopted ? null : setAdoptDialog(true)}
          disabled={adopted || !userId}
          className="gap-2"
        >
          {adopted ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              採用済み
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              採用する
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Globe className="h-4 w-4" />
          公開
        </span>
        <span className="flex items-center gap-1.5">
          <BookOpen className="h-4 w-4" />
          {chapters.length}章
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-4 w-4" />
          {adoptedCount}件採用
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          更新: {space.createdAt.split("T")[0]}
        </span>
      </div>

      <Separator />

      {/* Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              目的
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{space.purpose}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              責任範囲
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{responsibility}</p>
          </CardContent>
        </Card>
      </div>

      {/* Decisions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">想定される判断</CardTitle>
          <CardDescription>この術式で扱われる主な判断事項</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {decisions.map((decision, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground">•</span>
                <span>{decision}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Done Strictness */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Done厳格度</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{strictnessLabel}</p>
        </CardContent>
      </Card>

      {/* Chapters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">章構成</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chapters.map((chapter, idx) => (
              <div key={chapter.chapterId} className="flex items-center gap-3 text-sm">
                <span className="text-muted-foreground">{String(idx + 1).padStart(2, "0")}</span>
                <span>{chapter.title}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={adoptDialog} onOpenChange={setAdoptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>この術式を採用しますか？</DialogTitle>
            <DialogDescription>
              採用すると、あなたのアカウントに採用記録が残ります。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdoptDialog(false)}>
              キャンセル
            </Button>
            <Button onClick={handleAdopt}>
              採用する
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
