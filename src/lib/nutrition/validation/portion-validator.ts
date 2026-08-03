export interface PortionConstraints {
  minGrams: number
  maxGrams: number
  stepGrams: number
  defaultGrams: number
}

const FALLBACK_CONSTRAINTS: PortionConstraints = {
  minGrams: 20,
  maxGrams: 400,
  stepGrams: 5,
  defaultGrams: 100,
}

export interface PortionSource {
  portionMinGrams?: number | null
  portionMaxGrams?: number | null
  portionStepGrams?: number | null
  portionDefault?: number | null
}

export function resolvePortionConstraints(
  food: PortionSource,
): PortionConstraints {
  const minGrams = food.portionMinGrams ?? FALLBACK_CONSTRAINTS.minGrams
  const maxGrams = Math.max(
    minGrams,
    food.portionMaxGrams ?? FALLBACK_CONSTRAINTS.maxGrams,
  )
  const stepGrams =
    food.portionStepGrams && food.portionStepGrams > 0
      ? food.portionStepGrams
      : FALLBACK_CONSTRAINTS.stepGrams

  const rawDefault = food.portionDefault ?? FALLBACK_CONSTRAINTS.defaultGrams

  return {
    minGrams,
    maxGrams,
    stepGrams,
    defaultGrams: Math.min(maxGrams, Math.max(minGrams, rawDefault)),
  }
}

export type PortionProblem = "below_min" | "above_max" | "off_step"

export function checkPortion(
  grams: number,
  constraints: PortionConstraints,
): PortionProblem | null {
  if (grams < constraints.minGrams) return "below_min"
  if (grams > constraints.maxGrams) return "above_max"

  // Bounds are always reachable even when they don't sit on the step grid.
  if (grams === constraints.minGrams || grams === constraints.maxGrams) return null

  const remainder = Math.abs(grams % constraints.stepGrams)
  const offStep = remainder > 0.001 && Math.abs(remainder - constraints.stepGrams) > 0.001

  return offStep ? "off_step" : null
}

/** Clamps to the allowed range and snaps to the nearest valid step. */
export function normalizePortion(
  grams: number,
  constraints: PortionConstraints,
): number {
  const snapped = Math.round(grams / constraints.stepGrams) * constraints.stepGrams
  const clamped = Math.min(
    constraints.maxGrams,
    Math.max(constraints.minGrams, snapped),
  )

  return Math.round(clamped * 100) / 100
}
