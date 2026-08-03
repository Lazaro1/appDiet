import type { SwapSuggestion } from "@/lib/nutrition/swap-types"
import {
  searchEquivalentFoods,
  type SearchEquivalentFoodsParams,
} from "../retrieval/search-equivalent-foods"

/** Suggests swap alternatives from the TBCA catalog with deterministic nutrition. */
export async function suggestFoodSwaps(
  params: SearchEquivalentFoodsParams,
): Promise<SwapSuggestion[]> {
  const options = await searchEquivalentFoods(params)

  if (options.length > 0) {
    return options.map((option) => ({
      name: `${option.name} (${option.grams}g)`,
      kcal: option.kcal,
      protein: option.protein,
      description: `Equivalente calórico da TBCA (${Math.round(option.score * 100)}% de similaridade).`,
    }))
  }

  return [
    {
      name: params.itemName,
      kcal: params.itemKcal,
      protein: params.itemProtein ?? 0,
      description:
        "Não encontramos equivalente no catálogo com os alimentos informados. Tente nomes mais simples (ex: ovo, frango, arroz).",
    },
  ]
}
