import { GOAL_LABELS } from "@/lib/onboarding/types"
import { formatKcal } from "@/lib/nutrition/format"

export function getProfileGoalLabel(goal: string): string {
  const labels: Record<string, string> = {
    lose: "Perda de Peso",
    gain: "Ganho de Massa",
    maintain: "Reeducação Alimentar",
  }
  return labels[goal] ?? GOAL_LABELS[goal] ?? "Meta personalizada"
}

export function formatProfileSubtitle(goal: string, dailyKcalTarget: number | null) {
  const goalLabel = getProfileGoalLabel(goal)
  if (dailyKcalTarget) {
    return `${goalLabel} (${formatKcal(dailyKcalTarget)} kcal)`
  }
  return `Meta: ${goalLabel}`
}

export function formatDesktopSubtitle(goal: string) {
  return `Meta: ${getProfileGoalLabel(goal)}`
}
