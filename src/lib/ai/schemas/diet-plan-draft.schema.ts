import { z } from "zod"

const draftItemSchema = z.object({
  foodId: z.string().min(1),
  quantityGrams: z.coerce.number().finite().positive().max(1000),
})

const draftMealSchema = z.object({
  mealId: z.string().min(1),
  items: z.array(draftItemSchema).min(1),
})

const okDraftSchema = z.object({
  status: z.literal("ok"),
  meals: z.array(draftMealSchema).min(1),
})

const unfeasibleDraftSchema = z.object({
  status: z.literal("unfeasible"),
  reason: z.string().min(1).max(500),
})

/** Base draft schema without catalog awareness. */
export const generatedDietDraftSchema = z.discriminatedUnion("status", [
  okDraftSchema,
  unfeasibleDraftSchema,
])

export type GeneratedDietDraftParsed = z.infer<typeof generatedDietDraftSchema>

/**
 * Draft schema that also rejects foodIds outside the catalog sent to the model.
 * Invalid ids surface as a validation error so the retry loop can re-prompt.
 */
export function buildGeneratedDietDraftSchema(allowedFoodIds: Set<string>) {
  return generatedDietDraftSchema.superRefine((draft, ctx) => {
    if (draft.status !== "ok") return

    const invalid = new Set<string>()

    for (const meal of draft.meals) {
      for (const item of meal.items) {
        if (!allowedFoodIds.has(item.foodId)) {
          invalid.add(item.foodId)
        }
      }
    }

    if (invalid.size > 0) {
      ctx.addIssue({
        code: "custom",
        message: `foodId fora do catálogo: ${Array.from(invalid).join(", ")}`,
      })
    }
  })
}

/** Collects draft foodIds that are not present in the catalog. */
export function findInvalidFoodIds(
  draft: GeneratedDietDraftParsed,
  allowedFoodIds: Set<string>,
): string[] {
  if (draft.status !== "ok") return []

  const invalid = new Set<string>()
  for (const meal of draft.meals) {
    for (const item of meal.items) {
      if (!allowedFoodIds.has(item.foodId)) invalid.add(item.foodId)
    }
  }

  return Array.from(invalid)
}
