import "dotenv/config"
/**
 * Seeds curated composite recipes for parse/import matching.
 * Usage: npm run recipes:seed
 */
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { normalizeFoodName } from "../src/lib/nutrition/normalize-name"

interface RecipeSeed {
  name: string
  synonyms: string[]
  servingGrams: number
  kcalPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g?: number
}

const RECIPES: RecipeSeed[] = [
  {
    name: "Vitamina de banana",
    synonyms: ["vitamina", "shake de banana", "banana com leite"],
    servingGrams: 300,
    kcalPer100g: 72,
    proteinPer100g: 2.8,
    carbsPer100g: 12,
    fatPer100g: 1.8,
    fiberPer100g: 0.8,
  },
  {
    name: "Omelete simples",
    synonyms: ["omelete", "omelete de ovos", "ovos mexidos"],
    servingGrams: 150,
    kcalPer100g: 154,
    proteinPer100g: 11,
    carbsPer100g: 1.2,
    fatPer100g: 11.5,
  },
  {
    name: "Salada verde com azeite",
    synonyms: ["salada verde", "salada de alface", "salada"],
    servingGrams: 120,
    kcalPer100g: 45,
    proteinPer100g: 1.5,
    carbsPer100g: 4,
    fatPer100g: 3,
    fiberPer100g: 2,
  },
  {
    name: "Tapioca com queijo",
    synonyms: ["tapioca", "tapioca recheada", "tapioca de queijo"],
    servingGrams: 100,
    kcalPer100g: 210,
    proteinPer100g: 7,
    carbsPer100g: 32,
    fatPer100g: 6,
  },
  {
    name: "Panqueca de banana",
    synonyms: ["panqueca", "panqueca fit", "panqueca de aveia"],
    servingGrams: 120,
    kcalPer100g: 165,
    proteinPer100g: 6,
    carbsPer100g: 24,
    fatPer100g: 5,
    fiberPer100g: 2.5,
  },
  {
    name: "Sopa de legumes",
    synonyms: ["sopa", "sopa de legumes", "caldo de legumes"],
    servingGrams: 300,
    kcalPer100g: 38,
    proteinPer100g: 1.5,
    carbsPer100g: 6,
    fatPer100g: 1,
    fiberPer100g: 1.8,
  },
  {
    name: "Sanduíche natural de frango",
    synonyms: ["sanduiche natural", "sanduiche de frango", "lanche natural"],
    servingGrams: 180,
    kcalPer100g: 145,
    proteinPer100g: 12,
    carbsPer100g: 16,
    fatPer100g: 4.5,
  },
  {
    name: "Mingau de aveia",
    synonyms: ["mingau", "aveia com leite", "papinha de aveia"],
    servingGrams: 250,
    kcalPer100g: 78,
    proteinPer100g: 3.2,
    carbsPer100g: 12,
    fatPer100g: 2.2,
    fiberPer100g: 1.6,
  },
  {
    name: "Wrap de atum",
    synonyms: ["wrap", "wrap de atum", "atum com pao"],
    servingGrams: 160,
    kcalPer100g: 168,
    proteinPer100g: 13,
    carbsPer100g: 18,
    fatPer100g: 5,
  },
  {
    name: "Iogurte com granola",
    synonyms: ["iogurte com granola", "granola com iogurte", "cafe da manha com granola"],
    servingGrams: 200,
    kcalPer100g: 118,
    proteinPer100g: 5,
    carbsPer100g: 17,
    fatPer100g: 3.5,
    fiberPer100g: 1.2,
  },
  {
    name: "Estrogonofe de frango",
    synonyms: ["estrogonofe", "frango ao molho", "estrogonofe de frango light"],
    servingGrams: 250,
    kcalPer100g: 112,
    proteinPer100g: 11,
    carbsPer100g: 6,
    fatPer100g: 5,
  },
  {
    name: "Salada de frutas",
    synonyms: ["salada de frutas", "macedonia", "frutas picadas"],
    servingGrams: 200,
    kcalPer100g: 58,
    proteinPer100g: 0.8,
    carbsPer100g: 14,
    fatPer100g: 0.3,
    fiberPer100g: 2,
  },
]

function createPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter: new PrismaPg(pool) } as ConstructorParameters<
    typeof PrismaClient
  >[0])
}

async function main() {
  const prisma = createPrisma()
  let created = 0
  let updated = 0

  for (const recipe of RECIPES) {
    const normalizedName = normalizeFoodName(recipe.name)
    const existing = await prisma.recipe.findFirst({
      where: { normalizedName },
    })

    if (existing) {
      await prisma.recipe.update({
        where: { id: existing.id },
        data: {
          name: recipe.name,
          synonyms: recipe.synonyms,
          servingGrams: recipe.servingGrams,
          kcalPer100g: recipe.kcalPer100g,
          proteinPer100g: recipe.proteinPer100g,
          carbsPer100g: recipe.carbsPer100g,
          fatPer100g: recipe.fatPer100g,
          fiberPer100g: recipe.fiberPer100g,
          active: true,
        },
      })
      updated += 1
      continue
    }

    await prisma.recipe.create({
      data: {
        name: recipe.name,
        normalizedName,
        synonyms: recipe.synonyms,
        servingGrams: recipe.servingGrams,
        kcalPer100g: recipe.kcalPer100g,
        proteinPer100g: recipe.proteinPer100g,
        carbsPer100g: recipe.carbsPer100g,
        fatPer100g: recipe.fatPer100g,
        fiberPer100g: recipe.fiberPer100g,
        active: true,
      },
    })
    created += 1
  }

  console.log(`Recipes seeded: ${created} created, ${updated} updated (${RECIPES.length} total)`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
