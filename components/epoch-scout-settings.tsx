"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Plus, X } from "@/components/icons"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"

const industries = [
  // 情報通信
  { id: "it-software", label: "IT・ソフトウェア" },
  { id: "it-hardware", label: "IT・ハードウェア" },
  { id: "internet", label: "インターネット" },
  { id: "telecom", label: "通信" },
  { id: "game", label: "ゲーム" },
  // 金融
  { id: "banking", label: "銀行" },
  { id: "securities", label: "証券" },
  { id: "insurance", label: "保険" },
  { id: "credit", label: "クレジット・信販" },
  { id: "fintech", label: "フィンテック" },
  { id: "vc-pe", label: "VC・PE" },
  // コンサルティング・専門サービス
  { id: "consulting-strategy", label: "戦略コンサルティング" },
  { id: "consulting-it", label: "ITコンサルティング" },
  { id: "consulting-hr", label: "人事コンサルティング" },
  { id: "accounting", label: "会計・監査" },
  { id: "legal", label: "法律事務所" },
  { id: "research", label: "シンクタンク・調査" },
  // 製造業
  { id: "manufacturing-auto", label: "自動車・輸送機器" },
  { id: "manufacturing-electronics", label: "電機・精密機器" },
  { id: "manufacturing-chemical", label: "化学・素材" },
  { id: "manufacturing-food", label: "食品・飲料" },
  { id: "manufacturing-pharma", label: "製薬・バイオ" },
  { id: "manufacturing-machinery", label: "機械・重工業" },
  { id: "manufacturing-consumer", label: "消費財・日用品" },
  // 商社・流通・小売
  { id: "trading", label: "総合商社" },
  { id: "trading-specialized", label: "専門商社" },
  { id: "retail-general", label: "小売・百貨店" },
  { id: "retail-ec", label: "EC・通販" },
  { id: "logistics", label: "物流・倉庫" },
  // 建設・不動産
  { id: "construction", label: "建設・ゼネコン" },
  { id: "real-estate", label: "不動産" },
  { id: "real-estate-development", label: "不動産開発" },
  // メディア・広告・エンタメ
  { id: "media-tv", label: "テレビ・放送" },
  { id: "media-newspaper", label: "新聞・出版" },
  { id: "advertising", label: "広告代理店" },
  { id: "advertising-digital", label: "デジタルマーケティング" },
  { id: "entertainment", label: "エンターテインメント" },
  { id: "music", label: "音楽" },
  // 人材・教育
  { id: "hr-agency", label: "人材紹介・派遣" },
  { id: "education-school", label: "学校・教育機関" },
  { id: "education-edtech", label: "EdTech" },
  // 医療・ヘルスケア
  { id: "healthcare-hospital", label: "病院・医療機関" },
  { id: "healthcare-device", label: "医療機器" },
  { id: "healthcare-service", label: "ヘルスケアサービス" },
  // エネルギー・インフラ
  { id: "energy-electric", label: "電力・ガス" },
  { id: "energy-oil", label: "石油・エネルギー" },
  { id: "energy-renewable", label: "再生可能エネルギー" },
  { id: "infrastructure", label: "インフラ・公共" },
  // 旅行・ホスピタリティ
  { id: "travel", label: "旅行・観光" },
  { id: "hotel", label: "ホテル・宿泊" },
  { id: "restaurant", label: "外食・フードサービス" },
  // その他
  { id: "government", label: "官公庁・自治体" },
  { id: "npo", label: "NPO・NGO" },
  { id: "agriculture", label: "農業・林業・水産" },
  { id: "startup", label: "スタートアップ（業種問わず）" },
  { id: "other", label: "その他" },
]

interface ScoutSettings {
  enabled: boolean
  maxPerMonth: number
  selectedIndustries: string[]
  minCompanySize: number
  excludeKeywords: string[]
  requireJobDescription: boolean
  requireSalaryRange: boolean
}

