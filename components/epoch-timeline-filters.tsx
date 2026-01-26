"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, CalendarIcon, Filter, X } from "@/components/icons"

export type RecordTypeFilter = "all" | "decision_made" | "decision_not_made" | "revised" | "period_of_silence" | "invited" | "declined"

interface TimelineFiltersProps {
  onFilterChange: (filters: {
    keyword: string
    recordType: RecordTypeFilter
    dateRange: { from: Date | undefined; to: Date | undefined }
  }) => void
  totalCount: number
  filteredCount: number
}

export function EpochTimelineFilters({ onFilterChange, totalCount, filteredCount }: TimelineFiltersProps) {
  const [keyword, setKeyword] = useState("")
  const [recordType, setRecordType] = useState<RecordTypeFilter>("all")
  const [dateFrom, setDateFrom] = useState<Date | undefined>()
  const [dateTo, setDateTo] = useState<Date | undefined>()
  const [isExpanded, setIsExpanded] = useState(false)

  const handleKeywordChange = (value: string) => {
    setKeyword(value)
    onFilterChange({
      keyword: value,
      recordType,
      dateRange: { from: dateFrom, to: dateTo },
    })
  }

  const handleTypeChange = (value: RecordTypeFilter) => {
    setRecordType(value)
    onFilterChange({
      keyword,
      recordType: value,
      dateRange: { from: dateFrom, to: dateTo },
    })
  }

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date)
    onFilterChange({
      keyword,
      recordType,
      dateRange: { from: date, to: dateTo },
    })
  }

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date)
    onFilterChange({
      keyword,
      recordType,
      dateRange: { from: dateFrom, to: date },
    })
  }

  const clearFilters = () => {
    setKeyword("")
    setRecordType("all")
    setDateFrom(undefined)
    setDateTo(undefined)
    onFilterChange({
      keyword: "",
      recordType: "all",
      dateRange: { from: undefined, to: undefined },
    })
  }

  const hasActiveFilters = keyword || recordType !== "all" || dateFrom || dateTo

  const recordTypeLabels: Record<RecordTypeFilter, string> = {
    all: "すべて",
    decision_made: "判断した",
    decision_not_made: "判断しなかった",
    revised: "改訂",
    period_of_silence: "沈黙期間",
    invited: "スカウト送信",
    declined: "スカウト辞退",
  }

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "2-digit", day: "2-digit" })
      .format(date)
      .replace(/\//g, "/")

  return (
    <div className="mb-6 space-y-3">
      {/* Compact filter bar */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="キーワード検索..."
            value={keyword}
            onChange={(e) => handleKeywordChange(e.target.value)}
            className="pl-9 h-9 bg-secondary border-border text-sm"
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`h-9 border-border bg-transparent ${hasActiveFilters ? "text-foreground" : "text-muted-foreground"}`}
        >
          <Filter className="h-4 w-4 mr-1.5" />
          フィルター
          {hasActiveFilters && (
            <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-foreground text-background text-xs">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            クリア
          </Button>
        )}

        <span className="text-xs text-muted-foreground ml-auto">
          {filteredCount === totalCount
            ? `${totalCount} records`
            : `${filteredCount} / ${totalCount} records`}
        </span>
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="flex flex-wrap items-center gap-3 p-4 bg-secondary/50 rounded-md border border-border">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Record種別</label>
            <Select value={recordType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-40 h-9 bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {Object.entries(recordTypeLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">開始日</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-36 h-9 justify-start font-normal bg-background border-border"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {dateFrom ? formatDate(dateFrom) : "選択..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={handleDateFromChange}
                  locale={ja}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">終了日</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-36 h-9 justify-start font-normal bg-background border-border"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {dateTo ? formatDate(dateTo) : "選択..."}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card border-border" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={handleDateToChange}
                  locale={ja}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="text-xs text-muted-foreground ml-auto pt-5">
            フィルターは内容を評価せず、時間・種別での絞り込みのみ行います
          </div>
        </div>
      )}
    </div>
  )
}
