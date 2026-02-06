"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { FileText, Download, Send, Calendar, User, Briefcase, Target, AlertCircle, ArrowRight } from "@/components/icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth/context"

type PactReport = {
  reportId: string
  employeeId: string
  periodStart: string
  periodEnd: string
  content: Record<string, unknown>
  createdAt: string
  deliveredAt?: string
}

type Employee = {
  employeeId: string
  displayName: string
  roleId: string
  hiredAt: string
}

type ReportType = "salary_adjustment" | "role_continuation" | "pact_report"

type ReportContent = {
  roleDefinition: string
  evaluationPeriod: string
  continuationConditions: string[]
  costEffectivenessNegativePoint: string
  costEffectivenessReason: string
  unmetMetrics: { name: string; threshold: string; actual: string; gap: string }[]
  improvementConditions: string[]
  strengths: string[]
  reemploymentSummary: string
}

const reportTypeConfig: Record<ReportType, { label: string; badge: string }> = {
  salary_adjustment: { label: "Salary Adjustment Notice", badge: "text-green-500" },
  role_continuation: { label: "Role Continuation Notice", badge: "text-blue-500" },
  pact_report: { label: "Pact Report", badge: "text-red-500" },
}

export default function PactReportDetailPage() {
  const params = useParams()
  const reportId = params.reportId as string
  const { userId } = useAuth()
  const [report, setReport] = useState<PactReport | null>(null)
  const [employee, setEmployee] = useState<Employee | null>(null)
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
        const reportRes = await fetch(`/api/v1/pact/reports/${reportId}`, {
          headers: undefined,
        })
        if (!reportRes.ok) {
          throw new Error("レポートの取得に失敗しました")
        }
        const reportData = (await reportRes.json()) as { report: PactReport }

        const employeeRes = await fetch(`/api/v1/pact/employees/${reportData.report.employeeId}`, {
          headers: undefined,
        })
        const employeeData = employeeRes.ok
          ? ((await employeeRes.json()) as { employee: Employee })
          : null

        if (!cancelled) {
          setReport(reportData.report)
          setEmployee(employeeData?.employee ?? null)
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
  }, [reportId, userId])

  const reportType: ReportType = useMemo(() => {
    const latestState =
      report && typeof report.content?.latestState === "string"
        ? (report.content.latestState as string)
        : "stable"
    if (latestState === "growth") return "salary_adjustment"
    if (latestState === "exit") return "pact_report"
    return "role_continuation"
  }, [report])

  const normalizedContent: ReportContent | null = useMemo(() => {
    if (!report) return null
    const content = report.content ?? {}
    return {
      roleDefinition:
        typeof content.roleDefinition === "string"
          ? content.roleDefinition
          : `role:${employee?.roleId ?? "unknown"}`,
      evaluationPeriod:
        typeof content.evaluationPeriod === "string"
          ? content.evaluationPeriod
          : `${report.periodStart} 〜 ${report.periodEnd}`,
      continuationConditions: Array.isArray(content.continuationConditions)
        ? (content.continuationConditions as string[])
        : ["未設定"],
      costEffectivenessNegativePoint:
        typeof content.costEffectivenessNegativePoint === "string"
          ? content.costEffectivenessNegativePoint
          : "未設定",
      costEffectivenessReason:
        typeof content.costEffectivenessReason === "string"
          ? content.costEffectivenessReason
          : "未設定",
      unmetMetrics: Array.isArray(content.unmetMetrics)
        ? (content.unmetMetrics as ReportContent["unmetMetrics"])
        : [],
      improvementConditions: Array.isArray(content.improvementConditions)
        ? (content.improvementConditions as string[])
        : ["未設定"],
      strengths: Array.isArray(content.strengths)
        ? (content.strengths as string[])
        : ["未設定"],
      reemploymentSummary:
        typeof content.reemploymentSummary === "string"
          ? content.reemploymentSummary
          : "未設定",
    }
  }, [report, employee])

  if (loading) {
    return <div className="text-sm text-muted-foreground">読み込み中...</div>
  }

  if (error || !report || !normalizedContent) {
    return <div className="text-sm text-red-500">{error ?? "レポートが見つかりません"}</div>
  }

  const typeConfig = reportTypeConfig[reportType]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className={typeConfig.badge}>
              {typeConfig.label}
            </Badge>
            <Badge variant="outline">
              {report.deliveredAt ? "送信済み" : "生成済み"}
            </Badge>
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            {reportType === "pact_report" ? "契約終了レポート" : "レポート詳細"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            生成日: {report.createdAt.split("T")[0]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            PDF出力
          </Button>
          <Button className="gap-2 bg-violet-500 hover:bg-violet-600 text-white">
            <Send className="h-4 w-4" />
            送信
          </Button>
        </div>
      </div>

      {/* Employee Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">被雇用者</p>
                <p className="font-medium">{employee?.displayName ?? report.employeeId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">役割</p>
                <p className="font-medium">{employee?.roleId ?? "role:unknown"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">部門</p>
                <p className="font-medium">未設定</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">入社日</p>
                <p className="font-medium">{employee?.hiredAt?.split("T")[0] ?? "未設定"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Role Definition */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">役割定義と評価期間</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-foreground">{normalizedContent.roleDefinition}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>評価期間: {normalizedContent.evaluationPeriod}</span>
          </div>
        </CardContent>
      </Card>

      {/* Continuation Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">継続雇用が成立していた条件</CardTitle>
          <CardDescription>以下の条件を満たしていれば、契約は継続されていた</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {normalizedContent.continuationConditions.map((condition, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground">・</span>
                <span>{condition}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Cost Effectiveness */}
      <Card className="border-orange-500/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-orange-500" />
            費用対効果がマイナスに転じた時点
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium mb-2">{normalizedContent.costEffectivenessNegativePoint}</p>
          <p className="text-sm text-muted-foreground">{normalizedContent.costEffectivenessReason}</p>
        </CardContent>
      </Card>

      {/* Unmet Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">未達だった指標と閾値</CardTitle>
        </CardHeader>
        <CardContent>
          {normalizedContent.unmetMetrics.length === 0 ? (
            <p className="text-sm text-muted-foreground">未設定</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 font-medium">指標</th>
                    <th className="text-right py-2 font-medium">閾値</th>
                    <th className="text-right py-2 font-medium">実績</th>
                    <th className="text-right py-2 font-medium text-red-500">差分</th>
                  </tr>
                </thead>
                <tbody>
                  {normalizedContent.unmetMetrics.map((metric, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3">{metric.name}</td>
                      <td className="py-3 text-right text-muted-foreground">{metric.threshold}</td>
                      <td className="py-3 text-right">{metric.actual}</td>
                      <td className="py-3 text-right text-red-500">{metric.gap}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Improvement Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">改善によって継続可能だった条件</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {normalizedContent.improvementConditions.map((condition, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-muted-foreground">・</span>
                <span>{condition}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Separator />

      {/* Strengths - Next World Line */}
      <Card className="border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ArrowRight className="h-4 w-4 text-blue-500" />
            他環境で強みとなり得る要素
          </CardTitle>
          <CardDescription>次の世界線への提示</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 mb-6">
            {normalizedContent.strengths.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-blue-500">・</span>
                <span>{strength}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Reemployment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">再就職時に利用可能な要約</CardTitle>
          <CardDescription>被雇用者本人が外部に提示できる内容</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">
            {normalizedContent.reemploymentSummary}
          </p>
        </CardContent>
      </Card>

      {/* Footer note */}
      <div className="text-xs text-muted-foreground border-t border-border pt-6">
        <p className="mb-2">
          本レポートはPact仕様に基づいて自動生成されました。人格評価、断定的非難、感情的表現は含まれていません。
        </p>
        <p>
          被雇用者本人は、本レポートの全内容への閲覧権を持ちます。
        </p>
      </div>
    </div>
  )
}
