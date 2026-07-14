import type { Sex } from "@/generated/prisma"

/**
 * Mifflin-St Jeor equation for Basal Metabolic Rate.
 *
 * Males:   BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age + 5
 * Females: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age - 161
 *
 * @returns BMR in kcal/day, rounded to nearest integer
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  ageYears: number,
  sex: Sex
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears
  const bmr = sex === "male" ? base + 5 : base - 161
  return Math.round(bmr)
}

/**
 * Calculate age from birth date.
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--
  }
  return age
}
