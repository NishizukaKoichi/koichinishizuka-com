"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Camera, Plus, X, Globe, Github, Linkedin, Twitter, Youtube, Instagram, FileText, Link2 } from "@/components/icons"
import { useAuth } from "@/lib/auth/context"

type LinkType =
  | "website"
  | "github"
  | "linkedin"
  | "twitter"
  | "youtube"
  | "instagram"
  | "portfolio"
  | "blog"
  | "other"

interface ProfileLink {
  id: string
  type: LinkType
  url: string
  label?: string
}

interface ProfileData {
  displayName: string
  bio: string
  avatarUrl: string | null
  links: ProfileLink[]
  scoutVisible: boolean
}

const linkTypeConfig: Record<LinkType, { icon: React.ReactNode; label: string; placeholder: string }> = {
  website: { icon: <Globe className="h-4 w-4" />, label: "ウェブサイト", placeholder: "https://example.com" },
  github: { icon: <Github className="h-4 w-4" />, label: "GitHub", placeholder: "https://github.com/username" },
  linkedin: { icon: <Linkedin className="h-4 w-4" />, label: "LinkedIn", placeholder: "https://linkedin.com/in/username" },
  twitter: { icon: <Twitter className="h-4 w-4" />, label: "X (Twitter)", placeholder: "https://x.com/username" },
  youtube: { icon: <Youtube className="h-4 w-4" />, label: "YouTube", placeholder: "https://youtube.com/@channel" },
  instagram: { icon: <Instagram className="h-4 w-4" />, label: "Instagram", placeholder: "https://instagram.com/username" },
  portfolio: { icon: <FileText className="h-4 w-4" />, label: "ポートフォリオ", placeholder: "https://portfolio.example.com" },
  blog: { icon: <FileText className="h-4 w-4" />, label: "ブログ", placeholder: "https://blog.example.com" },
  other: { icon: <Link2 className="h-4 w-4" />, label: "その他", placeholder: "https://..." },
}

