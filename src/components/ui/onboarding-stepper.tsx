import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface OnboardingStepperProps {
  /** Total number of steps */
  steps: number
  /** Current step (0-indexed) */
  currentStep: number
  className?: string
}

export function OnboardingStepper({
  steps,
  currentStep,
  className,
}: OnboardingStepperProps) {
  return (
    <div
      className={cn(
        "relative flex w-full max-w-[320px] items-center justify-between px-1 py-2",
        className,
      )}
      aria-label={`Passo ${currentStep + 1} de ${steps}`}
    >
      <div
        className="absolute top-1/2 right-6 left-6 z-0 h-0.5 -translate-y-1/2 bg-border"
        aria-hidden
      />

      {Array.from({ length: steps }, (_, i) => {
        const isActive = i === currentStep
        const isCompleted = i < currentStep

        return (
          <div
            key={i}
            className="relative z-10 flex flex-col items-center"
            aria-current={isActive ? "step" : undefined}
          >
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-semibold shadow-sm transition-all duration-300",
                isCompleted &&
                  "border border-signature-teal bg-signature-teal text-on-primary",
                isActive &&
                  "border border-signature-teal bg-signature-teal text-on-primary",
                !isActive &&
                  !isCompleted &&
                  "border-2 border-border bg-canvas text-muted-foreground",
              )}
            >
              {isCompleted ? (
                <Check className="size-4" strokeWidth={3} aria-hidden />
              ) : (
                i + 1
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
