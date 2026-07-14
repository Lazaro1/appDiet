"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { OnboardingStepper } from "@/components/ui/onboarding-stepper"
import { Button } from "@/components/ui/button"
import { Step1BasicInfo } from "@/components/onboarding/step-1-basic-info"
import { Step2Measurements } from "@/components/onboarding/step-2-measurements"
import { Step3GoalActivity } from "@/components/onboarding/step-3-goal-activity"
import { Step4Restrictions } from "@/components/onboarding/step-4-restrictions"
import { Step5Routine } from "@/components/onboarding/step-5-routine"
import {
  STEP_INFO,
  TOTAL_STEPS,
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  step5Schema,
  GOAL_LABELS,
  ACTIVITY_LABELS,
} from "@/lib/onboarding/types"
import type { OnboardingFormData } from "@/lib/onboarding/types"
import { calculateBMR, calculateAge } from "@/lib/nutrition/bmr"
import { calculateTDEE } from "@/lib/nutrition/tdee"
import { calculateDailyKcalTarget, calculateMacros } from "@/lib/nutrition/macros"
import { completeOnboarding } from "@/app/(onboarding)/onboarding/actions"
import { ArrowLeft, Loader2, Sparkles } from "lucide-react"

type StepErrors = Partial<Record<string, string>>

