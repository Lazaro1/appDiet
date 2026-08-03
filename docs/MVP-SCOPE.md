# AppDiet — Escopo MVP: Arquitetura Nutricional com TBCA

> Última atualização: Julho de 2026  
> Horizonte: **2–3 semanas**  
> Especificação de referência: [`AppDiet-Arquitetura-Nutricional.md`](./AppDiet-Arquitetura-Nutricional.md)

---

## 1. Objetivo

Migrar o pipeline nutricional do estado atual (LLM estima nome + gramas + macros) para:

```text
Backend define targets → catálogo fechado → LLM escolhe foodId + gramas
→ backend calcula nutrientes → validador → otimizador local → plano salvo
```

**Resultado esperado ao fim do MVP:**

- Planos gerados com calorias e macros vindos da TBCA, não do LLM
- `MealItem.foodId` preenchido na geração de plano
- Parse de refeição (`parseMeal`) resolvendo alimentos via busca lexical
- Validação determinística com retry direcionado (máx. 3 tentativas)
- Ajuste local de porções antes de nova chamada ao LLM

---

## 2. Fora do escopo (MVP)

| Item | Motivo |
|------|--------|
| pgvector / embeddings | pg_trgm + full-text cobrem o MVP; ver seção 11 do doc de arquitetura |
| Tool calling (`searchFoods`) | Pré-retrieval com catálogo fechado é suficiente |
| Renomear `TBACFood` → `Food` | Evolução incremental no modelo existente |
| Gate clínico completo (`EligibilityResult`) | Apenas checagem mínima se `conditions` preenchido |
| Auditoria persistente (`DietGenerationAudit`) | Logs em dev; tabela de audit na fase 2 |
| UI estruturada de alergias | Manter texto livre; parser heurístico para restrições comuns |
| Receitas compostas completas | Apenas 10–15 receitas brasileiras frequentes |
| Medidas caseiras na UI | Backend preparado; exibição continua em gramas |
| WhatsApp | Não bloqueia; `parseMeal` compartilha o mesmo pipeline |

---

## 3. Cronograma sugerido

### Semana 1 — Fundação (Fases 1–2 da arquitetura)

| Dia | Entrega |
|-----|---------|
| 1–2 | Schema TBCA estendido + script de importação |
| 3 | `compute-food-nutrition` + testes unitários |
| 4 | `distribute-meal-targets` + `food-repository` (SQL) |
| 5 | Busca lexical (`pg_trgm` + full-text) + seed de sinônimos básicos |

### Semana 2 — Geração de plano (Fases 3–5)

| Dia | Entrega |
|-----|---------|
| 1–2 | Novo contrato LLM (`foodId + quantityGrams`) + prompts |
| 3 | `hydrate-diet-draft` + `plan-validator` |
| 4 | `optimize-plan` (ajuste local) + orquestração em `create-plan.ts` |
| 5 | Integração end-to-end: `POST /api/diet` (generate) + testes manuais |

### Semana 3 — Parse, import e polish (fluxos restantes)

| Dia | Entrega |
|-----|---------|
| 1–2 | `parseMeal` com RAG lexical + `POST /api/meals/[id]` |
| 3 | `importDietPlan` com match TBCA (fallback nome livre) |
| 4 | `suggestSwap` com busca por equivalente calórico |
| 5 | Testes de regressão + ajustes de tolerância |

---

## 4. Pré-requisitos

- [ ] PostgreSQL com extensões `pg_trgm` e `unaccent` habilitadas
- [ ] Fonte CSV/JSON da TBCA disponível para import
- [ ] `OPENROUTER_API_KEY` configurada para testes de integração
- [ ] Decisão sobre tolerância unificada: **±10%** por refeição (alinhar com `isConformant` existente)

---

## 5. Mudanças no schema (incremental)

Estender `TBACFood` sem renomear o modelo:

```prisma
model TBACFood {
  // campos existentes...
  externalCode      String?   // código TBCA original
  normalizedName    String?
  synonyms          String[]  @default([])
  nutritionalRole   String?   // protein | carbohydrate | vegetable | fruit | fat | dairy
  preparationMethod String?
  portionMinGrams   Float?
  portionMaxGrams   Float?
  portionStepGrams  Float?    @default(5)
  containsGluten    Boolean?
  containsLactose   Boolean?
  containsAnimal    Boolean?
  active            Boolean   @default(true)

  @@index([normalizedName])
  @@index([category])
}
```

Modelo mínimo de receita (opcional na semana 3):

