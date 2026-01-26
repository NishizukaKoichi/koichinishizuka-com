"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Wand2,
  ArrowRight,
  ChevronLeft,
  Shield,
  Key,
  FileText,
  Webhook,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Terminal,
  Code,
  Server,
  Zap,
  Package,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n/context"

const principles = [
  {
    icon: Lock,
    titleKey: "magicspell.principle.1.title",
    descKey: "magicspell.principle.1.desc",
  },
  {
    icon: Webhook,
    titleKey: "magicspell.principle.2.title",
    descKey: "magicspell.principle.2.desc",
  },
  {
    icon: RefreshCw,
    titleKey: "magicspell.principle.3.title",
    descKey: "magicspell.principle.3.desc",
  },
  {
    icon: Key,
    titleKey: "magicspell.principle.4.title",
    descKey: "magicspell.principle.4.desc",
  },
  {
    icon: FileText,
    titleKey: "magicspell.principle.5.title",
    descKey: "magicspell.principle.5.desc",
  },
  {
    icon: Shield,
    titleKey: "magicspell.principle.6.title",
    descKey: "magicspell.principle.6.desc",
  },
]

const problems = [
  {
    problem: "課金と実行がズレる",
    solution: "Entitlement中心設計",
    reason: "誤課金・無断利用を防げる",
  },
  {
    problem: "解約時の挙動が不安",
    solution: "Webhook-only + 即時剥奪",
    reason: "トラブル対応コストが消える",
  },
  {
    problem: "壊れた時に直せない",
    solution: "Reconcile",
    reason: "人手復旧の恐怖が消える",
  },
  {
    problem: "判定が複雑になる",
    solution: "Scope設計",
    reason: "プロダクト側は問い合わせだけ",
  },
  {
    problem: "運用がブラックボックス",
    solution: "Audit / Ledger",
    reason: "責任を説明できる",
  },
]

