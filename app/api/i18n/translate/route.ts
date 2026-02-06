import { NextResponse } from "next/server"
import { localeNames, type Locale } from "@/lib/i18n/translations"

export const runtime = "nodejs"

const cache = new Map<string, string>()
const supportedLocales = new Set(Object.keys(localeNames))

function isLocale(value: string): value is Locale {
  return supportedLocales.has(value)
}

async function translateText(text: string, to: Locale) {
  const key = `${to}\u0000${text}`
  const cached = cache.get(key)
  if (cached) return cached

  const url =
    "https://translate.googleapis.com/translate_a/single" +
    `?client=gtx&sl=auto&tl=${encodeURIComponent(to)}&dt=t&q=${encodeURIComponent(text)}`

  try {
    const response = await fetch(url, {
      method: "GET",
      cache: "no-store",
    })
    if (!response.ok) {
      cache.set(key, text)
      return text
    }
    const payload = (await response.json()) as unknown
    if (!Array.isArray(payload) || !Array.isArray(payload[0])) {
      cache.set(key, text)
      return text
    }
    const segments = payload[0] as Array<[string]>
    const translated = segments.map((segment) => (Array.isArray(segment) ? segment[0] : "")).join("")
    const value = translated || text
    cache.set(key, value)
    return value
  } catch {
    cache.set(key, text)
    return text
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { to?: string; texts?: string[] }
    const to = body?.to
    const texts = Array.isArray(body?.texts) ? body.texts : []

    if (!to || !isLocale(to)) {
      return NextResponse.json({ error: "invalid locale" }, { status: 400 })
    }
    if (texts.length === 0) {
      return NextResponse.json({ translations: {} }, { status: 200 })
    }
    if (texts.length > 200) {
      return NextResponse.json({ error: "too many texts" }, { status: 400 })
    }

    const normalized = texts.map((text) => `${text ?? ""}`.slice(0, 1000))
    const unique = Array.from(new Set(normalized))
    const translations: Record<string, string> = {}

    for (const text of unique) {
      translations[text] = await translateText(text, to)
    }

    return NextResponse.json({ translations }, { status: 200 })
  } catch {
    return NextResponse.json({ error: "invalid request" }, { status: 400 })
  }
}

