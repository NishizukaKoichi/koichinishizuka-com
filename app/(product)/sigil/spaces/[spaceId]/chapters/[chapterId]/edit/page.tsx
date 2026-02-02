"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ChevronLeft, Save, Eye } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth/context"

type Chapter = {
  chapterId: string
  title: string
  body: string
}

export default function SigilChapterEditPage() {
  const router = useRouter()
  const params = useParams()
  const { userId } = useAuth()
  const spaceId = params.spaceId as string
  const chapterId = params.chapterId as string

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/v1/sigil/chapters/${chapterId}`, {
          headers: userId ? { "x-user-id": userId } : undefined,
        })
        if (!res.ok) {
          throw new Error("章の取得に失敗しました")
        }
        const data = (await res.json()) as { chapter: Chapter }
        if (!cancelled) {
          setTitle(data.chapter.title)
          setContent(data.chapter.body)
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
  }, [chapterId, userId])

  const handleSave = async () => {
    if (!userId) {
      setError("ログインが必要です")
      return
    }
    try {
      const res = await fetch(`/api/v1/sigil/chapters/${chapterId}/revisions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ title, body: content }),
      })
      if (!res.ok) {
        throw new Error("保存に失敗しました")
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました")
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold text-foreground">章を編集</h1>
            <p className="text-sm text-muted-foreground">
              {chapterId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => router.push(`/sigil/space/${spaceId}/chapter/${chapterId}`)}
          >
            <Eye className="h-4 w-4" />
            プレビュー
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {saved ? "保存しました" : "保存"}
          </Button>
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">章タイトル</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="術式の前提条件"
            />
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">本文</CardTitle>
          <CardDescription>章の導入文や説明</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="この章の内容を記述..."
            rows={8}
          />
        </CardContent>
      </Card>
    </div>
  )
}
