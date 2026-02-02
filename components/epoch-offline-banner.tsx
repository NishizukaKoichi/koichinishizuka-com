"use client"

import { useEffect, useState } from "react"
import { WifiOff } from "@/components/icons"

export function EpochOfflineBanner() {
  const [isOffline, setIsOffline] = useState(() => {
    if (typeof navigator === "undefined") return false
    return !navigator.onLine
  })

  useEffect(() => {
    const handleOnline = () => setIsOffline(false)
    const handleOffline = () => setIsOffline(true)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-secondary border-t border-border px-4 py-3 z-50">
      <div className="mx-auto max-w-4xl flex items-center gap-3">
        <WifiOff className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-foreground">オフライン状態です</p>
          <p className="text-xs text-muted-foreground">
            下書きの作成・編集のみ可能です。確定はオンライン復帰後に行われます。
          </p>
        </div>
      </div>
    </div>
  )
}