export function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [errors, setErrors] = useState<StepErrors>({})
  const [isPending, startTransition] = useTransition()

  const [formData, setFormData] = useState<Partial<OnboardingFormData>>({
    name: "",
    birthDate: "",
    sex: undefined,
    weight: undefined,
    height: undefined,
    goal: undefined,
    activityLevel: undefined,
    restrictions: "",
    conditions: "",
    preferences: "",
    mealsPerDay: undefined,
  })

  const NUMERIC_FIELDS = new Set(["weight", "height", "mealsPerDay"])

  const updateField = (field: string, value: unknown) => {
    const parsed =
      NUMERIC_FIELDS.has(field) && typeof value === "string" && value !== ""
        ? Number(value)
        : value
    setFormData((prev) => ({ ...prev, [field]: parsed }))
    setErrors((prev) => {
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const validateCurrentStep = (): boolean => {
    const schemas = [step1Schema, step2Schema, step3Schema, step4Schema, step5Schema]
    const schema = schemas[currentStep]

    const result = schema.safeParse(formData)
    if (result.success) {
      setErrors({})
      return true
    }

    const fieldErrors: StepErrors = {}
    for (const issue of result.error.issues) {
      const key = issue.path[0]?.toString()
      if (key) fieldErrors[key] = issue.message
    }
    setErrors(fieldErrors)
    return false
  }

  const handleNext = () => {
    if (!validateCurrentStep()) return

    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1)
    } else {
      // Last step — submit
      startTransition(async () => {
        await completeOnboarding(formData as OnboardingFormData)
      })
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setErrors({})
      setCurrentStep((prev) => prev - 1)
    }
  }

  // Calculate preview values for step 5
  const getCalculatedPreview = () => {
    if (
      !formData.weight ||
      !formData.height ||
      !formData.birthDate ||
      !formData.sex ||
      !formData.activityLevel ||
      !formData.goal
    ) {
      return null
    }

    const age = calculateAge(new Date(formData.birthDate + "T00:00:00"))
    const bmr = calculateBMR(formData.weight, formData.height, age, formData.sex)
    const tdee = calculateTDEE(bmr, formData.activityLevel)
    const dailyKcalTarget = calculateDailyKcalTarget(tdee, formData.goal)
    const macros = calculateMacros(dailyKcalTarget, formData.goal)

    return { bmr, tdee, dailyKcalTarget, macros }
  }

  const stepInfo = STEP_INFO[currentStep]
  const isLastStep = currentStep === TOTAL_STEPS - 1
  const calculated = isLastStep ? getCalculatedPreview() : null

  return (
    /* ── Mobile: full-screen canvas. Desktop: centered card on surface bg ── */
    <div className="flex min-h-dvh md:min-h-screen md:items-start md:justify-center md:bg-surface md:py-8 md:px-4">
      <div className="flex min-h-dvh w-full flex-col overflow-hidden bg-canvas md:min-h-0 md:max-h-[calc(100vh-4rem)] md:max-w-[480px] md:rounded-2xl md:border md:border-border md:shadow-lg md:shadow-stone-900/10">

        {/* Header with stepper */}
        <div className="flex shrink-0 flex-col gap-4 px-6 pt-[max(2rem,env(safe-area-inset-top))] pb-4 md:pt-6">
          <OnboardingStepper steps={TOTAL_STEPS} currentStep={currentStep} />
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold text-ink">
              {stepInfo.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {stepInfo.description}
            </p>
          </div>
        </div>

        {/* Step content — scrollable area */}
        <div className="flex-1 overflow-y-auto px-6 py-4 md:px-8">
          {currentStep === 0 && (
            <Step1BasicInfo
              data={formData}
              onChange={(field, value) => updateField(field, value)}
              errors={errors}
            />
          )}
          {currentStep === 1 && (
            <Step2Measurements
              data={formData}
              onChange={(field, value) => updateField(field, value)}
              errors={errors}
            />
          )}
          {currentStep === 2 && (
            <Step3GoalActivity
              data={formData}
              onChange={(field, value) => updateField(field, value)}
              errors={errors}
            />
          )}
          {currentStep === 3 && (
            <Step4Restrictions
              data={formData}
              onChange={(field, value) => updateField(field, value)}
              errors={errors}
            />
          )}
          {currentStep === 4 && (
            <Step5Routine
              data={formData}
              onChange={(field, value) => updateField(field, value)}
              errors={errors}
            />
          )}

          {/* Calculated preview on last step */}
          {isLastStep && calculated && (
            <div className="mt-6 rounded-xl border border-primary/20 bg-primary-soft p-4">
              <div className="mb-3 flex items-center gap-2 text-primary">
                <Sparkles className="size-5" />
                <span className="text-base font-semibold">
                  Sua meta calórica
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Metabolismo basal</span>
                  <span className="text-lg font-semibold font-tabular-nums">
                    {calculated.bmr} kcal
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Gasto total</span>
                  <span className="text-lg font-semibold font-tabular-nums">
                    {calculated.tdee} kcal
                  </span>
                </div>
                <div className="col-span-2 flex flex-col">
                  <span className="text-xs text-muted-foreground">
                    Meta diária ({GOAL_LABELS[formData.goal!]})
                  </span>
                  <span className="text-2xl font-bold font-tabular-nums text-primary">
                    {calculated.dailyKcalTarget} kcal
                  </span>
                </div>
                <div className="col-span-2 border-t border-primary/20 pt-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Proteína</span>
                      <span className="text-sm font-semibold">{calculated.macros.protein}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Carboidrato</span>
                      <span className="text-sm font-semibold">{calculated.macros.carbs}g</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Gordura</span>
                      <span className="text-sm font-semibold">{calculated.macros.fat}g</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons — pinned to bottom on mobile */}
        <div className="sticky bottom-0 mt-auto flex shrink-0 flex-col gap-2 border-t border-border/60 bg-canvas px-6 pt-4 pb-[max(2rem,env(safe-area-inset-bottom))] md:bg-canvas/95 md:pb-6 md:backdrop-blur-sm">
          <Button
            onClick={handleNext}
            disabled={isPending}
            size="lg"
            className="h-12 w-full rounded-xl text-base font-semibold"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Calculando...
              </>
            ) : isLastStep ? (
              "Concluir"
            ) : (
              "Continuar"
            )}
          </Button>

          {currentStep > 0 && (
            <Button
              onClick={handleBack}
              variant="ghost"
              size="lg"
              className="h-10 w-full rounded-xl text-base"
              disabled={isPending}
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
