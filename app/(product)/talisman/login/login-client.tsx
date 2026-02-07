"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Shield,
  ChevronLeft,
  Fingerprint,
  Mail,
  Phone,
  Globe,
  Key,
  Check,
  Lock,
  ArrowRight,
} from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useI18n } from "@/lib/i18n/context"
import { ensurePersonId } from "@/lib/talisman/client"
import { useAuth } from "@/lib/auth/context"

type CredentialType =
  | "email_magiclink"
  | "phone_otp"
  | "oauth_google"
  | "oauth_apple"
  | "oauth_microsoft"
  | "oauth_x"
  | "passkey"
  | "payment_card"

type CredentialItem = {
  id: string
  type: CredentialType
  normalizedHash: string
  verified: boolean
}

export default function TalismanLoginClient({ nextPath }: { nextPath: string | null }) {
  const { t, locale } = useI18n()
  const router = useRouter()
  const { login } = useAuth()

  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([])
  const [step, setStep] = useState<"select" | "verify">("select")
  const [verifying, setVerifying] = useState(false)
  const [emailCode, setEmailCode] = useState("")
  const [credentials, setCredentials] = useState<CredentialItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const requiredFactors = 1
  const canProceed = selectedCredentials.length >= requiredFactors
  const registerHref = nextPath
    ? `/talisman/credentials/new?next=${encodeURIComponent(nextPath)}`
    : "/talisman/credentials/new"

  const toggleCredential = (id: string) => {
    setSelectedCredentials((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]))
  }

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const personId = await ensurePersonId()
        if (!active) return
        const response = await fetch(`/api/v1/talisman/credentials?person_id=${encodeURIComponent(personId)}`)
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || t("talisman.login.error.credentials_fetch"))
        }
        const data = (await response.json()) as {
          credentials: Array<{
            credential_id: string
            type: CredentialType
            normalized_hash: string
            revoked_at: string | null
          }>
        }
        if (!active) return
        setCredentials(
          data.credentials.map((cred) => ({
            id: cred.credential_id,
            type: cred.type,
            normalizedHash: cred.normalized_hash,
            verified: !cred.revoked_at,
          })),
        )
        setError(null)
      } catch (err) {
        if (!active) return
        const message = err instanceof Error ? err.message : t("talisman.login.error.credentials_fetch")
        setError(message)
      } finally {
        if (active) setIsLoading(false)
      }
    }

    void load()

    return () => {
      active = false
    }
  }, [t])

  const handleVerify = async () => {
    if (!canProceed) return
    setVerifying(true)
    setError(null)

    try {
      const personId = await ensurePersonId()
      const response = await fetch(`/api/v1/talisman/persons/${encodeURIComponent(personId)}/signal`)
      if (!response.ok) {
        const payload = await response.json().catch(() => null)
        throw new Error(payload?.error || t("talisman.login.error.authentication_failed"))
      }
      await login(personId)
      router.push(nextPath ?? "/talisman")
    } catch (err) {
      const message = err instanceof Error ? err.message : t("talisman.login.error.authentication_failed")
      setError(message)
    } finally {
      setVerifying(false)
    }
  }

  const handleProceedToVerify = () => {
    setStep("verify")
  }

  const selectedCredentialData = credentials.filter((c) => c.verified && selectedCredentials.includes(c.id))
  const selectedCount = selectedCredentials.length
  const continueLabel =
    locale === "ja"
      ? `${selectedCount}つの認証で続ける`
      : `Continue with ${selectedCount} credential${selectedCount === 1 ? "" : "s"}`
  const selectRequiredLabel =
    locale === "ja"
      ? `認証手段を${requiredFactors}つ以上選択`
      : `Select at least ${requiredFactors} credential${requiredFactors === 1 ? "" : "s"}`
  const requiredFactorsLabel =
    locale === "ja"
      ? `${requiredFactors}つの認証が必要`
      : `${requiredFactors} credential${requiredFactors === 1 ? "" : "s"} required`

  const credentialIcon = (type: CredentialType) => {
    switch (type) {
      case "email_magiclink":
        return Mail
      case "phone_otp":
        return Phone
      case "oauth_google":
      case "oauth_apple":
      case "oauth_microsoft":
      case "oauth_x":
        return Globe
      case "passkey":
        return Fingerprint
      default:
        return Key
    }
  }

  const credentialLabel = (cred: CredentialItem) => {
    const hash = cred.normalizedHash
    if (!hash) return t(`talisman.cred.${cred.type}`)
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex h-12 max-w-md items-center justify-between px-4">
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
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        {step === "select" ? (
          <>
            {/* Title */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-light text-foreground">{t("talisman.login.title")}</h1>
              <p className="text-sm text-muted-foreground">{t("talisman.login.subtitle")}</p>
              {requiredFactors > 1 && (
                <Badge variant="outline" className="mt-2 border-amber-500 text-amber-500">
                  <Lock className="mr-1 h-3 w-3" />
                  {requiredFactorsLabel}
                </Badge>
              )}
            </div>

            {/* Registered Credentials */}
            <div className="mb-8 space-y-3">
              {error && (
                <Card className="border-destructive/50">
                  <CardContent className="pt-4 text-sm text-destructive">{error}</CardContent>
                </Card>
              )}
              {!isLoading && credentials.length === 0 && (
                <Card>
                  <CardContent className="pt-4 text-sm text-muted-foreground">
                    {t("talisman.login.no_credentials")}
                  </CardContent>
                </Card>
              )}
              {credentials.map((credential) => {
                const Icon = credentialIcon(credential.type)
                const isSelected = selectedCredentials.includes(credential.id)
                const isSelectable = credential.verified

                return (
                  <Card
                    key={credential.id}
                    className={`cursor-pointer transition-all ${
                      isSelected ? "border-cyan-500 bg-cyan-500/5" : "border-border hover:border-muted-foreground/50"
                    } ${isSelectable ? "" : "cursor-not-allowed opacity-50"}`}
                    onClick={() => {
                      if (!isSelectable) return
                      toggleCredential(credential.id)
                    }}
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                            isSelected ? "bg-cyan-500/20" : "bg-muted"
                          }`}
                        >
                          <Icon className={`h-5 w-5 ${isSelected ? "text-cyan-500" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{credentialLabel(credential)}</p>
                          <p className="text-xs capitalize text-muted-foreground">{t(`talisman.cred.${credential.type}`)}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500">
                          <Check className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Proceed Button */}
            <Button
              className="w-full gap-2 bg-cyan-500 text-white hover:bg-cyan-600"
              disabled={!canProceed || isLoading}
              onClick={handleProceedToVerify}
            >
              {canProceed ? continueLabel : selectRequiredLabel}
              {canProceed && <ArrowRight className="h-4 w-4" />}
            </Button>

            {/* Links */}
            <div className="mt-6 space-y-2 text-center">
              <p className="text-sm text-muted-foreground">{t("talisman.login.no_account")}</p>
              <Link href={registerHref} className="text-sm text-cyan-500 hover:underline">
                {t("talisman.login.register")}
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* Verify Step */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-light text-foreground">{t("talisman.login.verify_title")}</h1>
              <p className="text-sm text-muted-foreground">{t("talisman.login.verify_subtitle")}</p>
            </div>

            <div className="space-y-4">
              {selectedCredentialData.map((credential) => {
                const Icon = credentialIcon(credential.type)

                return (
                  <Card key={credential.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                          <Icon className="h-5 w-5 text-cyan-500" />
                        </div>
                        <div>
                          <CardTitle className="text-sm">{credentialLabel(credential)}</CardTitle>
                          <CardDescription className="text-xs capitalize">{t(`talisman.cred.${credential.type}`)}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {credential.type === "passkey" && (
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={handleVerify}
                          disabled={verifying}
                        >
                          <Fingerprint className="mr-2 h-4 w-4" />
                          {verifying ? t("talisman.login.verifying") : t("talisman.login.verify_passkey")}
                        </Button>
                      )}
                      {credential.type === "email_magiclink" && (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">{t("talisman.login.code_sent_email")}</p>
                          <div className="flex gap-2">
                            <Input
                              placeholder={t("talisman.login.code_placeholder")}
                              value={emailCode}
                              onChange={(e) => setEmailCode(e.target.value)}
                              className="flex-1"
                            />
                            <Button
                              onClick={handleVerify}
                              disabled={verifying || emailCode.length < 6}
                              className="bg-cyan-500 text-white hover:bg-cyan-600"
                            >
                              {verifying ? "..." : t("talisman.login.confirm")}
                            </Button>
                          </div>
                        </div>
                      )}
                      {credential.type === "phone_otp" && (
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground">{t("talisman.login.code_sent_sms")}</p>
                          <div className="flex gap-2">
                            <Input placeholder={t("talisman.login.code_placeholder")} className="flex-1" />
                            <Button
                              onClick={handleVerify}
                              disabled={verifying}
                              className="bg-cyan-500 text-white hover:bg-cyan-600"
                            >
                              {verifying ? "..." : t("talisman.login.confirm")}
                            </Button>
                          </div>
                        </div>
                      )}
                      {(credential.type === "oauth_google" ||
                        credential.type === "oauth_apple" ||
                        credential.type === "oauth_microsoft" ||
                        credential.type === "oauth_x") && (
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={handleVerify}
                          disabled={verifying}
                        >
                          <Globe className="mr-2 h-4 w-4" />
                          {verifying ? t("talisman.login.verifying") : t("talisman.login.verify_oauth")}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Button variant="ghost" className="mt-4 w-full" onClick={() => setStep("select")}>
              {t("common.back")}
            </Button>
          </>
        )}
      </main>
    </div>
  )
}

