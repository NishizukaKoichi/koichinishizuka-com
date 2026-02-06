"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Clock, Info } from "@/components/icons"
import { useAuth } from "@/lib/auth/context"

export function EpochSilenceSettings() {
  const { userId } = useAuth()
  const [days, setDays] = useState(7)
  const [enabled, setEnabled] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!userId) {
      return
    }
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/epoch/settings/silence", {
          headers: undefined,
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || "沈黙設定の取得に失敗しました")
        }
        const data = (await response.json()) as { settings: { days: number; autoGenerate: boolean } }
        setDays(data.settings?.days ?? 7)
        setEnabled(data.settings?.autoGenerate ?? true)
        setHasChanges(false)
      } catch (err) {
        const message = err instanceof Error ? err.message : "沈黙設定の取得に失敗しました"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  const handleDaysChange = (value: number[]) => {
    setDays(value[0])
    setHasChanges(true)
  }

  const handleEnabledChange = (value: boolean) => {
    setEnabled(value)
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!userId) {
      setError("ログインが必要です")
      return
    }
    setIsSaving(true)
    setError(null)
    setSaved(false)
    try {
      const response = await fetch("/api/epoch/settings/silence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({ days, autoGenerate: enabled }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "沈黙設定の保存に失敗しました")
      }
      setHasChanges(false)
      setSaved(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "沈黙設定の保存に失敗しました"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="border border-border bg-card p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Clock className="h-5 w-5 text-foreground" />
        <div>
          <h3 className="text-base font-medium text-foreground">沈黙期間の自動記録</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            一定期間Recordがない場合、自動でperiod_of_silenceを生成します
          </p>
        </div>
      </div>

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
        {/* Enable/Disable */}
        <div className="flex items-center justify-between">
          <Label htmlFor="auto-silence" className="text-sm text-foreground">
            自動生成を有効にする
          </Label>
          <Switch id="auto-silence" checked={enabled} onCheckedChange={handleEnabledChange} />
        </div>

        {/* Days slider */}
        <div className={`space-y-4 ${!enabled ? "opacity-50 pointer-events-none" : ""}`}>
          <div className="flex items-center justify-between">
            <Label className="text-sm text-foreground">沈黙期間の閾値</Label>
            <span className="text-sm font-mono text-foreground">{days}日</span>
          </div>
          <Slider value={[days]} onValueChange={handleDaysChange} min={1} max={30} step={1} className="w-full" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1日</span>
            <span>30日</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 bg-muted/30 border border-border">
          <Info className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground space-y-2">
            <p>
              <strong className="text-foreground">{days}日</strong>以上Recordが作成されない場合、
              自動的にperiod_of_silence Recordが生成されます。
            </p>
            <p>
              この設定は「何も記録しなかった」という事実自体を記録するためのものです。
              沈黙も履歴の一部として保存されます。
            </p>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end pt-4 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className="bg-foreground text-background hover:bg-foreground/90"
        >
          {isSaving ? "保存中..." : "設定を保存"}
        </Button>
      </div>
    </div>
  )
}
