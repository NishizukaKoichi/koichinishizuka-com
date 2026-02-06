import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { I18nProvider } from "@/lib/i18n/context"
import { AuthProvider } from "@/lib/auth/context"
import { AutoTranslator } from "@/components/i18n/auto-translator"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Epoch",
  description: "Record decisions and actions as immutable layers of time",
  generator: "Epoch",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  themeColor: "#141414",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <AuthProvider>
          <I18nProvider>
            <AutoTranslator />
            {children}
          </I18nProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
