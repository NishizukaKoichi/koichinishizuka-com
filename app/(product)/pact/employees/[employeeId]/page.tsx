"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { TrendingUp, Minus, AlertTriangle, AlertCircle, LogOut, FileText, Calendar, Target, Clock } from "@/components/icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/lib/auth/context"

type PactState = "growth" | "stable" | "warning" | "critical" | "exit"

type Employee = {
  employeeId: string
  roleId: string
  status: "active" | "exit"
  hiredAt: string
  exitedAt?: string
  createdAt: string
  displayName: string
}

type LedgerEntry = {
  entryId: string
  employeeId: string
  metricKey: string
  metricValue: number
  metricUnit?: string
  periodStart: string
  periodEnd: string
  recordedAt: string
  source: "system" | "import" | "api"
}

type Transition = {
  transitionId: string
  employeeId: string
  fromState: PactState
  toState: PactState
  windowStart: string
  windowEnd: string
  triggeredAt: string
  ruleRef: string
}

type Threshold = {
  thresholdId: string
  roleId: string
  periodDays: number
  minThreshold: number
  warningThreshold: number
  criticalThreshold: number
  growthThreshold: number
  effectiveAt: string
  endedAt?: string
  createdAt: string
}

type MetricView = {
  name: string
  current: number
  threshold: number
  upperThreshold: number
  trend: "up" | "down" | "stable"
}

type StateHistory = {
  date: string
  from: string
  to: string
  reason: string
}

