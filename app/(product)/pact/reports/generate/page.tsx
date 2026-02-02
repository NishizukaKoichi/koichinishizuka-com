"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  User,
  Target,
  TrendingDown,
  Lightbulb,
  ArrowRight,
} from "@/components/icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/lib/auth/context"

type PactState = "growth" | "stable" | "warning" | "critical" | "exit"

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

type Employee = {
  employeeId: string
  displayName: string
  roleId: string
  status: "active" | "exit"
  hiredAt: string
  exitedAt?: string
}

type EligibleEmployee = {
  id: string
  name: string
  role: string
  state: PactState
  daysInState: number
}

// Report sections as per spec
const reportSections = [
  { id: "role_definition", title: "役割定義と評価期間", icon: User },
  { id: "continuation_conditions", title: "継続雇用が成立していた条件", icon: CheckCircle2 },
  { id: "cost_effectiveness", title: "費用対効果がマイナスに転じた時点", icon: TrendingDown },
  { id: "unmet_metrics", title: "未達だった指標と閾値", icon: Target },
  { id: "improvement_path", title: "改善によって継続可能だった条件", icon: ArrowRight },
  { id: "strengths", title: "他環境で強みとなり得る要素", icon: Lightbulb },
  { id: "summary", title: "再就職時に利用可能な要約", icon: FileText },
]

