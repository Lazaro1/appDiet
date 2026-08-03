import { prisma } from "@/lib/db/prisma"
import { normalizeFoodName } from "../normalize-name"
import type { FoodSearchResult } from "../types"
import {
  parseRestrictionsText,
  type ParsedRestrictions,
} from "../catalog/restriction-parser"

export interface LexicalSearchParams {
  query: string
  topK?: number
  minScore?: number
  restrictions?: ParsedRestrictions | string | string[] | null
}

interface RawSearchRow {
  id: string
  name: string
  category: string | null
  nutritionalRole: string | null
  kcalPer100g: number
  portionDefault: number | null
  portionMinGrams: number | null
  portionMaxGrams: number | null
  portionStepGrams: number | null
  score: number
}

export async function lexicalSearchFoods(
  params: LexicalSearchParams,
): Promise<FoodSearchResult[]> {
  const query = normalizeFoodName(params.query)
  if (!query) return []

  const topK = params.topK ?? 10
  const minScore = params.minScore ?? 0.2
  const restrictions =
    typeof params.restrictions === "object" &&
    params.restrictions !== null &&
    "excludeLactose" in params.restrictions
      ? params.restrictions
      : parseRestrictionsText(params.restrictions)

  const restrictionClauses: string[] = []
  if (restrictions.excludeLactose) {
    restrictionClauses.push(`(f."containsLactose" IS DISTINCT FROM true)`)
  }
  if (restrictions.excludeGluten) {
    restrictionClauses.push(`(f."containsGluten" IS DISTINCT FROM true)`)
  }
  if (restrictions.vegan || restrictions.vegetarian || restrictions.pescatarian) {
    restrictionClauses.push(`(f."containsAnimal" IS DISTINCT FROM true)`)
  }

  const restrictionSql =
    restrictionClauses.length > 0
      ? `AND ${restrictionClauses.join(" AND ")}`
      : ""

  const rows = await prisma.$queryRawUnsafe<RawSearchRow[]>(
    `
    SELECT
      f.id,
      f.name,
      f.category,
      f."nutritionalRole",
      f."kcalPer100g",
      f."portionDefault",
      f."portionMinGrams",
      f."portionMaxGrams",
      f."portionStepGrams",
      GREATEST(
        similarity(COALESCE(f."normalizedName", ''), $1),
        similarity(f.name, $1),
        CASE WHEN $1 = ANY(f.synonyms) THEN 1.0 ELSE 0 END
      ) AS score
    FROM "TBACFood" f
    WHERE f.active = true
      ${restrictionSql}
      AND (
        COALESCE(f."normalizedName", '') % $1
        OR f.name % $1
        OR $1 = ANY(f.synonyms)
        OR COALESCE(f."normalizedName", '') ILIKE '%' || $1 || '%'
        OR f.name ILIKE '%' || $1 || '%'
      )
    ORDER BY score DESC, f.name ASC
    LIMIT $2
    `,
    query,
    topK,
  )

  return rows
    .filter((row) => row.score >= minScore)
    .map((row) => ({
      foodId: row.id,
      name: row.name,
      score: Number(row.score),
      category: row.category,
      nutritionalRole: row.nutritionalRole,
      kcalPer100g: row.kcalPer100g,
      portionDefaultGrams: row.portionDefault,
      portionMinGrams: row.portionMinGrams,
      portionMaxGrams: row.portionMaxGrams,
      portionStepGrams: row.portionStepGrams,
    }))
}
