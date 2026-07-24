import { BottomNav } from "./bottom-nav"
import { Fab } from "./fab"
import { Sidebar } from "./sidebar"
import { NAV_ITEMS } from "@/lib/navigation"

interface AppShellProps {
  children: React.ReactNode
}

/**
 * Responsive app chrome: left sidebar on desktop (>= lg), bottom tab bar on
 * mobile, plus a contextual FAB. Content is centered in the remaining space.
 */
export function AppShell({ children }: AppShellProps) {
  const navItems = NAV_ITEMS.map(({ icon: Icon, label, href }) => ({
    icon: <Icon />,
    label,
    href,
  }))

  return (
    <div className="min-h-screen">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-60">
        <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      </div>
      <BottomNav items={navItems} />
      <Fab />
    </div>
  )
}
