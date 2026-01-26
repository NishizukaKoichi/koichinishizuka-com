"use client"

import { useState } from "react"
import {
  Shield,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit,
  Key,
  Lock,
  Play,
  Download,
  Check,
  Copy,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useI18n } from "@/lib/i18n/context"

type Scope = {
  id: string
  name: string
  slug: string
  description: string
  product_id: string
  product_name: string
  type: "execute" | "download" | "access"
  created_at: string
}

const mockScopes: Scope[] = [
  {
    id: "scope_001",
    name: "Pro機能の実行",
    slug: "pro:execute",
    description: "Pro Plan契約者のみが使用できる機能の実行権限",
    product_id: "prod_001",
    product_name: "Pro Plan",
    type: "execute",
    created_at: "2025-11-01T00:00:00Z",
  },
  {
    id: "scope_002",
    name: "CLIバイナリのダウンロード",
    slug: "cli:download",
    description: "CLI Tool購入者のみがダウンロード可能",
    product_id: "prod_003",
    product_name: "CLI Tool Lifetime",
    type: "download",
    created_at: "2025-12-01T00:00:00Z",
  },
  {
    id: "scope_003",
    name: "テンプレートアクセス",
    slug: "templates:access",
    description: "有料テンプレートへのアクセス権限",
    product_id: "prod_001",
    product_name: "Pro Plan",
    type: "access",
    created_at: "2025-12-15T00:00:00Z",
  },
  {
    id: "scope_004",
    name: "APIレート上限解除",
    slug: "api:unlimited",
    description: "API呼び出し回数制限の解除",
    product_id: "prod_001",
    product_name: "Pro Plan",
    type: "execute",
    created_at: "2026-01-01T00:00:00Z",
  },
]

const mockProducts = [
  { id: "prod_001", name: "Pro Plan" },
  { id: "prod_002", name: "Starter Plan" },
  { id: "prod_003", name: "CLI Tool Lifetime" },
]

const scopeTypeIcons = {
  execute: Play,
  download: Download,
  access: Key,
}

const scopeTypeLabels = {
  execute: "実行",
  download: "ダウンロード",
  access: "アクセス",
}

export function MagicSpellScopes() {
  const { t } = useI18n()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)

  const copySlug = async (slug: string) => {
    await navigator.clipboard.writeText(slug)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-light text-foreground mb-1">
            Scopes
          </h1>
          <p className="text-sm text-muted-foreground">
            商品に紐づくスコープを定義。ユーザーの実行・取得可否を判定する単位。
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Scopeを追加
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Scopeを追加</DialogTitle>
              <DialogDescription>
                新しいスコープを定義します。このスコープに対してEntitlementチェックを行います。
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label>スコープ名</Label>
                <Input placeholder="例: Pro機能の実行" />
              </div>
              <div className="space-y-2">
                <Label>スラッグ（API識別子）</Label>
                <Input placeholder="例: pro:execute" className="font-mono" />
                <p className="text-xs text-muted-foreground">
                  APIでスコープを指定する際に使用します
                </p>
              </div>
              <div className="space-y-2">
                <Label>商品</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="商品を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockProducts.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>タイプ</Label>
                <Select defaultValue="execute">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="execute">実行（機能のアンロック）</SelectItem>
                    <SelectItem value="download">ダウンロード（成果物の取得）</SelectItem>
                    <SelectItem value="access">アクセス（コンテンツの閲覧）</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>説明</Label>
                <Textarea placeholder="このスコープが何を許可するかを記述" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="bg-transparent">
                キャンセル
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(false)}>
                作成
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Important Note */}
      <div className="rounded-lg border border-magicspell-primary/30 bg-magicspell-primary/5 p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-magicspell-primary mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">MagicSpellはゲートキーパー</h3>
            <p className="text-sm text-muted-foreground">
              MagicSpellはファイルや機能を保持しません。あなたのプロダクトが「この操作をしていいか」を問い合わせ、
              MagicSpellは Yes/No だけを返します。実際の成果物はS3、GitHub Release、自前サーバなど任意の場所に置けます。
            </p>
          </div>
        </div>
      </div>

      {/* Scopes List */}
      {mockScopes.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Scopeがありません
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            最初のスコープを定義してください
          </p>
          <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Scopeを追加
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {mockScopes.map((scope) => {
            const TypeIcon = scopeTypeIcons[scope.type]
            return (
              <div
                key={scope.id}
                className="rounded-lg border border-border bg-card p-4 hover:bg-accent/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="rounded bg-muted p-2 mt-0.5">
                      <TypeIcon className="h-4 w-4 text-magicspell-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground">
                          {scope.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {scopeTypeLabels[scope.type]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-2">
                        <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-magicspell-primary">
                          {scope.slug}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copySlug(scope.slug)}
                        >
                          {copiedSlug === scope.slug ? (
                            <Check className="h-3 w-3 text-magicspell-primary" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {scope.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        商品: <span className="text-foreground">{scope.product_name}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        編集
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Integration Example */}
      <div className="mt-8 rounded-lg border border-border bg-card">
        <div className="border-b border-border p-4">
          <h2 className="font-medium text-foreground">あなたのプロダクトでの統合例</h2>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">1. 機能実行ゲート（アプリ/CLI）</h3>
            <div className="rounded border border-border bg-muted/30 p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-muted-foreground">
{`// あなたのアプリ側で
async function runProFeature(userId) {
  const res = await fetch('https://api.magicspell.dev/v1/check', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + API_KEY },
    body: JSON.stringify({ user_id: userId, scope: 'pro:execute' })
  });
  const { entitled } = await res.json();
  
  if (!entitled) {
    // 購入へ誘導
    return redirect('/pricing');
  }
  
  // 機能を実行
  executeProFeature();
}`}
              </pre>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">2. ダウンロードゲート</h3>
            <div className="rounded border border-border bg-muted/30 p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-muted-foreground">
{`// あなたのダウンロードエンドポイント
app.get('/download/cli', async (req, res) => {
  const { entitled } = await checkEntitlement(req.userId, 'cli:download');
  
  if (!entitled) {
    return res.status(403).json({ error: 'Not entitled' });
  }
  
  // S3のpresigned URLを生成して返す
  const url = await s3.getSignedUrl('getObject', {
    Bucket: 'your-bucket',
    Key: 'cli-v2.1.0.tar.gz',
    Expires: 300
  });
  
  res.json({ download_url: url });
});`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
