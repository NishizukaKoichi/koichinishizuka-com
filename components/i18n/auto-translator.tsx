"use client"

import { useEffect, useRef } from "react"
import { useI18n } from "@/lib/i18n/context"

type Target =
  | { type: "text"; node: Text; original: string }
  | { type: "attr"; el: HTMLElement; attr: "placeholder" | "title" | "aria-label"; original: string }

const originalTextByNode = new WeakMap<Text, string>()
const originalAttrByElement = new WeakMap<HTMLElement, Record<string, string>>()
const translationCache = new Map<string, string>()

function isSkippableNode(node: Node) {
  const parent = node.parentElement
  if (!parent) return true
  if (
    parent.closest(
      "script,style,noscript,code,pre,kbd,samp,var,textarea,option,[data-no-auto-translate='1']",
    )
  ) {
    return true
  }
  return false
}

function looksTranslatable(text: string) {
  const value = text.trim()
  if (!value) return false
  if (/^[0-9\s.,:/%()+-]+$/.test(value)) return false
  if (/^[A-Za-z0-9._-]+$/.test(value) && value.length < 4) return false
  if (/^(https?:\/\/|www\.)/i.test(value)) return false
  return true
}

function chunk<T>(input: T[], size: number) {
  const out: T[][] = []
  for (let i = 0; i < input.length; i += size) {
    out.push(input.slice(i, i + size))
  }
  return out
}

function collectTargets(root: HTMLElement): Target[] {
  const targets: Target[] = []

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let n = walker.nextNode()
  while (n) {
    const textNode = n as Text
    if (!isSkippableNode(textNode)) {
      const current = textNode.nodeValue ?? ""
      if (!originalTextByNode.has(textNode)) {
        originalTextByNode.set(textNode, current)
      }
      const original = originalTextByNode.get(textNode) ?? current
      if (looksTranslatable(original)) {
        targets.push({ type: "text", node: textNode, original })
      }
    }
    n = walker.nextNode()
  }

  const attrElements = root.querySelectorAll<HTMLElement>("input,textarea,button,a,[title],[aria-label]")
  for (const el of attrElements) {
    if (el.closest("[data-no-auto-translate='1']")) continue
    const attrs: Array<"placeholder" | "title" | "aria-label"> = ["placeholder", "title", "aria-label"]
    for (const attr of attrs) {
      const value = el.getAttribute(attr)
      if (!value) continue
      const saved = originalAttrByElement.get(el) ?? {}
      if (!saved[attr]) {
        saved[attr] = value
        originalAttrByElement.set(el, saved)
      }
      const original = saved[attr] ?? value
      if (looksTranslatable(original)) {
        targets.push({ type: "attr", el, attr, original })
      }
    }
  }

  return targets
}

async function fetchTranslations(texts: string[], to: string) {
  const response = await fetch("/api/i18n/translate", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ to, texts }),
  })
  if (!response.ok) {
    return {}
  }
  const json = (await response.json()) as { translations?: Record<string, string> }
  return json.translations ?? {}
}

export function AutoTranslator() {
  const { locale } = useI18n()
  const translating = useRef(false)

  useEffect(() => {
    let disposed = false
    const root = document.body
    if (!root) return

    const run = async () => {
      if (disposed || translating.current) return
      translating.current = true
      try {
        const targets = collectTargets(root)
        if (targets.length === 0) return

        const originals = Array.from(new Set(targets.map((t) => t.original)))
        const missing = originals.filter((text) => !translationCache.has(`${locale}\u0000${text}`))

        for (const part of chunk(missing, 40)) {
          if (disposed) return
          const translated = await fetchTranslations(part, locale)
          for (const text of part) {
            const key = `${locale}\u0000${text}`
            translationCache.set(key, translated[text] ?? text)
          }
        }

        for (const target of targets) {
          const key = `${locale}\u0000${target.original}`
          const translated = translationCache.get(key) ?? target.original
          if (target.type === "text") {
            if (target.node.nodeValue !== translated) {
              target.node.nodeValue = translated
            }
          } else if (target.el.getAttribute(target.attr) !== translated) {
            target.el.setAttribute(target.attr, translated)
          }
        }
      } finally {
        translating.current = false
      }
    }

    void run()

    const observer = new MutationObserver(() => {
      void run()
    })
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    })

    return () => {
      disposed = true
      observer.disconnect()
    }
  }, [locale])

  return null
}

