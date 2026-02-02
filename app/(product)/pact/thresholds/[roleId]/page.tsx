"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Settings, Save, Plus, Trash2, AlertTriangle } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert"
import { useI18n } from "@/lib/i18n/context"
import { usePactStore, type MetricDefinition, type DataSourceType, type RoleConfig } from "@/lib/pact/store"

export default function ThresholdEditPage() {
  const params = useParams()
  const roleId = params.roleId as string
  
  const { roleConfigs } = usePactStore()
  const roleConfig = roleConfigs.find(r => r.id === roleId)
  
  if (!roleConfig) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        役割が見つかりません
      </div>
    )
  }

  return <ThresholdEditor key={roleConfig.id} roleId={roleId} roleConfig={roleConfig} />
}

function ThresholdEditor({ roleId, roleConfig }: { roleId: string; roleConfig: RoleConfig }) {
  const { t } = useI18n()
  const router = useRouter()
  const { updateRoleConfig } = usePactStore()
  const [roleName, setRoleName] = useState(roleConfig.roleName)
  const [department, setDepartment] = useState(roleConfig.department)
  const [metrics, setMetrics] = useState<MetricDefinition[]>(roleConfig.metrics)
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    setSaving(true)
    updateRoleConfig(roleId, {
      roleName,
      department,
      metrics,
    })
    setTimeout(() => {
      router.push("/pact/thresholds")
    }, 300)
  }

  const addMetric = () => {
    setMetrics([
      ...metrics,
      {
        id: `metric-${Date.now()}`,
        name: "",
        unit: "",
        description: "",
        dataSourceType: "manual_admin" as DataSourceType,
        dataSourceName: "",
        weight: 0,
        thresholds: { growth: 100, stable: 80, warning: 60, critical: 40 },
        direction: "higher_is_better" as const,
      },
    ])
  }

  const removeMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index))
  }

  const updateMetric = (index: number, field: "name" | "weight", value: string | number) => {
    setMetrics(
      metrics.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    )
  }

  const updateThreshold = (
    index: number,
    key: keyof MetricDefinition["thresholds"],
    value: number
  ) => {
    setMetrics(
      metrics.map((m, i) =>
        i === index
          ? { ...m, thresholds: { ...m.thresholds, [key]: value } }
          : m
      )
    )
  }

  const totalWeight = metrics.reduce((sum, m) => sum + m.weight, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            閾値を編集
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            状態遷移の判定基準を設定します
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="bg-transparent"
          >
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || totalWeight !== 100}
            className="bg-violet-500 hover:bg-violet-600 text-white gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      {totalWeight !== 100 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            重みの合計が100%になるように調整してください（現在: {totalWeight}%）
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>役割名</Label>
              <Input
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="役割名を入力"
              />
            </div>
            <div className="space-y-2">
              <Label>部署</Label>
              <Input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="部署名を入力"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            評価指標と閾値
          </CardTitle>
          <CardDescription>
            各状態への遷移条件を数値で定義します（重み合計: {totalWeight}%）
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {metrics.map((metric, index) => (
            <div key={index} className="p-4 rounded-lg border border-border space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="secondary">指標 {index + 1}</Badge>
                {metrics.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeMetric(index)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>指標名</Label>
                  <Input
                    value={metric.name}
                    onChange={(e) => updateMetric(index, "name", e.target.value)}
                    placeholder="例: タスク完了数"
                  />
                </div>
                <div className="space-y-2">
                  <Label>重み (%)</Label>
                  <Input
                    type="number"
                    value={metric.weight}
                    onChange={(e) => updateMetric(index, "weight", Number(e.target.value))}
                    min={0}
                    max={100}
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                <div className="space-y-2">
                  <Label className="text-green-500 text-xs">Growth</Label>
                  <Input
                    type="number"
                    value={metric.thresholds.growth}
                    onChange={(e) => updateThreshold(index, "growth", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-500 text-xs">Stable</Label>
                  <Input
                    type="number"
                    value={metric.thresholds.stable}
                    onChange={(e) => updateThreshold(index, "stable", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-yellow-500 text-xs">Warning</Label>
                  <Input
                    type="number"
                    value={metric.thresholds.warning}
                    onChange={(e) => updateThreshold(index, "warning", Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-orange-500 text-xs">Critical</Label>
                  <Input
                    type="number"
                    value={metric.thresholds.critical}
                    onChange={(e) => updateThreshold(index, "critical", Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            onClick={addMetric}
            className="w-full gap-2 bg-transparent"
          >
            <Plus className="h-4 w-4" />
            指標を追加
          </Button>
        </CardContent>
      </Card>

      {/* State Transition Explanation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">状態遷移ルール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p><span className="text-green-500 font-medium">Growth:</span> 閾値を上回ると昇給候補として判定</p>
          <p><span className="text-blue-500 font-medium">Stable:</span> 閾値を満たすと現状維持として判定</p>
          <p><span className="text-yellow-500 font-medium">Warning:</span> 閾値を下回ると警告状態に遷移</p>
          <p><span className="text-orange-500 font-medium">Critical:</span> 閾値を下回ると危機状態に遷移（次の世界線の提示が必要）</p>
        </CardContent>
      </Card>
    </div>
  )
}
