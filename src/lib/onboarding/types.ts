import { z } from "zod"

// ──────────────────────────────────────────────
// Step 1: Dados básicos
// ──────────────────────────────────────────────
export const step1Schema = z.object({
  name: z
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome deve ter no máximo 100 caracteres"),
  birthDate: z.string().min(1, "Informe sua data de nascimento"),
  sex: z.enum(["male", "female"], { message: "Selecione o sexo" }),
})

export type Step1Data = z.infer<typeof step1Schema>

// ──────────────────────────────────────────────
// Step 2: Medidas
// ──────────────────────────────────────────────
export const step2Schema = z.object({
  weight: z
    .number({ message: "Informe seu peso" })
    .min(30, "Peso mínimo: 30 kg")
    .max(300, "Peso máximo: 300 kg"),
  height: z
    .number({ message: "Informe sua altura" })
    .min(100, "Altura mínima: 100 cm")
    .max(250, "Altura máxima: 250 cm"),
})

export type Step2Data = z.infer<typeof step2Schema>

// ──────────────────────────────────────────────
// Step 3: Objetivo e atividade
// ──────────────────────────────────────────────
export const step3Schema = z.object({
  goal: z.enum(["lose", "gain", "maintain"], {
    message: "Selecione seu objetivo",
  }),
  activityLevel: z.enum(
    ["sedentary", "light", "moderate", "active", "very_active"],
    { message: "Selecione seu nível de atividade" }
  ),
})

export type Step3Data = z.infer<typeof step3Schema>

// ──────────────────────────────────────────────
// Step 4: Restrições e preferências
// ──────────────────────────────────────────────
export const step4Schema = z.object({
  restrictions: z.string().optional().default(""),
  conditions: z.string().optional().default(""),
  preferences: z.string().optional().default(""),
})

export type Step4Data = z.infer<typeof step4Schema>

// ──────────────────────────────────────────────
// Step 5: Rotina
// ──────────────────────────────────────────────
export const step5Schema = z.object({
  mealsPerDay: z
    .number({ message: "Selecione a quantidade de refeições" })
    .min(3)
    .max(6),
})

export type Step5Data = z.infer<typeof step5Schema>

// ──────────────────────────────────────────────
// Full onboarding data
// ──────────────────────────────────────────────
export const onboardingSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)

export type OnboardingFormData = z.infer<typeof onboardingSchema>

// ──────────────────────────────────────────────
// Meal routine presets
// ──────────────────────────────────────────────
export interface MealPreset {
  name: string
  windowStart: number // hour 0-23
  windowEnd: number // hour 0-23
}

export const MEAL_PRESETS: Record<number, MealPreset[]> = {
  3: [
    { name: "Café da manhã", windowStart: 6, windowEnd: 9 },
    { name: "Almoço", windowStart: 11, windowEnd: 14 },
    { name: "Jantar", windowStart: 18, windowEnd: 21 },
  ],
  4: [
    { name: "Café da manhã", windowStart: 6, windowEnd: 9 },
    { name: "Almoço", windowStart: 11, windowEnd: 14 },
    { name: "Lanche da tarde", windowStart: 15, windowEnd: 17 },
    { name: "Jantar", windowStart: 18, windowEnd: 21 },
  ],
  5: [
    { name: "Café da manhã", windowStart: 6, windowEnd: 9 },
    { name: "Lanche da manhã", windowStart: 9, windowEnd: 11 },
    { name: "Almoço", windowStart: 11, windowEnd: 14 },
    { name: "Lanche da tarde", windowStart: 15, windowEnd: 17 },
    { name: "Jantar", windowStart: 18, windowEnd: 21 },
  ],
  6: [
    { name: "Café da manhã", windowStart: 6, windowEnd: 9 },
    { name: "Lanche da manhã", windowStart: 9, windowEnd: 11 },
    { name: "Almoço", windowStart: 11, windowEnd: 14 },
    { name: "Lanche da tarde", windowStart: 15, windowEnd: 17 },
    { name: "Jantar", windowStart: 18, windowEnd: 21 },
    { name: "Ceia", windowStart: 21, windowEnd: 23 },
  ],
}

// ──────────────────────────────────────────────
// Step labels (for stepper and headings)
// ──────────────────────────────────────────────
export const STEP_INFO = [
  { title: "Dados básicos", description: "Conte um pouco sobre você" },
  { title: "Medidas", description: "Para calcular seu metabolismo" },
  {
    title: "Objetivo e atividade",
    description: "Para definir sua meta calórica",
  },
  {
    title: "Restrições e preferências",
    description: "Para personalizar sua dieta",
  },
  { title: "Rotina", description: "Para organizar suas refeições" },
] as const

export const TOTAL_STEPS = STEP_INFO.length

// ──────────────────────────────────────────────
// Display labels for enums
// ──────────────────────────────────────────────
export const SEX_LABELS: Record<string, string> = {
  male: "Masculino",
  female: "Feminino",
}

export const GOAL_LABELS: Record<string, string> = {
  lose: "Perder peso",
  gain: "Ganhar peso",
  maintain: "Manter peso",
}

export const GOAL_DESCRIPTIONS: Record<string, string> = {
  lose: "Déficit de 500 kcal/dia (~0,5 kg/semana)",
  gain: "Superávit de 300 kcal/dia (ganho leve)",
  maintain: "Manter o peso atual",
}

export const ACTIVITY_LABELS: Record<string, string> = {
  sedentary: "Sedentário",
  light: "Leve",
  moderate: "Moderado",
  active: "Ativo",
  very_active: "Muito ativo",
}

export const ACTIVITY_DESCRIPTIONS: Record<string, string> = {
  sedentary: "Pouco ou nenhum exercício",
  light: "1–3 vezes por semana",
  moderate: "3–5 vezes por semana",
  active: "6–7 vezes por semana",
  very_active: "Exercício intenso diário",
}
