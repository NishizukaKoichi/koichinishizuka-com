"use client"

import { useState } from "react"
import {
  Settings,
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
import { Input } from "@/components/ui/input"
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

const mockSettings = {
  api_key: "ms_live_abc123def456ghi789jkl012mno345pqr678",
  webhook_url: "https://api.magicspell.dev/webhooks/stripe/abc123",
  webhook_secret: "whsec_abc123def456ghi789jkl012mno345pqr678",
  stripe_connected: true,
  created_at: "2025-06-01T00:00:00Z",
}

const webhookEvents = [
  { type: "checkout.session.completed", enabled: true },
  { type: "customer.subscription.created", enabled: true },
  { type: "customer.subscription.updated", enabled: true },
  { type: "customer.subscription.deleted", enabled: true },
  { type: "invoice.payment_succeeded", enabled: true },
  { type: "invoice.payment_failed", enabled: true },
]

export function MagicSpellSettings() {
  const { t } = useI18n()
  const [showApiKey, setShowApiKey] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isRegenerateDialogOpen, setIsRegenerateDialogOpen] = useState(false)

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const maskValue = (value: string, showFirst: number = 10) => {
    if (value.length <= showFirst) return value
    return value.substring(0, showFirst) + "•".repeat(20)
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-foreground mb-1">
          {t("magicspell.settings.title")}
        </h1>
        <p className="text-sm text-muted-foreground">
          APIキーとWebhook設定を管理します
        </p>
      </div>

      {/* Auth Provider */}
      <section className="rounded-lg border border-talisman-primary/30 bg-talisman-primary/5 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded bg-talisman-primary/20 p-2">
            <Key className="h-5 w-5 text-talisman-primary" />
          </div>
          <div>
            <h2 className="font-medium text-foreground">
              認証プロバイダー
            </h2>
            <p className="text-sm text-muted-foreground">
              userIdの取得元を指定します
            </p>
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
          MagicSpellは「誰か」を知りません。Talismanが返したuserIdをそのまま使います。
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
            <h2 className="font-medium text-foreground">
              {t("magicspell.settings.api_key")}
            </h2>
            <p className="text-sm text-muted-foreground">
              APIリクエストの認証に使用します
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded border border-border bg-muted/30 px-3 py-2 font-mono text-sm">
              {showApiKey
                ? mockSettings.api_key
                : maskValue(mockSettings.api_key)}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowApiKey(!showApiKey)}
            >
              {showApiKey ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(mockSettings.api_key, "api_key")}
            >
              {copiedField === "api_key" ? (
                <Check className="h-4 w-4 text-magicspell-primary" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <Dialog
            open={isRegenerateDialogOpen}
            onOpenChange={setIsRegenerateDialogOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                <RefreshCw className="h-4 w-4" />
                {t("magicspell.settings.regenerate")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>APIキーを再生成</DialogTitle>
                <DialogDescription>
                  新しいAPIキーを生成します。現在のキーは無効になり、すべてのAPIリクエストが失敗するようになります。
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
                  onClick={() => setIsRegenerateDialogOpen(false)}
                >
                  再生成する
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
              <h2 className="font-medium text-foreground">
                {t("magicspell.settings.webhook")}
              </h2>
              <p className="text-sm text-muted-foreground">
                Stripe Webhookエンドポイント
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className={
              mockSettings.stripe_connected
                ? "bg-magicspell-primary/10 text-magicspell-primary border-transparent"
                : "bg-destructive/10 text-destructive border-transparent"
            }
          >
            {mockSettings.stripe_connected ? "Connected" : "Disconnected"}
          </Badge>
        </div>

        <div className="space-y-4">
          {/* Webhook URL */}
          <div className="space-y-2">
            <Label>{t("magicspell.settings.webhook_url")}</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded border border-border bg-muted/30 px-3 py-2 font-mono text-sm text-foreground">
                {mockSettings.webhook_url}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(mockSettings.webhook_url, "webhook_url")
                }
              >
                {copiedField === "webhook_url" ? (
                  <Check className="h-4 w-4 text-magicspell-primary" />
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
            <Label>{t("magicspell.settings.webhook_secret")}</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded border border-border bg-muted/30 px-3 py-2 font-mono text-sm">
                {showWebhookSecret
                  ? mockSettings.webhook_secret
                  : maskValue(mockSettings.webhook_secret)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWebhookSecret(!showWebhookSecret)}
              >
                {showWebhookSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  copyToClipboard(mockSettings.webhook_secret, "webhook_secret")
                }
              >
                {copiedField === "webhook_secret" ? (
                  <Check className="h-4 w-4 text-magicspell-primary" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              StripeダッシュボードでWebhookを作成した後、表示されるSigning
              Secretを入力してください
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
                      className="text-xs bg-magicspell-primary/10 text-magicspell-primary border-transparent"
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
            <h2 className="font-medium text-foreground">
              {t("magicspell.settings.danger_zone")}
            </h2>
            <p className="text-sm text-muted-foreground">
              これらの操作は取り消せません
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                {t("magicspell.settings.delete_all")}
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
  
  // Forward to MagicSpell
  await fetch('${mockSettings.webhook_url}', {
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
