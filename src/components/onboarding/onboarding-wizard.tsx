"use client"

import { useState, useTransition } from "react"
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
} from "@/lib/onboarding/types"
import type { OnboardingFormData } from "@/lib/onboarding/types"
import { calculateBMR, calculateAge } from "@/lib/nutrition/bmr"
import { calculateTDEE } from "@/lib/nutrition/tdee"
import { calculateDailyKcalTarget, calculateMacros } from "@/lib/nutrition/macros"
import { completeOnboarding } from "@/app/(onboarding)/onboarding/actions"
import { ArrowLeft, ArrowRight, Loader2, Ruler } from "lucide-react"
import { cn } from "@/lib/utils"

type StepErrors = Partial<Record<string, string>>

export function OnboardingWizard() {
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

  const continueLabel = isPending
    ? "Calculando..."
    : isLastStep
      ? "Concluir"
      : "Continuar"

  return (
    <div className="flex min-h-dvh flex-col bg-canvas lg:min-h-screen lg:items-center lg:justify-start lg:px-4 lg:py-12">
      <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col lg:min-h-0">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-40 flex shrink-0 items-center justify-between bg-canvas px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))] lg:hidden">
          <div className="flex items-center gap-2">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isPending}
                aria-label="Voltar"
                className="flex items-center justify-center rounded-full p-1.5 text-primary transition-colors hover:bg-surface-raised active:scale-95"
              >
                <ArrowLeft className="size-5" />
              </button>
            ) : (
              <div className="size-8" aria-hidden />
            )}
            <span className="text-lg font-semibold text-primary">
              Passo {currentStep + 1} de {TOTAL_STEPS}
            </span>
          </div>
          <span className="text-lg font-bold text-signature-teal">AppDiet</span>
        </header>

        <main className="flex flex-1 flex-col gap-6 px-4 pt-4 pb-6 lg:gap-8 lg:px-4 lg:pt-0 lg:pb-0">
          {/* Stepper + heading */}
          <div className="flex flex-col items-center gap-4 text-center lg:gap-6">
            <OnboardingStepper
              steps={TOTAL_STEPS}
              currentStep={currentStep}
              className="mx-auto"
            />
            {currentStep === 1 && (
              <div className="relative flex justify-center">
                <div
                  className="absolute -top-6 size-32 rounded-full bg-signature-cream/40 blur-3xl"
                  aria-hidden
                />
                <div className="relative flex size-16 items-center justify-center rounded-2xl border border-border bg-surface-raised text-signature-warm shadow-sm lg:size-12">
                  <Ruler className="size-8 lg:size-7" aria-hidden />
                </div>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <h1 className="text-[28px] leading-tight font-bold tracking-tight text-foreground">
                {stepInfo.title}
              </h1>
              <p className="text-base font-medium text-muted-foreground">
                {stepInfo.description}
              </p>
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1">
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
                calculated={calculated}
                goalLabel={formData.goal ? GOAL_LABELS[formData.goal] : undefined}
              />
            )}
          </div>

          {/* Desktop actions (inline) */}
          <div className="hidden flex-col gap-2 lg:flex lg:pt-8">
            <Button
              onClick={handleNext}
              disabled={isPending}
              className="h-14 w-full rounded-2xl bg-signature-teal text-base font-semibold text-on-primary shadow-sm hover:bg-primary active:scale-[0.98]"
            >
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {continueLabel}
              {!isPending && <ArrowRight className="size-5" />}
            </Button>
            {currentStep > 0 && (
              <Button
                onClick={handleBack}
                variant="ghost"
                disabled={isPending}
                className="h-10 w-full rounded-xl text-base"
              >
                <ArrowLeft className="size-4" />
                Voltar
              </Button>
            )}
          </div>
        </main>

        {/* Mobile fixed bottom CTA */}
        <div
          className={cn(
            "sticky bottom-0 z-50 border-t border-border/30 bg-canvas/80 p-4 backdrop-blur-md lg:hidden",
            "pb-[max(1.5rem,env(safe-area-inset-bottom))]",
          )}
        >
          <Button
            onClick={handleNext}
            disabled={isPending}
            className="h-14 w-full rounded-2xl bg-signature-teal text-base font-bold text-on-primary shadow-sm hover:bg-primary active:scale-[0.98]"
          >
            {isPending && <Loader2 className="size-4 animate-spin" />}
            {continueLabel}
            {!isPending && <ArrowRight className="size-5" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