export default function GenerateReportPage() {
  const router = useRouter()
  const { userId } = useAuth()
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [step, setStep] = useState(1)
  const [generating, setGenerating] = useState(false)
  const [eligibleEmployees, setEligibleEmployees] = useState<EligibleEmployee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [periodStart, setPeriodStart] = useState(() => {
    const now = new Date()
    const start = new Date(now)
    start.setDate(now.getDate() - 30)
    return start.toISOString().slice(0, 10)
  })
  const [periodEnd, setPeriodEnd] = useState(() => new Date().toISOString().slice(0, 10))

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
        const headers = { "x-user-id": userId }
        const [employeesRes, transitionsRes] = await Promise.all([
          fetch("/api/v1/pact/employees", { headers }),
          fetch("/api/v1/pact/transitions", { headers }),
        ])

        if (!employeesRes.ok) {
          throw new Error("被雇用者の取得に失敗しました")
        }
        if (!transitionsRes.ok) {
          throw new Error("遷移履歴の取得に失敗しました")
        }

        const employeesData = (await employeesRes.json()) as { employees: Employee[] }
        const transitionsData = (await transitionsRes.json()) as { transitions: Transition[] }

        const latestTransitionByEmployee = new Map<string, Transition>()
        ;(transitionsData.transitions ?? []).forEach((transition) => {
          const existing = latestTransitionByEmployee.get(transition.employeeId)
          if (!existing || new Date(transition.triggeredAt) > new Date(existing.triggeredAt)) {
            latestTransitionByEmployee.set(transition.employeeId, transition)
          }
        })

        const now = Date.now()
        const eligible = (employeesData.employees ?? [])
          .map((employee) => {
            const latest = latestTransitionByEmployee.get(employee.employeeId)
            let state: PactState = "stable"
            if (latest) {
              state = latest.toState
            } else if (employee.status === "exit") {
              state = "exit"
            }

            const since = latest?.triggeredAt ?? employee.exitedAt ?? employee.hiredAt
            const daysInState = Math.max(
              0,
              Math.floor((now - new Date(since).getTime()) / (1000 * 60 * 60 * 24))
            )

            return {
              id: employee.employeeId,
              name: employee.displayName,
              role: employee.roleId,
              state,
              daysInState,
            }
          })
          .filter((emp) => emp.state === "critical" || emp.state === "exit")

        if (!cancelled) {
          setEligibleEmployees(eligible)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "データ取得に失敗しました")
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [userId])

  const employee = useMemo(
    () => eligibleEmployees.find((e) => e.id === selectedEmployee),
    [eligibleEmployees, selectedEmployee]
  )

  const handleGenerate = async () => {
    if (!selectedEmployee || !periodStart || !periodEnd) return
    setGenerating(true)
    try {
      const headers = { "Content-Type": "application/json", "x-user-id": userId ?? "" }
      const res = await fetch("/api/v1/pact/reports/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({
          employee_id: selectedEmployee,
          period_start: new Date(periodStart).toISOString(),
          period_end: new Date(periodEnd).toISOString(),
        }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error ?? "レポート生成に失敗しました")
      }
      const data = (await res.json()) as { report: { reportId: string } }
      router.push(`/pact/reports/${data.report.reportId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "レポート生成に失敗しました")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Pact Report 生成</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          契約終了レポートを生成します
        </p>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      {/* Warning */}
      <Alert variant="destructive" className="border-yellow-500/50 bg-yellow-500/10">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <AlertTitle className="text-yellow-500">重要な確認事項</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          Pact Reportは契約終了の公式文書です。生成前に以下を確認してください：
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li>被雇用者が Critical または Exit 状態であること</li>
            <li>すべての指標データが最新であること</li>
            <li>法務部門への事前確認が完了していること</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Step 1: Select Employee */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 1: 対象者の選択</CardTitle>
            <CardDescription>
              Critical または Exit 状態の被雇用者のみ選択可能です
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>対象者</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="被雇用者を選択" />
                </SelectTrigger>
                <SelectContent>
                  {loading && (
                    <SelectItem value="loading" disabled>
                      読み込み中...
                    </SelectItem>
                  )}
                  {!loading && eligibleEmployees.length === 0 && (
                    <SelectItem value="empty" disabled>
                      対象者がいません
                    </SelectItem>
                  )}
                  {eligibleEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      <div className="flex items-center gap-2">
                        <span>{emp.name}</span>
                        <Badge
                          variant="outline"
                          className={emp.state === "exit" ? "text-gray-500" : "text-red-500"}
                        >
                          {emp.state}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {employee && (
              <div className="p-4 rounded-md bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">役割</span>
                  <span className="text-sm">{employee.role}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">現在の状態</span>
                  <Badge variant="outline" className={employee.state === "exit" ? "text-gray-500" : "text-red-500"}>
                    {employee.state}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">状態継続日数</span>
                  <span className="text-sm">{employee.daysInState}日</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>評価期間開始</Label>
                <Input
                  type="date"
                  value={periodStart}
                  onChange={(event) => setPeriodStart(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>評価期間終了</Label>
                <Input
                  type="date"
                  value={periodEnd}
                  onChange={(event) => setPeriodEnd(event.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                onClick={() => setStep(2)}
                disabled={!selectedEmployee || !periodStart || !periodEnd}
                className="bg-violet-500 hover:bg-violet-600 text-white"
              >
                次へ
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Review Sections */}
      {step === 2 && employee && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Step 2: レポート構成の確認</CardTitle>
            <CardDescription>
              以下のセクションが自動生成されます（仕様に基づく必須項目）
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {reportSections.map((section, index) => {
                const Icon = section.icon
                return (
                  <div
                    key={section.id}
                    className="flex items-center gap-3 p-3 rounded-md border border-border"
                  >
                    <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
                    <Icon className="h-4 w-4 text-violet-500" />
                    <span className="text-sm">{section.title}</span>
                    <CheckCircle2 className="ml-auto h-4 w-4 text-green-500" />
                  </div>
                )
              })}
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>禁止事項</AlertTitle>
              <AlertDescription className="text-sm">
                レポートには以下を含めることが禁止されています：
                人格評価、断定的非難、感情的表現、主語が「あなた」の文章
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>追加メモ（任意、社内用）</Label>
              <Textarea
                placeholder="法務確認済み、HR承認済みなどの社内メモを入力..."
                className="min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(1)} className="bg-transparent">
                戻る
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="bg-violet-500 hover:bg-violet-600 text-white"
              >
                {generating ? "生成中..." : "レポート生成"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
