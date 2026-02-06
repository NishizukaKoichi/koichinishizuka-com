"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { 
  ArrowRight, 
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  XCircle
} from "@/components/icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
}

type TransitionView = {
  id: string
  employeeId: string
  employeeName: string
  role: string
  from: PactState
  to: PactState
  date: string
  triggeredBy: string
}

const stateConfig: Record<PactState, { color: string; bg: string; icon: typeof TrendingUp }> = {
  growth: { color: "text-green-500", bg: "bg-green-500/10", icon: TrendingUp },
  stable: { color: "text-blue-500", bg: "bg-blue-500/10", icon: Minus },
  warning: { color: "text-yellow-500", bg: "bg-yellow-500/10", icon: AlertTriangle },
  critical: { color: "text-red-500", bg: "bg-red-500/10", icon: TrendingDown },
  exit: { color: "text-gray-500", bg: "bg-gray-500/10", icon: XCircle },
}

type TransitionType = "all" | "positive" | "negative"

export default function TransitionsPage() {
  const { userId } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<TransitionType>("all")
  const [transitions, setTransitions] = useState<TransitionView[]>([])
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
        const [transitionRes, employeeRes] = await Promise.all([
          fetch("/api/v1/pact/transitions", { headers }),
          fetch("/api/v1/pact/employees", { headers }),
        ])

        if (!transitionRes.ok) {
          throw new Error("遷移履歴の取得に失敗しました")
        }
        if (!employeeRes.ok) {
          throw new Error("被雇用者の取得に失敗しました")
        }

        const transitionData = (await transitionRes.json()) as { transitions: Transition[] }
        const employeeData = (await employeeRes.json()) as { employees: Employee[] }

        const employeeMap = new Map(
          (employeeData.employees ?? []).map((employee) => [
            employee.employeeId,
            employee,
          ])
        )

        const mapped: TransitionView[] = (transitionData.transitions ?? []).map((transition) => {
          const employee = employeeMap.get(transition.employeeId)
          const triggeredBy = transition.ruleRef
            ? `rule:${transition.ruleRef}`
            : `${transition.windowStart} → ${transition.windowEnd}`

          return {
            id: transition.transitionId,
            employeeId: transition.employeeId,
            employeeName: employee?.displayName ?? transition.employeeId,
            role: employee?.roleId ?? "role:unknown",
            from: transition.fromState,
            to: transition.toState,
            date: transition.triggeredAt.split("T")[0],
            triggeredBy,
          }
        })

        if (!cancelled) {
          setTransitions(mapped)
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

  const filteredTransitions = useMemo(() => {
    const rank: Record<PactState, number> = {
      growth: 2,
      stable: 1,
      warning: 0,
      critical: -1,
      exit: -2,
    }

    return transitions.filter((tr) => {
      const matchesSearch =
        tr.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tr.role.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (typeFilter === "positive") {
        return rank[tr.to] > rank[tr.from]
      }
      if (typeFilter === "negative") {
        return rank[tr.to] < rank[tr.from]
      }
      return true
    })
  }, [transitions, searchQuery, typeFilter])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">状態遷移履歴</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          すべての状態遷移の記録
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="名前または役割で検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransitionType)}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="種類" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">すべて</SelectItem>
            <SelectItem value="positive">上昇遷移</SelectItem>
            <SelectItem value="negative">下降遷移</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transitions List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">遷移履歴</CardTitle>
          <CardDescription>
            {loading ? "読み込み中..." : `${filteredTransitions.length}件の遷移`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-sm text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              {filteredTransitions.map((transition) => {
                const fromState = stateConfig[transition.from]
                const toState = stateConfig[transition.to]
                const FromIcon = fromState.icon
                const ToIcon = toState.icon

                return (
                  <div 
                    key={transition.id}
                    className="p-4 rounded-md border border-border hover:border-violet-500/50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="text-sm text-muted-foreground w-24 shrink-0">
                          {transition.date}
                        </div>
                        <div>
                          <Link 
                            href={`/pact/employees/${transition.employeeId}`}
                            className="font-medium hover:text-violet-500 transition-colors"
                          >
                            {transition.employeeName}
                          </Link>
                          <p className="text-sm text-muted-foreground">{transition.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`gap-1 ${fromState.color}`}>
                          <FromIcon className="h-3 w-3" />
                          {transition.from}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className={`gap-1 ${toState.color}`}>
                          <ToIcon className="h-3 w-3" />
                          {transition.to}
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-3 pl-28 sm:pl-28">
                      <p className="text-sm text-muted-foreground">
                        {transition.triggeredBy}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
