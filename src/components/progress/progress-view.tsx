"use client"

import {
  CalendarCheck,
  Droplets,
  Flame,
  Lightbulb,
  Scale,
  Star,
  Target,
  Trophy,
  Utensils,
} from "lucide-react"
import { PageContainer } from "@/components/ui/page-container"
import { ProgressRing } from "@/components/ui/progress-ring"
import { WeightChart } from "@/components/progress/weight-chart"
import { formatKcal } from "@/lib/nutrition/format"
import {
  getAchievement,
  getAdherenceMessage,
  getProgressTip,
} from "@/lib/nutrition/progress-stats"
import type { WeeklySummary } from "@/lib/nutrition/weekly-summary"
import { cn } from "@/lib/utils"

interface ProgressViewProps {
  summary: WeeklySummary
  weightLogs: Array<{ date: string; weight: number }>
  streak: number
  avgWeight: number | null
  avgDailyKcal: number
}

function StatCard({
  icon,
  iconClass,
  label,
  value,
  unit,
  caption,
  className,
}: {
  icon: React.ReactNode
  iconClass: string
  label: string
  value: string
  unit?: string
  caption?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 rounded-xl border border-border bg-surface p-3 shadow-sm",
        className,
      )}
    >
      <div className={cn("flex items-center gap-1.5", iconClass)}>
        {icon}
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-[22px] font-bold tracking-tight text-ink font-tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-normal text-muted-foreground">{unit}</span>
        )}
      </div>
      {caption && (
        <span className="text-[11px] text-muted-foreground">{caption}</span>
      )}
    </div>
  )
}

function AchievementCard({
  title,
  subtitle,
  unlocked,
}: {
  title: string
  subtitle: string
  unlocked: boolean
}) {
  return (
    <div className="relative flex flex-col gap-1 overflow-hidden rounded-xl border border-signature-peach bg-signature-cream p-3 shadow-sm">
      <div className="z-10 flex items-center gap-1.5 text-accent-warm">
        <Trophy className="size-5" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Conquista
        </span>
      </div>
      <span className="z-10 text-[22px] font-bold tracking-tight text-ink">
        {title}
      </span>
      <span className="z-10 text-[11px] text-accent-warm">
        {unlocked ? subtitle : "Continue para desbloquear"}
      </span>
      <Star
        className="pointer-events-none absolute -bottom-4 -right-4 size-24 -rotate-12 text-signature-peach opacity-50"
        aria-hidden
      />
    </div>
  )
}

export function ProgressView({
  summary,
  weightLogs,
  streak,
  avgWeight,
  avgDailyKcal,
}: ProgressViewProps) {
  const { adherence, balance } = summary
  const adherenceMessage = getAdherenceMessage(adherence.adherenceScore)
  const achievement = getAchievement(adherence.adherenceScore)
  const progressTip = getProgressTip()

  const deficitKcal = Math.abs(balance)
  const deficitLabel = balance >= 0 ? "Déficit Acumulado" : "Superávit Acumulado"

  return (
    <PageContainer className="space-y-6 px-4 py-6 lg:px-4 lg:py-8">
      {/* ── MOBILE ─────────────────────────────────────── */}
      <div className="flex flex-col gap-6 lg:hidden">
        <header>
          <h1 className="text-[28px] font-bold tracking-tight text-ink">
            Progresso
          </h1>
          <p className="text-sm text-muted-foreground">Últimos 7 dias</p>
        </header>

        {/* Adherence ring */}
        <section className="relative flex flex-col items-center gap-3 overflow-hidden rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h2 className="w-full text-left text-lg font-semibold text-body">
            Adesão Semanal
          </h2>
          <ProgressRing
            percentage={adherence.adherenceScore}
            size={120}
            strokeWidth={8}
            color="text-signature-teal"
          />
          <p className="text-center text-sm text-muted-foreground">
            {adherenceMessage}
          </p>
        </section>

        {/* Weight chart */}
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-lg font-semibold text-body">
              Evolução do Peso
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Últimos 30 dias
            </span>
          </div>
          <WeightChart logs={weightLogs} variant="line" />
        </section>

        {/* 2x2 stats */}
        <section className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Flame className="size-[18px]" />}
            iconClass="text-accent-warm"
            label={deficitLabel}
            value={formatKcal(deficitKcal)}
            unit="kcal"
          />
          <StatCard
            icon={<Scale className="size-[18px]" />}
            iconClass="text-primary"
            label="Peso Médio"
            value={avgWeight != null ? avgWeight.toFixed(1) : "—"}
            unit={avgWeight != null ? "kg" : undefined}
          />
          <StatCard
            icon={<Target className="size-[18px]" />}
            iconClass="text-success"
            label="Refeições no Alvo"
            value={`${adherence.conformityRate}%`}
          />
          <StatCard
            icon={<CalendarCheck className="size-[18px]" />}
            iconClass="text-accent-warm"
            label="Dias Consecutivos"
            value={String(streak)}
            unit="dias"
          />
        </section>

        {/* Tip card */}
        <section className="flex items-start gap-3 rounded-xl border border-[#fef0b2] bg-signature-cream p-4 shadow-sm">
          <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#fde68a]">
            <Lightbulb className="size-[18px] text-accent-warm" />
          </div>
          <p className="text-sm leading-relaxed text-ink">
            <strong className="font-semibold">Dica:</strong> {progressTip}
          </p>
        </section>
      </div>

      {/* ── DESKTOP ────────────────────────────────────── */}
      <div className="hidden flex-col gap-6 lg:flex">
        <header>
          <h1 className="text-[28px] font-bold tracking-tight text-ink">
            Seu Progresso
          </h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe sua evolução e mantenha o foco.
          </p>
        </header>

        {/* Adherence ring — larger */}
        <section className="relative flex flex-col items-center overflow-hidden rounded-xl border border-border bg-surface-raised p-5 shadow-sm">
          <h3 className="mb-4 w-full text-lg font-semibold text-ink">
            Adesão Semanal
          </h3>
          <ProgressRing
            percentage={adherence.adherenceScore}
            size={192}
            strokeWidth={8}
            label="Na Meta"
            color="text-signature-teal"
            valueClassName="text-primary text-[36px] font-extrabold"
          />
          <p className="mt-4 text-center text-sm text-muted-foreground">
            {adherenceMessage}
          </p>
        </section>

        {/* Weight bar chart */}
        <section className="flex flex-col gap-3 rounded-xl border border-border bg-canvas p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-ink">Evolução de Peso</h3>
          </div>
          <WeightChart logs={weightLogs} variant="bar" />
        </section>

        {/* 2x2 stats — desktop variant */}
        <section className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Flame className="size-5" />}
            iconClass="text-signature-teal"
            label="Ofensiva"
            value={`${streak} Dias`}
            caption="Batendo a meta"
          />
          <StatCard
            icon={<Utensils className="size-5" />}
            iconClass="text-accent-warm"
            label="Calorias"
            value={formatKcal(Math.round(avgDailyKcal))}
            caption="Média diária"
          />
          <StatCard
            icon={<Droplets className="size-5" />}
            iconClass="text-success"
            label="No Alvo"
            value={`${adherence.conformityRate}%`}
            caption="Refeições conformes"
          />
          <AchievementCard
            title={achievement.title}
            subtitle={achievement.subtitle}
            unlocked={achievement.unlocked}
          />
        </section>
      </div>
    </PageContainer>
  )
}
