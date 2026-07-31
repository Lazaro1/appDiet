import {
  Coffee,
  IceCreamCone,
  Soup,
  Utensils,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react"
import type { MealStatus } from "./meal-status"

export interface MealItemDisplay {
  id: string
  name: string
  quantity: number
  unit: string
  kcal: number
  protein: number
  carbs: number
  fat: number
}

export interface MealsPageMeal {
  id: string
  name: string
  windowStart: number
  windowEnd: number
  timeWindow: string
  kcalTarget: number
  kcalConsumed?: number
  status: MealStatus
  conformant?: boolean
  items: MealItemDisplay[]
}

const DAILY_TIPS = [
  "Mantenha-se hidratado! Beba um copo de água 30 minutos antes do almoço para ajudar na digestão.",
  "Mastigue devagar — isso ajuda a sentir saciedade com menos calorias.",
  "Inclua proteína em cada refeição para manter a energia estável ao longo do dia.",
  "Planeje o lanche da tarde com antecedência para evitar escolhas impulsivas.",
  "Varie as cores no prato: quanto mais colorido, mais nutrientes diferentes.",
  "Durma bem! O sono de qualidade influencia diretamente o apetite e o metabolismo.",
  "Prefira alimentos integrais — a fibra prolonga a sensação de saciedade.",
]

export function getMealIcon(name: string): LucideIcon {
  const n = name.toLowerCase()
  if (n.includes("café") || n.includes("manhã")) return Coffee
  if (n.includes("almoço")) return UtensilsCrossed
  if (n.includes("lanche")) return IceCreamCone
  if (n.includes("jantar")) return Soup
  return Utensils
}

export function formatMealHour(hour: number): string {
  return `${hour.toString().padStart(2, "0")}:00`
}

export function toDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function formatMonthYear(date: Date): string {
  const label = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

export function formatWeekdayShort(date: Date): string {
  return date
    .toLocaleDateString("pt-BR", { weekday: "short" })
    .replace(".", "")
    .slice(0, 3)
}

export function getWeekDays(anchor: Date): Date[] {
  const start = new Date(anchor)
  const day = start.getDay()
  const diff = day === 0 ? -6 : 1 - day
  start.setDate(start.getDate() + diff)
  start.setHours(12, 0, 0, 0)

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
}

export function isSameDay(a: Date, b: Date): boolean {
  return toDateKey(a) === toDateKey(b)
}

export function isMealFuture(windowStart: number, now: Date): boolean {
  return now.getHours() < windowStart
}

export function getDailyTip(date: Date): string {
  const start = new Date(date.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000)
  return DAILY_TIPS[dayOfYear % DAILY_TIPS.length]
}

export function formatMealSuggestion(items: MealItemDisplay[]): string {
  if (items.length === 0) return "Sem itens no plano"
  return items
    .map((item) => `${item.name} (${item.quantity}${item.unit})`)
    .join(", ")
}

export function sumMealMacros(items: MealItemDisplay[]) {
  return items.reduce(
    (acc, item) => ({
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fat: acc.fat + item.fat,
    }),
    { protein: 0, carbs: 0, fat: 0 },
  )
}

export type MealVisualState = MealStatus | "future"

export function getMealVisualState(
  status: MealStatus,
  windowStart: number,
  now: Date,
): MealVisualState {
  if (status === "pending" && isMealFuture(windowStart, now)) return "future"
  return status
}
