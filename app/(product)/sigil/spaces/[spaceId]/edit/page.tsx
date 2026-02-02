"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useParams } from "next/navigation"
import { Globe, Lock, Building2, Save, Plus, Edit, Eye, BookOpen } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"

type Space = {
  spaceId: string
  title: string
  purpose: string
  visibility: "public" | "unlisted" | "private"
}

type Chapter = {
  chapterId: string
  title: string
  orderIndex: number
}

export default function EditSpacePage() {
  const { t } = useI18n()
  const router = useRouter()
  const params = useParams()
  const { userId } = useAuth()
  const spaceId = params.spaceId as string
  const isNewSpace = spaceId === "new"

  const [name, setName] = useState("")
  const [purpose, setPurpose] = useState("")
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("private")
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(!isNewSpace)

  useEffect(() => {
    if (isNewSpace || !userId) {
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const spaceRes = await fetch(`/api/v1/sigil/spaces/${spaceId}`, {
          headers: { "x-user-id": userId },
        })
        if (!spaceRes.ok) {
          throw new Error("スペースの取得に失敗しました")
        }
        const spaceData = (await spaceRes.json()) as { space: Space }

        const readerRes = await fetch(`/api/v1/sigil/reader/${spaceId}`, {
          headers: { "x-user-id": userId },
        })
        const readerData = readerRes.ok
          ? ((await readerRes.json()) as { chapters: Chapter[] })
          : { chapters: [] }

        if (!cancelled) {
          setName(spaceData.space.title)
          setPurpose(spaceData.space.purpose)
          setVisibility(spaceData.space.visibility)
          setChapters(readerData.chapters ?? [])
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
  }, [isNewSpace, spaceId, userId])

  const handleSave = async () => {
    if (!userId) {
      setError("ログインが必要です")
      return
    }

    try {
      if (isNewSpace) {
        const res = await fetch("/api/v1/sigil/spaces", {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": userId },
          body: JSON.stringify({ title: name, purpose, visibility }),
        })
        if (!res.ok) {
          throw new Error("スペースの作成に失敗しました")
        }
        const data = (await res.json()) as { space: Space }
        router.replace(`/sigil/spaces/${data.space.spaceId}/edit`)
      } else {
        const res = await fetch(`/api/v1/sigil/spaces/${spaceId}/revisions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-user-id": userId },
          body: JSON.stringify({ title: name, purpose }),
        })
        if (!res.ok) {
          throw new Error("保存に失敗しました")
        }
        setSaved(true)
        setTimeout(() => setSaved(false), 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存に失敗しました")
    }
  }

  const addChapter = async () => {
    if (!userId) {
      setError("ログインが必要です")
      return
    }
    try {
      const res = await fetch("/api/v1/sigil/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({
          space_id: spaceId,
          order_index: chapters.length + 1,
          title: "新しい章",
          body: "未設定",
        }),
      })
      if (!res.ok) {
        throw new Error("章の追加に失敗しました")
      }
      const data = (await res.json()) as { chapter: Chapter }
      setChapters((prev) => [...prev, data.chapter])
    } catch (err) {
      setError(err instanceof Error ? err.message : "章の追加に失敗しました")
    }
  }

  if (loading) {
    return <div className="text-sm text-muted-foreground">読み込み中...</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {isNewSpace ? "新しいスペースを作成" : "スペースを編集"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {name || (isNewSpace ? "スペース名を入力してください" : spaceId)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!isNewSpace && (
            <Link href={`/sigil/space/${params.spaceId}`}>
              <Button variant="outline" className="gap-2 bg-transparent">
                <Eye className="h-4 w-4" />
                プレビュー
              </Button>
            </Link>
          )}
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            {saved ? "保存しました" : "保存"}
          </Button>
        </div>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* Form */}
      <div className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">スペース名</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purpose">{t("sigil.space.purpose")}</Label>
              <Textarea
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Visibility */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">公開範囲</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={visibility} onValueChange={(value) => setVisibility(value as Space["visibility"])}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id="visibility-public" />
                <Label htmlFor="visibility-public" className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-green-500" />
                  公開
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="unlisted" id="visibility-unlisted" />
                <Label htmlFor="visibility-unlisted" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-amber-500" />
                  限定公開
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id="visibility-private" />
                <Label htmlFor="visibility-private" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  非公開
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Chapters */}
        {!isNewSpace && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                章構成
              </CardTitle>
              <CardDescription>
                章タイトルを編集するか、「編集」をクリックして内容を記述します
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {chapters.map((chapter, index) => (
                <div
                  key={chapter.chapterId}
                  className="flex items-center gap-2 p-3 rounded-md border border-border hover:border-muted-foreground/50 transition-colors group"
                >
                  <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                  <Input value={chapter.title} readOnly className="flex-1 h-8" />
                  <Link href={`/sigil/spaces/${params.spaceId}/chapters/${chapter.chapterId}/edit`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1 bg-transparent"
                    >
                      <Edit className="h-3 w-3" />
                      編集
                    </Button>
                  </Link>
                </div>
              ))}
              <Button variant="outline" className="gap-2 bg-transparent" onClick={addChapter}>
                <Plus className="h-4 w-4" />
                章を追加
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
