"use client"

import { AppShell } from "@/components/layout/app-shell"
import { DayProvider } from "@/components/providers/day-provider"
import { ToastProvider } from "@/components/providers/toast-provider"
import type { DaySnapshot } from "@/lib/nutrition/day"

interface AppProvidersProps {
  daySnapshot: DaySnapshot
  children: React.ReactNode
}

/**
 * Client boundary for the authenticated app: wires up global toast + shared
 * "today" state and renders the responsive shell around the page.
 */
export function AppProviders({ daySnapshot, children }: AppProvidersProps) {
  return (
    <ToastProvider>
      <DayProvider initial={daySnapshot}>
        <AppShell>{children}</AppShell>
      </DayProvider>
    </ToastProvider>
  )
}
