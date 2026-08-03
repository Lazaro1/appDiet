import { z } from "zod"
import { mealParseDraftItemSchema } from "./meal-parse-draft.schema"

export const dietImportDraftSchema = z.object({
  meals: z
    .array(
      z.object({
        name: z.string().min(1),
        kcalTarget: z.coerce.number().finite().positive().optional(),
        items: z.array(mealParseDraftItemSchema).min(1),
      }),
    )
    .min(1),
})

export type DietImportDraft = z.infer<typeof dietImportDraftSchema>
