import { describe, expect, it } from "vitest"
import { roleLimitsForMealCount } from "./catalog-limits"

describe("roleLimitsForMealCount", () => {
  it("requests enough distinct proteins for six meals", () => {
    const limits = roleLimitsForMealCount(6)

    expect(limits.protein).toBeGreaterThanOrEqual(6)
  })

  it("scales carbohydrate slots with meal count", () => {
    expect(roleLimitsForMealCount(6).carbohydrate).toBeGreaterThan(
      roleLimitsForMealCount(3).carbohydrate,
    )
  })
})
