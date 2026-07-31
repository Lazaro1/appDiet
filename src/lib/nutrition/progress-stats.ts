import type { DailySummary } from "./weekly-summary"
import { isLoggedLogStatus } from "./meal-status"

export function buildDailySummaries(params: {
  dailyTarget: number
  mealsPerDay: number
  logs: Array<{
    date: Date
    status: string
    parsedKcal: number | null
    conformant: boolean | null
  }>
  startDate: Date
  dayCount: number
}): DailySummary[] {
  const days: DailySummary[] = []

  for (let i = 0; i < params.dayCount; i++) {
    const day = new Date(params.startDate)
    day.setDate(day.getDate() + i)
    const key = day.toISOString().split("T")[0]

    const dayLogs = params.logs.filter(
      (log) => log.date.toISOString().split("T")[0] === key,
    )

    const consumed = dayLogs
      .filter((l) => isLoggedLogStatus(l.status))
      .reduce((s, l) => s + (l.parsedKcal ?? 0), 0)

    days.push({
      date: key,
      consumed,
      target: params.dailyTarget,
      plannedMeals: params.mealsPerDay,
      loggedMeals: dayLogs.filter((l) => l.status !== "skipped").length,
      conformantMeals: dayLogs.filter((l) => l.conformant).length,
    })
  }

  return days
}

/** Consecutive days (from most recent) within ±10% of calorie target */
export function calculateGoalStreak(days: DailySummary[]): number {
  let streak = 0

  for (let i = days.length - 1; i >= 0; i--) {
    const { consumed, target, date } = days[i]
    const isToday = date === new Date().toISOString().split("T")[0]

    if (target <= 0) break

    const hitGoal =
      consumed > 0 && consumed >= target * 0.9 && consumed <= target * 1.1

    if (hitGoal) {
      streak++
    } else if (isToday && consumed === 0) {
      continue
    } else {
      break
    }
  }

  return streak
}

export function averageWeight(
  logs: Array<{ weight: number }>,
): number | null {
  if (logs.length === 0) return null
  const sum = logs.reduce((s, l) => s + l.weight, 0)
  return sum / logs.length
}

export function getAdherenceMessage(score: number): string {
  if (score >= 85) {
    return "Ótimo trabalho! Você está mantendo a consistência."
  }
  if (score >= 70) {
    return "Bom progresso! Você atingiu sua meta calórica na maioria dos dias."
  }
  if (score >= 50) {
    return "Você está no caminho certo. Continue registrando suas refeições."
  }
  return "Cada dia é uma nova chance. Pequenos passos levam a grandes resultados."
}

export function getAchievement(adherenceScore: number): {
  title: string
  subtitle: string
  unlocked: boolean
} {
  if (adherenceScore >= 90) {
    return { title: "Foco Total", subtitle: "Desbloqueado!", unlocked: true }
  }
  if (adherenceScore >= 75) {
    return { title: "Em Ritmo", subtitle: "Quase lá!", unlocked: true }
  }
  if (adherenceScore >= 50) {
    return { title: "Primeiros Passos", subtitle: "Continue assim", unlocked: true }
  }
  return { title: "Comece Hoje", subtitle: "Sua jornada aguarda", unlocked: false }
}

const PROGRESS_TIPS = [
  "Seu peso flutua naturalmente. Foque na tendência de 7 dias!",
  "Consistência supera perfeição. Um dia fora da meta não apaga seu progresso.",
  "Registre suas refeições mesmo quando não seguir o plano — isso ajuda a entender padrões.",
  "Celebre pequenas vitórias. Cada refeição registrada é um passo à frente.",
]

export function getProgressTip(): string {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
      86_400_000,
  )
  return PROGRESS_TIPS[dayOfYear % PROGRESS_TIPS.length]
}
