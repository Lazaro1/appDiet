import { describe, expect, it } from "vitest"
import { MEAL_PRESETS } from "@/lib/onboarding/types"
import { distributeMealCalories } from "./distribute-meal-targets"

function mealWindows(count: number) {
  return MEAL_PRESETS[count].map((meal, index) => ({
    id: `meal-${index}`,
    name: meal.name,
    startHour: meal.windowStart,
    endHour: meal.windowEnd,
  }))
}

describe("distributeMealCalories", () => {
  it("distributes 2000 kcal across 4 meals summing exactly 2000", () => {
    const targets = distributeMealCalories(2000, mealWindows(4))
    const total = targets.reduce((sum, meal) => sum + meal.kcalTarget, 0)
    expect(total).toBe(2000)
    expect(targets).toHaveLength(4)
  })

  it("gives lunch more kcal than snacks for 5 meals", () => {
    const targets = distributeMealCalories(2000, mealWindows(5))
    const lunch = targets.find((m) => m.name.includes("Almoço"))
    const morningSnack = targets.find((m) => m.name.includes("manhã"))
    expect(lunch?.kcalTarget).toBeGreaterThan(morningSnack?.kcalTarget ?? 0)
  })

  it("distributes 1500 kcal across 3 meals", () => {
    const targets = distributeMealCalories(1500, mealWindows(3))
    expect(targets.reduce((s, m) => s + m.kcalTarget, 0)).toBe(1500)
  })

  it("distributes 2800 kcal across 6 meals", () => {
    const targets = distributeMealCalories(2800, mealWindows(6))
    expect(targets).toHaveLength(6)
    expect(targets.reduce((s, m) => s + m.kcalTarget, 0)).toBe(2800)
  })
})
