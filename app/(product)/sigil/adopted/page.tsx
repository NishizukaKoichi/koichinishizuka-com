"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Download, FolderOpen, Eye, Edit, Trash2, MoreVertical, ExternalLink } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

type Adoption = {
  adoptionId: string
  spaceId: string
  status: "accepted" | "declined"
  decidedAt: string
}

type Space = {
  spaceId: string
  title: string
  purpose: string
}

type AdoptedSpace = {
  id: string
  name: string
  originalId: string
  purpose: string
  adoptedAt: string
  chapters: number
}

export default function SigilAdoptedPage() {
  const { t } = useI18n()
  const { userId } = useAuth()
  const [deleteDialog, setDeleteDialog] = useState<string | null>(null)
  const [adoptedSpaces, setAdoptedSpaces] = useState<AdoptedSpace[]>([])
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
        const res = await fetch("/api/v1/sigil/adoptions", {
          headers: undefined,
        })
        if (!res.ok) {
          throw new Error("採用術式の取得に失敗しました")
        }
        const data = (await res.json()) as { adoptions: Adoption[] }
        const accepted = (data.adoptions ?? []).filter((adoption) => adoption.status === "accepted")

        const enriched = await Promise.all(
          accepted.map(async (adoption) => {
            let space: Space | null = null
            let chapterCount = 0
            try {
              const readerRes = await fetch(`/api/v1/sigil/reader/${adoption.spaceId}`, {
                headers: undefined,
              })
              if (readerRes.ok) {
                const readerData = (await readerRes.json()) as { space: Space; chapters: unknown[] }
                space = readerData.space
                chapterCount = readerData.chapters?.length ?? 0
              }
            } catch {
              space = null
            }

            return {
              id: adoption.spaceId,
              originalId: adoption.spaceId,
              name: space?.title ?? adoption.spaceId,
              purpose: space?.purpose ?? "",
              adoptedAt: adoption.decidedAt.split("T")[0],
              chapters: chapterCount,
            }
          })
        )

        if (!cancelled) {
          setAdoptedSpaces(enriched)
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

  const handleDelete = async (spaceId: string) => {
    if (!userId) {
      return
    }
    try {
      const res = await fetch(`/api/v1/sigil/spaces/${spaceId}/adopt`, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify({ status: "declined" }),
      })
      if (!res.ok) {
        throw new Error("採用解除に失敗しました")
      }
      setAdoptedSpaces((prev) => prev.filter((space) => space.id !== spaceId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "採用解除に失敗しました")
    } finally {
      setDeleteDialog(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">採用した術式</h1>
          <p className="text-sm text-muted-foreground mt-1">
            他の組織から採用した術式を管理
          </p>
        </div>
        <Link href="/sigil/explore">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            術式を探す
          </Button>
        </Link>
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      {/* Adopted spaces list */}
      {adoptedSpaces.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Download className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">{loading ? "読み込み中..." : "採用した術式はありません"}</p>
            <Link href="/sigil/explore" className="mt-4">
              <Button variant="outline" className="bg-transparent">
                公開術式を探索する
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {adoptedSpaces.map((space) => (
            <Card key={space.id} className="hover:border-muted-foreground/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        href={`/sigil/explore/${space.originalId}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {space.name}
                      </Link>
                      <Badge variant="secondary" className="text-xs">
                        採用済み
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {space.purpose}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Public Sigil
                      </span>
                      <span>{space.chapters}章</span>
                      <span>採用: {space.adoptedAt}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/sigil/explore/${space.originalId}`} className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            元の術式を見る
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => setDeleteDialog(space.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          採用を解除
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

      {/* Delete Dialog */}
      <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>採用を解除しますか？</DialogTitle>
            <DialogDescription>
              採用解除すると、この術式への参照が外れます。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteDialog && handleDelete(deleteDialog)}
            >
              採用解除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
