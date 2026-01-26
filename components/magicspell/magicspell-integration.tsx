"use client"

import { useState } from "react"
import {
  Code,
  Terminal,
  Globe,
  Check,
  Copy,
  ChevronRight,
  ExternalLink,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useI18n } from "@/lib/i18n/context"

const codeExamples = {
  runtime: {
    title: "MagicSpell Runtime",
    description: "第三者が自分の環境でSpellを作るための「勝手に動かない殻」",
    code: `// MagicSpell Runtime - 完全実装
// 
// これは何か:
// - 処理を実行するランタイムではない
// - 処理の実行前に、必ずMagicSpellに実行可否を問い合わせさせる枠組み
// - 処理は第三者が作る、環境も第三者が持つ、Runtimeは「勝手に動かない殻」
//
// Runtimeがやること（これだけ）:
// 1. MagicSpell に Scope Check を送る
// 2. 返答を待つ
// 3. allowed = true のときのみ処理を実行
// 4. それ以外は即終了（fail-closed）
//
// Runtimeがやらないこと:
// - 課金しない、価格を知らない、回数を数えない
// - 利用者を識別しない（識別子を運ぶだけ）
// - 処理内容を検査しない、ログを分析しない
// - 再試行しない、例外を握りつぶさない
// - Runtimeに裁量は一切ない

// ============================================
// runtime.ts - 第三者がデプロイする殻
// ============================================

type ScopeCheckResult = {
  allowed: boolean
  reason?: string
}

type RuntimeConfig = {
  apiKey: string
  scope: string
  endpoint?: string
}

export function createRuntime(config: RuntimeConfig) {
  const endpoint = config.endpoint || 'https://api.magicspell.dev/v1/check'
  
  return async function execute<T>(
    userId: string,
    handler: () => Promise<T>
  ): Promise<{ success: true; result: T } | { success: false; reason: string }> {
    
    // 1. MagicSpell に Scope Check を送る
    let checkResult: ScopeCheckResult
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': \`Bearer \${config.apiKey}\`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: userId,
          scope: config.scope
        })
      })
      
      if (!res.ok) {
        // MagicSpellに接続できない → fail-closed
        return { success: false, reason: 'MAGICSPELL_UNAVAILABLE' }
      }
      
      checkResult = await res.json()
    } catch {
      // ネットワークエラー → fail-closed
      return { success: false, reason: 'NETWORK_ERROR' }
    }
    
    // 2. 返答を確認
    // 3. allowed = true のときのみ処理を実行
    if (!checkResult.allowed) {
      // 4. それ以外は即終了（fail-closed）
      return { success: false, reason: checkResult.reason || 'NOT_ENTITLED' }
    }
    
    // 処理を実行（ここから先は第三者の責任）
    const result = await handler()
    return { success: true, result }
  }
}

// ============================================
// 使用例: 第三者が自分の処理を組み込む
// ============================================

import { createRuntime } from './runtime'

// Runtime を設定（APIキーとScopeを指定）
const executeWithCheck = createRuntime({
  apiKey: process.env.MAGICSPELL_API_KEY!,
  scope: 'image:process'
})

// API Route（Vercel等にデプロイ）
export async function POST(req: Request) {
  const { userId, imageUrl } = await req.json()
  
  // Runtimeを通して実行
  // MagicSpellを通らずに処理が走る経路は存在しない
  const result = await executeWithCheck(userId, async () => {
    // ここに第三者が作った処理を入れる
    return await processImage(imageUrl)
  })
  
  if (!result.success) {
    return Response.json({ error: result.reason }, { status: 403 })
  }
  
  return Response.json(result.result)
}

// ============================================
// セキュリティ
// ============================================
// 
// - Runtimeはコピーされてよい
// - Runtimeは改変されてもよい
// - それでもEntitlementがなければ無力
// 
// 支配点はRuntime側ではなく
// MagicSpell側の Entitlement と API Key
// 
// Keyを失効させれば、
// 世界中にデプロイされたRuntimeが同時に沈黙する`,
  },
  talisman: {
    title: "Talisman + MagicSpell",
    description: "認証（Talisman）→ 認可（MagicSpell）の基本パターン",
    code: `// Talisman = 「誰か」を確定（認証）
// MagicSpell = 「実行していいか」を判定（認可 + 課金）

import { talisman } from '@/lib/talisman'
import { magicspell } from '@/lib/magicspell'

export async function runPremiumFeature(credential: string) {
  // 1. Talismanで認証 → userId確定
  const user = await talisman.verify(credential)
  if (!user) {
    return { error: 'UNAUTHORIZED' }
  }

  // 2. MagicSpellで権利を判定
  const { entitled } = await magicspell.check({
    userId: user.id,  // Talismanが返したID
    scope: 'premium:execute'
  })

  // 3. 分岐
  if (!entitled) {
    return { 
      error: 'ENTITLEMENT_REQUIRED',
      purchaseUrl: '/pricing'
    }
  }

  // 4. 通る
  const result = await executeExpensiveOperation()
  return { success: true, result }
}

// Talismanが壊れても → MagicSpellの判定ロジックは無傷
// MagicSpellが壊れても → Talismanの認証は無傷
// それぞれ独立して動く`,
  },
  check: {
    title: "Entitlement Check",
    description: "ユーザーが特定のscopeを持っているかチェック",
    code: `// POST /v1/check
// userId は Talisman.verify() で取得したもの

const response = await fetch('https://api.magicspell.dev/v1/check', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    user_id: user.id,  // ← Talismanから取得
    scope: 'pro:execute'
  })
});

const { entitled, expires_at } = await response.json();
// entitled: true/false
// expires_at: ISO8601 timestamp or null

if (!entitled) {
  // ユーザーを購入ページへ誘導
  return redirect('/pricing');
}

// 権利があるので機能を実行
executeProFeature();`,
  },
  webhook: {
    title: "Stripe Webhook",
    description: "支払い完了時にEntitlementを自動付与",
    code: `// POST /api/webhooks/stripe (あなたのエンドポイント)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  
  const event = stripe.webhooks.constructEvent(
    body, sig, process.env.STRIPE_WEBHOOK_SECRET
  );
  
  // MagicSpellにイベントを転送
  await fetch('https://api.magicspell.dev/v1/webhook/stripe', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(event)
  });
  
  return new Response('OK');
}

// MagicSpellが自動的に:
// - checkout.session.completed → Entitlement付与
// - customer.subscription.deleted → Entitlement剥奪
// - invoice.payment_failed → 警告/猶予期間
// を処理します`,
  },
  download: {
    title: "ダウンロードゲート",
    description: "成果物のダウンロードを権利で制御",
    code: `// GET /api/download/cli (あなたのエンドポイント)
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(req: Request) {
  const userId = await getUserFromSession(req);
  
  // MagicSpellにEntitlementを確認
  const { entitled } = await fetch('https://api.magicspell.dev/v1/check', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
    body: JSON.stringify({ user_id: userId, scope: 'cli:download' })
  }).then(r => r.json());
  
  if (!entitled) {
    return new Response('Not entitled', { status: 403 });
  }
  
  // 権利があるのでpresigned URLを生成
  const s3 = new S3Client({ region: 'ap-northeast-1' });
  const url = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: 'your-bucket',
    Key: 'releases/cli-v2.1.0-darwin-arm64.tar.gz'
  }), { expiresIn: 300 });
  
  return Response.json({ download_url: url });
}

// MagicSpellはURLを知らない。判定だけを返す。
// 実際のファイルはS3, GitHub Release, 自前サーバなど任意。`,
  },
  cli: {
    title: "CLIゲート",
    description: "コマンドライン実行を権利で制御",
    code: `#!/usr/bin/env node
// your-cli/src/index.ts

import { checkEntitlement } from './magicspell';

async function main() {
  const command = process.argv[2];
  
  // 無料コマンドはそのまま実行
  if (['help', 'version', 'init'].includes(command)) {
    return runCommand(command);
  }
  
  // 有料コマンドはEntitlementをチェック
  const userId = await getStoredUserId(); // ローカルに保存されたユーザーID
  const { entitled } = await checkEntitlement(userId, 'cli:execute');
  
  if (!entitled) {
    console.log('\\n⚠️  この機能には Pro ライセンスが必要です');
    console.log('   購入: https://yourproduct.com/pricing');
    console.log('   ログイン: your-cli login\\n');
    process.exit(1);
  }
  
  // 権利があるので実行
  runCommand(command);
}

// checkEntitlement の実装
async function checkEntitlement(userId: string, scope: string) {
  const res = await fetch('https://api.magicspell.dev/v1/check', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + process.env.MAGICSPELL_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ user_id: userId, scope })
  });
  return res.json();
}`,
  },
  reconcile: {
    title: "Reconcile",
    description: "不整合が発生した場合の修復",
    code: `// 手動でEntitlementを修正する場合

// 1. 付与
await fetch('https://api.magicspell.dev/v1/entitlements', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({
    user_id: 'user_abc123',
    scope: 'pro:execute',
    source: 'manual',
    reason: '問い合わせ #1234 対応'
  })
});

// 2. 剥奪
await fetch('https://api.magicspell.dev/v1/entitlements/ent_xyz', {
  method: 'DELETE',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({
    reason: '返金対応 #5678'
  })
});

// 3. Stripeと同期（Reconcile）
await fetch('https://api.magicspell.dev/v1/reconcile', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' },
  body: JSON.stringify({
    user_id: 'user_abc123',
    stripe_customer_id: 'cus_xxx'
  })
});

// Reconcileは:
// - StripeのSubscription状態を確認
// - MagicSpellのEntitlementと突合
// - 差分があれば修正
// - Audit Logに記録`,
  },
}

