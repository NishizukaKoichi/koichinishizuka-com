"use client"

import React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Sparkles, ChevronLeft, Mail, Key } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n/context"

export default function MagicSpellLoginPage() {
  const { t } = useI18n()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSent(true)
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
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
            <Sparkles className="h-5 w-5 text-magicspell-primary" />
            <span className="font-semibold text-foreground">
              {t("magicspell.title")}
            </span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-magicspell-primary/10">
              <Sparkles className="h-6 w-6 text-magicspell-primary" />
            </div>
            <h1 className="text-2xl font-light text-foreground mb-2">
              {t("magicspell.landing.login_btn")}
            </h1>
            <p className="text-sm text-muted-foreground">
              Talismanアカウントでログイン
            </p>
          </div>

          {sent ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center">
              <Mail className="mx-auto h-8 w-8 text-magicspell-primary mb-4" />
              <h2 className="font-medium text-foreground mb-2">
                メールを送信しました
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {email} にログインリンクを送信しました。メールを確認してください。
              </p>
              <Button
                variant="outline"
                onClick={() => setSent(false)}
                className="bg-transparent"
              >
                別のメールアドレスを使用
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="rounded-lg border border-border bg-card p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">メールアドレス</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={isLoading}
                >
                  <Key className="h-4 w-4" />
                  {isLoading ? "送信中..." : "Magic Linkを送信"}
                </Button>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                アカウントをお持ちでない場合は{" "}
                <Link
                  href="/magicspell/landing"
                  className="text-magicspell-primary hover:underline"
                >
                  新規登録
                </Link>
              </p>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
