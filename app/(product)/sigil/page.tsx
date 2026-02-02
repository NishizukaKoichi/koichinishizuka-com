"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, FolderOpen, Users, FileText, Edit, Eye, Globe, Building2, Lock } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  chaptersCount: number
  viewsCount: number
  lastUpdated: string
}

const getVisibilityBadge = (visibility: "public" | "unlisted" | "private") => {
  switch (visibility) {
    case "public":
      return (
        <Badge variant="secondary" className="gap-1">
          <Globe className="h-3 w-3 text-green-500" />
          公開
        </Badge>
      )
    case "unlisted":
      return (
        <Badge variant="secondary" className="gap-1">
          <Building2 className="h-3 w-3 text-amber-500" />
          限定公開
        </Badge>
      )
    case "private":
      return (
        <Badge variant="secondary" className="gap-1">
          <Lock className="h-3 w-3" />
          非公開
        </Badge>
      )
  }
}

export default function SigilDashboardPage() {
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
          headers: { "x-user-id": userId },
        })
        if (!res.ok) {
          throw new Error("スペースの取得に失敗しました")
        }
        const data = (await res.json()) as { spaces: Space[] }

        const baseSpaces = data.spaces ?? []
        const enriched = await Promise.all(
          baseSpaces.map(async (space) => {
            let chaptersCount = 0
            try {
              const readerRes = await fetch(`/api/v1/sigil/reader/${space.spaceId}`, {
                headers: { "x-user-id": userId },
              })
              if (readerRes.ok) {
                const readerData = (await readerRes.json()) as { chapters: unknown[] }
                chaptersCount = readerData.chapters?.length ?? 0
              }
            } catch {
              chaptersCount = 0
            }

            return {
              id: space.spaceId,
              name: space.title,
              purpose: space.purpose,
              visibility: space.visibility,
              chaptersCount,
              viewsCount: 0,
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {t("sigil.dashboard")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("sigil.spaces_desc")}
          </p>
        </div>
        <Link href="/sigil/spaces/new">
          <Button className="bg-amber-500 hover:bg-amber-600 text-background">
            <Plus className="mr-2 h-4 w-4" />
            {t("sigil.create_space")}
          </Button>
        </Link>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* Spaces Grid */}
      {spaces.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderOpen className="h-12 w-12 text-muted-foreground/50" />
            <p className="mt-4 text-sm text-muted-foreground">
              {loading ? "読み込み中..." : t("sigil.no_spaces")}
            </p>
            <Link href="/sigil/spaces/new">
              <Button className="mt-4 bg-amber-500 hover:bg-amber-600 text-background">
                <Plus className="mr-2 h-4 w-4" />
                {t("sigil.create_space")}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {spaces.map((space) => (
            <Card key={space.id} className="group hover:border-amber-500/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{space.name}</CardTitle>
                      {getVisibilityBadge(space.visibility)}
                    </div>
                    <CardDescription>
                      {space.purpose}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-4 w-4" />
                    <span>{space.chaptersCount}章</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    <span>{space.viewsCount} views</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    更新: {space.lastUpdated}
                  </p>
                  <div className="flex items-center gap-2">
                    <Link href={`/sigil/space/${space.id}`}>
                      <Button variant="ghost" size="sm" className="gap-1 h-8">
                        <Eye className="h-3 w-3" />
                        表示
                      </Button>
                    </Link>
                    <Link href={`/sigil/spaces/${space.id}/edit`}>
                      <Button variant="outline" size="sm" className="gap-1 h-8 bg-transparent">
                        <Edit className="h-3 w-3" />
                        編集
                      </Button>
                    </Link>
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
