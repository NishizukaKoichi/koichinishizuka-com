"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { BookOpen, ChevronLeft, ArrowRight } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/context"

type Space = {
  spaceId: string
  title: string
}

type Chapter = {
  chapterId: string
  title: string
  orderIndex: number
}

export default function SigilTocPage() {
  const params = useParams()
  const router = useRouter()
  const { userId } = useAuth()
  const spaceId = params.spaceId as string
  const [space, setSpace] = useState<Space | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/v1/sigil/reader/${spaceId}`, {
          headers: undefined,
        })
        if (!res.ok) {
          throw new Error("目次の取得に失敗しました")
        }
        const data = (await res.json()) as { space: Space; chapters: Chapter[] }
        if (!cancelled) {
          setSpace(data.space)
          setChapters(data.chapters ?? [])
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

  if (loading) {
    return <div className="text-sm text-muted-foreground">読み込み中...</div>
  }

  if (error || !space) {
    return <div className="text-sm text-red-500">{error ?? "スペースが見つかりません"}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold text-foreground">{space.title}</h1>
          <p className="text-sm text-muted-foreground">目次</p>
        </div>
      </div>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            章一覧
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chapters.map((chapter, index) => (
              <Link 
                key={chapter.chapterId}
                href={`/sigil/space/${spaceId}/chapter/${chapter.chapterId}`}
                className="flex items-center justify-between p-3 rounded-md border border-border hover:border-amber-500/50 hover:bg-muted/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground w-6">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium group-hover:text-amber-500 transition-colors">
                    {chapter.title}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-amber-500 transition-colors" />
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
