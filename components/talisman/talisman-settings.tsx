"use client"

import { useState } from "react"
import { Settings, Shield, ToggleLeft, Mail, Phone, Chrome, Apple, Key, CreditCard } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { useI18n } from "@/lib/i18n/context"

const authMethods = [
  { type: "email_magiclink", icon: Mail, label: "Email (Magic Link)" },
  { type: "phone_otp", icon: Phone, label: "Phone (OTP)" },
  { type: "oauth_google", icon: Chrome, label: "Google OAuth" },
  { type: "oauth_apple", icon: Apple, label: "Apple OAuth" },
  { type: "passkey", icon: Key, label: "Passkey" },
  { type: "payment_card", icon: CreditCard, label: "Payment Card" },
]

export function TalismanSettings() {
  const { t } = useI18n()
  const [authMode, setAuthMode] = useState<"auto" | "restricted">("auto")
  const [enabledMethods, setEnabledMethods] = useState<string[]>(authMethods.map(m => m.type))

  const toggleMethod = (type: string) => {
    if (enabledMethods.includes(type)) {
      setEnabledMethods(enabledMethods.filter(m => m !== type))
    } else {
      setEnabledMethods([...enabledMethods, type])
    }
  }

  return (
    <div className="space-y-6">
      {/* Auth Methods */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <CardTitle>{t("talisman.settings.auth_methods")}</CardTitle>
          </div>
          <CardDescription>{t("talisman.settings.auth_methods_desc")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={authMode} onValueChange={(value) => setAuthMode(value as "auto" | "restricted")}>
            <div className="flex items-start space-x-3 rounded-lg border border-border p-4">
              <RadioGroupItem value="auto" id="auto" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="auto" className="font-medium cursor-pointer">
                  {t("talisman.settings.auto")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("talisman.settings.auto_desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border border-border p-4">
              <RadioGroupItem value="restricted" id="restricted" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="restricted" className="font-medium cursor-pointer">
                  {t("talisman.settings.restricted")}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {t("talisman.settings.restricted_desc")}
                </p>
              </div>
            </div>
          </RadioGroup>

          {authMode === "restricted" && (
            <div className="space-y-3 pt-2">
              <p className="text-sm font-medium">Allowed methods:</p>
              {authMethods.map((method) => {
                const Icon = method.icon
                const isEnabled = enabledMethods.includes(method.type)
                return (
                  <div
                    key={method.type}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{method.label}</span>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleMethod(method.type)}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Behavior Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Behavior</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Allow credential self-revocation</p>
              <p className="text-sm text-muted-foreground">
                Users can revoke their own credentials
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Notify on score change</p>
              <p className="text-sm text-muted-foreground">
                Send webhook when a person&apos;s score changes
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Require issuer for credentials</p>
              <p className="text-sm text-muted-foreground">
                All credentials must have an issuer specified
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reset API Key</p>
              <p className="text-sm text-muted-foreground">
                Generate a new API key. The old key will be invalidated.
              </p>
            </div>
            <Button variant="outline" className="bg-transparent border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
              Reset Key
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Export All Data</p>
              <p className="text-sm text-muted-foreground">
                Download all person, credential, and event data.
              </p>
            </div>
            <Button variant="outline" className="bg-transparent">
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex justify-end">
        <Button>Save Settings</Button>
      </div>
    </div>
  )
}
