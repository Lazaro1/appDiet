import type { DietCatalogFood, DietGenerationContext } from "../types"

function formatCandidate(food: DietCatalogFood): string {
  const role = food.nutritionalRole ?? "outro"
  return `${food.foodId}|${food.displayName}|${role}|${food.kcalPer100g}kcal|${food.portionMinGrams}-${food.portionMaxGrams}g`
}

function formatCatalog(context: DietGenerationContext): string {
  return context.meals
    .map((meal) => {
      const lines = meal.candidates.map(formatCandidate).join("\n")
      return `[${meal.mealId}] ${meal.mealName} ${meal.kcalTarget}kcal\n${lines}`
    })
    .join("\n\n")
}

/** Compact user prompt: foodId|nome|papel|kcal|gramas — keeps tokens low. */
export function buildDietPlanUserPrompt(context: DietGenerationContext): string {
  const macros = context.macroTargets
    ? `Macros/dia: P${context.macroTargets.proteinGrams}g C${context.macroTargets.carbsGrams}g G${context.macroTargets.fatGrams}g.`
    : ""

  return `Meta: ${context.dailyKcalTarget} kcal/dia. ${macros}
Restrições: ${context.restrictions.length > 0 ? context.restrictions.join(", ") : "nenhuma"}
Preferências: ${context.preferences.length > 0 ? context.preferences.join(", ") : "nenhuma"}

Monte ${context.meals.length} refeições (uma por mealId). Cada refeição: 2-4 itens, combinação realista brasileira.
Prefira variar foodIds entre refeições; o mesmo foodId pode aparecer em até 2 refeições do dia se necessário.

Formato do catálogo: foodId|nome|papel|kcal/100g|min-max g

${formatCatalog(context)}`
}
