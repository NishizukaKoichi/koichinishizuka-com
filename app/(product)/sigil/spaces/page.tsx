"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, FolderOpen, Globe, Lock, Building2, MoreVertical, Eye, Edit, Trash2 } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"

type Space = {
  spaceId: string
  title: string
  purpose: string
  visibility: "public" | "unlisted" | "private"
  status: "draft" | "final" | "deprecated"
  createdAt: string
}

type SpaceView = {
  id: string
  name: string
  purpose: string
  visibility: "public" | "unlisted" | "private"
  chapters: number
  lastUpdated: string
}

const getVisibilityIcon = (visibility: "public" | "unlisted" | "private") => {
  switch (visibility) {
    case "public":
      return <Globe className="h-3.5 w-3.5 text-green-500" />
    case "unlisted":
      return <Building2 className="h-3.5 w-3.5 text-amber-500" />
    case "private":
      return <Lock className="h-3.5 w-3.5 text-muted-foreground" />
  }
}

const getVisibilityLabel = (visibility: "public" | "unlisted" | "private") => {
  switch (visibility) {
    case "public":
      return "公開"
    case "unlisted":
      return "限定公開"
    case "private":
      return "非公開"
  }
}

export default function SigilSpacesPage() {
  const { t } = useI18n()
  const { userId } = useAuth()
  const [spaces, setSpaces] = useState<SpaceView[]>([])
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
        const res = await fetch("/api/v1/sigil/spaces", {
          headers: undefined,
        })
        if (!res.ok) {
          throw new Error("スペースの取得に失敗しました")
        }
        const data = (await res.json()) as { spaces: Space[] }

        const enriched = await Promise.all(
          (data.spaces ?? []).map(async (space) => {
            let chapters = 0
            try {
              const readerRes = await fetch(`/api/v1/sigil/reader/${space.spaceId}`, {
                headers: undefined,
              })
              if (readerRes.ok) {
                const readerData = (await readerRes.json()) as { chapters: unknown[] }
                chapters = readerData.chapters?.length ?? 0
              }
            } catch {
              chapters = 0
            }
            return {
              id: space.spaceId,
              name: space.title,
              purpose: space.purpose,
              visibility: space.visibility,
              chapters,
              lastUpdated: space.createdAt.split("T")[0],
            }
          })
        )

        if (!cancelled) {
          setSpaces(enriched)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("sigil.spaces")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("sigil.spaces_desc")}</p>
        </div>
        <Link href="/sigil/spaces/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            {t("sigil.create_space")}
          </Button>
        </Link>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* Space list */}
      {spaces.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{loading ? "読み込み中..." : t("sigil.no_spaces")}</p>
            <Link href="/sigil/spaces/new" className="mt-4">
              <Button variant="outline" className="gap-2 bg-transparent">
                <Plus className="h-4 w-4" />
                {t("sigil.create_space")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {spaces.map((space) => (
            <Card key={space.id} className="hover:border-muted-foreground/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Link 
                        href={`/sigil/space/${space.id}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {space.name}
                      </Link>
                      {getVisibilityIcon(space.visibility)}
                      <span className="text-xs text-muted-foreground">
                        {getVisibilityLabel(space.visibility)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {space.purpose}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{space.chapters} chapters</span>
                      <span>Updated {space.lastUpdated}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link href={`/sigil/spaces/${space.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1 bg-transparent">
                        <Edit className="h-3 w-3" />
                        編集
                      </Button>
                    </Link>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/sigil/space/${space.id}`} className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            プレビュー
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          削除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
