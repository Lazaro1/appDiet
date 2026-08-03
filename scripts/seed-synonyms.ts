import "dotenv/config"
/**
 * Augments common foods with colloquial synonyms for lexical search.
 * Run after tbca:import — idempotent (merges unique synonyms).
 */
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { normalizeFoodName } from "../src/lib/nutrition/normalize-name"

const SYNONYM_MAP: Record<string, string[]> = {
  "frango, peito, sem pele, grelhado": [
    "frango grelhado",
    "peito de frango",
    "file de frango",
    "frango sem pele",
  ],
  "arroz, branco, cozido": ["arroz branco", "arroz cozido", "arroz"],
  "arroz, integral, cozido": ["arroz integral"],
  "feijao, carioca, cozido": ["feijao carioca", "feijao"],
  "ovo, de galinha, cozido": ["ovo cozido", "ovos", "ovo"],
  "pao, integral": ["pao integral", "fatia de pao integral"],
  "pao, frances": ["pao frances", "pao"],
  "iogurte, natural": ["iogurte natural", "iogurte"],
  "leite, integral": ["leite", "copo de leite"],
  "banana, prata": ["banana", "banana prata"],
  "maca, fuji": ["maca", "maca fuji"],
  "atum, em conserva, agua": ["atum em lata", "atum"],
  "batata-doce, cozida": ["batata doce", "batata-doce cozida"],
  "brocolis, cozido": ["brocolis", "brocolis cozido"],
  "batata, inglesa, cozida": ["batata cozida", "batata"],
  "alface, americana, crua": ["alface", "salada de alface"],
  "couve, refogada": ["couve refogada", "couve"],
  "azeite, de oliva": ["azeite", "azeite de oliva"],
  "aveia, flocos, crua": ["aveia", "aveia em flocos"],
  "queijo, minas, frescal": ["queijo minas", "queijo branco"],
}

function createPrisma() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter: new PrismaPg(pool) } as ConstructorParameters<
    typeof PrismaClient
  >[0])
}

async function main() {
  const prisma = createPrisma()
  let updated = 0

  for (const [nameKey, synonyms] of Object.entries(SYNONYM_MAP)) {
    const normalized = normalizeFoodName(nameKey)
    const food = await prisma.tBACFood.findFirst({
      where: {
        OR: [
          { normalizedName: normalized },
          { name: { equals: nameKey, mode: "insensitive" } },
        ],
      },
    })

    if (!food) continue

    const merged = Array.from(
      new Set([
        ...food.synonyms,
        ...synonyms.map((s) => normalizeFoodName(s)),
      ]),
    )

    await prisma.tBACFood.update({
      where: { id: food.id },
      data: { synonyms: merged },
    })
    updated++
  }

  console.log(`Synonyms updated for ${updated} foods`)
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
