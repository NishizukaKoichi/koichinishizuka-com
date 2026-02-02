"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Check,
  Users,
  Activity,
  Key,
  Package,
} from "@/components/icons";
import { useI18n } from "@/lib/i18n/context";

type SpellDetail = {
  spellId: string;
  name: string;
  sku: string;
  type: "one_time" | "subscription";
  status: "active" | "inactive";
  stripeProductId?: string;
  stripePriceId?: string;
  createdAt: string;
  scopes: string[];
};

type Entitlement = {
  entitlementId: string;
  userIdentifier: string;
  status: "active" | "revoked";
  grantedAt: string;
  revokedAt?: string;
  sourceEventId?: string;
};

export function SpellSpellDetail() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const spellId = params?.spellId as string | undefined;
  const [spell, setSpell] = useState<SpellDetail | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const load = useCallback(async () => {
    if (!spellId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [spellRes, entitlementsRes] = await Promise.all([
        fetch(`/api/v1/spell/spells/${spellId}`),
        fetch(`/api/v1/spell/entitlements?spell_id=${spellId}`),
      ]);

      if (!spellRes.ok) {
        const payload = await spellRes.json().catch(() => null);
        throw new Error(payload?.error ?? "Spellの取得に失敗しました");
      }

      const spellData = (await spellRes.json()) as {
        spell: {
          spellId: string;
          name: string;
          sku: string;
          status: "active" | "inactive";
          type: "one_time" | "subscription";
          stripeProductId?: string;
          stripePriceId?: string;
          createdAt: string;
          scopes?: string[];
        };
      };

      if (!entitlementsRes.ok) {
        const payload = await entitlementsRes.json().catch(() => null);
        throw new Error(payload?.error ?? "Entitlementの取得に失敗しました");
      }

      const entitlementsData = (await entitlementsRes.json()) as {
        entitlements: Entitlement[];
      };

      setSpell({
        spellId: spellData.spell.spellId,
        name: spellData.spell.name,
        sku: spellData.spell.sku,
        status: spellData.spell.status,
        type: spellData.spell.type,
        stripeProductId: spellData.spell.stripeProductId,
        stripePriceId: spellData.spell.stripePriceId,
        createdAt: spellData.spell.createdAt,
        scopes: spellData.spell.scopes ?? [],
      });
      setEntitlements(entitlementsData.entitlements ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "データ取得に失敗しました");
    } finally {
      setIsLoading(false);
    }
  }, [spellId]);

  useEffect(() => {
    void load();
  }, [load]);

  const activeEntitlements = useMemo(
    () => entitlements.filter((ent) => ent.status === "active"),
    [entitlements]
  );

  const recentActivity = useMemo(() => {
    const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
    return entitlements.filter((ent) => new Date(ent.grantedAt).getTime() >= dayAgo)
      .length;
  }, [entitlements]);

  const handleCopy = (text: string | undefined, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStatusToggle = async (checked: boolean) => {
    if (!spell) return;
    const nextStatus = checked ? "active" : "inactive";
    setIsUpdatingStatus(true);
    try {
      const res = await fetch(`/api/v1/spell/spells/${spell.spellId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => null);
        throw new Error(payload?.error ?? "ステータス更新に失敗しました");
      }
      setSpell({ ...spell, status: nextStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : "ステータス更新に失敗しました");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        読み込み中...
      </div>
    );
  }

  if (!spell) {
    return (
      <div className="rounded-lg border border-border bg-card p-12 text-center text-sm text-muted-foreground">
        Spellが見つかりませんでした
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/spell/spells")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {spell.name}
              </h1>
              <Badge
                variant={spell.status === "active" ? "default" : "secondary"}
                className={
                  spell.status === "active"
                    ? "bg-spell-primary/20 text-spell-primary border-spell-primary/30"
                    : ""
                }
              >
                {spell.status === "active"
                  ? t("spell.products.active")
                  : t("spell.products.inactive")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{spell.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{spell.type === "subscription" ? "Subscription" : "One-time"}</Badge>
        </div>
      </div>

      {error && <div className="text-sm text-destructive">{error}</div>}

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-spell-primary/10">
                <Users className="h-4 w-4 text-spell-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {activeEntitlements.length}
                </p>
                <p className="text-xs text-muted-foreground">有効な権利</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Package className="h-4 w-4 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {entitlements.length}
                </p>
                <p className="text-xs text-muted-foreground">総付与数</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Key className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {spell.scopes.length}
                </p>
                <p className="text-xs text-muted-foreground">登録スコープ</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/10">
                <Activity className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {recentActivity}
                </p>
                <p className="text-xs text-muted-foreground">24h アクティビティ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="details">詳細</TabsTrigger>
          <TabsTrigger value="entitlements">Entitlements</TabsTrigger>
          <TabsTrigger value="distributions">配布物</TabsTrigger>
          <TabsTrigger value="stripe">Stripe連携</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Spell情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("spell.products.name")}</Label>
                  <p className="text-sm text-foreground">{spell.name}</p>
                </div>
                <div className="space-y-2">
                  <Label>{t("spell.products.sku")}</Label>
                  <p className="text-sm font-mono text-foreground">{spell.sku}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("spell.products.type")}</Label>
                  <p className="text-sm text-foreground">
                    {spell.type === "one_time"
                      ? t("spell.products.type.one_time")
                      : t("spell.products.type.subscription")}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>{t("spell.products.status")}</Label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={spell.status === "active"}
                      onCheckedChange={handleStatusToggle}
                      disabled={isUpdatingStatus}
                    />
                    <span className="text-sm">
                      {spell.status === "active" ? "有効" : "無効"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Scopes</Label>
                  <div className="flex flex-wrap gap-1">
                    {spell.scopes.length === 0 ? (
                      <span className="text-xs text-muted-foreground">—</span>
                    ) : (
                      spell.scopes.map((scope) => (
                        <code key={scope} className="rounded bg-muted px-2 py-0.5 text-xs font-mono text-muted-foreground">
                          {scope}
                        </code>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">作成日時:</span>{" "}
                    <span className="text-foreground">
                      {formatDate(spell.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="entitlements" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">関連するEntitlements</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/spell/entitlements")}
              >
                すべて表示
              </Button>
            </CardHeader>
            <CardContent>
              {entitlements.length === 0 ? (
                <div className="text-sm text-muted-foreground">Entitlementはまだありません。</div>
              ) : (
                <div className="space-y-2">
                  {entitlements.map((ent) => (
                    <div
                      key={ent.entitlementId}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-spell-primary/20 flex items-center justify-center">
                          <Users className="h-4 w-4 text-spell-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-mono text-foreground">
                            {ent.userIdentifier}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            付与: {formatDate(ent.grantedAt)}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className={ent.status === "active" ? "border-blue-500/30 text-blue-500" : "border-orange-500/30 text-orange-500"}>
                        {ent.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distributions" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">配布物</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Spellは成果物を保持しません。配布はS3やGitHub Releaseなど外部ストレージで管理してください。
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stripe" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Stripe連携</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t("spell.products.stripe_product_id")}</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-muted text-sm font-mono">
                    {spell.stripeProductId ?? "未設定"}
                  </code>
                  {spell.stripeProductId && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopy(spell.stripeProductId, "productId")}
                      >
                        {copied === "productId" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a
                          href={`https://dashboard.stripe.com/products/${spell.stripeProductId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("spell.products.stripe_price_id")}</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-muted text-sm font-mono">
                    {spell.stripePriceId ?? "未設定"}
                  </code>
                  {spell.stripePriceId && (
                    <>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleCopy(spell.stripePriceId, "priceId")}
                      >
                        {copied === "priceId" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button size="icon" variant="ghost" asChild>
                        <a
                          href={`https://dashboard.stripe.com/prices/${spell.stripePriceId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Stripe Dashboardで商品情報を編集するとWebhookを通じて自動的に同期されます。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
