"use client"

import { CalorieBar } from "@/components/ui/calorie-bar"
import { ProgressRing } from "@/components/ui/progress-ring"
import { StatCard } from "@/components/ui/stat-card"
import { MealCard } from "@/components/ui/meal-card"
import { ChatBubble } from "@/components/ui/chat-bubble"
import { OnboardingStepper } from "@/components/ui/onboarding-stepper"
import { AppBadge } from "@/components/ui/app-badge"
import { BottomNav } from "@/components/layout/bottom-nav"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Home,
  Utensils,
  MessageCircle,
  TrendingUp,
  User,
  Flame,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Plus,
} from "lucide-react"

/**
 * Design System Showcase — /design-system
 * Página não autenticada que renderiza todos os componentes
 * do DESIGN-appdiet.md para validação visual.
 */

// ─── Color Swatch Helper ────────────────────────────────────
function ColorSwatch({
  name,
  className,
  textClass,
  hex,
}: {
  name: string
  className: string
  textClass?: string
  hex: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`h-10 w-10 shrink-0 rounded-md border border-border ${className}`}
      />
      <div className="min-w-0">
        <p className={`text-sm font-semibold ${textClass ?? "text-ink"}`}>
          {name}
        </p>
        <p className="text-xs text-muted-foreground font-mono">{hex}</p>
      </div>
    </div>
  )
}

// ─── Section Helper ─────────────────────────────────────────
function Section({
  title,
  token,
  children,
}: {
  title: string
  token: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-ink">{title}</h2>
        <p className="text-xs text-muted-foreground font-mono">{token}</p>
      </div>
      <div className="space-y-3">{children}</div>
      <div className="border-t border-border" />
    </section>
  )
}

// ─── Bottom Nav Items ───────────────────────────────────────
const navItems = [
  { icon: <Home />, label: "Início", href: "/" },
  { icon: <Utensils />, label: "Refeições", href: "/meals" },
  { icon: <MessageCircle />, label: "Chat", href: "/chat" },
  { icon: <TrendingUp />, label: "Progresso", href: "/progress" },
  { icon: <User />, label: "Perfil", href: "/profile" },
]

