"use client"

import { useEffect, useMemo, useState } from "react"
import { Copy, Check, Eye, EyeOff, RefreshCw, Code, Webhook, Shield } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n/context"

type DeveloperKey = {
  keyId: string
  name: string
  status: "active" | "revoked"
  createdAt: string
}

export function TalismanIntegration() {
  const { t } = useI18n()
  const [showApiKey, setShowApiKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState("")
  const [keys, setKeys] = useState<DeveloperKey[]>([])
  const [keySecret, setKeySecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const activeKey = useMemo(
    () => keys.find((key) => key.status === "active") ?? null,
    [keys]
  )
  const displayKey = keySecret ?? activeKey?.keyId ?? ""

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const response = await fetch("/api/v1/developer-keys")
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || "Developer Keyの取得に失敗しました")
        }
        const data = (await response.json()) as {
          keys: Array<{
            key_id: string
            name: string
            status: "active" | "revoked"
            created_at: string
          }>
        }
        if (!active) return
        setKeys(
          data.keys.map((key) => ({
            keyId: key.key_id,
            name: key.name,
            status: key.status,
            createdAt: key.created_at,
          }))
        )
        setError(null)
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : "Developer Keyの取得に失敗しました"
        setError(message)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  const copyApiKey = () => {
    if (!displayKey) return
    navigator.clipboard.writeText(displayKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const createKey = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/v1/developer-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "default" }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Developer Keyの作成に失敗しました")
      }
      const data = (await response.json()) as {
        key: {
          key_id: string
          key_secret: string
          name: string
          status: "active" | "revoked"
          created_at: string
        }
      }
      setKeys((prev) => [
        {
          keyId: data.key.key_id,
          name: data.key.name,
          status: data.key.status,
          createdAt: data.key.created_at,
        },
        ...prev,
      ])
      setKeySecret(data.key.key_secret)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Developer Keyの作成に失敗しました"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const rotateKey = async () => {
    if (!activeKey) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/developer-keys/${activeKey.keyId}/rotate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Developer Keyの更新に失敗しました")
      }
      const data = (await response.json()) as { key_secret: string }
      setKeySecret(data.key_secret)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Developer Keyの更新に失敗しました"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{t("talisman.integration.title")}</CardTitle>
          <CardDescription>{t("talisman.integration.desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Talisman can be used as a unified login infrastructure. Products can delegate authentication to Talisman
            and receive observation signals (score + flags) for their own judgment.
          </p>
        </CardContent>
      </Card>

      {/* API Key */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("talisman.integration.api_key")}</CardTitle>
          <CardDescription>
            Use this key to authenticate API requests from your product.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeKey ? (
            <>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showApiKey ? "text" : "password"}
                    value={displayKey || "Rotate to reveal secret"}
                    readOnly
                    className="pr-10 font-mono text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyApiKey}
                  className="bg-transparent"
                  disabled={!displayKey}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-transparent"
                  onClick={rotateKey}
                  disabled={isSubmitting}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this key secret. Do not expose it in client-side code.
              </p>
              <p className="text-xs text-muted-foreground">
                key_id: {activeKey.keyId}
              </p>
            </>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                API Keyがまだ作成されていません。
              </p>
              <Button onClick={createKey} disabled={isSubmitting || isLoading}>
                {isSubmitting ? "Creating..." : "Create API Key"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhook */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Webhook className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">{t("talisman.integration.webhook")}</CardTitle>
          </div>
          <CardDescription>
            Receive real-time notifications when events occur.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Webhook URL</Label>
            <Input
              type="url"
              placeholder="https://your-product.com/api/talisman/webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Events to send</Label>
            <div className="space-y-2">
              {["person_created", "credential_added", "credential_revoked"].map((event) => (
                <label key={event} className="flex items-center gap-2">
                  <input type="checkbox" className="rounded border-border" defaultChecked />
                  <span className="text-sm">{t(`talisman.event.${event}`)}</span>
                </label>
              ))}
            </div>
          </div>
          <Button>Save Webhook</Button>
        </CardContent>
      </Card>

      {/* Policy Example */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">{t("talisman.integration.policy")}</CardTitle>
          </div>
          <CardDescription>{t("talisman.integration.policy_desc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Talisman does not enforce policies. Your product must implement its own logic based on the returned signals.
          </p>
          <div className="rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm">
            <pre className="overflow-x-auto text-muted-foreground">
{`// Example: Your product's policy logic
const signal = await talisman.getSignal(personId);

if (signal.score >= 2 && signal.flags.has_payment) {
  // Allow full access
  grantAccess("full");
} else if (signal.score >= 1) {
  // Allow limited access
  grantAccess("limited");
} else {
  // Require additional verification
  requestVerification();
}`}
            </pre>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            * This is just an example. Talisman never evaluates or enforces these conditions.
          </p>
        </CardContent>
      </Card>

      {/* API Reference */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">API Reference</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Get Signal */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">GET</span>
              <code className="text-sm">/persons/{'{person_id}'}/signal</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Get observation signal for a person.</p>
            <div className="rounded bg-muted/50 p-3 font-mono text-xs">
              <pre className="overflow-x-auto text-muted-foreground">
{`{
  "person_id": "019426a2-7def-7e8a-9c1b-4f8e2a3b5c6d",
  "score": 3,
  "flags": {
    "has_email": true,
    "has_oauth": true,
    "has_payment": false
  }
}`}
              </pre>
            </div>
          </div>

          {/* Add Credential */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">POST</span>
              <code className="text-sm">/credentials</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Add a new credential to a person.</p>
            <div className="rounded bg-muted/50 p-3 font-mono text-xs">
              <pre className="overflow-x-auto text-muted-foreground">
{`{
  "person_id": "019426a2-...",
  "type": "email_magiclink",
  "raw_value": "user@example.com",
  "issuer": "your-product"
}`}
              </pre>
            </div>
          </div>

          {/* Revoke Credential */}
          <div className="rounded-lg border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">POST</span>
              <code className="text-sm">/credentials/revoke</code>
            </div>
            <p className="text-sm text-muted-foreground mb-3">Revoke an existing credential.</p>
            <div className="rounded bg-muted/50 p-3 font-mono text-xs">
              <pre className="overflow-x-auto text-muted-foreground">
{`{
  "credential_id": "cred-xxx",
  "actor": "product"
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
