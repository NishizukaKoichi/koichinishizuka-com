"use client"

import { useEffect, useMemo, useState, Suspense } from "react"
import Link from "next/link"
import { Search, Globe, BookOpen, Users, Download, Eye } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useI18n } from "@/lib/i18n/context"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth/context"

type PublicSpace = {
  spaceId: string
  title: string
  purpose: string
  ownerUserId: string
  createdAt: string
}

type Adoption = {
  spaceId: string
  status: "accepted" | "declined"
}

type Spec = {
  id: string
  name: string
  author: string
  purpose: string
  category: string
  chapters: number
  adoptedCount: number
  createdAt: string
}

const categories = [
  { id: "all", label: "すべて" },
  { id: "engineering", label: "エンジニアリング" },
  { id: "design", label: "デザイン" },
  { id: "product", label: "プロダクト" },
  { id: "sales", label: "営業" },
  { id: "customer-success", label: "カスタマーサクセス" },
  { id: "data", label: "データ" },
  { id: "hr", label: "人事" },
  { id: "finance", label: "経理・財務" },
]

function Loading() {
  return null
}

export default function SigilExplorePage() {
  const { t } = useI18n()
  const { userId } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [adoptDialogOpen, setAdoptDialogOpen] = useState(false)
  const [selectedSpec, setSelectedSpec] = useState<Spec | null>(null)
  const [adoptedSpecs, setAdoptedSpecs] = useState<string[]>([])
  const [specs, setSpecs] = useState<Spec[]>([])
  const [error, setError] = useState<string | null>(null)

  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setError(null)
      try {
        const res = await fetch("/api/v1/sigil/explore")
        if (!res.ok) {
          throw new Error("公開術式の取得に失敗しました")
        }
        const data = (await res.json()) as { spaces: PublicSpace[] }

        let adoptionIds: string[] = []
        if (userId) {
          const adoptionRes = await fetch("/api/v1/sigil/adoptions", {
            headers: undefined,
          })
          if (adoptionRes.ok) {
            const adoptionData = (await adoptionRes.json()) as { adoptions: Adoption[] }
            adoptionIds = (adoptionData.adoptions ?? [])
              .filter((adoption) => adoption.status === "accepted")
              .map((adoption) => adoption.spaceId)
          }
        }

        const mapped: Spec[] = (data.spaces ?? []).map((space) => ({
          id: space.spaceId,
          name: space.title,
          author: space.ownerUserId,
          purpose: space.purpose,
          category: "all",
          chapters: 0,
          adoptedCount: 0,
          createdAt: space.createdAt.split("T")[0],
        }))

        if (!cancelled) {
          setSpecs(mapped)
          setAdoptedSpecs(adoptionIds)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "データ取得に失敗しました")
        }
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const filteredSpecs = useMemo(() => {
    return specs.filter((spec) => {
      const matchesSearch =
        spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        spec.author.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryParam === "all" || spec.category === categoryParam
      return matchesSearch && matchesCategory
    })
  }, [specs, searchQuery, categoryParam])

  const handleAdoptClick = (spec: Spec) => {
    setSelectedSpec(spec)
    setAdoptDialogOpen(true)
  }

  const handleAdoptConfirm = async () => {
    if (selectedSpec && userId) {
      try {
        const res = await fetch(`/api/v1/sigil/spaces/${selectedSpec.id}/adopt`, {
          method: "POST",
          headers: { "Content-Type": "application/json", },
          body: JSON.stringify({ status: "accepted" }),
        })
        if (!res.ok) {
          throw new Error("採用の記録に失敗しました")
        }
        setAdoptedSpecs((prev) => [...prev, selectedSpec.id])
      } catch (err) {
        setError(err instanceof Error ? err.message : "採用に失敗しました")
      }
    }
    setAdoptDialogOpen(false)
    setSelectedSpec(null)
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t("sigil.explore.title")}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t("sigil.explore.desc")}</p>
        </div>

        {error && <div className="text-sm text-red-500">{error}</div>}

        {/* Search and filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("sigil.explore.search")}
              className="pl-9"
            />
          </div>

          {/* Category filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={categoryParam === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.id)}
                className={categoryParam === category.id ? "" : "bg-transparent"}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="grid gap-4">
          {filteredSpecs.map((spec) => {
            const isAdopted = adoptedSpecs.includes(spec.id)
            return (
              <Card key={spec.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Globe className="h-4 w-4 text-green-500 shrink-0" />
                        {spec.name}
                      </CardTitle>
                      <CardDescription className="mt-1">{spec.purpose}</CardDescription>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="bg-transparent"
                      >
                        <Link href={`/sigil/explore/${spec.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          {t("sigil.explore.view")}
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAdoptClick(spec)}
                        disabled={isAdopted || !userId}
                      >
                        {isAdopted ? "採用済み" : t("sigil.explore.adopt")}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3.5 w-3.5" />
                      {spec.chapters}章
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {spec.adoptedCount}件採用
                    </span>
                    <span className="flex items-center gap-1">
                      <Download className="h-3.5 w-3.5" />
                      {spec.createdAt}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Adopt Dialog */}
        <Dialog open={adoptDialogOpen} onOpenChange={setAdoptDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>術式を採用しますか？</DialogTitle>
              <DialogDescription>
                採用すると、あなたのアカウントに採用記録が残ります。
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdoptDialogOpen(false)}>
                キャンセル
              </Button>
              <Button onClick={handleAdoptConfirm}>
                採用する
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Suspense>
  )
}
