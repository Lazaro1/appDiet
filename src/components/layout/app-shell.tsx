"use client"

import { useRouter } from "next/navigation"
import { BottomNav } from "./bottom-nav"
import { Fab } from "./fab"
import { NAV_ITEMS } from "@/lib/navigation"

interface AppShellProps {
  children: React.ReactNode
  fabHref?: string | null
}

export function AppShell({ children, fabHref }: AppShellProps) {
  const router = useRouter()

  const navItems = NAV_ITEMS.map(({ icon: Icon, label, href }) => ({
    icon: <Icon />,
    label,
    href,
  }))

  return (
    <>
      {children}
      <BottomNav items={navItems} />
      {fabHref !== null && (
        <Fab
          label="Registrar refeição"
          onClick={() => router.push(fabHref ?? "/meals")}
        />
      )}
    </>
  )
}
