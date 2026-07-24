# AppDiet — Contexto de Design para Google Stitch

> Documento de referência para gerar telas no Google Stitch (mobile, desktop e futuro app nativo).
> Fonte de verdade dos tokens: `docs/DESIGN-appdiet.md`. Este doc é o "briefing" resumido + prompts por tela.

---

## 1. Sobre o produto

**AppDiet** é um app de acompanhamento nutricional para pacientes que registram refeições pelo celular, geralmente com pressa, entre uma refeição e outra.

- **Público:** pacientes acompanhados por nutricionista.
- **Tom visual:** caloroso, claro e encorajador. Nunca clínico, nunca punitivo.
- **Idioma da UI:** Português (Brasil). Todos os textos das telas em PT-BR.
- **Princípio central:** encorajamento > punição. Vermelho só para ações destrutivas, nunca para escolhas alimentares.

---

## 2. Como usar este doc no Stitch

1. Cole a **Seção 3 (Design System)** e a **Seção 4 (Layout & Responsividade)** como contexto global no início da sessão do Stitch.
2. Para cada tela, use o **prompt em inglês** da Seção 6 (Stitch responde melhor em inglês). Os textos visíveis da UI devem permanecer em **PT-BR** — isso está indicado nos prompts.
3. Gere sempre a versão **mobile primeiro (390px)**, depois peça a variação **desktop (≥1024px)** referenciando as regras da Seção 4.

---

## 3. Design System (tokens)

Todos os valores abaixo já existem como CSS vars / Tailwind tokens em `globals.css`.

### 3.1 Cores

**Primária (teal — ação):**
- primary `#0d9488` · hover `#0f766e` · active `#115e59` · soft `#ccfbf1` · subtle `#f0fdfa`

**Texto:**
- ink `#1c1917` · body `#44403c` · muted `#78716c` · hint `#a8a29e`

