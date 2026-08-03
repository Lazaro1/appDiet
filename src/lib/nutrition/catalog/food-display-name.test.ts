import { describe, expect, it } from "vitest"
import { formatFoodDisplayName } from "./food-display-name"

describe("formatFoodDisplayName", () => {
  it("prefers a short synonym when available", () => {
    expect(
      formatFoodDisplayName(
        "Frango, peito, sem pele, grelhado",
        ["frango grelhado", "peito de frango"],
      ),
    ).toBe("Frango grelhado")
  })

  it("uses the first segment before comma when there is no synonym", () => {
    expect(
      formatFoodDisplayName(
        "Arroz, branco, cozido",
        [],
      ),
    ).toBe("Arroz")
  })

  it("truncates very long primary segments", () => {
    const long = "A".repeat(60)
    expect(formatFoodDisplayName(long)).toMatch(/…$/)
  })
})
