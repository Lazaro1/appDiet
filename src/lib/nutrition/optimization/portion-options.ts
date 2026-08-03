import {
  resolvePortionConstraints,
  type PortionConstraints,
  type PortionSource,
} from "../validation/portion-validator"

const MAX_OPTIONS = 60

/**
 * Discrete gram values a food can take, walking the step grid between min and
 * max. Both bounds are always included so the extremes stay reachable.
 */
export function generatePortionOptions(food: PortionSource): number[] {
  return portionOptionsFromConstraints(resolvePortionConstraints(food))
}

export function portionOptionsFromConstraints(
  constraints: PortionConstraints,
): number[] {
  const { minGrams, maxGrams, stepGrams } = constraints

  if (maxGrams <= minGrams) return [minGrams]

  const span = maxGrams - minGrams
  // Widen the stride in multiples of the step so options stay on the grid.
  const stride = stepGrams * Math.max(1, Math.ceil(span / stepGrams / MAX_OPTIONS))
  const options: number[] = []

  for (let grams = minGrams; grams < maxGrams; grams += stride) {
    options.push(Math.round(grams * 100) / 100)
  }
  options.push(maxGrams)

  return options
}
