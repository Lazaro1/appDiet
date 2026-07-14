"use client"

import { ClerkProvider } from "@clerk/nextjs"
import { ptBR } from "@clerk/localizations"

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <ClerkProvider localization={ptBR}>
      {children}
    </ClerkProvider>
  )
}
