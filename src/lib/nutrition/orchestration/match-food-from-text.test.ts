import { describe, expect, it } from "vitest"
import { FOOD_MATCH_SCORE_THRESHOLD } from "./match-food-from-text"
import { EQUIVALENT_KCAL_TOLERANCE } from "../retrieval/search-equivalent-foods"

describe("match-food-from-text constants", () => {
  it("uses 0.75 lexical threshold for binding foods", () => {
    expect(FOOD_MATCH_SCORE_THRESHOLD).toBe(0.75)
  })
})

describe("search-equivalent-foods constants", () => {
  it("allows ±15% kcal deviation for swap suggestions", () => {
    expect(EQUIVALENT_KCAL_TOLERANCE).toBe(0.15)
  })
})
