"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"
import type { DayMealSnapshot, DaySnapshot } from "@/lib/nutrition/day"
import type { MealStatus } from "@/lib/nutrition/meal-status"

interface DayContextValue {
  meals: DayMealSnapshot[]
  consumedToday: number
  dailyTarget: number
  hasActivePlan: boolean
  /** Href of the next meal to register, or null when the day is complete */
  nextPendingHref: string | null
  /** Optimistically mark a meal as logged (before the server revalidates) */
  markMealEaten: (
    mealId: string,
    kcal: number,
    conformant: boolean,
    status?: MealStatus,
  ) => void
  /** Optimistically mark a meal as skipped */
  markMealSkipped: (mealId: string) => void
}

const DayContext = createContext<DayContextValue | null>(null)

function signatureOf(snapshot: DaySnapshot): string {
  return `${snapshot.consumedToday}|${snapshot.dailyTarget}|${snapshot.hasActivePlan}|${snapshot.meals
    .map((m) => `${m.id}:${m.status}:${m.kcalConsumed ?? ""}`)
    .join(",")}`
}

export function DayProvider({
  initial,
  children,
}: {
  initial: DaySnapshot
  children: React.ReactNode
}) {
  const [meals, setMeals] = useState(initial.meals)
  const [consumedToday, setConsumedToday] = useState(initial.consumedToday)

  // Re-seed from the server whenever the underlying data changes (e.g. after
  // router.refresh()), so the server stays the source of truth. Adjusting state
  // during render is the recommended pattern for syncing with prop changes.
  const signature = signatureOf(initial)
  const [prevSignature, setPrevSignature] = useState(signature)
  if (signature !== prevSignature) {
    setPrevSignature(signature)
    setMeals(initial.meals)
    setConsumedToday(initial.consumedToday)
  }

  const markMealEaten = useCallback(
    (
      mealId: string,
      kcal: number,
      conformant: boolean,
      status: MealStatus = "eaten",
    ) => {
      setMeals((prev) =>
        prev.map((m) =>
          m.id === mealId
            ? { ...m, status, kcalConsumed: kcal, conformant }
            : m,
        ),
      )
      setConsumedToday((prev) => prev + kcal)
    },
    [],
  )

  const markMealSkipped = useCallback((mealId: string) => {
    setMeals((prev) =>
      prev.map((m) => (m.id === mealId ? { ...m, status: "skipped" } : m)),
    )
  }, [])

  const nextPendingHref = useMemo(() => {
    if (!initial.hasActivePlan) return "/diet/new"
    const pending = meals.find((m) => m.status === "pending")
    return pending ? `/meals/${pending.id}` : null
  }, [meals, initial.hasActivePlan])

  const value = useMemo<DayContextValue>(
    () => ({
      meals,
      consumedToday,
      dailyTarget: initial.dailyTarget,
      hasActivePlan: initial.hasActivePlan,
      nextPendingHref,
      markMealEaten,
      markMealSkipped,
    }),
    [
      meals,
      consumedToday,
      initial.dailyTarget,
      initial.hasActivePlan,
      nextPendingHref,
      markMealEaten,
      markMealSkipped,
    ],
  )

  return <DayContext.Provider value={value}>{children}</DayContext.Provider>
}

export function useDay() {
  const ctx = useContext(DayContext)
  if (!ctx) throw new Error("useDay must be used within a DayProvider")
  return ctx
}
