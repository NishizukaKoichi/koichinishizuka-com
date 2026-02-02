"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Webhook,
  Key,
  Copy,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
  Trash2,
  ExternalLink,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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

type DeveloperKey = {
  keyId: string
  name: string
  status: "active" | "revoked"
  createdAt: string
}

const webhookEvents = [
  { type: "checkout.session.completed", enabled: true },
  { type: "customer.subscription.created", enabled: true },
  { type: "customer.subscription.updated", enabled: true },
  { type: "customer.subscription.deleted", enabled: true },
  { type: "invoice.payment_succeeded", enabled: true },
  { type: "invoice.payment_failed", enabled: true },
]

export function SpellSettings() {
  const { t } = useI18n()
  const { userId } = useAuth()
  const [showApiKey, setShowApiKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false)
  const [keys, setKeys] = useState<DeveloperKey[]>([])
  const [keySecret, setKeySecret] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [webhookUrl] = useState(() => {
    if (typeof window === "undefined") return ""
    return `${window.location.origin}/api/v1/spell/webhooks/stripe`
  })
  const [stripeConnected, setStripeConnected] = useState(false)

  const activeKey = useMemo(
    () => keys.find((key) => key.status === "active") ?? null,
    [keys]
  )
  const displayKey = keySecret ?? activeKey?.keyId ?? ""

  const load = useCallback(async () => {
    if (!userId) return
    setError(null)
    try {
      const [keysRes, ledgerRes] = await Promise.all([
        fetch("/api/v1/developer-keys", { headers: { "x-user-id": userId } }),
        fetch("/api/v1/spell/ledger?limit=1"),
      ])

      if (!keysRes.ok) {
        const payload = await keysRes.json().catch(() => null)
        throw new Error(payload?.error ?? "APIキーの取得に失敗しました")
      }

      const keysData = (await keysRes.json()) as {
        keys: Array<{ key_id: string; name: string; status: "active" | "revoked"; created_at: string }>
      }
      setKeys(
        (keysData.keys ?? []).map((key) => ({
          keyId: key.key_id,
          name: key.name,
          status: key.status,
          createdAt: key.created_at,
        }))
      )

      if (ledgerRes.ok) {
        const ledgerData = (await ledgerRes.json()) as { entries: Array<{ stripeEventId: string }> }
        setStripeConnected((ledgerData.entries ?? []).length > 0)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "APIキーの取得に失敗しました")
    }
  }, [userId])

  useEffect(() => {
    void load()
  }, [load])

  const copyToClipboard = async (text: string, field: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const maskValue = (value: string, showFirst: number = 10) => {
    if (value.length <= showFirst) return value
    return value.substring(0, showFirst) + "•".repeat(20)
  }

  const createKey = async () => {
    if (!userId) return
    setIsSubmitting(true)
    try {
      const response = await fetch("/api/v1/developer-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({ name: "spell-default" }),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? "APIキーの作成に失敗しました")
      }
      const data = (await response.json()) as { key: { key_id: string; key_secret: string; name: string; status: "active" | "revoked"; created_at: string } }
      setKeys((prev) => [
        { keyId: data.key.key_id, name: data.key.name, status: data.key.status, createdAt: data.key.created_at },
        ...prev,
      ])
      setKeySecret(data.key.key_secret)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "APIキーの作成に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  const rotateKey = async () => {
    if (!userId || !activeKey) return
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/v1/developer-keys/${activeKey.keyId}/rotate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-id": userId },
        body: JSON.stringify({}),
      })
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error ?? "APIキーの更新に失敗しました")
      }
      const data = (await response.json()) as { key_secret: string }
      setKeySecret(data.key_secret)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "APIキーの更新に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-foreground mb-1">
          {t("spell.settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          APIキーとWebhook設定を管理します
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Auth Provider */}
      <section className="rounded-lg border border-talisman-primary/30 bg-talisman-primary/5 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded bg-talisman-primary/20 p-2">
            <Key className="h-5 w-5 text-talisman-primary" />
          </div>
          <div>
            <h2 className="font-medium text-foreground">認証プロバイダー</h2>
            <p className="text-sm text-muted-foreground">userIdの取得元を指定します</p>
          </div>
        </div>

        <div className="rounded border border-border bg-background p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded bg-talisman-primary/20 flex items-center justify-center">
                <span className="text-talisman-primary font-medium text-sm">T</span>
              </div>
              <div>
                <div className="font-medium text-foreground">Talisman</div>
                <div className="text-xs text-muted-foreground">
                  Talisman.verify(credential) → userId
                </div>
              </div>
            </div>
            <Badge className="bg-talisman-primary/20 text-talisman-primary border-transparent">
              Connected
            </Badge>
          </div>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Spellは「誰か」を知りません。Talismanが返したuserIdをそのまま使います。
          認証と認可は完全に分離されています。
        </p>
      </section>

      {/* API Key */}
      <section className="rounded-lg border border-border bg-card p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded bg-muted p-2">
            <Key className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h2 className="font-medium text-foreground">{t("spell.settings.api_key")}</h2>
            <p className="text-sm text-muted-foreground">APIリクエストの認証に使用します</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded border border-border bg-muted/30 px-3 py-2 font-mono text-sm">
              {displayKey
                ? showApiKey
                  ? displayKey
                  : maskValue(displayKey)
                : "APIキーがありません"}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
              disabled={!displayKey}
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(displayKey, "api_key")}
              disabled={!displayKey}
            >
              {copiedField === "api_key" ? (
                <Check className="h-4 w-4 text-spell-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Dialog open={isRegenerateDialogOpen} onOpenChange={setIsRegenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                {activeKey ? t("spell.settings.regenerate") : "APIキーを作成"}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{activeKey ? "APIキーを再生成" : "APIキーを作成"}</DialogTitle>
                <DialogDescription>
                  {activeKey
                    ? "新しいAPIキーを生成します。現在のキーは無効になり、すべてのAPIリクエストが失敗するようになります。"
                    : "新しいAPIキーを生成します。"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                    <p>
                      この操作は取り消せません。再生成後は、すべてのアプリケーションで新しいキーに更新する必要があります。
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRegenerateDialogOpen(false)}
                  className="bg-transparent"
                >
                  キャンセル
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (activeKey) {
                      await rotateKey()
                    } else {
                      await createKey()
                    }
                    setIsRegenerateDialogOpen(false)
                  }}
                  disabled={isSubmitting}
                >
                  {activeKey ? "再生成する" : "作成する"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Webhook Settings */}
      <section className="rounded-lg border border-border bg-card p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded bg-muted p-2">
              <Webhook className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h2 className="font-medium text-foreground">{t("spell.settings.webhook")}</h2>
              <p className="text-sm text-muted-foreground">Stripe Webhookエンドポイント</p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              stripeConnected
                ? "bg-spell-primary/10 text-spell-primary border-transparent"
                : "bg-muted text-muted-foreground border-transparent"
            }
          >
            {stripeConnected ? "Connected" : "Not configured"}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Webhook URL */}
          <div className="space-y-2">
            <Label>{t("spell.settings.webhook_url")}</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded border border-border bg-muted/30 px-3 py-2 font-mono text-sm text-foreground">
                {webhookUrl}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(webhookUrl, "webhook_url")}
                disabled={!webhookUrl}
              >
                {copiedField === "webhook_url" ? (
                  <Check className="h-4 w-4 text-spell-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              このURLをStripeダッシュボードのWebhook設定に追加してください
            </p>
          </div>

          {/* Webhook Secret */}
          <div className="space-y-2">
            <Label>{t("spell.settings.webhook_secret")}</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded border border-border bg-muted/30 px-3 py-2 font-mono text-sm">
                {showWebhookSecret ? "Stripeダッシュボードで管理" : maskValue("Stripeダッシュボードで管理")}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
              >
                {showWebhookSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              StripeダッシュボードでWebhookを作成した後、表示されるSigning Secretを入力してください
            </p>
          </div>

          {/* Webhook Events */}
          <div className="space-y-2">
            <Label>監視するイベント</Label>
            <div className="rounded border border-border bg-muted/30 p-4">
              <div className="grid gap-2 md:grid-cols-2">
                {webhookEvents.map((event) => (
                  <div
                    key={event.type}
                    className="flex items-center justify-between rounded bg-background px-3 py-2"
                  >
                    <code className="text-xs font-mono text-foreground">
                      {event.type}
                    </code>
                    <Badge
                      variant="outline"
                      className="text-xs bg-spell-primary/10 text-spell-primary border-transparent"
                    >
                      有効
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stripe Dashboard Link */}
          <Button variant="outline" className="gap-2 bg-transparent" asChild>
            <a
              href="https://dashboard.stripe.com/webhooks"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="h-4 w-4" />
              Stripeダッシュボードで設定
            </a>
          </Button>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="rounded-lg border border-destructive/50 bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded bg-destructive/10 p-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <h2 className="font-medium text-foreground">{t("spell.settings.danger_zone")}</h2>
            <p className="text-sm text-muted-foreground">これらの操作は取り消せません</p>
          </div>
        </div>

        <div className="space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                {t("spell.settings.delete_all")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>すべてのデータを削除</AlertDialogTitle>
                <AlertDialogDescription>
                  この操作により、すべての商品、Entitlement、配布物、監査ログが削除されます。
                  この操作は取り消せません。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  削除する
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </section>

      {/* Integration Code */}
      <section className="mt-6 rounded-lg border border-border bg-card p-6">
        <h2 className="font-medium text-foreground mb-4">統合コード例</h2>
        <div className="rounded border border-border bg-muted/30 p-4 font-mono text-xs overflow-x-auto">
          <pre className="text-muted-foreground">
            {`// Webhook Handler (Next.js API Route)
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Forward to Spell
  await fetch('${webhookUrl}', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Stripe-Signature': signature,
    },
    body: JSON.stringify(event),
  });

  return new Response('OK');
}`}
          </pre>
        </div>
      </section>
    </div>
  )
}