// ─── Page ──────────────────────────────────────────────────
export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-canvas pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-canvas/95 backdrop-blur">
        <div className="mx-auto max-w-lg px-4 py-4">
          <h1 className="text-2xl font-bold text-ink">AppDiet Design System</h1>
          <p className="text-sm text-muted-foreground">
            Validação visual dos componentes — DESIGN-appdiet.md
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-8 px-4 py-6">
        {/* ═══════════════════════════════════════════════════
            1. CORES
            ═══════════════════════════════════════════════════ */}
        <Section title="Cores" token="colors">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Primary
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ColorSwatch name="primary" className="bg-primary" hex="#0d9488" />
            <ColorSwatch
              name="primary-hover"
              className="bg-primary-hover"
              hex="#0f766e"
            />
            <ColorSwatch
              name="primary-active"
              className="bg-primary-active"
              hex="#115e59"
            />
            <ColorSwatch
              name="primary-soft"
              className="bg-primary-soft"
              hex="#ccfbf1"
            />
            <ColorSwatch
              name="primary-subtle"
              className="bg-primary-subtle"
              hex="#f0fdfa"
            />
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4">
            Text
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ColorSwatch name="ink" className="bg-ink" hex="#1c1917" />
            <ColorSwatch name="body" className="bg-body" hex="#44403c" />
            <ColorSwatch name="muted" className="bg-muted" hex="#78716c" />
            <ColorSwatch name="hint" className="bg-hint" hex="#a8a29e" />
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4">
            Surfaces
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ColorSwatch name="canvas" className="bg-canvas" hex="#fffbf7" />
            <ColorSwatch name="surface" className="bg-surface" hex="#f5f0eb" />
            <ColorSwatch
              name="surface-raised"
              className="bg-surface-raised"
              hex="#ede8e2"
            />
            <ColorSwatch
              name="surface-dark"
              className="bg-surface-dark text-on-dark"
              hex="#1c1917"
            />
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4">
            Accent Warm
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ColorSwatch
              name="accent-warm"
              className="bg-accent-warm"
              hex="#f97316"
            />
            <ColorSwatch
              name="accent-warm-soft"
              className="bg-accent-warm-soft"
              hex="#fff7ed"
            />
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4">
            Accent Green
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ColorSwatch
              name="accent-green"
              className="bg-accent-green"
              hex="#22c55e"
            />
            <ColorSwatch
              name="accent-green-soft"
              className="bg-accent-green-soft"
              hex="#f0fdf4"
            />
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4">
            Semantic
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ColorSwatch name="success" className="bg-success" hex="#16a34a" />
            <ColorSwatch
              name="success-soft"
              className="bg-success-soft"
              hex="#dcfce7"
            />
            <ColorSwatch name="warning" className="bg-warning" hex="#eab308" />
            <ColorSwatch
              name="warning-soft"
              className="bg-warning-soft"
              hex="#fefce8"
            />
            <ColorSwatch name="danger" className="bg-danger" hex="#ef4444" />
            <ColorSwatch
              name="danger-soft"
              className="bg-danger-soft"
              hex="#fef2f2"
            />
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4">
            Signature Cards
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ColorSwatch
              name="signature-teal"
              className="bg-signature-teal text-on-primary"
              hex="#0d9488"
            />
            <ColorSwatch
              name="signature-warm"
              className="bg-signature-warm text-on-primary"
              hex="#f97316"
            />
            <ColorSwatch
              name="signature-cream"
              className="bg-signature-cream"
              hex="#fef3c7"
            />
            <ColorSwatch
              name="signature-peach"
              className="bg-signature-peach"
              hex="#fed7aa"
            />
            <ColorSwatch
              name="signature-sage"
              className="bg-signature-sage"
              hex="#d9f99d"
            />
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4">
            Borders
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <ColorSwatch name="border" className="bg-border" hex="#e7e5e4" />
            <ColorSwatch
              name="border-strong"
              className="bg-border-strong"
              hex="#d6d3d1"
            />
            <ColorSwatch
              name="border-focus"
              className="bg-border-focus"
              hex="#0d9488"
            />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            2. TIPOGRAFIA
            ═══════════════════════════════════════════════════ */}
        <Section title="Tipografia" token="typography">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                display-lg — 32px/700
              </p>
              <p className="text-[32px] font-bold leading-tight tracking-tight text-ink">
                1.847 kcal
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                display-md — 28px/700
              </p>
              <p className="text-[28px] font-bold leading-tight text-ink">
                Progresso Semanal
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                display-sm — 24px/600
              </p>
              <p className="text-2xl font-semibold text-ink">
                Refeições de Hoje
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                title-lg — 20px/600
              </p>
              <p className="text-xl font-semibold text-ink">
                Almoço
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                title-md — 18px/600
              </p>
              <p className="text-lg font-semibold text-ink">
                Detalhes da Refeição
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                title-sm — 16px/600
              </p>
              <p className="text-base font-semibold text-ink">
                Arroz branco cozido
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                body-lg — 16px/500
              </p>
              <p className="text-base font-medium text-body">
                Informação importante sobre sua dieta.
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                body-md — 14px/400
              </p>
              <p className="text-sm text-body">
                Texto corrido padrão do app. Acompanhamento nutricional diário.
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                body-sm — 13px/400
              </p>
              <p className="text-[13px] text-body">
                Descrição secundária ou texto de ajuda.
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                label — 12px/600
              </p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                CALORIAS HOJE
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                caption — 11px/500
              </p>
              <p className="text-[11px] font-medium text-muted-foreground">
                11:00 — 14:00
              </p>
            </div>
          </div>

          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-4">
            Stat Typography (Números)
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                stat-lg — 36px/800
              </p>
              <p className="font-tabular-nums text-[36px] font-extrabold leading-none tracking-tighter text-ink">
                1.847
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                stat-md — 28px/700
              </p>
              <p className="font-tabular-nums text-[28px] font-bold leading-tight tracking-tight text-ink">
                580 kcal
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono">
                stat-sm — 20px/700
              </p>
              <p className="font-tabular-nums text-xl font-bold tracking-tight text-ink">
                73%
              </p>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            3. ESPAÇAMENTO
            ═══════════════════════════════════════════════════ */}
        <Section title="Espaçamento" token="spacing">
          {[
            { name: "xxs", px: 4 },
            { name: "xs", px: 8 },
            { name: "sm", px: 12 },
            { name: "md", px: 16 },
            { name: "lg", px: 20 },
            { name: "xl", px: 24 },
            { name: "xxl", px: 32 },
            { name: "xxxl", px: 48 },
          ].map(({ name, px }) => (
            <div key={name} className="flex items-center gap-3">
              <div
                className="h-3 rounded-sm bg-primary"
                style={{ width: `${px}px` }}
              />
              <span className="text-sm text-body font-mono">
                {name}: {px}px
              </span>
            </div>
          ))}
        </Section>

        {/* ═══════════════════════════════════════════════════
            4. BORDER RADIUS
            ═══════════════════════════════════════════════════ */}
        <Section title="Border Radius" token="rounded">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "xs", class: "rounded-xs", px: 6 },
              { name: "sm", class: "rounded-sm", px: 8 },
              { name: "md", class: "rounded-md", px: 12 },
              { name: "lg", class: "rounded-lg", px: 16 },
              { name: "xl", class: "rounded-xl", px: 20 },
              { name: "pill", class: "rounded-full", px: 9999 },
            ].map(({ name, class: cls, px }) => (
              <div key={name} className="flex items-center gap-3">
                <div
                  className={`h-12 w-12 border-2 border-primary ${cls}`}
                />
                <span className="text-sm text-body font-mono">
                  {name}: {px}px
                </span>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            5. SHADOWS
            ═══════════════════════════════════════════════════ */}
        <Section title="Shadows" token="shadows">
          <div className="grid grid-cols-2 gap-4">
            {[
              { name: "xs", class: "shadow-xs" },
              { name: "sm", class: "shadow-sm" },
              { name: "md", class: "shadow-md" },
              { name: "lg", class: "shadow-lg" },
              { name: "xl", class: "shadow-xl" },
            ].map(({ name, class: cls }) => (
              <div
                key={name}
                className={`rounded-lg bg-card p-4 ${cls}`}
              >
                <p className="text-sm font-semibold text-ink">shadow-{name}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            6. BOTÕES
            ═══════════════════════════════════════════════════ */}
        <Section title="Botões" token="components.button-*">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                button-primary
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary transition-colors hover:bg-primary-hover active:bg-primary-active">
                  Registrar refeição
                </button>
                <button className="rounded-lg bg-primary px-6 py-3.5 text-sm font-semibold text-on-primary opacity-50 cursor-not-allowed">
                  Desativado
                </button>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                button-primary-soft
              </p>
              <button className="rounded-lg bg-primary-soft px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary-subtle">
                Ver progresso
              </button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                button-secondary
              </p>
              <button className="rounded-lg border border-border-strong bg-canvas px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-surface">
                Pular
              </button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                button-danger
              </p>
              <button className="rounded-lg bg-danger px-6 py-3.5 text-sm font-semibold text-on-primary transition-colors">
                Excluir dieta
              </button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                button-icon / button-icon-primary
              </p>
              <div className="flex gap-3">
                <button className="flex h-10 w-10 items-center justify-center rounded-full text-body transition-colors hover:bg-surface">
                  <User size={20} />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary transition-colors hover:bg-primary-subtle">
                  <Flame size={20} />
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            7. BADGES
            ═══════════════════════════════════════════════════ */}
        <Section title="Badges" token="components.badge-*">
          <div className="flex flex-wrap gap-3">
            <AppBadge variant="pending">Pendente</AppBadge>
            <AppBadge variant="eaten">Registrada</AppBadge>
            <AppBadge variant="skipped">Pulada</AppBadge>
            <AppBadge variant="warning">Acima da meta</AppBadge>
            <AppBadge variant="success">Na meta</AppBadge>
            <AppBadge variant="info">Info</AppBadge>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            8. MEAL CARDS
            ═══════════════════════════════════════════════════ */}
        <Section title="Meal Cards" token="components.meal-card">
          <div className="space-y-3">
            <MealCard
              name="Café da manhã"
              timeWindow="7:00 — 9:00"
              kcalTarget={450}
              status="pending"
            />
            <MealCard
              name="Almoço"
              timeWindow="11:00 — 14:00"
              kcalTarget={600}
              kcalConsumed={580}
              status="eaten"
              conformant
            />
            <MealCard
              name="Lanche"
              timeWindow="15:00 — 16:00"
              kcalTarget={300}
              kcalConsumed={420}
              status="eaten"
              conformant={false}
            />
            <MealCard
              name="Jantar"
              timeWindow="19:00 — 21:00"
              kcalTarget={500}
              status="skipped"
            />
            <MealCard
              name="Ceia"
              timeWindow="21:00 — 22:30"
              kcalTarget={200}
              kcalConsumed={180}
              status="out_of_window"
            />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            9. STAT CARDS
            ═══════════════════════════════════════════════════ */}
        <Section title="Stat Cards" token="components.stat-card">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Calorias hoje"
              value="1.847"
              unit="kcal"
              icon={<Flame size={16} />}
            />
            <StatCard
              label="Adesão semanal"
              value="73%"
              variant="success"
              icon={<CheckCircle2 size={16} />}
            />
            <StatCard
              label="Déficit semanal"
              value="-1.200"
              unit="kcal"
              variant="success"
              icon={<TrendingDown size={16} />}
            />
            <StatCard
              label="Acima da meta"
              value="+300"
              unit="kcal"
              variant="warning"
              icon={<AlertTriangle size={16} />}
            />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            10. CALORIE BAR
            ═══════════════════════════════════════════════════ */}
        <Section title="Calorie Bar" token="components.calorie-bar">
          <div className="space-y-6">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                Under target (teal)
              </p>
              <CalorieBar consumed={480} target={600} size="md" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                On target (teal)
              </p>
              <CalorieBar consumed={590} target={600} size="md" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                Over target (orange)
              </p>
              <CalorieBar consumed={780} target={600} size="md" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                Size variants
              </p>
              <div className="space-y-3">
                <CalorieBar consumed={480} target={600} size="sm" />
                <CalorieBar consumed={480} target={600} size="md" />
                <CalorieBar consumed={480} target={600} size="lg" />
              </div>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            11. PROGRESS RING
            ═══════════════════════════════════════════════════ */}
        <Section title="Progress Ring" token="components.progress-ring">
          <div className="flex items-center gap-6">
            <ProgressRing percentage={73} label="adesão" />
            <ProgressRing percentage={50} label="conformidade" />
            <ProgressRing percentage={100} label="completo" />
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            12. CHAT BUBBLES
            ═══════════════════════════════════════════════════ */}
        <Section title="Chat Bubbles" token="components.chat-bubble-*">
          <div className="space-y-3">
            <ChatBubble role="assistant" timestamp="12:35">
              Bom dia! 🌞 Não esqueça de registrar seu café da manhã.
            </ChatBubble>
            <ChatBubble role="user" timestamp="12:36">
              Comi arroz, feijão e frango grelhado
            </ChatBubble>
            <ChatBubble role="assistant" timestamp="12:36">
              Registrado! 580 kcal de 600 kcal meta. Bom almoço! 👍
            </ChatBubble>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            13. ONBOARDING STEPPER
            ═══════════════════════════════════════════════════ */}
        <Section title="Onboarding Stepper" token="components.onboarding-stepper">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                Step 0 (first)
              </p>
              <OnboardingStepper steps={5} currentStep={0} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                Step 2 (middle)
              </p>
              <OnboardingStepper steps={5} currentStep={2} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                Step 4 (last)
              </p>
              <OnboardingStepper steps={5} currentStep={4} />
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            14. SIGNATURE CARDS
            ═══════════════════════════════════════════════════ */}
        <Section title="Signature Cards" token="components.signature-*">
          <div className="space-y-3">
            <div className="rounded-lg bg-signature-teal p-6 text-on-primary">
              <p className="text-xl font-semibold">
                Sua semana está em déficit!
              </p>
              <p className="mt-1 font-tabular-nums text-[28px] font-bold leading-tight">
                -1.200 kcal
              </p>
              <p className="mt-2 text-sm opacity-90">
                Continue assim, você está no caminho certo.
              </p>
            </div>

            <div className="rounded-lg bg-signature-warm p-6 text-on-primary">
              <p className="text-xl font-semibold">
                Refeição registrada! 🎉
              </p>
              <p className="mt-2 text-sm opacity-90">
                580 kcal de 600 kcal meta. Bom trabalho!
              </p>
            </div>

            <div className="rounded-lg bg-signature-cream p-5 text-ink">
              <p className="text-lg font-semibold">
                💡 Dica: beber água antes da refeição ajuda na saciedade!
              </p>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            15. FORM INPUTS
            ═══════════════════════════════════════════════════ */}
        <Section title="Form Inputs" token="components.text-input-*">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                text-input (default)
              </p>
              <input
                type="text"
                placeholder="O que você comeu?"
                className="h-12 w-full rounded-md border border-border bg-canvas px-4 text-sm text-ink placeholder:text-hint"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                text-input-focus
              </p>
              <input
                type="text"
                value="Arroz, feijão e frango"
                readOnly
                className="h-12 w-full rounded-md border-2 border-border-focus bg-canvas px-4 text-sm text-ink shadow-[0_0_0_3px_var(--color-primary-soft)]"
              />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-mono mb-2">
                text-input-error
              </p>
              <input
                type="text"
                value="Entrada inválida"
                readOnly
                className="h-12 w-full rounded-md border border-danger bg-canvas px-4 text-sm text-danger"
              />
              <p className="mt-1 text-xs text-danger">
                Por favor, insira um valor válido.
              </p>
            </div>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            15b. FORM PRIMITIVES (reusable: Field + Input/Textarea/Select)
            ═══════════════════════════════════════════════════ */}
        <Section title="Form primitives" token="components.form">
          <p className="text-sm text-muted-foreground">
            Blocos reutilizados em todos os formulários: <code>Field</code>{" "}
            (label + controle + erro/hint), <code>Input</code>,{" "}
            <code>Textarea</code> e <code>Select</code>.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nome" htmlFor="ds-name" hint="Como devemos te chamar">
              <Input id="ds-name" placeholder="Ex: Maria" />
            </Field>
            <Field
              label="Peso (kg)"
              htmlFor="ds-weight"
              error="Informe um peso entre 30 e 300 kg"
            >
              <Input id="ds-weight" defaultValue="12" aria-invalid />
            </Field>
            <Field
              label="Preferências"
              htmlFor="ds-prefs"
              className="sm:col-span-2"
            >
              <Textarea
                id="ds-prefs"
                placeholder="Ex: vegetariano, sem peixe..."
                className="min-h-[100px]"
              />
            </Field>
            <Field
              label="Refeições por dia"
              htmlFor="ds-meals"
              className="sm:col-span-2"
            >
              <Select defaultValue="4">
                <SelectTrigger id="ds-meals" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[3, 4, 5, 6].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n} refeições
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            16. BOTTOM NAV (preview only — not fixed)
            ═══════════════════════════════════════════════════ */}
        <Section title="Bottom Nav" token="components.bottom-nav">
          <p className="text-sm text-muted-foreground">
            Preview da navegação inferior (no app real é fixed bottom).
          </p>
          <div className="relative overflow-hidden rounded-t-xl bg-surface px-2 py-2 shadow-xl">
            <nav className="flex items-center justify-around">
              {navItems.map((item) => {
                const isActive = item.href === "/"
                return (
                  <div
                    key={item.href}
                    className={`flex min-w-[3.5rem] flex-col items-center px-3 py-1.5 ${
                      isActive
                        ? "rounded-md bg-primary font-semibold text-on-primary"
                        : "rounded-xl text-muted-foreground"
                    }`}
                  >
                    <span className="[&_svg]:size-6">{item.icon}</span>
                    <span className="mt-1 text-[11px] font-semibold tracking-wide">
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </nav>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            17. FAB (preview only — not fixed)
            ═══════════════════════════════════════════════════ */}
        <Section title="FAB" token="components.fab">
          <div className="flex items-center gap-4">
            <button className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-colors hover:bg-primary-hover active:bg-primary-active">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </button>
            <p className="text-sm text-muted-foreground">
              56px circle, bg-primary, shadow-lg
            </p>
          </div>
        </Section>

        {/* ═══════════════════════════════════════════════════
            18. DASHBOARD MOCKUP
            ═══════════════════════════════════════════════════ */}
        <Section title="Dashboard Mockup" token="composite">
          <div className="space-y-4">
            {/* Stats row */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label="Calorias hoje"
                value="1.847"
                unit="kcal"
                icon={<Flame size={16} />}
              />
              <StatCard
                label="Adesão semanal"
                value="73%"
                variant="success"
                icon={<CheckCircle2 size={16} />}
              />
            </div>

            {/* Calorie bar */}
            <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Progresso do dia
              </p>
              <p className="mt-1 font-tabular-nums text-[28px] font-bold tracking-tight text-ink">
                1.847 <span className="text-sm font-medium text-muted-foreground">de 2.000 kcal</span>
              </p>
              <div className="mt-3">
                <CalorieBar consumed={1847} target={2000} size="lg" />
              </div>
            </div>

            {/* Signature card */}
            <div className="rounded-lg bg-signature-teal p-6 text-on-primary">
              <p className="text-xl font-semibold">
                Sua semana está em déficit!
              </p>
              <p className="mt-1 font-tabular-nums text-[28px] font-bold leading-tight">
                -1.200 kcal
              </p>
              <p className="mt-2 text-sm opacity-90">
                Continue assim, você está no caminho certo.
              </p>
            </div>

            {/* Meals */}
            <div className="space-y-3">
              <MealCard
                name="Café da manhã"
                timeWindow="7:00 — 9:00"
                kcalTarget={450}
                kcalConsumed={420}
                status="eaten"
                conformant
              />
              <MealCard
                name="Almoço"
                timeWindow="11:00 — 14:00"
                kcalTarget={600}
                status="pending"
              />
              <MealCard
                name="Lanche"
                timeWindow="15:00 — 16:00"
                kcalTarget={300}
                status="pending"
              />
              <MealCard
                name="Jantar"
                timeWindow="19:00 — 21:00"
                kcalTarget={500}
                status="pending"
              />
            </div>
          </div>
        </Section>
      </main>

      {/* Bottom Nav (fixed) */}
      <BottomNav />

      {/* FAB (static preview — the real Fab derives its target from DayProvider) */}
      <button
        type="button"
        aria-label="Registrar refeição"
        className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-lg transition-colors hover:bg-primary-hover active:bg-primary-active lg:bottom-8 lg:right-8"
      >
        <Plus size={24} />
      </button>
    </div>
  )
}