```prisma
model Recipe {
  id           String @id @default(cuid())
  name         String
  synonyms     String[] @default([])
  servingGrams Float
  kcalPer100g  Float
  proteinPer100g Float
  carbsPer100g Float
  fatPer100g   Float
  active       Boolean @default(true)
}
```

---

## 6. Novos arquivos

```text
scripts/
  tbca-import.ts              # importa TBCA + normaliza nomes + sinônimos básicos
  seed-recipes.ts             # 10–15 receitas compostas (semana 3)

src/lib/nutrition/
  calculations/
    compute-food-nutrition.ts
    distribute-meal-targets.ts
    sum-nutrition.ts
  catalog/
    food-repository.ts
    candidate-builder.ts
    restriction-parser.ts     # texto livre → filtros SQL heurísticos
  retrieval/
    lexical-search.ts         # pg_trgm + full-text
    search-foods.ts           # facade unificada
  validation/
    plan-validator.ts
    portion-validator.ts
  optimization/
    optimize-plan.ts
    portion-options.ts
  orchestration/
    generate-diet-plan.ts     # orquestração completa (seção 19 do doc)
    hydrate-diet-draft.ts
    match-food-from-text.ts   # parseMeal + import

src/lib/ai/
  schemas/
    diet-plan-draft.schema.ts
  prompts/
    diet-plan-system.ts       # extrair de prompts.ts
    diet-plan-user.ts
    diet-plan-repair.ts
```

---

## 7. Arquivos existentes — o que muda

### 7.1 Semana 1

| Arquivo | Ação |
|---------|------|
| `prisma/schema.prisma` | Estender `TBACFood`; migration |
| `package.json` | Script `"tbca:import": "tsx scripts/tbca-import.ts"` |
| `src/app/api/nutrition/calculate/route.ts` | Implementar `POST { foodId, grams }` → nutrientes |
| `src/lib/nutrition/macros.ts` | Reutilizar `calculateMacros`; não duplicar lógica |

### 7.2 Semana 2 — Geração de plano

| Arquivo | Ação |
|---------|------|
| `src/lib/ai/types.ts` | Adicionar `GeneratedDietDraft`, `PlannedFoodItem`; manter `ParsedFoodItem` para parse |
| `src/lib/ai/prompts.ts` | Remover instruções de estimativa de macros; delegar para `prompts/diet-plan-*.ts` |
| `src/lib/ai/json-response.ts` | Novo schema `generatedDietDraftSchema`; **remover** fallback que deriva `kcalTarget` da soma dos itens |
| `src/lib/ai/openrouter.ts` | `generateDietPlan` passa a receber catálogo fechado; retorna draft sem macros |
| `src/lib/ai/mock.ts` | Atualizar mock para `foodId + grams` com IDs fictícios |
| `src/lib/diet/create-plan.ts` | Chamar `generateDietPlan()` da orquestração em vez de `ai.generateDietPlan` direto |
| `src/lib/diet/map-ai-plan.ts` | Mapear plano hidratado; preencher `foodId` em `mealItems` |
| `src/lib/db/repositories/diet-plan-repository.ts` | Sem mudança estrutural; já aceita `foodId` |
| `src/app/api/diet/route.ts` | Sem mudança de contrato HTTP; erro `unfeasible` → 422 |

### 7.3 Semana 3 — Parse, import, swap

| Arquivo | Ação |
|---------|------|
| `src/lib/ai/openrouter.ts` | `parseMeal`: LLM extrai nomes + gramas → `matchFoodFromText` resolve IDs |
| `src/lib/ai/parsers.ts` | Implementar matching (era placeholder) |
| `src/lib/ai/openrouter.ts` | `importDietPlan`: match TBCA por item; fallback `foodId: null` + nome |
| `src/app/api/meals/[id]/route.ts` | Usar nutrientes calculados do backend, não estimados pelo LLM |
| `src/app/api/diet/[id]/swap/route.ts` | `searchFoods` por equivalente calórico no catálogo |
| `src/components/meals/swap-sheet.tsx` | Opcional: sugerir alimentos do catálogo em vez de texto livre |

### 7.4 Sem mudança (reutilizar)

| Arquivo | Motivo |
|---------|--------|
| `src/lib/nutrition/meal-status.ts` | `isConformant` permanece ±10% |
| `src/lib/nutrition/adherence.ts` | Métricas de adesão inalteradas |
| `src/lib/ai/factory.ts` | Provider e modelos já configurados |
| `src/lib/onboarding/types.ts` | `MEAL_PRESETS` alimenta `distribute-meal-targets` |
| `src/app/(onboarding)/onboarding/actions.ts` | Cálculo BMR/TDEE/meta diária permanece |

