import "dotenv/config"
import { generateDietPlan } from "@/lib/nutrition/orchestration/generate-diet-plan"
import {
  DietPlanGenerationError,
  DietPlanUnfeasibleError,
  EmptyFoodCatalogError,
} from "@/lib/nutrition/orchestration/errors"
import { MEAL_PRESETS } from "@/lib/onboarding/types"
import type { Goal } from "@/generated/prisma"

interface SmokeProfile {
  label: string
  dailyKcalTarget: number
  restrictions: string | null
  goal: Goal
  mealsPerDay?: number
}

const PROFILES: SmokeProfile[] = [
  { label: "Sem restrição", dailyKcalTarget: 2000, restrictions: null, goal: "maintain" },
  { label: "Sem lactose", dailyKcalTarget: 1800, restrictions: "sem lactose", goal: "lose" },
  { label: "Vegetariano", dailyKcalTarget: 2200, restrictions: "vegetariano", goal: "gain" },
  { label: "6 refeições (alto volume)", dailyKcalTarget: 3200, restrictions: null, goal: "gain", mealsPerDay: 6 },
]

function mealWindowsForCount(count: number) {
  return (MEAL_PRESETS[count] ?? MEAL_PRESETS[4]).map((preset, index) => ({
    id: `meal-${index}`,
    name: preset.name,
    startHour: preset.windowStart,
    endHour: preset.windowEnd,
  }))
}

function deviationPercent(actual: number, target: number): string {
  return `${(((actual - target) / target) * 100).toFixed(1)}%`
}

async function runProfile(profile: SmokeProfile): Promise<boolean> {
  console.log(`\n=== ${profile.label} (${profile.dailyKcalTarget} kcal) ===`)

  try {
    const { plan, attempts } = await generateDietPlan({
      dailyKcalTarget: profile.dailyKcalTarget,
      mealWindows: mealWindowsForCount(profile.mealsPerDay ?? 4),
      restrictions: profile.restrictions,
      goal: profile.goal,
    })

    for (const meal of plan.meals) {
      console.log(
        `  ${meal.name}: ${Math.round(meal.kcalActual)} / ${meal.kcalTarget} kcal (${deviationPercent(meal.kcalActual, meal.kcalTarget)})`,
      )
      for (const item of meal.items) {
        console.log(
          `    - ${item.name} — ${item.quantityGrams}g — ${item.nutrition.calories} kcal [${item.foodId}]`,
        )
      }
    }

    const total = plan.dailyActual.calories
    console.log(
      `  TOTAL: ${Math.round(total)} / ${plan.dailyKcalTarget} kcal (${deviationPercent(total, plan.dailyKcalTarget)}) em ${attempts} tentativa(s)`,
    )
    console.log(`  Proteína: ${plan.dailyActual.proteinGrams}g`)

    return true
  } catch (err) {
    if (
      err instanceof DietPlanUnfeasibleError ||
      err instanceof DietPlanGenerationError ||
      err instanceof EmptyFoodCatalogError
    ) {
      console.error(`  FALHA (${err.name}): ${err.message}`)
      return false
    }
    throw err
  }
}

async function main() {
  let failures = 0

  for (const profile of PROFILES) {
    const ok = await runProfile(profile)
    if (!ok) failures += 1
  }

  console.log(
    `\n${PROFILES.length - failures}/${PROFILES.length} perfis geraram plano válido.`,
  )
  process.exit(failures > 0 ? 1 : 0)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
