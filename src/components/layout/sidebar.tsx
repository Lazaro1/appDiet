"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Settings } from "lucide-react"
import { useDay } from "@/components/providers/day-provider"
import { NAV_ITEMS, isNavItemActive } from "@/lib/navigation"
import { formatKcal } from "@/lib/nutrition/format"
import { cn } from "@/lib/utils"

function SidebarAvatar({ name, imageUrl }: { name: string; imageUrl?: string }) {
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="size-12 shrink-0 rounded-full border-2 border-surface object-cover shadow-sm"
      />
    )
  }

  const initial = name.trim().charAt(0).toUpperCase() || "A"

  return (
    <div
      aria-hidden
      className="flex size-12 shrink-0 items-center justify-center rounded-full border-2 border-surface bg-canvas text-lg font-bold text-primary shadow-sm"
    >
      {initial}
    </div>
  )
}

/** Desktop navigation — Stitch NavigationDrawer (240px, profile header, pill active state). */
export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { dailyTarget } = useDay()

  const displayName =
    user?.firstName ||
    user?.fullName?.split(" ")[0] ||
    "Paciente"

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden w-60 flex-col lg:flex",
        "border-r border-border bg-surface px-4 py-6 shadow-sm",
      )}
      aria-label="Navegação lateral"
    >
      <div className="mb-8 flex items-center gap-3">
        <SidebarAvatar
          name={displayName}
          imageUrl={user?.imageUrl}
        />
        <div className="min-w-0">
          <p className="truncate text-lg font-bold text-primary">AppDiet</p>
          <p className="text-xs text-muted-foreground">Bem-vindo de volta</p>
          <p className="mt-0.5 text-xs font-semibold text-primary">
            Meta: {formatKcal(dailyTarget)} kcal
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const isActive = isNavItemActive(pathname, href)

          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200",
                isActive ? "rounded-md" : "rounded-lg",
                isActive
                  ? "bg-primary font-bold text-on-primary shadow-sm"
                  : "font-medium text-muted-foreground hover:bg-surface-raised hover:text-ink",
              )}
            >
              <Icon
                className={cn("size-5 shrink-0", isActive && "fill-current")}
                strokeWidth={isActive ? 2.25 : 2}
                aria-hidden
              />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-all duration-200",
            isNavItemActive(pathname, "/profile") ? "rounded-md" : "rounded-lg",
            isNavItemActive(pathname, "/profile")
              ? "bg-primary font-bold text-on-primary"
              : "text-muted-foreground hover:bg-surface-raised hover:text-ink",
          )}
        >
          <Settings className="size-5 shrink-0" aria-hidden />
          Configurações
        </Link>
      </div>
    </aside>
  )
}
