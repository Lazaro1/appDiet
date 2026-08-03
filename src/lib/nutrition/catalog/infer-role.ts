import { normalizeFoodName } from "../normalize-name"
import type { NutritionalRole } from "../types"

const ROLE_BY_CATEGORY: Record<string, NutritionalRole> = {
  carnes: "protein",
  aves: "protein",
  peixes: "protein",
  ovos: "protein",
  leguminosas: "protein",
  cereais: "carbohydrate",
  tuberculos: "carbohydrate",
  frutas: "fruit",
  verduras: "vegetable",
  legumes: "vegetable",
  oleos: "fat",
  laticinios: "dairy",
  bebidas: "beverage",
}

const ROLE_BY_NAME: Array<{ pattern: RegExp; role: NutritionalRole }> = [
  { pattern: /frango|carne|peixe|atum|sardinha|ovo|tofu|feijao|lentilha/i, role: "protein" },
  { pattern: /arroz|macarrao|pao|aveia|batata|mandioca|inhame/i, role: "carbohydrate" },
  { pattern: /alface|brocolis|couve|tomate|cenoura|salada/i, role: "vegetable" },
  { pattern: /banana|maca|mamao|laranja|morango|abacate/i, role: "fruit" },
  { pattern: /azeite|oleo|manteiga|castanha|amendoim/i, role: "fat" },
  { pattern: /leite|iogurte|queijo|requeijao/i, role: "dairy" },
  { pattern: /cafe|cha|suco|agua/i, role: "beverage" },
]

export function inferNutritionalRole(
  name: string,
  category?: string | null,
): NutritionalRole {
  const normalizedCategory = category
    ? normalizeFoodName(category).split(/[\s,/-]+/)[0]
    : ""

  for (const [key, role] of Object.entries(ROLE_BY_CATEGORY)) {
    if (normalizedCategory.includes(key)) return role
  }

  for (const { pattern, role } of ROLE_BY_NAME) {
    if (pattern.test(name)) return role
  }

  return "complement"
}

export function inferMealRoles(mealName: string): NutritionalRole[] {
  const normalized = normalizeFoodName(mealName)

  if (/cafe|ceia/.test(normalized)) {
    return ["protein", "carbohydrate", "fruit", "dairy", "beverage"]
  }

  if (/lanche/.test(normalized)) {
    return ["protein", "carbohydrate", "fruit", "dairy", "complement"]
  }

  return ["protein", "carbohydrate", "vegetable", "fruit", "fat", "complement"]
}