**Superfícies:**
- canvas `#fffbf7` (fundo padrão, branco quente — NUNCA #ffffff) · surface `#f5f0eb` · surface-raised `#ede8e2` · overlay `rgba(28,25,23,0.5)`

**Accent quente (comida / energia — usar com parcimônia):**
- accent-warm `#f97316` · soft `#fff7ed` · hover `#ea580c`

**Accent verde (no caminho certo):**
- accent-green `#22c55e` · soft `#f0fdf4`

**Semânticas:**
- success `#16a34a` / soft `#dcfce7` · warning `#eab308` / soft `#fefce8` · danger `#ef4444` / soft `#fef2f2` (só destrutivo) · info `#0d9488`

**Cards assinatura (voltagem emocional da marca):**
- signature-teal `#0d9488` · warm `#f97316` · cream `#fef3c7` · peach `#fed7aa` · sage `#d9f99d`

**Bordas:** border `#e7e5e4` · border-strong `#d6d3d1` · border-focus `#0d9488`

### 3.2 Tipografia

**Fonte única:** Plus Jakarta Sans (fallback: system-ui, -apple-system, Segoe UI, Roboto).
Regra de peso: 800/700 = stats; 600 = títulos/labels/botões; 500 = body importante; 400 = texto corrido. Nunca 400 em título nem 600 em parágrafo.

| Token | Tamanho / Peso | Uso |
|---|---|---|
| display-lg | 32 / 700 | hero stat do dashboard |
| display-md | 28 / 700 | títulos de seção, onboarding |
| display-sm | 24 / 600 | títulos de card |
| title-lg | 20 / 600 | título de meal card, passo do wizard |
| title-md | 18 / 600 | subtítulos, header de bottom sheet |
| title-sm | 16 / 600 | título de item de lista |
| body-lg | 16 / 500 | body importante |
| body-md | 14 / 400 | texto corrido, chat |
| body-sm | 13 / 400 | texto auxiliar |
| label | 12 / 600 (+0.04em) | badges, labels de nav/form |
| caption | 11 / 500 | timestamps, meta |
| stat-lg | 36 / 800 (-0.03em) | total de kcal, déficit semanal |
| stat-md | 28 / 700 | meta de kcal, % progresso |
| stat-sm | 20 / 700 | stats inline |
| button-lg/md/sm | 16/14/13 · 600 | botões |

> Stats são os heróis. Use `tabular-nums` em todo número para não "pular".

### 3.3 Espaçamento (base 4px)

xxs 4 · xs 8 · sm 12 · md 16 · lg 20 · xl 24 · xxl 32 · xxxl 48 · section 64.
- Padding horizontal mobile: **16px** em toda tela.
- Gap entre meal cards: **12px**. Gap entre seções: 24px (mobile) / 32px (desktop).

### 3.4 Raio de borda

xs 6 · sm 8 · md 12 · lg 16 (cards e botões) · xl 20 (bottom sheets, signature cards, onboarding) · pill/full 9999 (badges, FAB, avatar).
> Botão primário é retângulo arredondado (lg 16px), **nunca pill**.

### 3.5 Sombras (tint quente, nunca azulado)

xs `0 1px 2px rgba(28,25,23,.04)` · sm `0 2px 4px …/.06` · md `0 4px 12px …/.08` · lg `0 8px 24px …/.12` · xl `0 16px 48px …/.16`.
Profundidade = sombra **+** borda 1px, nunca sombra sozinha.

---

## 4. Layout & Responsividade

### 4.1 Filosofia
**Mobile-first sempre.** O app parece um celular mesmo no desktop. Nenhum layout assume mais de ~480px de largura de conteúdo.

### 4.2 Breakpoints

| Nome | Largura | Mudanças-chave |
|---|---|---|
| Mobile | < 640px | 1 coluna, bottom nav fixo, cards full-width, bottom sheets, FAB |
| Tablet | 640–1024px | igual mobile, cards um pouco mais largos, bottom nav persiste |
| Desktop | ≥ 1024px | **sidebar 240px** + conteúdo max 480px centralizado; bottom sheets viram **modais centralizados**; stat cards podem formar grid 2×2 |

### 4.3 Chrome atual (já implementado — manter no refactor)
- Desktop (`lg`): `Sidebar` fixa de 240px (`lg:pl-60`), conteúdo à direita.
- Mobile: `BottomNav` fixo (64px) + `Fab` contextual. Conteúdo com `pb-20` para respeitar o nav.
- 5 itens de nav: Início `/`, Refeições `/meals`, Chat `/chat`, Progresso `/progress`, Perfil `/profile`.

### 4.4 Diretrizes para o FUTURO app nativo (mobile)
As telas devem ser desenhadas de forma "portável" para React Native / Expo:
- **Layout único mobile** deve ser a fonte canônica (o app nativo herda dele quase 1:1).
- **Safe areas:** reservar topo (notch) e base (home indicator iOS). Bottom nav = 64px + safe-area-inset-bottom.
- **Alvos de toque ≥ 48px**; espaçamento generoso.
- **Bottom sheets nativos** (não modais) para ações secundárias — swap, registro de peso, detalhe de refeição.
- **Gestos:** swipe direita no meal card = Registrar/Pular; swipe esquerda = excluir (só logs).
- **Pull-to-refresh** no dashboard e lista de refeições.
- **Sem hover:** todo estado hover deve ter equivalente de toque/press. Não depender de hover para informação.
- Componentes devem usar tokens semânticos (CSS vars) para portar cores/tipografia ao tema nativo sem reescrever.

---

## 5. Componentes-chave (resumo)

- **bottom-nav** (mobile) / **sidebar** (desktop): 5 itens, ativo em teal, inativo muted.
- **button-primary** (teal, 1 por tela), **button-primary-soft**, **button-secondary** (outline), **button-danger**, **button-icon / icon-primary** (40px circular).
- **meal-card**: card mais importante. Status via **borda-esquerda 4px**: pendente=teal, comida=verde+fundo verde-soft, pulada=muted+surface, fora da janela=amarelo+warning-soft. Contém: nome, janela de horário, kcal meta vs real, badge de status.
- **stat-card**, **diet-review-card**, **signature-*-card** (teal/warm/cream full-bleed).
- **calorie-bar** (fill teal; laranja quando acima da meta) e **progress-ring** (adesão %).
- **chat-bubble-user** (teal, canto inf-dir reto) / **assistant** (surface, canto inf-esq reto) / **chat-input** (fixo embaixo, send icon-primary).
- **onboarding-step** + **onboarding-stepper** (dots).
- **bottom-sheet** (mobile) → **modal centralizado** (desktop).
- **fab** (56px, teal, bottom-right).
- **badges**: pending/eaten/skipped/warning (pill).
- **text-input** (48px, focus ring teal-soft, error danger).

---

## 6. Telas (com prompts prontos para o Stitch)

> Para cada tela: **objetivo**, **mobile**, **desktop**, **nativo** e **Prompt Stitch** (em inglês, textos de UI em PT-BR).

### 6.1 Dashboard / Início (`/`)
- **Objetivo:** o paciente ver o status do dia num relance.
- **Mobile:** stack vertical — header com saudação; **calorie-bar** com stat-lg de kcal; **signature-teal-card** com resumo semanal; lista de meal-cards do dia com borda-esquerda de status; FAB "Registrar refeição".
- **Desktop:** sidebar 240px; conteúdo centralizado max 480px; stat cards em grid 2×2 acima da lista.
- **Nativo:** pull-to-refresh; FAB some ao rolar para baixo.

**Prompt Stitch:**
> Design a mobile-first nutrition dashboard screen ("Início"). Warm-white background (#fffbf7), Plus Jakarta Sans. Top: greeting title. Below: a large calorie summary with a horizontal progress bar (teal fill #0d9488, orange #f97316 when over target) and a bold 36px tabular number showing "kcal restantes". Then a full-bleed teal signature card (#0d9488, white text) titled "Sua semana está em déficit!". Then a vertical list of meal cards, each with a 4px left border encoding status (teal=pending, green=eaten, gray=skipped, yellow=out-of-window), showing meal name, time window, kcal target vs actual, and a pill status badge. Floating teal action button (56px) bottom-right labeled with a "+" for "Registrar refeição". Fixed bottom nav with 5 items (Início, Refeições, Chat, Progresso, Perfil), active item teal. All UI text in Brazilian Portuguese. Generous spacing, soft warm shadows, 16px rounded cards.

### 6.2 Refeições (`/meals`) e Detalhe (`/meals/[id]`)
- **Objetivo:** ver/registrar refeições do plano.
- **Mobile:** seletor de dia; lista de meal-cards; tocar abre **bottom sheet** de detalhe/registro.
- **Desktop:** lista + detalhe como **modal centralizado**.

**Prompt Stitch:**
> Design a "Refeições" list screen and a meal detail bottom sheet. List: day selector at top, then meal cards with 4px status left border, kcal info, and status badges. Tapping a card opens a bottom sheet (rounded top corners 20px, drag handle 36×4px, warm shadow) with meal name, foods, kcal target vs actual, and primary teal button "Registrar refeição" plus secondary outline "Pular". Warm-white theme, Plus Jakarta Sans, PT-BR text. On desktop the bottom sheet becomes a centered modal.

### 6.3 Chat com a IA (`/chat`)
- **Mobile/Nativo:** full-screen; bolhas user (teal, dir) / assistant (surface, esq); input fixo embaixo com send icon-primary; indicador de digitação (3 dots teal-soft).
- **Desktop:** mesmo layout dentro da área de conteúdo (não usar bottom sheet no chat).

**Prompt Stitch:**
> Design a full-screen AI chat screen ("Chat"). User bubbles teal (#0d9488, white text, bottom-right corner squared), assistant bubbles surface gray (#f5f0eb, dark text, bottom-left corner squared), max width 80%. Fixed bottom input (rounded 20px, 48px min height, teal circular send icon). Typing indicator with 3 bouncing teal dots. Warm-white background, Plus Jakarta Sans, PT-BR.

### 6.4 Progresso (`/progress`)
- **Mobile:** **progress-ring** de adesão semanal; **weight-chart** (linha teal, sem preenchimento); stat cards; signature-cream card com dica.
- **Desktop:** stat cards em grid 2×2; gráficos mais largos (max 480px).

**Prompt Stitch:**
> Design a "Progresso" screen. Top: circular progress ring (120px, teal fill, 28px bold % in center) for weekly adherence. Below: a clean minimal line chart (teal line, no fill) for weight over 7/30 days. Then 2×2 stat cards with a label and a bold tabular number. A warm-cream callout card (#fef3c7, dark text) with an encouraging tip. Warm-white theme, Plus Jakarta Sans, PT-BR.

### 6.5 Peso (`/weight`)
- **Mobile:** weight-chart + botão icon-primary "Registrar peso" → **bottom sheet** com input.

**Prompt Stitch:**
> Design a "Peso" screen with a minimal teal line chart of weight history and a list of recent entries. A teal icon button "Registrar peso" opens a bottom sheet with a single number input (48px, teal focus ring) and a primary teal button "Salvar". Warm-white, Plus Jakarta Sans, PT-BR.

### 6.6 Perfil (`/profile`)
- **Mobile:** avatar; dados; seções de configuração; botão-danger "Excluir dieta"/conta isolado.

**Prompt Stitch:**
> Design a "Perfil" screen: circular avatar, user name/goal, grouped settings rows on warm-white cards with 1px borders, and a clearly separated red destructive button ("Excluir conta") at the bottom. Plus Jakarta Sans, PT-BR.

### 6.7 Dieta: lista / nova / revisão (`/diet`, `/diet/new`, `/diet/[id]`)
- **Nova:** tabs "Gerar com IA" / "Importar"; formulário; botão primário.
- **Revisão:** **diet-review-card** com nome do plano, kcal total, lista de refeições; botões "Aprovar" (primary) e "Ajustar" (secondary).

**Prompt Stitch:**
> Design a diet review screen. A large review card (rounded 16px, warm shadow, 1px border) showing plan name, daily kcal total as a bold 28px tabular number, and a list of meals with their kcal targets. Bottom actions: primary teal "Aprovar" and outline "Ajustar". Also design a "Nova dieta" screen with two tabs ("Gerar com IA" / "Importar") and a form. Warm-white, Plus Jakarta Sans, PT-BR.

### 6.8 Onboarding (`/onboarding`)
- **Mobile/Nativo:** wizard full-screen; **stepper** de dots no topo; input por passo; "Continuar" fixo embaixo + "Voltar" acima.

**Prompt Stitch:**
> Design a full-screen onboarding wizard step. Top: horizontal stepper dots (active teal, completed teal w/ check, inactive gray). Step title (20px/600), description (14px), form inputs (48px). Fixed bottom: primary teal "Continuar" and a "Voltar" text link above it. Warm-white, Plus Jakarta Sans, PT-BR.

### 6.9 Auth (`/sign-in`, `/sign-up`)
- Telas Clerk; manter o tema (canvas quente, botão teal, tipografia Plus Jakarta Sans).

---

## 7. Estados (aplicar em todas as telas)

- **Meal status:** pending (teal), eaten conformant (verde), eaten não-conformant (amarelo), skipped (muted), out-of-window (amarelo).
- **Calorie progress:** abaixo/na meta = barra teal + "X kcal restantes"; acima = barra laranja + "X kcal acima" com mensagem encorajadora referenciando o déficit semanal.
- **Loading:** skeletons (surface + shimmer surface-raised), máx 2s; spinner teal 24px no chat.
- **Empty states:** ilustração simples e encorajadora + mensagem + botão. Ex.: sem dieta → "Sua dieta ainda não está ativa…" + "Criar dieta".

---

## 8. Do's & Don'ts (para o Stitch respeitar)

**Do:** teal para tudo interativo · laranja só para comida/acima-da-meta · stats grandes e bold · borda-esquerda de status nos meal cards · canvas #fffbf7 · sombra + borda nos cards · 1 botão primário por tela · tabular-nums.

**Don't:** vermelho para feedback alimentar · laranja como cor de botão primário · #ffffff puro de fundo · pill em botão primário · 2+ botões primários por tela · bottom sheet no chat · número de kcal sem contexto comparativo.

---

## 9. Lacunas conhecidas (decidir com o Stitch)
Dark mode (tokens prontos, não implementado) · timings de animação (200ms micro, 300ms sheets, 500ms barras) · sistema de toast · ícones (Lucide) · estilo de ilustração para empty states (simples, quente, encorajador).
