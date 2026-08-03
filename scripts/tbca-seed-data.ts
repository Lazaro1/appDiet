/**
 * Curated subset of common Brazilian foods for local dev and tests.
 * Replace with full TBCA via TBCA_FILE_PATH when importing production data.
 */
export interface TbcaSeedRow {
  externalCode: string
  name: string
  category: string
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

export const TBCA_SEED_FOODS: TbcaSeedRow[] = [
  { externalCode: "S001", name: "Arroz, branco, cozido", category: "cereais", kcalPer100g: 130, proteinPer100g: 2.5, carbsPer100g: 28, fatPer100g: 0.3, fiberPer100g: 0.4, portionDefault: 150, synonyms: ["arroz branco", "arroz cozido"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S002", name: "Arroz, integral, cozido", category: "cereais", kcalPer100g: 124, proteinPer100g: 2.6, carbsPer100g: 25.8, fatPer100g: 1, fiberPer100g: 2.7, portionDefault: 150, synonyms: ["arroz integral"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S003", name: "Feijao, carioca, cozido", category: "leguminosas", kcalPer100g: 77, proteinPer100g: 4.8, carbsPer100g: 13.6, fatPer100g: 0.5, fiberPer100g: 8.5, portionDefault: 100, synonyms: ["feijao carioca", "feijao cozido"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S004", name: "Feijao, preto, cozido", category: "leguminosas", kcalPer100g: 77, proteinPer100g: 4.5, carbsPer100g: 14, fatPer100g: 0.5, fiberPer100g: 8.4, portionDefault: 100, synonyms: ["feijao preto"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S005", name: "Frango, peito, sem pele, grelhado", category: "aves", kcalPer100g: 159, proteinPer100g: 32, carbsPer100g: 0, fatPer100g: 3.2, fiberPer100g: 0, portionDefault: 120, preparationMethod: "grelhado", synonyms: ["frango grelhado", "peito de frango", "file de frango"], containsGluten: false, containsLactose: false, containsAnimal: true },
  { externalCode: "S006", name: "Frango, coxa, assada", category: "aves", kcalPer100g: 210, proteinPer100g: 26, carbsPer100g: 0, fatPer100g: 11, fiberPer100g: 0, portionDefault: 100, synonyms: ["coxa de frango"], containsGluten: false, containsLactose: false, containsAnimal: true },
  { externalCode: "S007", name: "Carne bovina, patinho, grelhada", category: "carnes", kcalPer100g: 180, proteinPer100g: 32, carbsPer100g: 0, fatPer100g: 5, fiberPer100g: 0, portionDefault: 120, synonyms: ["carne magra", "patinho"], containsGluten: false, containsLactose: false, containsAnimal: true },
  { externalCode: "S008", name: "Ovo, de galinha, cozido", category: "ovos", kcalPer100g: 143, proteinPer100g: 13, carbsPer100g: 0.6, fatPer100g: 9.5, fiberPer100g: 0, portionDefault: 50, synonyms: ["ovo cozido", "ovos"], containsGluten: false, containsLactose: false, containsAnimal: true },
  { externalCode: "S009", name: "Ovo, de galinha, mexido", category: "ovos", kcalPer100g: 168, proteinPer100g: 11, carbsPer100g: 1.2, fatPer100g: 12.7, fiberPer100g: 0, portionDefault: 100, synonyms: ["ovos mexidos"], containsGluten: false, containsLactose: false, containsAnimal: true },
  { externalCode: "S010", name: "Pao, frances", category: "cereais", kcalPer100g: 300, proteinPer100g: 9, carbsPer100g: 58, fatPer100g: 3.6, fiberPer100g: 2.3, portionDefault: 50, synonyms: ["pao frances", "pao"], containsGluten: true, containsLactose: false, containsAnimal: false },
  { externalCode: "S011", name: "Pao, integral", category: "cereais", kcalPer100g: 250, proteinPer100g: 10, carbsPer100g: 44, fatPer100g: 4, fiberPer100g: 7, portionDefault: 50, synonyms: ["pao integral"], containsGluten: true, containsLactose: false, containsAnimal: false },
  { externalCode: "S012", name: "Leite, integral", category: "laticinios", kcalPer100g: 61, proteinPer100g: 3.2, carbsPer100g: 4.6, fatPer100g: 3.3, fiberPer100g: 0, portionDefault: 200, synonyms: ["leite"], containsGluten: false, containsLactose: true, containsAnimal: true },
  { externalCode: "S013", name: "Iogurte, natural", category: "laticinios", kcalPer100g: 51, proteinPer100g: 4.1, carbsPer100g: 5.9, fatPer100g: 1.5, fiberPer100g: 0, portionDefault: 170, synonyms: ["iogurte natural", "iogurte"], containsGluten: false, containsLactose: true, containsAnimal: true },
  { externalCode: "S014", name: "Queijo, minas frescal", category: "laticinios", kcalPer100g: 264, proteinPer100g: 17, carbsPer100g: 3.2, fatPer100g: 20, fiberPer100g: 0, portionDefault: 30, synonyms: ["queijo minas", "queijo branco"], containsGluten: false, containsLactose: true, containsAnimal: true },
  { externalCode: "S015", name: "Banana, prata", category: "frutas", kcalPer100g: 98, proteinPer100g: 1.3, carbsPer100g: 26, fatPer100g: 0.1, fiberPer100g: 2, portionDefault: 80, synonyms: ["banana"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S016", name: "Maca, fuji", category: "frutas", kcalPer100g: 56, proteinPer100g: 0.2, carbsPer100g: 15, fatPer100g: 0.1, fiberPer100g: 1.3, portionDefault: 130, synonyms: ["maca"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S017", name: "Mamao, formosa", category: "frutas", kcalPer100g: 45, proteinPer100g: 0.5, carbsPer100g: 11.6, fatPer100g: 0.1, fiberPer100g: 1.8, portionDefault: 140, synonyms: ["mamao"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S018", name: "Alface, crespa", category: "verduras", kcalPer100g: 11, proteinPer100g: 1.3, carbsPer100g: 1.7, fatPer100g: 0.2, fiberPer100g: 1.8, portionDefault: 30, synonyms: ["alface", "salada"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S019", name: "Tomate, cru", category: "legumes", kcalPer100g: 15, proteinPer100g: 1.1, carbsPer100g: 3.1, fatPer100g: 0.2, fiberPer100g: 1.2, portionDefault: 80, synonyms: ["tomate"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S020", name: "Brocolis, cozido", category: "legumes", kcalPer100g: 25, proteinPer100g: 2.1, carbsPer100g: 4.4, fatPer100g: 0.4, fiberPer100g: 2.6, portionDefault: 100, synonyms: ["brocolis"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S021", name: "Batata, inglesa, cozida", category: "tuberculos", kcalPer100g: 52, proteinPer100g: 1.2, carbsPer100g: 11.9, fatPer100g: 0.1, fiberPer100g: 1.3, portionDefault: 150, synonyms: ["batata cozida", "batata"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S022", name: "Batata-doce, cozida", category: "tuberculos", kcalPer100g: 77, proteinPer100g: 0.6, carbsPer100g: 18.4, fatPer100g: 0.1, fiberPer100g: 2.2, portionDefault: 150, synonyms: ["batata doce"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S023", name: "Aveia, flocos", category: "cereais", kcalPer100g: 394, proteinPer100g: 14, carbsPer100g: 66, fatPer100g: 8, fiberPer100g: 9, portionDefault: 40, synonyms: ["aveia"], containsGluten: true, containsLactose: false, containsAnimal: false },
  { externalCode: "S024", name: "Granola", category: "cereais", kcalPer100g: 471, proteinPer100g: 10, carbsPer100g: 64, fatPer100g: 20, fiberPer100g: 8, portionDefault: 40, synonyms: ["granola"], containsGluten: true, containsLactose: false, containsAnimal: false },
  { externalCode: "S025", name: "Azeite, de oliva", category: "oleos", kcalPer100g: 884, proteinPer100g: 0, carbsPer100g: 0, fatPer100g: 100, fiberPer100g: 0, portionDefault: 10, synonyms: ["azeite"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S026", name: "Atum, em conserva, agua", category: "peixes", kcalPer100g: 103, proteinPer100g: 23, carbsPer100g: 0, fatPer100g: 0.8, fiberPer100g: 0, portionDefault: 80, synonyms: ["atum em lata", "atum"], containsGluten: false, containsLactose: false, containsAnimal: true },
  { externalCode: "S027", name: "Sardinha, em conserva", category: "peixes", kcalPer100g: 208, proteinPer100g: 24, carbsPer100g: 0, fatPer100g: 12, fiberPer100g: 0, portionDefault: 80, synonyms: ["sardinha"], containsGluten: false, containsLactose: false, containsAnimal: true },
  { externalCode: "S028", name: "Tofu, firme", category: "leguminosas", kcalPer100g: 76, proteinPer100g: 8, carbsPer100g: 1.9, fatPer100g: 4.8, fiberPer100g: 0.3, portionDefault: 100, synonyms: ["tofu"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S029", name: "Lentilha, cozida", category: "leguminosas", kcalPer100g: 93, proteinPer100g: 7, carbsPer100g: 16, fatPer100g: 0.4, fiberPer100g: 5, portionDefault: 100, synonyms: ["lentilha"], containsGluten: false, containsLactose: false, containsAnimal: false },
  { externalCode: "S030", name: "Macarrao, cozido", category: "cereais", kcalPer100g: 131, proteinPer100g: 5, carbsPer100g: 25, fatPer100g: 1.1, fiberPer100g: 1.8, portionDefault: 150, synonyms: ["macarrao", "massa"], containsGluten: true, containsLactose: false, containsAnimal: false },
]

// Generate additional variants programmatically to reach ~120 items for dev
function expandSeed(base: TbcaSeedRow[]): TbcaSeedRow[] {
  const extras: TbcaSeedRow[] = []
  let counter = base.length + 1

  const templates = [
    { prefix: "Suco de", category: "bebidas", kcal: 45, p: 0.5, c: 10, f: 0.1, portion: 200 },
    { prefix: "Iogurte com", category: "laticinios", kcal: 80, p: 4, c: 12, f: 2, portion: 170, lactose: true, animal: true },
    { prefix: "Salada de", category: "verduras", kcal: 25, p: 1.5, c: 4, f: 0.5, portion: 100 },
    { prefix: "Sopa de", category: "complement", kcal: 40, p: 2, c: 6, f: 1, portion: 250 },
  ]

  const flavors = [
    "laranja", "maracuja", "abacaxi", "morango", "manga", "uva",
    "frutas vermelhas", "banana", "cenoura", "legumes", "ervilha",
    "abobora", "mandioca", "inhame", "couve", "espinafre",
  ]

  for (const flavor of flavors) {
    for (const tpl of templates) {
      const code = `S${String(counter).padStart(3, "0")}`
      counter++
      extras.push({
        externalCode: code,
        name: `${tpl.prefix} ${flavor}`,
        category: tpl.category,
        kcalPer100g: tpl.kcal + (counter % 7),
        proteinPer100g: tpl.p,
        carbsPer100g: tpl.c,
        fatPer100g: tpl.f,
        portionDefault: tpl.portion,
        containsGluten: false,
        containsLactose: tpl.lactose ?? false,
        containsAnimal: tpl.animal ?? false,
      })
    }
  }

  return [...base, ...extras]
}

export const ALL_TBCA_SEED_FOODS = expandSeed(TBCA_SEED_FOODS)
