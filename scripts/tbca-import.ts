import "dotenv/config"
import { readFileSync, existsSync } from "node:fs"
import { resolve } from "node:path"
import { PrismaClient } from "../src/generated/prisma"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import { normalizeFoodName } from "../src/lib/nutrition/normalize-name"
import { inferNutritionalRole } from "../src/lib/nutrition/catalog/infer-role"
import { ALL_TBCA_SEED_FOODS } from "./tbca-seed-data"

interface ImportRow {
  externalCode?: string
  name: string
  category?: string
  kcalPer100g: number
  proteinPer100g: number
  carbsPer100g: number
  fatPer100g: number
  fiberPer100g?: number
  portionDefault?: number
  preparationMethod?: string
  synonyms?: string[]
  containsGluten?: boolean
  containsLactose?: boolean
  containsAnimal?: boolean
}

function createPrisma() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error("DATABASE_URL is required")
  }

  const pool = new Pool({ connectionString })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
}

function inferAllergens(row: ImportRow): {
  containsGluten?: boolean
  containsLactose?: boolean
  containsAnimal?: boolean
} {
  const text = normalizeFoodName(`${row.name} ${row.category ?? ""}`)

  return {
    containsGluten:
      row.containsGluten ??
      /pao|trigo|macarrao|aveia|bolo|farinha|torrada|granola|biscoito/.test(text),
    containsLactose:
      row.containsLactose ??
      /leite|iogurte|queijo|requeijao|manteiga|creme|latic/.test(text),
    containsAnimal:
      row.containsAnimal ??
      /frango|carne|peixe|ovo|leite|queijo|porco|boi|atum|camarao|sardinha|frango|ave/.test(
        text,
      ),
  }
}

function defaultPortions(category?: string) {
  const cat = normalizeFoodName(category ?? "")
  if (cat.includes("cereal") || cat.includes("tuberc")) {
    return { min: 80, max: 200, step: 10, default: 150 }
  }
  if (cat.includes("carne") || cat.includes("ave") || cat.includes("peixe") || cat.includes("ovo")) {
    return { min: 80, max: 200, step: 10, default: 120 }
  }
  if (cat.includes("fruta")) {
    return { min: 50, max: 200, step: 10, default: 100 }
  }
  if (cat.includes("verdura") || cat.includes("legume")) {
    return { min: 30, max: 200, step: 10, default: 80 }
  }
  return { min: 30, max: 300, step: 5, default: 100 }
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }

  values.push(current.trim())
  return values
}

function parseCsv(content: string): ImportRow[] {
  const lines = content.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) return []

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase())
  const rows: ImportRow[] = []

  for (const line of lines.slice(1)) {
    const values = parseCsvLine(line)
    const record: Record<string, string> = {}
    headers.forEach((header, index) => {
      record[header] = values[index] ?? ""
    })

    const name = record.name || record.nome || record.alimento
    if (!name) continue

    rows.push({
      externalCode: record.externalcode || record.codigo || record.id,
      name,
      category: record.category || record.categoria,
      kcalPer100g: Number(record.kcalper100g || record.kcal || record.energia || 0),
      proteinPer100g: Number(record.proteinper100g || record.proteina || 0),
      carbsPer100g: Number(record.carbsper100g || record.carboidrato || 0),
      fatPer100g: Number(record.fatper100g || record.gordura || 0),
      fiberPer100g: Number(record.fiberper100g || record.fibra || 0) || undefined,
      portionDefault: Number(record.portiondefault || record.porcao || 0) || undefined,
    })
  }

  return rows.filter((row) => row.kcalPer100g > 0)
}

function parseJson(content: string): ImportRow[] {
  const parsed = JSON.parse(content) as { foods?: ImportRow[] } | ImportRow[]
  const foods = Array.isArray(parsed) ? parsed : parsed.foods ?? []
  return foods.filter((row) => row.name && row.kcalPer100g > 0)
}

function loadRows(filePath: string): ImportRow[] {
  const absolute = resolve(filePath)
  if (!existsSync(absolute)) {
    throw new Error(`TBCA file not found: ${absolute}`)
  }

  const content = readFileSync(absolute, "utf-8")
  if (absolute.endsWith(".csv")) return parseCsv(content)
  return parseJson(content)
}

async function upsertFood(prisma: PrismaClient, row: ImportRow) {
  const allergens = inferAllergens(row)
  const portions = defaultPortions(row.category)
  const normalizedName = normalizeFoodName(row.name)
  const nutritionalRole = inferNutritionalRole(row.name, row.category)
  const externalCode = row.externalCode ?? normalizedName

  const data = {
    externalCode,
    name: row.name,
    normalizedName,
    category: row.category ?? null,
    nutritionalRole,
    preparationMethod: row.preparationMethod ?? null,
    kcalPer100g: row.kcalPer100g,
    proteinPer100g: row.proteinPer100g,
    carbsPer100g: row.carbsPer100g,
    fatPer100g: row.fatPer100g,
    fiberPer100g: row.fiberPer100g ?? null,
    portionDefault: row.portionDefault ?? portions.default,
    portionMinGrams: portions.min,
    portionMaxGrams: portions.max,
    portionStepGrams: portions.step,
    synonyms: row.synonyms ?? [],
    containsGluten: allergens.containsGluten ?? null,
    containsLactose: allergens.containsLactose ?? null,
    containsAnimal: allergens.containsAnimal ?? null,
    active: true,
  }

  return prisma.tBACFood.upsert({
    where: { externalCode },
    create: data,
    update: data,
  })
}

async function main() {
  const prisma = createPrisma()
  const filePath = process.env.TBCA_FILE_PATH

  let rows: ImportRow[]
  if (filePath) {
    console.log(`Importing TBCA from ${filePath}`)
    rows = loadRows(filePath)
  } else {
    console.log("TBCA_FILE_PATH not set — using built-in seed dataset")
    rows = ALL_TBCA_SEED_FOODS as ImportRow[]
  }

  let imported = 0
  for (const row of rows) {
    await upsertFood(prisma, row)
    imported++
    if (imported % 500 === 0) {
      console.log(`  ... ${imported} foods`)
    }
  }

  const total = await prisma.tBACFood.count({ where: { active: true } })
  console.log(`Import complete: ${imported} rows processed, ${total} active foods in DB`)

  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
