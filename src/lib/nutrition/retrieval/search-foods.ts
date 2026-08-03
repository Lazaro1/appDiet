import type { FoodSearchResult } from "../types"
import {
  lexicalSearchFoods,
  type LexicalSearchParams,
} from "./lexical-search"

export type SearchFoodsParams = LexicalSearchParams

export async function searchFoods(
  params: SearchFoodsParams,
): Promise<FoodSearchResult[]> {
  return lexicalSearchFoods(params)
}
