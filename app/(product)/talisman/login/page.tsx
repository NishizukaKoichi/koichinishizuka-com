import TalismanLoginClient from "./login-client"

type SearchParams = Record<string, string | string[] | undefined>

function sanitizeNextPath(value: string | string[] | undefined): string | null {
  const resolved = Array.isArray(value) ? value[0] : value
  if (!resolved) return null
  if (!resolved.startsWith("/")) return null
  if (resolved.startsWith("//")) return null
  if (resolved.includes("://")) return null
  return resolved
}

export default function TalismanLoginPage({ searchParams }: { searchParams?: SearchParams }) {
  const nextPath = sanitizeNextPath(searchParams?.next)
  return <TalismanLoginClient nextPath={nextPath} />
}