export function EpochProfileSettings() {
  const { userId } = useAuth()
  const [profile, setProfile] = useState<ProfileData>({
    displayName: "",
    bio: "",
    avatarUrl: null,
    links: [],
    scoutVisible: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!userId) {
      return
    }
    const load = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch("/api/epoch/profile", {
          headers: undefined,
        })
        if (!response.ok) {
          const payload = await response.json().catch(() => null)
          throw new Error(payload?.error || "プロフィールの取得に失敗しました")
        }
        const data = (await response.json()) as {
          profile: {
            displayName: string | null
            bio: string | null
            avatarUrl: string | null
            scoutVisible: boolean
            links: ProfileLink[]
          }
        }
        if (data.profile) {
          setProfile({
            displayName: data.profile.displayName ?? "",
            bio: data.profile.bio ?? "",
            avatarUrl: data.profile.avatarUrl ?? null,
            links: data.profile.links ?? [],
            scoutVisible: data.profile.scoutVisible ?? true,
          })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "プロフィールの取得に失敗しました"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [userId])

  const addLink = () => {
    const newLink: ProfileLink = {
      id: `link_${Date.now()}`,
      type: "website",
      url: "",
    }
    setProfile((prev) => ({ ...prev, links: [...prev.links, newLink] }))
  }

  const updateLink = (id: string, updates: Partial<ProfileLink>) => {
    setProfile((prev) => ({
      ...prev,
      links: prev.links.map((link) => (link.id === id ? { ...link, ...updates } : link)),
    }))
  }

  const removeLink = (id: string) => {
    setProfile((prev) => ({
      ...prev,
      links: prev.links.filter((link) => link.id !== id),
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setProfile((prev) => ({ ...prev, avatarUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    if (!userId) {
      setError("ログインが必要です")
      return
    }
    setIsSaving(true)
    setError(null)
    setSaved(false)
    try {
      const payload = {
        displayName: profile.displayName.trim() || null,
        bio: profile.bio.trim() || null,
        avatarUrl: profile.avatarUrl,
        scoutVisible: profile.scoutVisible,
        links: profile.links
          .filter((link) => link.url.trim().length > 0)
          .map((link) => ({
            type: link.type,
            url: link.url.trim(),
            label: link.label?.trim() || undefined,
          })),
      }
      const response = await fetch("/api/epoch/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          },
        body: JSON.stringify(payload),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || "プロフィールの保存に失敗しました")
      }
      setSaved(true)
    } catch (err) {
      const message = err instanceof Error ? err.message : "プロフィールの保存に失敗しました"
      setError(message)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-8">
      <div>
        <h2 className="text-lg font-medium text-foreground mb-2">プロフィール設定</h2>
        <p className="text-sm text-muted-foreground">
          プロフィールは履歴を持たない表層データです。変更はEpochRecordを生成しません。
        </p>
      </div>

      {isLoading && (
        <div className="rounded border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
          読み込み中...
        </div>
      )}
      {error && (
        <div className="rounded border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      {saved && !error && (
        <div className="rounded border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-500">
          保存しました
        </div>
      )}

      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profile.avatarUrl || undefined} />
              <AvatarFallback className="bg-secondary text-muted-foreground text-xl">
                {profile.displayName?.[0]?.toUpperCase() || "?"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 p-1.5 bg-secondary border border-border hover:bg-accent transition-colors"
              aria-label="プロフィール画像を変更"
            >
              <Camera className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-muted-foreground leading-relaxed">
              デフォルトは認証アカウント由来のアバター。 取得不可の場合は抽象プレースホルダー。
            </p>
          </div>
        </div>

        {/* Display Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">表示名</label>
          <Input
            value={profile.displayName}
            onChange={(e) => setProfile((prev) => ({ ...prev, displayName: e.target.value }))}
            placeholder="表示名を入力"
            className="bg-background border-border text-foreground placeholder:text-muted-foreground"
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">いつでも変更可能。履歴性を持ちません。</p>
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">自己紹介</label>
          <Textarea
            value={profile.bio}
            onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
            placeholder="短い自己紹介（任意）"
            className="bg-background border-border text-foreground placeholder:text-muted-foreground resize-none min-h-24"
            maxLength={200}
          />
          <p className="text-xs text-muted-foreground text-right">{profile.bio.length}/200</p>
        </div>

        {/* Links */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-foreground">リンク</label>
            <span className="text-xs text-muted-foreground">{profile.links.length}/10</span>
          </div>
          <p className="text-xs text-muted-foreground">
            ウェブサイト、SNS、ポートフォリオなどのURLを追加できます。
          </p>

          <div className="space-y-3">
            {profile.links.map((link) => (
              <div key={link.id} className="p-3 bg-muted/30 border border-border rounded-md space-y-2">
                <div className="flex items-center gap-2">
                  <Select
                    value={link.type}
                    onValueChange={(v) => updateLink(link.id, { type: v as LinkType })}
                  >
                    <SelectTrigger className="w-40 bg-secondary border-border text-foreground h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {Object.entries(linkTypeConfig).map(([type, config]) => (
                        <SelectItem key={type} value={type} className="text-foreground">
                          <div className="flex items-center gap-2">
                            {config.icon}
                            <span>{config.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => removeLink(link.id)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="リンクを削除"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-muted-foreground">
                    {linkTypeConfig[link.type].icon}
                  </div>
                  <Input
                    value={link.url}
                    onChange={(e) => updateLink(link.id, { url: e.target.value })}
                    placeholder={linkTypeConfig[link.type].placeholder}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground h-9"
                  />
                </div>

                {link.type === "other" && (
                  <Input
                    value={link.label || ""}
                    onChange={(e) => updateLink(link.id, { label: e.target.value })}
                    placeholder="リンクのラベル（例: Dribbble）"
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground h-9"
                    maxLength={30}
                  />
                )}
              </div>
            ))}
          </div>

          {profile.links.length < 10 && (
            <Button
              type="button"
              variant="outline"
              onClick={addLink}
              className="w-full border-dashed border-border text-muted-foreground hover:text-foreground bg-transparent"
            >
              <Plus className="h-4 w-4 mr-2" />
              リンクを追加
            </Button>
          )}
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSaving ? "保存中..." : "保存する"}
        </Button>
      </div>
    </div>
  )
}
