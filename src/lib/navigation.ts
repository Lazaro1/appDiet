import {
  Home,
  Utensils,
  MessageCircle,
  BarChart3,
  User,
} from "lucide-react"

export const NAV_ITEMS = [
  { icon: Home, label: "Início", href: "/" },
  { icon: Utensils, label: "Refeições", href: "/meals" },
  { icon: MessageCircle, label: "Chat", href: "/chat" },
  { icon: BarChart3, label: "Progresso", href: "/progress" },
  { icon: User, label: "Perfil", href: "/profile" },
] as const