export function EpochScoutSettings() {
  const { t } = useI18n()
  const { userId } = useAuth()
  const [saved, setSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<ScoutSettings>({
    enabled: true,
    maxPerMonth: 10,
    selectedIndustries: ["tech", "consulting"],
    minCompanySize: 50,
    excludeKeywords: ["営業", "テレアポ"],
    requireJobDescription: true,
    requireSalaryRange: false,
  })
  const [newKeyword, setNewKeyword] = useState("")

  useEffect(() => {
    if (!userId) {
      return
    }
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/epoch/settings/scout", {
          headers: undefined,
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || "スカウト設定の取得に失敗しました")
        }
        const data = (await response.json()) as { settings: ScoutSettings }
        if (data.settings) {
          setSettings(data.settings)
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "スカウト設定の取得に失敗しました"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  const handleSave = async () => {
    if (!userId) {
      setError("ログインが必要です")
      return
    }
    setIsSaving(true)
    setError(null)
    setSaved(false)
    try {
      const response = await fetch("/api/epoch/settings/scout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify(settings),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "スカウト設定の保存に失敗しました")
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      const message = err instanceof Error ? err.message : "スカウト設定の保存に失敗しました"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleIndustry = (industryId: string) => {
    setSettings(prev => ({
      ...prev,
      selectedIndustries: prev.selectedIndustries.includes(industryId)
        ? prev.selectedIndustries.filter(id => id !== industryId)
        : [...prev.selectedIndustries, industryId]
    }))
  }

  const addExcludeKeyword = () => {
    if (newKeyword.trim() && !settings.excludeKeywords.includes(newKeyword.trim())) {
      setSettings(prev => ({
        ...prev,
        excludeKeywords: [...prev.excludeKeywords, newKeyword.trim()]
      }))
      setNewKeyword("")
    }
  }

  const removeExcludeKeyword = (keyword: string) => {
    setSettings(prev => ({
      ...prev,
      excludeKeywords: prev.excludeKeywords.filter(k => k !== keyword)
    }))
  }

  return (
    <div className="space-y-6">
      {isLoading && (
        <div className="rounded border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          読み込み中...
        </div>
      )}
      {error && (
        <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-500">
          保存しました
        </div>
      )}
      {/* Scout Enable/Disable */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">スカウト受信</CardTitle>
          <CardDescription>
            スカウトメッセージの受信を許可するかどうか
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label htmlFor="scout-enabled">スカウトを受け取る</Label>
            <Switch
              id="scout-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings(prev => ({ ...prev, enabled: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {settings.enabled && (
        <>
          {/* Max scouts per month */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">月間受信上限</CardTitle>
              <CardDescription>
                1ヶ月に受け取るスカウトの最大数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">上限数</span>
                <span className="text-lg font-semibold">{settings.maxPerMonth}件/月</span>
              </div>
              <Slider
                value={[settings.maxPerMonth]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, maxPerMonth: value }))}
                min={1}
                max={50}
                step={1}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                上限に達した場合、新しいスカウトは翌月まで保留されます
              </p>
            </CardContent>
          </Card>

          {/* Industry filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">業種フィルター</CardTitle>
              <CardDescription>
                スカウトを受け取りたい業種を選択
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {industries.map((industry) => (
                  <div
                    key={industry.id}
                    className="flex items-center gap-2"
                  >
                    <Checkbox
                      id={industry.id}
                      checked={settings.selectedIndustries.includes(industry.id)}
                      onCheckedChange={() => toggleIndustry(industry.id)}
                    />
                    <Label htmlFor={industry.id} className="text-sm cursor-pointer">
                      {industry.label}
                    </Label>
                  </div>
                ))}
              </div>
              {settings.selectedIndustries.length === 0 && (
                <p className="text-sm text-amber-500 mt-3">
                  業種を1つも選択しない場合、すべての業種からスカウトを受け取ります
                </p>
              )}
            </CardContent>
          </Card>

          {/* Company size filter */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">企業規模</CardTitle>
              <CardDescription>
                最小従業員数を設定
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">最小従業員数</span>
                <span className="text-lg font-semibold">{settings.minCompanySize}人以上</span>
              </div>
              <Slider
                value={[settings.minCompanySize]}
                onValueChange={([value]) => setSettings(prev => ({ ...prev, minCompanySize: value }))}
                min={1}
                max={1000}
                step={10}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Exclude keywords */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">除外キーワード</CardTitle>
              <CardDescription>
                これらのキーワードを含むスカウトは自動的に除外されます
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {settings.excludeKeywords.map((keyword) => (
                  <Badge key={keyword} variant="secondary" className="gap-1">
                    {keyword}
                    <button
                      onClick={() => removeExcludeKeyword(keyword)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="キーワードを追加"
                  onKeyDown={(e) => e.key === "Enter" && addExcludeKeyword()}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={addExcludeKeyword}
                  disabled={!newKeyword.trim()}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Required conditions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">必須条件</CardTitle>
              <CardDescription>
                スカウトに含まれていなければならない情報
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-jd">職務内容の記載</Label>
                  <p className="text-sm text-muted-foreground">具体的な職務内容が記載されていること</p>
                </div>
                <Switch
                  id="require-jd"
                  checked={settings.requireJobDescription}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireJobDescription: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="require-salary">年収レンジの記載</Label>
                  <p className="text-sm text-muted-foreground">想定年収が明示されていること</p>
                </div>
                <Switch
                  id="require-salary"
                  checked={settings.requireSalaryRange}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, requireSalaryRange: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Save button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2" disabled={isSaving}>
          <Save className="h-4 w-4" />
          {isSaving ? "保存中..." : saved ? "保存しました" : "保存"}
        </Button>
      </div>
    </div>
  )
}
