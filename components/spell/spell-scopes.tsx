"use client"

import { useEffect, useState } from "react"
import {
  Shield,
  Plus,
  Check,
  Copy,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type Scope = {
  scopeKey: string
  description: string
  createdAt: string
}

export function SpellScopes() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null)
  const [scopes, setScopes] = useState<Scope[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [scopeKey, setScopeKey] = useState("")
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const copySlug = async (slug: string) => {
    await navigator.clipboard.writeText(slug)
    setCopiedSlug(slug)
    setTimeout(() => setCopiedSlug(null), 2000)
  }

  const load = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/v1/spell/scopes")
      if (!res.ok) {
        throw new Error("Scopeの取得に失敗しました")
      }
      const data = (await res.json()) as { scopes: Scope[] }
      setScopes(data.scopes ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "データ取得に失敗しました")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  const handleCreate = async () => {
    if (!scopeKey || !description) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/v1/spell/scopes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope_key: scopeKey, description }),
      })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        throw new Error(payload?.error ?? "Scopeの作成に失敗しました")
      }
      setScopeKey("")
      setDescription("")
      setIsCreateDialogOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scopeの作成に失敗しました")
    } finally {
      setIsSubmitting(false)
    }
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
            Spellで判定するスコープを定義します。ScopeはSpell側で意味づけをしません。
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
                <Label>スコープキー</Label>
                <Input
                  placeholder="例: spell.check"
                  className="font-mono"
                  value={scopeKey}
                  onChange={(event) => setScopeKey(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>説明</Label>
                <Textarea
                  placeholder="このスコープが何を許可するかを記述"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="bg-transparent">
                キャンセル
              </Button>
              <Button onClick={handleCreate} disabled={isSubmitting || !scopeKey || !description}>
                作成
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {error && <div className="text-sm text-destructive mb-4">{error}</div>}

      {/* Important Note */}
      <div className="rounded-lg border border-spell-primary/30 bg-spell-primary/5 p-4 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-spell-primary mt-0.5" />
          <div>
            <h3 className="font-medium text-foreground mb-1">Spellはゲートキーパー</h3>
            <p className="text-sm text-muted-foreground">
              Spellはファイルや機能を保持しません。あなたのプロダクトが「この操作をしていいか」を問い合わせ、
              Spellは Yes/No だけを返します。実際の成果物はS3、GitHub Release、自前サーバなど任意の場所に置けます。
            </p>
          </div>
        </div>
      </div>

      {/* Scopes List */}
      {isLoading ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
          読み込み中...
        </div>
      ) : scopes.length === 0 ? (
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
          {scopes.map((scope) => (
            <div
              key={scope.scopeKey}
              className="rounded-lg border border-border bg-card p-4 hover:bg-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded bg-muted p-2 mt-0.5">
                    <Shield className="h-4 w-4 text-spell-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-foreground">{scope.scopeKey}</h3>
                      <Badge variant="outline" className="text-xs">
                        Scope
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-spell-primary">
                        {scope.scopeKey}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => copySlug(scope.scopeKey)}
                      >
                        {copiedSlug === scope.scopeKey ? (
                          <Check className="h-3 w-3 text-spell-primary" />
                        ) : (
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {scope.description}
                    </p>
                    <div className="text-xs text-muted-foreground">
                      作成日: {new Date(scope.createdAt).toLocaleDateString("ja-JP")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
  const res = await fetch('https://api.example.com/api/v1/spell/check', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + ACCESS_TOKEN },
    body: JSON.stringify({
      spell_id: 'spell_...',
      runtime_id: 'runtime_...',
      user_identifier: userId,
      requested_scope: 'spell.check'
    })
  });

  if (!res.ok) {
    return redirect('/pricing');
  }

  executeProFeature();
}`}
              </pre>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">2. ダウンロードゲート</h3>
            <div className="rounded border border-border bg-muted/30 p-3 font-mono text-xs overflow-x-auto">
              <pre className="text-muted-foreground">
{`app.get('/download/cli', async (req, res) => {
  const res = await fetch('https://api.example.com/api/v1/spell/check', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + ACCESS_TOKEN },
    body: JSON.stringify({
      spell_id: 'spell_...',
      runtime_id: 'runtime_...',
      user_identifier: req.userId,
      requested_scope: 'cli.download'
    })
  });

  if (!res.ok) {
    return res.status(403).json({ error: 'Not entitled' });
  }

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
