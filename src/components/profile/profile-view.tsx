"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import {
  ArrowLeft,
  BadgeCheck,
  ChevronRight,
  Flag,
  Globe,
  HelpCircle,
  IdCard,
  LineChart,
  Lock,
  Pencil,
  Settings,
  Target,
  Trash2,
  User,
  Bell,
  Crown,
} from "lucide-react"
import { PageContainer } from "@/components/ui/page-container"
import {
  ProfileForm,
  type ProfileFormData,
  type ProfileSection,
} from "@/components/profile/profile-form"
import {
  formatDesktopSubtitle,
  formatProfileSubtitle,
} from "@/lib/profile/display"
import { useToast } from "@/components/providers/toast-provider"
import { cn } from "@/lib/utils"

type Panel = "hub" | "account" | "goals" | "preferences"

interface ProfileViewProps {
  initial: ProfileFormData
  hasActivePlan: boolean
  planName?: string | null
}

function ProfileAvatar({
  name,
  imageUrl,
  size = "lg",
  onEdit,
}: {
  name: string
  imageUrl?: string
  size?: "lg" | "md"
  onEdit?: () => void
}) {
  const dim = size === "lg" ? "size-[100px]" : "size-28"
  const initial = name.trim().charAt(0).toUpperCase() || "A"

  return (
    <div className="relative">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt=""
          className={cn(
            dim,
            "rounded-full border-2 border-primary bg-surface object-cover p-0.5 shadow-sm lg:border-4 lg:border-surface",
          )}
        />
      ) : (
        <div
          className={cn(
            dim,
            "flex items-center justify-center rounded-full border-2 border-primary bg-surface text-3xl font-bold text-primary shadow-sm lg:border-4 lg:border-surface",
          )}
        >
          {initial}
        </div>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full border-2 border-canvas bg-primary text-on-primary shadow-sm transition-all hover:opacity-90 active:scale-95"
          aria-label="Editar perfil"
        >
          <Pencil className="size-[18px]" />
        </button>
      )}
    </div>
  )
}

function SettingsGroup({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-2">
      <h3 className="ml-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <div className="overflow-hidden rounded-xl border border-border bg-canvas shadow-sm">
        {children}
      </div>
    </section>
  )
}

function SettingsRow({
  icon,
  label,
  onClick,
  href,
  badge,
  destructive,
}: {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  href?: string
  badge?: string
  destructive?: boolean
}) {
  const className = cn(
    "group flex w-full items-center justify-between border-b border-border/50 p-4 text-left transition-colors last:border-0",
    destructive
      ? "text-destructive"
      : "text-ink hover:bg-surface-raised",
  )

  const content = (
    <>
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "text-muted-foreground transition-colors group-hover:text-primary",
            destructive && "text-destructive group-hover:text-destructive",
          )}
        >
          {icon}
        </span>
        <span className="text-base font-medium">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className="rounded-md bg-signature-peach px-2 py-0.5 text-xs font-semibold text-accent-warm">
            {badge}
          </span>
        )}
        <ChevronRight className="size-5 text-muted-foreground" />
      </div>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

function PanelShell({
  title,
  onBack,
  children,
}: {
  title: string
  onBack: () => void
  children: React.ReactNode
}) {
  return (
    <PageContainer className="space-y-6 px-4 py-0 lg:px-4 lg:py-8">
      <header className="sticky top-0 z-30 -mx-4 flex items-center justify-between border-b border-border bg-canvas/90 px-4 py-3 backdrop-blur-md lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
        <button
          type="button"
          onClick={onBack}
          className="flex size-10 items-center justify-center rounded-full text-primary transition-opacity hover:opacity-80 active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="flex-1 truncate px-4 text-center text-lg font-bold text-primary lg:text-left lg:text-[28px] lg:text-ink">
          {title}
        </h1>
        <div className="size-10 lg:hidden" />
      </header>
      <div className="pb-8 lg:pb-0">{children}</div>
    </PageContainer>
  )
}

const PANEL_TITLES: Record<Exclude<Panel, "hub">, string> = {
  account: "Dados Pessoais",
  goals: "Metas de Nutrição",
  preferences: "Preferências Alimentares",
}

const PANEL_SECTIONS: Record<Exclude<Panel, "hub">, ProfileSection[]> = {
  account: ["account"],
  goals: ["goals"],
  preferences: ["preferences"],
}

