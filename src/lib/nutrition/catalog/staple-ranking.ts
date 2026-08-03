import { normalizeFoodName } from "../normalize-name"

export interface StapleRankInput {
  name: string
  category?: string | null
  synonyms?: string[] | null
}

/** Foods below this score are excluded from the LLM catalog. */
export const MIN_CATALOG_SCORE = 35

const STAPLE_PATTERNS: RegExp[] = [
  /frango.*peito.*grelhado/i,
  /frango.*peito.*cozido/i,
  /arroz.*branco.*cozido/i,
  /arroz.*integral.*cozido/i,
  /feijao.*carioca/i,
  /feijao.*preto/i,
  /ovo.*galinha.*cozido/i,
  /pao.*integral/i,
  /pao.*frances/i,
  /iogurte.*natural/i,
  /leite.*integral/i,
  /banana.*prata/i,
  /maca.*fuji/i,
  /atum.*conserva/i,
  /batata-doce.*cozida/i,
  /batata.*inglesa.*cozida/i,
  /brocolis.*cozido/i,
  /couve.*refogada/i,
  /alface.*crua/i,
  /tomate.*cru/i,
  /azeite.*oliva/i,
  /aveia.*flocos/i,
  /queijo.*minas/i,
  /tapioca.*goma/i,
  /mandioca.*cozida/i,
  /peito.*peru/i,
  /sardinha.*conserva/i,
  /cafe.*coado/i,
]

const COMPOSITE_PATTERNS: RegExp[] = [
  /\(/,
  /almond|almôndega/i,
  /lasanha|panqueca|crepioca|empada|quiche/i,
  /sopa de|caldo de|creme de/i,
  /ao sugo|a milanesa|empanad|frita, c\//i,
  /caseira, c\/|industrializada/i,
  /c\/ cobertura|c\/ molho|c\/ farinha/i,
  /bolo|torta|pizza|hamburguer|nuggets|strudel|sorvete|chocolate/i,
  /iogurte com|vitamina de/i,
]

/**
 * Higher score = better staple for automatic plan generation.
 * Composite dishes and long recipe names score low and get filtered out.
 */
export function scoreFoodForCatalog(food: StapleRankInput): number {
  const normalized = normalizeFoodName(food.name)
  let score = 50

  if (food.synonyms && food.synonyms.length > 0) score += 25

  for (const pattern of STAPLE_PATTERNS) {
    if (pattern.test(normalized) || pattern.test(food.name)) {
      score += 40
      break
    }
  }

  const commaCount = (food.name.match(/,/g) ?? []).length
  if (commaCount >= 3) score -= 25
  else if (commaCount >= 2) score -= 12

  if (food.name.length > 70) score -= 30
  else if (food.name.length > 45) score -= 15

  for (const pattern of COMPOSITE_PATTERNS) {
    if (pattern.test(food.name)) {
      score -= 35
      break
    }
  }

  return score
}

export function isCatalogEligible(food: StapleRankInput): boolean {
  return scoreFoodForCatalog(food) >= MIN_CATALOG_SCORE
}

export function rankFoodsForCatalog<T extends StapleRankInput>(foods: T[]): T[] {
  return [...foods]
    .filter(isCatalogEligible)
    .sort(
      (a, b) => scoreFoodForCatalog(b) - scoreFoodForCatalog(a),
    )
}
