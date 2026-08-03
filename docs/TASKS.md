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
| 2.1 | Onboarding wizard (5 passos) | ✅ Concluído | 5 step components + wizard page + server action + BMR/TDEE calculation + zod validation |
| 2.2 | Dashboard (home) | ✅ Concluído | StatCards, CalorieBar, MealCards, FAB, empty state → /diet/new |
| 2.3 | Diet plan — criar/importar/revisar/ativar | ✅ Concluído | /diet, /diet/new, /diet/[id] + APIs generate/import/activate |
| 2.4 | Meal logging — texto livre → IA → MealLog | ✅ Concluído | /meals/[id] + POST log/skip + parseMeal |
| 2.5 | Chat com IA (streaming SSE) | ✅ Concluído | Chat window + OpenRouter streaming + histórico por sessão |
| 2.6 | Troca de alimentos | ✅ Concluído | Swap sheet + POST /api/diet/[id]/swap |
| 2.7 | Progresso — gráficos semanais | ✅ Concluído | Chart.js + weekly summary + weight chart |
| 2.8 | Perfil — editar dados do paciente | ✅ Concluído | Formulário de edição + recálculo BMR/TDEE |

---

## Fase 3 — Integrações (após core flow)

| # | Task | Status | Detalhes |
|---|------|--------|---------|
| 3.1 | WhatsApp (Evolution API) — lembretes e registro | ⬜ Pendente | Webhook + handlers + templates |
| 3.2 | TBCA import script | 🔄 Em andamento | Schema estendido + `scripts/tbca-import.ts` + busca lexical; importar arquivo completo via `TBCA_FILE_PATH` |
| 3.5 | Pipeline nutricional determinístico (Semanas 1–2) | 🔄 Em andamento | LLM só escolhe `foodId + gramas`; backend calcula, valida (±5% dia / ±10% refeição) e otimiza porções. Falta validação E2E com banco — ver `docs/MVP-SCOPE.md` §15 |
| 3.3 | Criptografia de campos sensíveis | ⬜ Pendente | Prisma Client Extension com AES-256 |
| 3.4 | Docker Compose + Caddy | ⬜ Pendente | Deploy config para VPS |

---

## Notas

- Cada task marcada como ✅ Concluído deve ter commit no git
- Tasks bloqueadas por dependências são marcadas como 🔒 Bloqueado
- Tasks em andamento são marcadas como 🔄 Em andamento