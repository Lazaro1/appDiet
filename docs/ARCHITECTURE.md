# AppDiet — Documento de Arquitetura

> Última atualização: Maio 2026

## 1. Visão Geral

**AppDiet** é um aplicativo web de nutrição cujo objetivo é **melhorar a adesão de pacientes a dietas**. O app verifica cada refeição do paciente, calcula progresso calórico diário e semanal, e usa IA para sugerir trocas alimentares que respeitem a meta calórica da refeição.

### Proposição de Valor

- Registro simples de refeições por texto livre (parsing por IA)
- Sugestão inteligente de trocas com base nos ingredientes disponíveis
- Progresso calórico visual (diário e semanal)
- Lembretes via WhatsApp com interação bidirecional limitada
- Reforço positivo em vez de punição

### Usuário Principal

Paciente (B2C). O nutricionista real do paciente não é usuário ativo do sistema, mas o paciente pode importar a dieta que recebeu dele. Compartilhamento com nutricionista é uma evolução futura.

---

## 2. Decisões de Produto

| # | Decisão | Escolha |
|---|---------|---------|
| 1 | Usuário principal | B2C com compartilhamento opcional com nutricionista (futuro) |
| 2 | Perfil do paciente | Moderado: peso, altura, idade, sexo, objetivo, nível de atividade, restrições alimentares, preferências, horários de refeição, condições de saúde |
| 3 | Entrada da dieta | Texto livre com parsing por IA (cola do WhatsApp, foto do plano, digitação) |
| 4 | Estrutura de refeições | Janelas de tempo (ex: almoço 11h–14h) |
| 5 | Confirmação de refeição | Registro por texto livre, IA faz parsing e calcula kcal/macros |
| 6 | Sistema de trocas | Chat livre + botão "trocar" na refeição, ingredientes disponíveis informados ad-hoc |
| 7 | Ingredientes disponíveis | Ad-hoc na conversa (sem despensa persistente no MVP) |
| 8 | Escopo do chat | Híbrido: telas estruturadas para ações rápidas + chat para interações com IA |
| 17 | Memória da IA | Sessão atual + perfil do paciente (sem memória de conversas anteriores) |
| 22 | Onboarding | Formulário estruturado (wizard com 5–6 passos) |
| 23 | Home screen | Dashboard completo: calorias do dia, calorias da semana, refeições, progresso de peso, gráficos |
| 25 | Revisão da dieta | Paciente revisa todas as refeições antes de ativar o plano |
| 26 | Refeições perdidas | Registra + reforço positivo com contexto semanal |
| 27 | Pricing | Gratuito no MVP, freemium após validação |
| 29 | WhatsApp | Bidirecional limitado: responder lembretes e registrar refeições; trocas e chat completo só no app |
| 30 | Métricas de adesão | Taxa de registro (% refeições registradas) + taxa de conformidade (% refeições dentro de ±10% das kcal planejadas) |
| 34 | Tom da IA | Parceiro prático: direto, útil, sem julgamento |
| 35 | Idioma | Português brasileiro apenas |

---

## 3. Decisões Técnicas

| # | Decisão | Escolha |
|---|---------|---------|
| 9 | Front-end | Next.js web app responsivo (mobile-first) |
| 10 | Back-end | Next.js fullstack (API Routes) |
| 11 | Banco de dados | PostgreSQL + Prisma ORM |
| 12 | Autenticação | Clerk |
| 13 | Modelo de IA | OpenRouter (DeepSeek V4 Flash primário, GPT-4o-mini fallback) |
| 14 | Deploy | VPS único (Hetzner/DigitalOcean) |
| 15 | Cálculo de calorias | Híbrido: IA faz parsing → consulta TBCA no PostgreSQL |
| 16 | Banco de alimentos | TBCA importada no PostgreSQL |
| 18 | Progresso calórico | Barra diária + semanal (déficit/superávit/manutenção) |
| 19 | BMR | Mifflin-St Jeor + fator de atividade |
| 20 | WhatsApp API | Evolution API (self-hosted, Docker, Baileys) para MVP → Evolution API (Cloud API Meta) para produção |
| 21 | Estrutura da dieta | Plano diário que se repete |
| 24 | Registro de peso | Lembrete via WhatsApp + registro manual |
| 28 | UI | shadcn/ui + Tailwind CSS |
| 31 | Next.js router | App Router |
| 32 | Resposta da IA | Streaming (SSE) |
| 33 | Falha da IA | Fallback para modelo secundário + graceful degradation |
| 36 | Estado no cliente | React Query + estado local (useState/useReducer) |
| 37 | LGPD | Mínimo legal + criptografia de dados sensíveis no banco |
| 38 | Estrutura do projeto | Monorepo simples |

