import Link from "next/link"
import { redirect } from "next/navigation"
import { getAuthenticatedUser } from "@/lib/auth/get-authenticated-user"
import { WeightForm } from "@/components/weight/weight-form"
import { PageContainer, PageHeader } from "@/components/ui/page-container"
import { ArrowLeft } from "lucide-react"

export default async function WeightPage() {
  const result = await getAuthenticatedUser()
  if (!result) redirect("/sign-in")
  if (result.redirectTo) redirect(result.redirectTo)

  return (
    <PageContainer>
      <Link href="/profile" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-ink">
        <ArrowLeft size={16} />
        Voltar ao perfil
      </Link>
      <PageHeader title="Registrar peso" subtitle="Acompanhe sua evolução" />
      <WeightForm />
    </PageContainer>
  )
}
