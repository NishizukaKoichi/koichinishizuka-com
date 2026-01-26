"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Save,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Users,
  Activity,
  Sparkles,
  Key,
  Package,
  Download,
} from "@/components/icons";
import { useI18n } from "@/lib/i18n/context";

// Mock data
const mockProduct = {
  id: "spell_001",
  name: "Pro Execution",
  sku: "PRO_EXEC",
  description: "プレミアム機能への実行権。すべてのPro機能を利用可能。",
  price: 2980,
  currency: "JPY",
  type: "subscription" as const,
  interval: "month" as const,
  status: "active" as const,
  stripeProductId: "prod_ABC123",
  stripePriceId: "price_XYZ789",
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2024-01-20T15:30:00Z",
  scopes: ["premium:execute", "premium:export"],
  stats: {
    totalEntitlements: 156,
    activeEntitlements: 142,
    totalDownloads: 321,
    recentActivity: 24,
  },
};

const mockEntitlements = [
  {
    id: "ent_001",
    userId: "user_abc123",
    grantedAt: "2024-01-18T10:00:00Z",
    expiresAt: null,
    source: "stripe",
  },
  {
    id: "ent_002",
    userId: "user_def456",
    grantedAt: "2024-01-17T14:30:00Z",
    expiresAt: null,
    source: "stripe",
  },
  {
    id: "ent_003",
    userId: "user_ghi789",
    grantedAt: "2024-01-16T09:15:00Z",
    expiresAt: "2025-01-16T09:15:00Z",
    source: "manual",
  },
];

const mockDistributions = [
  {
    id: "dist_001",
    fileName: "proeditor-v2.1.0-win.zip",
    version: "2.1.0",
    platform: "Windows",
    downloads: 234,
    createdAt: "2024-01-20T12:00:00Z",
  },
  {
    id: "dist_002",
    fileName: "proeditor-v2.1.0-mac.dmg",
    version: "2.1.0",
    platform: "macOS",
    downloads: 189,
    createdAt: "2024-01-20T12:00:00Z",
  },
];

