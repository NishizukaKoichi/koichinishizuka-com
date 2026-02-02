"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Sparkles, ChevronLeft, ArrowRight, BookOpen } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"

type Chapter = {
  chapterId: string
  spaceId: string
  orderIndex: number
  title: string
  body: string
}

type Space = {
  spaceId: string
  title: string
  purpose: string
}

export default function SigilChapterPage() {
  const params = useParams()
  const spaceId = params.spaceId as string
  const chapterId = params.chapterId as string
  const { t } = useI18n()
  const router = useRouter()
  const { userId } = useAuth()
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
        const headers = userId ? { "x-user-id": userId } : undefined
        const res = await fetch(`/api/v1/sigil/reader/${spaceId}`, { headers })
        if (!res.ok) {
          const payload = await res.json().catch(() => null)
          throw new Error(payload?.error ?? "Chapterの取得に失敗しました")
        }
        const data = (await res.json()) as { space: Space; chapters: Chapter[] }
        if (!cancelled) {
          setSpace(data.space)
          setChapters(data.chapters ?? [])
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Chapterの取得に失敗しました")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [spaceId, userId])

  const chapter = useMemo(
    () => chapters.find((item) => item.chapterId === chapterId) ?? null,
    [chapters, chapterId]
  )

  const chapterIds = useMemo(
    () => chapters.map((item) => item.chapterId),
    [chapters]
  )
  const currentIndex = chapterIds.indexOf(chapterId)
  const nextChapterId = currentIndex >= 0 && currentIndex < chapterIds.length - 1
    ? chapterIds[currentIndex + 1]
    : null

  const paragraphs = useMemo(() => {
    if (!chapter?.body) return []
    return chapter.body
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
  }, [chapter])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!chapter || !space) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-muted-foreground">{error ?? "Chapter not found"}</p>
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
          <span className="font-semibold text-foreground">{space.title}</span>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        {/* Chapter indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <BookOpen className="h-4 w-4" />
          <span>Chapter {String(currentIndex + 1).padStart(2, "0")}</span>
          <span>·</span>
          <span>{t("sigil.chapter.scope")}: 未設定</span>
        </div>

        {/* Chapter title */}
        <h1 className="text-2xl font-semibold text-foreground mb-8">
          {chapter.title}
        </h1>

        {/* Chapter content - plain text, no decoration */}
        <div className="space-y-4 text-foreground leading-relaxed">
          {paragraphs.length === 0 ? (
            <p className="text-muted-foreground">本文が未設定です。</p>
          ) : (
            paragraphs.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))
          )}
        </div>

        {/* Navigation */}
        <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
          <Link href={`/sigil/space/${spaceId}/toc`}>
            <Button variant="outline" className="bg-transparent">
              <ChevronLeft className="mr-2 h-4 w-4" />
              {t("sigil.chapter.back_to_toc")}
            </Button>
          </Link>

          {nextChapterId ? (
            <Link href={`/sigil/space/${spaceId}/chapter/${nextChapterId}`}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-background">
                {t("sigil.chapter.next")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href={`/sigil/space/${spaceId}/toc`}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-background">
                {t("sigil.chapter.back_to_toc")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}
