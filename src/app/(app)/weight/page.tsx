import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { WeightForm } from "@/components/weight/weight-form"
import { ArrowLeft } from "lucide-react"

export default async function WeightPage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  return (
    <div className="mx-auto max-w-lg space-y-6 px-4 py-6">
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink">
        <ArrowLeft size={16} />
        Voltar ao perfil
      </Link>
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Registrar peso</h1>
        <p className="text-sm text-muted-foreground">Acompanhe sua evolução</p>
      </header>
      <WeightForm />
    </div>
  )
}
