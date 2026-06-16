import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface OnboardingStepperProps {
  /** Total number of steps */
  steps: number
  /** Current step (0-indexed) */
  currentStep: number
}

export function OnboardingStepper({
  steps,
  currentStep,
}: OnboardingStepperProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: steps }, (_, i) => {
        const isActive = i === currentStep
        const isCompleted = i < currentStep

        return (
          <div
            key={i}
            className={cn(
              "flex items-center justify-center rounded-full transition-all duration-300",
              isCompleted && "h-5 w-5 bg-primary",
              isActive && "h-2 w-2 bg-primary",
              !isActive && !isCompleted && "h-2 w-2 bg-border",
            )}
            aria-current={isActive ? "step" : undefined}
            aria-label={`Passo ${i + 1}`}
          >
            {isCompleted && (
              <Check size={12} className="text-on-primary" strokeWidth={3} />
            )}
          </div>
        )
      })}
    </div>
  )
}
