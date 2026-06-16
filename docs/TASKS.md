# AppDiet — Task Tracker

> Última atualização: Junho 2026

## Fase 1 — Scaffold & Design System

| # | Task | Status | Detalhes |
|---|------|--------|---------|
| 1.1 | Scaffold Next.js (App Router + TypeScript + Tailwind) | ✅ Concluído | Next.js 16.2.9 + Tailwind v4 + TypeScript + ESLint |
| 1.2 | Configurar Tailwind com design tokens | ✅ Concluído | globals.css com todas as cores, spacing, radius, shadows do DESIGN-appdiet.md |
| 1.3 | Instalar e configurar shadcn/ui | ✅ Concluído | shadcn/ui v4 (base-nova) com tema teal customizado |
| 1.4 | Configurar Plus Jakarta Sans via next/font | ✅ Concluído | Font loading via next/font/google com CSS variable --font-sans |
| 1.5 | Criar estrutura de pastas do projeto | ✅ Concluído | 34 diretórios + placeholder files seguindo ARCHITECTURE.md seção 10 |
| 1.6 | Configurar Prisma schema | ✅ Concluído | 9 modelos: User, DietPlan, DietPlanReview, Meal, MealItem, MealLog, WeightLog, ChatMessage, TBACFood |
| 1.7 | Configurar Clerk (auth) | ✅ Concluído | ClerkProvider + ptBR localization + sign-in/sign-up pages |
| 1.8 | Criar .env.example | ✅ Concluído | Todas as variáveis: DATABASE_URL, Clerk, OpenRouter, Evolution API, Encryption |
| 1.9 | Criar layouts base (root + app com bottom nav) | ✅ Concluído | Root layout (font + Clerk) + Auth layout + App layout (mobile-first) |
| 1.10 | Criar CSS custom properties para dark mode futuro | ✅ Concluído | .dark class com tokens invertidos em globals.css |
| 1.11 | Criar componentes do design system | ✅ Concluído | calorie-bar, progress-ring, stat-card, meal-card, chat-bubble, onboarding-stepper, app-badge, bottom-nav, fab |
| 1.12 | Criar página showcase /design-system | ✅ Concluído | 18 seções: cores, tipografia, spacing, radius, shadows, botões, badges, meal cards, stat cards, calorie bar, progress ring, chat, stepper, signature cards, inputs, bottom nav, FAB, dashboard mockup |

---

## Fase 2 — Core Flow (após scaffold)

| # | Task | Status | Detalhes |
|---|------|--------|---------|
| 2.1 | Onboarding wizard (5 passos) | ⬜ Pendente | Step components + stepper + form state |
| 2.2 | Dashboard (home) | ⬜ Pendente | Calorie bar, meal cards, stats, FAB |
| 2.3 | Diet plan — criar/importar/revisar/ativar | ⬜ Pendente | AI parsing + review flow |
| 2.4 | Meal logging — texto livre → IA → MealLog | ⬜ Pendente | Meal detail + log form |
| 2.5 | Chat com IA (streaming SSE) | ⬜ Pendente | Chat window + OpenRouter integration |
| 2.6 | Troca de alimentos | ⬜ Pendente | Swap button + bottom sheet + AI suggestions |
| 2.7 | Progresso — gráficos semanais | ⬜ Pendente | Calorie bar semanal + adherence ring + weight chart |
| 2.8 | Perfil — editar dados do paciente | ⬜ Pendente | Formulário de edição de perfil |

---

## Fase 3 — Integrações (após core flow)

| # | Task | Status | Detalhes |
|---|------|--------|---------|
| 3.1 | WhatsApp (Evolution API) — lembretes e registro | ⬜ Pendente | Webhook + handlers + templates |
| 3.2 | TBCA import script | ⬜ Pendente | Seed script para importar tabela de alimentos |
| 3.3 | Criptografia de campos sensíveis | ⬜ Pendente | Prisma Client Extension com AES-256 |
| 3.4 | Docker Compose + Caddy | ⬜ Pendente | Deploy config para VPS |

---

## Notas

- Cada task marcada como ✅ Concluído deve ter commit no git
- Tasks bloqueadas por dependências são marcadas como 🔒 Bloqueado
- Tasks em andamento são marcadas como 🔄 Em andamento