---

## 8. Contratos principais

### 8.1 LLM — geração de plano

```typescript
// Entrada: catálogo fechado por refeição (20–40 candidatos)
interface GeneratedDietDraft {
  status: "ok" | "unfeasible"
  meals?: Array<{
    mealId: string
    items: Array<{ foodId: string; quantityGrams: number }>
  }>
  reason?: string
}
```

### 8.2 LLM — parse de refeição (semana 3)

```typescript
// Fase 1 do parse: LLM extrai nomes (não IDs)
interface ParsedMealText {
  items: Array<{ foodName: string; estimatedGrams: number }>
}

// Fase 2: backend resolve via searchFoods()
interface ResolvedMealItem {
  foodId: string | null
  name: string
  quantityGrams: number
  nutrition: NutritionTotals
  matchScore: number
}
```

### 8.3 Backend — cálculo

```typescript
interface NutritionTotals {
  calories: number
  proteinGrams: number
  carbsGrams: number
  fatGrams: number
  fiberGrams: number
}
```

---

## 9. Fluxo de geração (referência)

```text
generateDietPlanForUser(user)
  │
  ├─ distributeMealCalories(dailyKcalTarget, mealPresets)
  ├─ parseRestrictions(user.restrictions)        // heurístico no MVP
  ├─ buildCandidateCatalog(mealTargets, restrictions)
  │
  ├─ loop (max 3):
  │    ├─ ai.generateDietDraft(catalog, targets)  // foodId + grams
  │    ├─ hydrateDietDraft(draft, foodsById)
  │    ├─ validateDietPlan(plan, targets, restrictions)
  │    ├─ se repairable → optimizePlan(plan, issues)
  │    ├─ validateDietPlan(optimized)
  │    └─ se inválido → repair prompt com issues
  │
  ├─ mapHydratedPlanToCreateInput(plan)
  └─ dietPlanRepository.create(input)
```

---

## 10. Critérios de aceite

### Semana 1

- [ ] `yarn tbca:import` popula ≥ 1000 alimentos TBCA
- [ ] `computeFoodNutrition(foodId, 150)` retorna valores consistentes com TBCA
- [ ] `searchFoods("frango grelhado")` retorna top-5 com score > 0.6
- [ ] `POST /api/nutrition/calculate` funcional

### Semana 2

- [ ] Plano gerado: 100% dos `foodId` existem no banco
- [ ] Nenhum macro vem do LLM — todos calculados no backend
- [ ] Desvio calórico diário ≤ 5% após otimização
- [ ] Desvio por refeição ≤ 10% após otimização
- [ ] Restrição "sem lactose" (heurística) não inclui alimentos com `containsLactose: true`
- [ ] Plano inviável retorna erro claro ao usuário

### Semana 3

- [ ] `parseMeal("2 ovos e pão integral")` resolve ≥ 80% dos itens com score > 0.75
- [ ] Import de dieta colada preserva alimentos e associa `foodId` quando possível
- [ ] Swap sugere alternativas com ±15% das kcal do item original
- [ ] `MealLog.parsedKcal` calculado via TBCA, não estimado pelo LLM
- [ ] Fluxo de revisão/ativação de plano (`/diet/[id]`) funciona sem regressão

---

## 11. Testes

### Unitários (prioridade)

```text
src/lib/nutrition/calculations/compute-food-nutrition.test.ts
src/lib/nutrition/calculations/distribute-meal-targets.test.ts
src/lib/nutrition/validation/plan-validator.test.ts
src/lib/nutrition/optimization/optimize-plan.test.ts
src/lib/nutrition/retrieval/lexical-search.test.ts  # com DB de teste ou mock
```

### Dataset manual (10 perfis)

Conforme seção 23 do doc de arquitetura:

1. Sem restrições  
2. Vegetariano  
3. Sem lactose  
4. Sem glúten  
5. Alta proteína (lose)  
6. 3 refeições/dia  
7. 6 refeições/dia  
8. Preferência por frango  
9. Meta 1500 kcal  
10. Meta 2800 kcal  

Para cada perfil: gerar plano, verificar IDs válidos, desvio calórico e ausência de violações de restrição.

---

## 12. Riscos e mitigações

