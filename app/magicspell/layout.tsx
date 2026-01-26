import React from "react"
import { MagicSpellHeader } from "@/components/magicspell/magicspell-header"

export default function MagicSpellLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <MagicSpellHeader />
      <main>{children}</main>
    </div>
  )
}