---

## 4. Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    PACIENTE                              │
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────────┐  │
│  │ Browser  │  │ WhatsApp │  │  WhatsApp (lembretes) │  │
│  │ (Next.js)│  │  (chat)  │  │  (respostas simples)  │  │
│  └─────┬────┘  └────┬─────┘  └──────────┬───────────┘  │
│        │             │                   │              │
└────────┼─────────────┼───────────────────┼──────────────┘
         │             │                   │
         ▼             ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│                    VPS (Docker)                          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Next.js (App Router)                │    │
│  │                                                   │    │
│  │  ┌──────────┐  ┌──────────┐  ┌────────────────┐ │    │
│  │  │  Páginas │  │  API     │  │  Server        │ │    │
│  │  │  (React) │  │  Routes  │  │  Actions       │ │    │
│  │  └──────────┘  └────┬─────┘  └───────┬────────┘ │    │
│  │                      │                │          │    │
│  └──────────────────────┼────────────────┼──────────┘    │
│                         │                │                │
│                         ▼                ▼                │
│  ┌──────────────┐  ┌────────────┐  ┌───────────────┐    │
│  │  PostgreSQL   │  │  OpenRouter│  │ Evolution API  │    │
│  │  + Prisma    │  │  (DeepSeek │  │  (WhatsApp     │    │
│  │  + TBCA      │  │   + Fallback│  │   Baileys/Cloud│    │
│  └──────────────┘  └────────────┘  └───────────────┘    │
│                                                         │
│  ┌──────────────┐                                       │
│  │    Clerk     │  (Auth — serviço externo)              │
│  └──────────────┘                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Modelo de Dados

### 5.1 Diagrama ER

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│    User      │       │   DietPlan       │       │   Meal           │
├──────────────┤       ├──────────────────┤       ├──────────────────┤
│ id           │──┐    │ id               │──┐    │ id               │
│ clerkId      │  │    │ userId           │  │    │ dietPlanId       │
│ name         │  │    │ name             │  │    │ name             │
│ email        │  │    │ totalKcal        │  │    │ kcalTarget       │
│ birthDate    │  │    │ isActive         │  │    │ windowStart     │
│ sex          │  │    │ createdAt        │  │    │ windowEnd       │
│ height       │  │    │ updatedAt        │  │    │ order            │
│ weight       │  │    └──────────────────┘  │    │ mealItems       │
│ activityLevel│  │           │              │    │ createdAt        │
│ goal         │  │           │              │    │ updatedAt        │
│ bmr          │  │           ▼              │    └──────────────────┘
│ tdee         │  │    ┌──────────────────┐  │           │
│ dailyKcalTarget│  │    │  DietPlanReview  │  │           ▼
│ restrictions  │  │    ├──────────────────┤  │    ┌──────────────────┐
│ preferences   │  │    │ id               │  │    │  MealItem        │
│ conditions    │  │    │ dietPlanId       │  │    ├──────────────────┤
│ createdAt    │  │    │ status            │  │    │ id               │
│ updatedAt    │  │    │ createdAt        │  │    │ mealId           │
└──────────────┘  │    └──────────────────┘  │    │ foodId           │
                  │                           │    │ quantity          │
                  │                           │    │ unit              │
                  │                           │    │ kcal             │
                  │                           │    │ protein          │
                  │                           │    │ carbs             │
                  │                           │    │ fat               │
                  │                           │    └──────────────────┘
                  │                           │
                  │                           │
                  ▼                           ▼
         ┌──────────────────┐       ┌──────────────────┐
         │  MealLog         │       │  WeightLog       │
         ├──────────────────┤       ├──────────────────┤
         │ id               │       │ id               │
         │ userId           │       │ userId           │
         │ mealId           │       │ weight           │
         │ date             │       │ date             │
         │ status           │       │ createdAt        │
         │ rawText          │       └──────────────────┘
         │ parsedKcal       │
         │ parsedProtein    │       ┌──────────────────┐
         │ parsedCarbs      │       │  ChatMessage     │
         │ parsedFat        │       ├──────────────────┤
         │ conformant       │       │ id               │
         │ createdAt        │       │ userId           │
         └──────────────────┘       │ role             │
                                    │ content          │
                                    │ sessionId        │
                                    │ createdAt        │
                                    └──────────────────┘

         ┌──────────────────┐
         │  TBACFood        │
         ├──────────────────┤
         │ id               │
         │ name             │
         │ category         │
         │ kcalPer100g      │
         │ proteinPer100g   │
         │ carbsPer100g     │
         │ fatPer100g       │
         │ fiberPer100g     │
         │ portionDefault   │
         │ portionUnit      │
         └──────────────────┘
```

### 5.2 Descrição das Entidades

#### User
Perfil do paciente. Armazena dados do onboarding e cálculos derivados (BMR, TDEE, meta calórica). Dados sensíveis (peso, condições de saúde) são criptografados no banco.

#### DietPlan
Plano alimentar ativo do paciente. Um plano por vez (`isActive = true`). Pode ser gerado pela IA ou importado do nutricionista via texto livre. Contém a meta calórica diária total.

#### DietPlanReview
Antes de ativar, o plano passa por revisão. Status: `pending`, `approved`, `rejected`. O paciente pode pedir ajustes no chat antes de aprovar.

#### Meal
Refeição dentro do plano (Café da manhã, Almoço, Lanche, Jantar, Ceia). Cada refeição tem uma janela de tempo (`windowStart`, `windowEnd`) e uma meta calórica (`kcalTarget`).

#### MealItem
Alimento planejado dentro de uma refeição. Referencia a TBCA e armazena quantidade, unidade e macros calculados.

#### MealLog
Registro do que o paciente realmente comeu. `rawText` é o texto original digitado. Os campos `parsed*` são preenchidos pela IA após parsing. `status` pode ser `eaten`, `skipped`, `out_of_window`. `conformant` indica se ficou dentro de ±10% da meta calórica da refeição.

#### WeightLog
Registro de peso do paciente. Pode ser entrado manualmente no app ou via resposta ao lembrete do WhatsApp.

#### ChatMessage
Mensagens do chat com a IA. Agrupadas por `sessionId` (uma sessão por dia). Role: `user` ou `assistant`.

#### TBACFood
Tabela brasileira de composição de alimentos, importada para o PostgreSQL. Usada pela IA para cálculos nutricionais precisos.

### 5.3 Criptografia de Dados Sensíveis

Campos criptografados no banco usando Prisma Client Extensions:

- `User.weight`
- `User.conditions`
- `User.restrictions`
- `MealLog.rawText`
- `WeightLog.weight`

Criptografia AES-256 com chave armazenada em variável de ambiente.

---

## 6. Fluxos do Usuário

### 6.1 Onboarding

```
Cadastro (Clerk Google Login)
    │
    ▼
Wizard Step 1: Dados básicos
  - Nome, data de nascimento, sexo
    │
    ▼
Wizard Step 2: Medidas
  - Peso, altura
    │
    ▼
Wizard Step 3: Objetivo e atividade
  - Objetivo (perder/ganhar/manter)
  - Nível de atividade física
    │
    ▼
Wizard Step 4: Restrições e preferências
  - Alergias, intolerâncias, alimentos que não come
  - Preferências alimentares
  - Condições de saúde
    │
    ▼
Wizard Step 5: Rotina
  - Quantas refeições por dia
  - Horários preferidos para cada refeição
    │
    ▼
Cálculo automático: BMR (Mifflin-St Jeor) → TDEE → Meta calórica
    │
    ▼
Escolha: "Gerar dieta pela IA" ou "Inserir dieta do nutricionista"
    │
    ├── Gerar pela IA ──► IA cria plano com base no perfil
    │                        │
    │                        ▼
    │                   Revisão do plano
    │                        │
    ├── Inserir dieta ──► Texto livre → IA faz parsing estruturado
    │                        │
    │                        ▼
    │                   Revisão do plano
    │                        │
    │                        ▼
    │                  [Aprovar] → Ativar plano
    │                  [Ajustar] → Chat com IA
    │                        │
    │                        ▼
    │                   Dashboard (home)
```

### 6.2 Dia a Dia — Registro de Refeição

```
Lembrete WhatsApp (início da janela)
    │
    ├── Responde no WhatsApp ("já comi arroz feijão e frango")
    │       │
    │       ▼
    │   Evolution API → API → IA faz parsing → Registra MealLog
    │       │
    │       ▼
    │   WhatsApp: "Registrado! 580 kcal. Sua meta de almoço era 600 kcal. 👍"
    │
    └── Abre o app
            │
            ▼
        Dashboard (home)
            │
            ├── Clica na refeição pendente
            │       │
            │       ▼
            │   Digita o que comeu (texto livre)
            │       │
            │       ▼
            │   IA faz parsing → Calcula kcal/macros via TBCA
            │       │
            │       ▼
            │   Mostra resultado: "580 kcal de 600 kcal meta"
            │       │
            │       ▼
            │   Barra de calorias atualizada
            │
            └── Abre o chat
                    │
                    ▼
                Conversa com IA (trocas, dúvidas, ajustes)
```

### 6.3 Troca de Alimentos

```
Paciente abre refeição planejada
    │
    ├── Clica "Trocar" em um alimento
    │       │
    │       ▼
    │   IA sugere alternativas equivalentes (kcal/macros similares)
    │       │
    │       ▼
    │   Paciente escolhe ou pede outra opção
    │
    └── Escreve no chat: "não tenho frango, tenho ovo e queijo, o que posso fazer?"
            │
            ▼
        IA: "Pode fazer omelete de queijo — 2 ovos + 30g queijo = 220 kcal, 18g proteína.
             O frango planejado era 180 kcal, 25g proteína. Que tal adicionar 1 ovo extra
             pra fechar a proteína?"
            │
            ▼
        Paciente confirma → Refeição atualizada
```

### 6.4 Registro de Peso

```
Lembrete WhatsApp (toda manhã, horário configurado)
    │
    ▼
" Bom dia! 😊 Qual seu peso hoje?"
    │
    ├── Paciente responde "78.5"
    │       │
    │       ▼
    │   Evolution API → API → Registra WeightLog
    │       │
    │       ▼
    │   "Registrado! Você está 0.3 kg mais leve que semana passada. Continue assim! 💪"
    │
    └── Paciente ignora
            │
            ▼
        Nenhum registro (sem punição)
```

---

## 7. Cálculos Nutricionais

### 7.1 BMR — Taxa Metabólica Basal (Mifflin-St Jeor)

```
Homens:   BMR = (10 × peso_kg) + (6.25 × altura_cm) - (5 × idade) + 5
Mulheres: BMR = (10 × peso_kg) + (6.25 × altura_cm) - (5 × idade) - 161
```

### 7.2 TDEE — Gasto Calórico Total

```
TDEE = BMR × fator_de_atividade

| Nível        | Fator | Descrição              |
|-------------|-------|------------------------|
| Sedentário  | 1.200 | Pouco ou nenhum exercício |
| Leve         | 1.375 | 1-3x/semana            |
| Moderado     | 1.550 | 3-5x/semana            |
| Ativo        | 1.725 | 6-7x/semana            |
| Muito ativo  | 1.900 | 2x/dia ou trabalho físico |
```

### 7.3 Meta Calórica Diária

```
Perda de peso:     meta = TDEE - 500 kcal
Ganho de peso:     meta = TDEE + 300 kcal
Manutenção:        meta = TDEE
```

### 7.4 Distribuição por Refeição

A IA distribui a meta calórica diária entre as refeições com base nos horários e preferências do paciente. Exemplo para 4 refeições:

```
Café da manhã (7h):   25% da meta
Almoço (12h):         35% da meta
Lanche (15h):         15% da meta
Jantar (19h):         25% da meta
```

### 7.5 Métricas de Adesão

```
Taxa de registro = (refeições registradas / refeições planejadas) × 100

Taxa de conformidade = (refeições conformes / refeições registradas) × 100

Onde:
  conforme = kcal reais dentro de ±10% da kcal planejada da refeição
```

### 7.6 Progresso Calórico

```
Diário:
  kcal_consumidas = SUM(kcal de MealLogs do dia)
  meta_diária = TDEE ± ajuste de objetivo
  saldo = kcal_consumidas - meta_diária
  barra: [████████░░] 80% (480 kcal restantes)

Semanal:
  saldo_semanal = SUM(saldo diário dos 7 dias)
  contexto: "Sua semana está em déficit de 1.200 kcal — bom pra perda de peso!"
```

---

## 8. Integração com IA

### 8.1 OpenRouter

- **Endpoint**: `https://openrouter.ai/api/v1/chat/completions`
- **Modelo primário**: `deepseek/deepseek-v4-flash`
- **Modelo fallback**: `openai/gpt-4o-mini`
- **Streaming**: SSE (Server-Sent Events)
- **Contexto por requisição**: Perfil do paciente + dieta ativa + conversa da sessão atual

### 8.2 System Prompt (resumo)

```
Você é um assistente de nutrição prático e direto. Seu tom é de um parceiro
que entende de nutrição: sem julgamento, sem enrolação, soluções práticas.

Regras:
- Responda sempre em português brasileiro
- Use linguagem simples, evite jargões técnicos
- Nunca julgue escolhas alimentares
- Sugira trocas realistas com base nos alimentos disponíveis
- Calcule calorias e macros usando a tabela TBCA
- Quando o paciente sair da meta, mostre contexto semanal positivo
- Nunca prescreva dietas médicas ou substitua orientação profissional
```

### 8.3 Fluxo de Parsing de Refeição

```
Texto do paciente: "comi arroz, feijão, frango grelhado e salada"
    │
    ▼
Prompt para IA:
"Parseie esta refeição em alimentos estruturados. Para cada alimento,
estime a porção em gramas com base no contexto brasileiro.
Retorne JSON: [{food_name, estimated_grams, estimated_kcal, estimated_protein, estimated_carbs, estimated_fat}]"
    │
    ▼
Resposta da IA:
[
  {"food_name": "arroz branco cozido", "estimated_grams": 200, "estimated_kcal": 260, ...},
  {"food_name": "feijão preto cozido", "estimated_grams": 120, "estimated_kcal": 100, ...},
  {"food_name": "frango grelhado", "estimated_grams": 150, "estimated_kcal": 225, ...},
  {"food_name": "salada verde", "estimated_grams": 80, "estimated_kcal": 15, ...}
]
    │
    ▼
Para cada alimento:
  1. Buscar na TBCA pelo nome (fuzzy match)
  2. Se encontrado: usar valores da TBCA com a porção estimada
  3. Se não encontrado: usar estimativa da IA
    │
    ▼
Resultado final: kcal e macros calculados com precisão da TBCA
```

### 8.4 Fallback e Resiliência

```
Requisição para OpenRouter (DeepSeek V4 Flash)
    │
    ├── Sucesso (200) → Retorna resposta com streaming
    │
    ├── Timeout/Erro → Tenta modelo fallback (GPT-4o-mini)
    │                       │
    │                       ├── Sucesso → Retorna resposta
    │                       │
    │                       └── Erro → Retorna erro graceful:
    │                                  "Não consegui processar agora.
    │                                   Tente em alguns minutos.
    │                                   Suas refeições e progresso
    │                                   continuam funcionando normalmente."
    │
    └── Rate limit → Retry com exponential backoff (máx 3 tentativas)
```

---

## 9. Integração com WhatsApp (Evolution API)

### 9.1 Arquitetura

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Next.js    │──────►│ Evolution API│──────►│   WhatsApp   │
│   API Route  │◄──────│  (Docker)    │◄──────│  ( número     │
│              │       │  + PostgreSQL│       │   pessoal)    │
└──────────────┘       └──────────────┘       └──────────────┘
```

**MVP**: Usa Baileys (WhatsApp Web protocol) — gratuito, self-hosted, sem verificação business.
**Produção**: Migra para Cloud API (Meta oficial) — sem risco de ban, selo verde, templates. Mesma instância Evolution API, mesma API, só troca o tipo de conexão.

### 9.2 Vantagens sobre WAHA

| Critério | Evolution API | WAHA |
|----------|--------------|------|
| Licença | Apache 2.0 (100% gratuito) | Core grátis, Plus $19/mês |
| Multi-sessão | Ilimitado, gratuito | Só no Plus ($19/mês) |
| Dashboard | Sim (gratuito) | Só no Plus |
| Caminho para oficial | Cloud API Meta built-in | Nenhuma — precisa migrar pra Z-API |
| Stack | TypeScript + Express + Prisma + PostgreSQL | TypeScript + SQLite/PostgreSQL |
| Estabilidade | Boa, poucos reports de crash | Problemática: sessões stuck, mensagens silently dropadas |
| Comunidade | 7.500+ stars, majoritariamente BR | ~6.000 stars, internacional |

### 9.3 Mensagens Enviadas (App → Paciente)

| Gatilho | Mensagem |
|---------|----------|
| Início da janela de refeição | "Hora do almoço! 🍽️ Não esqueça de registrar o que comeu." |
| Fim da janela (15 min antes) | "Quase acabou a janela do almoço. Já comeu?" |
| Lembrete de peso (manhã) | "Bom dia! 😊 Qual seu peso hoje?" |
| Refeição registrada (confirmação) | "Registrado! 580 kcal de 600 kcal meta. 👍" |

### 9.4 Mensagens Recebidas (Paciente → App)

| Tipo de mensagem | Processamento |
|-----------------|---------------|
| Número (ex: "78.5") | Registra como peso |
| Texto de refeição (ex: "comi arroz e feijão") | Faz parsing e registra MealLog |
| "pulei" / "não comi" | Marca refeição como skipped |
| Qualquer outro texto | Responde com mensagem genérica: "Para trocas e dúvidas, abra o app!" |

### 9.5 Limitações do MVP (Baileys)

- Número pessoal (não oficial business)
- Sem suporte a mídia (fotos, áudio) — apenas texto
- Sem stickers e emojis no processamento
- Sessão limitada a 1 número (1 paciente por instância para teste)
- Risco de ban do número (inerente ao protocolo Baileys) — mitigado por uso em volume baixo no MVP

### 9.6 Migração para Produção (Cloud API Meta)

Após validação, migrar a conexão dentro da mesma Evolution API:
- Mudar tipo de conexão de Baileys para Cloud API
- Número business oficial com selo verde
- Múltiplos pacientes simultâneos
- Suporte a mídia (fotos, áudio)
- Sem risco de ban — API oficial da Meta
- Templates de mensagens aprovados pela Meta

---

## 10. Estrutura do Projeto

```
appdiet/
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│       └── tbca-import.ts          # Script de importação da TBCA
├── public/
│   └── ...
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── sign-in/
│   │   │   └── sign-up/
│   │   ├── (app)/
│   │   │   ├── layout.tsx           # Layout autenticado (sidebar + header)
│   │   │   ├── page.tsx             # Dashboard (home)
│   │   │   ├── onboarding/
│   │   │   │   ├── page.tsx         # Wizard de onboarding
│   │   │   │   └── [step]/
│   │   │   │       └── page.tsx
│   │   │   ├── diet/
│   │   │   │   ├── page.tsx         # Dieta ativa (revisão)
│   │   │   │   └── new/
│   │   │   │       └── page.tsx     # Criar/importar dieta
│   │   │   ├── meals/
│   │   │   │   ├── page.tsx         # Refeições do dia
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx     # Detalhe da refeição + registro
│   │   │   ├── progress/
│   │   │   │   └── page.tsx         # Progresso semanal + gráficos
│   │   │   ├── weight/
│   │   │   │   └── page.tsx         # Histórico de peso
│   │   │   ├── profile/
│   │   │   │   └── page.tsx         # Editar perfil
│   │   │   └── chat/
│   │   │       └── page.tsx         # Chat com IA
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts        # Streaming de respostas da IA
│   │   │   ├── meals/
│   │   │   │   ├── route.ts         # CRUD de MealLog
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── diet/
│   │   │   │   └── route.ts         # CRUD de DietPlan
│   │   │   ├── weight/
│   │   │   │   └── route.ts         # CRUD de WeightLog
│   │   │   ├── webhook/
│   │   │   │   ├── clerk/            # Webhook do Clerk (sync de usuário)
│   │   │   │   └── evolution/         # Webhook do Evolution API (mensagens WhatsApp)
│   │   │   └── nutrition/
│   │   │       └── calculate/
│   │   │           └── route.ts     # Cálculo de kcal/macros
│   │   ├── layout.tsx               # Root layout
│   │   └── page.tsx                 # Landing/redirect
│   ├── components/
│   │   ├── ui/                      # shadcn/ui components
│   │   ├── chat/
│   │   │   ├── chat-window.tsx
│   │   │   ├── chat-message.tsx
│   │   │   └── chat-input.tsx
│   │   ├── meals/
│   │   │   ├── meal-card.tsx
│   │   │   ├── meal-log-form.tsx
│   │   │   └── meal-status-badge.tsx
│   │   ├── diet/
│   │   │   ├── diet-review.tsx
│   │   │   ├── meal-plan-card.tsx
│   │   │   └── swap-button.tsx
│   │   ├── progress/
│   │   │   ├── calorie-bar.tsx
│   │   │   ├── weekly-chart.tsx
│   │   │   └── weight-chart.tsx
│   │   └── onboarding/
│   │       ├── step-basic-info.tsx
│   │       ├── step-measurements.tsx
│   │       ├── step-goal-activity.tsx
│   │       ├── step-restrictions.tsx
│   │       └── step-routine.tsx
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── client.ts            # OpenRouter client
│   │   │   ├── prompts.ts           # System prompts
│   │   │   ├── parsers.ts           # Parsing de refeições e dietas
│   │   │   └── streaming.ts         # SSE streaming helpers
│   │   ├── nutrition/
│   │   │   ├── bmr.ts               # Mifflin-St Jeor
│   │   │   ├── tdee.ts              # Cálculo de TDEE
│   │   │   ├── macros.ts            # Distribuição de macros
│   │   │   └── adherence.ts         # Métricas de adesão
│   │   ├── whatsapp/
│   │   │   ├── client.ts            # Evolution API client
│   │   │   ├── handlers.ts          # Processamento de mensagens recebidas
│   │   │   └── templates.ts         # Templates de mensagens enviadas
│   │   ├── db/
│   │   │   └── encryption.ts        # Criptografia de campos sensíveis
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── use-chat.ts
│   │   ├── use-meals.ts
│   │   └── use-progress.ts
│   └── types/
│       └── index.ts
├── docker-compose.yml               # Next.js + PostgreSQL + Evolution API
├── Dockerfile
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 11. API Routes

### 11.1 Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/webhook/clerk` | Webhook do Clerk (criação/atualização de usuário) |

Gerenciado pelo Clerk. O webhook sincroniza dados do usuário para o PostgreSQL.

### 11.2 Dieta

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/diet` | Busca dieta ativa do usuário |
| POST | `/api/diet/generate` | Gera dieta pela IA com base no perfil |
| POST | `/api/diet/import` | Faz parsing de texto livre e cria dieta |
| PATCH | `/api/diet/[id]` | Atualiza dieta (ajustes antes de ativar) |
| POST | `/api/diet/[id]/activate` | Ativa a dieta após revisão |
| POST | `/api/diet/[id]/swap` | Solicita troca de alimento (IA sugere alternativas) |

### 11.3 Refeições

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/meals?date=YYYY-MM-DD` | Busca refeições do dia |
| POST | `/api/meals/[id]/log` | Registra refeição (texto livre → parsing IA) |
| PATCH | `/api/meals/[id]/log` | Atualiza registro de refeição |
| POST | `/api/meals/[id]/skip` | Marca refeição como pulada |

### 11.4 Chat

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/chat/history` | Busca histórico da sessão atual |
| POST | `/api/chat` | Envia mensagem (streaming SSE) |

### 11.5 Progresso

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/progress/daily?date=YYYY-MM-DD` | Progresso calórico do dia |
| GET | `/api/progress/weekly?start=YYYY-MM-DD` | Progresso calórico da semana |
| GET | `/api/progress/adherence` | Métricas de adesão |

### 11.6 Peso

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/weight` | Histórico de peso |
| POST | `/api/weight` | Registra peso |

### 11.7 WhatsApp

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/webhook/evolution` | Recebe mensagens do Evolution API |

### 11.8 Nutrição

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/nutrition/calculate` | Calcula kcal/macros de um texto de refeição |

---

## 12. Deploy e Infraestrutura

### 12.1 VPS Único

```
Servidor: Hetzner ou DigitalOcean
SO: Ubuntu 22.04
Specs mínimos: 2 vCPU, 4GB RAM, 40GB SSD
Localização: São Paulo (para latência e LGPD)
```

### 12.2 Docker Compose

```yaml
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://...
      - OPENROUTER_API_KEY=...
      - CLERK_SECRET_KEY=...
      - CLERK_PUBLISHABLE_KEY=...
      - EVOLUTION_API_URL=http://evolution:8080
      - EVOLUTION_API_KEY=...
      - ENCRYPTION_KEY=...
    depends_on:
      - db

  db:
    image: postgres:16
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=appdiet
      - POSTGRES_USER=appdiet
      - POSTGRES_PASSWORD=...
    ports:
      - "5432:5432"

  evolution:
    image: evoapicloud/evolution-api:latest
    volumes:
      - evolutiondata:/app/data
    environment:
      - SERVER_TYPE=http
      - SERVER_PORT=8080
      - DATABASE_TYPE=postgresql
      - DATABASE_URI=postgresql://appdiet:...@db:5432/evolution
      - DATABASE_PREFIX=evolution
      - STORE_MESSAGES=true
      - STORE_CONTACTS=true
      - STORE_CHATS=true
    ports:
      - "8080:8080"
    depends_on:
      - db

  caddy:
    image: caddy:2
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config

volumes:
  pgdata:
  evolutiondata:
  caddy_data:
  caddy_config:
```

### 12.3 SSL e Domínio

- Caddy como reverse proxy com SSL automático (Let's Encrypt)
- Domínio: `appdiet.com.br` (ou similar)
- Evolution API exposta apenas internamente (não acessível externamente)

### 12.4 Backups

- PostgreSQL: backup diário automático com `pg_dump` + upload para S3-compatible storage
- Variáveis de ambiente: armazenadas em `.env` no servidor (não em código)

---

## 13. Segurança e LGPD

### 13.1 Medidas Implementadas

| Medida | Descrição |
|--------|-----------|
| Criptografia em repouso | Campos sensíveis criptografados com AES-256 no PostgreSQL |
| HTTPS | Caddy com SSL/TLS automático |
| Autenticação | Clerk (OAuth Google, sessões seguras) |
| Variáveis de ambiente | Nenhuma chave ou segredo em código |
| Validação de input | Zod schemas em todas as API routes |
| Rate limiting | Proteção contra abuso nas API routes |

### 13.2 Dados Criptografados

- Peso do paciente
- Condições de saúde
- Restrições alimentares
- Texto bruto das refeições registradas
- Registros de peso

### 13.3 Conformidade Mínima

- Termos de uso e política de privacidade
- Checkbox de aceite no cadastro
- Dados armazenados em servidor no Brasil
- Possibilidade de exclusão de conta e dados sob solicitação

---

## 14. Variáveis de Ambiente

```env
# Database
DATABASE_URL=postgresql://appdiet:password@localhost:5432/appdiet

# Clerk
CLERK_SECRET_KEY=sk_test_...
CLERK_PUBLISHABLE_KEY=pk_test_...

# OpenRouter
OPENROUTER_API_KEY=sk-or-...
OPENROUTER_PRIMARY_MODEL=deepseek/deepseek-v4-flash
OPENROUTER_FALLBACK_MODEL=openai/gpt-4o-mini

# Evolution API
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=...

# Encryption
ENCRYPTION_KEY=...  # AES-256 key

# App
NEXT_PUBLIC_APP_URL=https://appdiet.com.br
NODE_ENV=production
```

---

## 15. Roadmap Pós-MVP

| Fase | Feature | Prioridade |
|------|---------|-----------|
| V1.1 | Despensa persistente (ingredientes que o paciente costuma ter) | Alta |
| V1.2 | Plano semanal (variação por dia da semana) | Alta |
| V1.3 | Freemium: plano gratuito limitado + plano pago com IA avançada | Alta |
| V1.4 | Migração WhatsApp: Evolution API Baileys → Cloud API Meta (número business) | Alta |
| V1.5 | Compartilhamento com nutricionista (link de visualização) | Média |
| V1.6 | Suporte a fotos de refeições (opcional) | Média |
| V1.7 | Memória completa de conversas (contexto entre dias) | Média |
| V1.8 | i18n (inglês e espanhol) | Baixa |
| V1.9 | App nativo (React Native/Expo) | Baixa |
| V2.0 | Dashboard para nutricionistas (B2B2C) | Baixa |

---

## 16. Métricas de Sucesso do MVP

| Métrica | Meta | Como medir |
|---------|------|-----------|
| Taxa de registro de refeições | > 70% das refeições planejadas | MealLog.status vs Meal planejada |
| Taxa de conformidade | > 50% dentro de ±10% da meta | MealLog.conformant |
| Retenção semanal | > 40% dos usuários ativos na semana 2 | Usuários com MealLog em 7 dias consecutivos |
| Engajamento com trocas | > 20% dos usuários pedem troca pelo menos 1x | ChatMessage com intenção de troca |
| NPS | > 40 | Pesquisa no app após 7 dias |