| Risco | Mitigação |
|-------|-----------|
| TBCA sem dados de alergênicos | Curadoria manual dos 200 alimentos mais usados no MVP |
| LLM inventa `foodId` fora do catálogo | Validação Zod + `allowedFoodIds` + retry com lista de IDs inválidos |
| Import com pratos compostos | Tabela `Recipe` com 10–15 itens + fallback nome livre |
| Latência aumenta com orquestração | Otimizador local reduz retries; catálogo ≤ 40 itens/refeição |
| Restrições em texto livre | `restriction-parser.ts` mapeia termos comuns (vegano, sem glúten, etc.) |

---

## 13. Pós-MVP (backlog imediato)

1. pgvector + embeddings (Fase 7 do doc de arquitetura)
2. UI estruturada de alergias no onboarding (step 4)
3. Gate de elegibilidade clínico
4. `DietGenerationAudit` persistido
5. Tool calling para catálogo dinâmico
6. Medidas caseiras na UI ("1 colher de arroz")

---

## 14. Referências

- [`AppDiet-Arquitetura-Nutricional.md`](./AppDiet-Arquitetura-Nutricional.md) — especificação completa
- [`TBCA-RAG-ARCHITECTURE.md`](./TBCA-RAG-ARCHITECTURE.md) — proposta inicial (supersedida pelo doc principal para retrieval)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — arquitetura geral do app
- [`TASKS.md`](./TASKS.md) — task 3.2 (TBCA import) passa a ser parte deste MVP

---

## 15. Status de execução

### Semana 1 — Concluída (03/08/2026)

- Schema `TBACFood` estendido + migration com `pg_trgm`/`unaccent`
- Import: `npm run tbca:import` (usa seed de 94 alimentos ou `TBCA_FILE_PATH` para dataset completo)
- Cálculo: `computeFoodNutrition`, `distributeMealCalories`, `food-repository`
- Busca: `searchFoods` (lexical), `candidate-builder`, `restriction-parser`
- API: `POST /api/nutrition/calculate`
- Testes: 8 unitários + smoke search 10/10

### Semana 2 — Código concluído (03/08/2026)

Contrato LLM (`foodId + quantityGrams`):

- `src/lib/ai/types.ts`: `GeneratedDietDraft`, `PlannedFoodItem`, `DietGenerationContext`, `DietCatalogFood`
- `AIProvider.generateDietPlan` substituído por `AIProvider.generateDietDraft`
- `src/lib/ai/schemas/diet-plan-draft.schema.ts`: discriminated union `ok`/`unfeasible` + rejeição de `foodId` fora do catálogo
- Prompts em `src/lib/ai/prompts/`: `diet-plan-system.ts`, `diet-plan-user.ts`, `diet-plan-repair.ts` (sem cálculo de macros pelo LLM)
- `aiSchemas.dietPlan` renomeado para `aiSchemas.dietImportPlan`: o fallback de `kcalTarget` a partir dos itens agora é exclusivo da importação

Backend calcula, valida e corrige:

- `orchestration/hydrate-diet-draft.ts`: nutrientes vindos da TBCA, metas vindas do backend
- `validation/plan-validator.ts`: kcal diária ±5%, refeição ±10%, IDs, porções e restrições, com flag `repairableLocally`
- `validation/portion-validator.ts`: min/max/passo por alimento
- `optimization/portion-options.ts` + `optimization/optimize-plan.ts`: coordinate descent nas gramas, sem chamar o LLM
- `orchestration/generate-diet-plan.ts`: até 3 tentativas (draft → hidrata → valida → otimiza → prompt de reparo)
- `orchestration/errors.ts`: `DietPlanUnfeasibleError`, `DietPlanGenerationError`, `EmptyFoodCatalogError`

Integração:

- `create-plan.ts` usa a orquestração; `map-ai-plan.ts` persiste `MealItem.foodId`
- `POST /api/diet` responde 422 em plano inviável, catálogo vazio ou falha de validação
- Testes: 22 unitários (`npm test`), typecheck e build limpos

### Pendente da Semana 2 — validação E2E com banco

Docker/Postgres estava parado durante a execução. Rodar com o banco de pé:

```bash
docker compose up -d db
npm run tbca:import   # TBCA_FILE_PATH=data/tbca/tbca-import.csv
npm run smoke:plan    # 3 perfis: sem restrição, sem lactose, vegetariano
```

Depois validar no app: `/diet/new` → gerar plano → revisar em `/diet/[id]`.

Ver plano detalhado: `.cursor/plans/mvp_tasks_semanais_8d89446e.plan.md`
