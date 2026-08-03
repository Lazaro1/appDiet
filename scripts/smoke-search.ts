import "dotenv/config"
/**
 * Smoke test for lexical food search.
 * Usage: yarn smoke:search
 */
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { searchFoods } from "../src/lib/nutrition/retrieval/search-foods"

const QUERIES = [
  "frango grelhado",
  "arroz branco",
  "feijao",
  "ovo cozido",
  "pao integral",
  "iogurte natural",
  "banana",
  "atum",
  "batata doce",
  "brocolis",
]

function createPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter: new PrismaPg(pool) } as ConstructorParameters<
    typeof PrismaClient
  >[0])
}

async function main() {
  createPrisma() // ensure DATABASE_URL is set

  let passed = 0
  for (const query of QUERIES) {
    const results = await searchFoods({ query, topK: 3, minScore: 0.2 })
    const top = results[0]
    const ok = top && top.score >= 0.3
    if (ok) passed++
    console.log(
      `${ok ? "OK" : "FAIL"}  "${query}" → ${top ? `${top.name} (${top.score.toFixed(2)})` : "no match"}`,
    )
  }

  console.log(`\n${passed}/${QUERIES.length} queries passed (threshold: score >= 0.3)`)
  if (passed < 8) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