export function MagicSpellIntegration() {
  const { t } = useI18n()
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = async (code: string, key: string) => {
    await navigator.clipboard.writeText(code)
    setCopiedCode(key)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-light text-foreground mb-2">
          統合ガイド
        </h1>
        <p className="text-sm text-muted-foreground">
          あなたのプロダクトにMagicSpellを統合する方法
        </p>
      </div>

      {/* Key Concept */}
      <div className="rounded-lg border border-magicspell-primary/30 bg-magicspell-primary/5 p-6 mb-8">
        <h2 className="font-medium text-foreground mb-3">Talisman + MagicSpell</h2>
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <div className="rounded border border-border bg-background p-3">
            <div className="text-sm font-medium text-talisman-primary mb-1">Talisman</div>
            <p className="text-xs text-muted-foreground">
              「誰か」を確定する（認証）。userId を返す。
            </p>
          </div>
          <div className="rounded border border-border bg-background p-3">
            <div className="text-sm font-medium text-magicspell-primary mb-1">MagicSpell</div>
            <p className="text-xs text-muted-foreground">
              「実行していいか」を判定する（認可+課金）。Yes/No を返す。
            </p>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="font-mono bg-muted px-1">Talisman.verify()</span> → userId → 
          <span className="font-mono bg-muted px-1 ml-1">MagicSpell.check(userId, scope)</span> → entitled
        </div>
      </div>

      {/* Steps */}
      <div className="mb-8">
        <h2 className="font-medium text-foreground mb-4">統合ステップ</h2>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-4">
            <div className="rounded-full bg-magicspell-primary/20 w-8 h-8 flex items-center justify-center text-sm font-mono text-magicspell-primary shrink-0">1</div>
            <div>
              <h3 className="font-medium text-foreground mb-1">商品とScopeを定義</h3>
              <p className="text-sm text-muted-foreground">
                MagicSpellで商品を登録し、各商品にScopeを紐づける。
                Scopeは「pro:execute」「cli:download」のような識別子。
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-4">
            <div className="rounded-full bg-magicspell-primary/20 w-8 h-8 flex items-center justify-center text-sm font-mono text-magicspell-primary shrink-0">2</div>
            <div>
              <h3 className="font-medium text-foreground mb-1">Stripe Webhookを設定</h3>
              <p className="text-sm text-muted-foreground">
                StripeのWebhookをMagicSpellに転送するエンドポイントを作成。
                checkout.session.completedでEntitlementが自動付与される。
              </p>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4 flex items-start gap-4">
            <div className="rounded-full bg-magicspell-primary/20 w-8 h-8 flex items-center justify-center text-sm font-mono text-magicspell-primary shrink-0">3</div>
            <div>
              <h3 className="font-medium text-foreground mb-1">プロダクト側でチェックを入れる</h3>
              <p className="text-sm text-muted-foreground">
                有料機能の実行前、ダウンロード前などに /v1/check を叩く。
                entitledがfalseなら購入ページへ誘導。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Code Examples */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-medium text-foreground">コード例</h2>
        </div>
        <Tabs defaultValue="runtime" className="w-full">
          <div className="border-b border-border px-4">
            <TabsList className="h-12 bg-transparent gap-4 flex-wrap">
              <TabsTrigger value="runtime" className="data-[state=active]:bg-transparent data-[state=active]:text-magicspell-primary data-[state=active]:shadow-none">
                Runtime
              </TabsTrigger>
              <TabsTrigger value="talisman" className="data-[state=active]:bg-transparent data-[state=active]:text-magicspell-primary data-[state=active]:shadow-none">
                Talisman連携
              </TabsTrigger>
              <TabsTrigger value="check" className="data-[state=active]:bg-transparent data-[state=active]:text-magicspell-primary data-[state=active]:shadow-none">
                Check
              </TabsTrigger>
              <TabsTrigger value="webhook" className="data-[state=active]:bg-transparent data-[state=active]:text-magicspell-primary data-[state=active]:shadow-none">
                Webhook
              </TabsTrigger>
              <TabsTrigger value="download" className="data-[state=active]:bg-transparent data-[state=active]:text-magicspell-primary data-[state=active]:shadow-none">
                Download
              </TabsTrigger>
              <TabsTrigger value="cli" className="data-[state=active]:bg-transparent data-[state=active]:text-magicspell-primary data-[state=active]:shadow-none">
                CLI
              </TabsTrigger>
              <TabsTrigger value="reconcile" className="data-[state=active]:bg-transparent data-[state=active]:text-magicspell-primary data-[state=active]:shadow-none">
                Reconcile
              </TabsTrigger>
            </TabsList>
          </div>
          {Object.entries(codeExamples).map(([key, example]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-foreground">{example.title}</h3>
                    <p className="text-sm text-muted-foreground">{example.description}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 bg-transparent"
                    onClick={() => copyCode(example.code, key)}
                  >
                    {copiedCode === key ? (
                      <>
                        <Check className="h-3 w-3 text-magicspell-primary" />
                        コピー済み
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        コピー
                      </>
                    )}
                  </Button>
                </div>
                <div className="rounded border border-border bg-muted/30 p-4 font-mono text-xs overflow-x-auto">
                  <pre className="text-muted-foreground whitespace-pre-wrap">
                    {example.code}
                  </pre>
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* API Reference Link */}
      <div className="mt-6 flex items-center justify-end gap-4">
        <a
          href="#"
          className="text-sm text-magicspell-primary hover:underline flex items-center gap-1"
        >
          API Reference
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  )
}
