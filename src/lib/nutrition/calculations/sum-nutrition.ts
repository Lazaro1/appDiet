import type { NutritionTotals } from "../types"
import { addNutritionTotals, emptyNutritionTotals } from "./compute-food-nutrition"

export function sumNutritionTotals(items: NutritionTotals[]): NutritionTotals {
  return items.reduce(
    (total, item) => addNutritionTotals(total, item),
    emptyNutritionTotals(),
  )
}