export function MagicSpellSpellDetail() {
  const { t, language } = useI18n();
  const router = useRouter();
  const params = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [product, setProduct] = useState(mockProduct);

  const handleCopy = (text: string, key: string) => {
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

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/magicspell/products")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-foreground">
                {product.name}
              </h1>
              <Badge
                variant={product.status === "active" ? "default" : "secondary"}
                className={
                  product.status === "active"
                    ? "bg-magicspell-primary/20 text-magicspell-primary border-magicspell-primary/30"
                    : ""
                }
              >
                {product.status === "active"
                  ? t("magicspell.products.active")
                  : t("magicspell.products.inactive")}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{product.sku}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                キャンセル
              </Button>
              <Button
                className="bg-magicspell-primary hover:bg-magicspell-secondary text-white"
                onClick={() => setIsEditing(false)}
              >
                <Save className="h-4 w-4 mr-2" />
                保存
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                編集
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    削除
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>商品を削除しますか？</AlertDialogTitle>
                    <AlertDialogDescription>
                      この操作は取り消せません。関連するEntitlementと配布物も影響を受けます。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>キャンセル</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground"
                      onClick={() => router.push("/magicspell/products")}
                    >
                      削除する
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="border-border/50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-magicspell-primary/10">
                <Users className="h-4 w-4 text-magicspell-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {product.stats.activeEntitlements}
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
                  {product.stats.totalEntitlements}
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
                <Download className="h-4 w-4 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {product.stats.totalDownloads}
                </p>
                <p className="text-xs text-muted-foreground">総DL数</p>
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
                  {product.stats.recentActivity}
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
              <CardTitle className="text-base">商品情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("magicspell.products.name")}</Label>
                  {isEditing ? (
                    <Input
                      value={product.name}
                      onChange={(e) =>
                        setProduct({ ...product, name: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm text-foreground">{product.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("magicspell.products.sku")}</Label>
                  {isEditing ? (
                    <Input
                      value={product.sku}
                      onChange={(e) =>
                        setProduct({ ...product, sku: e.target.value })
                      }
                    />
                  ) : (
                    <p className="text-sm font-mono text-foreground">
                      {product.sku}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>説明</Label>
                {isEditing ? (
                  <Textarea
                    value={product.description}
                    onChange={(e) =>
                      setProduct({ ...product, description: e.target.value })
                    }
                    rows={3}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{t("magicspell.products.price")}</Label>
                  {isEditing ? (
                    <Input
                      type="number"
                      value={product.price}
                      onChange={(e) =>
                        setProduct({
                          ...product,
                          price: Number(e.target.value),
                        })
                      }
                    />
                  ) : (
                    <p className="text-sm font-medium text-foreground">
                      {formatPrice(product.price, product.currency)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("magicspell.products.type")}</Label>
                  {isEditing ? (
                    <Select
                      value={product.type}
                      onValueChange={(value: "one_time" | "subscription") =>
                        setProduct({ ...product, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="one_time">
                          {t("magicspell.products.type.one_time")}
                        </SelectItem>
                        <SelectItem value="subscription">
                          {t("magicspell.products.type.subscription")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-foreground">
                      {product.type === "one_time"
                        ? t("magicspell.products.type.one_time")
                        : t("magicspell.products.type.subscription")}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>{t("magicspell.products.status")}</Label>
                  {isEditing ? (
                    <div className="flex items-center gap-2 pt-2">
                      <Switch
                        checked={product.status === "active"}
                        onCheckedChange={(checked) =>
                          setProduct({
                            ...product,
                            status: checked ? "active" : "inactive",
                          })
                        }
                      />
                      <span className="text-sm">
                        {product.status === "active" ? "有効" : "無効"}
                      </span>
                    </div>
                  ) : (
                    <Badge
                      variant={
                        product.status === "active" ? "default" : "secondary"
                      }
                    >
                      {product.status === "active"
                        ? t("magicspell.products.active")
                        : t("magicspell.products.inactive")}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">作成日時:</span>{" "}
                    <span className="text-foreground">
                      {formatDate(product.createdAt)}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">更新日時:</span>{" "}
                    <span className="text-foreground">
                      {formatDate(product.updatedAt)}
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
                onClick={() => router.push("/magicspell/entitlements")}
              >
                すべて表示
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockEntitlements.map((ent) => (
                  <div
                    key={ent.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-magicspell-primary/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-magicspell-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-mono text-foreground">
                          {ent.userId}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          付与: {formatDate(ent.grantedAt)}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        ent.source === "stripe"
                          ? "border-blue-500/30 text-blue-500"
                          : "border-orange-500/30 text-orange-500"
                      }
                    >
                      {ent.source}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distributions" className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">配布物</CardTitle>
              <Button
                size="sm"
                className="bg-magicspell-primary hover:bg-magicspell-secondary text-white"
                onClick={() => router.push("/magicspell/distribution")}
              >
                アップロード
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {mockDistributions.map((dist) => (
                  <div
                    key={dist.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                        <Package className="h-4 w-4 text-purple-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {dist.fileName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          v{dist.version} / {dist.platform} / {dist.downloads}{" "}
                          DL
                        </p>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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
                <Label>{t("magicspell.products.stripe_product_id")}</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-muted text-sm font-mono">
                    {product.stripeProductId}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      handleCopy(product.stripeProductId, "productId")
                    }
                  >
                    {copied === "productId" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button size="icon" variant="ghost" asChild>
                    <a
                      href={`https://dashboard.stripe.com/products/${product.stripeProductId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("magicspell.products.stripe_price_id")}</Label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 rounded bg-muted text-sm font-mono">
                    {product.stripePriceId}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleCopy(product.stripePriceId, "priceId")}
                  >
                    {copied === "priceId" ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button size="icon" variant="ghost" asChild>
                    <a
                      href={`https://dashboard.stripe.com/prices/${product.stripePriceId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-sm text-muted-foreground">
                  Stripe
                  Dashboardで商品情報を編集すると、Webhookを通じて自動的に同期されます。
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
