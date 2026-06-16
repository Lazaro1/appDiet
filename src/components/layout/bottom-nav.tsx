"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface BottomNavItem {
  icon: React.ReactNode
  label: string
  href: string
}

interface BottomNavProps {
  /** Navigation items — typically 5 for a tab bar */
  items: BottomNavItem[]
  /** Currently active href pattern */
  activeHref: string
}

export function BottomNav({ items, activeHref }: BottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border bg-canvas shadow-sm">
      <div className="flex h-full items-center justify-around px-2">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span className="[&_svg]:size-5">{item.icon}</span>
              <span className="text-[11px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
