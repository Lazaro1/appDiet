export type { ParsedFoodItem, ParsedMealDraftItem } from "./types"
export {
  FOOD_MATCH_SCORE_THRESHOLD,
  matchFoodFromText,
  resolveParsedMealItems,
  type FoodMatchResult,
} from "@/lib/nutrition/orchestration/match-food-from-text"
