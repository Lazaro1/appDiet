import { describe, expect, it } from "vitest"
import {
  isCatalogEligible,
  scoreFoodForCatalog,
} from "./staple-ranking"

describe("staple-ranking", () => {
  it("scores simple staples higher than composite dishes", () => {
    const staple = scoreFoodForCatalog({
      name: "Arroz, branco, cozido",
      synonyms: ["arroz branco"],
    })
    const composite = scoreFoodForCatalog({
      name: "Almôndega, carne bovina, grelhada, caseira, c/ sal, (carne bovina moída patinho, farinha de rosca)",
    })

    expect(staple).toBeGreaterThan(composite)
    expect(isCatalogEligible({ name: "Arroz, branco, cozido", synonyms: ["arroz"] })).toBe(true)
    expect(
      isCatalogEligible({
        name: "Almôndega, carne bovina, grelhada, caseira, c/ sal, (carne bovina moída patinho)",
      }),
    ).toBe(false)
  })

  it("boosts foods with synonyms", () => {
    const withSynonyms = scoreFoodForCatalog({
      name: "Frango, peito, sem pele, grelhado",
      synonyms: ["frango grelhado"],
    })
    const without = scoreFoodForCatalog({
      name: "Frango, peito, sem pele, grelhado",
      synonyms: [],
    })

    expect(withSynonyms).toBeGreaterThan(without)
  })
})
