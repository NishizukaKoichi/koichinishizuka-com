"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Sparkles, Target, Scale, CheckCircle, Shield, ArrowRight, ChevronLeft, BookOpen } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"

type Space = {
  spaceId: string
  title: string
  purpose: string
}

type Chapter = {
  chapterId: string
  title: string
  orderIndex: number
}

type SpaceView = {
  name: string
  purpose: string
  decisions: string
  doneStrictness: string
  responsibility: string
  chapters: { id: string; title: string }[]
}

const entryItems = [
  { icon: Target, labelKey: "sigil.space.purpose", dataKey: "purpose" },
  { icon: Scale, labelKey: "sigil.space.decisions", dataKey: "decisions" },
  { icon: CheckCircle, labelKey: "sigil.space.done_strictness", dataKey: "doneStrictness" },
  { icon: Shield, labelKey: "sigil.space.responsibility", dataKey: "responsibility" },
]

export default function SigilSpacePage() {
  const params = useParams()
  const spaceId = params.spaceId as string
  const { t } = useI18n()
  const { userId } = useAuth()
  const router = useRouter()
  const [space, setSpace] = useState<SpaceView | null>(null)
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
          throw new Error("スペースの取得に失敗しました")
        }
        const data = (await res.json()) as { space: Space; chapters: Chapter[] }

        const view: SpaceView = {
          name: data.space.title,
          purpose: data.space.purpose,
          decisions: "未設定",
          doneStrictness: "未設定",
          responsibility: "未設定",
          chapters: (data.chapters ?? []).map((chapter) => ({
            id: chapter.chapterId,
            title: chapter.title,
          })),
        }

        if (!cancelled) {
          setSpace(view)
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
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">{error ?? "Space not found"}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-4xl items-center gap-2 px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-foreground">{space.name}</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <div className="space-y-6">
          {entryItems.map((item, index) => {
            const Icon = item.icon
            const value = space[item.dataKey as keyof SpaceView]
            return (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500/10">
                      <Icon className="h-5 w-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground">
                        {t(item.labelKey as Parameters<typeof t>[0])}
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                        {value}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Chapters */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              目次
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {space.chapters.map((chapter, index) => (
                <Link 
                  key={chapter.id}
                  href={`/sigil/space/${spaceId}/chapter/${chapter.id}`}
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
      </main>
    </div>
  )
}
