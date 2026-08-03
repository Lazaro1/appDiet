import { z } from "zod"

export const mealParseDraftItemSchema = z.object({
  foodName: z.string().min(1),
  estimatedGrams: z.coerce.number().finite().positive().max(5000),
})

export const mealParseDraftResponseSchema = z.object({
  items: z.array(mealParseDraftItemSchema).min(1),
})

export type MealParseDraftItem = z.infer<typeof mealParseDraftItemSchema>
