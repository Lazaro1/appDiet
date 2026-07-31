import { BottomNav } from "./bottom-nav"
import { Fab } from "./fab"
import { Sidebar } from "./sidebar"

interface AppShellProps {
  children: React.ReactNode
}

/**
 * Responsive app chrome: Stitch sidebar on desktop (240px), rounded bottom tab
 * bar on mobile, plus a contextual FAB.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-60">
        <main className="flex-1 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
          {children}
        </main>
      </div>
      <BottomNav />
      <Fab />
    </div>
  )
}