export function MagicSpellLanding() {
  const { t, language } = useI18n()
  const router = useRouter()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Wand2 className="h-5 w-5 text-magicspell-primary" />
            <span className="font-semibold text-foreground">
              {t("magicspell.title")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/magicspell/login">
              <Button variant="outline" size="sm" className="bg-transparent">
                {t("magicspell.landing.login_btn")}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-border py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
            {t("magicspell.subtitle")}
          </p>
          <h1 className="mb-8 text-4xl font-light tracking-tight text-foreground md:text-5xl text-balance">
            {t("magicspell.landing.headline")}
          </h1>
          <div className="mx-auto max-w-2xl space-y-2 text-muted-foreground">
            <p>{t("magicspell.landing.desc1")}</p>
            <p>{t("magicspell.landing.desc2")}</p>
            <p>{t("magicspell.landing.desc3")}</p>
          </div>
        </div>
      </section>

      {/* What is Spell */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-lg border border-m-magicspell-primary/30 bg-magicspell-primary/5 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-medium text-foreground">
              <Zap className="h-5 w-5 text-magicspell-primary" />
              {language === "ja" ? "Spellとは何か" : "What is a Spell?"}
            </h2>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  {language === "ja" ? "従来の売り方" : "Traditional Way"}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <span>{language === "ja" ? "ツールを売る → コピーされる" : "Sell tools → Gets copied"}</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <span>{language === "ja" ? "SaaSを作る → 運用が重い" : "Build SaaS → Heavy operations"}</span>
                  </li>
                  <li className="flex items-start gap-2 text-muted-foreground">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <span>{language === "ja" ? "APIを公開 → 認証・課金が複雑" : "Expose API → Complex auth & billing"}</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-magicspell-primary">
                  {language === "ja" ? "Spellという売り方" : "The Spell Way"}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-magicspell-primary" />
                    <span>{language === "ja" ? "処理はデプロイ済み" : "Processing is already deployed"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-magicspell-primary" />
                    <span>{language === "ja" ? "売るのは「実行権」だけ" : "Sell only 'execution rights'"}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-magicspell-primary" />
                    <span>{language === "ja" ? "払った人だけ通る" : "Only paying users can execute"}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="mt-4 rounded border border-border bg-background p-3">
              <p className="text-sm font-medium text-foreground">
                {language === "ja" 
                  ? "MagicSpell = 「この実行は許可されているか？」にYes/Noを返す判定装置"
                  : "MagicSpell = A judgment device that returns Yes/No to 'is this execution allowed?'"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {language === "ja"
                  ? "処理の中身は見ない。安全も正しさも判断しない。価格も知らない。"
                  : "It doesn't see the processing. It doesn't judge safety or correctness. It doesn't know the price."}
              </p>
              <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">
                {language === "ja"
                  ? "第三者が自分のSpellを作りたい場合: 自分でデプロイし、MagicSpell APIに接続する"
                  : "If third parties want their own Spells: Deploy themselves and connect to the MagicSpell API"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Buyer Experience */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-medium text-foreground">
            {language === "ja" ? "購入者の体験" : "Buyer Experience"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: language === "ja" ? "使ってみる" : "Try it",
                desc: language === "ja" 
                  ? "普通にプロダクトを開く。無料範囲は動く。ある地点で制限に当たる。"
                  : "Open the product normally. Free features work. Hit a limit at some point.",
                icon: Terminal,
              },
              {
                step: "2",
                title: language === "ja" ? "払う" : "Pay",
                desc: language === "ja"
                  ? "案内に従って決済。Webhook で権利が即時付与される。"
                  : "Follow the prompt to pay. Rights granted immediately via Webhook.",
                icon: Unlock,
              },
              {
                step: "3",
                title: language === "ja" ? "通る" : "Access",
                desc: language === "ja"
                  ? "同じ操作をやり直すだけで通る。解約したら次から止まる。"
                  : "Retry the same action. It works. Cancel and it stops next time.",
                icon: CheckCircle2,
              },
            ].map((item) => (
              <div key={item.step} className="relative rounded-lg border border-border bg-card p-4">
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-magicspell-primary text-xs font-bold text-white">
                  {item.step}
                </div>
                <item.icon className="mb-2 h-5 w-5 text-magicspell-primary" />
                <h3 className="mb-1 font-medium text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-center text-xs text-muted-foreground">
            {language === "ja"
              ? "※ 購入者が「MagicSpellの管理画面」を触る必要は基本ない"
              : "* Buyers generally never need to touch MagicSpell's dashboard"}
          </p>
        </div>
      </section>

      {/* 3 Integration Patterns */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-medium text-foreground">
            {language === "ja" ? "33導線パターン" : "Three Integration Patterns"}
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Code className="h-5 w-5 text-magicspell-primary" />
                <h3 className="font-medium text-foreground">
                  {language === "ja" ? "アプリ型" : "App Type"}
                </h3>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{language === "ja" ? "機能を押す" : "Click feature"}</p>
                <p className="text-muted-foreground/60">↓</p>
                <p>{language === "ja" ? "ロック表示" : "Lock shown"}</p>
                <p className="text-muted-foreground/60">↓</p>
                <p>{language === "ja" ? "決済" : "Pay"}</p>
                <p className="text-muted-foreground/60">↓</p>
                <p className="text-magicspell-primary">{language === "ja" ? "通る" : "Access granted"}</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-magicspell-primary" />
                <h3 className="font-medium text-foreground">
                  {language === "ja" ? "CLI型" : "CLI Type"}
                </h3>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{language === "ja" ? "コマンド実行" : "Run command"}</p>
                <p className="text-muted-foreground/60">↓</p>
                <p>{language === "ja" ? "「権利がありません」" : "\"No entitlement\""}</p>
                <p className="text-muted-foreground/60">↓</p>
                <p>{language === "ja" ? "購入URL表示→購入" : "Show URL → Purchase"}</p>
                <p className="text-muted-foreground/60">↓</p>
                <p className="text-magicspell-primary">{language === "ja" ? "再実行→通る" : "Re-run → Success"}</p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-3 flex items-center gap-2">
                <Server className="h-5 w-5 text-magicspell-primary" />
                <h3 className="font-medium text-foreground">
                  {language === "ja" ? "ダウンロード型" : "Download Type"}
                </h3>
              </div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <p>{language === "ja" ? "DLボタン押す" : "Click download"}</p>
                <p className="text-muted-foreground/60">↓</p>
                <p>{language === "ja" ? "サーバーが判定" : "Server checks"}</p>
                <p className="text-muted-foreground/60">↓</p>
                <p>OK: <span className="text-magicspell-primary">presigned URL</span></p>
                <p>NG: {language === "ja" ? "購入へ" : "To purchase"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* One Line Integration */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-6 text-center text-xl font-medium text-foreground">
            {language === "ja" ? "組み込みは1行" : "One Line Integration"}
          </h2>
          <div className="rounded-lg border border-border bg-zinc-950 p-4">
            <pre className="overflow-x-auto text-sm text-zinc-100">
              <code>{`// Before any gated execution
const { entitled } = await magicspell.check({
  userId: user.id,
  scope: "premium:execute"
})

if (!entitled) {
  // Show purchase prompt or return error
  return { error: "ENTITLEMENT_REQUIRED", purchaseUrl }
}

// Proceed with execution
await runMyExpensiveOperation()`}</code>
            </pre>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            {language === "ja"
              ? "MagicSpellは判定だけ。実行・保存・配信はあなたのサーバーで。"
              : "MagicSpell only judges. Execution, storage, delivery is on your server."}
          </p>
        </div>
      </section>

      {/* Entitlement Flow */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="mb-6 text-center">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Entitlement Gate Example
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Entitled */}
              <div className="rounded border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Unlock className="h-5 w-5 text-magicspell-primary" />
                  <span className="text-sm font-mono text-muted-foreground">
                    entitled = true
                  </span>
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex items-center gap-2 text-magicspell-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>execute()</span>
                  </div>
                  <div className="flex items-center gap-2 text-magicspell-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>download()</span>
                  </div>
                  <div className="flex items-center gap-2 text-magicspell-primary">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>access_features()</span>
                  </div>
                </div>
              </div>
              {/* Not Entitled */}
              <div className="rounded border border-border bg-muted/30 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Lock className="h-5 w-5 text-destructive" />
                  <span className="text-sm font-mono text-muted-foreground">
                    entitled = false
                  </span>
                </div>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>blocked</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>blocked</span>
                  </div>
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-4 w-4" />
                    <span>blocked</span>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">
              * Entitlement is the single source of truth. Payment status is
              derived, not stored.
            </p>
          </div>
        </div>
      </section>

      {/* Problem → Solution Table */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-xl font-medium text-foreground">
            {t("magicspell.landing.problems_title")}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    課題
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    MagicSpellの機能
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    なぜ払うのが合理的か
                  </th>
                </tr>
              </thead>
              <tbody>
                {problems.map((row, i) => (
                  <tr key={i} className="border-b border-border">
                    <td className="px-4 py-3 text-foreground">{row.problem}</td>
                    <td className="px-4 py-3 font-mono text-magicspell-primary">
                      {row.solution}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {row.reason}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-xl font-medium text-foreground">
            {t("landing.principles_title")}
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {principles.map((principle, index) => {
              const Icon = principle.icon
              return (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-magicspell-primary" />
                    <h3 className="font-medium text-foreground">
                      {t(principle.titleKey)}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {t(principle.descKey)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-xl font-medium text-foreground">
            Architecture
          </h2>
          <div className="rounded-lg border border-border bg-card p-6 font-mono text-sm">
            <pre className="overflow-x-auto text-muted-foreground">
              {`[ Your Product ]
        ↓
[ MagicSpell API ]        ← if (!entitled) block
        ↓
[ Entitlement Store ]     ← single source of truth
        ↑
[ Stripe Webhook ]        ← payment confirmation (only)
        ↓
[ Audit Log / Ledger ]    ← append-only, reconcilable`}
            </pre>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-xl font-medium text-foreground">
            {t("magicspell.landing.how_it_works")}
          </h2>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-magicspell-primary/10 text-magicspell-primary">
                <span className="text-lg font-bold">1</span>
              </div>
              <h3 className="mb-1 font-medium text-foreground">
                {t("magicspell.landing.step1_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("magicspell.landing.step1_desc")}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-magicspell-primary/10 text-magicspell-primary">
                <span className="text-lg font-bold">2</span>
              </div>
              <h3 className="mb-1 font-medium text-foreground">
                {t("magicspell.landing.step2_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("magicspell.landing.step2_desc")}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-magicspell-primary/10 text-magicspell-primary">
                <span className="text-lg font-bold">3</span>
              </div>
              <h3 className="mb-1 font-medium text-foreground">
                {t("magicspell.landing.step3_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("magicspell.landing.step3_desc")}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-magicspell-primary/10 text-magicspell-primary">
                <span className="text-lg font-bold">4</span>
              </div>
              <h3 className="mb-1 font-medium text-foreground">
                {t("magicspell.landing.step4_title")}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t("magicspell.landing.step4_desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-xl font-medium text-foreground">
            {t("magicspell.landing.features_title")}
          </h2>
          <div className="grid gap-3 md:grid-cols-5">
            {[
              { icon: Shield, label: "Entitlement", desc: "権利管理" },
              { icon: Zap, label: "Spells", desc: "実行権商品" },
              { icon: Key, label: "Scopes", desc: "判定単位" },
              { icon: FileText, label: "Audit", desc: "監査ログ" },
              { icon: Webhook, label: "Webhooks", desc: "Stripe連携" },
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="rounded-lg border border-border bg-card p-3 text-center"
                >
                  <Icon className="mx-auto mb-2 h-6 w-6 text-magicspell-primary" />
                  <p className="text-sm font-medium text-foreground">
                    {feature.label}
                  </p>
                  <p className="text-xs text-muted-foreground">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* User Flow */}
      <section className="border-b border-border py-12">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="mb-8 text-center text-xl font-medium text-foreground">
            {t("magicspell.landing.user_flow_title")}
          </h2>
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
              {[
                "価値を理解",
                "登録",
                "無料制限で利用",
                "制限にぶつかる",
                "課金検討",
                "支払い（Webhook）",
                "即時アンロック",
                "再訪・再利用",
                "解約→即時ロック",
              ].map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span
                    className={`rounded px-2 py-1 ${
                      i === 5
                        ? "bg-magicspell-primary/20 text-magicspell-primary"
                        : i === 8
                          ? "bg-destructive/20 text-destructive"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {step}
                  </span>
                  {i < 8 && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <p className="mb-6 text-muted-foreground">
            {t("magicspell.landing.cta_desc")}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/magicspell/spells/new">
              <Button size="lg" className="gap-2">
                {language === "ja" ? "Spellを作る" : "Create a Spell"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/magicspell/login">
              <Button
                size="lg"
                variant="outline"
                className="gap-2 bg-transparent"
              >
                {t("magicspell.landing.login_btn")}
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t("magicspell.landing.consent")}
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <Link
                href="/magicspell/terms"
                className="hover:text-foreground transition-colors"
              >
                {t("footer.terms")}
              </Link>
              <Link
                href="/magicspell/privacy"
                className="hover:text-foreground transition-colors"
              >
                {t("footer.privacy")}
              </Link>
            </div>
            <span>作ったものを、安心して売るための OS</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
