import { prisma } from "@/lib/db/prisma"
import type { TBACFood } from "@/generated/prisma"
import type { NutritionalRole } from "../types"
import { roleLimitsForMealCount } from "./catalog-limits"
import { inferMealRoles } from "./infer-role"
import {
  buildRestrictionWhereClause,
  parseRestrictionsText,
  type ParsedRestrictions,
} from "./restriction-parser"
import { rankFoodsForCatalog } from "./staple-ranking"

export interface FindFoodCandidatesParams {
  mealType: string
  restrictions?: ParsedRestrictions | string | string[] | null
  nutritionalRoles?: string[]
  limitPerRole?: number
  maxTotal?: number
}

const DEFAULT_LIMIT_PER_ROLE = 4
const POOL_PER_ROLE = 80
const DEFAULT_MAX_TOTAL = 28

function parseRestrictions(
  restrictions?: ParsedRestrictions | string | string[] | null,
): ParsedRestrictions {
  if (
    typeof restrictions === "object" &&
    restrictions !== null &&
    "excludeLactose" in restrictions
  ) {
    return restrictions
  }
  return parseRestrictionsText(restrictions)
}

async function fetchRankedByRole(
  role: string,
  limit: number,
  restrictions: ParsedRestrictions,
): Promise<TBACFood[]> {
  if (limit <= 0) return []

  const baseWhere = buildRestrictionWhereClause(restrictions)
  const pool = await prisma.tBACFood.findMany({
    where: {
      ...baseWhere,
      nutritionalRole: role,
    },
    take: POOL_PER_ROLE,
  })

  return rankFoodsForCatalog(pool).slice(0, limit)
}

async function buildGlobalStaplePool(
  mealCount: number,
  restrictions: ParsedRestrictions,
): Promise<Map<string, TBACFood>> {
  const limits = roleLimitsForMealCount(mealCount)
  const staples = new Map<string, TBACFood>()

  for (const [role, limit] of Object.entries(limits) as Array<
    [NutritionalRole, number]
  >) {
    const foods = await fetchRankedByRole(role, limit, restrictions)
    for (const food of foods) staples.set(food.id, food)
  }

  return staples
}

function mergeCandidates(
  globalStaples: Map<string, TBACFood>,
  mealSpecific: TBACFood[],
  maxTotal: number,
  mealIndex: number,
): TBACFood[] {
  const merged = new Map<string, TBACFood>()

  const proteins = [...globalStaples.values()].filter(
    (food) => food.nutritionalRole === "protein",
  )
  if (proteins.length > 0) {
    const leadProtein = proteins[mealIndex % proteins.length]
    merged.set(leadProtein.id, leadProtein)
  }

  for (const food of mealSpecific) merged.set(food.id, food)
  for (const food of globalStaples.values()) merged.set(food.id, food)

  return Array.from(merged.values()).slice(0, maxTotal)
}

export async function findFoodCandidates(
  params: FindFoodCandidatesParams,
): Promise<TBACFood[]> {
  const restrictions = parseRestrictions(params.restrictions)
  const roles = params.nutritionalRoles ?? inferMealRoles(params.mealType)
  const limitPerRole = params.limitPerRole ?? DEFAULT_LIMIT_PER_ROLE
  const maxTotal = params.maxTotal ?? DEFAULT_MAX_TOTAL
  const selected = new Map<string, TBACFood>()

  for (const role of roles) {
    const ranked = await fetchRankedByRole(role, limitPerRole, restrictions)

    for (const food of ranked) {
      selected.set(food.id, food)
      if (selected.size >= maxTotal) break
    }

    if (selected.size >= maxTotal) break
  }

  if (selected.size < Math.min(12, maxTotal)) {
    const fallbackPool = await prisma.tBACFood.findMany({
      where: buildRestrictionWhereClause(restrictions),
      take: POOL_PER_ROLE,
    })

    for (const food of rankFoodsForCatalog(fallbackPool)) {
      selected.set(food.id, food)
      if (selected.size >= maxTotal) break
    }
  }

  return Array.from(selected.values())
}

export async function buildCandidateCatalog(params: {
  mealTargets: Array<{ id: string; name: string }>
  restrictions?: ParsedRestrictions | string | string[] | null
}) {
  const mealCount = params.mealTargets.length
  const restrictions = parseRestrictions(params.restrictions)
  const globalStaples = await buildGlobalStaplePool(mealCount, restrictions)
  const perRoleLimit = Math.max(DEFAULT_LIMIT_PER_ROLE, Math.ceil(mealCount / 2))

  const foodsById = new Map<string, TBACFood>(globalStaples)
  const candidatesByMeal: Array<{
    mealId: string
    mealName: string
    candidates: TBACFood[]
  }> = []

  for (const [mealIndex, meal] of params.mealTargets.entries()) {
    const mealSpecific = await findFoodCandidates({
      mealType: meal.name,
      restrictions,
      limitPerRole: perRoleLimit,
      maxTotal: DEFAULT_MAX_TOTAL,
    })

    const candidates = mergeCandidates(
      globalStaples,
      mealSpecific,
      DEFAULT_MAX_TOTAL,
      mealIndex,
    )

    for (const food of candidates) foodsById.set(food.id, food)

    candidatesByMeal.push({
      mealId: meal.id,
      mealName: meal.name,
      candidates,
    })
  }

  return { foodsById, candidatesByMeal }
}

/** Counts distinct staples by role — useful in smoke/integration checks. */
export function countFoodsByRole(foods: Iterable<TBACFood>): Map<string, number> {
  const counts = new Map<string, number>()
  for (const food of foods) {
    const role = food.nutritionalRole ?? "unknown"
    counts.set(role, (counts.get(role) ?? 0) + 1)
  }
  return counts
}
