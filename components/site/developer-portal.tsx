"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  Key,
  Plus,
  Copy,
  Check,
  Trash2,
  Settings,
  Shield,
  Clock,
  FileText,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  ExternalLink,
  ChevronRight,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useI18n } from "@/lib/i18n/context"
import { useAuth } from "@/lib/auth/context"

type Scope = {
  id: string
  name: string
  description: string
  product: string
  pricing: "free" | "metered" | "requires_approval"
  enabled: boolean
}

type DeveloperKey = {
  id: string
  name: string
  prefix: string
  created_at: string
  last_used_at: string | null
  scopes: string[]
  status: "active" | "revoked"
  token_ttl: number // minutes
}

const availableScopes: Scope[] = [
  {
    id: "talisman.verify",
    name: "talisman.verify",
    description: "本人性スコアを参照",
    product: "Talisman",
    pricing: "metered",
    enabled: false,
  },
  {
    id: "pact.read",
    name: "pact.read",
    description: "契約状態を読む",
    product: "Pact",
    pricing: "metered",
    enabled: false,
  },
  {
    id: "pact.write",
    name: "pact.write",
    description: "契約状態を遷移させる",
    product: "Pact",
    pricing: "metered",
    enabled: false,
  },
  {
    id: "epoch.read",
    name: "epoch.read",
    description: "ログを読む",
    product: "Epoch",
    pricing: "free",
    enabled: false,
  },
  {
    id: "epoch.append",
    name: "epoch.append",
    description: "ログを積む",
    product: "Epoch",
    pricing: "metered",
    enabled: false,
  },
  {
    id: "sigil.verify",
    name: "sigil.verify",
    description: "署名/証明を検証",
    product: "Sigil",
    pricing: "free",
    enabled: false,
  },
  {
    id: "sigil.issue",
    name: "sigil.issue",
    description: "署名/証明を発行",
    product: "Sigil",
    pricing: "metered",
    enabled: false,
  },
  {
    id: "spell.check",
    name: "spell.check",
    description: "実行可否を照会",
    product: "Spell",
    pricing: "metered",
    enabled: false,
  },
]

const scopeConditionMap: Record<Scope["pricing"], "free" | "metered" | "review"> = {
  free: "free",
  metered: "metered",
  requires_approval: "review",
}

