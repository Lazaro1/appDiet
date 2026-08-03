import "dotenv/config"
/**
 * Smoke test for TBCA-backed food matching used by parseMeal.
 * Usage: npm run smoke:parse
 */
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import {
  FOOD_MATCH_SCORE_THRESHOLD,
  matchFoodFromText,
} from "../src/lib/nutrition/orchestration/match-food-from-text"

const CASES = [
  {
    phrase: "2 ovos e pão integral",
    items: [
      { foodName: "ovo cozido", estimatedGrams: 100 },
      { foodName: "pao integral", estimatedGrams: 50 },
    ],
  },
  {
    phrase: "arroz, feijão e frango grelhado",
    items: [
      { foodName: "arroz branco", estimatedGrams: 150 },
      { foodName: "feijao carioca", estimatedGrams: 100 },
      { foodName: "frango grelhado", estimatedGrams: 120 },
    ],
  },
  {
    phrase: "iogurte natural com banana",
    items: [
      { foodName: "iogurte natural", estimatedGrams: 170 },
      { foodName: "banana", estimatedGrams: 100 },
    ],
  },
  {
    phrase: "atum com batata doce",
    items: [
      { foodName: "atum em lata", estimatedGrams: 100 },
      { foodName: "batata doce", estimatedGrams: 150 },
    ],
  },
  {
    phrase: "salada de alface com azeite",
    items: [
      { foodName: "alface", estimatedGrams: 80 },
      { foodName: "azeite de oliva", estimatedGrams: 10 },
    ],
  },
]

function createPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter: new PrismaPg(pool) } as ConstructorParameters<
    typeof PrismaClient
  >[0])
}

async function main() {
  createPrisma()

  let totalItems = 0
  let matchedItems = 0

  for (const testCase of CASES) {
    console.log(`\n"${testCase.phrase}"`)
    for (const item of testCase.items) {
      totalItems += 1
      const match = await matchFoodFromText(item.foodName)
      const ok =
        (match.foodId || match.recipeId) &&
        match.score >= FOOD_MATCH_SCORE_THRESHOLD
      if (ok) matchedItems += 1

      console.log(
        `  ${ok ? "OK" : "FAIL"}  ${item.foodName} → ${match.displayName} (${match.score.toFixed(2)}, ${match.source})`,
      )
    }
  }

  const ratio = matchedItems / totalItems
  console.log(
    `\n${matchedItems}/${totalItems} items matched (threshold: score >= ${FOOD_MATCH_SCORE_THRESHOLD}, need >= 80%)`,
  )

  if (ratio < 0.8) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
