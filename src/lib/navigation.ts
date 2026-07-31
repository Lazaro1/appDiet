import {
  Home,
  MessageCircle,
  TrendingUp,
  User,
  Utensils,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  icon: LucideIcon
  label: string
  href: string
}

export const NAV_ITEMS: readonly NavItem[] = [
  { icon: Home, label: "Início", href: "/" },
  { icon: Utensils, label: "Refeições", href: "/meals" },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: TrendingUp, label: "Progresso", href: "/progress" },
  { icon: User, label: "Perfil", href: "/profile" },
] as const

/** Whether a nav item should render as active for the current pathname. */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}