export function DeveloperPortal() {
  const { language } = useI18n()
  const { userId } = useAuth()
  const [keys, setKeys] = useState<DeveloperKey[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newKeyName, setNewKeyName] = useState("")
  const [selectedScopes, setSelectedScopes] = useState<string[]>([])
  const [createdKey, setCreatedKey] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const loadKeys = useCallback(async () => {
    if (!userId) {
      setKeys([])
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/v1/developer-keys", {
        headers: undefined,
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "Failed to load keys")
      }

      const payload = await response.json()
      const fetchedKeys = await Promise.all(
        (payload.keys ?? []).map(async (key: any) => {
          const scopesResponse = await fetch(`/api/v1/developer-keys/${key.key_id}/scopes`, {
            headers: undefined,
          })
          const scopesPayload = scopesResponse.ok
            ? await scopesResponse.json()
            : { scopes: [] }
          const scopes = (scopesPayload.scopes ?? [])
            .filter((scopeEntry: any) => scopeEntry.status === "granted")
            .map((scopeEntry: any) => scopeEntry.scope)

          return {
            id: key.key_id,
            name: key.name,
            prefix: key.key_id,
            created_at: key.created_at,
            last_used_at: key.last_used_at,
            scopes,
            status: key.status,
            token_ttl: key.token_ttl,
          } as DeveloperKey
        })
      )

      setKeys(fetchedKeys)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load keys"
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    void loadKeys()
  }, [loadKeys])

  const handleCreateKey = async () => {
    if (!newKeyName || selectedScopes.length === 0 || !userId) return

    setError(null)
    try {
      const response = await fetch("/api/v1/developer-keys", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify({ name: newKeyName }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "Failed to create key")
      }

      const payload = await response.json()
      const keyId = payload.key_id as string
      const keySecret = payload.key_secret as string

      await Promise.all(
        selectedScopes.map((scopeId) =>
          fetch(`/api/v1/developer-keys/${keyId}/scopes`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              },
            body: JSON.stringify({
              scope: scopeId,
              action: "grant",
              conditionType:
                scopeConditionMap[availableScopes.find((scope) => scope.id === scopeId)?.pricing ?? "requires_approval"],
            }),
          })
        )
      )

      setCreatedKey(keySecret)
      setNewKeyName("")
      setSelectedScopes([])
      await loadKeys()
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create key"
      setError(message)
    }
  }

  const handleRevokeKey = async (id: string) => {
    if (!userId) return
    setError(null)
    try {
      const response = await fetch(`/api/v1/developer-keys/${id}/revoke`, {
        method: "POST",
        headers: undefined,
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}))
        throw new Error(payload.error ?? "Failed to revoke key")
      }
      setKeys((prev) =>
        prev.map((key) =>
          key.id === id ? { ...key, status: "revoked" as const } : key
        )
      )
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to revoke key"
      setError(message)
    }
  }

  const toggleScope = (scopeId: string) => {
    setSelectedScopes(prev => 
      prev.includes(scopeId) 
        ? prev.filter(s => s !== scopeId)
        : [...prev, scopeId]
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-foreground mb-2">
          {language === "ja" ? "Developer Portal" : "Developer Portal"}
        </h1>
        <p className="text-muted-foreground">
          {language === "ja" 
            ? "APIキーを発行し、プロダクト群の能力をあなたのアプリケーションに組み込む"
            : "Issue API keys and integrate product capabilities into your applications"}
        </p>
        {error && (
          <div className="mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}
      </div>

      {/* Flow Explanation */}
      <div className="rounded-lg border border-border bg-card p-6 mb-8">
        <h2 className="font-medium text-foreground mb-4">
          {language === "ja" ? "利用の流れ" : "How It Works"}
        </h2>
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { step: "1", title: language === "ja" ? "ログイン" : "Login", desc: "Talismanで認証" },
            { step: "2", title: language === "ja" ? "キー発行" : "Create Key", desc: "Developer Keyを作成" },
            { step: "3", title: language === "ja" ? "スコープ選択" : "Select Scopes", desc: "必要な能力を紐づけ" },
            { step: "4", title: language === "ja" ? "API呼び出し" : "Call APIs", desc: "短命トークンで実行" },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {item.step}
              </div>
              <div>
                <div className="font-medium text-foreground text-sm">{item.title}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Token Info */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 mb-8">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">
              {language === "ja" ? "トークンの自動更新" : "Automatic Token Refresh"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "ja"
                ? "アクセストークンは短命（デフォルト60分）で、条件を満たせば自動更新されます。課金状態、Entitlement、スコープのいずれかがNoになった時点で更新は停止します。"
                : "Access tokens are short-lived (default 60 min) and auto-refresh if conditions are met. Refresh stops when billing, entitlement, or scope becomes invalid."}
            </p>
          </div>
        </div>
      </div>

      {/* Developer Keys */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-foreground">
            {language === "ja" ? "Developer Keys" : "Developer Keys"}
          </h2>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                {language === "ja" ? "キーを作成" : "Create Key"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {language === "ja" ? "新しいDeveloper Keyを作成" : "Create New Developer Key"}
                </DialogTitle>
                <DialogDescription>
                  {language === "ja"
                    ? "キー名を入力し、必要なスコープを選択してください"
                    : "Enter a name and select the scopes you need"}
                </DialogDescription>
              </DialogHeader>

              {createdKey ? (
                <div className="py-4">
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-foreground">
                        {language === "ja" ? "キーが作成されました" : "Key Created"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">
                      {language === "ja"
                        ? "このキーは一度だけ表示されます。安全な場所に保存してください。"
                        : "This key will only be shown once. Save it in a secure location."}
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded bg-muted px-3 py-2 text-sm font-mono break-all">
                        {createdKey}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(createdKey, "new")}
                      >
                        {copied === "new" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button 
                    onClick={() => {
                      setCreatedKey(null)
                      setIsCreating(false)
                    }}
                    className="w-full"
                  >
                    {language === "ja" ? "完了" : "Done"}
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4 py-4">
                    <div>
                      <Label>{language === "ja" ? "キー名" : "Key Name"}</Label>
                      <Input
                        placeholder={language === "ja" ? "例: Production App" : "e.g. Production App"}
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">
                        {language === "ja" ? "スコープ" : "Scopes"}
                      </Label>
                      <div className="rounded-lg border border-border divide-y divide-border max-h-64 overflow-auto">
                        {availableScopes.map((scope) => (
                          <div
                            key={scope.id}
                            className="flex items-center justify-between p-3 hover:bg-accent/30"
                          >
                            <div className="flex items-center gap-3">
                              <Switch
                                checked={selectedScopes.includes(scope.id)}
                                onCheckedChange={() => toggleScope(scope.id)}
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <code className="text-sm font-mono text-foreground">
                                    {scope.name}
                                  </code>
                                  <Badge variant="outline" className="text-xs">
                                    {scope.product}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {scope.description}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className={
                                scope.pricing === "free"
                                  ? "border-green-500/50 text-green-500"
                                  : scope.pricing === "metered"
                                  ? "border-amber-500/50 text-amber-500"
                                  : "border-red-500/50 text-red-500"
                              }
                            >
                              {scope.pricing === "free"
                                ? language === "ja" ? "無料" : "Free"
                                : scope.pricing === "metered"
                                ? language === "ja" ? "従量" : "Metered"
                                : language === "ja" ? "要承認" : "Approval"}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                    >
                      {language === "ja" ? "キャンセル" : "Cancel"}
                    </Button>
                    <Button
                      onClick={handleCreateKey}
                      disabled={!newKeyName || selectedScopes.length === 0}
                    >
                      {language === "ja" ? "作成" : "Create"}
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
            {language === "ja" ? "読み込み中..." : "Loading..."}
          </div>
        ) : keys.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-12 text-center">
            <Key className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              {language === "ja" ? "キーがありません" : "No Keys"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {language === "ja"
                ? "最初のDeveloper Keyを作成してAPIを利用開始しましょう"
                : "Create your first Developer Key to start using the APIs"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className={`rounded-lg border bg-card p-4 ${
                  key.status === "revoked" ? "opacity-50 border-border" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{key.name}</span>
                      {key.status === "revoked" && (
                        <Badge variant="destructive">
                          {language === "ja" ? "失効" : "Revoked"}
                        </Badge>
                      )}
                    </div>
                    <code className="text-xs text-muted-foreground font-mono">
                      {key.prefix}...
                    </code>
                  </div>
                  {key.status === "active" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {language === "ja" ? "キーを失効させますか？" : "Revoke this key?"}
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {language === "ja"
                              ? "このキーを使用しているすべてのアプリケーションが即座に停止します。この操作は取り消せません。"
                              : "All applications using this key will immediately stop working. This cannot be undone."}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>
                            {language === "ja" ? "キャンセル" : "Cancel"}
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleRevokeKey(key.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {language === "ja" ? "失効させる" : "Revoke"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mb-3">
                  {key.scopes.map((scope) => (
                    <code
                      key={scope}
                      className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono text-muted-foreground"
                    >
                      {scope}
                    </code>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {language === "ja" ? "作成: " : "Created: "}
                    {new Date(key.created_at).toLocaleDateString()}
                  </span>
                  {key.last_used_at && (
                    <span>
                      {language === "ja" ? "最終使用: " : "Last used: "}
                      {new Date(key.last_used_at).toLocaleDateString()}
                    </span>
                  )}
                  <span>
                    TTL: {key.token_ttl}{language === "ja" ? "分" : "min"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* API Reference */}
      <div className="rounded-lg border border-border bg-card p-6">
        <h2 className="font-medium text-foreground mb-4">
          {language === "ja" ? "トークン発行API" : "Token Endpoint"}
        </h2>
        <div className="rounded bg-zinc-950 p-4 overflow-x-auto">
          <pre className="text-sm text-zinc-100">
            <code>{`// 1. Developer Keyで短命トークンを取得
const res = await fetch('https://api.koichinishizuka.com/v1/token', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_DEVELOPER_KEY',
    'Content-Type': 'application/json'
  }
})

const { access_token, expires_at, scopes } = await res.json()
// access_token: 短命トークン（自動更新可能）
// expires_at: 有効期限（ISO8601）
// scopes: このトークンで使えるスコープ一覧

// 2. 短命トークンで各APIを呼ぶ
const check = await fetch('https://api.koichinishizuka.com/v1/spell/check', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + access_token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: 'user_123',
    scope: 'premium:execute'
  })
})`}</code>
          </pre>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          {language === "ja"
            ? "トークンは条件を満たせば自動更新されます。課金・Entitlement・スコープのいずれかが無効になると更新は停止します。"
            : "Tokens auto-refresh when conditions are met. Refresh stops if billing, entitlement, or scope becomes invalid."}
        </p>
      </div>
    </div>
  )
}