const stateConfig: Record<PactState, { icon: typeof TrendingUp; color: string; bg: string; label: string }> = {
  growth: { icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", label: "Growth（昇給候補）" },
  stable: { icon: Minus, color: "text-blue-500", bg: "bg-blue-500/10", label: "Stable（維持）" },
  warning: { icon: AlertTriangle, color: "text-yellow-500", bg: "bg-yellow-500/10", label: "Warning（警告）" },
  critical: { icon: AlertCircle, color: "text-orange-500", bg: "bg-orange-500/10", label: "Critical（危機）" },
  exit: { icon: LogOut, color: "text-red-500", bg: "bg-red-500/10", label: "Exit（契約終了）" },
}

export default function EmployeeDetailPage() {
  const params = useParams()
  const employeeId = params.employeeId as string
  const { userId } = useAuth()

  const [employee, setEmployee] = useState<Employee | null>(null)
  const [ledger, setLedger] = useState<LedgerEntry[]>([])
  const [transitions, setTransitions] = useState<Transition[]>([])
  const [threshold, setThreshold] = useState<Threshold | null>(null)
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
        const headers = { }
        const [employeeRes, ledgerRes, transitionRes] = await Promise.all([
          fetch(`/api/v1/pact/employees/${employeeId}`, { headers }),
          fetch(`/api/v1/pact/ledger?employee_id=${encodeURIComponent(employeeId)}`, { headers }),
          fetch(`/api/v1/pact/transitions?employee_id=${encodeURIComponent(employeeId)}`, { headers }),
        ])

        if (!employeeRes.ok) {
          throw new Error("被雇用者の取得に失敗しました")
        }
        if (!ledgerRes.ok) {
          throw new Error("Ledgerの取得に失敗しました")
        }
        if (!transitionRes.ok) {
          throw new Error("遷移履歴の取得に失敗しました")
        }

        const employeeData = (await employeeRes.json()) as { employee: Employee }
        const ledgerData = (await ledgerRes.json()) as { ledger: LedgerEntry[] }
        const transitionData = (await transitionRes.json()) as { transitions: Transition[] }

        let fetchedThreshold: Threshold | null = null
        if (employeeData.employee?.roleId) {
          const thresholdRes = await fetch(`/api/v1/pact/thresholds/${employeeData.employee.roleId}`, { headers })
          if (thresholdRes.ok) {
            const thresholdData = (await thresholdRes.json()) as { thresholds: Threshold[] }
            fetchedThreshold =
              thresholdData.thresholds.find((item) => !item.endedAt) ??
              thresholdData.thresholds[0] ??
              null
          }
        }

        if (!cancelled) {
          setEmployee(employeeData.employee)
          setLedger(ledgerData.ledger ?? [])
          setTransitions(transitionData.transitions ?? [])
          setThreshold(fetchedThreshold)
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
  }, [employeeId, userId])

  const latestTransition = transitions[0]
  const currentState = latestTransition?.toState ?? "stable"
  const config = stateConfig[currentState]
  const Icon = config.icon

  const thresholds = useMemo(() => {
    return {
      minimum: threshold?.minThreshold ?? 0,
      warning: threshold?.warningThreshold ?? 0,
      critical: threshold?.criticalThreshold ?? 0,
      upper: threshold?.growthThreshold ?? 0,
    }
  }, [threshold])

  const metrics = useMemo<MetricView[]>(() => {
    const grouped = new Map<string, LedgerEntry[]>()
    ledger.forEach((entry) => {
      const items = grouped.get(entry.metricKey) ?? []
      items.push(entry)
      grouped.set(entry.metricKey, items)
    })

    return Array.from(grouped.entries()).map(([metricKey, entries]) => {
      const sorted = [...entries].sort((a, b) => b.recordedAt.localeCompare(a.recordedAt))
      const latest = sorted[0]
      const previous = sorted[1]
      const trend = previous
        ? latest.metricValue > previous.metricValue
          ? "up"
          : latest.metricValue < previous.metricValue
          ? "down"
          : "stable"
        : "stable"

      return {
        name: metricKey,
        current: latest.metricValue,
        threshold: thresholds.minimum,
        upperThreshold: thresholds.upper,
        trend,
      }
    })
  }, [ledger, thresholds.minimum, thresholds.upper])

  const stateHistory = useMemo<StateHistory[]>(() => {
    return transitions.map((transition) => ({
      date: transition.triggeredAt.split("T")[0],
      from: transition.fromState,
      to: transition.toState,
      reason: transition.ruleRef ? `rule:${transition.ruleRef}` : "state transition",
    }))
  }, [transitions])

  const currentPeriodStart = latestTransition?.windowStart ?? ledger[0]?.periodStart ?? "-"
  const nextReview = latestTransition?.windowEnd ?? ledger[0]?.periodEnd ?? "-"

  if (loading) {
    return <div className="text-sm text-muted-foreground">読み込み中...</div>
  }

  if (error || !employee) {
    return <div className="text-sm text-red-500">{error ?? "被雇用者が見つかりません"}</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">{employee.displayName}</h1>
            <Badge variant="secondary" className={`gap-1 ${config.color}`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
          <p className="text-muted-foreground">{employee.roleId}</p>
        </div>
        <Link href={`/pact/reports/new?employee=${employeeId}`}>
          <Button variant="outline" className="gap-2 bg-transparent">
            <FileText className="h-4 w-4" />
            レポート生成
          </Button>
        </Link>
      </div>

      {/* Key Info */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              <span className="text-xs">入社日</span>
            </div>
            <p className="font-medium">{employee.hiredAt.split("T")[0]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              <span className="text-xs">評価期間開始</span>
            </div>
            <p className="font-medium">{currentPeriodStart}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              <span className="text-xs">次回評価</span>
            </div>
            <p className="font-medium">{nextReview}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <span className="text-xs">現在の報酬レンジ</span>
            </div>
            <p className="font-medium">未設定</p>
          </CardContent>
        </Card>
      </div>

      {/* Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">指標（Ledger Layer）</CardTitle>
          <CardDescription>役割に定義された指標と現在値</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {metrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">指標が登録されていません</p>
          ) : (
            metrics.map((metric) => (
              <div key={metric.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{metric.name}</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      metric.current >= metric.upperThreshold ? "text-green-500" :
                      metric.current >= metric.threshold ? "text-blue-500" :
                      metric.current >= thresholds.warning ? "text-yellow-500" :
                      "text-orange-500"
                    }`}>
                      {metric.current}%
                    </span>
                    {metric.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                    {metric.trend === "down" && <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />}
                    {metric.trend === "stable" && <Minus className="h-3 w-3 text-muted-foreground" />}
                  </div>
                </div>
                <div className="relative">
                  <Progress value={metric.current} className="h-2" />
                  {/* Threshold markers */}
                  <div 
                    className="absolute top-0 h-2 w-0.5 bg-red-500" 
                    style={{ left: `${thresholds.critical}%` }}
                    title={`危機閾値: ${thresholds.critical}%`}
                  />
                  <div 
                    className="absolute top-0 h-2 w-0.5 bg-yellow-500" 
                    style={{ left: `${thresholds.warning}%` }}
                    title={`警告閾値: ${thresholds.warning}%`}
                  />
                  <div 
                    className="absolute top-0 h-2 w-0.5 bg-blue-500" 
                    style={{ left: `${metric.threshold}%` }}
                    title={`最低維持閾値: ${metric.threshold}%`}
                  />
                  <div 
                    className="absolute top-0 h-2 w-0.5 bg-green-500" 
                    style={{ left: `${metric.upperThreshold}%` }}
                    title={`上位達成閾値: ${metric.upperThreshold}%`}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>危機: {thresholds.critical}%</span>
                  <span>警告: {thresholds.warning}%</span>
                  <span>維持: {metric.threshold}%</span>
                  <span>上位: {metric.upperThreshold}%</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* State History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">状態遷移履歴</CardTitle>
          <CardDescription>過去の状態変化と理由</CardDescription>
        </CardHeader>
        <CardContent>
          {stateHistory.length === 0 ? (
            <p className="text-sm text-muted-foreground">遷移履歴はまだありません</p>
          ) : (
            <div className="space-y-3">
              {stateHistory.map((history, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="text-xs text-muted-foreground w-20">{history.date}</div>
                  <div>
                    <p className="text-sm">
                      {history.from} → {history.to}
                    </p>
                    <p className="text-xs text-muted-foreground">{history.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