export function ProfileView({
  initial,
  hasActivePlan,
  planName,
}: ProfileViewProps) {
  const router = useRouter()
  const toast = useToast()
  const { user } = useUser()
  const [panel, setPanel] = useState<Panel>("hub")

  const mobileSubtitle = formatProfileSubtitle(
    initial.goal,
    initial.dailyKcalTarget,
  )
  const desktopSubtitle = formatDesktopSubtitle(initial.goal)

  function openPanel(next: Panel) {
    setPanel(next)
  }

  function showComingSoon() {
    toast.toast("Em breve!", "info")
  }

  function handleDeleteAccount() {
    const confirmed = window.confirm(
      "Tem certeza? Esta ação é irreversível e removerá todos os seus dados.",
    )
    if (confirmed) {
      toast.toast(
        "Entre em contato com o suporte para excluir sua conta.",
        "info",
      )
    }
  }

  if (panel !== "hub") {
    return (
      <PanelShell title={PANEL_TITLES[panel]} onBack={() => setPanel("hub")}>
        <ProfileForm
          initial={initial}
          sections={PANEL_SECTIONS[panel]}
          onSaved={() => setPanel("hub")}
        />
      </PanelShell>
    )
  }

  return (
    <PageContainer className="space-y-0 px-0 py-0 lg:space-y-8 lg:px-4 lg:py-8">
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/50 bg-canvas px-4 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="flex size-10 items-center justify-center text-primary transition-opacity hover:opacity-80 active:scale-95"
          aria-label="Voltar"
        >
          <ArrowLeft className="size-5" />
        </button>
        <h1 className="flex-1 truncate px-4 text-center text-lg font-bold text-primary">
          Perfil
        </h1>
        <button
          type="button"
          onClick={showComingSoon}
          className="flex size-10 items-center justify-center text-primary transition-opacity hover:opacity-80 active:scale-95"
          aria-label="Configurações"
        >
          <Settings className="size-5" />
        </button>
      </header>

      <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-0 lg:py-0">
        {/* Profile summary */}
        <section className="mt-2 flex flex-col items-center gap-3 lg:mt-0">
          <ProfileAvatar
            name={initial.name}
            imageUrl={user?.imageUrl}
            size="lg"
            onEdit={() => openPanel("account")}
          />
          <div className="text-center">
            <h2 className="text-xl font-semibold text-ink lg:text-[28px] lg:font-bold">
              {initial.name}
            </h2>
            <p className="mt-1 flex items-center justify-center gap-1 text-sm text-muted-foreground lg:mt-1">
              <Target className="size-4 text-signature-teal lg:hidden" />
              <span className="lg:hidden">{mobileSubtitle}</span>
              <span className="hidden lg:inline">{desktopSubtitle}</span>
            </p>
          </div>
        </section>

        {/* ── MOBILE menu ─────────────────────────────── */}
        <div className="flex flex-col gap-4 lg:hidden">
          <SettingsGroup title="Conta">
            <SettingsRow
              icon={<User className="size-5" />}
              label="Minha Conta"
              onClick={() => openPanel("account")}
            />
            <SettingsRow
              icon={<Flag className="size-5" />}
              label="Objetivos e Metas"
              onClick={() => openPanel("goals")}
            />
          </SettingsGroup>

          <SettingsGroup title="Preferências">
            <SettingsRow
              icon={<Bell className="size-5" />}
              label="Notificações"
              onClick={showComingSoon}
            />
            <SettingsRow
              icon={<Lock className="size-5" />}
              label="Privacidade e Segurança"
              onClick={showComingSoon}
            />
            <SettingsRow
              icon={<Crown className="size-5" />}
              label="Restrições e Preferências"
              onClick={() => openPanel("preferences")}
            />
          </SettingsGroup>

          <SettingsGroup title="Suporte">
            <SettingsRow
              icon={<HelpCircle className="size-5" />}
              label="Ajuda e Contato"
              onClick={showComingSoon}
            />
          </SettingsGroup>
        </div>

        {/* ── DESKTOP menu ────────────────────────────── */}
        <div className="hidden flex-col gap-4 lg:flex">
          <SettingsGroup title="Conta">
            <SettingsRow
              icon={<IdCard className="size-5" />}
              label="Dados Pessoais"
              onClick={() => openPanel("account")}
            />
            <SettingsRow
              icon={<LineChart className="size-5" />}
              label="Metas de Nutrição"
              onClick={() => openPanel("goals")}
            />
            <SettingsRow
              icon={<BadgeCheck className="size-5" />}
              label="Plano Atual"
              href="/diet"
              badge={hasActivePlan ? planName ?? "Ativo" : "Novo"}
            />
          </SettingsGroup>

          <SettingsGroup title="Preferências">
            <SettingsRow
              icon={<Bell className="size-5" />}
              label="Notificações"
              onClick={showComingSoon}
            />
            <SettingsRow
              icon={<Globe className="size-5" />}
              label="Idioma e Região"
              onClick={showComingSoon}
            />
            <SettingsRow
              icon={<Crown className="size-5" />}
              label="Restrições e Preferências"
              onClick={() => openPanel("preferences")}
            />
          </SettingsGroup>
        </div>

        {/* Delete account */}
        <section className="pb-8 lg:pb-0">
          <button
            type="button"
            onClick={handleDeleteAccount}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-semibold shadow-sm transition-all active:scale-[0.98]",
              "border border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
              "lg:border-destructive lg:bg-destructive lg:text-white lg:hover:bg-destructive/90",
            )}
          >
            <Trash2 className="size-5" />
            Excluir conta
          </button>
          <p className="mt-3 hidden text-center text-[11px] text-muted-foreground lg:block">
            Aviso: Esta ação é irreversível e removerá todos os seus dados.
          </p>
        </section>
      </div>
    </PageContainer>
  )
}
