import type { DietValidationIssue } from "../validation/plan-validator"

/** The catalog cannot satisfy the targets and restrictions together. */
export class DietPlanUnfeasibleError extends Error {
  constructor(readonly reason: string) {
    super(reason)
    this.name = "DietPlanUnfeasibleError"
  }
}

/** Every attempt produced a plan that failed validation. */
export class DietPlanGenerationError extends Error {
  constructor(
    message: string,
    readonly issues: DietValidationIssue[] = [],
  ) {
    super(message)
    this.name = "DietPlanGenerationError"
  }
}

export class EmptyFoodCatalogError extends Error {
  constructor() {
    super("Catálogo de alimentos vazio para as restrições informadas")
    this.name = "EmptyFoodCatalogError"
  }
}
