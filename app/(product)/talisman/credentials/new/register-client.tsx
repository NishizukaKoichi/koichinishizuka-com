"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Shield, Fingerprint, Mail, Phone, Globe, Check, ArrowRight, Loader2 } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n/context"
import { ensurePersonId } from "@/lib/talisman/client"
import { useAuth } from "@/lib/auth/context"

// 登録時に選べる認証手段
type CredentialType =
  | "email_magiclink"
  | "phone_otp"
  | "oauth_google"
  | "oauth_apple"
  | "oauth_microsoft"
  | "oauth_x"
  | "passkey"

const oauthProviders: Array<{ label: string; type: CredentialType }> = [
  { label: "Google", type: "oauth_google" },
  { label: "Apple", type: "oauth_apple" },
  { label: "Microsoft", type: "oauth_microsoft" },
  { label: "X", type: "oauth_x" },
]

const authMethods = [
  {
    id: "passkey",
    type: "passkey" as const,
    name: "Passkey",
    description: "最も安全。デバイスの生体認証を使用",
    icon: Fingerprint,
    recommended: true,
  },
  {
    id: "email",
    type: "email" as const,
    name: "メールアドレス",
    description: "メールで確認コードを送信",
    icon: Mail,
    recommended: false,
  },
  {
    id: "phone",
    type: "phone" as const,
    name: "電話番号",
    description: "SMSで確認コードを送信",
    icon: Phone,
    recommended: false,
  },
  {
    id: "oauth",
    type: "oauth" as const,
    name: "ソーシャルログイン",
    description: "Google, GitHub等でログイン",
    icon: Globe,
    recommended: false,
  },
]

type Step = "select" | "verify" | "complete"

