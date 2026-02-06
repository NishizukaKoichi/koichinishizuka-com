"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

type AuthSession = {
  user_id: string | null
  email: string | null
  is_logged_in: boolean
  is_admin: boolean
}

type TalismanCredential = {
  credential_id: string
  type:
    | "email_magiclink"
    | "phone_otp"
    | "oauth_google"
    | "oauth_apple"
    | "oauth_microsoft"
    | "oauth_x"
    | "passkey"
    | "payment_card"
  normalized_hash: string
  revoked_at: string | null
  issued_at?: string
}

export interface Credential {
  id: string
  type: "passkey" | "email" | "phone" | "oauth" | "recovery"
  label: string
  verifiedAt: string
}

interface AuthContextType {
  isLoggedIn: boolean
  isRegistered: boolean
  isAdmin: boolean
  userId: string | null
  credentials: Credential[]
  credentialCount: number
  hasMinimumCredentials: boolean
  login: (userId?: string, email?: string | null) => Promise<void>
  logout: () => Promise<void>
  register: (initialCredential: Credential) => Promise<void>
  addCredential: (credential: Credential) => void
  refreshSession: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

function mapCredentialType(type: TalismanCredential["type"]): Credential["type"] {
  if (type === "passkey") return "passkey"
  if (type === "email_magiclink") return "email"
  if (type === "phone_otp") return "phone"
  if (type.startsWith("oauth_")) return "oauth"
  return "recovery"
}

function formatLabel(credential: TalismanCredential): string {
  const hash = credential.normalized_hash?.trim()
  if (!hash) return credential.type
  if (hash.length <= 12) return hash
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`
}

function toCredential(credential: TalismanCredential): Credential {
  return {
    id: credential.credential_id,
    type: mapCredentialType(credential.type),
    label: formatLabel(credential),
    verifiedAt: credential.issued_at ?? new Date().toISOString(),
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [credentials, setCredentials] = useState<Credential[]>([])

  const refreshSession = useCallback(async () => {
    const sessionResponse = await fetch("/api/v1/auth/session", { cache: "no-store" })
    if (!sessionResponse.ok) {
      setIsLoggedIn(false)
      setIsRegistered(false)
      setIsAdmin(false)
      setUserId(null)
      setCredentials([])
      return
    }

    const session = (await sessionResponse.json()) as AuthSession
    const currentUserId = session.user_id

    setIsLoggedIn(Boolean(session.is_logged_in && currentUserId))
    setIsRegistered(Boolean(currentUserId))
    setIsAdmin(Boolean(session.is_admin))
    setUserId(currentUserId)

    if (!currentUserId) {
      setCredentials([])
      return
    }

    const credentialsResponse = await fetch(
      `/api/v1/talisman/credentials?person_id=${encodeURIComponent(currentUserId)}`,
      { cache: "no-store" }
    )

    if (!credentialsResponse.ok) {
      setCredentials([])
      return
    }

    const data = (await credentialsResponse.json()) as { credentials: TalismanCredential[] }
    const activeCredentials = Array.isArray(data.credentials)
      ? data.credentials.filter((credential) => !credential.revoked_at).map(toCredential)
      : []

    setCredentials(activeCredentials)
  }, [])

    useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshSession()
  }, [refreshSession])

  const login = useCallback(async (nextUserId?: string, email?: string | null) => {
    const payload: { user_id?: string; email?: string } = {}
    if (nextUserId) payload.user_id = nextUserId
    if (email) payload.email = email

    const response = await fetch("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => null)
      throw new Error(error?.error ?? "Login failed")
    }

    await refreshSession()
  }, [refreshSession])

  const logout = useCallback(async () => {
    await fetch("/api/v1/auth/logout", { method: "POST" })
    setIsLoggedIn(false)
    setIsRegistered(false)
    setIsAdmin(false)
    setUserId(null)
    setCredentials([])
  }, [])

  const register = useCallback(async (initialCredential: Credential) => {
    const generatedUserId = `user-${Date.now()}`
    await login(generatedUserId)
    setCredentials([initialCredential])
  }, [login])

  const addCredential = useCallback((credential: Credential) => {
    setCredentials((prev) => [...prev, credential])
  }, [])

  const value = useMemo<AuthContextType>(() => {
    const credentialCount = credentials.length
    return {
      isLoggedIn,
      isRegistered,
      isAdmin,
      userId,
      credentials,
      credentialCount,
      hasMinimumCredentials: credentialCount >= 3,
      login,
      logout,
      register,
      addCredential,
      refreshSession,
    }
  }, [isLoggedIn, isRegistered, isAdmin, userId, credentials, login, logout, register, addCredential, refreshSession])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
