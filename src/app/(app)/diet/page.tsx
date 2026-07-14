import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { DietPlanRepository } from "@/lib/db/repositories/diet-plan-repository"
import { formatKcal } from "@/lib/nutrition/format"
import { Button } from "@/components/ui/button"
import { AppBadge } from "@/components/ui/app-badge"
import { Plus } from "lucide-react"

export default async function DietPage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  const repo = new DietPlanRepository()
  const plans = await repo.findAllByUserId(result.user.id)

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Minhas dietas</h1>
          <p className="text-sm text-muted-foreground">{plans.length} plano(s)</p>
        </div>
        <Link href="/diet/new">
          <Button size="sm">
            <Plus />
            Nova
          </Button>
        </Link>
      </header>

      {plans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-8 text-center">
          <p className="text-muted-foreground">Nenhuma dieta criada ainda</p>
          <Link href="/diet/new" className="mt-4 inline-block">
            <Button>Criar minha dieta</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <Link
              key={plan.id}
              href={`/diet/${plan.id}`}
              className="block rounded-lg border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-ink">{plan.name}</h3>
                {plan.isActive ? (
                  <AppBadge variant="success">Ativo</AppBadge>
                ) : plan.review?.status === "pending" ? (
                  <AppBadge variant="pending">Revisão</AppBadge>
                ) : (
                  <AppBadge variant="info">Inativo</AppBadge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatKcal(plan.totalKcal)} kcal/dia · {plan.meals.length} refeições
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