export default function RegisterClient({ nextPath }: { nextPath: string | null }) {
  const router = useRouter()
  const { t } = useI18n()
  const { login } = useAuth()

  const loginHref = nextPath ? `/talisman/login?next=${encodeURIComponent(nextPath)}` : "/talisman/login"

  const [step, setStep] = useState<Step>("select")
  const [selectedMethod, setSelectedMethod] = useState<(typeof authMethods)[0] | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [oauthType, setOauthType] = useState<CredentialType | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSelectMethod = (method: (typeof authMethods)[0]) => {
    setSelectedMethod(method)
    setInputValue("")
    setOauthType(null)
    setVerificationCode("")
    setError(null)
  }

  const handleSendCode = async () => {
    if (!inputValue) return
    setIsSubmitting(true)
    // Simulate sending verification code
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setStep("verify")
  }

  const handleVerify = async () => {
    if (!verificationCode || !selectedMethod) return
    setIsSubmitting(true)

    // Simulate verification
    await new Promise((resolve) => setTimeout(resolve, 1500))

    try {
      const mappedType = (() => {
        if (selectedMethod.type === "email") return "email_magiclink"
        if (selectedMethod.type === "phone") return "phone_otp"
        if (selectedMethod.type === "oauth") return oauthType
        return null
      })()

      if (!mappedType) {
        throw new Error("認証方式が選択されていません")
      }

      const personId = await ensurePersonId()
      const rawValue = selectedMethod.type === "oauth" ? `${inputValue.toLowerCase()}-${Date.now()}` : inputValue

      const response = await fetch("/api/v1/talisman/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_id: personId,
          type: mappedType,
          raw_value: rawValue,
          issuer: "talisman-ui",
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Credentialの登録に失敗しました")
      }

      await login(personId)
      if (nextPath) {
        router.push(nextPath)
        return
      }

      setStep("complete")
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Credentialの登録に失敗しました"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasskeyRegister = async () => {
    setIsSubmitting(true)

    // Simulate WebAuthn registration
    await new Promise((resolve) => setTimeout(resolve, 2000))

    try {
      const personId = await ensurePersonId()
      const response = await fetch("/api/v1/talisman/credentials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          person_id: personId,
          type: "passkey",
          raw_value: `passkey-${Date.now()}`,
          issuer: "talisman-ui",
        }),
      })

      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || "Credentialの登録に失敗しました")
      }

      await login(personId)
      if (nextPath) {
        router.push(nextPath)
        return
      }

      setStep("complete")
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Credentialの登録に失敗しました"
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-lg items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Shield className="h-5 w-5 text-cyan-400" />
            <span className="font-semibold text-foreground">Talisman</span>
          </div>
          <Link href={loginHref}>
            <Button variant="ghost" size="sm" className="text-sm text-muted-foreground">
              {t("talisman.landing.login_btn")}
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 py-8">
        {step === "select" && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-foreground">アカウントを作成</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                最初の認証手段を選択してください。
                <br />
                この認証手段がそのまま1つ目のCredentialになります。
              </p>
            </div>
            {error && (
              <Card className="border-destructive/50">
                <CardContent className="pt-4 text-sm text-destructive">{error}</CardContent>
              </Card>
            )}

            <div className="space-y-3">
              {authMethods.map((method) => {
                const Icon = method.icon
                const isSelected = selectedMethod?.id === method.id
                return (
                  <button
                    key={method.id}
                    onClick={() => handleSelectMethod(method)}
                    className={`w-full rounded-lg border p-4 text-left transition-colors ${
                      isSelected
                        ? "border-cyan-500 bg-cyan-500/5"
                        : "border-border bg-card hover:border-muted-foreground/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-md ${
                          isSelected ? "bg-cyan-500/20" : "bg-muted"
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${isSelected ? "text-cyan-400" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-foreground">{method.name}</span>
                          {method.recommended && (
                            <span className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[10px] font-medium text-cyan-400">
                              推奨
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">{method.description}</p>
                      </div>
                      {isSelected && <Check className="h-5 w-5 text-cyan-400" />}
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Input for selected method */}
            {selectedMethod && selectedMethod.type !== "passkey" && (
              <Card>
                <CardContent className="pt-4">
                  {selectedMethod.type === "email" && (
                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス</Label>
                      <Input
                        id="email"
                        type="email"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                  )}
                  {selectedMethod.type === "phone" && (
                    <div className="space-y-2">
                      <Label htmlFor="phone">電話番号</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="+81 90-1234-5678"
                      />
                    </div>
                  )}
                  {selectedMethod.type === "oauth" && (
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground">連携するサービスを選択</p>
                      <div className="grid grid-cols-2 gap-2">
                        {oauthProviders.map((provider) => (
                          <Button
                            key={provider.label}
                            variant="outline"
                            className="bg-transparent"
                            onClick={() => {
                              setInputValue(provider.label)
                              setOauthType(provider.type)
                            }}
                          >
                            {provider.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Action button */}
            <div className="pt-4">
              {selectedMethod?.type === "passkey" ? (
                <Button
                  onClick={handlePasskeyRegister}
                  disabled={isSubmitting}
                  className="w-full gap-2 bg-cyan-500 hover:bg-cyan-600"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Fingerprint className="h-4 w-4" />}
                  {isSubmitting ? "認証中..." : "Passkeyで登録"}
                </Button>
              ) : (
                selectedMethod && (
                  <Button
                    onClick={handleSendCode}
                    disabled={!inputValue || isSubmitting}
                    className="w-full gap-2 bg-cyan-500 hover:bg-cyan-600"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                    {isSubmitting ? "送信中..." : "確認コードを送信"}
                  </Button>
                )
              )}
            </div>
          </div>
        )}

        {step === "verify" && selectedMethod && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-xl font-semibold text-foreground">確認コードを入力</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {selectedMethod.type === "email"
                  ? `${inputValue} に送信された6桁のコードを入力してください`
                  : `${inputValue} に送信された6桁のコードを入力してください`}
              </p>
            </div>
            {error && (
              <Card className="border-destructive/50">
                <CardContent className="pt-4 text-sm text-destructive">{error}</CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <Input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                className="text-center text-2xl tracking-[0.5em] font-mono"
                maxLength={6}
              />

              <Button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || isSubmitting}
                className="w-full gap-2 bg-cyan-500 hover:bg-cyan-600"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                {isSubmitting ? "確認中..." : "確認して登録"}
              </Button>

              <button
                onClick={() => setStep("select")}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                認証方法を変更
              </button>
            </div>
          </div>
        )}

        {step === "complete" && (
          <div className="space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10">
              <Check className="h-8 w-8 text-cyan-400" />
            </div>

            <div>
              <h1 className="text-xl font-semibold text-foreground">登録完了</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Talismanアカウントが作成されました。
                <br />
                使用した認証手段が1つ目のCredentialとして登録されています。
              </p>
            </div>

            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-cyan-500/10">
                    {selectedMethod && <selectedMethod.icon className="h-5 w-5 text-cyan-400" />}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-foreground">
                      {selectedMethod?.type === "passkey" ? "このデバイス" : inputValue}
                    </p>
                    <p className="text-sm text-muted-foreground">1つ目のCredential</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3 pt-4">
              <Link href="/talisman/credentials">
                <Button className="w-full gap-2 bg-cyan-500 hover:bg-cyan-600">
                  Credentialを追加する
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                Credentialを3つ以上登録すると、すべての機能にアクセスできます
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
