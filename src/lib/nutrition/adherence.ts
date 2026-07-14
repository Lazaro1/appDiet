/**
 * Adherence metrics for diet tracking.
 *
 * Two key metrics:
 * 1. Registration rate — % of planned meals that were logged
 * 2. Conformity rate — % of logged meals within ±10% of target kcal
 */

/** Conformity threshold: meal is "conformant" if within ±10% of target */
export const CONFORMITY_THRESHOLD = 0.1

export interface AdherenceMetrics {
  /** % of planned meals that were logged (0–100) */
  registrationRate: number
  /** % of logged meals within ±10% of target kcal (0–100) */
  conformityRate: number
  /** Combined adherence score (weighted average: 40% registration + 60% conformity) */
  adherenceScore: number
  /** Total meals planned in the period */
  totalPlanned: number
  /** Total meals logged in the period */
  totalLogged: number
  /** Total conformant meals in the period */
  totalConformant: number
}

/**
 * Check if a meal's actual kcal is within the conformity threshold of the target.
 */
export function isConformant(actualKcal: number, targetKcal: number): boolean {
  if (targetKcal <= 0) return false
  const ratio = Math.abs(actualKcal - targetKcal) / targetKcal
  return ratio <= CONFORMITY_THRESHOLD
}

/**
 * Calculate adherence metrics for a period.
 *
 * @param totalPlanned - Number of meals planned in the period
 * @param totalLogged - Number of meals actually logged
 * @param totalConformant - Number of logged meals within ±10% of target
 * @returns Adherence metrics with rates as percentages (0–100)
 */
export function calculateAdherence(
  totalPlanned: number,
  totalLogged: number,
  totalConformant: number
): AdherenceMetrics {
  const registrationRate =
    totalPlanned > 0 ? Math.round((totalLogged / totalPlanned) * 100) : 0
  const conformityRate =
    totalLogged > 0 ? Math.round((totalConformant / totalLogged) * 100) : 0

  // Weighted: conformity matters more than just logging
  const adherenceScore = Math.round(
    registrationRate * 0.4 + conformityRate * 0.6
  )

  return {
    registrationRate,
    conformityRate,
    adherenceScore,
    totalPlanned,
    totalLogged,
    totalConformant,
  }
}

/**
 * Get a human-readable label for the adherence score.
 */
export function getAdherenceLabel(score: number): string {
  if (score >= 90) return "Excelente"
  if (score >= 75) return "Bom"
  if (score >= 60) return "Regular"
  if (score >= 40) return "Atenção"
  return "Crítico"
}
