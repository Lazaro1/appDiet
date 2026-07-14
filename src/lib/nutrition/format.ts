/** Format a number as kcal with pt-BR locale */
export function formatKcal(value: number): string {
  return value.toLocaleString("pt-BR")
}

/** Format remaining/excess calorie text */
export function formatCalorieRemaining(consumed: number, target: number): string {
  const remaining = target - consumed
  const formatted = formatKcal(Math.abs(remaining))

  if (remaining > 0) return `${formatted} kcal restantes`
  if (remaining < 0) return `${formatted} kcal acima`
  return "Na meta!"
}

/** Format a calorie comparison string (e.g., "580 de 600 kcal") */
export function formatCalorieComparison(consumed: number, target: number): string {
  return `${formatKcal(consumed)} de ${formatKcal(target)} kcal`
}

/** Format weight with unit */
export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`
}

/** Format a percentage */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

/** Format a time window (e.g., "11:00 — 14:00") */
export function formatTimeWindow(startHour: number, endHour: number): string {
  const pad = (h: number) => h.toString().padStart(2, "0")
  return `${pad(startHour)}:00 — ${pad(endHour)}:00`
}
