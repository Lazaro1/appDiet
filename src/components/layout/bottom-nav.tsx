"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { NAV_ITEMS, isNavItemActive } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 lg:hidden",
        "flex items-center justify-around rounded-t-xl bg-surface px-2 pt-2 shadow-xl",
        "pb-[max(0.5rem,env(safe-area-inset-bottom))]",
      )}
      aria-label="Navegação principal"
    >
      {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
        const isActive = isNavItemActive(pathname, href)

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-w-[3.5rem] flex-col items-center justify-center px-3 py-1.5",
              "transition-all duration-200 active:scale-90",
              isActive ? "rounded-md" : "rounded-xl",
              isActive
                ? "bg-primary font-semibold text-on-primary shadow-sm"
                : "text-muted-foreground hover:bg-surface-raised",
            )}
          >
            <Icon
              className={cn("size-6 shrink-0", isActive && "fill-current")}
              strokeWidth={isActive ? 2.25 : 2}
              aria-hidden
            />
            <span className="mt-1 text-[11px] font-semibold tracking-wide">
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
